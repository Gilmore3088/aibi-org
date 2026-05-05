# AiBI Toolbox — Plan D: Multi-Provider Playground

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the Toolbox Playground from Anthropic-only to the locked v1 6-model menu (Anthropic + OpenAI + Google), with PII/injection scanning preserved on every provider path, and complete the provider data-handling compliance doc.

**Architecture:** The `src/lib/ai-harness/` package exposes a unified `LLMClient` interface (`chat`, `stream`) with three provider adapters. The Anthropic adapter is fully implemented; the OpenAI and Gemini adapters ship as `chat()`-throws stubs that Plan D fills in for the non-streaming path. Streaming (`stream()`) for OpenAI and Gemini is Plan E. Plan D: (1) implements `chat()` for the OpenAI and Gemini adapters; (2) generalizes `/api/toolbox/run` to dispatch by request-supplied `provider`/`model` after validating against a server-side allowlist; (3) adds a model picker to the Playground UI; (4) fills pricing rows for all 6 menu models; (5) writes the verified data-handling stance for each provider into `docs/compliance/llm-data-handling.md` and surfaces a "Last verified" link in the Playground UI.

**Tech Stack:** Next.js 14 App Router · TypeScript strict · existing `src/lib/ai-harness/` (Anthropic SDK, OpenAI SDK, `@google/generative-ai`) · existing `src/lib/sandbox/{pii-scanner,injection-filter}.ts` · existing `src/lib/ai-harness/rate-limit.ts` and `pricing.ts` · existing `src/lib/toolbox/access.ts`.

---

## Plan context (read before starting)

### What shipped in earlier plans

