# Live smoke-test evidence log

Status: not started.
Last updated: 2026-06-23.

Use this log for the production live-money proof required before broad paid
promotion. The launch checklist has the procedural steps; this file is the
evidence record.

## Rules

- Do not paste card numbers, Stripe secret keys, webhook signing secrets,
  Supabase service-role keys, auth cookies, full magic links, or bearer tokens.
- Production paid smokes require an owner-approved live card and acceptance of
  processing/refund fees.
- Stripe test cards are for test mode only. They do not prove production
  live-money readiness.
- Stripe is authoritative for money. The app/admin database is authoritative
  for entitlement, access, support, and product-state evidence.
- Every failed or partially failed step gets a defect row. Do not silently
  "try again" and only record the final pass.

## Summary

| Smoke | Required proof | Result | Owner | Completed at | Evidence IDs / links | Notes |
|---|---|---|---|---|---|---|
| A. Free assessment | Results page 200, email received, profile id recorded | Not run | TBD | TBD | TBD |  |
| B. Paid In-Depth | Live Checkout Session, purchase email, magic link, entitlement, completion email, webhook 2xx | Not run | TBD | TBD | TBD |  |
| C. Foundation purchase | Live Checkout Session, welcome email, entitlement, course access, artifact save, webhook 2xx | Not run | TBD | TBD | TBD |  |
| D. Full refund | Refund id, `charge.refunded` 2xx, entitlement revoked, gated state confirmed | Not run | TBD | TBD | TBD |  |
| E. Partial refund | Refund id, `charge.refunded` 2xx, access retained | Not run | TBD | TBD | TBD |  |
| F. Comp revocation | $0 session or comp record, manual revocation, entitlement inactive | Not run | TBD | TBD | TBD |  |
| G. Idempotency replay | Test-mode replay returns 200 with no duplicate enrollment | Not run | TBD | TBD | TBD |  |
| H. 100-persona production proof | PDFs, downloads, crons, buyer recovery, team intake, public demo, verify/support proof | Not run | TBD | TBD | TBD | Use detailed checklist below. |

## Preflight

| Check | Expected | Result | Evidence |
|---|---|---|---|
| `/api/health/supabase` | `ok:true` | Not run |  |
| `/api/health/stripe` | `mode:"live"`, configured | Not run |  |
| `/api/health/email` | Resend key present, `skipResend:false` | Not run |  |
| Stripe live webhook endpoint | `https://www.aibankinginstitute.com/api/webhooks/stripe` | Not run |  |
| Stripe webhook events | `checkout.session.completed`, `charge.refunded`, `payment_intent.payment_failed`, `payment_intent.succeeded` | Not run |  |
| Support console | `/admin/support` accessible to support owner | Not run |  |
| Supabase migrations | Applied through `00058` | Not run |  |
| Cron routes | assessment-abandoned, paid-reengagement, stranded-buyers require auth and return counts with `CRON_SECRET` | Not run |  |
| Public demo env | model key present, spend cap/rate limits configured, no fake fallback | Not run |  |

## Smoke A - Free Assessment

| Field | Value |
|---|---|
| Tester email | TBD |
| Completed at | TBD |
| Profile id | TBD |
| Results URL | TBD |
| Results page status | Not run |
| Results email received at | TBD |
| Resend evidence | TBD |
| MailerLite tier group evidence | TBD |
| Result | Not run |
| Notes |  |

## Smoke B - Paid In-Depth Assessment

| Field | Value |
|---|---|
| Buyer email | TBD |
| Purchased at | TBD |
| Stripe Checkout Session id | TBD |
| PaymentIntent / Charge id | TBD |
| Webhook event id | TBD |
| Webhook delivery status | Not run |
| Purchase email received at | TBD |
| Magic link tested | Not run |
| Entitlement/enrollment evidence | TBD |
| `/assessment/in-depth/take` access | Not run |
| Briefing/results page status | Not run |
| Completion email received at | TBD |
| Result | Not run |
| Notes |  |

## Smoke C - Foundation Purchase

| Field | Value |
|---|---|
| Buyer email | TBD |
| Purchased at | TBD |
| Stripe Checkout Session id | TBD |
| PaymentIntent / Charge id | TBD |
| Webhook event id | TBD |
| Webhook delivery status | Not run |
| Welcome/access email received at | TBD |
| Course enrollment id | TBD |
| Entitlement evidence | TBD |
| `/courses/foundation/program` access | Not run |
| Artifact saved | Not run |
| Toolbox/save evidence | TBD |
| Result | Not run |
| Notes |  |

## Smoke D - Full Refund Revocation

