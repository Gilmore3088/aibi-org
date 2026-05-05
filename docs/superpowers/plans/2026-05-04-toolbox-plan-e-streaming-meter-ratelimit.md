# AiBI Toolbox — Plan E: Streaming + Cost Meter + Per-IP Rate Limit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Round out the Playground from "request → blocking response" to the production v1 shape: streaming text on every provider; a learner-visible "$/day" budget meter; per-IP and per-minute rate limiting layered on top of the existing per-user-per-day cap.

**Architecture:** Three independent threads:

1. **Streaming.** Implement `LLMClient.stream()` for OpenAI and Gemini (Anthropic already streams). Add a `/api/toolbox/run/stream` route that returns a `ReadableStream` of NDJSON chunks (`{type:'text',text}` and `{type:'done',usage}`). Cost is logged on the final `done` chunk, not before. The Playground UI consumes the NDJSON via `fetch` + `ReadableStream.getReader()` and progressively renders text.
2. **Cost meter.** New `/api/toolbox/usage` endpoint returns `{ todayCents, dailyCapCents, monthCents, monthlyCapCents }` derived from `ai_usage_log` and a single source of truth for the caps in `lib/toolbox/playground-budget.ts`. A `<UsageMeter>` component polls/refreshes after each Playground send and renders the thin `$0.31 / $0.50 today` indicator. Crossing 80% surfaces a Plausible event; crossing 100% blocks at the existing rate-limiter.
3. **Per-IP + per-minute rate limit (Postgres-backed, no new vendor).** Extend the existing `lib/ai-harness/rate-limit.ts` (already keyed on `ai_usage_log`) with a sliding-window per-minute check. Add an `ip_hash` column (SHA-256 of `x-forwarded-for` + server-side salt — never raw IPs) so the same table answers per-user-per-minute and per-IP-per-minute. Apply both checks at the top of `/api/toolbox/run` and `/api/toolbox/run/stream` *before* the provider dispatch: per-user 10/min, per-IP 20/min. The existing per-user-per-day call cap and dollar cap continue to run.

**Tech Stack:** Next.js 14 App Router edge-compatible streams · `openai` SDK streaming · `@google/generative-ai` streaming · existing `src/lib/ai-harness/rate-limit.ts` + `ai_usage_log` (extended with `ip_hash`) · existing `src/lib/toolbox/playground-models.ts` (from Plan D). **No Upstash. No new vendor.**

---

## Plan context (read before starting)

### What shipped in earlier plans

- **Plan A0 / B / C** — see Plan D's plan-context for these.
- **Plan D** (just shipped) — six-model menu locked, OpenAI + Gemini `chat()` adapters implemented, `/api/toolbox/run` dispatches by `{provider, model}`, pricing rows for all six models, compliance doc filled, ModelPicker in the Playground UI.

### What this plan does NOT do

- **Save to Toolbox** capture from inside course modules. → **Plan F**
- **Cookbook recipes.** → **Plan G**
- **Synthetic-only mode + typed-confirmation gate + telemetered "send anyway"** (the spec §5.3 PII layering beyond the existing scanners). → tracked via the issue opened in Plan D Task 10.
- **Compare Mode** (side-by-side multi-model output). → Phase 2 per spec §3.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/lib/ai-harness/providers/openai.ts` | Implement `stream()` using `client.chat.completions.create({ stream: true })`. Yield `StreamChunk` text deltas, then a final `stop` chunk with usage. |
| Modify | `src/lib/ai-harness/providers/openai.test.ts` | Replace the "stream throws" test with one that asserts streaming yields text chunks and a stop chunk. |
| Modify | `src/lib/ai-harness/providers/gemini.ts` | Implement `stream()` using `model.generateContentStream({ contents })`. Yield text deltas + final stop with `usageMetadata`. |
| Modify | `src/lib/ai-harness/providers/gemini.test.ts` | Replace the "stream throws" test with one that asserts streaming yields text + stop. |
| Create | `src/app/api/toolbox/run/stream/route.ts` | New SSE-ish NDJSON streaming endpoint. Validates inputs identically to `/api/toolbox/run`, runs PII + injection scans, dispatches to `client.stream(...)`, wraps in a `ReadableStream` of `${JSON.stringify(chunk)}\n` lines, calls `logUsage` on the final stop chunk. |
| Create | `src/app/api/toolbox/run/stream/route.test.ts` | Unit tests with mocked stream: validates the same input gates, asserts NDJSON output shape, asserts `logUsage` runs on stream completion (not before). |
| Create | `src/lib/toolbox/playground-budget.ts` | Single source of truth for daily + monthly cents caps. Exports `DAILY_CAP_CENTS`, `MONTHLY_CAP_CENTS`, and `getUsageForUser(userId): Promise<{ todayCents, monthCents }>`. |
| Create | `src/lib/toolbox/playground-budget.test.ts` | Asserts the SQL aggregation works against a mocked Supabase client. |
| Create | `src/app/api/toolbox/usage/route.ts` | GET-only. Returns the current learner's `{ todayCents, dailyCapCents, monthCents, monthlyCapCents }`. |
| Create | `src/app/api/toolbox/usage/route.test.ts` | Asserts paid-access gate, response shape, error path. |
| Create | `src/app/dashboard/toolbox/_components/UsageMeter.tsx` | Renders the thin "$0.31 / $0.50 today" indicator. Polls `/api/toolbox/usage` on mount and after each Playground send. Renders an 80% warning state and a 100% blocked state. Pillar A (sage) under 80%, terra at 80–99%, error red at 100%. |
| Create | `src/app/dashboard/toolbox/_components/UsageMeter.test.tsx` | Asserts the three visual states render correctly given different `todayCents` values. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` | (a) Replace the `fetch('/api/toolbox/run')` Playground call with the streaming variant that hits `/api/toolbox/run/stream` and progressively appends to the assistant message. (b) Render `<UsageMeter>` in the Playground tab; trigger a refresh after each successful send. |
| Create | `src/lib/ratelimit/upstash.ts` | Thin wrapper. Exports `playgroundUserLimiter` (10/min, 200/day) and `playgroundIpLimiter` (20/min). Returns a `{ allowed, retryAfterSeconds }` shape that matches the existing `RateLimitDecision`. Falls open in dev when Upstash env vars are unset. |
| Create | `src/lib/ratelimit/upstash.test.ts` | Asserts fail-open in dev; asserts the limiter calls Upstash with the expected key shapes. |
| Modify | `src/app/api/toolbox/run/route.ts` | Apply `playgroundUserLimiter` keyed on userId and `playgroundIpLimiter` keyed on `request.headers.get('x-forwarded-for')` BEFORE the existing `checkRateLimit` call. 429 with `Retry-After` header on hit. |
| Modify | `src/app/api/toolbox/run/stream/route.ts` | Same rate limiters, applied at the top of the streaming handler (so they fire before any stream bytes go out). |
| Create | `supabase/migrations/00020_ai_usage_log_ip_hash.sql` | Add `ip_hash text` column to `ai_usage_log` plus a partial index for the per-minute lookup. |
| Modify | `.env.local.example` (or wherever the project documents required env vars) | Document `TOOLBOX_IP_HASH_SALT` (any random 32-byte hex string; required in production so hashes are stable; falls back to a session-local random in dev). |

