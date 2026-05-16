# Decisions Log

Companion to [`CLAUDE.md`](./CLAUDE.md). Chronological record of overrides and direction changes. Add entries here (not in CLAUDE.md) when overriding something in the plans so future sessions do not relitigate. Newest entries go at the bottom.

**2026-04-15 — Score gated behind email capture.** PRD originally said "score
visible without email gate" for conversion reasons. User override: capture
every completer's email, even at the cost of completion rate. Tradeoff
accepted. Committed in `d46d99b`. **Superseded 2026-04-27** — see entry below.

**2026-04-15 — Peer benchmarks deferred to Phase 1.5+.** User wanted
"you rank Nth percentile" teasers; honest constraint is zero respondents yet.
Parked in `tasks/todo.md` Phase 2 backlog until Supabase is wired and N >= 30
per segment exists.

**2026-04-15 — "A-B-C of AI Banking" retired as public tagline.** Per v1
landing page PRD feedback doc. Replaced with "We turn your bankers into your
builders" then tightened to "Turning Bankers into Builders" same day. The
three pillars remain as curriculum framework but are described, not branded
as an acronym. No "A-B-C" pills, badges, or labels anywhere on public site.

**2026-04-15 — Upstash / rate limiting deferred.** Zero traffic; add the week
before launch. Ship without rate limiting on `/api/capture-email` for now.

**2026-04-15 — Kit vs Loops / HubSpot vs Attio undecided.** User to pick when
creating accounts. Stubs in `src/lib/convertkit` and `src/lib/hubspot` are
adapter-shaped either way — wiring is a 20-minute job per service once a
vendor is selected.

**2026-04-15 — Third-party integrations deferred for prototype phase.**
User direction: focus on site-build work that requires no external accounts.
Calendly, Supabase, Kit/Loops, HubSpot/Attio, Stripe, Upstash all
deferred. When accounts exist, wire adapters in order: Supabase first (data
capture), then ConvertKit or Loops (newsletter), then HubSpot or Attio
(CRM), then Calendly (briefing booking), then Stripe (Phase 2
monetization). Course delivery is in-house — see 2026-05-05 entry.

**2026-04-17 — Supabase activation reverses prior deferral.** Connected
Supabase MCP, applied 7-table schema (already present), added security-
hardening migration (00004) for `set_updated_at` search_path and
`institution_enrollments` deny-all policy. Auth verified end-to-end
(signup → email confirm → /dashboard). Branch:
`feature/supabase-activation`.

**2026-04-17 — Dev bypass mocks removed entirely.** The `SKIP_DEV_BYPASS`
escape hatch in 17 server-side files was returning hardcoded mock data
in development, hiding the fact that every dev login showed the same
"user." Removed all 18 bypass blocks (-203 lines) instead of toggling
via env var. Real auth now required in dev (matches production behavior).

**2026-04-17 — Resend chosen for transactional email.** Replaces
Supabase's throttled built-in email service (~3-4 emails/hour limit).
Configured via Custom SMTP in Supabase Auth Settings using `smtp.resend.com:465`.
Domain `aibankinginstitute.com` verified in Resend on 2026-04-18; sender
swapped to `hello@aibankinginstitute.com` on 2026-05-06 (see entry below).
Free tier: 100/day, 3,000/month.

**2026-04-17 — ConvertKit (Kit) chosen over Loops.** Resolves the
2026-04-15 Kit vs Loops decision. ConvertKit handles marketing email
(newsletter, drip campaigns, sequences). Resend handles transactional
(auth confirmations, password resets). Wiring pending API key + form IDs.

**2026-04-17 — `/courses` and `/certifications` merged into `/education`.**
User direction: reduce nav clutter. New IA: Education hub has two
sections — Classes (free entry points: assessment + newsletter +
future short videos) and Certifications (paid AiBI-P/S/L tracks).
Top nav reduced from 5 items to 4 (removed Courses + Certifications,
added Education). Old URLs redirect via `next.config.mjs`. Sub-routes
preserved: `/courses/aibi-p`, `/courses/aibi-s`, `/courses/aibi-l`,
`/certifications/exam/*`.

**2026-04-17 — Foundations folded into Education hub.** Foundations
($97 5-module course) was already retired (redirected to /courses/aibi-p
due to pricing inversion: Foundations cost more than AiBI-P). Now
redirects to `/education` instead. Future free "Class" content can fill
the slot Foundations vacated.

