# Launch checklist — production readiness

Last updated: 2026-06-24.

## Status snapshot — 2026-06-24

Where the launch actually stands after this session. The detailed gate is §0–§12 below.

### ✅ Done
- **Supabase #1 blocker cleared.** Migrations `00044–00048` applied to production via MCP;
  `/api/health/supabase` → `ok:true` (was `ok:false` / results pages degraded).
- **Launch docs hardened + consolidated.** Stripe doc, this checklist, and the GTM plan
  corrected (phantom staging, dead `NEXT_PUBLIC_STRIPE_KEY`, HubSpot, brand naming, webhook
  events, refund/comp, tax trigger, Appendix A; one canonical go/no-go list).
- **Copy drift fixed (shipped).** `12 → 18` modules across `/faq`, `/for-institutions`,
  assessment results CTAs, post-assessment `NextStepCards`, `/design-system`; banned
  "AiBI Foundations" plural in the playbook modal + MailerLite surfaces. `lint` + `360 tests`
  + `build` green locally.
- **GTM revenue model** internal math contradiction fixed + reality-check added.
- **Reviews produced:** 10-persona E2E, adversarial red-team, and 20-persona
  GTM readiness review (`docs/reviews/`).
- **Persona planning updated locally.** The 20-persona prioritized remediation
  plan, 20-person remediation comparison, and 50-person GTM readiness review are
  complete under `Plans/`. The 50-person review found no new website P0 and has
  been finalized against the larger 100-persona remediation pass. The remaining
  blockers are live-money evidence, admin/support login, MailerLite activation,
  physical-device QA, production proof for the 100-persona fixes, and first-user proof.
- **100-persona audit remediation locally complete.** The larger
  `archive/docs/persona-audit-2026-06-23/` plan superseded the 50-person pass for deeper
  post-click fulfillment issues. Its persona outcome rows now count
  **100 ok / 0 warn / 0 fail** locally. This includes certificate issuance,
  buyer recovery, retention, assisted team buying, public demo truthfulness,
  gated downloads, pricing/discovery, refund support, mobile/home polish,
  security/data-handling, Module 3, credential verification, and post-certificate
  referral. The remaining work is production proof, not unresolved local
  persona-row remediation.
- **Gated free-download P0 locally fixed.** Prompt Cards and the Safe AI Use Guide now
  stream committed static PDFs instead of rendering React PDFs on request; Prompt Cards
  waits for a successful PDF response before unlocking and the role dropdown now matches
  the server allowlist. The Safe AI Use Guide form now waits for a successful PDF fetch
  before showing success. Local checks returned valid 5-page and 11-page PDFs.
  Production Vercel proof is still required.
- **Free-resource lead-gate consistency verified in PR #517.** Static template pages no
  longer expose pre-capture "Copy text" actions; the AI Workflow SOP copy and Markdown
  download actions run through the shared email gate. Prompt Cards and the Safe AI Use
  Guide now honor/write the shared free-resource session unlock after successful PDF
  delivery, and their special static PDF endpoints log `resource_downloads` rows with
  source attribution and known-email capture when available. PR #517 has green Vercel,
  smoke, axe, Lighthouse, mobile viewport, and secret-scan checks. Production deployment
  and live download proof are still required.
- **Static course/resource PDF render risk reduced locally.** Skill Template Library,
  both course cards, and all eight assessment starter artifacts now serve committed
  static PDFs instead of calling React PDF at request time. The personalized
  certificate endpoint now uses a Chromium print route instead of React PDF, and
  the personalized Acceptable-Use Card and Transformation Report now render
  escaped HTML through the same Chromium PDF helper. The certificate,
  Acceptable-Use Card, and Transformation Report PDF paths still need preview proof.
- **Assisted team-buying P0 locally fixed.** `/for-institutions` and `/assessment/team`
  now use a real institution inquiry form, configured booking link when available,
  one-business-day reply expectation, support inbox notification, and `team_seats`
  support-case creation. The L&D cohort-pilot path now shows a cohort launch packet
  and creates `product: cohort-pilot` cases. The PMO project-plan path now shows
  milestones, named owners, response SLA, and first-call agenda, and creates
  `product: project-plan` cases. Raw team mailto CTAs and public QA-gate copy were removed;
  focused tests cover the `/for-institutions` CTA path and `/api/inquiry` support-case
  creation.
  Production form/inbox/support-case verification is still required.
- **Buyer recovery P0 locally fixed.** `/auth/login` now leads with an
  email sign-in link, keeps password sign-in secondary, offers purchase-link resend,
  and `/support/purchase-help` exposes the same quick purchase-link recovery before
  opening a support case. The Foundation success page now sends filtered-email recovery
  to purchase help with the checkout email prefilled. Device confirmation now has a cross-device fallback into a
  fresh one-time auth link. `/api/cron/stranded-buyers` now checks paid enrollments
  whose auth user has never signed in after the alert window, opens deduped access
  support cases, and sends a summary ops alert when new cases are created. The Vercel
  schedule is daily to fit the current Hobby account cron limits. Magic links
  are built from `NEXT_PUBLIC_SITE_URL` instead of the apex host, and the Foundation
  purchase-link resend path has focused route-test coverage. Production cron/support-case/email
  proof is still required.
- **Retention recovery locally implemented.** `/assessment/take`
  now persists the selected question rotation immediately, preserves the score phase
  across reloads, keeps the same question set on Start over, and offers a 30-day
  email resume link backed by service-role-only `assessment_drafts`. Focused
  client tests cover sending the resume draft and restoring from a resume token.
  A daily `/api/cron/assessment-abandoned` job now sends one resume reminder to stale
  draft records. A daily `/api/cron/paid-reengagement` job now sends deduped
  transactional reminders for idle In-Depth buyers, Foundation buyers who never
  start, and Foundation learners stalled on a later module, with service-role-only
  send logging in `paid_reengagement_events`. Production migrations/cron/email
  proof is still required.