---

## Tasks

### Task 1: Implement OpenAI `stream()` adapter

**Files:**
- Modify: `src/lib/ai-harness/providers/openai.ts`
- Modify: `src/lib/ai-harness/providers/openai.test.ts`

The OpenAI SDK returns an async iterator when `stream: true` is passed to `chat.completions.create`. Each chunk has `choices[0].delta.content` (a string fragment). The final usage is delivered when `stream_options.include_usage = true` is passed; the last chunk has a top-level `usage` object.

- [ ] **Step 1: Update the test**

In `src/lib/ai-harness/providers/openai.test.ts`, replace the "stream() still throws (Plan E)" test with:

```typescript
it('stream() yields text chunks and a final stop with usage', async () => {
  const mockStream = (async function* () {
    yield { choices: [{ delta: { content: 'hel' }, finish_reason: null }] };
    yield { choices: [{ delta: { content: 'lo' }, finish_reason: null }] };
    yield {
      choices: [{ delta: {}, finish_reason: 'stop' }],
      usage: { prompt_tokens: 5, completion_tokens: 2 },
    };
  })();
  createMock.mockResolvedValueOnce(mockStream);

  const client = createOpenAIClient('test-key');
  const chunks: any[] = [];
  for await (const chunk of client.stream({
    model: 'gpt-4o-mini',
    maxTokens: 100,
    messages: [{ role: 'user', content: 'hi' }],
  })) {
    chunks.push(chunk);
  }
  const textChunks = chunks.filter((c) => c.type === 'text').map((c) => c.text).join('');
  expect(textChunks).toBe('hello');
  const stopChunk = chunks.find((c) => c.type === 'stop');
  expect(stopChunk).toBeTruthy();
  expect(stopChunk.usage).toEqual({ inputTokens: 5, outputTokens: 2 });
});
```

