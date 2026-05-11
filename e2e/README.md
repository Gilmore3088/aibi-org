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

# Single test file
npx playwright test e2e/auth.spec.ts

# Open the HTML report after a run
npx playwright show-report
```

## Test seeding

Tests that need an authenticated user create one via the helpers in
`e2e/helpers/`. Every seeded account uses the address pattern
`e2e+<short-id>@aibankinginstitute.test` so cleanup can target them
by email LIKE. **Never seed against production.** The helpers throw
if `SUPABASE_URL` matches the production project ref.

## Environment

Tests need:

| Env var | Purpose |
|---|---|
| `PLAYWRIGHT_BASE_URL` | Where to point the browser (defaults to localhost) |
| `SUPABASE_URL` | For server-side test seeding (service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | For server-side test seeding |
| `STRIPE_TEST_SECRET_KEY` | For purchase-flow tests (test mode only) |

In CI these come from GitHub secrets. Locally, the existing
`.env.local` works as long as you're pointing at the staging or dev
Supabase project.

## What's covered (and what's not)

This scaffold covers §3 (auth flows) of the launch checklist. The
remaining E2E sections (§4 free assessment, §5 in-depth, §6 course
purchase, §7 course modules, §8 exam, §9 email, §10 marketing) follow
the same patterns — copy `e2e/auth.spec.ts` and adapt.

Stripe purchase tests use Stripe test mode card numbers
(`4242 4242 4242 4242`) and run against `checkout.stripe.com`. They
will not work offline.

Email delivery tests (§9) need either a Resend webhook in CI or a
mailpit/maildev container — not scaffolded here. The 4 tier-sequence
MailerLite tests are best done as manual smoke tests against the
dashboard activity log.