- **Public demo truthfulness locally fixed.** `/playground` and `/practice` now call
  `POST /api/playground/run`, which uses the real AI harness with `gpt-4o-mini`, PII
  and prompt-injection scans, usage logging, 1/IP/minute and 5/IP/day limits, and a
  global daily public-demo spend cap. `/practice` no longer claims signed-in/enrolled
  access and no longer exports fabricated `.md` output. `/admin/toolbox-usage` now
  reports public demo calls, spend, limits, failures, top IP hashes, and recent events.
  The orphaned playground/my-toolbox HTML/script prototypes are deleted locally.
  Focused UI tests cover the `/playground` run call, rendered model output, and
  footer discovery link.
  Production model-key proof is still required.
- **Admin/support operations shipped.** `/admin`, `/admin/funnel`, `/admin/support`,
  buyer search, support CSV export, purchase-help intake, support cases, and ops-alert
  case creation are deployed. Production allowlists and support inbox vars have been set.
- **Funnel/support metric data quality corrected.** Test/internal identities are excluded
  from admin metrics via Production env, `active_learner` no longer counts a default
  module-1 enrollment as progress, and resource downloads now count unique known-email
  downloaders rather than anonymous raw events.
- **Persona 1 and massive-audit free-assessment friction resolved in current code.**
  `/assessment/take` no longer has the unlabeled floating "N" control; the question
  flow uses an in-flow wordmark, question count, Save & exit link, and labeled answer
  controls. The email gate now has a no-thanks summary lane, explicit default-off
  marketing opt-in, score-phase answer review, a working restart anchor, and a print
  fallback when server PDF generation cannot run because no profile was created.
- **Persona 2 purchase-page continuity implemented locally.** The Foundation purchase
  page now has non-checkout links to course overview, free assessment, purchase help,
  and institution inquiry. Verify after the next production deploy.
- **Persona 3 claim-safety copy resolved in current code.** Examiner/regulator-adjacent
  phrasing was softened across governance resource copy, certification content, course
  examples, and MailerLite nurture copy. Remaining scanner hits are training scenarios
  or explicit banned-phrase guardrails.
- **Persona 4 CFO buying-confidence issue resolved in current code.** The ROI calculator
  now shows adjacent formula, assumptions/source link, and a CFO caveat that the estimate
  is recaptured labor capacity rather than guaranteed savings or an efficiency-ratio
  projection. $99/$295 refund reassurance remains adjacent to paid CTAs.
- **Persona 84 ROI-context loss implemented locally.** The homepage ROI calculator now
  carries `roi_*` query context into `/assessment/take`; the assessment gate and v3 result
  page render the modeled annual capacity so the user's dollar scenario does not vanish.
- **Pricing comparison for personas 3/38/66/79 implemented locally.** `/pricing` now
  compares the Free snapshot, $99 In-Depth report, $295 Foundation course, and assisted
  institution rollout; it is linked from navigation, mobile drawers, footers, sitemap,
  and the homepage price strip.
- **In-Depth post-purchase polish implemented locally.** `/assessment/in-depth/access`
  now redirects entitled individual buyers to `/dashboard/assessments` instead
  of showing unfinished cohort scaffolding. `/assessment/in-depth/purchased`
  points paid Toolbox access to the real signed-in/login path and treats public
  resources as secondary. Production checkout/signed-in proof remains open.
- **Playbook/resource dead-end cleanup implemented locally.** `/playbooks`
  role PDFs now use the same direct endpoints as `/resources`, Draft/non-built
  playbook assets are omitted until shipped, and the GTM Plan template plus
  Platform Feature Reference Card are discoverable from `/resources`.
  Production link/download proof remains open.
- **In-Depth discoverability implemented locally.** The $99 offer is visible
  from the home pricing strip, `/pricing`, footer, assessment, and result
  surfaces, and `/security`, `/playground`, and `/courses` now cross-link to
  `/assessment/in-depth`. Production link proof remains open.
- **Home first-paint polish implemented locally.** The homepage hero now names
  community banks and credit unions, leads with the three-minute readiness
  promise, stacks value copy before the redline proof object on mobile, and
  makes the mobile sticky CTA immediately reachable unless dismissed.
  Production visual proof remains open.
- **Foundation credential-value path implemented locally.** `/courses` now explains
  what the certificate proves, the public authenticity URL, the evidence behind the
  badge, and the claim boundary. `/pricing` includes a credential/proof row, and
  `/certifications` is linked from the course page, footer, and sitemap.
- **Module 3 difficulty-cliff fix implemented locally.** The Build step now uses
  the intended strategy drill and Prompt Wizard, provides worked starter prompts,
  and lowers the final prompt floor from 60 to 30 characters for personas 12, 23,
  34, 57, and 82. Production learner-path proof remains open.
- **Foundation program-home enrollment gate implemented locally.** The
  `/courses/foundation/program` overview now redirects true non-enrolled users
  to the purchase page instead of rendering a default course shell, while
  preserving the fetch-failed warning and local/preview bypass behavior.
  Production proof with a signed-in non-enrolled account remains open.
- **Foundation save-progress error surfacing implemented locally.** Activity-backed
  and activity-less module completion now shows API/network save failures in the
  module handoff panel instead of silently leaving the learner to re-click.
  Production learner-path proof remains open.
