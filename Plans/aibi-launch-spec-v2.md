# AiBI Launch Spec — v2 (May 2026)

**Status:** Active. Single source of truth for May launch work.
**Supersedes:** `aibi-prd.html`, `aibi-foundation-v3.html`, `aibi-site-v3.html`,
`aibi-developer-spec.html`, `aibi-designer-brief.html`,
`aibi-consultant-playbook.html`, and the `foundation-v2/` bundle. Those
documents remain in the repo for historical context but are no longer
authoritative for current behavior. When they disagree with this file,
**this file wins.**

Companion: see [`DECISIONS.md`](../DECISIONS.md) for the chronological
override log that explains why each change happened.

---

## 1. Product ladder

The public site presents three offers. Every funnel surface (homepage,
assessment results, dashboard, emails) routes through them in this order.

### 1a. Free AI Readiness Assessment
- 12 questions, ~3 minutes.
- Eight AI readiness dimensions.
- Scoring range 12–48 (12 questions × 1–4 points).
- Score and tier label visible immediately. No email gate on the score.
- Email captures unlocks the dimension breakdown + a tailored starter
  artifact (one of eight, keyed to the user's lowest-scoring dimension).
- Primary purpose: lead capture and segmentation.
- Route: `/assessment` → `/assessment/start` → score → `EmailGate` →
  `ResultsViewV2`.

### 1b. In-Depth Assessment — $99 (or $79/seat at 10+ by email)
- 48 questions, ~20 minutes.
- Eight AI readiness dimensions (6 questions per dimension).
- Scoring range 48–192 raw; mapped to the same four tiers as the free
  assessment by percentile bands.
- Output: a personalized **Briefing** (~10–12 pages when printed)
  with peer-band comparison, dimension deep dives, a regulatory
  exhibit (SR 11-7, FFIEC, NCUA, FinCEN, CFPB, GLBA), an
  action register (90-day window), and a 12-week reference plan.
- One free retake within 12 months.
- Team checkout: **not self-serve.** Buyers requesting ≥10 seats must
  email `hello@aibankinginstitute.com`. The checkout endpoint returns
  503 for `mode=institution`.
- Route: `/assessment/in-depth` (landing) → `/assessment/in-depth/purchased`
  (post-Stripe) → `/assessment/in-depth/take` (gated by auth +
  entitlement) → `/assessment/in-depth/results/[profileId]` (Briefing).

### 1c. AiBI-Foundation Course — $295 (or $199/seat at 10+)
- Self-paced, 12 modules, ~6.6 hours.
- **Lifetime access** to: course modules, practice reps, artifact
  templates, prompt library/toolbox, learner dashboard/progress, and
  the AiBI-Foundation certificate path.
- Scored on reviewed work (not multiple-choice quizzes).
- Public product name: **AiBI-Foundation** or **AiBI-Foundation Course**.
- Internal identifier: `foundation` (DB, Stripe metadata). Legacy
  `aibi-p` (route `/courses/aibi-p`, DB rows from 2026-Q1, file path
  `public/AiBI-P/`, env vars `STRIPE_AIBIP_*`, cert ID prefix `AIBIP-`)
  is preserved as a read-side compatibility surface only — see §4.
- Route: `/courses/foundation/program` (overview) →
  `/courses/foundation/program/purchase` → `/purchased` → `/[module]`.

### Deferred / waitlist only (do not list as buyable)
- AiBI-Specialist (`AiBI-S`)
- AiBI-Leader (`AiBI-L`)
- Advisory engagements (Pilot · Program · Leadership Advisory)

---

## 2. Naming rules

| Element | Correct | Never use |
|---------|---------|-----------|
| Institute name in prose | **The AI Banking Institute** or **the Institute** | "AiBI helps…", "the AiBI approach…" |
| Brand mark (logo, seal, credential codes) | **AiBI** | AiBi, AIBI, aibi |
| Foundation course public name | **AiBI-Foundation** or **AiBI-Foundation Course** | AiBI-P, AiBI-Practitioner, AiBI Foundations, Banking AI Practitioner |
| Foundation internal slug | `foundation` | `aibi-p` (legacy read-only) |
| Foundation route | `/courses/foundation/program` | `/courses/aibi-p`, `/foundations` (redirected) |
| Specialist credential | AiBI-S (with role-track suffix when applicable) | BAI-S |
| Leader credential | AiBI-L | BAI-L |
| Tagline | **Turning Bankers into Builders** | "A-B-C of AI Banking" (retired) |

See [`DECISIONS.md`](../DECISIONS.md) entries 2026-04-15 (tagline),
2026-04-24 (fCAIO retired), 2026-05-06 (AiBI-P → AiBI-Practitioner →
AiBI-Foundation), and 2026-05-11 (one-course Foundation reversal).

---

## 3. Public routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Three-tile homepage ladder + ROI dossier | Active |
| `/assessment` | 12-question free assessment | Active |
| `/assessment/start` | Assessment entry | Active |
| `/assessment/in-depth` | In-Depth landing + pricing | Active |
| `/assessment/in-depth/take` | Paid 48-question runner (auth + entitlement gated) | Active |
| `/assessment/in-depth/results/[id]` | Briefing (bearer-token URL) | Active |
| `/assessment/in-depth/purchased` | Post-Stripe confirmation | Active |
| `/courses/foundation/program` | Course overview | Active |
| `/courses/foundation/program/purchase` | Stripe checkout landing (Lifetime access copy) | Active |
| `/courses/foundation/program/purchased` | Post-Stripe confirmation | Active |
| `/courses/foundation/program/[module]` | Module shell (gated) | Active |
| `/courses/foundation/program/artifacts/[artifactId]` | Artifact detail (gated) | Active |
| `/courses/foundation/program/tool-guides` | NotebookLM/Perplexity guides (gated) | Active |
| `/courses/foundation/program/gallery` | Output gallery (gated) | Active |
| `/courses/foundation/program/quick-wins` | Quick Win Tracker (gated) | Active |
| `/courses/foundation/program/certificate` | Certificate (gated) | Active |
| `/courses/foundation/program/prompt-library` | Redirects to `/dashboard/toolbox/library` | Active |
| `/courses/foundation/program/{onboarding,submit,toolkit,settings,post-assessment}` | Course shell pages (gated) | Active |
| `/practice/[repId]` | Practice rep runner (gated) | Active |
| `/dashboard` | Learner dashboard | Active |
| `/dashboard/toolbox/library` | Prompt library (Paywall for non-buyers) | Active |
| `/education` | Education hub (ladder + free classes) | Active |
| `/for-institutions` | Team/institutional engagement page | Active |
| `/auth/{login,signup,callback}` | Supabase auth with `?next=` support | Active |
| `/courses/aibi-p` | Redirects to `/courses/foundation/program` | Legacy redirect |
| `/services` | Redirects to `/for-institutions` | Legacy redirect |
| `/foundations` | Redirects to `/education` | Legacy redirect |

---

## 4. Entitlement model

### Storage
- `auth.users` — Supabase Auth identity.
- `user_profiles` — readiness scores keyed by email (free + In-Depth).
- `course_enrollments` — paid product entitlements:
  - `product='foundation'` — lifetime course access (current writes)
  - `product='aibi-p'` — same as foundation, legacy rows from 2026-Q1
  - `product='in-depth-assessment'` — In-Depth diagnostic access
- `entitlements` — toolbox/library Paid access (`getPaidToolboxAccess`).
- `institution_enrollments` — bulk Foundation purchases (10+ seats).

### Read shim
- `src/lib/products/normalize.ts` — `normalizeProduct()` collapses
  `'aibi-p'` and `'foundation'` to the canonical `'foundation'` slug at
  every read boundary (webhooks, enrollment lookups, entitlements,
  email job consumers).
- `dbReadValues('foundation')` returns `['aibi-p', 'foundation']` for
  Supabase `.in()` filters.
- This shim is **permanent**. Stripe retry events from 2026-Q1
  enrollments may land at any future date with
  `metadata.product='aibi-p'` and must collapse to `'foundation'`.

### Gates
- Server-component pages call `getEnrollment()` from
  `src/app/courses/foundation/program/_lib/getEnrollment.ts`.
- Email matching is canonicalized via `emailVariants()` to handle
  Gmail-style `user+alias@gmail.com` divergence between auth and
  Stripe-stored email.
- Non-enrolled visitor at a gated route → `redirect('/courses/foundation/program/purchase')`.
- Logged-out visitor → `redirect('/auth/login?next=<original-path>')`.

---

## 5. Pricing

| Product | Individual | Team (10+ seats) |
|---------|------------|------------------|
| Free Assessment | $0 | — |
| In-Depth Assessment | $99 | $79/seat (email `hello@aibankinginstitute.com`) |
| AiBI-Foundation Course | $295 | $199/seat self-serve at `/courses/foundation/program/purchase` |

### Stripe env vars
- `STRIPE_FOUNDATION_PRICE_ID` (with `STRIPE_AIBIP_PRICE_ID` fallback for legacy deployments)
- `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` (with `STRIPE_AIBIP_INSTITUTION_PRICE_ID` fallback)
- `STRIPE_INDEPTH_PRICE_ID`
- `STRIPE_INDEPTH_INSTITUTION_PRICE_ID` (reserved; In-Depth team checkout deferred)

### Operator dashboard checklist
Documented in `tasks/aibi-p-to-foundation-deploy-checklist.md`:
- Stripe product display names must read **AiBI-Foundation Course** and
  **In-Depth Assessment** (the legacy "AiBI-P" / "AiBI-Practitioner"
  strings must not appear on Stripe-hosted invoices or receipts).
- Foundation product description must mention lifetime access.

---

## 6. Assessment logic

### Free 12-question assessment
- Pool: `content/assessments/v2/questions.ts` (48 questions, 6 per dimension).
- Rotation: `content/assessments/v2/rotation.ts` selects 12 questions
  per session covering all eight dimensions.
- Persistence: `sessionStorage` key `aibi-assessment-v2` keeps state
  across mobile tab kills.
- Scoring: `getTierV2()` returns one of four tiers — Starting Point
  (12–20), Early Stage (21–29), Building Momentum (30–38), Ready to
  Scale (39–48).
- Score visible immediately; dimension breakdown + starter artifact
  gated behind email capture.

### Pre-email score-screen primary CTA
- `starting-point`, `early-stage` → `Take the In-Depth Assessment · $99` → `/assessment/in-depth`
- `building-momentum`, `ready-to-scale` → `Book Your Executive Briefing` → Calendly

### Post-email closing CTA
Driven by `TIER_CLOSING_CTA` in `content/assessments/v2/personalization.ts`:
- `starting-point`, `early-stage` → `/assessment/in-depth`
- `building-momentum`, `ready-to-scale` → `/for-institutions/advisory`

### Paid 48-question In-Depth assessment
- Pool: same 48 questions; all rendered in `useAssessmentInDepth`.
- Persistence: `sessionStorage` key `aibi-assessment-indepth`.
- Auth required (Supabase) + `course_enrollments.product='in-depth-assessment'` entitlement.
- Output: `/assessment/in-depth/results/[profileId]` (bearer-token URL).

---

## 7. Checkout and webhook

### Foundation course
- POST `/api/create-checkout` with `mode='individual'` or `mode='institution'` + `quantity` ≥ 10.
- Stripe Checkout session metadata: `product='foundation'`.
- Success URL: `/courses/foundation/program/purchased`.
- Cancel URL: `/courses/foundation/program/purchase`.

### In-Depth Assessment
- POST `/api/checkout/in-depth` with `mode='individual'`.
- `mode='institution'` returns 503 with "Email hello@... for bulk orders".
- Stripe Checkout session metadata: `product='in-depth-assessment'`.
- Success URL: `/assessment/in-depth/purchased`.

### Webhook
- POST `/api/webhooks/stripe`.
- Verifies Stripe signature (`stripe.webhooks.constructEvent`) before processing.
- Calls `provisionEnrollment()` which:
  - For `product='foundation'` or `'aibi-p'`: inserts `course_enrollments` row with `product='foundation'`.
  - For `product='in-depth-assessment'`: inserts `course_enrollments` row with that product slug.
- Sends Resend transactional email matching the product (see Resend Templates §7a).
- Rate-limited; signed retries within 5m de-duplicate by `stripe_session_id`.

### Resend transactional templates
Authored in the Resend dashboard so non-developers can edit copy:
- `assessment-results-breakdown`
- `course-purchase-individual`
- `course-purchase-institution`
- `certificate-issued`
- `inquiry-ack`

Sender: `hello@aibankinginstitute.com` (domain verified 2026-04-18).
Supabase Auth emails (signup confirm, password reset, magic link) go
through **Supabase Custom SMTP** using Resend as transport — those
templates live in the Supabase Auth dashboard, NOT in Resend Templates.

---

## 8. Dashboard access states

| State | Trigger | Next Action |
|-------|---------|-------------|
| Anonymous | `!user` | Take the Free Assessment |
| Free lead | `user.readiness` only | **Take In-Depth — $99** (primary) + Or preview Foundation (secondary) |
| In-Depth buyer | `user.readiness` + `assessments.inDepth.entitled` | Enroll in AiBI-Foundation — $295 (framed against existing diagnosis); In-Depth card below shows Briefing access |
| Foundation buyer | `dashboard.enrollment` set | Module N: title + Continue Lesson + Practice for 5 Minutes |
| Both | enrollment + In-Depth | enrollment Next Action + In-Depth card |

Gmail-alias entitlement matching via `emailVariants()` is wired
uniformly across module gates, In-Depth gate, and dashboard
`getEnrollment()`.

---

## 9. Launch QA checklist

The post-conference launch email goes out when ALL of these are checked.

- [ ] AIBankingInstitute.com DNS live, SSL active.
- [ ] Homepage three-tile ladder renders correctly on desktop and mobile.
- [ ] Free assessment functional, scoring correct (12-question, 12–48 scale).
- [ ] Free assessment: score + tier visible without email gate; dimension breakdown + starter artifact gated behind email.
- [ ] `sessionStorage` persistence verified by refreshing mid-assessment on iPhone Safari.
- [ ] `/api/capture-email` rate-limited; ConvertKit/MailerLite tagging active; HubSpot upsert tested.
- [ ] In-Depth Assessment landing renders pricing, deliverables, and team-contact copy.
- [ ] In-Depth Stripe Checkout completes; webhook provisions `in-depth-assessment` entitlement; buyer can access `/take`.
- [ ] In-Depth non-buyer attempting `/take` redirects with "Purchase required" notice on landing.
- [ ] Foundation Stripe Checkout completes; webhook provisions `foundation` entitlement; buyer can access `/[module]`.
- [ ] All Foundation lifetime-access assets gated for non-enrollees: modules, artifacts, tool-guides, gallery, quick-wins, prompt library, practice reps, certificate.
- [ ] Dashboard renders correctly for all five entitlement states.
- [ ] `/robots.txt` and `/sitemap.xml` serve plain text/XML even under `COMING_SOON=true` middleware.
- [ ] `/404` returns 404 when `COMING_SOON` is unset.
- [ ] Resend transactional emails arrive for: assessment breakdown, In-Depth purchase, Foundation purchase, certificate issued, inquiry ack.
- [ ] Supabase auth emails (signup, magic link, password reset) arrive via Custom SMTP.
- [ ] Plausible deferred-queue pattern installed; events firing.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] Operator Stripe dashboard: product display names read "AiBI-Foundation Course" and "In-Depth Assessment"; Foundation description mentions lifetime access.
- [ ] No public surface contains the banned phrase `FFIEC-aware`.
- [ ] All statistics on the site carry named source citations.

