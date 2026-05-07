// POST /api/sandbox/chat
// Proxies chat messages to AI providers with PII scanning, injection
// filtering, and message-limit enforcement.

import { NextResponse } from 'next/server';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { streamClaude } from '@/lib/sandbox/providers/claude';
import { streamOpenAI } from '@/lib/sandbox/providers/openai';
import { streamGemini } from '@/lib/sandbox/providers/gemini';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 20;
const VALID_PROVIDERS = ['claude', 'openai', 'gemini'] as const;
const VALID_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l'] as const;

type Provider = (typeof VALID_PROVIDERS)[number];
type Product = (typeof VALID_PRODUCTS)[number];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  provider?: unknown;
  messages?: unknown;
  moduleId?: unknown;
  product?: unknown;
  systemPrompt?: unknown;
}

// ---------------------------------------------------------------------------
// In-memory rate limit counter (per moduleId).
// TODO: Replace with Supabase or Redis for production — in-memory state is
// lost on serverless cold starts and does not share across instances.
// ---------------------------------------------------------------------------

const messageCounts = new Map<string, number>();

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidProvider(v: unknown): v is Provider {
  return typeof v === 'string' && VALID_PROVIDERS.includes(v as Provider);
}

function isValidProduct(v: unknown): v is Product {
  return typeof v === 'string' && VALID_PRODUCTS.includes(v as Product);
}

function dispatchProvider(
  provider: Provider,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  switch (provider) {
    case 'claude':
      return streamClaude(systemPrompt, messages);
    case 'openai':
      return streamOpenAI(systemPrompt, messages);
    case 'gemini':
      return streamGemini(systemPrompt, messages);
  }
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
  // 1. Parse body
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { provider, messages, moduleId, product, systemPrompt } = body;

  // 2a. Required fields
  if (!provider || !messages || !moduleId || !product || !systemPrompt) {
    return NextResponse.json(
      { error: 'Missing required fields: provider, messages, moduleId, product, systemPrompt.' },
      { status: 400 },
    );
  }

  // 2b. Provider check
  if (!isValidProvider(provider)) {
    return NextResponse.json(
      { error: 'Invalid provider. Supported: claude, openai, gemini.' },
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

  // 7. Dev bypass for auth — in production, validate Supabase session
  if (process.env.NODE_ENV !== 'development') {
    // TODO: Validate Supabase auth session and enrollment for the given
    // product. For now, allow all requests in production as well until
    // auth is wired up.
  }

  // 8. Track in-memory message count per moduleId
  const currentCount = messageCounts.get(moduleId as string) ?? 0;
  messageCounts.set(moduleId as string, currentCount + 1);

  // 9. Call provider
  try {
    const stream = await dispatchProvider(
      provider,
      systemPrompt as string,
      messages,
    );
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
