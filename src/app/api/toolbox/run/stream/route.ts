import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { checkPerMinuteLimits, checkRateLimit, hashIp, logUsage } from '@/lib/ai-harness/rate-limit';
import { LLMError, type ProviderName } from '@/lib/ai-harness/types';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
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
}

function isMessageList(value: unknown): value is ToolboxMessage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_MESSAGES && value.every((item) =>
    typeof item === 'object' && item !== null &&
    ((item as ToolboxMessage).role === 'user' || (item as ToolboxMessage).role === 'assistant') &&
    typeof (item as ToolboxMessage).content === 'string',
  );
}
function isSkill(v: unknown): v is ToolboxSkill {
  return typeof v === 'object' && v !== null && typeof (v as ToolboxSkill).cmd === 'string' && typeof (v as ToolboxSkill).name === 'string';
}
function isProviderName(v: unknown): v is ProviderName {
  return typeof v === 'string' && (ALLOWED_PROVIDERS as readonly string[]).includes(v);
}

export async function POST(request: Request): Promise<Response> {
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
  if (!isProviderName(body.provider) || typeof body.model !== 'string' || !isAllowedModel(body.provider, body.model)) {
    return NextResponse.json({ error: 'Invalid provider or model.' }, { status: 400 });
  }

  const provider = body.provider;
  const model = body.model;
  const latestUser = [...body.messages].reverse().find((m) => m.role === 'user');
  if (!latestUser) return NextResponse.json({ error: 'Messages must include a user turn.' }, { status: 400 });
  if (latestUser.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message exceeds ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
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
      userId: access.userId, courseSlug: 'toolbox', featureId: 'toolbox-playground',
      provider, model, status: 'rate-limited', ipHash,
    });
    return NextResponse.json({ error: 'Daily Toolbox AI limit reached.' }, { status: 429 });
  }

  const skill = body.skill;
  const messages = body.messages;
  const userId = access.userId;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      let inputTokens = 0;
      let outputTokens = 0;
      let errored = false;
      try {
        const client = createLLMClient(provider);
        for await (const chunk of client.stream({
          model,
          maxTokens: MAX_TOKENS,
          temperature: 0.2,
          system: buildToolboxSystemPrompt(skill),
          messages,
        })) {
          if (chunk.type === 'text') write({ type: 'text', text: chunk.text });
          else if (chunk.type === 'stop') {
            inputTokens = chunk.usage?.inputTokens ?? 0;
            outputTokens = chunk.usage?.outputTokens ?? 0;
            write({ type: 'done', usage: { inputTokens, outputTokens } });
          } else if (chunk.type === 'error') {
            errored = true;
            write({ type: 'error', message: 'stream error' });
          }
        }
      } catch (err) {
        errored = true;
        write({ type: 'error', message: err instanceof LLMError ? err.kind : 'unknown' });
      } finally {
        await logUsage({
          userId, courseSlug: 'toolbox', featureId: 'toolbox-playground',
          provider, model,
          inputTokens, outputTokens,
          status: errored ? 'errored' : 'succeeded',
          ipHash,
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8' },
  });
}
