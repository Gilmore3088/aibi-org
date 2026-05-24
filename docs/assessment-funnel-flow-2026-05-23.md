# Assessment Funnel — End-to-End Auth & Gates Walkthrough

**Date:** 2026-05-23
**Scope:** Every surface in the free-assessment → In-Depth purchase → signup → take-assessment funnel, plus what the user is asked for at each step and where data is prefilled from.

## Pre-fix friction summary

The buyer entered the same three fields (name, email, institution) up to three times:

| Step | Asked for | Pre-filled? |
|---|---|---|
| EmailGate (`/assessment`) | email, firstName, institutionName | — first capture |
| Stripe Checkout | email | yes (from PurchaseButton localStorage read) |
| `/auth/signup` | fullName, email, institutionName, password | **only email** |

Root cause: `firstName` and `institutionName` were captured at the gate, sent to Supabase, but **never persisted to client storage** for reuse. The signup page didn't accept `?firstName=` or `?institutionName=` even if we passed them.

## Post-fix flow

### Step 1 — `/assessment` (free 12-question diagnostic)

- Public route, no auth.
- 12 questions → EmailGate (one capture).
- EmailGate **captures**: email, firstName (optional), institutionName (optional), marketingOptIn (optional).
- POSTs to `/api/capture-email` → MailerLite + Resend + Supabase (server-side persist).
- Writes to localStorage `aibi-user`:
  - `email` (always)
  - `firstName` (when provided)
  - `institutionName` (when provided)
  - `readiness` (score + tier + dimension breakdown)
- Page swaps URL to `/results/<profileId>` via `history.replaceState`.

### Step 2 — Results display

Two rendering paths, same component:

- **Inline on `/assessment`** (immediately after capture) — `ResultsViewV2` from `useAssessmentV2` state.
- **`/results/[id]`** (bookmarkable, returns later) — `ResultsPage` calls `loadAssessmentResponse(id)` which queries Supabase by `user_profiles.id`. The UUID itself is the bearer token; no auth required.

Closing CTA (per tier — `content/assessments/v2/personalization.ts → TIER_CLOSING_CTA`):

| Tier | Primary | Secondary | Tertiary |
|---|---|---|---|
| Starting Point | `/courses/foundation/program` ($295) | `/assessment/in-depth` ($99) | `/for-institutions/advisory` |
| Early Stage | `/courses/foundation/program` | `/assessment/in-depth` | `/for-institutions/advisory` |
| Building Momentum | `/courses/foundation/program` | `/assessment/in-depth` | `/for-institutions/advisory` |
| Ready to Scale | `/for-institutions/advisory` | `/courses/foundation/program` | `/assessment/in-depth` |

URLs are static — identity rides forward via localStorage, not query params.

### Step 3 — `/assessment/in-depth` landing

- Public route.
- Server tries `supabase.auth.getUser()` → `signedInEmail` (null if not signed in).
- `PurchaseButton` reads:
  - `userEmail` prop (from server `getUser`), then
  - localStorage `aibi-user` for email + **firstName + institutionName** (new).
- On click, POSTs to `/api/checkout/in-depth` with `{ mode, user_email, first_name, institution_name }`.

### Step 4 — `/api/checkout/in-depth`

- Validates body, rate-limits, creates a Stripe Checkout Session with:
  - `customer_email` = the email (Stripe shows it pre-filled at checkout).
  - `metadata.user_email`, `metadata.first_name` (new), `metadata.institution_name` (new).
- Returns the Stripe Checkout URL; client redirects.

### Step 5 — Stripe Checkout (external)

- User confirms email + adds payment method.
- On success → `${origin}/assessment/in-depth/purchased?session_id={CHECKOUT_SESSION_ID}`.

### Step 6 — `/assessment/in-depth/purchased`