- **Plan A0** (`feat: foundation refactor`) — locked `/dashboard/toolbox` behind paid entitlement, paywall page, dashboard card, dashboard-namespaced routes. Created the stub `docs/compliance/llm-data-handling.md` that this plan completes.
- **Plan B** (`feat: skill kind extension`) — discriminated-union `Skill` type (`workflow | template`), kind-aware schema in `toolbox_skills`, `KindPicker` and `TemplateBuilder` components, kind-aware `buildToolboxSystemPrompt()`, kind-aware POST/PATCH on `/api/toolbox/skills`.
- **Plan C** (PR #7, merged 2026-05-04) — DB-backed Library (`toolbox_library_skills`, `toolbox_library_skill_versions`), Fork-to-Toolbox, RLS via `has_toolbox_access(uuid)` SQL function. Migrations 00018 + 00019.

### What already exists in the codebase (do not rebuild)

- **`src/lib/ai-harness/`** — the unified provider abstraction:
  - `client.ts` — `createLLMClient(provider: ProviderName): LLMClient`. Switch dispatches to one of three adapters by `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` env vars.
  - `providers/anthropic.ts` — fully implemented (`chat` and `stream`).
  - `providers/openai.ts` and `providers/gemini.ts` — **stubs**. `chat()` throws `LLMError(kind='unknown', "<provider> adapter not implemented yet")`. **Plan D fills `chat()` for both. `stream()` stays a stub — Plan E fills it.**
  - `types.ts` — `ProviderName = 'anthropic' | 'openai' | 'gemini'`. `ChatRequest` shape: `{ model, system?, messages, maxTokens, temperature? }`. `ChatResponse` shape: `{ text, stopReason, usage: { inputTokens, outputTokens } }`. `LLMError` with `kind: 'auth' | 'rate-limit' | 'invalid-request' | 'server' | 'timeout' | 'unknown'`.
  - `rate-limit.ts` — `checkRateLimit(...)` and `logUsage(...)` backed by `ai_usage_log`. Currently used by the Toolbox run route with `perLearnerDaily: 40, perCourseDailyCents: 10000`. Cost is computed via `pricing.ts → estimateCostCents()`.
  - `pricing.ts` — model-to-USD-per-1M-tokens map. Anthropic models populated; OpenAI + Gemini have a placeholder comment.
- **`src/lib/sandbox/pii-scanner.ts`** and **`src/lib/sandbox/injection-filter.ts`** — pure-TS regex scanners. Both expose `(text: string) => { safe: boolean, reason?: string }`. Already wired into `/api/toolbox/run` *before* the LLM call. Do not modify them.
- **`/api/toolbox/run/route.ts`** — 125 lines. Current shape:
  - Hard-codes `MODEL = process.env.TOOLBOX_ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'` and `createLLMClient('anthropic')`.
  - Calls `scanForPII(latestUser.content)` then `scanForInjection(latestUser.content)` — these stay; Plan D wraps the dispatcher around them, not the other way around.
  - Calls `checkRateLimit(...)` then `client.chat(...)` then `logUsage(...)` with `provider: 'anthropic'`. Plan D parameterizes `provider` and `model`.
- **`src/app/dashboard/toolbox/ToolboxApp.tsx`** — 689 lines. Has a `playground` tab (`TabId = 'guide' | 'cookbook' | 'build' | 'playground' | 'toolbox'`). The current playground panel sends `{ skill, messages }` to `/api/toolbox/run`. Plan D adds a model picker to that panel and starts sending `{ skill, messages, provider, model }`.

### What this plan does NOT do (deferred to later plans)

These belong to **Plan E** per the spec phasing reorder (decision #22):

- **Streaming responses** via Vercel AI SDK or the existing `LLMClient.stream()` path.
- **Cost-as-dollars meter** in the Playground UI (the thin "$0.31 / $0.50 today" indicator from §5.3). Cost is *recorded* today via `logUsage` — Plan D does not surface it to the learner.
- **Per-IP rate limiting** via `@upstash/ratelimit`. Per-user daily-call rate limiting via `ai_usage_log` already runs; per-IP and per-minute caps are Plan E.

Belong to **Plan F**:

- The "Save to Toolbox" capture button surfaced in course module content.

Belong to **Plan G**:

- Cookbook recipes.

Belong to a **future plan** (not D, E, F, or G — flagged here so the gap is visible):

- The richer PII safety layering from spec §5.3 — synthetic-only-mode for first N sessions, typed-confirmation gate ("no real customer data"), telemetered "send anyway" path, and the persistent disclaimer banner. Plan D wires the *existing* regex scanners onto every provider path (which means a hit returns 422 with no escape hatch — stricter than the spec's eventual UX). The "send anyway" telemetered path and the synthetic-only mode require UI work and a session/usage schema change that's out of scope for D. Open this as an issue at the end of Plan D so it doesn't fall on the floor.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Create | `src/lib/toolbox/playground-models.ts` | Single source of truth for the v1 6-model menu. Exports `PLAYGROUND_MODELS` (typed list with `id`, `provider`, `displayName`, `description`) and `isAllowedModel(provider, model)`. |
| Create | `src/lib/toolbox/playground-models.test.ts` | Asserts the 6 spec-locked models are present, exactly, no more no less. Asserts `isAllowedModel` rejects mismatched provider/model pairs. |
| Modify | `src/lib/ai-harness/providers/openai.ts` | Replace `chat()` stub with a real implementation using the official `openai` SDK. Map errors to `LLMError`. `stream()` stays a stub for Plan E. |
| Create | `src/lib/ai-harness/providers/openai.test.ts` | Mocks the `openai` SDK; asserts `chat()` returns the normalized `ChatResponse` shape and that error mapping yields the right `LLMError.kind`. |
| Modify | `src/lib/ai-harness/providers/gemini.ts` | Replace `chat()` stub using `@google/generative-ai`. Map errors to `LLMError`. `stream()` stays a stub. |
| Create | `src/lib/ai-harness/providers/gemini.test.ts` | Mocks `@google/generative-ai`; asserts `chat()` shape and error mapping. |
| Modify | `package.json` + lockfile | Add `openai` and `@google/generative-ai` runtime deps. |
| Modify | `src/lib/ai-harness/pricing.ts` | Add verified per-1M-token rates for `gpt-4o-mini`, `gpt-4o`, `gemini-2.5-flash`, `gemini-2.5-pro`. Keep existing Anthropic rows. Verified-source comment header. |
| Create | `src/lib/ai-harness/pricing.test.ts` | Asserts `estimateCostCents` returns expected (hand-computed) values for each of the 6 models on a fixed token mix. Asserts unknown model still falls back. |
| Modify | `src/app/api/toolbox/run/route.ts` | Parse `provider` + `model` from request body. Validate via `isAllowedModel`. Dispatch via `createLLMClient(provider)`. Pass `provider` + `model` through to `logUsage`. PII + injection scans unchanged and still pre-LLM. |
| Create | `src/app/api/toolbox/run/route.test.ts` | Unit tests with mocked `createLLMClient` and mocked `getPaidToolboxAccess`: rejects unknown provider, rejects mismatched provider/model, dispatches to the correct adapter, calls PII + injection scans before the LLM call, calls `logUsage` with the correct provider/model on success and on error. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` | Add a `<ModelPicker>` component to the Playground panel. State holds the selected `{ provider, model }`; defaults to Anthropic Sonnet. Send selection in the POST body to `/api/toolbox/run`. |
| Create | `src/app/dashboard/toolbox/_components/ModelPicker.tsx` | Controlled component. Lists the 6 models grouped by provider. Renders a "Last verified [date] — provider stance" link to `/compliance/llm-data-handling` (or the doc on GitHub) per spec §5.3a. Accessibility: `<label>`, `<select>`, focus ring, keyboard navigable. |
| Modify | `docs/compliance/llm-data-handling.md` | Replace `_to be filled by Plan D_` placeholders with verified per-provider stance: tier in use, last-verified date (set to the merge date of Plan D), provider terms URL, stance summary. Note quarterly review cadence and the named owner. |
| Create | `docs/compliance/.review-reminder` | Plain-text file recording the next quarterly review date. Existence + presence of an ISO date is asserted by a small script in CI later (not in Plan D — flagged as a follow-up). |

---

## Tasks

### Task 1: Lock the v1 model menu

**Files:**
- Create: `src/lib/toolbox/playground-models.ts`
- Test: `src/lib/toolbox/playground-models.test.ts`

The spec §5.3 locks the v1 menu to exactly six models. This task creates a single, authoritative server-and-client list so the API allowlist and the UI picker can never drift out of sync.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/toolbox/playground-models.test.ts
import { describe, expect, it } from 'vitest';
import { PLAYGROUND_MODELS, isAllowedModel } from './playground-models';

describe('PLAYGROUND_MODELS', () => {
  it('contains exactly the six v1 spec-locked models', () => {
    const ids = PLAYGROUND_MODELS.map((m) => m.id).sort();
    expect(ids).toEqual([
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-6',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gpt-4o',
      'gpt-4o-mini',
    ]);
  });

  it('groups by the three providers', () => {
    const providers = new Set(PLAYGROUND_MODELS.map((m) => m.provider));
    expect(providers).toEqual(new Set(['anthropic', 'openai', 'gemini']));
  });

  it('every entry has a non-empty displayName and description', () => {
    for (const m of PLAYGROUND_MODELS) {
      expect(m.displayName.length).toBeGreaterThan(0);
      expect(m.description.length).toBeGreaterThan(0);
    }
  });
});

describe('isAllowedModel', () => {
  it('accepts a valid provider + model pair', () => {
    expect(isAllowedModel('anthropic', 'claude-sonnet-4-6')).toBe(true);
    expect(isAllowedModel('openai', 'gpt-4o-mini')).toBe(true);
    expect(isAllowedModel('gemini', 'gemini-2.5-flash')).toBe(true);
  });

  it('rejects a model from a different provider', () => {
    expect(isAllowedModel('anthropic', 'gpt-4o')).toBe(false);
    expect(isAllowedModel('openai', 'gemini-2.5-pro')).toBe(false);
  });

  it('rejects unknown providers and models', () => {
    expect(isAllowedModel('mistral' as 'anthropic', 'claude-sonnet-4-6')).toBe(false);
    expect(isAllowedModel('anthropic', 'claude-opus-4-6')).toBe(false); // not on v1 menu
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/toolbox/playground-models.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Create the module**

```typescript
// src/lib/toolbox/playground-models.ts
import type { ProviderName } from '@/lib/ai-harness/types';

export interface PlaygroundModel {
  readonly id: string;            // sent to the provider SDK exactly as written
  readonly provider: ProviderName;
  readonly displayName: string;   // shown in the picker
  readonly description: string;   // one-line guidance shown next to the picker
}

// v1 menu locked by spec §5.3. Adding a model is a deliberate, sourced
// change — update this list, update src/lib/ai-harness/pricing.ts, and
// update docs/compliance/llm-data-handling.md if the provider stance
// shifts. Opus is intentionally absent (cost).
export const PLAYGROUND_MODELS: readonly PlaygroundModel[] = [
  {
    id: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    displayName: 'Claude Haiku 4.5',
    description: 'Fast, low-cost. Good for quick drafts and short prompts.',
  },
  {
    id: 'claude-sonnet-4-6',
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4.6',
    description: 'Balanced quality. Default for analytical work.',
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o mini',
    description: 'OpenAI low-cost tier. Compare with Claude Haiku.',
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    description: 'OpenAI mid tier. Compare with Claude Sonnet.',
  },
  {
    id: 'gemini-2.5-flash',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash',
    description: 'Google low-cost tier. Compare with Haiku and 4o-mini.',
  },
  {
    id: 'gemini-2.5-pro',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Pro',
    description: 'Google mid tier. Compare with Sonnet and 4o.',
  },
];

export function isAllowedModel(provider: string, model: string): boolean {
  return PLAYGROUND_MODELS.some((m) => m.provider === provider && m.id === model);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/toolbox/playground-models.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/toolbox/playground-models.ts src/lib/toolbox/playground-models.test.ts
git commit -m "feat(toolbox): lock v1 6-model Playground menu"
```

---

### Task 2: Install OpenAI and Gemini SDKs

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install openai @google/generative-ai
```

- [ ] **Step 2: Verify install**

```bash
node -e "console.log(require('openai').OpenAI ? 'ok' : 'missing')"
node -e "console.log(require('@google/generative-ai').GoogleGenerativeAI ? 'ok' : 'missing')"
```

Expected: both print `ok`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add openai + @google/generative-ai for Toolbox Playground"
```

---

### Task 3: Implement OpenAI `chat()` adapter

**Files:**
- Modify: `src/lib/ai-harness/providers/openai.ts`
- Create: `src/lib/ai-harness/providers/openai.test.ts`

The current adapter has `chat()` and `stream()` as stubs that throw `LLMError(kind='unknown', "OpenAI adapter not implemented yet")`. Plan D fills `chat()`. `stream()` remains a stub — Plan E implements it.

The OpenAI Chat Completions API uses a `messages` array with `role: 'system' | 'user' | 'assistant' | 'developer'`. The unified `ChatRequest` separates `system` from `messages`; the adapter prepends a `{ role: 'system', content: req.system }` entry when `req.system` is present.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai-harness/providers/openai.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: createMock } },
  })),
}));

import { createOpenAIClient } from './openai';
import { LLMError } from '../types';

describe('createOpenAIClient', () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('returns normalized ChatResponse on success', async () => {
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: 'hello world' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 12, completion_tokens: 8 },
    });
    const client = createOpenAIClient('test-key');
    const res = await client.chat({
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(res.text).toBe('hello world');
    expect(res.stopReason).toBe('end_turn');
    expect(res.usage.inputTokens).toBe(12);
    expect(res.usage.outputTokens).toBe(8);
  });

  it('prepends system as a system message when provided', async () => {
    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1 },
    });
    const client = createOpenAIClient('test-key');
    await client.chat({
      model: 'gpt-4o-mini',
      maxTokens: 100,
      system: 'You are a helpful banker.',
      messages: [{ role: 'user', content: 'hi' }],
    });
    const callArg = createMock.mock.calls[0][0];
    expect(callArg.messages[0]).toEqual({ role: 'system', content: 'You are a helpful banker.' });
    expect(callArg.messages[1]).toEqual({ role: 'user', content: 'hi' });
  });

  it('maps 401 to LLMError(kind=auth)', async () => {
    createMock.mockRejectedValueOnce({ status: 401, message: 'bad key' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'auth', provider: 'openai' });
  });

  it('maps 429 to LLMError(kind=rate-limit, retryable=true)', async () => {
    createMock.mockRejectedValueOnce({ status: 429, message: 'too many' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'rate-limit', retryable: true });
  });

  it('maps 5xx to LLMError(kind=server, retryable=true)', async () => {
    createMock.mockRejectedValueOnce({ status: 503, message: 'bad gateway' });
    const client = createOpenAIClient('test-key');
    await expect(client.chat({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'server', retryable: true });
  });

  it('stream() still throws (Plan E)', async () => {
    const client = createOpenAIClient('test-key');
    const it = client.stream({ model: 'gpt-4o', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] });
    await expect((async () => { for await (const _ of it) { /* drain */ } })()).rejects.toBeInstanceOf(LLMError);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai-harness/providers/openai.test.ts`
Expected: FAIL on the success and error-mapping cases (current adapter throws `'OpenAI adapter not implemented yet'`).

- [ ] **Step 3: Implement the adapter**

Replace the contents of `src/lib/ai-harness/providers/openai.ts`:

```typescript
import { OpenAI } from 'openai';
import type { LLMClient, ChatRequest, ChatResponse, StopReason } from '../types';
import { LLMError } from '../types';

function mapStopReason(raw: string | null | undefined): StopReason {
  switch (raw) {
    case 'stop': return 'end_turn';
    case 'length': return 'max_tokens';
    case 'content_filter': return 'stop_sequence';
    case 'tool_calls': return 'tool_use';
    default: return 'end_turn';
  }
}

function toLLMError(err: unknown): LLMError {
  const anyErr = err as { status?: number; message?: string };
  if (anyErr?.status === 401)
    return new LLMError('openai', 'auth', anyErr.message ?? 'auth failed', false, err);
  if (anyErr?.status === 429)
    return new LLMError('openai', 'rate-limit', anyErr.message ?? 'rate limited', true, err);
  if (anyErr?.status === 400)
    return new LLMError('openai', 'invalid-request', anyErr.message ?? 'bad request', false, err);
  if (anyErr?.status && anyErr.status >= 500)
    return new LLMError('openai', 'server', anyErr.message ?? 'server error', true, err);
  return new LLMError('openai', 'unknown', anyErr?.message ?? 'unknown error', false, err);
}

export function createOpenAIClient(apiKey: string): LLMClient {
  const client = new OpenAI({ apiKey });

  return {
    name: 'openai',

    async chat(req: ChatRequest): Promise<ChatResponse> {
      try {
        const messages = req.system
          ? [{ role: 'system' as const, content: req.system }, ...req.messages.map((m) => ({ role: m.role, content: m.content }))]
          : req.messages.map((m) => ({ role: m.role, content: m.content }));

        const resp = await client.chat.completions.create({
          model: req.model,
          messages,
          max_tokens: req.maxTokens,
          temperature: req.temperature,
        });

        const choice = resp.choices[0];
        const text = choice?.message?.content ?? '';
        return {
          text,
          stopReason: mapStopReason(choice?.finish_reason),
          usage: {
            inputTokens: resp.usage?.prompt_tokens ?? 0,
            outputTokens: resp.usage?.completion_tokens ?? 0,
          },
          providerRaw: resp,
        };
      } catch (err) {
        throw toLLMError(err);
      }
    },

    async *stream(): AsyncIterable<never> {
      // Plan E fills this in.
      throw new LLMError('openai', 'unknown', 'OpenAI streaming not implemented yet (Plan E)', false);
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai-harness/providers/openai.test.ts`
Expected: PASS (all six cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-harness/providers/openai.ts src/lib/ai-harness/providers/openai.test.ts
git commit -m "feat(ai-harness): implement OpenAI chat() adapter

Maps OpenAI Chat Completions to the unified ChatResponse shape; system
prompt prepended as a system message; HTTP status -> LLMError.kind
mapping. Streaming stays stubbed for Plan E."
```

---

### Task 4: Implement Gemini `chat()` adapter

**Files:**
- Modify: `src/lib/ai-harness/providers/gemini.ts`
- Create: `src/lib/ai-harness/providers/gemini.test.ts`

The Gemini API uses `GoogleGenerativeAI` → `getGenerativeModel({ model, systemInstruction })` → `generateContent({ contents })`. `contents` items use roles `'user'` and `'model'` (not `'assistant'`). The adapter maps `assistant` → `model` on the way in.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai-harness/providers/gemini.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContentMock = vi.fn();
const getGenerativeModelMock = vi.fn(() => ({ generateContent: generateContentMock }));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: getGenerativeModelMock,
  })),
}));

import { createGeminiClient } from './gemini';
import { LLMError } from '../types';

describe('createGeminiClient', () => {
  beforeEach(() => {
    generateContentMock.mockReset();
    getGenerativeModelMock.mockClear();
  });

  it('returns normalized ChatResponse on success', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: {
        text: () => 'hello from gemini',
        candidates: [{ finishReason: 'STOP' }],
        usageMetadata: { promptTokenCount: 7, candidatesTokenCount: 4 },
      },
    });
    const client = createGeminiClient('test-key');
    const res = await client.chat({
      model: 'gemini-2.5-flash',
      maxTokens: 1000,
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(res.text).toBe('hello from gemini');
    expect(res.stopReason).toBe('end_turn');
    expect(res.usage.inputTokens).toBe(7);
    expect(res.usage.outputTokens).toBe(4);
  });

  it('passes system prompt as systemInstruction', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => 'ok', candidates: [{ finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 } },
    });
    const client = createGeminiClient('test-key');
    await client.chat({
      model: 'gemini-2.5-pro',
      maxTokens: 100,
      system: 'You are a helpful banker.',
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(getGenerativeModelMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-2.5-pro', systemInstruction: 'You are a helpful banker.' }),
    );
  });

  it('maps assistant role to "model" in contents', async () => {
    generateContentMock.mockResolvedValueOnce({
      response: { text: () => 'ok', candidates: [{ finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 } },
    });
    const client = createGeminiClient('test-key');
    await client.chat({
      model: 'gemini-2.5-flash',
      maxTokens: 100,
      messages: [
        { role: 'user', content: 'q1' },
        { role: 'assistant', content: 'a1' },
        { role: 'user', content: 'q2' },
      ],
    });
    const arg = generateContentMock.mock.calls[0][0];
    expect(arg.contents[1].role).toBe('model');
    expect(arg.contents[1].parts[0].text).toBe('a1');
  });

  it('maps 401-style errors to LLMError(kind=auth)', async () => {
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('API key not valid'), { status: 401 }));
    const client = createGeminiClient('test-key');
    await expect(client.chat({ model: 'gemini-2.5-flash', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'auth', provider: 'gemini' });
  });

  it('maps 429-style errors to LLMError(kind=rate-limit, retryable=true)', async () => {
    generateContentMock.mockRejectedValueOnce(Object.assign(new Error('quota exceeded'), { status: 429 }));
    const client = createGeminiClient('test-key');
    await expect(client.chat({ model: 'gemini-2.5-flash', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] }))
      .rejects.toMatchObject({ kind: 'rate-limit', retryable: true });
  });

  it('stream() still throws (Plan E)', async () => {
    const client = createGeminiClient('test-key');
    const it = client.stream({ model: 'gemini-2.5-flash', maxTokens: 10, messages: [{ role: 'user', content: 'x' }] });
    await expect((async () => { for await (const _ of it) { /* drain */ } })()).rejects.toBeInstanceOf(LLMError);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai-harness/providers/gemini.test.ts`
Expected: FAIL — current adapter throws `'Gemini adapter not implemented yet'`.

- [ ] **Step 3: Implement the adapter**

Replace `src/lib/ai-harness/providers/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMClient, ChatRequest, ChatResponse, StopReason } from '../types';
import { LLMError } from '../types';

function mapStopReason(raw: string | undefined): StopReason {
  switch (raw) {
    case 'STOP': return 'end_turn';
    case 'MAX_TOKENS': return 'max_tokens';
    case 'SAFETY':
    case 'RECITATION':
      return 'stop_sequence';
    default: return 'end_turn';
  }
}

function toLLMError(err: unknown): LLMError {
  const anyErr = err as { status?: number; message?: string };
  const message = anyErr?.message ?? 'unknown error';
  if (anyErr?.status === 401 || /api key/i.test(message))
    return new LLMError('gemini', 'auth', message, false, err);
  if (anyErr?.status === 429 || /quota/i.test(message))
    return new LLMError('gemini', 'rate-limit', message, true, err);
  if (anyErr?.status === 400)
    return new LLMError('gemini', 'invalid-request', message, false, err);
  if (anyErr?.status && anyErr.status >= 500)
    return new LLMError('gemini', 'server', message, true, err);
  return new LLMError('gemini', 'unknown', message, false, err);
}

export function createGeminiClient(apiKey: string): LLMClient {
  const genAI = new GoogleGenerativeAI(apiKey);

  return {
    name: 'gemini',

    async chat(req: ChatRequest): Promise<ChatResponse> {
      try {
        const model = genAI.getGenerativeModel({
          model: req.model,
          systemInstruction: req.system,
        });

        const contents = req.messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const result = await model.generateContent({
          contents,
          generationConfig: {
            maxOutputTokens: req.maxTokens,
            temperature: req.temperature,
          },
        });

        const response = result.response;
        const text = response.text();
        const finishReason = response.candidates?.[0]?.finishReason;
        const usage = response.usageMetadata;

        return {
          text,
          stopReason: mapStopReason(finishReason),
          usage: {
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
          },
          providerRaw: response,
        };
      } catch (err) {
        throw toLLMError(err);
      }
    },

    async *stream(): AsyncIterable<never> {
      // Plan E fills this in.
      throw new LLMError('gemini', 'unknown', 'Gemini streaming not implemented yet (Plan E)', false);
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai-harness/providers/gemini.test.ts`
Expected: PASS (all six cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-harness/providers/gemini.ts src/lib/ai-harness/providers/gemini.test.ts
git commit -m "feat(ai-harness): implement Gemini chat() adapter

Maps generateContent() to the unified ChatResponse; assistant role -> 'model';
system prompt -> systemInstruction; finish reason + usageMetadata mapped.
Streaming stays stubbed for Plan E."
```

---

### Task 5: Verified pricing for the 6 menu models

**Files:**
- Modify: `src/lib/ai-harness/pricing.ts`
- Test: `src/lib/ai-harness/pricing.test.ts`

`pricing.ts` already has Anthropic rows. The "OpenAI + Gemini placeholders" comment is the gap. Plan D fills these with verified rates so cost logging via `logUsage` is accurate from the moment a learner picks GPT-4o or Gemini.

**Source verification (record in the file header comment):** Each rate must be cited from the provider's published pricing page. Use these URLs and update the Last-Verified dates in the file header to match Plan D's merge date:
- Anthropic: https://www.anthropic.com/pricing
- OpenAI: https://openai.com/api/pricing
- Google: https://ai.google.dev/pricing

If a rate cannot be verified within a reasonable window (e.g., page restructure), STOP and surface the gap — do not guess a rate.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai-harness/pricing.test.ts
import { describe, expect, it } from 'vitest';
import { estimateCostCents } from './pricing';

// Hand-computed expectations for a fixed 1000-input / 800-output mix.
// Update if pricing changes — the point of this test is to lock the
// pricing.ts table so silent edits cause loud test failures.
describe('estimateCostCents', () => {
  const mix = { inputTokens: 1000, outputTokens: 800 };

  it('prices Claude Haiku 4.5 correctly', () => {
    // 0.80 * 0.001 + 4 * 0.0008 = 0.0008 + 0.0032 = 0.0040 USD = 0.40 cents → ceil to 1
    expect(estimateCostCents({ provider: 'anthropic', model: 'claude-haiku-4-5-20251001', ...mix })).toBe(1);
  });

  it('prices Claude Sonnet 4.6 correctly', () => {
    // 3 * 0.001 + 15 * 0.0008 = 0.003 + 0.012 = 0.015 USD = 1.5 cents → ceil to 2
    expect(estimateCostCents({ provider: 'anthropic', model: 'claude-sonnet-4-6', ...mix })).toBe(2);
  });

  it('prices GPT-4o-mini correctly', () => {
    // 0.15 * 0.001 + 0.60 * 0.0008 = 0.00015 + 0.00048 = 0.00063 USD = 0.063 cents → ceil to 1
    expect(estimateCostCents({ provider: 'openai', model: 'gpt-4o-mini', ...mix })).toBe(1);
  });

  it('prices GPT-4o correctly', () => {
    // 2.50 * 0.001 + 10.00 * 0.0008 = 0.0025 + 0.008 = 0.0105 USD = 1.05 cents → ceil to 2
    expect(estimateCostCents({ provider: 'openai', model: 'gpt-4o', ...mix })).toBe(2);
  });

  it('prices Gemini 2.5 Flash correctly', () => {
    // 0.30 * 0.001 + 2.50 * 0.0008 = 0.0003 + 0.002 = 0.0023 USD = 0.23 cents → ceil to 1
    expect(estimateCostCents({ provider: 'gemini', model: 'gemini-2.5-flash', ...mix })).toBe(1);
  });

  it('prices Gemini 2.5 Pro correctly', () => {
    // 1.25 * 0.001 + 10.00 * 0.0008 = 0.00125 + 0.008 = 0.00925 USD = 0.93 cents → ceil to 1
    expect(estimateCostCents({ provider: 'gemini', model: 'gemini-2.5-pro', ...mix })).toBe(1);
  });

  it('falls back for unknown models', () => {
    // FALLBACK is opus-tier 15/75 → still > 0
    const result = estimateCostCents({ provider: 'anthropic', model: 'unknown-model', ...mix });
    expect(result).toBeGreaterThan(0);
  });
});
```

> **Note:** the hand-computed cents above use rates *as published on the provider pages at time of writing this plan*. If the verified rate at execution time differs, update both the `pricing.ts` table AND the expected cents in the test in the same commit — the test is a tripwire, not a target.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/ai-harness/pricing.test.ts`
Expected: FAIL — OpenAI + Gemini rows missing from the PRICING map (FALLBACK_PRICE returns the Opus-tier cents, not the expected per-model cents).

- [ ] **Step 3: Open each pricing page in a browser, verify rates, and update `pricing.ts`**

Replace the placeholder comment block. The header comment must record the verified-on date and source URL for each provider:

```typescript
// Model pricing (USD per 1M tokens). Manually maintained.
//
// Last verified: 2026-05-04 (set this to Plan D's merge date)
//   Anthropic: https://www.anthropic.com/pricing
//   OpenAI:    https://openai.com/api/pricing
//   Google:    https://ai.google.dev/pricing
//
// Review cadence: every quarter, alongside docs/compliance/llm-data-handling.md.

import type { ProviderName } from './types';

interface ModelPrice {
  readonly inputPerM: number;
  readonly outputPerM: number;
}

type _ProviderName = ProviderName;

const PRICING: Record<string, ModelPrice> = {
  // Anthropic
  'claude-opus-4-6':              { inputPerM: 15,   outputPerM: 75 },
  'claude-sonnet-4-6':            { inputPerM: 3,    outputPerM: 15 },
  'claude-haiku-4-5-20251001':    { inputPerM: 0.80, outputPerM: 4  },

  // OpenAI (verified 2026-05-04)
  'gpt-4o':                       { inputPerM: 2.50, outputPerM: 10.00 },
  'gpt-4o-mini':                  { inputPerM: 0.15, outputPerM: 0.60 },

  // Google (verified 2026-05-04)
  'gemini-2.5-flash':             { inputPerM: 0.30, outputPerM: 2.50 },
  'gemini-2.5-pro':               { inputPerM: 1.25, outputPerM: 10.00 },
};

const FALLBACK_PRICE: ModelPrice = { inputPerM: 15, outputPerM: 75 };

// estimateCostCents implementation unchanged from the existing file.
```

> If the verified rate is different from the table above on the day Plan D runs, update the table AND the Step 1 test expectations in the same commit — and call it out in the commit body.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/ai-harness/pricing.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai-harness/pricing.ts src/lib/ai-harness/pricing.test.ts
git commit -m "feat(toolbox): verified pricing for OpenAI + Gemini Playground models

Verified 2026-05-04 against provider pricing pages. Locks rates with a
hand-computed cents-per-call test as a tripwire for silent edits."
```

---

### Task 6: Generalize `/api/toolbox/run` to dispatch by provider + model

**Files:**
- Modify: `src/app/api/toolbox/run/route.ts`
- Create: `src/app/api/toolbox/run/route.test.ts`

The current route hard-codes `createLLMClient('anthropic')` and `process.env.TOOLBOX_ANTHROPIC_MODEL`. Plan D parses `provider` + `model` from the request body, validates the pair via `isAllowedModel`, and dispatches accordingly. PII and injection scans, paid-access gate, rate-limit check, and `logUsage` calls all remain in place — only the dispatcher and the values logged change.

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/api/toolbox/run/route.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

// Mocks
vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'user-test' })),
}));
vi.mock('@/lib/sandbox/pii-scanner', () => ({
  scanForPII: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/sandbox/injection-filter', () => ({
  scanForInjection: vi.fn(() => ({ safe: true })),
}));
vi.mock('@/lib/ai-harness/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  logUsage: vi.fn(async () => {}),
}));