- **Foundation completion CTA brittleness fixed locally.** The Executive Briefing
  offer now appears after the last module in the Understanding pillar according
  to the module map, instead of depending on a literal module number.
  Production learner-path proof remains open.
- **Foundation parallel module-content cleanup implemented locally.** Retired
  `module-N.ts` course files have been removed from the Foundation content
  barrel; the only live Module 3 override now lives in `module-3-activities.ts`.
- **Sandbox chat entitlement gate implemented locally.** `/api/sandbox/chat`
  preserves unauthenticated `401` behavior, rejects signed-in free users with
  `403` before rate limiting or model calls, and lets paid toolbox access use
  the existing 50/hour user limit. Production proof with both free and paid
  accounts remains open.
- **Toolbox PII guardrail hardening implemented locally.** Shared PII detection
  now catches contextual names, addresses, masked identifiers, and contextual
  customer/member/account/loan/card IDs. Paid Toolbox override sends now write
  non-content audit fields to `ai_usage_log`; migration `00057` and live proof
  remain open.
- **Institution dashboard mockup labeling implemented locally.** The
  `/for-institutions` hero dashboard now labels the sample as illustrative and
  mock-data-backed on both mobile and desktop. Production visual proof remains
  open.
- **Trusted-device sign-out cleanup regression-tested locally.** Server sign-out
  clears Supabase auth cookies and `aibi-trusted-device` together, leaving
  unrelated cookies intact. Production sign-out proof remains open.
- **Navigation/chrome cleanup implemented locally.** `/prompt-cards` and
  `/support/purchase-help` now use mockup chrome, `/verify` remains on
  `MockupShell`, `/playground` is linked from the mockup footer, the home
  CtaBand points directly to `/courses`, and duplicated `CHROMELESS_PATHS`
  entries are removed. Production visual/link proof remains open.
- **Refund support UX implemented locally.** `/support/purchase-help` now shows
  the 7-day refund window, buyer self-check criteria, 1-business-day refund
  review expectation, and manual Stripe handoff boundary before the support
  form. Focused tests now cover refund-request case creation, eligibility
  calculation, metrics, and admin refund approval/denial/manual-issued timeline
  logging. Production visual/form proof remains open.
- **Persona 5 CEO credibility path implemented locally.** `/about` is restored as a
  factual operating-standards page, the footer links to it, sitemap includes it, and the
  homepage trust anchor names the founder without fabricating advisors, testimonials, or
  regulator endorsement.
- **Persona 6 CIO/InfoSec data-handling path implemented locally.** `/security/data-handling`
  now explains model calls, PII/injection checks, stored records, provider stance,
  human review, AiBI retention posture, usage/PII audit log boundaries,
  subprocessors and residency caveats, DPA/SOC 2 posture, and PII warning
  overrides; it is linked from `/security`, `/courses`, Foundation purchase,
  footer, and sitemap.
- **Resource and security discovery implemented locally.** Resources is now a
  first-level mobile nav item instead of sitting behind More, and `/resources`
  now links directly to Security & governance, LLM data handling, and the IT
  review packet. The BSA/AML role filter now also surfaces the SAR Narrative
  Template with a Word-compatible download. Production mobile/link proof remains open.
- **Persona 7 skeptical-buyer claim boundaries implemented locally.** Purchase reviewer copy,
  certificate verification metadata/page copy, credential disclaimers, ROI caveat, and
  data-handling provider caveat now avoid regulator/third-party endorsement drift.
- **Persona 8 budget-conscious learner issue resolved in current code.** The $99 In-Depth
  page leads with report/peer-band/action-register deliverables and adjacent refund
  reassurance; the $295 Foundation path leads with Foundation Packet/artifacts and the
  same adjacent refund reassurance.
- **Persona 9 mobile-only path locally verified.** A focused iPhone 14 viewport audit
  passed for `/`, `/assessment`, `/assessment/in-depth`, `/courses`, Foundation purchase,
  `/security`, `/security/data-handling`, and `/about` with no horizontal overflow and
  sticky/fixed CTAs detected where expected. Physical iPhone/Safari production check still
  required.
- **Persona 10 institution/L&D path resolved in current code.** Team Assessment self-serve
  remains off by default; `/assessment/team` renders assisted rollout unless the explicit
  self-serve flag is set, and the checkout API fails closed with 403.
- **Persona 17 partner rollout path implemented locally.** `/for-institutions` now exposes
  a partner/association rollout card and form option for bankers' banks, associations,
  and service providers; `/api/inquiry` accepts `partner-rollout-request` and creates a
  high-priority `team_seats` support case with `product: partner-rollout`.
- **Persona 18 vendor-scout path implemented locally.** `/playground` is footer-discoverable
  and calls the real public model endpoint; `/pricing` keeps the FI buyer map while naming
  partner/association rollout by request and linking to `/for-institutions`.
- **Persona 22 press inquiry path implemented locally.** `/about` and the footer now expose
  a press/media inquiry mailto with deadline/outlet/topic guidance and attribution-boundary
  copy for journalist or researcher inquiries.
- **Persona 12 product-marketing copy implemented locally.** The homepage offer ladder now
  positions $99 as a written report, peer band, eight scores, and 90-day action register;
  positions $295 as saved prompts/templates/Foundation Packet; and updated MailerLite
  HTML/source copy to sell tangible outputs rather than a longer quiz or credential-first
  pitch.
- **Persona 14 RevOps scorecard implemented locally.** `/admin/funnel` now tells operators
  that known-contact metrics exclude configured test/internal identities and raw resource
  downloads are popularity signals only; `docs/funnel-reporting.md` now defines the
  exclusion rules and 20-row Friday scorecard cadence.