- Server route; reads `session_id`.
- Tries `supabase.auth.getUser()` first. If signed in → "Begin the assessment" CTA → `/assessment/in-depth/take`.
- If not signed in, calls `getSessionIdentity(session_id)` (new helper, replaces `getSessionEmail`) → returns `{ email, firstName, institutionName }` from Stripe session metadata.
- Builds the signup/login URLs with **all three** query params:

  ```
  /auth/signup?next=/assessment/in-depth/take
              &email=name@bank.com
              &firstName=Sarah
              &institutionName=First+Federal
  ```

### Step 7 — `/auth/signup`

- Reads query params:
  - `?email=` → email field
  - `?firstName=` (or legacy `?fullName=`) → fullName field
  - `?institutionName=` → institution field
- All three are sanitized (length cap + control-char rejection) and editable.
- Submit calls Supabase signUp with `fullName` + `institutionName` metadata.
- Supabase sends email-confirmation link → `/auth/callback?next=/assessment/in-depth/take`.

### Step 8 — `/auth/login` (alternate path)

- Same query-param scheme so "I already have an account" preserves the deep-link target.
- Identity prefill on login is just email (name + institution come from the existing Supabase user, not the URL).

### Step 9 — `/assessment/in-depth/take`

- Auth gate: `supabase.auth.getUser()` → redirect to `/auth/login?next=/assessment/in-depth/take` if absent.
- Enrollment gate: `findEnrollmentByEmailOrUserId` on `course_enrollments` where `product='in-depth-assessment'`. Redirects to `/assessment/in-depth?reason=no-purchase` if absent.
- Renders `<InDepthRunner />` — 48 questions + role selector ("Which seat are you reading from?").
- Role is a new datapoint — not captured upstream, so this is the only legitimate prompt.

### Step 10 — `/assessment/in-depth/results/[id]`

- Bearer-token URL, same shape as `/results/[id]`. No auth.
- Loads from Supabase, renders the In-Depth Briefing surface.

## Post-fix re-prompt tally

| Field | Asked at | Pre-filled at |
|---|---|---|
| email | EmailGate | Stripe Checkout, /auth/signup, /auth/login |
| firstName / fullName | EmailGate | /auth/signup (via Stripe metadata) |
| institutionName | EmailGate | /auth/signup (via Stripe metadata) |
| password | /auth/signup | — (genuinely new) |
| role | /assessment/in-depth/take | — (genuinely new) |

**Total re-prompts removed:** 2 fields (fullName, institutionName) × 1 surface (signup) = 2 fewer keystrokes worth of typing across the funnel.

## Caveats

1. **The Foundation course checkout** (`/courses/foundation/program`) has its own purchase flow that this change doesn't touch. If buyers complete the free assessment → click the *primary* CTA on results (Foundation, not In-Depth), they hit a separate funnel that may have the same re-prompt problem. Worth a parallel pass.
2. **Stripe Checkout's own "name" field** doesn't accept a `first_name` pre-fill via the Sessions API — Stripe only takes `customer_email` and full Customer creation. We attach to metadata instead and consume on return.
3. **Magic-link sign-in** (`signInWithMagicLink`) is a different code path that doesn't need name/institution prefill. Not touched.

## Verification checklist

- [ ] Complete `/assessment` with email + firstName + institutionName at EmailGate
- [ ] Open DevTools → Application → Local Storage → `aibi-user` should show `email`, `firstName`, `institutionName`, `readiness`
- [ ] Click "Take the In-Depth Assessment · $99" on results → land on `/assessment/in-depth`
- [ ] Click Purchase → Stripe Checkout opens with email pre-filled
- [ ] Complete a test purchase → land on `/assessment/in-depth/purchased`
- [ ] If not signed in: "Create my account" link should have `?firstName=`, `?email=`, `?institutionName=` in URL
- [ ] On `/auth/signup`: Full name, Email, Institution all pre-filled and editable
- [ ] Submit signup → confirmation email lands on `/auth/callback?next=/assessment/in-depth/take`
- [ ] On `/assessment/in-depth/take`: 48 questions + role selector are the only new prompts
