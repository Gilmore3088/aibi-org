import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { checkPerMinuteLimits, checkRateLimit, hashIp, logUsage } from '@/lib/ai-harness/rate-limit';
import { LLMError, type ProviderName } from '@/lib/ai-harness/types';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { canBuildOrRun, getPaidToolboxAccess } from '@/lib/toolbox/access';
import { buildToolboxSystemPrompt } from '@/lib/toolbox/markdown';
import { isAllowedModel } from '@/lib/toolbox/playground-models';
import type { ToolboxMessage, ToolboxSkill } from '@/lib/toolbox/types';

const MAX_TOKENS = 8192;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 12000;

const ALLOWED_PROVIDERS: readonly ProviderName[] = ['anthropic', 'openai', 'gemini'];

interface RunBody {
  readonly skill?: unknown;
  readonly messages?: unknown;
  readonly provider?: unknown;
  readonly model?: unknown;
  // PII-override path (#8 layer 3). See stream/route.ts for the design note.
  readonly confirmedFabricated?: unknown;
}

function isMessageList(value: unknown): value is ToolboxMessage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_MESSAGES && value.every((item) => (
    typeof item === 'object' &&
    item !== null &&
    ((item as ToolboxMessage).role === 'user' || (item as ToolboxMessage).role === 'assistant') &&
    typeof (item as ToolboxMessage).content === 'string'
  ));
}

function isSkill(value: unknown): value is ToolboxSkill {
  return typeof value === 'object' &&
    value !== null &&
    typeof (value as ToolboxSkill).cmd === 'string' &&
    typeof (value as ToolboxSkill).name === 'string';
}

function isProviderName(value: unknown): value is ProviderName {
  return typeof value === 'string' && (ALLOWED_PROVIDERS as readonly string[]).includes(value);
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  // Paid-run guard: all paid Toolbox users can run skills.
  if (!canBuildOrRun(access)) {
    return NextResponse.json(
      { error: 'Running a skill requires paid Toolbox access.' },
      { status: 403 },
    );
  }

  let body: RunBody;
  try {
    body = (await request.json()) as RunBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isSkill(body.skill) || !isMessageList(body.messages)) {
    return NextResponse.json({ error: 'Missing or invalid skill/messages.' }, { status: 400 });
  }
  if (!isProviderName(body.provider) || typeof body.model !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid provider/model.' }, { status: 400 });
  }
  if (!isAllowedModel(body.provider, body.model)) {
    return NextResponse.json({ error: 'Model not on the Playground v1 menu.' }, { status: 400 });
  }

  const provider: ProviderName = body.provider;
  const model: string = body.model;

  // Every user-authored turn is forwarded to the provider, so scan them all —
  // not just the latest — or a client could hide PII/injection in an earlier
  // turn behind a benign final message.
  const userMessages = body.messages.filter((message) => message.role === 'user');
  if (userMessages.length === 0) {
    return NextResponse.json({ error: 'Messages must include a user turn.' }, { status: 400 });
  }
  for (const message of userMessages) {
    if (message.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
    }
  }

  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  const ipHash = hashIp(ip);

  const perMinute = await checkPerMinuteLimits({
    userId: access.userId,
    ipHash,
    limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
  });
  if (!perMinute.allowed) {
    return NextResponse.json(
      {
        error: perMinute.reason === 'per-user-per-minute-exceeded'
          ? 'You are sending requests too quickly. Slow down.'
          : 'Too many requests from your network. Slow down.',
      },
      { status: 429, headers: { 'retry-after': String(perMinute.retryAfterSeconds ?? 60) } },
    );
  }

  const confirmedFabricated = body.confirmedFabricated === true;
  // First PII hit across any user turn drives the warning/override + audit.
  const pii = userMessages.map((m) => scanForPII(m.content)).find((r) => !r.safe)
    ?? ({ safe: true } as ReturnType<typeof scanForPII>);
  if (!pii.safe && !confirmedFabricated) {
    return NextResponse.json(
      { error: pii.reason, kind: 'pii_warning', canOverride: true },
      { status: 422 },
    );
  }
  const piiAudit = {
    piiFlagged: !pii.safe,
    piiOverride: !pii.safe && confirmedFabricated,
    piiKind: pii.safe ? undefined : pii.kind,
  };

  // Injection filter is not user-overridable — it protects the model.
  const injection = userMessages.map((m) => scanForInjection(m.content)).find((r) => !r.safe)
    ?? ({ safe: true } as ReturnType<typeof scanForInjection>);
  if (!injection.safe) {
    return NextResponse.json(
      { error: injection.reason, kind: 'injection_blocked', canOverride: false },
      { status: 422 },
    );
  }

  const limit = await checkRateLimit({
    userId: access.userId,
    courseSlug: 'toolbox',
    featureId: 'toolbox-playground',
    limits: { perLearnerDaily: 40, perCourseDailyCents: 10000 },
  });

  if (!limit.allowed) {
    await logUsage({
      userId: access.userId,
      courseSlug: 'toolbox',
      featureId: 'toolbox-playground',
      provider,
      model,
      status: 'rate-limited',
      ipHash,
      ...piiAudit,
    });
    return NextResponse.json(
      { error: 'Daily Toolbox AI limit reached. Please try again tomorrow.' },
      { status: 429 },
    );
  }

  try {
    const client = createLLMClient(provider);
    const result = await client.chat({
      model,
      maxTokens: MAX_TOKENS,
      temperature: 0.2,
      system: buildToolboxSystemPrompt(body.skill),
      messages: body.messages,
    });

    await logUsage({
      userId: access.userId,
      courseSlug: 'toolbox',
      featureId: 'toolbox-playground',
      provider,
      model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      status: 'succeeded',
      ipHash,
      ...piiAudit,
    });

    return NextResponse.json({ text: result.text, usage: result.usage });
  } catch (error) {
    await logUsage({
      userId: access.userId,
      courseSlug: 'toolbox',
      featureId: 'toolbox-playground',
      provider,
      model,
      status: 'errored',
      errorKind: error instanceof LLMError ? error.kind : 'unknown',
      ipHash,
      ...piiAudit,
    });

    return NextResponse.json(
      { error: 'The selected model is temporarily unavailable. Please try again or pick another model.' },
      { status: error instanceof LLMError && error.kind === 'rate-limit' ? 429 : 500 },
    );
  }
}