**2026-04-17 — Vercel Analytics added alongside Plausible.** Vercel
Analytics installed and wired in root layout for the upcoming Vercel
deploy. Plausible setup remains in place. Open question: keep both,
or drop one. Vercel Analytics is free and built-in; Plausible has a
better privacy story for non-US visitors. Decision deferred until
both are running and we can compare data quality.

**2026-04-24 — `/services` reworked to `/for-institutions`; education-first
positioning.** The old consulting page led with three implementation tiers
(Quick Win Sprint / Audit / Transformation), which contradicted the
"Turning Bankers into Builders" tagline. Rebuilt as `/for-institutions`
with three *enrollment* tiers (Individual / Team cohort / Institution-wide
capability program) plus a free self-serve sample library. The three
consulting engagements were reframed as coaching that pairs with a
cohort and moved to `/for-institutions/advisory` (Pilot · Program ·
Leadership Advisory). Old `/services` URL 301s to `/for-institutions`;
top nav relabelled "For Institutions". Prices removed from advisory
tiers until case studies exist. The "Quick Win Sprint" phrase was
retired across the codebase.

**2026-04-24 — `AiBI fCAIO` retired as a public product name.** The
reserved use of "AiBI" for the fCAIO program (one of the four canonical
uses listed earlier in this file) is discontinued. Leadership Advisory
is the new name; "fractional Chief AI Officer" remains available as a
descriptor in prose where it clarifies shape. Credential codes
(AiBI-P/S/L) and the circular seal are unaffected.

