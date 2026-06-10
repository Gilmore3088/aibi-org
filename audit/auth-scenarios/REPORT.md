# Auth & Purchase Journey Audit — 2026-06-10

Independent scenario-level audit of the authentication and payment wiring,
requested after two field failures: (1) a free-assessment user was asked to
set a password before downloading their brief, and (2) a paid In-Depth buyer
hit a 404 after completing the assessment.

**Method.** Full code-trace of every identity touchpoint (three parallel
deep-dives: free assessment, paid In-Depth, course + core auth), plus a live
browser walk of the five customer journeys against a local dev server
(`scripts/auth-scenario-audit.mjs`, evidence in `report.json` +
`screenshots/`). Production + live Stripe testing with the QATEST100 promo
code could **not** be executed from this environment — the session's network
allowlist blocks `aibankinginstitute.com` and `stripe.com` (see §6 for the
ready-to-run production runbook).

---

## 1. The identity model (why these bugs exist)

The platform has **three ledgers** that all claim to know who a person is:

| Ledger | Keyed by | Created when |
|---|---|---|
| `auth.users` (Supabase) | user id + email | email capture (`ensureAuthUser`), signup, or Stripe webhook |
| `user_profiles` | `id` (= auth user id, usually) + **exact-string** unique `email` | free/paid assessment result upsert |
| `course_enrollments` | `stripe_session_id`, `email`, nullable `user_id` | Stripe webhook |

…but only one **session** mechanism: a Supabase cookie that exists *only*
after the user clicks an emailed link or types a password. **Email capture
creates an account but never a session** (`/api/capture-email` calls
`ensureAuthUser()` and even generates a magic link, but nothing signs the
browser in). Every gap below is some surface assuming a session exists when
the journey never created one, or assuming the three ledgers agree when
they're linked by exact email strings written at different times.

---

## 2. Scenario matrix (the five journeys)

### S1 — First-time visitor, no login → free assessment
**Status: BROKEN at the download step (reported bug confirmed in code + UX walk).**

Flow: `/assessment/take` → 12 questions → `EmailGate` → POST
`/api/capture-email` (creates auth user + profile, **no session**) →
`router.replace('/results/{profileId}')` (bearer-token page, renders fine) →
user clicks **Download** on the working-artifact card.

Root cause chain:
1. `PdfDownloadButton.tsx:54-66` — checks `/api/auth/me`; email-only users have no cookie → `auth-prompt`.
2. `SignupModal.tsx:62` — "**Set a password to download**" modal (the exact UX you hit).
3. `api/assessment/pdf/download/route.ts:31-40` — endpoint requires `auth.uid() === profileId`, so the gate is real, not just cosmetic.

The incoherence: the **results page itself is a bearer-token URL** — anyone
holding `/results/{id}` already sees every number in the PDF. Gating the PDF
of the same data behind password creation protects nothing and breaks the
email-gate promise ("enter your email to get the breakdown"). Meanwhile the
*other* free download on this surface (`/api/assessment/starter-artifact/[dimension]`)
deliberately requires **no auth**. Two artifacts, same page, opposite gates.

**Recommended fix:** accept the bearer pattern for the brief PDF — let
`/api/assessment/pdf/download?profileId=` serve when the request carries the
profileId that the results page already exposes (optionally a signed
short-lived token embedded in the page). Keep the password prompt as an
*optional* "save your dashboard" upsell, not a download blocker.

### S2 — First-time visitor → paid In-Depth assessment ($99)
**Status: WIRED, with two real failure windows + one dead CTA.**

Happy path is correctly built: `/api/checkout/in-depth` →
`success_url=/assessment/in-depth/purchased?session_id=…` (validated against
Stripe, `payment_status==='paid'`) → sign-up/sign-in CTAs with
`next=/assessment/in-depth/take` → entitlement gate → 48 questions →
server-side scoring → `/assessment/in-depth/results/{profileId}` (v4 report).
`allow_promotion_codes: true` is set (QATEST100 will work). Webhook is
idempotent on `stripe_session_id`.

Failure windows:
- **Webhook race (HIGH):** Stripe redirects the buyer instantly; enrollment is
  written by the *async* webhook. A buyer who clicks straight through to
  `/assessment/in-depth/take` before the webhook lands fails the entitlement
  gate (`take/page.tsx:65-72`) and is bounced to
  `/assessment/in-depth?reason=no-purchase` — "purchase required" seconds
  after paying. No retry/poll/provisioning-spinner exists.
- **Post-completion 404 (your report): no fix is on main yet.** Nothing in
  the git history addresses it, so if it's being fixed it's on an unpushed
  branch. Code-level candidates, in likelihood order: (a) older deploy
  redirected to a results route that didn't exist yet; (b) profile-row re-key
  (`back-fill-profile.ts:55-61`) invalidating an in-flight `profileId`;
  (c) `user_profiles` upsert keyed on exact email string diverging from the
  session email (case/alias variant) creating a row the redirect can't find.
  The current code path (submit → `upsertReadinessResult` → redirect to the
  returned id, loaded via service-role client) is sound — verify on prod with
  the §6 runbook before considering it closed.