- **Persona 15 product-readiness evidence template implemented locally.** §6 now points
  to `docs/live-smoke-test-evidence-log.md`, which records the live-card purchase,
  webhook, email, entitlement, refund, defect, and accepted-gap proof required before
  broad paid promotion. Actual live smokes are still owner-run.
- **Persona 16 IT/security review packet implemented locally.** `/security/it-approval`
  now gives internal reviewers product scope, data posture, support/refund path, and
  claim boundaries; privacy/terms model-data language was softened and the packet is
  linked from security, data-handling, institution, footer, and sitemap surfaces.
  The `/security` Safe AI Use Guide path also cross-links LLM data handling and the
  IT review packet for counsel-style review.
- **Persona 18 UI/accessibility coverage implemented locally.** Playwright a11y/mobile
  coverage now includes assessment take, security, data-handling, IT approval, courses,
  Foundation purchase, and purchase-help routes. A 375px FAQ CTA-band overflow was fixed;
  the focused 81-test Chromium suite passed locally. Physical iPhone/Safari still required.
- **Persona 19 proof/brand guardrails implemented locally.** `/about` now names how proof
  will be collected without fake advisors/logos/testimonials and links to the public
  artifact gallery; the gallery is in the sitemap and `docs/proof-collection-runbook.md`
  defines approval, redaction, and publishing gates.
- **Persona 20 support owner flow implemented locally.** `/admin/support` and case detail
  pages now show daily queue cadence, SLA rules, access rescue, and manual Stripe refund
  authority flow. `docs/paid-buyer-support-runbook.md` now matches the console routine.
- **Persona 13 mission-aware report lens implemented locally.** The free
  assessment result now shows a mission lens when the typed institution name
  explicitly signals MDI, CDFI, minority depository, community-development, or
  similar mission context. Focused component tests cover both mission and generic
  institution names.
- **Persona 14 CDFI resource specificity implemented locally.** `/resources`
  now includes a CDFI Grant AI Evidence Checklist with an editable
  Word-compatible download for grant, impact, and community-development evidence
  files. Focused tests cover Resources discovery and the Word route.
- **Repo hygiene:** 776M of stale worktree dirs removed in the prior pass.
- **MailerLite inspected via MCP**; one banned-plural subject fixed.

### ❌ Not done (cannot be done from here / by the agent)
- **Paste/test/enable MailerLite nurture** — dashboard-only (API has no activate). The 12
  versioned email HTML files are ready in `docs/mailerlite-emails/`; the operator still has to
  paste them into MailerLite, seed-test merge fields, authenticate the domain, and enable — see §11.
- **Rotate the exposed `sk_live_…` key** — Stripe dashboard (owner). Local env should stay
  scrubbed to non-live placeholders, then `npm run audit:secrets` should be rerun.
- **Live E2E purchase/refund smoke tests** — require real cards on the live domain.
- **Support operator live verification** — requires the allowlisted operator account,
  support inbox, and production email delivery.
- **First-user proof collection** — owner approval is required before publishing
  quotes, logos, advisors, customer names, or anonymized artifacts.
- **100-persona production proof gates** — production proof for personalized PDF
  rendering, gated downloads, team lead capture, buyer recovery, stranded-buyer
  cron, public demo model calls, certificate print route, support-case creation,
  and retention crons/email delivery is not complete yet.

### 🔜 Needs doing before paid promotion (owner)
1. **Rotate `STRIPE_SECRET_KEY`** (exposed in a transcript this session), remove any old live key
   from local `.env.local`, then rerun `npm run audit:secrets`.
2. **Paste + test the 4 MailerLite nurture flows**, then enable (dashboard). The local
   MailerLite HTML/source copy has been tightened for Persona 12, but activation is still
   dashboard-only.
3. **Run the §6 live smoke tests** (free / In-Depth / Foundation / full refund / partial refund).
4. **Prove the 100-persona local remediation in production** before paid promotion:
   production proof for personalized PDFs and gated downloads, team lead capture,
   buyer recovery, stranded-buyer cron, public demo model calls, certificate
   print route, support-case creation, and retention crons/email delivery.
5. **Add named people when approved** (optional enhancement: populate `AdvisorsStrip` /
   founder bio). The factual `/about` trust path exists locally; additional named proof
   still requires owner-provided attribution and must follow `docs/proof-collection-runbook.md`.
6. **Deploy and live-verify the Foundation purchase-page secondary links** so undecided
   users can return to course overview, free assessment, purchase help, or institution
   inquiry instead of hitting a terminal purchase surface.
7. **Deploy and live-verify `/about`** so CEO buyers can see the founder/operator,
   operating standards, evidence rules, and trust boundaries.
8. **Deploy and live-verify `/security/data-handling` and `/security/it-approval`**
   so IT/security buyers can inspect prompt/provider/stored-record boundaries and
   forward one internal review packet before purchase.
9. **Deploy and live-copy-check claim boundaries** on `/certifications`, certificate
   verification, Foundation purchase, ROI, `/security`, `/security/data-handling`,
   `/security/it-approval`, `/privacy`, and `/terms`.
10. **Deploy and live-verify the homepage offer ladder** so the $99 rung reads as report
    value, not a longer quiz, and the $295 rung reads as concrete artifacts/Foundation
    Packet value.
11. **Run physical iPhone/Safari QA** for `/`, `/assessment/take`,
    `/assessment/in-depth`, Foundation purchase, `/support/purchase-help`,
    `/security/data-handling`, and `/security/it-approval`.
