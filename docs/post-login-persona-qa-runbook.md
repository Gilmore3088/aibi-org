# Execution Runbook — Run the Post-Login Persona QA Suite & Produce Results

## Context

The post-login synthetic-persona QA suite is **already built, committed, and pushed**
to branch `claude/qa-synthetic-persona-testing-pqehv2` (commit `0837ed1`). It closes
the gap left by the prior read-only pre-login sweeps: it seeds real accounts, logs in,
and exercises the authenticated experience — auth, payments, gated-page access,
navigation efficiency (clicks-to-value + circular navigation), and a dedicated
Foundation course review.

It was **not run** in the build container because that container has no Supabase/Stripe
secrets and the org egress policy returns `403` for the production domain. This runbook
is for an agent/environment that **does** have secrets + egress. The goal: run every
harness, generate the HTML+markdown reports, verify cleanup, and commit the results.

App stack: Next.js 15 + React 19 + Supabase + Stripe. Suite docs: `docs/post-login-persona-qa.md`.

## Prerequisites (must all be true before running)

1. On branch `claude/qa-synthetic-persona-testing-pqehv2`, `npm install` done.
2. Playwright Chromium available. If `npx playwright install` is allowed, run it. If the
   browser is a pinned prebuilt (e.g. `/opt/pw-browsers`), instead set
   `PLAYWRIGHT_EXECUTABLE_PATH` to the chrome binary (the `.mjs` sweeps read it; the
   Playwright specs use `playwright.config.ts`'s browser).
3. Outbound network can reach the target site (no egress `403`). Confirm with:
   `curl -sS -o /dev/null -w "%{http_code}\n" https://www.aibankinginstitute.com/`
   If routing through a proxy, set `PLAYWRIGHT_PROXY_SERVER=$HTTPS_PROXY` for the `.mjs` sweeps.
4. Secrets present in the shell env:
   - `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`
   - For payments only: a **test-keyed** target with `STRIPE_SECRET_KEY=sk_test_…` and
     `STRIPE_WEBHOOK_SECRET_TEST=whsec_…` (see Environment split below).

## Environment split (important)

- **Phases A–D run against production** (`BASE_URL=https://www.aibankinginstitute.com`)
  with `.test`-TLD seeding (`E2E_ALLOW_PRODUCTION_SUPABASE=true`). Safe: GET-only gated
  nav, no logout/payment/api, every persona torn down.
- **Phase E (payments) runs against a TEST-KEYED env only** — local `npm run dev` or a
  preview deploy with `sk_test_` + `STRIPE_WEBHOOK_SECRET_TEST`. Production uses live
  Stripe; the specs refuse a `sk_live_` key. Do **not** point payments at prod.

Set once for the production phases:
```bash
export E2E_ALLOW_PRODUCTION_SUPABASE=true
export BASE_URL=https://www.aibankinginstitute.com
export PLAYWRIGHT_BASE_URL=$BASE_URL
export SWEEP_DATE=$(date +%F)          # pins all output dirs to one date
# export PLAYWRIGHT_EXECUTABLE_PATH=…  # only if browser is pinned
# export PLAYWRIGHT_PROXY_SERVER=$HTTPS_PROXY  # only if proxied
```

## Run order

### A. Authenticated 100-persona sweep (headline)
```bash
CONCURRENCY=5 npx tsx scripts/persona-sweep-auth-100.mjs
```
Output: `docs/handoffs/persona-sweep-auth-100-$SWEEP_DATE/{sweep.json,summary.md,shots/}`.
Console prints per persona: `state · value@N · LOOP/ok · N issue(s)`, then totals.
First, smoke it with `PERSONA_LIMIT=5` to confirm seeding + login work end-to-end before
the full 100. Expect a `cleanup backstop: {"deleted":0}` line at the end.

### B. Navigation-efficiency analyzer (reads A's sweep.json if present)
```bash
npx tsx scripts/qa-value-distance.mjs
```
Output: `docs/handoffs/qa-value-distance-$SWEEP_DATE/{distance.json,summary.md}` —
theoretical-minimum clicks-to-value vs achieved, per account state.

### C. Foundation course review
```bash
npx tsx scripts/foundation-course-persona-walk.mjs
```
Output: `docs/handoffs/foundation-course-personas-$SWEEP_DATE/{walk.json,summary.md,shots/}`.
Key signals: `certificateReachable`, `pagesWithIssue`, forward-only `violations`.

### D. Auth-flow + course-completer specs
```bash
npx playwright test e2e/auth-journeys.spec.ts e2e/foundation-course-personas.spec.ts
```
These self-skip unless `E2E_ALLOW_PRODUCTION_SUPABASE=true`.

### E. Payments — TEST-KEYED env only
```bash
E2E_STRIPE_ROUNDTRIP=true \
  npx playwright test e2e/payments-provisioning.spec.ts e2e/stripe-checkout-roundtrip.spec.ts
```
Self-skips unless `E2E_STRIPE_ROUNDTRIP=true` + a usable `sk_test_` create-checkout.
`payments-provisioning` additionally needs Supabase access to assert the
checkout→webhook→`course_enrollments`→active `entitlements` chain landed.

### F. Build the master report
```bash
node scripts/build-postlogin-report.mjs
# -> docs/persona-audit-postlogin-$SWEEP_DATE/{index.html,00-master-audit.md}
```
The builder merges whatever ran (A/B/C); missing sections render as "not run".

## Verification / interpreting results

- **Cleanup (do this every run):**
  ```bash
  node -e "import('./e2e/helpers/seed.ts').then(m=>m.cleanupAllSeededUsers()).then(console.log)"
  ```
  Expect `{ deleted: 0 }`. Non-zero means a harness left `.test` users behind — rerun it.
- **What "good" looks like:** in `index.html` / `00-master-audit.md` — high "reached value"
  count, low median clicks-to-value, zero/low circular-nav personas, broken/4xx = 0,
  JS-error pages = 0, `certificateReachable: YES`, forward-only `violations: 0`.
- **What to flag as findings:** any persona with `clicks→value: none` (value unreachable),
  any circular-nav incident, any 4xx/JS-error page, `certificateReachable: NO`, any
  forward-only violation, large min-vs-achieved gaps in the efficiency table (navigation
  to tighten), and any declined-card test that still provisioned access.

## Deliverable / commit

Commit the generated reports to the same branch:
```bash
git add docs/handoffs/persona-sweep-auth-100-$SWEEP_DATE \
        docs/handoffs/qa-value-distance-$SWEEP_DATE \
        docs/handoffs/foundation-course-personas-$SWEEP_DATE \
        docs/persona-audit-postlogin-$SWEEP_DATE
git commit -m "Post-login persona audit results ($SWEEP_DATE)"
git push
```
Then surface the master report (`docs/persona-audit-postlogin-$SWEEP_DATE/index.html`) and
a short summary of findings (clicks-to-value by state, circular-nav list, course result,
payment provisioning result).

## Files this runbook executes (already in the branch)

- `scripts/persona-sweep-auth-100.mjs`, `scripts/qa-value-distance.mjs`,
  `scripts/foundation-course-persona-walk.mjs`, `scripts/build-postlogin-report.mjs`
- `scripts/lib/{persona-roster,account-states,value-moments,nav-analysis}.mjs`, `scripts/lib/seed-bridge.mts`
- `e2e/auth-journeys.spec.ts`, `e2e/payments-provisioning.spec.ts`,
  `e2e/foundation-course-personas.spec.ts`, `e2e/helpers/stripe.ts`
- Reused: `e2e/helpers/seed.ts` (+ new `getProvisioningByEmail`), `e2e/helpers/auth.ts`

## Already validated in the build container (no rework needed)

Shared-lib logic (100 personas parsed, sensible state distribution), all tsx import
chains (incl. `@content`/`@` resolution + seed bridge), **0 errors across the full e2e
`tsc` typecheck**, a real-browser launch of the refactored sweep, and the report builder
end-to-end. Only the live runs remain — that's what this runbook performs.
```
