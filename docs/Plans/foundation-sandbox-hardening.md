---
status: active
created: 2026-05-21
owner-tasks: tasks/foundation-sandbox-hardening.md
---

# Foundation — Live AI Sandbox (Hardening)

> **Type:** enhancement · **Status:** deferred (post-MVP; revenue-funded) · **Parent:** [`foundation-course-unified-rebuild.md`](./foundation-course-unified-rebuild.md)
> **One line:** Make the in-module Practice Sandbox a safe, multi-provider, cost-capped experience where enrolled learners run **predefined** prompts/skills on **synthetic** banking data — without the owner's API key becoming free ChatGPT.

This is **Slice 3** of the course rebuild, split out so it can never gate the sale. The course is sellable after the parent plan's Slice 1.

## Why deferred

The course already has a working Claude-only Practice Sandbox behind a gate. Multi-provider + hardening is a *differentiator*, not a requirement to sell. Build it when revenue justifies the engineering risk. The MVP-safe version is small (3 controls); the full version is larger.

## Ground truth (what exists today)

- **A production 3-provider engine already exists:** `src/lib/ai-harness/` — `LLMClient { chat(); stream() }`, typed `StreamChunk`/`LLMError`, `ChatUsage`, three tested adapters, `pricing.ts`, `rate-limit.ts`.
- **The in-module sandbox is a DIFFERENT, legacy stack:** `/api/sandbox/chat/route.ts` imports `streamClaude` from `src/lib/sandbox/providers/claude.ts` (Claude-only, **no usage accounting**, swallows errors into the text stream), with `VALID_PROVIDERS=['claude']`, OpenAI/Gemini tabs `enabled:false`, and its **own** Supabase rate limiter (`lib/api/rate-limit`, 50/hr).
- **Live security/cost gap:** that route destructures **client-supplied `systemPrompt` + raw `messages`** (`route.ts:102,189`), gated only on `getAuthUser()`. It is a free-LLM proxy on the owner's key, bounded only by 50/hr.

## P0 — Security gating requirements (must ship with any sandbox code)

- [ ] **Server owns the prompt.** Client sends only `{ promptId, moduleId, provider }` + bounded fill-in-the-blank template variables. **Delete the client `systemPrompt` and raw `messages` parameters.** Server looks up `promptId` in a registry, rejects unknown ids, and assembles the system prompt + user turn from the template + the module's synthetic dataset. Free-text variables are length/▶count-capped and run through the injection filter before interpolation. *(Without this, an allowlist is cosmetic.)*
- [ ] **Enrollment gate, mandatory.** Use `getPaidToolboxAccess()` **before** any provider call or spend reserve. A logged-in non-payer (e.g. free-assessment lead) returns 403, bills $0.
- [ ] **Lifetime spend cap fails CLOSED.** New `learner_spend` table + atomic check-and-reserve RPC (below). On RPC error/timeout, the **money cap denies** (distinct from availability limiters which may fail open).
- [ ] **Output is untrusted (stored-XSS sink).** Render model output as text or sanitized markdown with HTML disabled; no `dangerouslySetInnerHTML`; restrict markdown links to `https:`. **Sanitize saved artifacts on re-display too** (output is saved to the Toolbox and shown in later sessions).
- [ ] **No client-controlled model/base-URL.** `provider` maps to fixed server config; `model` derived server-side from `promptId`/module. No user input in any outbound request target (no SSRF pivot).

## P0 — Cost ledger (migration; the cap is impossible without it)

The current `ai_usage_log` is insert-only post-hoc actuals — **it cannot be atomically reserved** (you can't lock rows you haven't inserted), and sum-on-read is an O(n) hot-path query on every request. Required:

```sql
CREATE TABLE learner_spend (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id),
  reserved_cents numeric NOT NULL DEFAULT 0,   -- in-flight worst-case
  settled_cents  numeric NOT NULL DEFAULT 0,   -- settled actuals
  cap_cents      numeric NOT NULL DEFAULT 1500 -- ~$15
);
-- Atomic check-and-reserve (SECURITY DEFINER, service-role):
-- UPDATE learner_spend SET reserved_cents = reserved_cents + :worst
--   WHERE user_id = :id AND reserved_cents + settled_cents + :worst <= cap_cents
--   RETURNING *;   -- 0 rows = denied. Single statement = the atomic gate.
```
- Pre-flight worst-case = `(maxInput + maxOutput) × model rate` (`pricing.ts`). Reserve before the call.
- On success: `settled += actual; reserved -= worst`. On error/partial: `reserved -= worst`, no settle (AC-S5). `ai_usage_log` stays as the immutable audit ledger.

