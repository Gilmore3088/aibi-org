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

## What's NOT in this wave

- Steps 6–8 in the spec: A/B mode (`/sandbox/ab`), skill mode (`/skill/run`),
  full security test suite, budget/circuit-breaker, real rate limiter.
- The rate-limit interface in `src/rateLimit/index.ts` is wired but the
  implementation is a no-op stub.
- The Next.js shim reads the anon-session cookie as a plain UUID with a
  `TODO(Wave 1d)` for the HMAC-signed helper coming from
  `src/lib/addie/auth/anonSession.ts`.

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