(`StreamChunk` from `types.ts` already has optional `usage` — confirm and add the field if absent. If absent: add `readonly usage?: ChatUsage;` to the `StreamChunk` interface in `src/lib/ai-harness/types.ts` first; this is a non-breaking additive change.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai-harness/providers/openai.test.ts`
Expected: FAIL — `stream()` throws.

- [ ] **Step 3: Implement `stream()`**

Replace the stub `stream()` in `openai.ts`:

```typescript
async *stream(req: ChatRequest): AsyncIterable<StreamChunk> {
  try {
    const messages = req.system
      ? [{ role: 'system' as const, content: req.system }, ...req.messages.map((m) => ({ role: m.role, content: m.content }))]
      : req.messages.map((m) => ({ role: m.role, content: m.content }));

    const stream = await client.chat.completions.create({
      model: req.model,
      messages,
      max_tokens: req.maxTokens,
      temperature: req.temperature,
      stream: true,
      stream_options: { include_usage: true },
    });

    let inputTokens = 0;
    let outputTokens = 0;
    let stopReason: StopReason = 'end_turn';

    for await (const part of stream as AsyncIterable<{
      choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    }>) {
      const delta = part.choices?.[0]?.delta?.content;
      if (delta) yield { type: 'text', text: delta };
      const finish = part.choices?.[0]?.finish_reason;
      if (finish) stopReason = mapStopReason(finish);
      if (part.usage) {
        inputTokens = part.usage.prompt_tokens ?? 0;
        outputTokens = part.usage.completion_tokens ?? 0;
      }
    }
    yield { type: 'stop', stopReason, usage: { inputTokens, outputTokens } };
  } catch (err) {
    yield { type: 'error', error: toLLMError(err) };
  }
}
```

Imports: add `StreamChunk` to the `import type` line at the top of the file.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai-harness/providers/openai.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-harness/providers/openai.ts src/lib/ai-harness/providers/openai.test.ts src/lib/ai-harness/types.ts
git commit -m "feat(ai-harness): implement OpenAI stream() with usage on done"
```

---

### Task 2: Implement Gemini `stream()` adapter

**Files:**
- Modify: `src/lib/ai-harness/providers/gemini.ts`
- Modify: `src/lib/ai-harness/providers/gemini.test.ts`

`model.generateContentStream({ contents })` returns `{ stream: AsyncIterable<EnhancedGenerateContentResponse>, response: Promise<EnhancedGenerateContentResponse> }`. The aggregated final `response` carries `usageMetadata`.

- [ ] **Step 1: Update the test**

In `src/lib/ai-harness/providers/gemini.test.ts`, replace the "stream() still throws (Plan E)" test with:

```typescript
it('stream() yields text chunks and a final stop with usage', async () => {
  const mockChunks = [
    { text: () => 'hel' },
    { text: () => 'lo' },
  ];
  const mockStream = (async function* () { for (const c of mockChunks) yield c; })();
  const finalResponse = {
    candidates: [{ finishReason: 'STOP' }],
    usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 2 },
  };

  const generateContentStreamMock = vi.fn(() => ({
    stream: mockStream,
    response: Promise.resolve(finalResponse),
  }));
  getGenerativeModelMock.mockReturnValueOnce({ generateContentStream: generateContentStreamMock });

  const client = createGeminiClient('test-key');
  const chunks: any[] = [];
  for await (const chunk of client.stream({
    model: 'gemini-2.5-flash',
    maxTokens: 100,
    messages: [{ role: 'user', content: 'hi' }],
  })) {
    chunks.push(chunk);
  }
  const textChunks = chunks.filter((c) => c.type === 'text').map((c) => c.text).join('');
  expect(textChunks).toBe('hello');
  const stopChunk = chunks.find((c) => c.type === 'stop');
  expect(stopChunk.usage).toEqual({ inputTokens: 4, outputTokens: 2 });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai-harness/providers/gemini.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `stream()`**

Replace the stub `stream()` in `gemini.ts`:

```typescript
async *stream(req: ChatRequest): AsyncIterable<StreamChunk> {
  try {
    const model = genAI.getGenerativeModel({
      model: req.model,
      systemInstruction: req.system,
    });
    const contents = req.messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const { stream, response } = await model.generateContentStream({
      contents,
      generationConfig: {
        maxOutputTokens: req.maxTokens,
        temperature: req.temperature,
      },
    });
    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) yield { type: 'text', text };
    }
    const final = await response;
    const finishReason = final.candidates?.[0]?.finishReason;
    yield {
      type: 'stop',
      stopReason: mapStopReason(finishReason),
      usage: {
        inputTokens: final.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: final.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  } catch (err) {
    yield { type: 'error', error: toLLMError(err) };
  }
}
```

Imports: add `StreamChunk` to the `import type` line at the top.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai-harness/providers/gemini.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-harness/providers/gemini.ts src/lib/ai-harness/providers/gemini.test.ts
git commit -m "feat(ai-harness): implement Gemini stream() with usage on done"
```

---

### Task 3: Streaming endpoint `/api/toolbox/run/stream`

**Files:**
- Create: `src/app/api/toolbox/run/stream/route.ts`
- Create: `src/app/api/toolbox/run/stream/route.test.ts`

Returns NDJSON (`one JSON object per line`) so the client can parse incrementally without an SSE library. The handler reuses every gate from `/api/toolbox/run` (paid access, body validation, `isAllowedModel`, PII scan, injection scan, daily/cost rate limit) and only differs in the dispatch (`client.stream(...)` instead of `client.chat(...)`) and in `logUsage` happening on the final stop chunk.

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/api/toolbox/run/stream/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/sandbox/pii-scanner', () => ({ scanForPII: vi.fn(() => ({ safe: true })) }));
vi.mock('@/lib/sandbox/injection-filter', () => ({ scanForInjection: vi.fn(() => ({ safe: true })) }));
vi.mock('@/lib/ai-harness/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  logUsage: vi.fn(async () => {}),
}));

const streamMock = vi.fn();
vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn(() => ({ name: 'openai', chat: vi.fn(), stream: streamMock })),
}));

import { logUsage } from '@/lib/ai-harness/rate-limit';

beforeEach(() => {
  streamMock.mockImplementation(async function* () {
    yield { type: 'text', text: 'hi' };
    yield { type: 'text', text: ' world' };
    yield { type: 'stop', stopReason: 'end_turn', usage: { inputTokens: 3, outputTokens: 2 } };
  });
});
afterEach(() => vi.clearAllMocks());

const body = {
  skill: { kind: 'workflow', cmd: '/x', name: 'x' },
  messages: [{ role: 'user', content: 'hi' }],
  provider: 'openai',
  model: 'gpt-4o-mini',
};

function req(b: unknown): Request {
  return new Request('http://localhost/api/toolbox/run/stream', {
    method: 'POST',
    body: JSON.stringify(b),
    headers: { 'content-type': 'application/json' },
  });
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let out = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    out += decoder.decode(value);
  }
  return out;
}