12. **Live-verify support owner flow**: operator login, purchase-help case creation,
    access rescue email, refund decision logging, and manual Stripe refund handoff.
13. **Live-verify the Foundation program-home enrollment gate**: a signed-in
    non-enrolled account visiting `/courses/foundation/program` redirects to
    `/courses/foundation/program/purchase`; an enrolled account still sees the
    course home.
14. **Live-verify the sandbox chat entitlement gate**: a signed-in free account
    calling `/api/sandbox/chat` gets `403` before model usage; a paid Foundation
    or In-Depth account can run the same course sandbox path under the 50/hour
    user limit.
15. **Secure one named top-of-funnel channel** — the revenue model's binding constraint.
    Do this after the site/support readiness gates pass; the channel is required
    before revenue targets become forecasts, but it should not pull unproven
    support or live-money paths into broad traffic.
16. **Collect the first three approved proof items** before scaling beyond controlled
    founder-led launch. Use `docs/proof-collection-runbook.md`; keep synthetic examples
    labeled synthetic and do not publish unapproved people, logos, or outcomes.

> Full detail + evidence: §0–§12 below, `docs/reviews/persona-e2e-review-2026-06-22.md`,
> `docs/reviews/red-team-review-2026-06-22.md`, and
> `docs/reviews/gtm-20-persona-review-2026-06-23.md`,
> `archive/Plans/20-persona-prioritized-remediation-plans-2026-06-23.md`,
> `archive/Plans/20-persona-remediation-comparison-2026-06-23.md`, and
> `archive/Plans/50-persona-gtm-readiness-review-2026-06-23.md`, plus the larger
> `archive/docs/persona-audit-2026-06-23/03-action-items.md`.

---

Green code is necessary but not sufficient. The current local worktree builds,
type-checks, passes lint, passes 566 unit tests, and the plan-named Chromium E2E
batch passed 81 tests with 6 seeded-dashboard tests skipped for missing local
Supabase seed prerequisites — but production readiness depends on operational
state that lives in Vercel / Supabase / Stripe / Resend and cannot be verified
from the repo. Work this list top to bottom; **the database
migrations are the #1 launch blocker** (an unapplied migration took down every
assessment result on 2026-06-18 — see §1).

Verify config fast with the health endpoints (no secrets exposed):

- `GET /api/health/supabase` — env presence + DB connectivity + recent-migration columns
- `GET /api/health/stripe` — `{ mode: "live" | "test", configured }`
- `GET /api/health/email` — Resend key presence + `skipResend` + from-address
- `POST /api/ops/alert-test` — sends a synthetic alert; requires `Authorization: Bearer $CRON_SECRET`

---

## 0. SPOF preflight — verify these THREE first

Three single points of failure each take the **entire funnel** down. Verify them
before anything else, and learn their failure signatures so you recognize them live:

- [ ] **Migrations applied through `00058`** — `/api/health/supabase` → `ok: true`.
      *Failure signature:* every `/results/{id}` and `/assessment/in-depth/results/{id}`
      404s ("I take any assessment and it says it's not available"). This took the site
      down on 2026-06-18. (Full detail in §1.)
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` present** in Production.
      *Failure signature:* every results page 404s and every save fails. (See §2.)
- [ ] **`STRIPE_WEBHOOK_SECRET` matches the live-account live-mode endpoint** — verify by
      triggering one real delivery and seeing a **2xx in the Stripe dashboard**, not by
      eyeballing the value. *Failure signature:* buyer is charged, webhook 400s, access is
      never provisioned — silent on every purchase. (See §4.)

---

## 1. Database migrations (CRITICAL — do this first)

All migrations in `supabase/migrations/` must be applied to the **production**
Supabase database, in order, through the highest number present
(currently `00058`).

- [x] Apply every migration through `00048_paid_toolbox_access_helper.sql`.
      **✅ 2026-06-22: `00044`–`00048` applied to production via Supabase MCP**
      (`00044` action_packet_notes was the unapplied blocker; `00045`–`00048`
      reconciled). All additive/idempotent — `ADD COLUMN/TABLE/INDEX IF NOT EXISTS`,
      `CREATE OR REPLACE FUNCTION`, constraint widened 1→18. No destructive DDL.
- [ ] Apply newer local migrations `00049`–`00058` before the next production
      deploy that depends on them. These cover funnel reporting, support ops,
      resource-download scorecards, assessment drafts/reminders, paid
      re-engagement logging, and `00057_ai_usage_pii_audit.sql` for non-content
      paid-Toolbox PII override audit fields, plus `00058` for 30-day
      free-assessment resume links.
- [x] Confirm with `GET /api/health/supabase` → `db.columns` shows
      `institution_context: true`, `action_packet_notes: true`,
      `previous_id: true`, and `ok: true`. **✅ 2026-06-22: returns `ok:true`,
      all three columns true, `error:null`.**
- [ ] Run `npm run check:course-schema:strict` against production-equivalent
      Supabase credentials before paid promotion.

> **Why this is first.** `loadAssessmentResponse` (free *and* paid results
> pages) reads `institution_context` (00045) and `action_packet_notes` (00044).
> Before the 2026-06-18 hardening, a missing column made the SELECT error and
> **every** `/results/{id}` and `/assessment/in-depth/results/{id}` 404 — the
> "I take any assessment and it says it's not available" symptom. The code is
> now fail-open (it retries without the optional columns), but the columns must
> still exist for institution context / action-packet notes to actually work.

## 2. Environment variables (Vercel → Production)

Core (assessments, auth, results):
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — **without this, every results page 404s and every save fails**
- [ ] `NEXT_PUBLIC_SITE_URL` — used to build magic links / absolute URLs

Payments (Stripe):
- [ ] `STRIPE_SECRET_KEY` — must be `sk_live_…` for real charges (verify via `/api/health/stripe` → `mode: "live"`)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_FOUNDATION_PRICE_ID`
- [ ] `STRIPE_INDEPTH_PRICE_ID`
- [ ] `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` — **deferred (Appendix A); not a launch var.** Only if the Foundation institution bundle / persistent institution discounting is intentionally enabled.
- [ ] `STRIPE_TEAM_ASSESSMENT_PRICE_ID` — **deferred (Appendix A); not a launch var.** Only if Team Assessment checkout is intentionally enabled.