## Build scope — MVP-safe first (simplicity)

**Ship Claude-only, minimal, first:** (1) enrollment gate, (2) server-side prompt allowlist, (3) the `learner_spend` cap. That alone closes the owner's two fears (abuse, cost). Then expand:

- [ ] **Provider consolidation = a contract change, not a swap.** Point `/api/sandbox/chat` at `ai-harness` (`createLLMClient` + `playground-models`); retire `lib/sandbox/providers/claude.ts` **and** its separate `lib/api/rate-limit` path. The route returns a raw byte stream today; `ai-harness` yields structured `StreamChunk`s → write a `StreamChunk → NDJSON/SSE` adapter and update `AIPracticeSandbox.tsx` to parse structured chunks (real errors + usage). Reconcile the two rate-limit systems (ai-harness owns spend/provider; route keeps input-safety + per-hour throttle).
- [ ] **Gemini SDK migration** `@google/generative-ai` (deprecated) → `@google/genai` (`GoogleGenAI`, `ai.models.*`, `text` is a property, `usageMetadata` top-level). Update `gemini.test.ts` mocks together. *Can be done/verified standalone first to de-risk.* Verify the SDK shape against live docs before executing.
- [ ] **Moderation** (`omni-moderation-latest`) **only on free-text variable values** (server-authored prompt text doesn't need it); fail closed on input; don't let the moderation call bypass the budget reserve. *Reconsider whether it's needed at all once the server owns the prompt.*
- [ ] **DoS-via-cost:** wire the per-course daily kill-switch (`perCourseDailyCents`) + per-minute limit; cap output `maxTokens` (~2048) and conversation turns (single-shot where possible — re-billing 20-turn history is ~quadratic).
- [ ] **Admin reset path** for an exhausted lifetime cap = auth'd + audit-logged (it's a money lever).

## Performance specs (pin these)

- [ ] **Streaming:** `export const runtime='nodejs'`, explicit `export const maxDuration` (confirm vs Vercel plan ceiling), a per-stream inactivity `AbortController` (abort upstream on N seconds no-tokens), and an **in-band error event** schema (once a 200 is flushed you can't send an error status).
- [ ] **Cheap-tier defaults**, pinned to **model snapshots** not aliases (`gpt-4o-mini-2024-07-18`, `gemini-2.5-flash`) — aliases rotate and break cost + any cache.
- [ ] **Caching** (if added): key on `(provider, model-snapshot, system, messages, params_hash{temperature,max_tokens,top_p,stop}, sample-data version)`, canonicalized + hashed, with a `cache_schema_version` prefix. `temperature:0`. Cache hits bill $0 but **still require the enrollment gate**.

## Acceptance criteria
- [ ] AC-S1: Two concurrent runs cannot exceed the lifetime cap (concurrency test against the reserve RPC).
- [ ] AC-S2: Neither the system prompt nor the user body is client-controllable; only a `promptId` (+ bounded vars) is accepted; unknown ids rejected.
- [ ] AC-S3: A non-enrolled authenticated user gets 403, bills $0.
- [ ] AC-S4: Hitting the cap produces a clear, non-broken state (defined partial/grace behavior).
- [ ] AC-S5: Failed/errored/partial-stream calls release the reservation; never settle spend.
- [ ] AC-S6: Model output (live and saved-then-redisplayed) is sanitized; no HTML/script execution.
- [ ] AC-S7: The lifetime money cap fails CLOSED on ledger errors.

## References
`src/lib/ai-harness/{client,types,pricing,rate-limit}.ts`; `src/app/api/sandbox/chat/route.ts` (legacy Claude-only, client `systemPrompt` at :102,189); `src/lib/sandbox/{providers/claude.ts,pii-scanner.ts,injection-filter.ts}`; `src/lib/toolbox/playground-models.ts` (`enabled:false` tabs); `src/components/AIPracticeSandbox.tsx`; `supabase/migrations/00012_toolbox_skills.sql` (`ai_usage_log`). Parent: [`foundation-course-unified-rebuild.md`](./foundation-course-unified-rebuild.md).