- **Dead CTA (HIGH):** the success page's third option, **"EMAIL ME A SIGN-IN
  LINK"** (`purchased/page.tsx:264`), links to `/auth/login?mode=magic&…`.
  The login page has **no `mode` handling at all** — magic-link sign-in was
  retired 2026-05-28 (#187) and this CTA was never updated. A first-time buyer
  *has no password*; their advertised passwordless path drops them on a
  password form. They must notice "forgot password" to recover. Fix: remove
  the CTA or point it at the password-setup action (`sendPasswordSetupAction`).

### S3 — First-time visitor → AiBI-Foundation course ($295)
**Status: WIRED; same race class, plus an expectation mismatch.**

`/api/create-checkout` → `/courses/foundation/program/purchased?session_id=…`
(validated; promo codes enabled) → webhook provisions
`course_enrollments(product='foundation')`, creates the auth user, emails a
magic link. Success page shows a 3-step ladder whose Step 2 is "Open Module 1"
— but a new signup is intercepted by the onboarding gate
(`program/layout.tsx`, ONBD-02) and lands on `/onboarding`, not Module 1.
Minor, but the ladder promises something the gates don't deliver.

Silent-failure risk (MEDIUM): if `ensureAuthUser`/`generateMagicLink` throws,
the webhook just warns (`webhooks/stripe/route.ts:114-120`) and the purchase
email goes out **without a sign-in link**, and the enrollment keeps
`user_id=null` until some later `/auth/callback` backfills it. The buyer paid
$295 and has no working entry path except guessing at signup/forgot-password.

### S4 — Returning free-assessment lead comes back and pays
**Status: MOSTLY WIRED via email matching; two real gaps.**

If they pay with the **same email** (or a Gmail dot/+alias variant): webhook
`resolveUserId` does exact-then-canonical matching, the entitlement lookup
queries `user_id OR emailVariants(email)`, and `/auth/callback` →
`backFillProfile` binds enrollments and re-keys the profile. The wiring is
genuinely there — this part of phases 1–4 did get connected.

Gaps:
- **Old emailed result links break (MEDIUM):** `backFillProfile` re-keys
  `user_profiles.id` to the auth user id (`back-fill-profile.ts:55-61`).
  The `/results/{oldId}` link sitting in their inbox from the free assessment
  then 404s — and `/results/[id]` has **no custom not-found**: they get the
  generic "404 · PAGE NOT FOUND — not in our archive" (verified in the UX
  walk, `S4-1` vs the paid surface's explanatory `S4-2` 404 with a recovery
  path). The person most likely to hit the generic 404 is a *lead returning
  via your own email* — the exact person you're trying to convert.
- **Exact-string upsert key (MEDIUM):** `upsertReadinessResult` upserts
  `onConflict: 'email'` with the raw string (`user-profiles.ts:50-72`) — no
  lowercase/canonicalization, unlike every other identity surface. A lead who
  typed `Jane@Bank.com` at the gate and later signs in as `jane@bank.com`
  gets **two profile rows** and their history splits. Also note: paying for
  In-Depth and submitting **overwrites** the same row's v3 free result with
  v4 (single row per email) — the free score is gone; fine if intentional,
  worth knowing.

### S5 — Returning paid user re-enters
**Status: WIRED.** `/dashboard`, course modules, and `/assessment/in-depth/access`
gate on auth with `next=` preserved (verified live for `/access`; dashboard
rendered locally only because of the documented preview bypass — production
hard-floors it). New-device logins go through the trusted-device email
confirmation (10-min token, 90-day cookie, same-browser enforcement).
Re-entry paths to a paid report: emailed bearer link, or login → dashboard.
Stale paid-result links land on the custom, recoverable 404.

---

## 3. Consolidated findings

| # | Sev | Finding | Where |
|---|-----|---------|-------|
| F1 | **HIGH** | Free-assessment download demands password; PDF gate contradicts the bearer-token results page and the no-auth starter artifact | `PdfDownloadButton.tsx:54-66`, `api/assessment/pdf/download/route.ts:31-40`, `SignupModal.tsx` |
| F2 | **HIGH** | Post-payment webhook race: just-paid buyer can hit "purchase required" on `/assessment/in-depth/take` (same class applies to course Module 1) | `take/page.tsx:65-72`, webhook async provisioning |
| F3 | **HIGH** | "EMAIL ME A SIGN-IN LINK" CTA points at retired `mode=magic` — login page ignores the param; passwordless buyers stranded on a password form | `assessment/in-depth/purchased/page.tsx:264`, `auth/login/page.tsx` |
| F4 | **HIGH** | In-depth post-completion 404 (your report) has **no fix on main**; candidates documented in §2-S2 — needs prod verification | submit → results redirect path |
| F5 | MED | `backFillProfile` re-keys profile id → previously emailed `/results/{id}` links 404 | `back-fill-profile.ts:55-61` |
| F6 | MED | `/results/[id]` lacks a custom not-found (generic "archive" 404); paid surface has a good one — copy it | `src/app/results/[id]/` |
| F7 | MED | `user_profiles` upsert keys on raw exact email string (no canonicalization) → split identities on case/alias variants | `user-profiles.ts:50-72` |
| F8 | MED | Webhook swallows `ensureAuthUser`/magic-link failures → purchase email without sign-in link, enrollment `user_id=null` | `webhooks/stripe/route.ts:114-120` |
| F9 | LOW | Course success ladder says "Open Module 1" but new signups are routed to onboarding first | `program/purchased/page.tsx`, `program/layout.tsx` |
| F10 | LOW | In-Depth submit overwrites the free v3 result (one row per email) — silent history loss | `upsertReadinessResult` |
| F11 | INFO | Promo codes enabled on **both** checkouts (`allow_promotion_codes: true`) — QATEST100 will surface in Stripe Checkout | both checkout routes |
| F12 | INFO | Solid: idempotent webhook, server-side scoring, scanner-safe GET/POST callback, open-redirect guard, trusted-device flow, exact+canonical user resolution (post 2026-05-11 incident) | — |

**Priority order if you fix nothing else:** F1 (kills the free funnel's
payoff moment), F3 (strands paid buyers — likely a contributor to your "auth
feels broken after paying" experience), F2 (every fast buyer can hit it), F4
(verify on prod; reopen if reproducible).

---

## 4. What was tested live (local, degraded mode)

`node scripts/auth-scenario-audit.mjs` against `next dev` without
Supabase/Stripe credentials — 24 steps, screenshots in `screenshots/`:

- Free assessment driven end-to-end through the email gate; capture-email
  returned 200; inline fallback rendered (no profileId locally, so the gated
  download button is hidden — the password modal repro is by code-trace, F1).
- Both checkout APIs return their documented degraded 503s; both Stripe
  success pages render and every CTA on them was harvested and probed —
  **zero dead links** on current main (the `mode=magic` CTA is "live" as a
  URL; it's the behavior that's dead).
- Route-existence sweep of all 23 flow-target routes: only expected 404s
  (`/assessment/results`, `/assessment/in-depth/start|results` bare paths —
  nothing links to them).
- Stale-link UX captured for both result surfaces (F6 evidence).
- Gate redirects with `next=` preservation verified where Supabase isn't
  required; dashboard-family gates auto-pass locally via the documented
  preview bypass and must be re-verified on prod.

## 5. What could NOT be tested from this environment

The session's network policy only allows package registries: requests to
`www.aibankinginstitute.com`, `checkout.stripe.com`, and `api.stripe.com`
return "Host not in allowlist" (403 at the egress proxy). Therefore **no
live QATEST100 purchases were executed**. To let a future cloud session run
§6 automatically, add those three hosts to the environment's network
allowlist (Claude Code on the web → environment settings → network policy).

## 6. Production test runbook (QATEST100, both pay routes)

Run from any machine with normal network access; each scenario needs a fresh
`+alias` Gmail (e.g. `jlgilmore2+qa-YYYYMMDD-1@gmail.com`).

**A. In-Depth ($99 → $0):**
1. Incognito → `/assessment/in-depth` → purchase CTA → in Stripe Checkout
   click "Add promotion code" → `QATEST100` → total $0 → pay.
2. On the success page, note the three CTAs. **Expected failure (F3):**
   "EMAIL ME A SIGN-IN LINK" lands on a plain password login.
3. *Immediately* click through to take the assessment. **Expected failure
   (F2)** if you're fast: bounce to `?reason=no-purchase`. Wait 30s, retry.
4. Create the account, complete all 48 questions, watch the redirect —
   this is the F4 repro point. Record the exact URL if it 404s.
5. Check the inbox: purchase email present? Magic link present and working?
6. Close the browser, reopen, sign in → confirm the report is reachable from
   the dashboard and the emailed link.

**B. Foundation course ($295 → $0):**
1. Fresh incognito + fresh alias → `/courses/foundation/program/purchase` →
   enroll → `QATEST100` → pay.
2. Success page: follow Step 1 (create account) → confirm email → note where
   you land (F9: onboarding vs promised Module 1).
3. Confirm Module 1 opens, then sign out and back in on a "new device" to
   exercise the trusted-device email.

**C. Returning-lead linkage (S4):**
1. Take the free assessment with alias X; from the results email, save the
   `/results/{id}` link.
2. Buy the In-Depth with the *same* alias; create the account.
3. Re-open the saved free-results link. **Expected failure (F5/F6):** generic
   404 if the profile was re-keyed.

Afterwards: refund/void the $0 sessions if desired and delete the
`+qa-` test users (the e2e seed helper's cleanup pattern matches
`e2e+*@aibankinginstitute.test` only, so these Gmail aliases need manual
removal in Supabase).