Email (Resend) + nurture (MailerLite):
- [ ] `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_FROM_NAME` (verify via `/api/health/email`)
- [ ] `OPS_ALERT_WEBHOOK_URL` or `OPS_ALERT_EMAIL` (verify a webhook failure / test alert reaches the support owner)
- [ ] `MAILERLITE_API_KEY` + `MAILERLITE_GROUP_ID_ASSESSMENT` / `MAILERLITE_GROUP_ID_PLAYBOOK` (only if nurture is going live)

AI providers (sandbox / toolbox / report generation):
- [ ] `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` (whichever features are enabled)

## 3. SKIP_* flags must be OFF in production

Each of these silently no-ops a subsystem when `=== 'true'`. Confirm they are
unset or `false` in prod:
- [ ] `SKIP_SUPABASE_PROFILES` (off → results persist)
- [ ] `SKIP_RESEND` (off → emails send; check via `/api/health/email`)
- [ ] `SKIP_MAILERLITE`
- [ ] `SKIP_PDF_GENERATION`
- [ ] `SKIP_ENROLLMENT_GATE` (off → paid content is actually gated)
- [ ] `SKIP_CRON_AUTH`

Run `npm run audit:env:production` against production-equivalent env before paid promotion.
It fails on missing required runtime vars, missing ops alert destination, and dangerous
production skip flags.

Run `npm run audit:secrets` before promotion and before opening a PR. It scans source,
docs, artifacts, and ignored local env files for live-looking Stripe/Supabase/Resend
secrets. If it flags `.env.local`, rotate the exposed secret first, then replace local
live values with non-live test/dev values or remove them.

## 4. Stripe webhook

- [ ] In the Stripe dashboard (**live account, live mode**), a webhook endpoint points at
      `https://<prod-domain>/api/webhooks/stripe`.
- [ ] Its signing secret matches `STRIPE_WEBHOOK_SECRET` — confirmed by a real 2xx
      delivery, not by eyeballing the value.
- [ ] **All four events the handler consumes are subscribed** (must match
      `docs/stripe-products.md` → Webhook setup; the handler in
      `src/app/api/webhooks/stripe/route.ts` is the source of truth):
  - [ ] `checkout.session.completed` — writes `course_enrollments` (provisioning).
  - [ ] `charge.refunded` — **revokes access.** Skip this and refunds silently fail to
        revoke; the §6 refund test will fail with no obvious cause.
  - [ ] `payment_intent.payment_failed` — failed-purchase analytics.
  - [ ] `payment_intent.succeeded` — acknowledged (fulfillment is on checkout completion).
- [ ] After the §6 smoke tests, the Stripe dashboard shows recent **2xx** deliveries for
      the events that fired.

## 5. Resend templates / sender

- [ ] Sending domain verified in Resend; `RESEND_FROM` uses it.
- [ ] Assessment results email renders (`assessment-results-breakdown`) — used
      by the free flow **and** the paid In-Depth completion email.
- [ ] In-Depth purchase email renders (`in-depth-assessment-purchase`).
- [ ] Paid retention reminder emails render and deliver from production:
      Foundation not-started, Foundation stalled, and In-Depth waiting.

## 6. End-to-end smoke tests on the live domain

Record evidence in `docs/live-smoke-test-evidence-log.md`. Do not paste card
numbers, secrets, auth cookies, bearer tokens, or full magic links into the
evidence log.

- [ ] **Free assessment**: take it → submit email → land on `/results/{id}` (no 404) → receive the results email.
- [ ] **Paid In-Depth**: buy with a live card → purchase email arrives within ~5 min with a **working magic link** → link lands in an authenticated `/assessment/in-depth/take` (not a "purchase required" bounce) → complete → land on the briefing → results/briefing email arrives. Stripe shows 2xx for this session's webhook delivery.
- [ ] **Course purchase**: buy → welcome email arrives → reach `/courses/foundation/program` → save at least one artifact to the Toolbox.
- [ ] **Refund — full**: issue a full refund for a test Foundation purchase → within ~60s the `course_enrollments` row is gone and `entitlements.active=false` → the buyer's `/courses/foundation/program` shows the gated/purchase-required state.
- [ ] **Refund — partial**: issue a partial refund → access is **retained** (the handler discriminates full vs partial).
- [ ] **Refund — comp ($0)**: a comped enrollment has no charge, so `charge.refunded` cannot revoke it — revoke by **deleting its `course_enrollments` row** in Supabase and confirm the entitlement flips off.
- [ ] **Refund eligibility is manual**: the 7-day policy conditions (assessment unsubmitted / <2 modules / no certificate) are **not** enforced by the webhook — they are verified by a human before issuing the refund. Confirm the support owner knows this.
- [ ] **Refund notification is manual**: the webhook sends no refund email. Confirm the support owner sends a refund confirmation (or accept the gap explicitly).
- [ ] **Idempotency / replay**: in Stripe **test mode**, resend a `checkout.session.completed` for an already-provisioned session → handler returns 200 with **no duplicate** `course_enrollments` row.
- [ ] **Team Assessment, if enabled**: buy 10+ seats → receive admin link → participant link works → 10 completions unlock aggregate report → print route renders. *(Deferred per GTM plan — assisted-sales only until 2 cohorts pass.)*

