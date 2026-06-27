# Post-Login Synthetic-Persona QA Suite

Prior persona QA was **pre-login only** — `scripts/persona-sweep-100.mjs` is a
read-only navigation sweep whose `SKIP` list blocks `/api`, checkout, and auth,
so it never authenticated or saw a gated page. This suite closes that gap: it
seeds real accounts, logs in, and exercises the **authenticated** experience —
auth, payments, gated-page access, navigation efficiency (clicks-to-value +
circular navigation), and a dedicated review of the Foundation learning course.

## What's here

| Piece | File | Covers |
|---|---|---|
| Shared lib | `scripts/lib/persona-roster.mjs` | Roster parsing + intent mapping (shared by the pre- and post-login sweeps — single source). |
| | `scripts/lib/account-states.mjs` | Maps each roster persona → logged-in account state + seed recipe. |
| | `scripts/lib/value-moments.mjs` | Per-state "value moment" registry (what counts as value). |
| | `scripts/lib/nav-analysis.mjs` | Clicks-to-value + circular-navigation detectors. |
| | `scripts/lib/seed-bridge.mts` | tsx bridge to `e2e/helpers/seed.ts` (seeding stays single-source). |
| Authenticated sweep | `scripts/persona-sweep-auth-100.mjs` | **Headline.** 100 personas seeded to their state, logged in, walking gated routes; records errors, clicks-to-value, circular nav. |
| Efficiency analyzer | `scripts/qa-value-distance.mjs` | Theoretical-minimum click distance (BFS) to each state's value moment vs. what personas achieved. |
| Course review | `scripts/foundation-course-persona-walk.mjs` | Walks all 18 modules + submit/certificate/post-assessment; checks forward-only access control. |
| Master report | `scripts/build-postlogin-report.mjs` | Merges the above JSON into `docs/persona-audit-postlogin-<date>/{index.html,00-master-audit.md}`. |
| Auth journeys | `e2e/auth-journeys.spec.ts` | Seeded trusted/untrusted login, `?next=` deep-link into a gated module, onboarding gate, password-reset request. |
| Payments | `e2e/payments-provisioning.spec.ts` | Full test-mode chain: checkout → webhook → `course_enrollments` → active entitlement; declined-card path. |
| Course completer UI | `e2e/foundation-course-personas.spec.ts` | Rendered completer experience across certificate/submit/post-assessment. |
| Stripe helper | `e2e/helpers/stripe.ts` | Reusable hosted-checkout fill + test cards + live-key guard. |

## Safety model

- Seeding goes through `e2e/helpers/seed.ts`, gated by
  `E2E_ALLOW_PRODUCTION_SUPABASE=true`, using `.test`-TLD emails (RFC 6761, never
  reach a real inbox). Every harness tears down its users; `cleanupAllSeededUsers()`
  is the backstop in a `finally`.
- The authenticated sweep is GET-only over gated routes: it never logs out,
  never submits payment, never hits `/api` or real checkout.
- Payments run in **Stripe test mode only** — `assertNotLiveStripeKey()` refuses
  a `sk_live_` key. ⚠️ Production runs live Stripe, so the payment specs must run
  against a **test-keyed** environment (local `npm run dev` or a preview deploy
  with `sk_test_` + `STRIPE_WEBHOOK_SECRET_TEST`), not the live-Stripe prod site.

## Required environment

```
E2E_ALLOW_PRODUCTION_SUPABASE=true
SUPABASE_URL=…                       # or NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=…
BASE_URL=https://www.aibankinginstitute.com         # for the .mjs sweeps
PLAYWRIGHT_BASE_URL=$BASE_URL                        # for the e2e specs
# Payments only (test-keyed env):
E2E_STRIPE_ROUNDTRIP=true STRIPE_SECRET_KEY=sk_test_… STRIPE_WEBHOOK_SECRET_TEST=whsec_…
# If the browser is a pinned build (no `playwright install`):
PLAYWRIGHT_EXECUTABLE_PATH=/opt/pw-browsers/chromium/…/chrome
# If outbound must route through a proxy:
PLAYWRIGHT_PROXY_SERVER=$HTTPS_PROXY
```

## Run order

```bash
# 1. Authenticated 100-persona sweep (tsx — imports the TS seed helpers)
E2E_ALLOW_PRODUCTION_SUPABASE=true BASE_URL=$BASE_URL CONCURRENCY=5 \
  npx tsx scripts/persona-sweep-auth-100.mjs

# 2. Navigation-efficiency analyzer (reads the sweep above if present)
E2E_ALLOW_PRODUCTION_SUPABASE=true BASE_URL=$BASE_URL \
  npx tsx scripts/qa-value-distance.mjs

# 3. Foundation course review
E2E_ALLOW_PRODUCTION_SUPABASE=true BASE_URL=$BASE_URL \
  npx tsx scripts/foundation-course-persona-walk.mjs

# 4. Auth-flow + course-completer specs
PLAYWRIGHT_BASE_URL=$BASE_URL npx playwright test \
  e2e/auth-journeys.spec.ts e2e/foundation-course-personas.spec.ts

# 5. Payments — TEST-KEYED env only, never live keys
E2E_STRIPE_ROUNDTRIP=true STRIPE_SECRET_KEY=sk_test_… STRIPE_WEBHOOK_SECRET_TEST=whsec_… \
  npx playwright test e2e/payments-provisioning.spec.ts e2e/stripe-checkout-roundtrip.spec.ts

# 6. Master report
node scripts/build-postlogin-report.mjs
#   -> docs/persona-audit-postlogin-<date>/index.html + 00-master-audit.md

# Cleanup check (expect { deleted: 0 } if per-harness teardown worked)
node -e "import('./e2e/helpers/seed.ts').then(m=>m.cleanupAllSeededUsers()).then(console.log)"
```

`PERSONA_LIMIT=N` runs a subset; `SWEEP_DATE=YYYY-MM-DD` pins output directories
so the report builder can find a run.

## Validation status (build container)

All code is built and validated: shared-lib logic, tsx import chains (incl.
`@content`/`@` path resolution and the seed bridge), 0 errors across the full
e2e `tsc` typecheck, a real-browser launch of the refactored sweep, and the
report builder end-to-end. The **live audit runs were not executed here**: this
build container has no Supabase/Stripe secrets, and the org egress policy returns
`403` for the production domain. Run the commands above from an environment with
the secrets and egress allowance (CI or a developer machine).