**2026-04-27 — Email gate is partly-gated with substantive value.**
Supersedes the 2026-04-15 full-gate decision. The current shape:
**score + tier visible without email** (the headline diagnostic the
PRD originally promised); **dimension breakdown + tailored starter
artifact gated behind email capture**. Rationale: a thin gate ("just
ask for the email") feels extractive; a substantive gate ("you handed
us your email, here's a real artifact you can take to your team this
week") earns the conversion. Eight dimension-keyed starter artifacts
live in `content/assessments/v2/starter-artifacts.ts` — one per
lowest-scoring dimension. Server-side persistence of dimension
breakdown added in migration `00011_readiness_dimension_columns.sql`.
Resend transactional email is deferred — the artifact is on-screen,
copy-to-clipboard, and download-as-md only for now.

**2026-05-04 — Four-surface assessment results program shipped.**
Brainstormed and shipped over a single sprint: Spec 1 (briefing
reshape, PR #40), Spec 2 (PDF download, PR #41), Spec 3 (ConvertKit
tier sequences, PR #42), Spec 4 (owner-bound `/results/{id}` URL,
PR #43). All four merged to main. Operator setup remaining: Vercel
env vars (CRON_SECRET, four CONVERTKIT_TAG_ID_*, CONVERTKIT_API_SECRET,
RESEND_API_KEY, HUBSPOT_API_KEY, NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
NEXT_PUBLIC_CALENDLY_URL, AI keys) plus four ConvertKit Tags +
four Sequences with 12 emails authored. Tracked at
`tasks/weekend-env-setup.md`.

**2026-05-05 — Kajabi and Zapier dropped from Phase 2 architecture.**
The original CLAUDE.md plan routed `Stripe payment.success → Zapier
→ Kajabi` for course delivery. User decision: drop both. Course
delivery is in-house using existing `src/lib/lms/`,
`src/lib/course-harness/`, `src/lib/certificates/` modules and the
HTML mockups in `public/AiBI-P/`. Reasons: avoid the ~$199/mo Kajabi
fee, keep a single auth surface (Supabase Auth from Spec 2), keep
a single DB (Supabase), maintain full design control. New chain:
`Stripe payment.success → /api/webhooks/stripe → insert
course_enrollments row → ConvertKit welcome tag → user logs in
with existing Supabase Auth → /courses/aibi-p reads
course_enrollments to gate access`. The `course_enrollments`
schema lost its `kajabi_user_id` column; gained `user_id` referencing
`auth.users(id)` (bound on first login).

**2026-05-05 — Product menu simplified to four tiers.** Public site
reduced to: free assessment, In-Depth Assessment ($99 / $79 at 10+),
AiBI-Practitioner course ($295 / $199 at 10+), and a "custom engagements —
contact us" stub. AiBI-S and AiBI-L soft-hidden (route redirects to
/education, products deactivated in Stripe — reversible by toggle).
Advisory tiers (Pilot/Program/Leadership Advisory) removed pending
case-study content; replaced by a mailto stub on /for-institutions.
The 48 questions in `content/assessments/v2/questions.ts` now back
two products: the existing free 12-question rotation, and a new paid
48-question In-Depth Assessment with hybrid individual/institution
flow plus an anonymized aggregate report for institution leaders.
Tier thresholds rebalanced from 8-32 to 12-48 scale (equal-spaced
9-point bands: 12-20 Starting Point, 21-29 Early Stage, 30-38
Building Momentum, 39-48 Ready to Scale). Champion threshold for
aggregate dashboards is overall ≥ 39, top 2 emails surfaced.
Plans/ canonical specs left unchanged — site intentionally diverges
from plans for tiers being held back. Decision drivers + design
discussion in
`docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`.

**2026-05-08 — MailerLite e2e setup complete.** Five Automations created
in production MailerLite (account `2331976`, sender
`hello@aibankinginstitute.com`): one Newsletter welcome bound to the
Newsletter group, plus four assessment tier sequences (Starting Point /
Early Stage / Building Momentum / Ready to Scale), each triggered on
"subscriber joins group" with a Day 0 / Day 3 / Day 7 cadence. All thirteen
emails authored against brand voice (full name "The AI Banking Institute"
in prose, AiBI only for credentials, sourced statistics with citations,
DM Mono numbers, no buzzwords) and live in
`src/lib/mailerlite/email-content.ts` as the version-controlled source of
truth — operators may polish in dashboard but the canonical copy is in the
repo. After the every-style-editor audit pass, all 5 Automations were
deleted and recreated with corrected copy (drop H1 terminal periods,
remove em-dash spaces, replace single quotes with doubles, eliminate
semicolons, drop retired "A-B-C framework" reference, spell out
February 2026, replace alternative slashes with "and"/"or"). Final
automation ids: Newsletter `186965438418126829`, Starting Point
`186965478342657970`, Early Stage `186965527420208336`, Building Momentum
`186965564883732340`, Ready to Scale `186965601924679393`. Project-level
style decisions documented in the email-content.ts header: subject =
headline (title case OK), H1 = subhead (sentence case, no period); bold
reserved for visual labels not prose emphasis; percentages stay in DM
Mono (`X%`) per brand rule, overriding Every's "X percent"; no semicolons
in email copy.

**Manual steps remaining before activation:** (1) authenticate sender
`hello@aibankinginstitute.com` in MailerLite Settings → Domains so the
"Sender email must be authenticated" config error clears on each email
step; (2) review each automation in the dashboard and toggle from Draft
to Active. End-to-end verified locally: a `marketingOptIn=true` POST to
`/api/capture-email` with tier `starting-point` lands the subscriber in
both `Tier · Starting Point` and `AI Readiness Assessment` groups via
the `tagAssessmentTier` upsert path (subscriber `186964712064288484`).
The route does NOT subscribe non-opted-in users to MailerLite — they
still get transactional Resend emails (assessment breakdown), but no
nurture sequence. This honors marketing-consent expectations.

**2026-05-06 — End-of-day state after long debug session.**
Outstanding follow-ups for next session:
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and mark Sensitive in Vercel
  (currently flagged by Vercel as plaintext-readable). Steps in
  /Users/jgmbp/Projects/TheAiBankingInstitute punch list.
- Clean `+aliasN@gmail.com` test rows from `auth.users`,
  `user_profiles`, `course_enrollments`. Multiple test users
  pollute the DB; intentional, will clean once flow is stable.
- Author 12 ConvertKit emails across 4 tier sequences + create
  the matching Tags. Only the code-side hooks are wired.
- End-to-end test the Stripe webhook: real $295 Checkout →
  payment → webhook → enrollment row + course-purchase email.
- Decide whether to fully kill `COMING_SOON=true` env var (current
  bypass list covers /assessment, /results, /verify, /education,
  /for-institutions, /courses, /dashboard, /admin, /auth, /api).
- PDF generation route `/api/assessment/pdf/warm` 500s with
  `libnss3.so missing` on Vercel serverless — pre-existing.
- Gitignore `.superpowers/brainstorm/` runtime state (got
  accidentally committed in `f0232a5`).

**2026-05-06 — Email + auth pipeline rebuild.** Started as a Resend
template wire-up, escalated when /results auth gate kept breaking
the magic-link round-trip. Final architecture:
- All transactional email runs through 5 published Resend Templates
  with sender `hello@aibankinginstitute.com` (domain verified
  2026-04-18). Helpers in `src/lib/resend/index.ts`.
- Supabase Auth emails (signup confirm, password reset, magic
  link, email change) go through Custom SMTP (Resend) with the
  `aibi-supabase-smtp` full-access key. Sender must be exact-case
  lowercase `hello@aibankinginstitute.com` — Resend's verified-domain
  check is case-sensitive.
- Email templates in Supabase Auth dashboard rewritten to use
  `{{ .TokenHash }}` and route through `/auth/callback?token_hash=
  ...&type=...&next=...` (PKCE flow). The default
  `{{ .ConfirmationURL }}` was rejected by verifyOtp.
- `/results/[id]` is a bearer-token URL — UUID is the access
  credential, no auth gate. `loadAssessmentResponse` queries
  `user_profiles` by `id` directly. This eliminated the
  magic-link round-trip that was the source of most pain.
- `EmailGate` auto-skips for logged-in users by reading
  `supabase.auth.getUser()` on mount and auto-submitting with
  the session email.
- `/courses/aibi-p/purchase` shows a clear "already enrolled"
  state instead of silently redirecting.
- Stripe env vars `STRIPE_AIBIP_PRICE_ID` ($295) and
  `STRIPE_AIBIP_INSTITUTION_PRICE_ID` ($199) live in Vercel
  Production scope.
- Coming-soon middleware bypasses `/results`, `/verify`,
  `/education`, `/for-institutions`, `/courses` so transactional
  email recipients aren't bounced to the placeholder.

**2026-05-06 — Five Resend transactional email templates +
AiBI-P → AiBI-Practitioner rename.** Authored five Resend Templates
in the dashboard so non-developers can edit copy without a code
deploy: `assessment-results-breakdown`, `course-purchase-individual`,
`course-purchase-institution`, `certificate-issued`, `inquiry-ack`.
Refactored `src/lib/resend/index.ts` to a generic `sendTemplate`
helper plus five named wrappers; wired the wrappers into
`/api/webhooks/stripe` (purchase emails, individual + institution),
`/api/courses/generate-certificate` POST (cert-issued email on
first issuance only — not idempotent retrieval), and `/api/inquiry`
(ack email). Swapped Resend sender from `onboarding@resend.dev` to
`hello@aibankinginstitute.com` (domain verified 2026-04-18). All
sends are best-effort, non-blocking, and no-op when
`RESEND_API_KEY` is unset. Renamed `AiBI-P` → `AiBI-Practitioner`
across user-facing copy (web pages, certificate PDF designation
and filename, transformation report, skill template library,
emails). Internal identifiers preserved: route `/courses/aibi-p`,
DB `product='aibi-p'`, file path `public/AiBI-P/`, env vars,
Stripe metadata, Resend template aliases — all kept short to avoid
URL/DB/integration churn. ConvertKit (marketing sequences,
newsletter) is unchanged. Auth emails (signup/reset/magic link) go
through Supabase Custom SMTP using Resend as transport — they are
configured in the Supabase Auth dashboard, NOT in Resend Templates;
their sender `From` field also needs swapping in the Supabase
dashboard (not yet done — manual step).

**2026-05-09 — Ledger brand refresh (Slice 0).** Executed on
`feature/brand-refresh`. The 2026-04-15 Terra/Sage/Cobalt designer brief
is superseded by a new "Ledger" design system delivered as a Claude
Design handoff bundle (saved at `docs/brand-refresh-2026-05-09/`,
original URLs in chats). Three canonical artifacts: `Design System.html`
(full token system + 21 component specs), `AI Readiness Briefing.html`
(assessment results page), and `LMS Prototype.html` + `lms/*.jsx`
(course harness React shell). The new palette is parchment/linen +
ink/navy + gold accent + oxblood for destructive only. Typography swaps
Cormorant/DM Sans/DM Mono for Newsreader/Geist/JetBrains Mono.
**Pillar color discipline is retired** — sage/cobalt/terra are no
longer enforced as visual grammar. The 4-pillar curriculum structure
shown in the LMS prototype data (Awareness · Understanding · Creation ·
Application) is descriptive, not a color rule. Slice 0 (this commit) is
additive only: new tokens in `src/styles/tokens-ledger.css`, new fonts
wired alongside existing ones, zero visible change. Migration proceeds
surface-by-surface in subsequent slices: internal `/design-system`
reference page → assessment results (Briefing) → LMS harness →
marketing site → cleanup of legacy tokens and fonts.

> _Note: An earlier coupled rename plan in this entry (AiBI-Practitioner
> → "AiBI Foundations" plural with route `/courses/foundations`) was
> superseded by PR #45 on 2026-05-11, which landed the canonical
> singular "AiBI-Foundation" with route `/courses/foundation/program`.
> See the 2026-05-11 PR #45 entry below for the canonical rename._


**2026-05-09 — AiBI-Foundation v2 redesign accepted; staged migration.**
The current AiBI-Practitioner course (12 modules, 6.6 hrs, $295) is
superseded by AiBI-Foundation v2 — a four-track product family under
one credential: Foundation Lite (4 modules · 90 min · $99 · mandatory
bank-wide), Foundation Full (20 modules · 9.5 hrs · $495), Manager Track
(3 modules · 90 min · $195), Board Briefing (2 modules · 60 min · $295/
director or $1,495 flat). Activity-driven (8 activity types, 80%+
hands-on, video capped at 60–90 sec per module). Multi-model platform:
Claude + ChatGPT + Gemini + Copilot Chat in parallel. Six new modules
in Full vs current course: M3 (How AI Got Here), M5 (Cybersecurity & AI
Threats), M6 (Talking About AI With Members), M12 (Spreadsheet
Workflows), M15 (Vendor Pitch Decoder), M18 (Incident Response Drill),
M19 (Examiner Q&A Practice). Pillar order is now strictly linear
(Awareness 1–4 · Understanding 5–10 · Creation 11–15 · Application
16–20) — explicitly framed as "defensible to examiners reviewing the
bank's AI training program." The Personal Prompt Library schema (18
fields) is the spine artifact and a FIXED CONTRACT — forward-compatible
with AiBI-Specialist's Departmental Skill Library and AiBI-Leader's
bank-wide AI portfolio. Canonical bundle now lives at
`Plans/foundation-v2/` (29 module specs, 33 artifact templates,
platform brief, positioning).