## 7. Post-deploy sanity

- [ ] `/api/health/supabase` → `ok: true`
- [ ] `/api/health/stripe` → `mode: "live"`
- [ ] `/api/health/email` → `resendKeyPresent: true`, `skipResend: false`
- [ ] `POST /api/ops/alert-test` with `Authorization: Bearer $CRON_SECRET` returns
      `ok:true`, and the configured inbox/channel receives the synthetic alert.
- [ ] `GET /api/cron/assessment-abandoned`, `GET /api/cron/paid-reengagement`,
      and `GET /api/cron/stranded-buyers` reject without `CRON_SECRET` and return
      JSON with checked/sent/failed counts when called with it. Current Vercel cron
      schedules are daily so preview/production deploys pass on the active Hobby plan.
- [ ] **Mobile (real iPhone, Safari):** `/`, `/assessment`, `/assessment/in-depth`,
      `/courses`, the Foundation purchase page, and one `/results/{id}` render without
      layout breakage and the primary CTA is tappable. Full free assessment completes in
      under 3 minutes.

## 8. Copy audit (the buying-path surfaces — do before any paid promotion)

Buyers lose trust when pages, emails, receipts, and PDFs disagree. Scope this to the
buying path, not the whole site.

- [ ] Free assessment is **12 questions**; In-Depth is **48 questions**; Foundation is
      **18 bite-sized modules** — verified on the live pages, the two Stripe `product.description`s,
      and the transactional emails.
- [ ] No public copy says Foundation has **9** or **12** modules (stale counts). *(Known
      stale internal comment: `ModuleMapItem.tsx` — not user-facing, fix opportunistically.)*
- [ ] No copy describes the individual In-Depth as "board-ready" or "institution-wide".
- [ ] Team Assessment copy does not imply fully self-serve institutional rollout.
- [ ] No banned phrases (`FFIEC-aware`, `regulator-approved`, `AiBI Foundations` plural,
      etc. — see CLAUDE.local brand rules). The string "FFIEC-aware" appears nowhere.
- [ ] Every public statistic has a named source + year.

## 9. Operational readiness (before serious promotion)

- [ ] Remote branch list is only `origin/main`; production deploys green from `main`.
- [ ] No public CTA links to a mockup-only route (`public/sketches/*`); a
      human clicked every primary CTA on `/`, `/assessment`, `/courses`, `/services` and
      each lands on a real product surface.
- [ ] **Support**: `hello@aibankinginstitute.com` is the v1 support owner/inbox and
      `/admin/support` has the queue, buyer lookup, refund eligibility, macros, access rescue,
      CSV export, daily queue routine, business-hours SLA, and manual Stripe refund authority
      flow. Before promotion, live-verify operator login, case creation, access rescue, and
      refund decision logging. Treat admin/support login as a P0 launch-ops gate: verify
      allowlist, Supabase session, trusted-device confirmation, reset or magic-link delivery,
      `/admin/support/search`, purchase-help case creation, access rescue email, and event
      timeline logging with the real operator account.
- [ ] **Weekly scorecard** exists and is reviewed every Friday. `/admin`, `/admin/funnel`,
      and `docs/funnel-reporting.md#friday-scorecard-cadence` now provide the operating
      dashboard and 20-row template, but launch discipline still requires a human review,
      source/exclusion notes, and one next action per week.
- [ ] Dependency/security alerts are empty (`npm audit` clean, Dependabot empty).
- [ ] **Team Assessment self-serve stays off.** `/assessment/team` renders assisted rollout
      by default and `/api/checkout/team-assessment` returns 403 unless
      `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true`. Do not set the flag until 2
      cohorts pass E2E QA and the owner accepts self-serve risk.
- [ ] **Persona-review P1 items verified on live pages** (refund reversal adjacent to
      $99/$295 CTAs; `/services` single primary CTA via `/for-institutions`; ROI
      methodology one click away; credibility trust anchor present; Foundation purchase page
      has deployed non-checkout secondary links; `/about` returns 200 and is linked from the
      homepage trust anchor and footer; `/security/data-handling` is linked from security,
      course, and purchase surfaces; `/security/it-approval` is linked from security,
      data-handling, institution, footer, and sitemap surfaces; critical public routes have
      no serious/critical axe violations and no mobile horizontal overflow in the local
      Playwright matrix). Additional named founder/advisor proof remains owner-provided.
- [ ] **Massive-audit Function A verified on live `/assessment/take`.** Complete the
      free assessment both ways: submit email with marketing opt-in unchecked by default,
      submit with opt-in checked, and use "View summary without email" to confirm inline
      results plus browser-print fallback without account-existence disclosure.
- [ ] **Persona 15 skeptic/restart path verified live.** Confirm the homepage first
      viewport names community banks/credit unions, the 3-minute assessment, and the
      first artifact; finish the assessment, click Start over, and confirm the flow
      returns to Q1 without changing the selected question set.
- [ ] **Persona 84 ROI handoff verified live.** Adjust the homepage ROI calculator, click
      its assessment CTA, confirm `/assessment/take` includes `roi_*` params, finish the
      assessment, and confirm the ROI scenario appears on the email gate plus the final
      v3 result page.