const chatMock = vi.fn();
vi.mock('@/lib/ai-harness/client', () => ({
  createLLMClient: vi.fn((provider: string) => ({
    name: provider,
    chat: chatMock,
    stream: vi.fn(),
  })),
}));

import { createLLMClient } from '@/lib/ai-harness/client';
import { logUsage } from '@/lib/ai-harness/rate-limit';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { scanForInjection } from '@/lib/sandbox/injection-filter';

const minimalSkill = { kind: 'workflow', cmd: '/x', name: 'x' };
const messages = [{ role: 'user', content: 'hello' }];

function reqBody(body: unknown): Request {
  return new Request('http://localhost/api/toolbox/run', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  chatMock.mockResolvedValue({
    text: 'hi',
    stopReason: 'end_turn',
    usage: { inputTokens: 10, outputTokens: 5 },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/toolbox/run dispatcher', () => {
  it('rejects when provider is missing', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, model: 'claude-sonnet-4-6' }));
    expect(res.status).toBe(400);
  });

  it('rejects an unknown provider', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'mistral', model: 'foo' }));
    expect(res.status).toBe(400);
  });

  it('rejects a model not on the v1 menu', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'anthropic', model: 'claude-opus-4-6' }));
    expect(res.status).toBe(400);
  });

  it('rejects a mismatched provider/model pair', async () => {
    const res = await POST(reqBody({ skill: minimalSkill, messages, provider: 'anthropic', model: 'gpt-4o' }));
    expect(res.status).toBe(400);
  });

  it('runs PII and injection scans BEFORE the LLM call', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o-mini' }));
    expect(scanForPII).toHaveBeenCalled();
    expect(scanForInjection).toHaveBeenCalled();
    // Both scanners must have been called before chatMock
    expect(chatMock).toHaveBeenCalled();
    const piiCallOrder = (scanForPII as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const chatCallOrder = chatMock.mock.invocationCallOrder[0];
    expect(piiCallOrder).toBeLessThan(chatCallOrder);
  });

  it('dispatches to OpenAI when provider=openai', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o-mini' }));
    expect(createLLMClient).toHaveBeenCalledWith('openai');
  });

  it('dispatches to Gemini when provider=gemini', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'gemini', model: 'gemini-2.5-flash' }));
    expect(createLLMClient).toHaveBeenCalledWith('gemini');
  });

  it('logs the chosen provider and model on success', async () => {
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'openai', model: 'gpt-4o' }));
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'openai', model: 'gpt-4o', status: 'succeeded' }),
    );
  });

  it('logs the chosen provider and model on error', async () => {
    chatMock.mockRejectedValueOnce(new Error('boom'));
    await POST(reqBody({ skill: minimalSkill, messages, provider: 'gemini', model: 'gemini-2.5-pro' }));
    expect(logUsage).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'gemini', model: 'gemini-2.5-pro', status: 'errored' }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/toolbox/run/route.test.ts`
Expected: FAIL — current route ignores `provider`/`model` from body and always dispatches Anthropic/Sonnet.

- [ ] **Step 3: Modify the route**

Replace `src/app/api/toolbox/run/route.ts` with this shape (keep all existing scan/access/rate-limit logic; only the dispatch and validation change):

```typescript
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
      provider,
      model,
      status: 'rate-limited',
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
    });

    return NextResponse.json(
      { error: 'The selected model is temporarily unavailable. Please try again or pick another model.' },
      { status: error instanceof LLMError && error.kind === 'rate-limit' ? 429 : 500 },
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/toolbox/run/route.test.ts`
Expected: PASS (all 9 cases).

Then run the full test suite to confirm nothing else regressed:

Run: `npx vitest run`
Expected: all previously-passing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/toolbox/run/route.ts src/app/api/toolbox/run/route.test.ts
git commit -m "feat(toolbox): provider+model dispatch on /api/toolbox/run

Generalizes from hard-coded Anthropic Sonnet to the v1 6-model menu.
Validates against the playground-models allowlist; rejects unknown
providers, off-menu models, and mismatched pairs. PII + injection
scanning unchanged and still pre-LLM. logUsage records the actual
provider/model on success and error."
```

---

### Task 7: ModelPicker component

**Files:**
- Create: `src/app/dashboard/toolbox/_components/ModelPicker.tsx`
- Test: `src/app/dashboard/toolbox/_components/ModelPicker.test.tsx`

A controlled component that surfaces the 6-model menu, grouped by provider, with a "Last verified · provider stance" link to the compliance doc. Accessible by default (label, focus ring, keyboard nav).

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/dashboard/toolbox/_components/ModelPicker.test.tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelPicker } from './ModelPicker';

