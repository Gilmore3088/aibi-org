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


**2026-05-17 — `.impeccable.md` deleted as stale brand bible.** The pre-Ledger
brand bible at repo root (`.impeccable.md`) directly contradicted CLAUDE.md
"Design Context" on every axis: terra/sage/cobalt palette, Cormorant +
DM Sans typography, three-pillar discipline, circular wax-stamp seal —
all retired in the 2026-05-09 Ledger refresh. Hidden filename starting
with `.` made it easy to miss. Resolved per issue #112 by deleting outright;
content is fully superseded by CLAUDE.md "Design Context" and
`docs/brand-refresh-2026-05-09/project/Design System.html`. Companion
cleanup retired `src/components/AibiSeal.tsx` and the orphaned
`src/components/Header.tsx` (SiteNav replaced it earlier).


**2026-05-17 — `/dashboard` rebuilt on the Ledger design.** The signed-in
dashboard was still on the legacy Terra palette and lacked any visible ladder
from sign-up to enrollment. Rebuilt from the Claude Design `User Home.html`
handoff bundle. Composition: welcome hero, 7-rung activation ladder (account →
free readiness → first rep → In-Depth $99 → Foundation $295 → first module →
certificate, each tied to real evidence), trio cards, today's rep, In-Depth
section (when entitled), dark Foundation card, free resources, SAFE strip.
Shipped via PR #123. See `Plans/dashboard-ledger-redesign.md`.

**2026-05-17 — `/assessment/in-depth` refocused on selling the $99.** Page
previously stacked three $99 callouts without comparative context. Restructured
around a single buying surface: muted "for the curious" free scan vs gold-
bordered "Recommended" In-Depth card with price, deliverables, and Stripe
button inline. Line-by-line comparison table below for buyers who want detail.
All three "Purchase In-Depth · $99" CTAs now call `/api/checkout/in-depth`
via the generalised `PurchaseButton` (added `label` / `pendingLabel` / `size`
props). The bottom trust strip was removed as redundant with the comparison.

**2026-05-17 — `/courses/foundation/program` removed from `CHROMELESS_PATHS`.**
The path was chromeless on the assumption that `CourseShell`'s sidebar +
breadcrumb covered all navigation needs. They don't — they cover the course
tree only, not the way back to the rest of the site. Global `SiteNav` is now
stacked above the LMS chrome.

**2026-05-17 — Foundation card copy rebuilt around real product data.** The
design's illustrative copy claimed "8-week cohort / 12 video modules /
200+ reps / cohort community / live calls / role-specific tracks." None of
that exists. The course is self-paced, modules are reading + activities (no
video), the rep library is ~15 reps and free for everyone, there's no cohort
community, and Foundation is one course (not four role tracks — see the
2026-05-10 reversal entry above). Rewrote the dashboard's Foundation card and
the program-page hero to match: "12 structured modules · Self-paced",
"30+ prompts" (real count), "Hands-on activities", "Working artifacts —
PDFs + worksheets", "Verified certificate · On completion".

**2026-05-17 — `PREVIEW_AUTH_BYPASS` auto-fires when Supabase is unconfigured.**
Auth-gated layouts (`/dashboard`, `/courses/foundation/program/*`) trapped
visitors on Vercel previews that lacked Supabase env vars — the gate redirected
to a login page that itself couldn't authenticate anyone. New helper at
`src/lib/auth/previewBypass.ts` with three layers: (1) `VERCEL_ENV === 'production'`
hard-floor refusal, (2) explicit `PREVIEW_AUTH_BYPASS=true` opt-in still works,
(3) otherwise auto-bypass when `NEXT_PUBLIC_SUPABASE_URL` is missing. Production
is inert because it has Supabase configured and the hard-floor blocks even
mis-scoped env vars. The bypass only unlocks the route gate; API routes still
401, but the visual surface renders (which is what design QA needs).

