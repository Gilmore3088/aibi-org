# Funnel UX Findings — Playwright Walkthrough 2026-05-23

Ran the assessment funnel end-to-end on the preview deploy with Playwright (chromium). Test file: `e2e/funnel-walkthrough.spec.ts`.

## What works

| Surface | Result |
|---|---|
| Question card — touch target (Back button ≥ 44px) | ✅ 44px exact |
| EmailGate labels: Work email, Full name, Institution name | ✅ All three present, correctly labelled |
| Free-mail soft gate — focus moves to institution field on error | ✅ |
| Identity Freshness Banner — shows when localStorage populated | ✅ |
| "Not you? Start fresh" — clears localStorage | ✅ |
| Identity Freshness Banner — hidden when localStorage empty | ✅ |
| Signup form — empty when no sessionStorage stash | ✅ |
| Signup form — prefilled from sessionStorage handoff | ✅ |
| Signup form — sessionStorage cleared after consume | ✅ |
| Signup URL — no PII in query string | ✅ `/auth/signup?next=...` only |
| `/assessment/in-depth/take` — unauthenticated visit redirects to `/auth/login` | ✅ |

## Friction items (real UX gaps)

### F1 — EmailGate doesn't prefill from localStorage for returning users
Returning user opens `/assessment` after a prior session. localStorage holds email + fullName + institutionName from before. **The EmailGate renders all three fields empty.** Buyer retypes everything.

**Status:** Fixed in this commit. EmailGate now reads localStorage on mount and prefills any missing fields (set-if-empty merge so an in-progress edit isn't clobbered).

### F2 — Free-mail soft-gate error message doesn't appear via `role="alert"` consistently
The error fires and focus moves correctly (per the audit M2 fix), but `getByRole('alert')` in the test didn't find the message immediately. Likely an `aria-live` polling delay on the inline error element. Low priority; the user-visible behaviour is correct.

### F3 — Magic-link on `/auth/login`
Login page exposes a magic-link option. Per user direction we're moving to 2FA — this needs removal. See `docs/2fa-migration-plan-2026-05-23.md`.

### F4 — No 2FA enrollment / challenge
Confirmed via copy scan: no TOTP / authenticator / two-factor copy anywhere on `/auth/login` or `/auth/signup`. Needs the full migration plan.

## Preview-only observations (not real bugs)

### P1 — `/api/capture-email` returns `profileId: null` on preview
Preview env has `SKIP_SUPABASE_PROFILES=true` (per CLAUDE.md the preview is meant to suppress side effects). Consequence: `/assessment` doesn't redirect to `/results/<uuid>` because there's no profileId; ResultsView still renders inline from the in-memory state. **On production this branch will return a real profileId and the URL will update.**

### P2 — `mailerliteTagAdded: false` on preview
Same reason — `SKIP_MAILERLITE=true` is intentional on preview.

### P3 — Vercel Live Feedback script CSP violation
`https://vercel.live/_next-live/feedback/feedback.js` is blocked by the existing CSP. Harmless console noise on preview deploys only; not present in production.

## Walkthrough log (verbatim, chromium)

```
[INFO] auth-2fa-migration — Login page has 1 magic-link control(s) — must remove for 2FA flow
[INFO] auth-2fa-migration — No 2FA copy on login — need to add MFA challenge step
[OK]   a11y-touch-target — Back button height 44px ≥ 44px
[OK]   freshness-banner — Banner visible
[OK]   freshness-banner — "Not you?" cleared localStorage
[OK]   freshness-banner — Banner correctly absent when localStorage empty
[OK]   signup-empty — Empty signup form with no stash
[OK]   signup-prefill — sessionStorage prefill populated all three fields
[OK]   signup-prefill — sessionStorage cleared after consume
[OK]   signup-url-pii — Signup URL clean
[OK]   take-gate — Unauthenticated visit redirects to /auth/login
[OK]   assessment-q1 — First question rendered
[OK]   email-gate — Reveal heading visible after Q12
[OK]   email-gate — All three labels present
[OK]   email-gate-free-mail — Focus moved to institution field on free-mail error
[FRICTION] email-gate-returning — EmailGate does NOT prefill from localStorage (FIXED below)
```

## Stripe checkout path — not yet walked end-to-end

The Playwright walkthrough stops at the EmailGate submit. Verifying the full Stripe path (PurchaseButton → checkout session → /purchased → IdentityHandoff → signup prefill) requires:

- A working Stripe test mode key on the preview project (or live mode with a test card)
- Webhook delivery to the preview URL

Two manual steps to verify on production-like environment:
1. Complete a real-test-card purchase via PurchaseButton, confirm `/purchased` shows Identity Handoff populates sessionStorage, and the "Create my account" link goes to a clean URL.
2. Check Supabase auth.users.user_metadata for the buyer's email — should contain `full_name` + `institution_name` from the webhook → ensureAuthUser path.