describe('ModelPicker', () => {
  it('renders the six v1 models grouped by provider', () => {
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={() => {}} />);
    const select = screen.getByLabelText(/model/i) as HTMLSelectElement;
    // 6 options + 3 optgroups
    expect(select.querySelectorAll('option')).toHaveLength(6);
    expect(select.querySelectorAll('optgroup')).toHaveLength(3);
  });

  it('reflects the controlled value', () => {
    render(<ModelPicker value={{ provider: 'openai', model: 'gpt-4o' }} onChange={() => {}} />);
    const select = screen.getByLabelText(/model/i) as HTMLSelectElement;
    expect(select.value).toBe('openai::gpt-4o');
  });

  it('calls onChange with the new {provider, model} when selection changes', () => {
    const onChange = vi.fn();
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'gemini::gemini-2.5-flash' } });
    expect(onChange).toHaveBeenCalledWith({ provider: 'gemini', model: 'gemini-2.5-flash' });
  });

  it('renders a Last-verified compliance link', () => {
    render(<ModelPicker value={{ provider: 'anthropic', model: 'claude-sonnet-4-6' }} onChange={() => {}} />);
    expect(screen.getByText(/last verified/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/dashboard/toolbox/_components/ModelPicker.test.tsx`
Expected: FAIL — component does not exist.

- [ ] **Step 3: Create the component**

```tsx
// src/app/dashboard/toolbox/_components/ModelPicker.tsx
'use client';

import { PLAYGROUND_MODELS } from '@/lib/toolbox/playground-models';
import type { ProviderName } from '@/lib/ai-harness/types';

const COMPLIANCE_DOC_URL =
  'https://github.com/Gilmore3088/aibi-org/blob/main/docs/compliance/llm-data-handling.md';

// Set this in lockstep with docs/compliance/llm-data-handling.md.
const STANCE_LAST_VERIFIED = '2026-05-04';

const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Google',
};

export interface ModelSelection {
  readonly provider: ProviderName;
  readonly model: string;
}

interface Props {
  readonly value: ModelSelection;
  readonly onChange: (next: ModelSelection) => void;
  readonly disabled?: boolean;
}

export function ModelPicker({ value, onChange, disabled }: Props) {
  const grouped = (['anthropic', 'openai', 'gemini'] as const).map((p) => ({
    provider: p,
    label: PROVIDER_LABELS[p],
    options: PLAYGROUND_MODELS.filter((m) => m.provider === p),
  }));

  const compositeValue = `${value.provider}::${value.model}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="toolbox-model-picker" className="text-sm font-medium text-ink">
        Model
      </label>
      <select
        id="toolbox-model-picker"
        className="border border-ink/20 rounded px-3 py-2 bg-linen text-ink focus:outline-none focus:ring-2 focus:ring-terra"
        value={compositeValue}
        disabled={disabled}
        onChange={(e) => {
          const [provider, model] = e.target.value.split('::') as [ProviderName, string];
          onChange({ provider, model });
        }}
      >
        {grouped.map((g) => (
          <optgroup key={g.provider} label={g.label}>
            {g.options.map((m) => (
              <option key={m.id} value={`${m.provider}::${m.id}`}>
                {m.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="text-xs text-ink/70">
        Last verified {STANCE_LAST_VERIFIED} —{' '}
        <a className="underline" href={COMPLIANCE_DOC_URL} target="_blank" rel="noreferrer">
          provider data-handling stance
        </a>
        .
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/dashboard/toolbox/_components/ModelPicker.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/toolbox/_components/ModelPicker.tsx src/app/dashboard/toolbox/_components/ModelPicker.test.tsx
git commit -m "feat(toolbox): ModelPicker component for Playground"
```

---

### Task 8: Wire the ModelPicker into the Playground tab

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx`

The Playground tab currently sends `{ skill, messages }` to `/api/toolbox/run`. After Task 3, the API requires `provider` + `model` too. This task adds local state for the selection (default Anthropic Sonnet 4.6 to match the prior behavior) and includes the selection in the POST body.

- [ ] **Step 1: Find the playground panel and the run-fetch site**

Search inside `ToolboxApp.tsx` for the call to `'/api/toolbox/run'`. Note the surrounding state (`messages`, `setMessages`) and the JSX that renders the playground panel. The smallest patch strategy:

1. Add new state `const [modelSelection, setModelSelection] = useState<ModelSelection>({ provider: 'anthropic', model: 'claude-sonnet-4-6' });` near the top of the playground-related state block.
2. Render `<ModelPicker value={modelSelection} onChange={setModelSelection} disabled={isStreaming} />` above the chat input area in the playground panel (a sensible spot is just above where the input textarea is rendered).
3. Update the fetch body to include `provider: modelSelection.provider, model: modelSelection.model`.

If the file has been refactored such that the playground is in a different component, apply the same change there instead.

- [ ] **Step 2: Make the patch**

At the top of the file, add the import:

```tsx
import { ModelPicker, type ModelSelection } from './_components/ModelPicker';
```

In the component's state block (near the other playground-related `useState` calls), add:

```tsx
const [modelSelection, setModelSelection] = useState<ModelSelection>({
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
});
```

Find the existing fetch and update it. The current shape is approximately:

```tsx
const res = await fetch('/api/toolbox/run', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ skill: activeSkill, messages: nextMessages }),
});
```

Change to:

```tsx
const res = await fetch('/api/toolbox/run', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    skill: activeSkill,
    messages: nextMessages,
    provider: modelSelection.provider,
    model: modelSelection.model,
  }),
});
```

In the playground panel JSX, immediately above the input textarea, add:

```tsx
<ModelPicker
  value={modelSelection}
  onChange={setModelSelection}
  disabled={isStreaming /* or whatever the existing busy flag is named */}
