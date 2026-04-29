import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { checkRateLimit, logUsage } from '@/lib/ai-harness/rate-limit';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { buildToolboxSystemPrompt } from '@/lib/toolbox/markdown';
import type { ToolboxMessage, ToolboxSkill } from '@/lib/toolbox/types';
import { LLMError } from '@/lib/ai-harness/types';

const MODEL = process.env.TOOLBOX_ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 12000;

interface RunBody {
  readonly skill?: unknown;
  readonly messages?: unknown;
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

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });

  let body: RunBody;
  try {
    body = (await request.json()) as RunBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isSkill(body.skill) || !isMessageList(body.messages)) {
    return NextResponse.json({ error: 'Missing or invalid skill/messages.' }, { status: 400 });
  }

  const latestUser = [...body.messages].reverse().find((message) => message.role === 'user');
  if (!latestUser) return NextResponse.json({ error: 'Messages must include a user turn.' }, { status: 400 });
  if (latestUser.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
  }

  const pii = scanForPII(latestUser.content);
  if (!pii.safe) return NextResponse.json({ error: pii.reason }, { status: 422 });

  const injection = scanForInjection(latestUser.content);
  if (!injection.safe) return NextResponse.json({ error: injection.reason }, { status: 422 });

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
      provider: 'anthropic',
      model: MODEL,
      status: 'rate-limited',
    });
    return NextResponse.json(
      { error: 'Daily Toolbox AI limit reached. Please try again tomorrow.' },
      { status: 429 },
    );
  }

  try {
    const client = createLLMClient('anthropic');
    const result = await client.chat({
      model: MODEL,
      maxTokens: MAX_TOKENS,
      temperature: 0.2,
      system: buildToolboxSystemPrompt(body.skill),
      messages: body.messages,
    });

    await logUsage({
      userId: access.userId,
      courseSlug: 'toolbox',
      featureId: 'toolbox-playground',
      provider: 'anthropic',
      model: MODEL,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      status: 'succeeded',
    });

    return NextResponse.json({ text: result.text, usage: result.usage });
  } catch (error) {
    await logUsage({
      userId: access.userId,
      courseSlug: 'toolbox',
      featureId: 'toolbox-playground',
      provider: 'anthropic',
      model: MODEL,
      status: 'errored',
      errorKind: error instanceof LLMError ? error.kind : 'unknown',
    });

    return NextResponse.json(
      { error: 'Claude is temporarily unavailable. Please try again.' },
      { status: error instanceof LLMError && error.kind === 'rate-limit' ? 429 : 500 },
    );
  }
}