| Field | Value |
|---|---|
| Source purchase smoke | TBD |
| Refunded at | TBD |
| Stripe refund id | TBD |
| `charge.refunded` webhook event id | TBD |
| Webhook delivery status | Not run |
| `refunded_checkout_sessions` guard row | Not run |
| Enrollment row removed or inactive | Not run |
| Entitlement inactive | Not run |
| Buyer gated from course | Not run |
| Manual refund notice sent | Not run |
| Result | Not run |
| Notes |  |

## Smoke E - Partial Refund Retention

| Field | Value |
|---|---|
| Source purchase smoke | TBD |
| Partially refunded at | TBD |
| Stripe refund id | TBD |
| Refund amount | TBD |
| `charge.refunded` webhook event id | TBD |
| Webhook delivery status | Not run |
| Entitlement still active | Not run |
| Buyer still has access | Not run |
| Result | Not run |
| Notes |  |

## Smoke F - Comp Revocation

| Field | Value |
|---|---|
| Comp buyer email | TBD |
| Promotion code or comp mechanism | TBD |
| Checkout Session id | TBD |
| Amount total | TBD |
| `checkout.session.completed` webhook status | Not run |
| Entitlement active after comp | Not run |
| Manual revocation action | Not run |
| Entitlement inactive after revocation | Not run |
| Buyer gated after revocation | Not run |
| Result | Not run |
| Notes |  |

## Smoke G - Idempotency Replay

This is a test-mode replay, not a production live-card action.

| Field | Value |
|---|---|
| Test Stripe event id | TBD |
| Checkout Session id | TBD |
| Replay timestamp | TBD |
| Handler response | Not run |
| Duplicate enrollment count | Not run |
| Result | Not run |
| Notes |  |

## Smoke H - 100-Persona Production Proof

These rows prove the local 100-persona remediation against the deployed app.
They are required before broad paid promotion even if the live-money smokes pass.

| Proof area | Required evidence | Result | Evidence IDs / links | Notes |
|---|---|---|---|---|
| Gated Prompt Cards PDF | `/api/prompt-cards/download` returns `200`, PDF bytes, correct page count; UI unlocks only after success | Not run | TBD |  |
| Safe AI Use Guide PDF | `/api/guides/safe-ai-use` returns `200`, PDF bytes, correct page count; form success waits for response | Not run | TBD |  |
| Certificate PDF | Real issued certificate opens `/verify/{id}` and print/PDF path renders on deployed app | Not run | TBD |  |
| Transformation Report PDF | Deployed Chromium route returns a valid personalized PDF | Not run | TBD |  |
| Acceptable-Use Card PDF | Deployed Chromium route returns a valid personalized PDF | Not run | TBD |  |
| Assessment resume link | Mid-assessment resume email delivers; link restores same question set before 30-day expiry | Not run | TBD |  |
| Assessment abandoned cron | Authenticated cron run reports checked/sent/failed counts and sends one reminder for a seeded stale draft | Not run | TBD |  |
| Paid re-engagement cron | Authenticated cron run sends/logs In-Depth waiting, Foundation not-started, and Foundation stalled reminders from seeded fixtures | Not run | TBD |  |
| Stranded-buyer cron | Authenticated cron run opens deduped access support cases for paid buyers who never signed in | Not run | TBD |  |
| Purchase-link resend | `/auth/login` or `/support/purchase-help` sends a generic-response recovery email that lands on the right product | Not run | TBD |  |
| Team/institution inquiry | `/for-institutions` or `/assessment/team` submission creates support case and support-inbox notification | Not run | TBD |  |
| Public playground demo | `/api/playground/run` returns model output, logs usage, enforces rate/spend caps, blocks PII/injection, and no fake fallback appears | Not run | TBD |  |
| Admin toolbox usage | `/admin/toolbox-usage` shows public demo calls, status, cost, and top IP hashes after test calls | Not run | TBD |  |
| Support access rescue | `/admin/support` buyer lookup sends access-rescue email and writes timeline event | Not run | TBD |  |
| Refund timeline logging | Admin refund approved/denied/manual-issued decisions write timeline events without calling Stripe refund APIs | Not run | TBD |  |
| Pricing/discovery links | `/pricing`, `/verify`, `/certifications`, `/prompt-cards`, `/playground`, and `/support/purchase-help` are linked from expected nav/footer/sitemap surfaces | Not run | TBD |  |
| Physical iPhone/Safari | Required route list renders without overflow; primary CTAs tappable; email/app handoffs work | Not run | TBD |  |

## Defects

| ID | Smoke | Severity | Description | Owner | Status | Resolution / link |
|---|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Accepted Gaps

| Gap | Accepted by | Date | Rationale | Follow-up |
|---|---|---|---|---|
| Refund notification is manual unless explicitly automated later. | TBD | TBD | Support owner sends buyer confirmation after Stripe refund. | Revisit if refund volume rises. |