/>
```

- [ ] **Step 3: Type check + smoke test**

Run: `npx tsc --noEmit`
Expected: zero errors.

Run: `npm run dev` and load `/dashboard/toolbox`. As a paid user, navigate to the Playground tab and verify:
1. Model picker is visible above the input.
2. Default selection is "Claude Sonnet 4.6" under Anthropic.
3. Sending a message at the default model returns a response.
4. Switching to "GPT-4o mini" and sending a message returns an OpenAI response (check response shape in the network tab).
5. Switching to "Gemini 2.5 Flash" and sending returns a Gemini response.
6. The "Last verified" link points to `docs/compliance/llm-data-handling.md`.

If `OPENAI_API_KEY` or `GEMINI_API_KEY` is unset locally, the request returns 500 with `LLMError(kind='auth')`. Document this; do not silently skip the verification.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): wire ModelPicker into Playground request path"
```

---

### Task 9: Fill the provider data-handling compliance doc

**Files:**
- Modify: `docs/compliance/llm-data-handling.md`

Replace every `_to be filled by Plan D_` placeholder with the verified stance. The wording must match spec §5.3a's audit-grade pattern: tier in use, last verified, provider terms link, stance summary. Set last-verified dates to Plan D's merge date (the same date used in `pricing.ts` and `ModelPicker.tsx`).

