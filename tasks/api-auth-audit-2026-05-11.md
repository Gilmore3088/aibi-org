# API auth audit — 2026-05-11

Closes audit pass on §16.441 of `tasks/launch-checklist.md`.
Covers all 42 route handlers under `src/app/api/`.

## Methodology

For each handler, checked for one of: session check
(`supabase.auth.getUser()` / `getSession()`), entitlement gate
(`getPaidToolboxAccess()`), Stripe webhook signature
(`stripe.webhooks.constructEvent`), bearer/cron token, or explicit
"intentionally public" comment.

## Findings

### Category A — Public by design (no fix needed)

These are unauthenticated on purpose. Most have rate-limit gaps; see
Category D for that.

| Route | Purpose | Note |
|---|---|---|
| `capture-email` | Assessment email gate | Public per PRD |
| `subscribe-newsletter` | Marketing opt-in | Public |
| `inquiry` | "Contact us" form | Public |
| `waitlist` | Coming-soon waitlist | Public |
| `guides/safe-ai-use` | Free guide download | Public |
| `prompt-cards/lead`, `prompt-cards/download` | Free lead-magnet | Public |
| `checkout/in-depth`, `create-checkout` | Stripe checkout entry | Anonymous purchase is intentional — buyer signs in post-payment |
| `webhooks/stripe` | Stripe → server | Verified via `constructEvent` signature ✓ |
| `assessment/pdf/cron-cleanup` | Vercel cron | Verified via `CRON_SECRET` bearer ✓ |
| `aibi-s/chat`, `aibi-s/grade` | Stubs (404) | Both return "AiBI-S coming soon"; can be deleted post-launch |

### Category B — Authenticated correctly (no fix needed)

These all use `supabase.auth.getUser()` or `getPaidToolboxAccess()`:

```
courses/activity-response          courses/artifacts/skill-template-library
courses/generate-acceptable-use-card   courses/generate-certificate
courses/generate-module-artifact   courses/generate-transformation-report
courses/log-quick-win              courses/save-onboarding
courses/save-post-assessment       courses/save-progress
courses/submit-activity            courses/submit-work-product
assessment/in-depth/submit         assessment/pdf/download
dashboard/learner                  dashboard/toolbox-access
practice-reps/complete             toolbox/run            toolbox/run/stream
toolbox/save                       toolbox/skills/[skillId]   toolbox/skills
toolbox/library                    toolbox/library/[slug]   toolbox/usage
```

### Category C — Real bugs (LAUNCH BLOCKERS)

#### C1. `sandbox/chat` — unauthenticated AI proxy

`src/app/api/sandbox/chat/route.ts` has no auth. Anyone hitting the
endpoint can stream Claude responses on AiBI's API budget. Rate
limit is in-memory by `moduleId` — useless because serverless cold
starts wipe the counter and the attacker controls `moduleId`.

**Impact:** unbounded Anthropic API spend. Cost risk only — no data
exposure since the proxy doesn't read user-specific data.

**Fix shape:** Add `getUser()` check OR check a `course_enrollments`
row for the requesting email. The product question is whether
unauthenticated visitors should ever hit the sandbox at all — likely
no, since the Practice tab is only on enrolled course modules.

#### C2. `user-profile` GET — email-keyed lookup with no auth

`src/app/api/user-profile/route.ts` returns the `user_profiles` row
for any email passed as a query param. The route comment justifies
this as "email-only visitors can retrieve their own data
cross-device" — but the only thing proving "their own data" is
knowing the email address.

**Impact:** enumeration. An attacker who knows a target's email can
fetch their assessment score, tier, and answers. The data is not
high-value (assessment results) but the pattern is wrong and will
expand if reused.

**Fix shape:** Require an auth session bound to the email OR send
a one-time token via Resend that the client passes back. The
simplest non-breaking fix: gate on `getUser()` and verify the user's
email matches the requested email.

#### C3. `save-proficiency` POST — email-keyed write with no auth

`src/app/api/save-proficiency/route.ts` writes proficiency exam
results to `user_profiles` keyed by email. Anyone who knows a
target's email can overwrite their exam history with arbitrary
scores. Already lives behind the email gate so the attack surface
is small, but the data integrity gap is real.

**Impact:** data integrity. Worse if proficiency results ever drive
certification.

**Fix shape:** Same as C2 — gate on `getUser()` and bind to the
session email.

### Category D — Rate-limit gaps

CLAUDE.md already calls out rate limiting on `/api/capture-email`
as required before launch. Adding to that list:

| Route | Current | Recommend |
|---|---|---|
| `capture-email` | None | 5/hour per IP (already documented) |
| `subscribe-newsletter` | None | 10/hour per IP |
| `inquiry` | None | 5/hour per IP |
| `waitlist` | None | 5/hour per IP |
| `prompt-cards/lead` | None | 10/hour per IP |
| `sandbox/chat` | In-memory by moduleId (broken) | Per-session limit after fix in C1 |
| `checkout/in-depth`, `create-checkout` | None | 20/hour per IP (Stripe has its own anti-abuse but extra layer is cheap) |

The CLAUDE.md plan is Upstash Ratelimit (`@upstash/ratelimit` +
`@upstash/redis`). Setup is roughly 30 minutes once the Upstash
account exists.

### Category E — Webhook signature verification

Only `webhooks/stripe` is webhook-shaped, and it uses
`stripe.webhooks.constructEvent(body, sig, secret)` correctly.
Confirmed: closes §16.443.

## Recommended remediation order

1. **C1 sandbox/chat** — biggest exposure, smallest fix
2. **C2 + C3 user-profile/save-proficiency** — fix together since
   they share the email-keyed pattern
3. **D rate limiting** — wire Upstash, apply to D table

All three can ship as one PR since they touch ~5 files.

## What this audit did NOT cover

- RLS policies on every Supabase table (§16.448 — needs DB access)
- Penetration test of login/signup endpoints (§16.450)
- CSRF audit beyond Next.js's default same-origin POST guard (§16.447)
- XSS audit of `dangerouslySetInnerHTML` usage (§16.446 — separate grep)
- SQL injection audit (§16.445 — all queries go through Supabase JS
  client which parameterizes, so likely clean but should grep for
  `.rpc(` calls building dynamic SQL)
