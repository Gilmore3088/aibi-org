# Sandbox Service

The **only** component in the AiBI Foundation Course that talks to an LLM
provider. The web app does not hold provider keys and does not call vendor
SDKs. Everything the model sees and everything the model returns passes
through this module.

Spec: `docs/Foundation-Course-ADDIE/AiBI_Sandbox_Service_Tech_Spec.md`.
Layout: `docs/Foundation-Course-ADDIE/AiBI_Technical_Design_Doc.md` §4.

## What it does

```
Web app ── POST /api/sandbox/run ──▶ sandbox-service/src/handlers/run.ts
                                       │
                                       ├─ load Exercise (server-only fields)
                                       ├─ entitlement check (paid Exercises)
                                       ├─ rate limit (stub in Wave 1b)
                                       ├─ assemble prompt (canary + escaped slots)
                                       ├─ dispatch → provider gateway w/ failover
                                       ├─ output gate (length / leak / safety / format)
                                       └─ log to addie.sandbox_sessions
```

## Security posture — be honest with banking buyers

Prompt injection cannot be 100% eliminated by prompting alone. The real
guarantee is **blast radius**:

- The system prompt is low-stakes teaching framing, not a secret.
- Provider API keys never leave the server.
- Learners structurally cannot enter sensitive data — only bounded option
  IDs and short delimited free-text in `<learner_data>` slots that the
  preamble instructs the model to treat strictly as material.
- A worst-case "leak" exposes a pedagogical instruction, nothing more.

## How an Exercise gets added

Insert a row into `addie.exercises` (server-only authoring path — never
through the learner app). Required fields:

| Column | Purpose |
|---|---|
| `system_prompt` | Hardened framing for the exercise. The assembler will prepend its own preamble and append the canary. |
| `lever_directives` | `{ leverKey: { optionId: directiveString } }` — the allowlist of strings a learner-bounded selection can resolve to. |
| `task_scaffold` | Fixed task shown to the learner read-only. |
| `levers` | Client-safe descriptor (labels + option ids only). |
| `data_slots` | `[{ key, label, maxChars, required, piiCheck }]`. |
| `preset_context_blocks` | `[{ id, label, body }]`. Body stays server-side; clients see `{ id, label }`. |
| `default_provider` | `'anthropic' | 'openai' | 'google'`. |
| `allow_provider_switch` | Whether the learner switcher applies. |
| `gating` | `{ maxOutputTokens, maxOutputChars }`. |
| `entitlement` | `'free' | 'paid'`. |

`addie.client_exercise_v` is the read view a public `/api/exercise/:id` route
should use to surface descriptors — it strips `system_prompt`,
`lever_directives`, and preset bodies.

## Gateway

`src/gateway/index.ts` exposes `dispatch({ request, preferredProvider, useAnonModel })`.
It tries the preferred provider, then falls back across the configured
priority `['anthropic', 'openai', 'google']` on error or 10s timeout. On
all-providers-failed, the handler returns a safe generic message with
`flagged: true`. Each adapter normalizes:

| Provider | API | system | content |
|---|---|---|---|
| Anthropic | Messages | `system` param | `messages: [{ role:'user', content }]` |
| OpenAI | Chat Completions | system message | user message |
| Google | generateContent | `systemInstruction` | `contents` |

Anonymous traffic pins to the per-provider `anonModel` for cost.

## Modes shipped

| Mode | Handler | Route | Spec |
|---|---|---|---|
| Single | `src/handlers/run.ts` | `POST /api/sandbox/run` | §8.1 |
| A/B | `src/handlers/ab.ts` | `POST /api/sandbox/ab` | §8.2 — runs the same exercise under 2–3 lever configs; one sandbox_sessions row per config; rate-limit is charged once per call. |
| Skill | `src/handlers/skill.ts` | `POST /api/skill/run` | §8.3 — paid-only. A "skill" is a learner-saved parameterized template stored in `addie.toolbox_items` (type='skill') whose `body_md` JSON-encodes `{exerciseId, fixedLeverSelections, slotSchema, presetIds?}`. Fixed levers are authoritative; the learner supplies data slot values only. |

All three modes share `src/handlers/shared.ts` (assemble → circuit-breaker
→ dispatch → output gate → cost estimate → log → spend-record) so they
cannot drift.

## Rate limits + budgets (§11)

`src/rateLimit/index.ts` implements:

- Authenticated paid: 200 runs/hour total per learner.
- Authenticated free: 100 runs/hour total + 30 runs/hour per (learner, lesson).
- Anonymous: 5 runs/hour per `anon_session_id` + 20 runs/hour per IP.
  Anonymous traffic is also pinned to the cheaper `anonModel` per provider
  (gateway concern).

Backend: Upstash Redis when `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` are set; otherwise an in-process sliding-window
Map (acceptable for v1 single-instance Vercel function). No code changes
required to switch — env-driven only. The `@upstash/redis` package is
loaded via dynamic import and is NOT a hard dependency.

### Daily LLM-spend circuit breaker

`recordSpend(provider, costUsd)` is bumped on every dispatched call;
estimates from `src/observability/cost.ts` (approximate per-1k-token
rates per provider/model). When today's per-provider spend hits
`SANDBOX_DAILY_BUDGET_USD_TOTAL` (default $25), the circuit opens for
that provider — the next call fails over to a provider still under
budget. If every provider is over budget, the handler returns the safe
fallback with `flagged: true` and `flag_reasons: ['daily_budget_exhausted']`.
Spend ledger lives in `addie.sandbox_spend` (migration 00052).

## Pre-pilot security checklist (Spec §14 + Security Spec §12)

Run the suite, then visually confirm each item before any pilot.

```bash
npx vitest run sandbox-service/tests/security
```

- [ ] §14.1 — Reveal-system-prompt injection: output gate catches canary leaks.
- [ ] §14.2 — Slot close-tag injection: assembler escapes literal `</learner_data>`.
- [ ] §14.3 — Lever allowlist: unknown lever key/option → HTTP 400, never silently stripped.
- [ ] §14.4 — PII pre-check: SSN, Luhn-valid PAN, ABA-valid routing, 10–17 digit account-number patterns rejected.
- [ ] §14.5 — Output length cap: gate truncates to `gating.maxOutputChars`.
- [ ] §14.6 — Provider failover: primary error falls over to next in priority.
- [ ] §14.7 — Anonymous rate limit: 6th call/hour per anon session refused; 21st call/hour per IP refused.
- [ ] §14.8 — No leakage in payload: response JSON never contains `system_prompt`, `lever_directives`, or the canary.
- [ ] Daily budget breaker tripped manually (set `SANDBOX_DAILY_BUDGET_USD_TOTAL=0.01` on a preview, fire one call, confirm safe fallback).
- [ ] `addie.sandbox_sessions` rows are being written with `mode`, `provider`, `tokens`, `est_cost_usd`, and `flagged` populated.
- [ ] Public Next.js routes (`/api/addie/gate/capture-email`, `/api/addie/checkout/*`) return 429 after their per-IP cap.

See [`SECURITY_SUITE.md`](./SECURITY_SUITE.md) for what each test asserts.

## Tests

Vitest is already configured at the repo root:

```bash
npm test -- sandbox-service/tests
```

Two suites:

- `tests/assembler.test.ts` — proves lever directive resolution, data-slot
  delimiter escaping, and the assembler's validation gates (unknown lever,
  unknown option, missing required slot, slot too long, unknown slot key,
  unknown preset id).
- `tests/canary.test.ts` — proves the canary scanner detects leaks and the
  output gate replaces leaked output with a safe fallback.