- [ ] **Step 1: Verify each provider's terms**

Open each provider's terms page in a browser and read the relevant section on data handling for paid API tiers. Capture the exact URL of the section that supports the stance — not a marketing page. Today's expected sources:

- **Anthropic Commercial Terms of Service** — `https://www.anthropic.com/legal/commercial-terms` (and the privacy policy for "Inputs and Outputs"). Confirms paid API does not train on customer prompts/completions by default.
- **OpenAI API Data Usage Policies** — `https://openai.com/policies/api-data-usage-policies/` (or successor URL). Confirms post-March 2023 default: API inputs are not used to train models.
- **Google Gemini API additional terms** — `https://ai.google.dev/gemini-api/terms` for the paid tier. Confirms paid-tier prompts are not used to improve the model. (The free tier has different terms — flag explicitly in the doc.)

If any provider has changed terms such that the stance no longer holds, STOP — surface this to the user before continuing. The Toolbox should not ship with an inaccurate compliance claim.

- [ ] **Step 2: Replace the file contents**

```markdown
# LLM Data Handling — Provider Stance

**Status:** Filled by Plan D, 2026-05-04.

This document is the audit trail for §5.3a of the AiBI Toolbox design spec
(`docs/superpowers/specs/2026-04-29-aibi-toolbox-design.md`). It records
the data-handling stance of each LLM provider used in the AiBI Toolbox
Playground, on the specific API tier in use, with a verification date and
link to the provider's published terms.

**Review cadence:** quarterly, by the engineering owner. Each review
either re-confirms the stance (and updates the "Last verified" date) or
files an issue if the terms have changed. Next review due: 2026-08-04.

**Owner:** James Gilmore (`@Gilmore3088`).

---

## Anthropic
- **Tier in use:** Commercial API (paid, default).
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://www.anthropic.com/legal/commercial-terms (data handling clauses) and https://www.anthropic.com/legal/privacy (Inputs and Outputs section).
- **Stance:** Anthropic does not train on customer prompts or completions submitted via the paid Commercial API by default. Customer Inputs and Outputs are processed solely to provide the API service. No opt-in to model training is configured for the AiBI Toolbox.

## OpenAI
- **Tier in use:** OpenAI API (paid, post-March 2023 default).
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://openai.com/policies/api-data-usage-policies/ and https://openai.com/policies/business-terms/.
- **Stance:** As of OpenAI's March 2023 policy update, API inputs and outputs are not used to train OpenAI models by default. The AiBI Toolbox does not opt in to data sharing for model improvement. OpenAI retains API data for up to 30 days for abuse and misuse monitoring, then deletes it (see policy page for the current retention window).

## Google (Gemini)
- **Tier in use:** Gemini API, **paid tier only**. (The Toolbox does not use the free tier for production traffic.)
- **Last verified:** 2026-05-04.
- **Provider terms link:** https://ai.google.dev/gemini-api/terms (paid services data use clauses).
- **Stance:** On the paid Gemini API tier, Google does not use prompts or responses to improve Google products (including not using them to train Google's generative models) under current terms. **Important caveat:** the free Gemini API tier has different terms (prompts may be used to improve products). The Toolbox enforces paid-tier billing on its `GEMINI_API_KEY`; if a learner-facing key were ever swapped for a free-tier key, this stance would not hold and the doc would need to be updated immediately.

---

## Surfacing in product

The Playground UI shows a "Last verified [date] — provider data-handling stance" link beneath the model picker (`src/app/dashboard/toolbox/_components/ModelPicker.tsx`). The `STANCE_LAST_VERIFIED` constant in that file MUST be kept in lockstep with the dates in this document.

## Review log

| Date | Reviewer | Outcome |
|---|---|---|
| 2026-05-04 | @Gilmore3088 | Initial fill (Plan D). All three stances verified against current provider terms. |
```

