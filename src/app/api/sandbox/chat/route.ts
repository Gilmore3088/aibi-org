// POST /api/sandbox/chat
// Proxies chat messages to AI providers with PII scanning, injection
// filtering, and message-limit enforcement.

import { NextResponse } from 'next/server';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { createLLMClient } from '@/lib/ai-harness/client';
import type { ProviderName } from '@/lib/ai-harness/types';
import { isAllowedModel } from '@/lib/toolbox/playground-models';
import { getAuthUser } from '@/lib/api/auth';
import { rateLimitOrFail } from '@/lib/api/rate-limit';
import { canBuildOrRun, getPaidToolboxAccess } from '@/lib/toolbox/access';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 20;
const VALID_PROVIDERS = ['anthropic', 'openai', 'gemini'] as const;
// 'aibi-p' kept for legacy clients that have not refreshed; new clients send
// 'foundation'. Both are accepted by the sandbox API.
const VALID_PRODUCTS = ['aibi-p', 'foundation', 'aibi-s', 'aibi-l'] as const;

type Product = (typeof VALID_PRODUCTS)[number];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  provider?: unknown;
  model?: unknown;
  messages?: unknown;
  moduleId?: unknown;
  product?: unknown;
  systemPrompt?: unknown;
}

// ---------------------------------------------------------------------------
// Rate limit — 50 messages/hour per authenticated user. Backed by Supabase
// rate_limits table, atomic across serverless instances.
// ---------------------------------------------------------------------------

const RATE_LIMIT_PER_USER_PER_HOUR = 50;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidProvider(v: unknown): v is ProviderName {
  return typeof v === 'string' && VALID_PROVIDERS.includes(v as ProviderName);
}

function isValidProduct(v: unknown): v is Product {
  return typeof v === 'string' && VALID_PRODUCTS.includes(v as Product);
}

function isValidMessages(v: unknown): v is ChatMessage[] {
  if (!Array.isArray(v) || v.length === 0) return false;
  return v.every((m: unknown) => {
    if (typeof m !== 'object' || m === null) return false;
    if (!('role' in m) || !('content' in m)) return false;
    const msg = m as ChatMessage;
    if (msg.role !== 'user' && msg.role !== 'assistant') return false;
    if (typeof msg.content !== 'string') return false;
    return true;
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // 0. Require an authenticated session. The sandbox is an AI proxy
  // that bills third-party model APIs on every call — anonymous access
  // turns this endpoint into an unbounded cost surface. Practice
  // tabs only render inside enrolled course modules, so requiring a
  // session here doesn't block any legitimate UX.
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const access = await getPaidToolboxAccess();
  if (!access || !canBuildOrRun(access)) {
    return NextResponse.json({ error: 'Paid sandbox access required.' }, { status: 403 });
  }

  const limited = await rateLimitOrFail({
    key: 'sandbox-chat',
    scope: 'user',
    identifier: access.userId,
    max: RATE_LIMIT_PER_USER_PER_HOUR,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  // 1. Parse body
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { provider, model, messages, moduleId, product, systemPrompt } = body;

  // 2a. Required fields
  if (!provider || !model || !messages || !moduleId || !product || !systemPrompt) {
    return NextResponse.json(
      { error: 'Missing required fields: provider, model, messages, moduleId, product, systemPrompt.' },
      { status: 400 },
    );
  }

  // 2b. Provider/model check. The menu is shared with the Toolbox so the
  // course lab cannot call arbitrary models even if a request is forged.
  if (!isValidProvider(provider)) {
    return NextResponse.json(
      { error: 'Invalid provider.' },
      { status: 400 },
    );
  }

  if (typeof model !== 'string' || !isAllowedModel(provider, model)) {
    return NextResponse.json(
      { error: 'Invalid model for provider.' },
      { status: 400 },
    );
  }

  // Validate product
  if (!isValidProduct(product)) {
    return NextResponse.json(
      { error: 'Invalid product.' },
      { status: 400 },
    );
  }

  // Validate messages array shape
  if (!isValidMessages(messages)) {
    return NextResponse.json(
      { error: 'Invalid messages array.' },
      { status: 400 },
    );
  }

  if (typeof moduleId !== 'string' || moduleId.length === 0) {
    return NextResponse.json(
      { error: 'moduleId must be a non-empty string.' },
      { status: 400 },
    );
  }

  if (typeof systemPrompt !== 'string' || systemPrompt.length === 0) {
    return NextResponse.json(
      { error: 'systemPrompt must be a non-empty string.' },
      { status: 400 },
    );
  }

  // 2c. Extract latest user message for security scans
  const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  if (!latestUserMessage) {
    return NextResponse.json(
      { error: 'Messages must contain at least one user message.' },
      { status: 400 },
    );
  }

  // 3. PII scan on latest user message
  const piiResult = scanForPII(latestUserMessage.content);
  if (!piiResult.safe) {
    return NextResponse.json({ error: piiResult.reason }, { status: 422 });
  }

  // 4. Injection filter on latest user message
  const injectionResult = scanForInjection(latestUserMessage.content);
  if (!injectionResult.safe) {
    return NextResponse.json({ error: injectionResult.reason }, { status: 422 });
  }

  // 5. Per-message character limit
  if (latestUserMessage.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` },
      { status: 400 },
    );
  }

  // 6. Conversation message count limit
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: 'Message limit reached for this exercise.' },
      { status: 429 },
    );
  }

  // 9. Call provider
  try {
    const client = createLLMClient(provider);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of client.stream({
          model,
          system: systemPrompt as string,
          messages,
          maxTokens: 900,
          temperature: 0.2,
        })) {
          if (chunk.type === 'text' && chunk.text) {
            controller.enqueue(encoder.encode(chunk.text));
          }
          if (chunk.type === 'error') {
            controller.error(chunk.error ?? new Error('AI provider error'));
            return;
          }
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    const context =
      err instanceof Error ? err.message : 'Unknown error';
    console.error('[sandbox/chat] Provider error:', context);
    return NextResponse.json(
      { error: 'AI provider temporarily unavailable. Please try again.' },
      { status: 500 },
    );
  }
}