**2026-05-17 — Roadmap teases removed from buyer-facing surfaces.** Two
footers on Foundation surfaces exposed roadmap state to buyers/learners
without dates or links: "Team purchases use a single checkout… Advanced
AiBI-S and AiBI-L tracks are coming later" on `/purchase`, and "More
credentials launching soon: AiBI-S (Specialist) and AiBI-L (Leader)" on
`/program`. Both removed. AiBI-S/L still exist in the long-term roadmap;
they just don't appear on production surfaces until they have something
to point at.

**2026-05-18 — Foundation content cleanup + LMS harness extraction shipped.**
Six PRs merged to main (#124, #131, #127, #128, #130, #163). Captured in
[`docs/handoffs/foundation-content-and-harness-2026-05-17.md`](./docs/handoffs/foundation-content-and-harness-2026-05-17.md).
Three decisions worth recording for future override:

1. **Foundation course's per-module rich data lives in `FOUNDATION_MODULES_META`,
   not on the harness `CourseModule`.** Two options were on the table for the
   B4 migration: (A) extend the harness `CourseModule` with Foundation's rich
   fields via subtype, (B) move them to a separate keyed map. Chose B for
   precision — the harness stays portable across courses; AiBI-S won't
   inherit Foundation's pillar/keyOutput concepts. `CourseModule` in
   `src/lib/lms/types.ts` is the lean shape; rich Foundation-specific data
   in `content/courses/foundation-program/course-config.ts`. New courses
   follow the same pattern (see `src/lib/lms/README.md`).

2. **`slug` (public identity) is separated from `dbProductKey` (Stripe / Supabase
   write key) on `CourseConfig`.** Foundation is `slug: 'foundation'`,
   `dbProductKey: 'aibi-p'`. The legacy `'aibi-p'` value is preserved forever
   for webhook retries and pre-rename `course_enrollments` rows; the public
   slug is the routing identity. Don't conflate them.

3. **AiBI-S harness migration deferred until AiBI-S becomes a shipping
   product.** Originally B5+B6 in the Phase B plan. AiBI-S routes currently
   return 404 stubs; migrating it would be speculative without product
   constraints. When AiBI-S is real, redesign `<AISimulation>` and the
   beat-shape with real consumers, then delete `src/lib/course-harness/`.
   The new harness in `src/lib/lms/` is designed to absorb AiBI-S when
   that work begins.

**2026-05-18 — Free assessment results are fully gated behind email
capture.** Reverses the 2026-04-27 decision (which kept score + tier
visible without email and only gated dimension breakdown + starter
artifact). The reversal rationale per issue #189:

- The 2026-04-27 decision was made when the assessment was **8 questions
  (~2 min sunk cost)**. Today's flow is **12 questions (~3 min sunk cost)**.
  Email gate at 8 questions had high bounce risk; at 12 questions the
  user has materially more skin in the game.
- The conversion-optimization conventional wisdom that produced the
  partly-gated approach is empirically untested for AiBI's audience
  (community-bank executives behave differently than consumer SaaS
  visitors).
- A full email gate captures every completer; the partly-gated approach
  captured maybe 30–40% of completers (the ones who clicked through to
  the dimension breakdown).

What the new flow looks like:

1. User completes 12 questions
2. Final step is "Your readiness report is ready. Enter your work email
   to see your score, tier, eight-dimension breakdown, and a starter
   artifact." — NO score / tier visible until email submit
3. On submit, the full on-page report renders inline (no "check your
   inbox" wait state). Same surface as the previous post-capture report.
4. (Follow-up PR-C) Email with the same content is sent in parallel for
   archival / re-engagement

What we lose vs the 2026-04-27 model:

- Visitors who would have seen the score and bounced now leave with no
  signal at all. We lose the `assessment_complete` Plausible event for
  that segment as a partial conversion indicator.
- Cannot easily A/B test if shipped as the only option. Worth tracking
  completion-to-email-submit rate carefully for the first 30 days; if it
  drops below ~60% the reversal is wrong and we revisit.

Implementation: PR-A (this entry) hides the visible score block on
`src/app/assessment/page.tsx` when `!emailCaptured`. PR-B (deferred)
adds a bookmarkable `/assessment/results/[token]` page so the report
URL is shareable. PR-C (deferred) builds the email template + send
helper. The on-page report uses the existing `ResultsViewV2` component
unchanged.

CLAUDE.md § Critical UX Rule and § MVP Launch Gate both updated in the
same PR to match.

**2026-05-20 — `/api/capture-email` per-IP limit set to 30/hr, not the
launch-gate's literal 5/hr.** The ship-it security audit
(`docs/reviews/security-audit-2026-05-20.md`) flagged the value. 5/hr would
429 legitimate prospects at in-person conferences and bank offices where many
takers share one egress IP (corporate NAT / event wifi) — directly harming the
primary conversion funnel. 30/hr keeps a hard backstop against scripted abuse
while tolerating a shared room. Per-IP is the wrong dimension for shared-NAT
crowds; the proper fix (per-email cap + Upstash sliding window) remains tracked.
The MVP Launch Gate item "rate limiting active" stays satisfied — the endpoint
is rate-limited, just at a funnel-safe threshold.

**2026-05-21 — Consolidation session: how the scattered branches were
landed.** The open work had fragmented across many branches/PRs. Resolution:

- The four sub-PRs (#234 token sweep, #252 program split, #235 audit sweep,
  #223 marketing E2E) were merged to main **individually** by the operator;
  the big consolidation **PR #254** was then squash-merged to carry the work
  that lived *only* on it — the security hardening (cert RLS migration
  `00036`, `/api/user-profile` 401, rate limits, dep bumps), **#238**
  (last-routes Terra→Ledger), the E2E suites, dependabot, and the env-vars
  audit. Closing #254 would have silently dropped that security work — it was
  **not** redundant despite the sub-PR overlap.
- Merge conflicts (in `AcceptableUseCardForm.tsx` / `ActivityForm.tsx` for
  #254; `ToolboxHomeV5.tsx` for #256) were resolved by taking main's shipped
  **#255** versions of the forms while **preserving #254's a11y fix**
  (dropping `outline: 'none'` to restore focus outlines, WCAG 2.4.7) and the
  non-hero shadow purge. Rule going forward: when an old parallel refactor
  conflicts with what already shipped, take the shipped version and re-apply
  only the net-new a11y/brand intent.
- **⚠️ Migration `00036` is committed but NOT yet applied** — the certificate
  enumeration hole stays open until it runs in Supabase. Operator action.

**2026-05-21 — #236 closed won't-fix (sandbox dynamic-import).**
`/courses/foundation/program/[module]/page.tsx` is a *server* component;
its static import of the `'use client'` `AIPracticeSandbox` is already
code-split at the client boundary. A `next/dynamic` wrapper adds indirection
with no measurable First-Load-JS win. Only static imports *inside* a client
boundary bloat the client bundle (the E.4 finding). Reopen only if a
bundle-analyzer treemap shows the sandbox shipping eagerly.

**2026-05-21 — #251 deferred (settings re-edit pre-populate).** Restoring the
original "Free tiers only" vs "None" onboarding answer needs a schema decision
(Option A: new column · B: sentinel value · C: best-effort heuristic). Not a
clean autonomous fix; left open for the operator to choose A/B/C.

**2026-05-21 — Toolbox onboarding (#231) shipped slices 1, 2, 4a (PR #256);
3 + 4b/c deferred.** Slices 3 (welcome overlay) and 4 B/C (tier-aware tile
CTAs/tooltips) read an `access.tier` prop that only exists once **#224**
(Starter tier, held pending migration `00035`) lands — so they're blocked, not
skipped. Shipped-slice deviations from the issue mock, by design:
(a) no "Watch 90-sec tour" CTA (no tour asset; avoids a dead button);
(b) no "Pre-review draft prompts: PR #225" line on kit cards (internal
reviewer reference, off-voice for a paying banker); (c) no fabricated
"Open the BSA kit" empty-state CTA (no clean BSA-only route — the kit grid
already provides access). **#229 resolved via the coming-soon treatment** —
the 3 metadata-only kits now render "in SME review" + Notify instead of a
silent no-op adopt. Per operator: do not block launch on kit content; content
lands later.

**2026-05-21 — Dependabot policy (config added via #254).** Close
build-breaking major bumps that need a dedicated migration pass —
`tailwindcss 3→4`, `typescript 5→6`, `eslint 8→10`, and `puppeteer-core 24→25`
(PDF-generation regression risk, same caution as the reverted Next 15 bump).
Merge zero-risk GitHub Actions version bumps (CI-only). Runtime minor/patch
groups get operator review before merge.

**2026-05-21 — Italics retired + gold darkened & single-sourced (PRs #269, #270).**
Operator directive: "get rid of all the italics… match my design consistently"
+ "if we're hardcoding it everywhere, that's a problem — make it one place."

- **Italics retired site-wide.** A universal `*{font-style:normal!important}`
  rule in `base.css` kills every italic — default `<em>`, the Tailwind `italic`
  utility, inline styles, per-stylesheet `font-style:italic` rules, and
  browser-rendered SVG `<text>`. Server-rendered images (Satori OG card, the
  hero SVG) are roman at source (CSS can't reach them). Emphasis is now carried
  by color + weight. **Supersedes the former "italics signal voice" rule** in
  CLAUDE.md Design Context.
- **Gold darkened for WCAG AA.** `--ledger-accent` `#B5862A → #7C5814`. Gold
  text on linen/paper was 2.69:1 (failed AA, even the 3:1 large-text bar); now
  ≥4.5:1. Verified 18→0 contrast violations on `/` and `/research`.
- **Gold single-sourced.** Was hardcoded in ~25 files / 47 translucent tints.
  Now CSS + inline-DOM SVG/styles reference `var(--ledger-accent)`; tints use
  `--ledger-accent-a06..a40` tokens; `--ledger-warn`/`--ledger-accent-soft`
  derive from it. **Change the gold in one line in `tokens-ledger.css`.** True
  exceptions that can't resolve a CSS var (Satori OG, static favicon `.svg`,
  vanilla-JS chart constants, server-generated downloads) keep a literal
  `#7C5814` with a sync comment.
- **Muted/slate text darkened** `#5C6B82 → #4F5C6E` for AA (secondary labels
  were 4.09–4.45:1; now ≥4.6). Fixed 6 of 8 homepage contrast violations.
- **Wordmark line-2 left as-is.** The remaining 2 axe contrast flags are the
  wordmark "INSTITUTE" in `--ledger-soft` — a **logotype**, WCAG 1.4.3 exempt.
  Any change is a brand decision, not an a11y bug.
- **Dev-only CSP fix (separate commit).** `'unsafe-eval'` now allowed in
  development only (Next dev HMR needs it; prod CSP unchanged). Pre-existing
  bug that made `/research` (and other client-hydrated pages) appear broken in
  local dev; production was never affected.

**2026-05-21 — Branch cleanup: retire stale worktrees, rescue what's unique, prune the remote (77 → 7).**
Operator directive: review the branch structure and resolve the sprawl. Process
established: **investigate every stale branch for unique unmerged work before
deleting** — never assume "stale = dead."

- **`design-2.0` retired.** 313 commits ahead but its visual direction
  *conflicts* with the shipped Ledger refresh (it carried "pillar discipline
  restored" — the opposite of the retired-pillar decision), and its
  `courses/aibi-p/*` is the pre-rename naming main superseded. Merging it would
  have reverted main (`−191k` lines). Its one genuinely-unique surface — an
  **instructor/reviewer grading loop** (`admin/reviewer/*`, `review-submission`
  API with an Accuracy hard gate, institution export/summary APIs) — was
  **explicitly declined** by the operator ("I don't want reviewing"). Deleted
  worktree + local (90 unpushed commits) + remote.
- **`feature/mailerlite-automations` retired.** The MailerLite automation work
  already shipped to main; the branch's only unique files were the same
  unwanted reviewer surface, retired components (HubSpot, Plausible, `AibiSeal`,
  old `Header`), old `aibi-p` content, and an old-location `lib/aibi-s/*` that
  main superseded under `src/lib/`.
- **`wave-1` / `wave-2` content RESCUED, then retired (PR #276).** Initially
  mis-judged as dead — investigation found genuinely valuable, main-compatible
  authored content: `governance.ts` (per-dimension risk + examiner-defensibility
  lines), `maturity.ts` (8×4 tier meanings), `scoring-authority.ts` (score
  framing + integrity guardrails). Extracted the 6 content/test files onto a
  clean branch off main (NOT the branches' modified `scoring.ts`). One test
  caught a real bug: the copy's band literals (`12–20/21–29/…`, "equal-spaced")
  were authored against the branches' *simplified* scoring; rewrote to main's
  actual unequal tiers (12–22, 23–32, 33–40, 41–48). Content is currently inert
  (data layer for a future in-depth-report governance strip + "About this
  score" block). After merge, both wave branches retired.
- **70 stale remote branches deleted.** 64 merged into main (squash-merges don't
  show in `git branch --merged`, so cross-referenced against 156 merged PRs) +
  5 with PRs closed *without* merging + 1 superseded docs branch.
- **3 active WIP branches kept** (no PR, not merged, but live): `content-engine`
  (net-new Python Scout/Queue sub-project in an isolated dir + schema),
  `sandbox-multi-provider` (OpenAI+Gemini providers — maps to issue #158),
  `auth-audit` (auth/rate-limit work; OWNER_EMAILS allowlist *not* adopted —
  main still uses `SKIP_ENROLLMENT_GATE`; may inform launch-blocker #187).
- **Workflow note.** Bundled destructive git commands (worktree+local+remote in
  one chain) get blocked by the safety classifier; remote-branch deletions must
  run as isolated, explicitly-authorized steps.

**2026-05-23 — Foundation Course rebuilt from scratch on ADDIE
(`feature/addie-v1`).** New blank-slate course design owned by
`docs/Foundation-Course-ADDIE/` (Course PRD + ADDIE Design v2 + Module PRDs +
M0 curriculum + production tracker + launch checklist). Three-layer doc model:
Course PRD → Module PRDs → Module curriculum docs. Shape: 6 modules (M0–M5) ·
~22–24 lessons · ≤15 min each · 5 role tracks branched at applied lessons ·
three-way gate after M3 (Pay / Email-to-keep / Decline → $99 assessment) ·
controlled "blinders" sandbox as spine (Anthropic default, learner-switchable
to OpenAI/Gemini) · Toolbox with `.md` export (email- or entitlement-gated
saving) · $99 Readiness Assessment as 48 Q / 10+ dimensions / four deliverables.
Confirmed stack: Stripe · Supabase · MailerLite · Resend · LLM APIs. This work
is **branch-scoped** — does not affect `main` until separately re-reconciled.
Per operator: comply with existing project structures and terms with **one
explicit exception — no credential / no certificate in v1.** "Foundations
Certificate" is dropped from the Foundation Course on this branch; completion
is tracked but not marketed; `src/lib/certificates/` is unused by the rebuild;
revisit once there is traction and a recognized credentialing path. Other
deviations flagged in CLAUDE.md (this branch): course-name shorthand in docs,
course surface to be reauthored (the existing `/courses/foundation/program`
is reference only here), existing `/assessment` + `/assessment/in-depth` to
be reconciled with the 48-Q / 10+ dimension Readiness Assessment spec
(extending `content/assessments/v2/`, not replacing from scratch), and a new
Team SKU ($199/seat, 10-seat minimum) with no Stripe price or admin dashboard
yet on main.

**2026-05-23 — Sandbox Service deployment target = Vercel Functions (Node),
same repo (closes TDD §13 item 1).** Sandbox code lives in `sandbox-service/`
as a directory-level isolation boundary: only API routes under `src/app/api/`
import from it, the rest of the web app never does. LLM SDKs + provider keys
+ system prompts are physically scoped to that directory. v1 is non-streaming
(<3s p50 target), so Vercel function timeouts and cold starts are acceptable.
If a later v1.5 needs streaming or hits the function ceiling, the directory
boundary makes extraction to a dedicated Node service a `git mv` away.
Rejected: dedicated Node service today (extra ops surface for a non-developer
operator); Next.js API route in the web-app bundle (collapses the security
boundary the Sandbox Spec §3 requires).

**2026-05-23 — ADDIE schema isolated under a separate `addie.*` Postgres
schema (overrides DB Spec §11 implicit `public` placement).** The DB Spec was
written greenfield, but `main` is live with 37 applied migrations and
collisions on `entitlements`, `toolbox_*`, `user_profiles`, `course_enrollments`,
and the readiness/assessment columns. Running the spec as-written would
either fail or, if forced, corrupt live customer data on the shared Supabase
project. All ADDIE tables therefore live under `addie.*` —
`addie.learner_profiles`, `addie.entitlements`, `addie.toolbox_items`,
`addie.events`, etc. RLS, FKs, triggers, and `(select auth.uid())` patterns
all apply identically. `public.*` is untouched, so the live site is
unaffected. Eventual merge as the canonical course is a per-table rename
(or `ALTER SCHEMA addie RENAME TO public_v2` + view shim) decision for a
later session, not this branch's problem. Rejected: separate Supabase
project (extra billing + identity split), in-place reconciliation of every
collision (slowest, riskiest, requires per-collision design we don't have).

**2026-05-23 — ADDIE web-app code namespaced under `(addie)` route group +
`sandbox-service/` (TDD §4 honored with one tweak).** Route group keeps
ADDIE pages out of the existing `/courses/foundation/program` tree per the
branch CLAUDE.md "treat existing surface as reference only" rule. Layout:
`src/app/(addie)/foundation/[moduleId]/[lessonId]/...` for the course,
`src/app/(addie)/dashboard/` for the learner home, `src/app/api/sandbox/*`
for the proxy to `sandbox-service/`. Existing `/courses/foundation/program`
remains untouched on this branch. Final production routing (whether ADDIE
takes `/courses/foundation` outright, sits at a new path, or replaces via
redirect) is a separate decision at merge time, not now.

**2026-05-23 — Env-var gaps surfaced at Wave 0 (operator action required
before Wave 1d ships).** Present in `.env.local`: Supabase keys, Anthropic,
OpenAI, Gemini, Stripe live keys + the existing FOUNDATIONS/AIBIP/INDEPTH
price IDs, MailerLite key + 6 tier groups, Resend API key, CRON_SECRET,
COMING_SOON. Missing per TDD §6 + CLAUDE.md env block: `RESEND_FROM`,
`NEXT_PUBLIC_SITE_URL`, `TOOLBOX_IP_HASH_SALT` (likely set in Vercel only,
not mirrored locally — verify), plus the three branch-new vars
`SANDBOX_SERVICE_URL` (for production split-deploy, optional in dev when
the sandbox is invoked in-process), `SANDBOX_SERVICE_INTERNAL_TOKEN` (HMAC
shared secret between web app and sandbox), and `ANON_SESSION_COOKIE_SECRET`
(HMAC for the anon_session_id cookie). The new Team-seat price
(`STRIPE_FOUNDATION_TEAM_SEAT_PRICE_ID`, $199/seat min 10) also needs to be
created in Stripe test mode before Wave 1d Stripe checkout work. None of
these block Wave 1a (migrations are SQL files, not runtime). They block
Wave 1d.

**2026-05-23 — In-Depth Assessment locked at 8 dimensions, not 10+ (closes
DB Spec §13 item 5).** The original ADDIE PRD specified "10+ readiness
dimensions"; the existing on-main implementation under
`content/assessments/v2/` is 8 dimensions and is the production product
already selling at $99. Per operator: leave the live product alone, update
the ADDIE docs to match. The 8 dimensions stand; the 10+ language is gone
from PRD, Database Spec, Module Production Tracker, Launch Checklist,
Start Here, and Screen Inventory. `addie.assessment_results.dimension_scores`
jsonb now expects 8 keys; Wave 3b wires the existing v2 runner to write into
`addie.assessment_results` rather than building a parallel 10+ surface.

**2026-05-23 — Stripe naming + posture cleanup (test mode).** Two price
nicknames renamed from "AI Banking Practitioner Course —" to
"AiBI-Foundation —" (CLAUDE.md 2026-05-11 rename rule applied late). The
`AiBI-Foundation Course` product description rewritten to a general,
brand-aligned blurb (no structural details like module count or hour count)
so it stays correct across both the live 12-module course and the upcoming
ADDIE rebuild. The leftover $15 "myproduct" (`prod_UTx8gfENDDHA13`)
archived. The team-seat price already existed —
`price_1TTmudRy9NIFjtIIEPmR1BpP` ($199/seat) — and is reachable via the
existing Vercel env var `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` through
the products.ts fallback chain; no new Vercel env var required for the team
SKU. New addie Stripe webhook endpoint created
(`we_1TaOEuRy9NIFjtIIrM032WFg`) pointed at
`https://www.aibankinginstitute.com/api/addie/webhooks/stripe`; its secret
lives in `STRIPE_ADDIE_WEBHOOK_SECRET`. The endpoint will 404 until the
addie branch merges to main, but no real events fire until then either.

**2026-05-23 — Team SKU is one-time payment in v1, not a subscription
(closes Wave 1 audit finding G5).** The existing
`STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID` price is a one-time payment
($199/seat × N, paid upfront), matching the existing on-main team purchase
shape. The ADDIE Auth Spec §6.2 listed
`customer.subscription.created/updated/deleted` as expected events; those
are not needed for v1 because there is no recurring billing. The addie
Stripe webhook handler listens only to `checkout.session.completed` and
`charge.refunded`. If the team SKU pivots to monthly/annual recurring
later (renewal cycle, mid-cycle seat add, downgrade), revisit and add the
subscription events — schema already supports it via
`teams.stripe_subscription_id`.

**2026-05-23 — Wave 2a shell adds 7 small API routes alongside the UI.**
Wave 2a's primary scope is the learner-facing web app shell (lesson player,
Toolbox UI, three-way gate UI, dashboard, account pages) under
`src/app/(addie)/...`. To make the UI functional end-to-end without waiting
on a separate API agent, this wave also lands the small server endpoints
the UI needs: knowledge-check grader
(`POST /api/addie/checks/respond`), Toolbox CRUD
(`GET|POST /api/addie/toolbox/items`,
`GET|PATCH|DELETE /api/addie/toolbox/items/[id]`,
`GET /api/addie/toolbox/items/[id]/export` → streams `.md`), and stub
account endpoints (`POST /api/account/export`,
`POST /api/account/delete`) that return 501 until the operator runbook +
real export/delete pipelines ship. Each route is <100 LOC; rate-limited
where appropriate (checks: 20/IP/hr, toolbox create: 30/IP/hr); the
server-side 4-artifact free-tier cap lives in
`src/lib/addie/toolbox/items.ts` (`FREE_TIER_ARTIFACT_CAP = 4`,
enforced before insert) and `hasAnyFoundationEntitlement` exempts paid
learners. Identity is resolved through a new shared helper
`src/lib/addie/auth/resolveIdentity.ts` that returns `{user_id, anon_session_id, lead_id}`,
deriving `lead_id` from the most recent `addie.events` row keyed by the
HMAC-signed anon-session cookie (no separate `anon_sessions` table is
needed today — the events table is the join). Lesson player dispatches on
`addie.lessons.modality`; Wave 2b authors per-exercise lever payloads for
the `interactive` and `sandbox` modalities — the shell ships generic
fallbacks so the loop is provable end-to-end against any seeded row.