- [ ] **Pricing comparison verified live.** `/pricing` returns 200, appears in desktop
      nav, mobile More, footer, sitemap, and the homepage price-strip comparison link;
      all four product CTAs land on the correct free, $99, $295, and institution paths.
- [ ] **Foundation credential value verified live.** `/courses` shows "What the
      certificate proves," links to `/certifications` and `/verify`, `/pricing` includes
      the credential/proof row, and sitemap includes `/certifications`.
- [ ] **Module 3 learner path verified live.** Complete Modules 1 and 2, open
      Module 3, confirm Build shows the strategy drill plus Prompt Wizard, use the
      worked starter prompt path, save the graded prompt, add handoff/transfer notes,
      and advance to Module 4.
- [ ] **Foundation save-progress failure handling verified live or in preview.**
      Force `/api/courses/save-progress` to return a non-OK response or simulate
      a network failure from the module handoff panel and confirm the learner sees
      a retryable error instead of a silent no-op.
- [ ] **Foundation pillar-completion CTA verified live.** Complete the last module
      in the Understanding pillar and confirm the Executive Briefing offer appears
      after the module debrief; confirm earlier Understanding modules and the next
      Creation module do not show that offer.
- [ ] **Foundation module-source hygiene verified before merge.** Confirm
      `content/courses/foundation-program/` contains no retired course
      `module-N.ts` files, only `module-3-activities.ts` for the intentional
      Prompt Wizard override, and focused Module 3 learner tests pass.
- [ ] **Toolbox PII guardrail verified live.** In paid Toolbox, submit a
      contextual name, street address, masked account, and member/account ID;
      confirm each shows `kind:"pii_warning"` before model usage. Confirming
      fabricated data should send the request and create an `ai_usage_log` row
      with `pii_flagged=true`, `pii_override=true`, and the expected `pii_kind`
      without storing prompt text.
- [ ] **Institution dashboard mockup label verified live.** `/for-institutions`
      shows the hero dashboard as an illustrative sample/mock-data preview on
      desktop and mobile, without implying the shown institution data is real.
- [ ] **Trusted-device sign-out verified live.** Sign out from the authenticated
      menu and Foundation settings, then confirm Supabase auth cookies and
      `aibi-trusted-device` are removed and protected pages require sign-in or
      device confirmation again.
- [ ] **Function H navigation/chrome verified live.** `/prompt-cards`,
      `/support/purchase-help`, `/verify`, and `/verify/[id]` should not show
      legacy global chrome or a dead `About`→`/` link; the footer should link
      `/playground`, `/prompt-cards`, `/certifications`, and `/verify`; the
      home CtaBand "Start learning" should go directly to `/courses`.
- [ ] **First proof items before scale**: collect at least three approved proof items
      (quote, anonymized artifact, before/after workflow, founder/operator evidence, or
      first-user outcome) before moving beyond controlled launch. Follow
      `docs/proof-collection-runbook.md`; synthetic examples stay labeled synthetic.

## 10. Tax trigger (don't forget this one)

- [ ] Stripe Tax is intentionally **off** at launch (bank/CU buyers largely exempt). Set a
      reminder: at **50 cumulative paid transactions** (the GTM 90-day model crosses this
      inside the window) or the first multi-state pattern, re-evaluate enabling Stripe Tax.

## 11. Go-live actions a human must flip (NOT auto-applied)

These are outward-facing / live-money and were intentionally **not** automated:

- [ ] **Paste + enable MailerLite nurture (NOT just "enable").** The 4 tier automations
      ("Starting Point / Early Stage / Building Momentum / Ready to Scale", trigger =
      subscriber_joins_group, groups wired correctly) exist in MailerLite. The API/MCP cannot
      author automation email HTML or enable an automation, so the 12 versioned bodies in
      `docs/mailerlite-emails/*.html` must be pasted by hand through the dashboard HTML editor.
      Use `docs/mailerlite-emails/index.html` as the copy source, leave each dashboard
      **Preview text** field blank, then send one seed test per tier before enabling. The seed
      test must confirm `{$score}`, `{$profile_id}`, result links, unsubscribe, and sender-domain
      authentication.
- [ ] **Verify live Stripe products.** The Stripe MCP/CLI is paired to the **sandbox**
      account; live products can only be created/verified on the **live** account. The app
      already runs live keys and live `price_*` IDs are configured, so live products likely
      exist — confirm in the live dashboard that In-Depth ($99) and Foundation ($295)
      products + prices match `docs/stripe-products.md` Block 1.
- [ ] **`STRIPE_TEAM_ASSESSMENT_PRICE_ID` can no longer re-arm checkout by itself** — if
      Team Assessment is ever enabled, set both the price id and
      `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true` intentionally.
- [ ] **Rotate `STRIPE_SECRET_KEY`** if it has been exposed in any log/transcript. After
      rotation, `npm run audit:secrets` must pass with no live-looking secrets.

## 12. Database hardening (post-launch, from Supabase advisors 2026-06-22)

Non-blocking; all pre-existing or by-design. Track for post-launch:
- New `team_assessment_*` tables have RLS enabled with **no policies** — intentional
  (service-role-only access), matches existing tables (certificates, refunded_checkout_sessions).
- Pre-existing: two `addie` SECURITY DEFINER views (ERROR-level lint), several
  SECURITY DEFINER functions executable by anon/authenticated (incl. `has_toolbox_access`
  as defined by migration 00048), `set_updated_at` mutable search_path, `citext` in public,
  and **leaked-password protection disabled** in Auth. Review before scaling, but none
  block the individual-funnel launch. Do not alter auth/entitlement functions casually —
  changing them can break RLS/login.
