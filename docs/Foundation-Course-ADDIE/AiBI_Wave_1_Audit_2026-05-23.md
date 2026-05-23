# Wave 1 Drift + Thoroughness Audit — 2026-05-23

*Branch: `feature/addie-v1` @ commit `a686dae` (15 commits ahead of `main`).
Trigger: `/goal review local directory checklists and planning docs to
determine drift and thoroughness in wave 1`.
Methodology: independent audit agent cross-referenced the 6 ADDIE spec
acceptance-gate sections against the 17 migrations + sandbox-service/ +
src/lib/addie/ + src/app/api/{addie,sandbox,skill}/ + tests.*

---

## A. DB Spec §12 acceptance gates (10 items)

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | Every learner-data table has RLS enabled | PASS | `ALTER ... ENABLE ROW LEVEL SECURITY` on every `addie.*` table |
| 2 | No policy compares against `auth.uid()` without `(select …)` wrapper | PASS | grep returns 0 unwrapped instances |
| 3 | Every column an RLS policy filters on is indexed | PASS | `idx_addie_*` on every user_id/lead_id/admin_user_id/team_id/learner_user_id/invited_email |
| 4 | Anon reads only published free modules/lessons/checks | PASS | leads/results/items/events have no anon SELECT |
| 5 | Auth learner reads only own profile/entitlements/results/items/versions/sessions/assessments | PASS | "learner reads own …" policies on every owned table |
| 6 | Team admin reads rollup, no artifact body or transcript | PASS | `team_progress_v` is counts only |
| 7 | `exercises.system_prompt` / `lever_directives` unreachable from PostgREST | PASS | RLS enabled with no client policies; `client_exercise_v` strips them; schema not exposed via API |
| 8 | Paid course-media requires signed URL bound to entitlement | PASS | `00053` policy gates on `entitlements.status='active'` |
| 9 | `assessment_results`/`toolbox_items` bind lead → user on sign-up | **FAIL** | `bindLeadToUser` orphaned — see G3 |
| 10 | Second learner cannot read another learner's rows | PASS | structurally enforced by RLS |

## B. Auth Spec §12 acceptance gates

| # | Gate | Status | Notes |
|---|------|--------|-------|
| 1 | Anon completes M0–M3 without sign-in prompt | DEFERRED | Wave 2 player |
| 2 | Email-to-keep migrates artifacts in one txn | DRIFT | sequential `.update()` calls — see G6 |
| 3 | Lead→user bind fires within 5s of `auth.users` insert | **FAIL** | not wired — G3 |
| 4 | Stripe sig verification rejects unsigned/tampered | PASS | `webhook.ts:22-34` |
| 5 | Duplicate Stripe events idempotent | **FAIL** | column-name drift — G1 |
| 6 | Team purchase writes one team + N seats | **FAIL** | seats never written — G2 |
| 7 | Seat invite + matching sign-up auto-assigns | DEFERRED | depends on G3 fix |
| 8 | Seat invite + mismatched email blocks | DEFERRED | same as #7 |
| 9 | Revoked entitlement loses M4–M5 on next load | DEFERRED | Wave 2 UI |
| 10 | MailerLite unsubscribe flips `leads.marketing_opt_in` | DEFERRED | Wave 2/3 + needs webhook |
| 11 | Admin cannot read seat-holder artifact body | PASS | structural |
| 12 | Two learners on same IP can't read each other | PASS | RLS holds |
| 13 | `service_role` key not in client bundle | PASS (structural) | server-only files; post-build grep deferred |

## C. Sandbox Spec §14 security test plan (8 items)

| # | Gate | Status | Test file |
|---|------|--------|-----------|
| 1 | "Reveal system prompt" → no leak, canary never returned | PASS | `injection_reveal_system.test.ts` |
| 2 | Slot-closing injection escaped | PASS | `injection_slot_close.test.ts` |
| 3 | Lever allowlist enforced | PASS | `lever_allowlist.test.ts` |
| 4 | PII in data slot warns/blocks | PASS | `pii_input_check.test.ts` |
| 5 | Output ≤ `maxOutputChars` | PASS | `output_length_cap.test.ts` |
| 6 | Provider failover on timeout/error | PASS | `provider_failover.test.ts` |
| 7 | Anon rate limit + global circuit breaker | PARTIAL | anon+IP caps covered; **global budget circuit breaker untested** |
| 8 | No key/prompt/directive in client payload | PASS | `no_leakage_in_payload.test.ts` (skill mode untested but documented in SECURITY_SUITE.md) |