**Decisions captured this session:**
1. **Rename continues** — AiBI-Practitioner → AiBI-Foundation in
   user-facing copy. Internal IDs (`aibi-p` route, DB `product='aibi-p'`,
   file paths, Stripe metadata, Resend template aliases) kept short
   per the 2026-05-06 rename pattern to avoid URL/DB churn.
2. **9.5-hr commit acknowledged** — Full track is no longer "evening +
   weekend"; closer to a 2–3-weekend commit. Manager support and
   pacing matter more in marketing/onboarding copy.
3. **Lite is a real new SKU** — $99 mandatory bank-wide is a different
   sales motion (volume-priced site licenses). Stripe checkout needs
   a volume-pricing path before Lite goes live.
4. **M5 ships text-only** — Voice-clone and deepfake elements
   deferred. v2 launch curriculum covers prompt injection, AI-
   augmented phishing, and member conversation handling. The voice-
   verification protocol artifact stays in source bundle as future
   scope; affected specs (M5, L2, L4, voice artifacts) carry an
   editorial banner marking the deferral.
5. **Real-world capture (Type 8) deferred** — Activity Type 8
   (learner uploads sanitized real artifact) and the NPI regex
   guard are out of v2 launch scope. Final Lab (M20) reverts to
   synthetic-only inputs for launch.