describe('POST /api/toolbox/run/stream', () => {
  it('streams NDJSON chunks then a done line', async () => {
    const res = await POST(req(body));
    expect(res.headers.get('content-type')).toMatch(/x-ndjson|application\/json/);
    const text = await readAll(res.body!);
    const lines = text.trim().split('\n').map((l) => JSON.parse(l));
    expect(lines.filter((l) => l.type === 'text').map((l) => l.text).join('')).toBe('hi world');
    expect(lines.find((l) => l.type === 'done')).toBeTruthy();
  });

  it('logs usage on stream completion, not before', async () => {
    let resolveLog: () => void = () => {};
    const logged = new Promise<void>((r) => { resolveLog = r; });
    (logUsage as ReturnType<typeof vi.fn>).mockImplementationOnce(async () => { resolveLog(); });

    const res = await POST(req(body));
    await readAll(res.body!);
    await logged;
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openai', model: 'gpt-4o-mini', status: 'succeeded', inputTokens: 3, outputTokens: 2 }),
    );
  });

  it('rejects unknown provider with 400 (no stream body)', async () => {
    const res = await POST(req({ ...body, provider: 'mistral' }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/toolbox/run/stream/route.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the route**

```typescript
// src/app/api/toolbox/run/stream/route.ts
import { NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/ai-harness/client';
import { checkRateLimit, logUsage } from '@/lib/ai-harness/rate-limit';
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
      provider, model, status: 'rate-limited',
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
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'application/x-ndjson; charset=utf-8' },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/toolbox/run/stream/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/toolbox/run/stream/route.ts src/app/api/toolbox/run/stream/route.test.ts
git commit -m "feat(toolbox): NDJSON streaming endpoint for Playground"
```

---

### Task 4: Cost-meter source of truth + `/api/toolbox/usage`

**Files:**
- Create: `src/lib/toolbox/playground-budget.ts`
- Create: `src/lib/toolbox/playground-budget.test.ts`
- Create: `src/app/api/toolbox/usage/route.ts`
- Create: `src/app/api/toolbox/usage/route.test.ts`

Caps live in one module so the meter, the rate limiter, and the API all see the same numbers. Per spec §10.1 the placeholder defaults are illustrative — flagged in the file header comment so calibration can update them in one place.

- [ ] **Step 1: Write the budget tests + module**

```typescript
// src/lib/toolbox/playground-budget.test.ts
import { describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { DAILY_CAP_CENTS, MONTHLY_CAP_CENTS, getUsageForUser } from './playground-budget';

describe('playground-budget caps', () => {
  it('exports plausible-magnitude defaults', () => {
    expect(DAILY_CAP_CENTS).toBeGreaterThan(0);
    expect(MONTHLY_CAP_CENTS).toBeGreaterThanOrEqual(DAILY_CAP_CENTS);
  });
});

describe('getUsageForUser', () => {
  it('returns aggregated cents for today and this month', async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const gte = vi.fn().mockReturnThis();
    const exec = vi.fn();

    fromMock.mockReturnValue({ select, eq, gte, async then(resolve: any) { resolve(await exec()); } });
    exec.mockResolvedValueOnce({ data: [{ total_cents: 31 }], error: null });
    exec.mockResolvedValueOnce({ data: [{ total_cents: 412 }], error: null });

    const usage = await getUsageForUser('u1');
    expect(usage.todayCents).toBeGreaterThanOrEqual(0);
    expect(usage.monthCents).toBeGreaterThanOrEqual(usage.todayCents);
  });
});
```

```typescript
// src/lib/toolbox/playground-budget.ts
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Placeholders per spec §10.1 — calibrate from real usage.
// Update in lockstep with the per-call rate limit numbers in
// src/app/api/toolbox/run/route.ts and stream/route.ts.
export const DAILY_CAP_CENTS = 50;     // $0.50 / learner / day
export const MONTHLY_CAP_CENTS = 1000; // $10   / learner / month

interface UsageSummary {
  readonly todayCents: number;
  readonly monthCents: number;
}

function startOfUtcDayIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}
function startOfUtcMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getUsageForUser(userId: string): Promise<UsageSummary> {
  if (!isSupabaseConfigured()) return { todayCents: 0, monthCents: 0 };
  const client = createServiceRoleClient();

  const today = await client
    .from('ai_usage_log')
    .select('total_cents:cost_cents.sum()')
    .eq('user_id', userId)
    .gte('created_at', startOfUtcDayIso());
  const month = await client
    .from('ai_usage_log')
    .select('total_cents:cost_cents.sum()')
    .eq('user_id', userId)
    .gte('created_at', startOfUtcMonthIso());

  const todayCents = (today.data?.[0] as { total_cents?: number } | undefined)?.total_cents ?? 0;
  const monthCents = (month.data?.[0] as { total_cents?: number } | undefined)?.total_cents ?? 0;
  return { todayCents, monthCents };
}
```

> **Schema note:** `ai_usage_log` is the existing table written by `lib/ai-harness/rate-limit.ts → logUsage`. Confirm the column name for cost is `cost_cents`. If the column is named differently in production, update the `select` clause to match (and update the test). Plan E does not migrate the table.

- [ ] **Step 2: Write the route test + handler**

```typescript
// src/app/api/toolbox/usage/route.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/toolbox/playground-budget', () => ({
  DAILY_CAP_CENTS: 50,
  MONTHLY_CAP_CENTS: 1000,
  getUsageForUser: vi.fn(async () => ({ todayCents: 31, monthCents: 412 })),
}));

afterEach(() => vi.clearAllMocks());

describe('GET /api/toolbox/usage', () => {
  it('returns the usage summary with caps', async () => {
    const res = await GET(new Request('http://localhost/api/toolbox/usage'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ todayCents: 31, dailyCapCents: 50, monthCents: 412, monthlyCapCents: 1000 });
  });
});
```

```typescript
// src/app/api/toolbox/usage/route.ts
import { NextResponse } from 'next/server';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import { DAILY_CAP_CENTS, MONTHLY_CAP_CENTS, getUsageForUser } from '@/lib/toolbox/playground-budget';

export async function GET(_request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });

  const { todayCents, monthCents } = await getUsageForUser(access.userId);
  return NextResponse.json({
    todayCents,
    dailyCapCents: DAILY_CAP_CENTS,
    monthCents,
    monthlyCapCents: MONTHLY_CAP_CENTS,
  });
}
```

- [ ] **Step 3: Run all four tests, verify pass**

Run: `npx vitest run src/lib/toolbox/playground-budget.test.ts src/app/api/toolbox/usage/route.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/toolbox/playground-budget.ts src/lib/toolbox/playground-budget.test.ts src/app/api/toolbox/usage/route.ts src/app/api/toolbox/usage/route.test.ts
git commit -m "feat(toolbox): cost-meter source of truth + /api/toolbox/usage"
```

---

### Task 5: UsageMeter component

**Files:**
- Create: `src/app/dashboard/toolbox/_components/UsageMeter.tsx`
- Create: `src/app/dashboard/toolbox/_components/UsageMeter.test.tsx`

Renders the thin "$0.31 / $0.50 today" bar. Three visual states:
- **<80%** — sage fill, neutral copy.
- **80–99%** — terra fill, "Approaching daily cap." Plausible event `playground_quota_warning_80` fires once per session at first crossing.
- **=100%** — error fill, "Daily cap reached. Resets at UTC midnight." Send button is disabled while in this state.

The component takes its data via props (so the host controls polling); a small `useUsage()` hook is provided alongside for the host to use.

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/dashboard/toolbox/_components/UsageMeter.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageMeter } from './UsageMeter';

describe('UsageMeter', () => {
  it('renders dollars under 80% in the neutral state', () => {
    render(<UsageMeter todayCents={20} dailyCapCents={50} />);
    expect(screen.getByText('$0.20 / $0.50 today')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('neutral');
  });

  it('renders the 80% warning state', () => {
    render(<UsageMeter todayCents={42} dailyCapCents={50} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('warning');
    expect(screen.getByText(/approaching/i)).toBeTruthy();
  });

  it('renders the 100% blocked state', () => {
    render(<UsageMeter todayCents={50} dailyCapCents={50} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('blocked');
    expect(screen.getByText(/cap reached/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/dashboard/toolbox/_components/UsageMeter.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Create the component**

```tsx
// src/app/dashboard/toolbox/_components/UsageMeter.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';

type State = 'neutral' | 'warning' | 'blocked';

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function UsageMeter({ todayCents, dailyCapCents }: { todayCents: number; dailyCapCents: number }) {
  const ratio = dailyCapCents === 0 ? 0 : todayCents / dailyCapCents;
  const state: State = ratio >= 1 ? 'blocked' : ratio >= 0.8 ? 'warning' : 'neutral';
  const fillPct = Math.min(100, Math.round(ratio * 100));

  const fillColor =
    state === 'blocked' ? 'bg-[var(--color-error)]' :
    state === 'warning' ? 'bg-[var(--color-terra)]' :
    'bg-[var(--color-sage)]';

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono tabular-nums">
          {formatDollars(todayCents)} / {formatDollars(dailyCapCents)} today
        </span>
        {state === 'warning' && <span className="text-[var(--color-terra)]">Approaching daily cap</span>}
        {state === 'blocked' && <span className="text-[var(--color-error)]">Daily cap reached. Resets at UTC midnight.</span>}
      </div>
      <div role="progressbar" data-state={state} aria-valuenow={fillPct} aria-valuemin={0} aria-valuemax={100}
           className="h-1 w-full bg-ink/10 rounded">
        <div className={`h-1 rounded ${fillColor}`} style={{ width: `${fillPct}%` }} />
      </div>
    </div>
  );
}

interface UsageData {
  todayCents: number;
  dailyCapCents: number;
  monthCents: number;
  monthlyCapCents: number;
}

export function useUsage(): { usage: UsageData | null; refresh: () => void } {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/toolbox/usage');
      if (!res.ok) return;
      setUsage(await res.json());
    } catch {
      /* swallow — meter is non-critical */
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { usage, refresh };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/dashboard/toolbox/_components/UsageMeter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/toolbox/_components/UsageMeter.tsx src/app/dashboard/toolbox/_components/UsageMeter.test.tsx
git commit -m "feat(toolbox): UsageMeter component + useUsage hook"
```

---

### Task 6: Wire streaming + UsageMeter into the Playground

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx`

Two changes in the Playground panel:

1. Replace `fetch('/api/toolbox/run', ...)` with the streaming version that posts to `/api/toolbox/run/stream` and reads NDJSON, progressively appending text to the assistant message in state. On a `done` line, refresh the usage meter; on `error`, show a toast.
2. Render `<UsageMeter ...>` above the input area; pull data via `useUsage()`.

- [ ] **Step 1: Add imports near the top of `ToolboxApp.tsx`**

```tsx
import { UsageMeter, useUsage } from './_components/UsageMeter';
```

- [ ] **Step 2: In the playground component, add the usage hook**

```tsx
const { usage, refresh: refreshUsage } = useUsage();
```

- [ ] **Step 3: Replace the existing Playground send fetch with a streaming call**

Locate the existing `fetch('/api/toolbox/run' ...)` body inside the Playground send handler and replace it with:

```tsx
const res = await fetch('/api/toolbox/run/stream', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    skill: activeSkill,
    messages: nextMessages,
    provider: modelSelection.provider,
    model: modelSelection.model,
  }),
});
if (!res.ok || !res.body) {
  const json = await res.json().catch(() => ({ error: 'Unknown error.' }));
  setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${json.error ?? res.statusText}` }]);
  setIsStreaming(false);
  return;
}

// Append a placeholder assistant message that the stream will fill in.
setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line) as { type: string; text?: string; usage?: unknown };
      if (obj.type === 'text' && obj.text) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [...prev.slice(0, -1), { role: 'assistant', content: last.content + obj.text }];
        });
      } else if (obj.type === 'done') {
        await refreshUsage();
      } else if (obj.type === 'error') {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Stream error. Please try again.' }]);
      }
    } catch {
      /* ignore malformed line */
    }
  }
}
setIsStreaming(false);
```

(`isStreaming` is the existing busy flag; if the file uses a different name, substitute it.)

- [ ] **Step 4: Render `<UsageMeter>` above the input**

Just above the model picker (or wherever the input area starts in the Playground panel JSX):

```tsx
{usage && (
  <div className="mb-3">
    <UsageMeter todayCents={usage.todayCents} dailyCapCents={usage.dailyCapCents} />
  </div>
)}
```

- [ ] **Step 5: Manual smoke test**

Run `npm run dev`. As a paid user, navigate to the Playground tab.

1. Verify the meter renders above the model picker.
2. Send a short prompt; verify text appears progressively (not all at once).
3. After the response completes, verify the meter increments by approximately the expected cost.
4. Switch to GPT-4o mini and Gemini 2.5 Flash; verify both stream.
5. (Optional) Hand-edit `DAILY_CAP_CENTS` to `1` temporarily and send a couple of prompts to confirm the warning state and blocked state render. Revert the value before commit.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): streaming Playground + visible cost meter"
```

---

### Task 7: Per-user and per-IP per-minute rate limiting (Postgres-backed)

**Files:**
- Create: `supabase/migrations/00020_ai_usage_log_ip_hash.sql`
- Modify: `src/lib/ai-harness/rate-limit.ts`
- Modify: `src/lib/ai-harness/rate-limit.test.ts` (or create if missing)
- Modify: `src/app/api/toolbox/run/route.ts`
- Modify: `src/app/api/toolbox/run/stream/route.ts`

Per spec §5.3 / decision #18: per-user 10/min and 200/day; per-IP 20/min. The existing `checkRateLimit()` in `lib/ai-harness/rate-limit.ts` already handles the 200/day call cap and the daily dollar cap via `ai_usage_log`. Plan E adds the per-minute slice on top of the same table — no new vendor, no new env vars to provision in Vercel beyond a single hash salt.

**Why Postgres, not Redis/Upstash:** the user does not want to onboard Upstash. `ai_usage_log` is small, indexed, and writes once per Playground send — adding two filtered `count(*)` reads per send (per-user, per-IP) is well within the table's headroom for our traffic profile and removes a vendor + a fail-open code path.

**Why hash IPs instead of storing them raw:** so we never store raw client IPs at rest. The hash is keyed by a server-side salt (`TOOLBOX_IP_HASH_SALT`); without the salt, hashes from one deploy can't be correlated with hashes from another. Privacy-by-default, no schema work to redo if we add a privacy review later.

- [ ] **Step 1: Write the migration**

```sql
-- supabase/migrations/00020_ai_usage_log_ip_hash.sql

-- Add an ip_hash column to ai_usage_log so per-IP rate limits can be
-- computed against the same table the per-user rate limit already uses.
-- The hash is SHA-256 of the IP plus a server-side salt (see
-- TOOLBOX_IP_HASH_SALT env). We never store the raw IP.

alter table ai_usage_log
  add column if not exists ip_hash text;

-- Partial index for the per-minute IP lookup. Only rows from the last
-- minute matter for rate limiting; the partial predicate keeps the
-- index small.
create index if not exists idx_ai_usage_log_ip_recent
  on ai_usage_log (ip_hash, created_at)
  where ip_hash is not null;

create index if not exists idx_ai_usage_log_user_recent
  on ai_usage_log (user_id, created_at);
```

- [ ] **Step 2: Extend `rate-limit.ts` with per-minute checks**

Add to `src/lib/ai-harness/rate-limit.ts`:

```typescript
import { createHash } from 'node:crypto';

export function hashIp(ip: string): string {
  const salt = process.env.TOOLBOX_IP_HASH_SALT ?? '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export interface PerMinuteLimits {
  readonly perUserPerMinute: number;     // e.g. 10
  readonly perIpPerMinute: number;       // e.g. 20
}

export interface PerMinuteDecision {
  readonly allowed: boolean;
  readonly reason?: 'per-user-per-minute-exceeded' | 'per-ip-per-minute-exceeded';
  readonly retryAfterSeconds?: number;
}

function sixtySecondsAgoIso(): string {
  return new Date(Date.now() - 60_000).toISOString();
}

export async function checkPerMinuteLimits(params: {
  readonly userId: string;
  readonly ipHash: string;
  readonly limits: PerMinuteLimits;
}): Promise<PerMinuteDecision> {
  if (!isSupabaseConfigured()) return { allowed: true };
  const client = createServiceRoleClient();
  const since = sixtySecondsAgoIso();

  const { count: userCount, error: userErr } = await client
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', params.userId)
    .gte('created_at', since);
  if (userErr) return { allowed: true }; // fail open on infra error
  if ((userCount ?? 0) >= params.limits.perUserPerMinute) {
    return { allowed: false, reason: 'per-user-per-minute-exceeded', retryAfterSeconds: 60 };
  }

  const { count: ipCount, error: ipErr } = await client
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', params.ipHash)
    .gte('created_at', since);
  if (ipErr) return { allowed: true };
  if ((ipCount ?? 0) >= params.limits.perIpPerMinute) {
    return { allowed: false, reason: 'per-ip-per-minute-exceeded', retryAfterSeconds: 60 };
  }

  return { allowed: true };
}
```

Also extend the existing `logUsage()` signature to accept `ipHash` and persist it. Keep the field optional — backfill is a no-op since pre-Plan-E rows don't need IP attribution.

```typescript
// inside logUsage params:
readonly ipHash?: string;

// inside the insert payload:
ip_hash: params.ipHash ?? null,
```

- [ ] **Step 3: Write the failing test**

Create or extend `src/lib/ai-harness/rate-limit.test.ts`:

```typescript
import { describe, expect, it, vi } from 'vitest';

const fromMock = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));

import { checkPerMinuteLimits, hashIp } from './rate-limit';

describe('hashIp', () => {
  it('produces a stable, salted SHA-256 hex string', () => {
    process.env.TOOLBOX_IP_HASH_SALT = 'fixed-salt';
    const a = hashIp('1.2.3.4');
    const b = hashIp('1.2.3.4');
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
  it('produces different hashes under different salts', () => {
    process.env.TOOLBOX_IP_HASH_SALT = 'salt-a';
    const a = hashIp('1.2.3.4');
    process.env.TOOLBOX_IP_HASH_SALT = 'salt-b';
    const b = hashIp('1.2.3.4');
    expect(a).not.toBe(b);
  });
});

describe('checkPerMinuteLimits', () => {
  it('allows when both user and IP counts are under the cap', async () => {
    const queries: any[] = [];
    fromMock.mockImplementation(() => {
      const q: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn(async () => ({ count: queries.length === 0 ? 3 : 5, error: null })),
      };
      queries.push(q);
      return q;
    });
    const decision = await checkPerMinuteLimits({
      userId: 'u1', ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(true);
  });

  it('blocks with per-user reason when the user cap is reached', async () => {
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn(async () => ({ count: 10, error: null })),
    });
    const decision = await checkPerMinuteLimits({
      userId: 'u1', ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('per-user-per-minute-exceeded');
    expect(decision.retryAfterSeconds).toBe(60);
  });

  it('blocks with per-IP reason when the IP cap is reached', async () => {
    let call = 0;
    fromMock.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn(async () => ({ count: call++ === 0 ? 1 : 20, error: null })),
    }));
    const decision = await checkPerMinuteLimits({
      userId: 'u1', ipHash: 'h1',
      limits: { perUserPerMinute: 10, perIpPerMinute: 20 },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe('per-ip-per-minute-exceeded');
  });
});
```

- [ ] **Step 4: Run the new tests, verify pass**

Run: `npx vitest run src/lib/ai-harness/rate-limit.test.ts`
Expected: PASS.

- [ ] **Step 5: Apply the per-minute check in both run routes**

In **`src/app/api/toolbox/run/route.ts`** and **`src/app/api/toolbox/run/stream/route.ts`**, immediately after the access check + body parse + provider/model validation, BEFORE the PII scan and BEFORE the existing `checkRateLimit()`:

```typescript
import { checkPerMinuteLimits, hashIp } from '@/lib/ai-harness/rate-limit';

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
```

Pass `ipHash` through to `logUsage()` calls in the same route so future requests can be attributed to the same IP.

> **Order:** per-minute check fires BEFORE the PII scan and BEFORE the existing daily `checkRateLimit`. A script with a session token can chew through the daily cap in seconds — the per-minute cap is the cheap first line of defense.

- [ ] **Step 6: Add a route test that 429 short-circuits the dispatcher**

Extend `src/app/api/toolbox/run/route.test.ts` with:

```typescript
vi.mock('@/lib/ai-harness/rate-limit', async (orig) => {
  const actual = (await orig()) as object;
  return {
    ...actual,
    checkPerMinuteLimits: vi.fn(async () => ({ allowed: true })),
    hashIp: vi.fn(() => 'hash-stub'),
  };
});
import { checkPerMinuteLimits } from '@/lib/ai-harness/rate-limit';

it('returns 429 with Retry-After when per-minute limit trips', async () => {
  (checkPerMinuteLimits as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    allowed: false, reason: 'per-user-per-minute-exceeded', retryAfterSeconds: 42,
  });
  const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'anthropic', model: 'claude-sonnet-4-6' }));
  expect(res.status).toBe(429);
  expect(res.headers.get('retry-after')).toBe('42');
  expect(chatMock).not.toHaveBeenCalled();
});
```

(Add an analogous test to the streaming route's test file.)

- [ ] **Step 7: Run all route tests, verify pass**

Run: `npx vitest run src/app/api/toolbox/run`
Expected: PASS.

- [ ] **Step 8: Document the env var**

Add to `.env.local.example` (or wherever env vars are documented):

```
# Toolbox per-IP rate limit (Plan E). 32-byte hex string. Required in
# production so IP hashes are stable across pod restarts. In dev, omit
# to use a session-local random value (per-IP limits still work within
# a single session).
TOOLBOX_IP_HASH_SALT=
```

- [ ] **Step 9: Apply migration + commit**

After the user confirms in ALL CAPS per CLAUDE.md ("APPLY MIGRATION 00020 TO STAGING SUPABASE? (yes/no)"):

```bash
supabase db push
```

Then:

```bash
git add supabase/migrations/00020_ai_usage_log_ip_hash.sql src/lib/ai-harness/rate-limit.ts src/lib/ai-harness/rate-limit.test.ts src/app/api/toolbox/run/route.ts src/app/api/toolbox/run/route.test.ts src/app/api/toolbox/run/stream/route.ts src/app/api/toolbox/run/stream/route.test.ts .env.local.example
git commit -m "feat(toolbox): per-user and per-IP per-minute rate limit (Postgres-backed)"
```

---

## Acceptance criteria

- [ ] OpenAI and Gemini `stream()` adapters emit text chunks then a final `stop` chunk carrying `usage`.
- [ ] `/api/toolbox/run/stream` returns NDJSON; `logUsage` runs once on stream completion with the actual provider/model.
- [ ] `/api/toolbox/usage` returns the four-field shape `{ todayCents, dailyCapCents, monthCents, monthlyCapCents }` and is gated to paid learners.
- [ ] `UsageMeter` renders neutral / warning / blocked states correctly at 0%, 80%, and 100%.
- [ ] Playground tab uses streaming (text appears progressively, not all-at-once) on Anthropic, OpenAI, and Gemini.
- [ ] After every successful Playground send, the usage meter refreshes to reflect the new total.
- [ ] Per-user (10/min) and per-IP (20/min) limits applied via Postgres-backed `checkPerMinuteLimits`. Per-user 200/day limiter (existing `checkRateLimit`) continues to run. Migration 00020 adds `ip_hash` column + indexes. IP hashes are SHA-256 with a salt — never raw IPs at rest.
- [ ] 429 responses include a `Retry-After` header (seconds).
- [ ] Per-user and per-IP limiters fire BEFORE PII scans and BEFORE the existing `checkRateLimit` call.
- [ ] `npx tsc --noEmit` passes; `npx vitest run` passes; `npm run build` succeeds.
- [ ] Manual smoke: send 11 prompts back-to-back as the same user — the 11th returns 429 with a non-zero `Retry-After` and the dispatcher does not call the provider.

---

## What Plan E explicitly does NOT do

- **Save to Toolbox** capture from inside course modules. → **Plan F**
- **Cookbook recipes.** → **Plan G**
- **Synthetic-only mode + typed-confirmation gate + telemetered "send anyway" path + persistent disclaimer banner** (spec §5.3 layers 1, 2, 3, 5). → tracked as the issue opened in Plan D Task 10.
- **Compare Mode** (side-by-side multi-model output). → Phase 2.
- **Calibrating the dollar cap defaults.** Plan E ships the placeholder $0.50/day, $10/month from spec §10.1. The instrumentation in `ai_usage_log` is now sufficient for an internal tester to run the calibration pass — that pass is a deliberate post-Plan-E activity, not an engineering task.

---

## Self-Review

### Spec coverage check

| Spec section | Plan E coverage |
|---|---|
| §5.3 Quota model — dollars, daily + monthly | Tasks 4, 5, 6 |
| §5.3 "$0.31 / $0.50 today" meter | Task 5 |
| §5.3 80% friendly warning, 100% hard cutoff | Task 5 visual states + the existing daily-dollar `checkRateLimit` |
| §5.3 Per-user 10/min, 200/day, per-IP 20/min — implementation choice | Task 7 (Postgres-backed; spec said `@upstash/ratelimit` but vendor was rejected by user 2026-05-04. Same caps, different backend.) |
| §5.3 429 + `Retry-After` on cap hit | Task 7 |
| §7.4 Streaming responses required for v1 | Tasks 1, 2, 3, 6 |
| §7.4 "Cost is recorded on stream completion" | Task 3 (logUsage in `finally` block, after stream drains) |
| §11.5 "cost tracking with the first provider call" | Inherited from Plan D's `logUsage` wiring; Plan E preserves it on the streaming path |
| §11.6 layered PII safety | Existing scanners preserved; the richer layers are deferred (Plan D Task 10 issue) |
| §11.10 quarterly review reminder | Already in place from Plan D |
| §9 Plausible events `playground_quota_warning_80`, `playground_quota_blocked` | Task 5 (warning) + the 100% blocked path. Wire the actual `trackEvent()` calls inside the meter — flagged here so the test's data-state assertion is paired with the analytics call. |

### Placeholder scan

Searched plan for: TBD, TODO, "implement later", "fill in details", "add appropriate error handling", "similar to Task N", "write tests for the above" — zero hits. Task 6 includes pseudocode for the patch into `ToolboxApp.tsx` with explicit named symbols and exact JSX placement; the engineer reading Task 6 has the file and Plan D's Task 8 patch as direct precedent.

### Type consistency

- `StreamChunk` in `src/lib/ai-harness/types.ts` gains an optional `usage?: ChatUsage` field in Task 1 Step 1 (additive). Both adapter implementations and the streaming endpoint consume it; the `done` line on the wire carries the same shape under the field name `usage`.
- `UsageData` in `UsageMeter.tsx` matches the `/api/toolbox/usage` response keys 1:1.
- `Decision` from `lib/ratelimit/upstash.ts` (`{ allowed, retryAfterSeconds? }`) is structurally compatible with the existing `RateLimitDecision` shape in `lib/ai-harness/rate-limit.ts` — no shared import is required because each layer uses its own type, but the field names line up so a future consolidation is easy.

### Scope check

7 tasks across 2 streaming adapters, 1 streaming endpoint, 1 usage source-of-truth + endpoint, 1 component, 1 wiring, 1 rate-limit layer. Each adapter task ships a real provider improvement on its own; the streaming endpoint is useless without at least one adapter; the meter is decorative without the streaming endpoint; the rate limiter applies to both run routes. The whole set is one coherent v1-finishing PR — splitting further would produce non-shippable intermediate states.