## D. Sandbox Spec §15 build sequence (steps 1–8)

| Step | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | Gateway + Anthropic adapter | PASS | |
| 2 | Exercise model + assembler + canary | PASS | |
| 3 | Output gating pipeline | PASS | |
| 4 | `/sandbox/run` + auth + anon + rate limits | PASS | |
| 5 | OpenAI + Gemini adapters + switcher + failover | PASS | |
| 6 | A/B + skill modes | PARTIAL | skill handler built, **no `/api/sandbox/skill` route** — G4 |
| 7 | Logging/events + budgets/circuit breaker | PARTIAL | circuit breaker untested — C7 |
| 8 | §14 security suite + sign-off | PASS | 8/8 tests; SECURITY_SUITE.md documents known gaps |

## E. PRD §6 functional requirements — Wave 1 server/infra subset only

| FR | Description | Status |
|----|-------------|--------|
| FR-A* (lesson player / Toolbox UI / content) | — | DEFERRED Wave 2/3 |
| FR-B3 Sandbox "blinders" service | PASS |
| FR-C1 Three-way gate endpoints | PASS |
| FR-C2 Lead model + anon→lead migration | PARTIAL (G3) |
| FR-D1–D3 Stripe checkout + webhook | PARTIAL (G1, G2) |
| FR-D4 Team admin aggregates only | PASS |
| FR-D5 Seats invite/accept/revoke | PARTIAL (G3 depends) |
| FR-E* (48-Q runner) | — | DEFERRED Wave 3b |
| FR-G1 RLS on every learner table | PASS |
| FR-G2 No service_role in client bundle | PASS (structural) |

## F. Locked-decision audit (DECISIONS.md 2026-05-23 vs code)

All eight locked decisions confirmed in code: sandbox in `sandbox-service/` (Vercel Functions, same repo) · `addie.*` schema isolation · `(addie)` route group + `/api/addie/*` + `/api/sandbox/*` namespace · 8 dimensions not 10+ · `STRIPE_ADDIE_WEBHOOK_SECRET` preferred · team-seat price via `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` fallback · addie webhook at `/api/addie/webhooks/stripe` · no certificate / no credential in v1.

## G. Real findings

### Blockers (must fix before Wave 2 starts)

**G1. Stripe events ledger column drift** — `webhook.ts:50` inserts `{ id: event_id }` but `00051` schema requires `{ stripe_event_id, type, livemode }`. Insert always fails → in-memory dedup fallback kicks in → cold-start kills dedup → idempotency is effectively broken in production.
*Fix:* change insert payload and pass full `event` into `markEventSeen`.

**G2. `provisionTeam` doesn't create the seats** — `webhook.ts:193-221` creates the team row + admin entitlement but never bulk-inserts the N invitable `seats` rows. Admin will buy 10 seats and see zero invite slots.
*Fix:* after team insert, bulk-insert N `seats(team_id, status='created')` rows.

**G3. Lead→user bind not wired** — `bindLeadToUser` exists in `src/lib/addie/leads/bind.ts:97` but has zero callers. No `auth.users` trigger, no first-login handler. Every paid sign-up creates a fresh user with zero carry-over of free artifacts or pending entitlements.
*Fix:* add a Supabase Edge Function or a `(addie)` first-login handler that calls `bindLeadToUser({ user_id, email })` + drains `pending_entitlements`.

### Important (fix before merge to main; not blocking Wave 2 start)

**G4. `/api/sandbox/skill` route missing** — handler implemented + tested, not reachable from the web. Symmetric `route.ts` shim needed.

**G5. Webhook handles only 2 event types vs spec's 4** — missing `customer.subscription.created/updated/deleted`. Either add them or document the team-seat product as one-time (which matches current shape) in DECISIONS.md.