6. **AiBI-S/L deferrals confirmed** — multi-agent orchestration,
   MCP, departmental governance held for Specialist; board strategy
   deck and 3-year roadmap held for Leader. Handoffs via the fixed
   Personal Prompt Library schema.

**Migration is staged, not shipped.** Touching course content, Stripe
pricing, the rename, and the Lite/Manager/Board track shells is
multi-week work. Punch list at `tasks/foundation-v2-migration.md`.
Plans/ canonical specs (aibi-prd.html etc.) left unchanged for the
v1 site — v2 supersedes only the course tier, not the homepage,
assessment, or institutional positioning.

**2026-05-11 — `aibi-p` → `foundation` systematic rename merged (PR #45).**
The 10-phase rename from the 2026-05-09 plan shipped to `main` as merge
commit `c172923`. 11 commits covering: forever-shim `normalizeProduct` /
`dbReadValues` at every DB read boundary (Stripe webhooks, course
enrollments, entitlements), 4 write-side flips from `'aibi-p'` to
`'foundation'`, migrations 00028 (CHECK constraint accepts both values)
and 00029 (backfill `course_enrollments.product`, `entitlements.product`,
`prompt_library.course_source_ref`, plus `course_id` on `user_artifacts`,
`saved_prompts`, `practice_rep_completions` with DELETE-on-UNIQUE
pre-flight), pedagogical prose swap (AiBI-P → AiBI-Foundation across 66
files), env var rename `STRIPE_AIBIP_*` → `STRIPE_FOUNDATION_*` (legacy
names kept as fallback). Internal identifiers preserved per 2026-05-06
pattern: route `/courses/aibi-p`, DB `product='aibi-p'` legacy value,
`AIBIP-` cert ID prefix, file path `public/AiBI-P/`. Shim is permanent —
Stripe retry events from 2026-Q1 enrollments can land at any future date
with `metadata.product='aibi-p'` and must collapse to `'foundation'`.

**Operator deploy steps remaining for the rename** (per
`tasks/aibi-p-to-foundation-deploy-checklist.md`): apply migrations
00028 then 00029 to staging then prod (in order — 00028 first so the
CHECK constraint accepts both values before the backfill flips rows);
add `STRIPE_FOUNDATION_PRICE_ID` and `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`
Vercel env vars (legacy `STRIPE_AIBIP_*` already work as fallback);
re-sync ConvertKit/MailerLite copy where "AiBI-Practitioner" appears;
update Stripe product *display* names; verify Resend template bodies.

**2026-05-11 — Four-track Foundation family REVERSED. AiBI-Foundation is
one course.** Reverses the 2026-05-09 Decisions Log entry. The four-track
product family (Lite $99 bank-wide, Full $495, Manager Track $195, Board
Briefing $295/director) is scrapped. There is one Foundation course — the
current 12-module curriculum at `content/courses/foundation-program/`,
served at `/courses/foundation/program/*`. AiBI-Practitioner is the old
name; AiBI-Foundation is the new name. Same course, renamed.

**What this means going forward:** anything pointing at the four-track
shape is dead. `Plans/foundation-v2/` (29 module specs, 33 artifact
templates) is archived authoring work — keep for historical reference but
**not** the source of truth. The single-course Foundation product runs on
the renamed v1 curriculum.

**Cleanup commits shipped to `main` 2026-05-11** (commits `b3ad031`,
`d3436f3`, plus this commit's stranded-code delete):
- `/courses/foundation` now redirects to `/courses/foundation/program`
  (was a marketing overview for the four tracks).
- `/education` page drops the "AiBI-Foundation v2 — preview" tile.
- Deleted: `src/app/courses/foundation/[track]/` (route tree),
  `src/app/courses/foundation/_components/` (ActivityRenderer +
  engines/BranchingScenarioEngine + LightMarkdown + SectionRenderer),
  `content/courses/aibi-foundation/` (32 files: Lite + Full + Manager +
  Board + refresh-slots), `tasks/foundation-v2-migration.md`.
- Demoted `Plans/foundation-v2/` rows in the Reference Plans table.

**What did NOT change:**
- The 2026-05-11 rename (PR #45, commit `c172923`) is unaffected — that
  was internal hygiene (aibi-p → foundation). The reversal here is about
  product shape (one course vs four tracks), not about names.
- The Personal Prompt Library 18-field schema is **still a fixed
  contract** for future AiBI-Specialist / AiBI-Leader compatibility.
- AiBI-S and AiBI-L deferrals remain in place; the single Foundation
  course is the only active SKU.

**Why the reversal:** The four-track design was a planning document;
the actual product has always been one course. Shipping four SKUs would
have required new Stripe products, new checkout flows, new institutional
volume-pricing logic, and ~5,500 lines of new platform code (8 activity
engines). None of that exists. The single-course shape matches both the
current code reality and the operator's mental model.