- [ ] **Step 3: Smoke check**

Confirm:
- The literal string `_to be filled by Plan D_` no longer appears anywhere in the file.
- The "Last verified" date matches `STANCE_LAST_VERIFIED` in `ModelPicker.tsx` and the verified-on date in `pricing.ts`.
- The next-review date is exactly three calendar months from the verified date.

Run: `grep -n "to be filled by Plan D" docs/compliance/llm-data-handling.md`
Expected: zero matches.

- [ ] **Step 4: Commit**

```bash
git add docs/compliance/llm-data-handling.md
git commit -m "docs(compliance): fill LLM data-handling stance for Plan D providers

Verified 2026-05-04 against Anthropic, OpenAI, and Google Gemini paid
API terms. Quarterly review cadence; next review 2026-08-04. Owner
@Gilmore3088."
```

---

### Task 10: Open follow-up issue for the deferred PII layering

**Files:**
- (No code; opens a GitHub issue.)

The spec §5.3 PII safety layering goes beyond the scanners we already wire in (synthetic-only-mode for first N sessions, typed-confirmation gate, telemetered "send anyway" path, persistent disclaimer banner). Plan D narrowly scopes "wire in the existing scanners," which is already true after Task 3. Surface the gap as a tracked issue so it doesn't get lost.