---

## 10. Deferred post-launch items

These are intentional gaps, not bugs. Document for the post-launch backlog.

- **In-Depth team self-serve checkout.** Currently 503 with email
  fallback. Seat-grant semantics differ from Foundation; needs its own
  table. Track in #93 follow-up.
- **AiBI-Specialist and AiBI-Leader content.** Marketing routes
  redirect to `/coming-soon` waitlist; products deactivated in Stripe.
- **Advisory engagements (Pilot · Program · Leadership Advisory).**
  Marketing copy points at `mailto:` until case studies exist.
- **PDF generation route** (`/api/assessment/pdf/warm`) needs `libnss3.so`
  on Vercel serverless. Pre-existing limitation.
- **Vercel Analytics vs Plausible decision.** Both running; pick one
  after launch data quality comparison.
- **A11y backlog from #92:** `role="list"` semantics on `/education`,
  color-contrast on `text-dust` wordmark subtitle, decorative-span
  `aria-prohibited-attr` in LMS sidebar.
- **e2e auth + api-gates tests** require seeded Supabase test users and
  proper API gate middleware. Not blocking launch.
- **Personal Prompt Library 18-field schema** is a fixed contract for
  future AiBI-S / AiBI-L compatibility — do not change without a
  cross-product migration plan.

---

## Document conventions

- This is the **active** launch spec. Treat it as authoritative.
- When current code contradicts this spec, file an issue. When this
  spec contradicts older planning HTML, the older HTML is the one in
  the wrong.
- New product decisions land in `DECISIONS.md` first, then get
  reflected here.
- Operator-only items (Stripe dashboard, env var rotation, DNS) live in
  `tasks/aibi-p-to-foundation-deploy-checklist.md`.