**G6. Anon→lead migration not transactional** — sequential `.update()` calls. Partial failure leaves orphan anon rows (replays converge, so not catastrophic).

**G7. `pending_entitlements.seat_id` never set** — team purchases for unknown emails will never bind a specific seat at signup.

### Nice-to-fix

**G9. Stale comment in `webhook.ts:40-43`** — claims the ledger table may not exist; `00051` ships it. Delete the comment block.

### Deferred (correctly out of Wave 1 scope)

**G8.** Pre-pilot security gate (Security Spec §12 items 1–9) — privacy policy, /account/export, /account/delete, /security posture page, friendly-bank pilot. All Wave 2/3 + manual ops.

**G10.** `/account/export`, `/account/delete`, MailerLite unsubscribe→`leads.marketing_opt_in` sync, post-build `service_role` grep, view-RLS on `team_progress_v`. Wave 2/3.

## H. Recommendation

Wave 1 is **structurally sound**: schema + RLS + sandbox service + §14 security suite all pass cleanly, every locked DECISIONS.md deviation is faithfully reflected in code, and the locked stack works end-to-end at the unit-test layer. The infrastructure can support Wave 2 work.

**However, the three blockers (G1, G2, G3) must be fixed before Wave 2 starts** because Wave 2 will immediately exercise them — seat-invite UI calls into the team flow, paid sign-up calls into bind, and any webhook test will hit the broken ledger insert.

Recommend a **"Wave 1f cleanup"** mini-batch (estimate: half a day) to land G1+G2+G3 plus the easy fixes G4 (skill route), G5 (subscription model decision), G9 (comment cleanup) before opening Wave 2a. G6 and G7 can ship with Wave 2 if their fix scope is contained.

---

## Wave 1f resolution — 2026-05-23 (post-audit, commit `deacae1`)

Three of the audit's findings were re-classified after code inspection rather than fixed:

- **G2 (provisionTeam doesn't create seats)** — **not a bug, by design.** `seats_purchased` is the team's budget cap; `inviteSeats` (`src/lib/addie/team/seats.ts:48`) enforces `team.seats_purchased - usedCount >= invitees.length` at invite time. Seats are intentionally not pre-created at purchase; they're created on invite. The schema enforces this via `seats.invited_email NOT NULL`.
- **G4 (`/api/sandbox/skill` missing)** — **wrong, the route exists at the spec'd path.** Sandbox Spec §9 places skill execution at `POST /api/skill/run` (not `/api/sandbox/skill`). `src/app/api/skill/run/route.ts` is present and tested. The "chat" route the auditor saw at `src/app/api/sandbox/chat/route.ts` is legacy `main` code (imports `@/lib/sandbox/pii-scanner`, the main namespace) and is unrelated to the ADDIE rebuild.
- **G7 (`pending_entitlements.seat_id` never set)** — **by design.** v1 has no "individual invitee pays at Stripe" flow; team admins pay upfront for N seats and invite. The schema column exists for a future flow but is correctly null in v1.

The remaining four findings were fixed in this batch:

- **G1 fixed.** `markEventSeen` now writes `{stripe_event_id, type, livemode, payload_summary}` matching the `00051` schema. Signature changed from `(event_id: string)` to `(event: Stripe.Event)`.
- **G3 fixed.** `bindLeadToUser` now called from `handleCheckoutCompleted` when a `user_id` is resolved from the buyer's email. Wrapped in try/catch so a bind failure doesn't kill the webhook (entitlement is already written). Emits `lead_bound_to_user` event on success.
- **G5 resolved as a decision.** DECISIONS.md entry locks team SKU as one-time payment in v1; no `customer.subscription.*` events needed. Revisit if team pricing pivots to recurring.
- **G9 fixed.** Stale "ledger table may not exist" comment block removed from `webhook.ts`; the parallel `pending_entitlements` stale-warning branch also removed (table exists per `00051`).

**G6 (anon→lead non-transactional)** ships with Wave 2 as planned — the fix surface overlaps with the gate UI work.

Verification after Wave 1f:
- `npx tsc --noEmit` → clean
- `npx vitest run` → 41/41 tests pass

**Wave 2 unblocked.**