- [ ] **Step 1: Open the issue**

Use the `gh` CLI:

```bash
gh issue create \
  --title "Toolbox Playground: layered PII safety beyond regex scanners" \
  --body "Plan D shipped multi-provider Playground with the existing pii-scanner.ts and injection-filter.ts wired pre-LLM on every provider path. Spec §5.3 calls for additional layers that Plan D explicitly did NOT include:

1. Synthetic-only mode for first N sessions (default 5).
2. Typed-confirmation gate ('no real customer data') on first free-form send per session.
3. Telemetered 'send anyway' path on heuristic hits.
4. Persistent disclaimer banner.

These require UI work, a session-count store, and Plausible events not yet defined. Scope and plan separately."
```

- [ ] **Step 2: Note the issue number**

Record the issue URL in the Plan D PR description so reviewers can see the followup is tracked.

---

## Acceptance criteria

- [ ] `PLAYGROUND_MODELS` exports exactly the six spec-locked models, grouped by provider.
- [ ] `isAllowedModel(provider, model)` rejects unknown providers, off-menu models, and mismatched provider/model pairs.
- [ ] `pricing.ts` has verified rates for all six menu models, with a Last-Verified date in the file header.
- [ ] `pricing.test.ts` locks the rates with hand-computed cents-per-call expectations.
- [ ] `/api/toolbox/run` parses `{ provider, model }` from the request body, rejects invalid combos with 400, dispatches via `createLLMClient(provider)`, and logs the actual provider/model on success and error.
- [ ] PII and injection scans run unchanged on every provider path; tests assert ordering (scan before LLM call).
- [ ] `ModelPicker` renders the six models grouped by provider, reflects the controlled value, calls `onChange` with `{ provider, model }`, and surfaces a Last-Verified compliance link.
- [ ] The Playground tab in `ToolboxApp.tsx` includes the picker, defaults to Anthropic Sonnet 4.6, and sends `provider` + `model` in the POST body.
- [ ] `docs/compliance/llm-data-handling.md` contains no remaining placeholders; tier, verified date, provider terms link, and stance are filled for Anthropic, OpenAI, and Google Gemini paid tiers; next-review date is exactly three months out.
- [ ] `STANCE_LAST_VERIFIED` in `ModelPicker.tsx`, the "verified on" date in `pricing.ts`, and the "Last verified" date in the compliance doc all match.
- [ ] Manual smoke test: as a paid user, send a message on each of the 6 models and confirm responses come back from the correct provider.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npx vitest run` passes (existing baseline + new Plan D tests).
- [ ] `npm run build` succeeds.
- [ ] A GitHub issue is open tracking the spec §5.3 PII layering deferred from Plan D.

---

## What Plan D explicitly does NOT do

- **Streaming responses** (Vercel AI SDK or `LLMClient.stream()` integration in the Playground UI). → **Plan E**
- **Cost-as-dollars meter in the UI** (the "$0.31 / $0.50 today" indicator). → **Plan E**. Cost is *recorded* via `logUsage` today; surfacing it to learners is Plan E.
- **Per-IP and per-minute rate limiting** via `@upstash/ratelimit`. The existing per-user-per-day rate limit via `ai_usage_log` keeps running unchanged. → **Plan E**
- **Synthetic-only mode + typed-confirmation gate + telemetered "send anyway" + persistent disclaimer banner** (spec §5.3 layers 1, 2, 3, 5). → tracked via Task 7's GitHub issue, planned later.
- **"Save to Toolbox" capture from inside course modules.** → **Plan F**
- **Cookbook recipes.** → **Plan G**

---

## Self-Review

### Spec coverage check (Plan D-relevant sections only)

| Spec section | Plan D coverage |
|---|---|
| §5.3 Multi-provider model picker (6 v1 models) | Tasks 1, 4, 5 |
| §5.3 "Compare Mode deferred to Phase 2" | Honored — picker shows one model at a time |
| §5.3a Provider data-handling stance (audit-grade wording) | Task 6 |
| §5.3a Quarterly review cadence + provider URL recorded | Task 6 (review log table; next-review date) |
| §5.3a Surfacing "Last verified" in Playground UI | Task 4 (ModelPicker compliance link) |
| §5.3 Required env vars (`OPENAI_API_KEY`, `GEMINI_API_KEY`) | Already read by `lib/ai-harness/client.ts`. The user must populate these in `.env.local` and Vercel before merge. Flagged in Task 8 Step 3. |
| §7.4 Provider abstraction (one adapter per provider, normalized usage) | Anthropic shipped earlier; OpenAI + Gemini `chat()` filled by Tasks 3 + 4 |
| §7.4 Streaming responses (Vercel AI SDK) | **NOT in Plan D — Plan E.** |
| §11.8 Phasing: "Playground v2 — multi-provider" | This plan |
| §11.10 Provider data-handling page + Playground UI link | Tasks 4 and 6 |
| §10.6 PII heuristic library choice | Already chosen and wired in earlier plans (`src/lib/sandbox/pii-scanner.ts`). Plan D preserves it across provider paths. |
| §10.10 Entitlements reconciliation | Out of scope — Plan A0 wired the entitlement gate; Plan D inherits it. |

### Placeholder scan

Searched plan for: TBD, TODO (in user-facing instruction text, not the deferred-issue body), "implement later", "fill in details", "add appropriate error handling", "similar to Task N", "write tests for the above" — zero hits. Every step contains either the actual code or an exact command to run with expected output. The Task 5 Step 1 instruction includes pseudocode rather than a precise patch because the Playground panel is one of several JSX islands inside the 689-line `ToolboxApp.tsx` and the smallest correct patch depends on local layout decisions made in Plans A0/B/C; the engineer reading Task 5 has the file in front of them and the instruction explicitly names the search target (`/api/toolbox/run`), the state to add, the JSX placement (above the input textarea), and the body fields to change. This matches the same intentional pseudocode pattern used in Plan B Task 12.

### Type consistency

- `ProviderName` is imported from `@/lib/ai-harness/types` consistently in `playground-models.ts`, `route.ts`, and `ModelPicker.tsx`.
- `PlaygroundModel` (Task 1) and `ModelSelection` (Task 4) have non-overlapping responsibilities; `ModelSelection` is the runtime state shape, `PlaygroundModel` is the catalog row shape.
- `isAllowedModel(provider, model)` signature matches its usage in `route.ts` (positional `provider, model`).
- `ChatRequest` field names (`model`, `system`, `messages`, `maxTokens`, `temperature`) used in Task 3's route match the existing `src/lib/ai-harness/types.ts` definitions verified at plan-write time.

### Scope check

10 tasks: 1 model menu, 1 dep install, 2 adapter implementations (OpenAI + Gemini), 1 pricing fill, 1 API generalization, 1 component, 1 wiring, 1 doc fill, 1 follow-up issue. All within one coherent "ship multi-provider Playground non-streaming path" arc. No subsystem could ship independently — the adapters, the API generalization, the picker, and the pricing must all land together for the feature to work for a learner. The compliance doc must land before merge so the Playground UI's "Last verified" link points at a populated document, not the Plan A0 stub. Streaming, the cost meter, and per-IP rate limiting are deliberately deferred to Plan E to keep the diff reviewable.
