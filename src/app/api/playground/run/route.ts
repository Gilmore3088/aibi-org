import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { estimateCostCents } from '@/lib/ai-harness/pricing';
import { hashIp, logUsage } from '@/lib/ai-harness/rate-limit';
import { LLMError } from '@/lib/ai-harness/types';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { getRequestIp } from '@/lib/api/rate-limit';
import {
  PUBLIC_PLAYGROUND_COURSE_SLUG,
  PUBLIC_PLAYGROUND_FEATURE_ID,
  PUBLIC_PLAYGROUND_MODEL,
  PUBLIC_PLAYGROUND_PROVIDER,
  checkPublicPlaygroundBudget,
  resolvePublicPlaygroundLimits,
} from '@/lib/playground/public-budget';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PROMPT_LENGTH = 2000;
const MAX_SAMPLE_LENGTH = 4000;
const MAX_TOKENS = 700;

interface PublicPlaygroundBody {
  readonly scenarioTitle?: unknown;
  readonly sampleData?: unknown;
  readonly prompt?: unknown;
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maxLength) return null;
  return cleaned;
}

function limitMessage(reason: string | undefined): string {
  if (reason === 'per-ip-per-minute-exceeded') {
    return 'This demo is limited to one run per minute. Please try again shortly.';
  }
  if (reason === 'per-ip-per-day-exceeded') {
    return 'This demo has reached today’s limit for your network. Please try again tomorrow.';
  }
  if (reason === 'daily-budget-exceeded') {
    return 'The public demo has reached today’s model budget. Please try again tomorrow.';
  }
  return 'The public demo is temporarily unavailable. Please try again later.';
}

function buildSystemPrompt(): string {
  return [
    'You are the public AI Banking Institute demo assistant.',
    'Use only the synthetic sample data and scenario instructions provided by the user.',
    'Produce a concise, realistic banking work product that shows safe AI practice.',
    'Label the output as a draft, include human-review notes, and flag facts that require verification.',
    'Do not claim to access real accounts, customer files, policies, systems, or live regulatory advice.',
    'Do not ask for or process customer PII, account numbers, SSNs, credentials, or confidential records.',
  ].join(' ');
}

function buildUserMessage(params: {
  readonly scenarioTitle: string;
  readonly sampleData: string;
  readonly prompt: string;
}): string {
  return [
    `Scenario: ${params.scenarioTitle}`,
    '',
    'Synthetic sample data:',
    params.sampleData,
    '',
    'Task:',
    params.prompt,
    '',
    'Return a structured draft with: output, review notes, and escalation/verification checklist.',
  ].join('\n');
}

async function logPublicUsage(params: {
  readonly status: 'succeeded' | 'rate-limited' | 'errored';
  readonly ipHash: string;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
  readonly costCents?: number;
  readonly errorKind?: Parameters<typeof logUsage>[0]['errorKind'];
}): Promise<void> {
  await logUsage({
    userId: null,
    courseSlug: PUBLIC_PLAYGROUND_COURSE_SLUG,
    featureId: PUBLIC_PLAYGROUND_FEATURE_ID,
    provider: PUBLIC_PLAYGROUND_PROVIDER,
    model: PUBLIC_PLAYGROUND_MODEL,
    status: params.status,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    costCents: params.costCents,
    errorKind: params.errorKind,
    ipHash: params.ipHash,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: PublicPlaygroundBody;
  try {
    body = (await request.json()) as PublicPlaygroundBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const scenarioTitle = cleanText(body.scenarioTitle, 120);
  const sampleData = cleanText(body.sampleData, MAX_SAMPLE_LENGTH);
  const prompt = cleanText(body.prompt, MAX_PROMPT_LENGTH);

  if (!scenarioTitle || !sampleData || !prompt) {
    return NextResponse.json({ error: 'Scenario, sample data, and prompt are required.' }, { status: 400 });
  }

  const userMessage = buildUserMessage({ scenarioTitle, sampleData, prompt });

  const pii = scanForPII(userMessage);
  if (!pii.safe) {
    return NextResponse.json(
      { error: pii.reason ?? 'Please use only synthetic sample data.', kind: 'pii_blocked' },
      { status: 422 },
    );
  }

  const injection = scanForInjection(userMessage);
  if (!injection.safe) {
    return NextResponse.json(
      { error: injection.reason ?? 'That message was blocked. Please focus on the exercise.', kind: 'injection_blocked' },
      { status: 422 },
    );
  }

  const ipHash = hashIp(getRequestIp(request));
  const limits = resolvePublicPlaygroundLimits();
  const budget = await checkPublicPlaygroundBudget(ipHash, limits);
  if (!budget.allowed) {
    await logPublicUsage({ status: 'rate-limited', ipHash });
    return NextResponse.json(
      {
        error: limitMessage(budget.reason),
        kind: budget.reason ?? 'rate-limited',
        limits,
      },
      {
        status: budget.reason === 'budget-check-unavailable' ? 503 : 429,
        headers: { 'retry-after': String(budget.retryAfterSeconds ?? 60) },
      },
    );
  }

  try {
    const client = createLLMClient(PUBLIC_PLAYGROUND_PROVIDER);
    const result = await client.chat({
      model: PUBLIC_PLAYGROUND_MODEL,
      maxTokens: MAX_TOKENS,
      temperature: 0.2,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: userMessage }],
    });

    const costCents = estimateCostCents({
      provider: PUBLIC_PLAYGROUND_PROVIDER,
      model: PUBLIC_PLAYGROUND_MODEL,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });

    await logPublicUsage({
      status: 'succeeded',
      ipHash,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      costCents,
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
      model: PUBLIC_PLAYGROUND_MODEL,
      costCents,
      limits,
    });
  } catch (error) {
    await logPublicUsage({
      status: 'errored',
      ipHash,
      errorKind: error instanceof LLMError ? error.kind : 'unknown',
    });

    return NextResponse.json(
      { error: 'The public demo model is temporarily unavailable. Please try again later.' },
      { status: error instanceof LLMError && error.kind === 'rate-limit' ? 429 : 500 },
    );
  }
}
