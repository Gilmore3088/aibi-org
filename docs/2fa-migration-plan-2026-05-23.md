---
status: planning
created: 2026-05-23
owner: jgmbp
---

# Auth migration — remove magic links, add 2FA (TOTP)

**Decision (2026-05-23):** No magic-link auth. Move to email + password + TOTP-based 2FA (authenticator app). Supabase MFA supports this natively.

## Why

Magic links are an "anyone with the email can sign in" credential. For an institution-facing product carrying readiness scores, payment receipts, and Foundation course progress, that's not acceptable. 2FA gives us a second factor a stolen-mailbox attacker can't replay.

## Current state

| Surface | Today | After |
|---|---|---|
| `/auth/login` | Email + password OR magic link button | Email + password (no magic link) |
| `/auth/signup` | Email + password + name + institution + terms | Same + TOTP enrollment immediately after confirm |
| `/auth/callback` | Exchanges magic-link / email-confirmation token | Email-confirmation only |
| Stripe webhook | Creates auth user + generates magic link in welcome email | Creates auth user; welcome email links to `/auth/login` |
| Post-login | Goes to `next=` or `/dashboard` | If user has no MFA factor enrolled → `/auth/2fa/setup`; else MFA challenge → `next=` |
| Session refresh | Standard cookie | Standard cookie + AAL2 (`assurance_level: 'aal2'`) |

## Supabase MFA primitives

Supabase Auth supports MFA out of the box via the `mfa` API:

- `supabase.auth.mfa.enroll({ factorType: 'totp' })` — returns a QR code + factor id
- `supabase.auth.mfa.challenge({ factorId })` — issues a challenge
- `supabase.auth.mfa.verify({ factorId, challengeId, code })` — verifies the TOTP code, elevates session to AAL2
- `supabase.auth.mfa.unenroll({ factorId })` — remove
- `supabase.auth.mfa.listFactors()` — list enrolled factors

Server config (Supabase dashboard → Authentication → Multi-Factor Authentication): set TOTP enforcement to "Required for all users" for full hard-stop, or "Optional" while migrating existing users.

## Phased migration

### Phase 1 — Stop the bleed (this commit)

- **Remove magic link from welcome email** sent by Stripe webhook (`/api/webhooks/stripe`). Buyer gets a "Sign in to start" link to `/auth/login?next=/assessment/in-depth/take` instead.
- **Remove `magicLinkUrl` parameter** from `sendIndepthAssessmentPurchase`, `sendCoursePurchaseIndividual`, `sendCoursePurchaseInstitution` adapters (`@/lib/resend`).
- **Stop calling `generateMagicLink`** in the webhook. The function stays available for emergency use cases (account recovery) but isn't part of the normal flow.
- **Remove the "Email me a magic link" control** from `/auth/login`.
- Leave `/auth/forgot-password` reset flow as-is for now (it's a different recovery path).

### Phase 2 — TOTP enrollment scaffold

- Add `/auth/2fa/setup` route — TOTP enrollment with QR code + manual entry key. Calls `supabase.auth.mfa.enroll` then walks the user through a verify step.
- Add `/auth/2fa/verify` route — TOTP challenge surface used both for enrollment confirmation and step-up at login.
- Add `lib/supabase/mfa.ts` — thin wrappers (enrollTotp, verifyChallenge, requireAAL2) so callers don't duplicate the SDK shape.

### Phase 3 — Wire 2FA into the login flow

- `/auth/login` submit:
  1. `signInWithPassword(email, pw)` — returns session
  2. If `data.user?.factors?.length > 0` → redirect to `/auth/2fa/verify?next=<original>`
  3. Else → no factor enrolled yet → redirect to `/auth/2fa/setup?next=<original>` (forced enrollment)
- `/auth/2fa/verify`:
  - Reads factorId from session, calls `mfa.challenge`, prompts user for 6-digit code
  - On verify success → session is AAL2, redirect to `next=` or `/dashboard`

### Phase 4 — Enforce AAL2 on gated surfaces

- `/dashboard/**`, `/courses/foundation/program/**`, `/assessment/in-depth/take` layouts:
  - Check `data.session?.factor_id` or `(await supabase.auth.mfa.getAuthenticatorAssuranceLevel()).currentLevel === 'aal2'`
  - If `aal1`, redirect to `/auth/2fa/verify?next=<current>`

### Phase 5 — Backfill existing users

- Existing users who signed up before Phase 2 have no factor enrolled.
- On their next login, Phase 3 forces them through `/auth/2fa/setup`.
- A one-time email blast (optional) warns the change is coming.

### Phase 6 — Recovery + backup codes

- Add `lib/supabase/mfa-backup-codes.ts` — generate, store hashed, list, verify.
- Add UI under `/dashboard/security` to view + regenerate backup codes.
- Update `/auth/2fa/verify` to accept a backup code instead of a TOTP code.

## Open questions

1. **SMS as a backup factor?** Supabase MFA supports phone factor. Adds Twilio cost, but useful for the "lost my phone" case. Recommend keeping backup codes as primary recovery and skipping SMS for cost reasons.
2. **TOTP secret storage** — Supabase stores the seed encrypted with their internal key. We never see the raw seed; only the user's authenticator app does.
3. **Enrollment device assumption** — TOTP enrollment requires a working authenticator app at signup. Some banking-association users may not have one. Plan: short copy walking them through "Install Microsoft Authenticator, Google Authenticator, or 1Password" at the top of `/auth/2fa/setup`.
4. **Exec briefing booking flow** — Calendly link doesn't touch our auth, so 2FA doesn't affect it.

## Acceptance criteria

- [ ] `/auth/login` has no magic-link button or link
- [ ] Welcome emails (course, in-depth, foundation) contain no magic-link URL
- [ ] Stripe webhook no longer calls `generateMagicLink`
- [ ] New signup → email confirmation → `/auth/2fa/setup` → TOTP enrolled → access granted
- [ ] Existing user login → password OK → MFA challenge → 6-digit code → AAL2 → access granted
- [ ] Dashboard reachable only at AAL2
- [ ] Recovery code path works (or "contact support" copy explicit on the lost-phone screen)
- [ ] Playwright tests cover: signup→enroll→verify, login→challenge, lost-code→backup, no-factor→forced-enrollment
