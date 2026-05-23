# Sandbox Service — §14 Security Acceptance Suite

Eight test files under `sandbox-service/tests/security/`, one per item in
`docs/Foundation-Course-ADDIE/AiBI_Sandbox_Service_Tech_Spec.md` §14.

## Run

```bash
npx vitest run sandbox-service/tests/security
```

Runs offline; no provider keys, no Supabase, no Redis required. All
external dependencies (LLM gateway, Supabase service client, entitlement
check) are mocked.

## Coverage

| # | File | Asserts |
|---|------|---------|
| 1 | `injection_reveal_system.test.ts` | Output gate strips a leaked-canary response and replaces it with the safe fallback. Also catches a known system-prompt fragment. Clean output passes through unchanged. |
| 2 | `injection_slot_close.test.ts` | Assembler escapes any literal `</learner_data>` inside a wrapped slot, so the prompt boundary cannot be broken. |
| 3 | `lever_allowlist.test.ts` | Unknown lever key → `AssemblyError` (mapped to HTTP 400). Unknown option id → `UNKNOWN_LEVER_OPTION`. Server NEVER silently strips. |
| 4 | `pii_input_check.test.ts` | `piiCheck` detects SSN (dashed), Luhn-valid PAN, ABA-valid routing, and 10–17 digit account-number shapes. Clean banker prose returns `[]`. |
| 5 | `output_length_cap.test.ts` | Gate truncates output to `gating.maxOutputChars`. Sub-cap output is preserved. |
| 6 | `provider_failover.test.ts` | When anthropic throws, the dispatcher returns openai's response with the correct `provider` field — no exception. |
| 7 | `anon_rate_limit.test.ts` | Anonymous limiter blocks the 6th call/hour to the same `anon_session_id`. Per-IP cap of 20/hour also blocks. |
| 8 | `no_leakage_in_payload.test.ts` | `runSandbox` and `runSandboxAb` responses contain no `system_prompt`, no `lever_directives`, no canary token, and none of the secret content authored on the test exercise. |

## What is intentionally NOT covered yet

- **Real Upstash backend** — limiter falls back to in-process; Upstash
  is exercised on the same code path in production with no surface diff.
- **Streaming response gating** — handlers return one response object;
  streaming is out of scope for v1 (TDD §10 perf budget assumes
  one-shot dispatch).
- **`runSkill` payload leakage** — covered structurally by the shared
  `executeOnce`/`logSession` helpers asserted in test #8; not exercised
  end-to-end because the skill loader requires three nested Supabase
  mock chains. Adding once the storage shape stabilizes.
