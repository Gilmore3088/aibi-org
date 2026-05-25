// POST /api/sandbox/chat
// Proxies chat messages to AI providers with PII scanning, injection
// filtering, and message-limit enforcement.

import { NextResponse } from 'next/server';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';
import { streamClaude } from '@/lib/sandbox/providers/claude';
import { getAuthUser } from '@/lib/api/auth';
import { rateLimitOrFail } from '@/lib/api/rate-limit';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES = 20;
const MAX_SYSTEM_PROMPT_LENGTH = 8000;
const VALID_PROVIDERS = ['claude'] as const;
// Legacy AiBI-P practice sandbox + advanced credentials only. The ADDIE
// Foundation Course (M0–M5) routes through /api/sandbox/run and /api/sandbox/ab,
// which assemble the system_prompt server-side from addie.exercises. The
// 'foundation' product is INTENTIONALLY EXCLUDED here so the course cannot
// reach this endpoint with a client-supplied systemPrompt — see the F1
// reconciliation in docs/reviews/foundation-critique-it-director-marcus-tan-2026-05-24.md
// (2026-05-24). If a foundation lesson needs free-form chat, build it on
// /run with a sandboxed exercise row.
const VALID_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l'] as const;

// System-prompt-override patterns that are rejected before any provider
// call. Belt-and-suspenders defence — the canonical fix for the Foundation
// Course is to route through /run instead. These cover the most common
// jailbreak openings (override directives + role hijacks).
const SYSTEM_PROMPT_OVERRIDE_PATTERNS = [
  /\bignore\s+(all\s+)?previous\s+instructions/i,
  /\bdisregard\s+(all\s+)?prior\s+(rules|instructions|prompts)/i,
  /\b(you|act)\s+(are|as)\s+(now\s+)?(an?\s+)?(unrestricted|jailbroken|dan|developer\s+mode)/i,
  /<\|im_start\|>system/i,
  /\bsystem\s*:\s*you\s+(are|will)/i,
];

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
// Rate limit — 50 messages/hour per authenticated user. Backed by Supabase
// rate_limits table, atomic across serverless instances.
// ---------------------------------------------------------------------------

const RATE_LIMIT_PER_USER_PER_HOUR = 50;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidProvider(v: unknown): v is Provider {
  return typeof v === 'string' && VALID_PROVIDERS.includes(v as Provider);
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
  // that bills the Anthropic API on every call — anonymous access
  // turns this endpoint into an unbounded cost surface. Practice
  // tabs only render inside enrolled course modules, so requiring a
  // session here doesn't block any legitimate UX.
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const limited = await rateLimitOrFail({
    key: 'sandbox-chat',
    scope: 'user',
    identifier: user.id,
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

  const { provider, messages, moduleId, product, systemPrompt } = body;

  // 2a. Required fields
  if (!provider || !messages || !moduleId || !product || !systemPrompt) {
    return NextResponse.json(
      { error: 'Missing required fields: provider, messages, moduleId, product, systemPrompt.' },
      { status: 400 },
    );
  }

  // 2b. Provider check (Phase 1: Claude only)
  if (!isValidProvider(provider)) {
    return NextResponse.json(
      { error: "Invalid provider. Phase 1 supports 'claude' only." },
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

  if (systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `systemPrompt exceeds maximum length of ${MAX_SYSTEM_PROMPT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  // Reject obvious system-prompt-override attempts on the client-supplied
  // prompt. The canonical defence for the Foundation Course is to route
  // through /run with a server-assembled prompt — this is belt-and-
  // suspenders for the legacy AiBI-P / AiBI-S / AiBI-L surfaces.
  for (const pattern of SYSTEM_PROMPT_OVERRIDE_PATTERNS) {
    if (pattern.test(systemPrompt)) {
      return NextResponse.json(
        {
          error:
            'systemPrompt contains a pattern that looks like an override or role hijack. ' +
            'Re-frame the prompt without override directives.',
        },
        { status: 422 },
      );
    }
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
    const stream = await streamClaude(systemPrompt as string, messages);
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
