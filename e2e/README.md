# E2E tests

Playwright tests for the AiBI launch checklist (§3–§10).

## First-time setup

```bash
npm install
npx playwright install --with-deps chromium webkit
```

The second command downloads ~400MB of browser binaries to
`~/Library/Caches/ms-playwright`. Required once per machine.

## Running

```bash
# Against local dev (auto-starts `npm run dev` if not already running)
npm run e2e

# Against a Vercel preview deploy
PLAYWRIGHT_BASE_URL=https://aibi-org-git-feature-x.vercel.app npm run e2e

# Against staging
PLAYWRIGHT_BASE_URL=https://staging.aibankinginstitute.com npm run e2e

# Local paid-course preview coverage (uses the dev-only enrollment bypass)
npm run e2e:course-preview

# Single test file
npx playwright test e2e/auth.spec.ts

# Open the HTML report after a run
npx playwright show-report
```

## Test seeding

There is no staging Supabase project. Tests seed users directly into
the real Supabase project using the `.test` TLD email pattern
(`e2e+<short-id>@aibankinginstitute.test`) — RFC 6761 guarantees this
TLD never reaches a real inbox, and the cleanup helper deletes them
by email LIKE after each test.

The seed helper requires `E2E_ALLOW_PRODUCTION_SUPABASE=true` as an
explicit acknowledgment. Prefer setting it for a single command rather than
leaving it in `.env.local`.

To purge any stranded test users:

```bash
node -e "require('./e2e/helpers/seed').cleanupAllSeededUsers().then(r => console.log(r))"
```

## Environment

Tests need:

| Env var | Purpose |
|---|---|
| `PLAYWRIGHT_BASE_URL` | Where to point the browser (defaults to localhost) |
| `SUPABASE_URL` | For server-side test seeding (service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | For server-side test seeding |
| `STRIPE_TEST_SECRET_KEY` | For purchase-flow tests (test mode only) |

Normal local runs start an isolated dev server with Resend, MailerLite,
Supabase service-role writes, Stripe, and ops-alert delivery disabled. The
following opt-ins restore operator-only integrations for a single run:

| Env var | Effect |
|---|---|
| `E2E_ALLOW_PRODUCTION_SUPABASE=true` | Allows temporary `.test` users/rows in the configured Supabase project |
| `E2E_STRIPE_ROUNDTRIP=true` | Allows Stripe test-mode checkout calls |
| `E2E_ALLOW_EXTERNAL_SIDE_EFFECTS=true` | Allows configured Resend, MailerLite, and ops channels |
| `E2E_COURSE_PREVIEW=true` | Enables the local synthetic enrollment bypass |

In CI these come from GitHub secrets. Locally, the existing
`.env.local` works as long as you're pointing at the staging or dev
Supabase project.

## What's covered (and what's not)

The suite covers public, auth, assessment, purchase validation, course-preview,
resource, accessibility, and responsive flows. Database-seeded auth/course
tests and provider round-trips remain operator-gated.

Stripe purchase tests use Stripe test mode card numbers
(`4242 4242 4242 4242`) and run against `checkout.stripe.com`. They
will not work offline.

Email delivery tests (§9) need either a Resend webhook in CI or a
mailpit/maildev container — not scaffolded here. The 4 tier-sequence
MailerLite tests are best done as manual smoke tests against the
dashboard activity log.
