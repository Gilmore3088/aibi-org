# Action Items — massive-persona audit (2026-06-23)

**What this is:** the prioritized output of walking 100 diverse personas through every
site experience (free/paid, assessments, resources, course, certificate, toolbox, team,
auth, support), grounded in code (`00-flow-atlas.md`), with per-persona outcomes in
`02-persona-outcomes.md`. Special attention to **clicks-to-value**.

**Headline:** the funnel's *acquisition* surfaces are strong (free assessment is a 1-click
start; resources are well-stocked; dashboard handles empty states; provisioning is cleverly
engineered). The failures cluster **after the click that matters** — fulfillment, retention,
and the terminal deliverables (certificate, paid access, team checkout). **58 of 100 personas
failed or were damaged; 23 critically.** Almost none of those 23 are about clicks — they are
about value that is promised and then **undeliverable**.

Severity: **P0** = lost revenue or broken core promise, fix before any paid push · **P1** =
material conversion/trust leak · **P2** = polish. Effort: S/M/L.

---

## PART 1 — LARGEST GAPS (ranked; fix these first)

These are the business-breaking failures. Each is a place where a user does everything right
and gets nothing, or where the system silently loses money.

### GAP 1 — The $295 certificate was unreachable; local remediation shipped, production proof remains. `P0`

**Implementation update 2026-06-23:** certificate auto-issue is implemented
locally. Work-product submission now auto-approves after all 18 modules are
complete, issues a certificate idempotently, sends the existing certificate
email on first issuance, returns the verify URL to the learner, and the
dashboard now marks "Verified" only when a real `certificates` row exists.
`/verify` now has a certificate-ID lookup entry point with lookup-form coverage
for normalized printed IDs and incomplete-ID handling. Static course/resource
PDFs that do not need personalization now serve committed files instead of
calling `@react-pdf` on request: Prompt Cards, Safe AI Use Guide, Skill
Template Library, both course cards, and all eight starter artifacts. The
certificate PDF endpoint now uses a Chromium print route at
`/verify/[certificateId]/print` instead of `renderToBuffer`. The personalized
Acceptable-Use Card and Transformation Report now render escaped HTML through
the Chromium PDF helper instead of React PDF. Remaining Gap 1 work: prove the
certificate, Acceptable-Use Card, and Transformation Report PDF rendering paths
on a real Vercel preview.

Original finding before the local remediation: every learner who finished all 18 modules and submitted
their work product (personas 10, 37, 48, 60, 78, 94, 100) **waited forever**:
- Nothing in the app set `work_submissions.review_status='approved'` — no reviewer UI, no cron,
  no auto-approve. The only writes were `'pending'`/`'resubmitted'`.
- Nothing called the certificate issuance path.
- Even if approved, the cert PDF used `@react-pdf renderToBuffer` and could 500 in production.
- `/submit` promised an issuance email, but no route sent one.
- The dashboard falsely showed "Verified ✓" from module count alone.
- There was no `/verify` lookup entry point for third parties.

**Action:**
1. ✅ Local: ship a defensible auto-approve rule that sets `review_status='approved'` and issues the certificate. `M`
2. Prove the certificate, Transformation Report, and Acceptable-Use Card Chromium PDF paths on a real Vercel preview. `M`
3. ✅ Local: send the certificate email on first issuance. `S`
4. ✅ Local: add a real certificate surface on the dashboard and stop showing "Verified" until a cert row exists. `S`
5. ✅ Local: build the `/verify` lookup page. `S`

### GAP 2 — Paid buyers get stranded: access depends on one email that bank gateways filter. `P0`

**Implementation update 2026-06-23:** self-service recovery and proactive
stranded-buyer detection are implemented locally. `/auth/login` now leads with
an email sign-in link, keeps password sign-in as a secondary option, and
includes a "bought something but cannot get in" purchase-link resend form.
`/support/purchase-help` now has the same quick purchase-link resend path before
the full support case form. New APIs `POST /api/auth/send-sign-in-link` and
`POST /api/auth/resend-purchase-link` are rate-limited and return generic
responses so they do not reveal account or purchase existence. Purchase
recovery looks up course enrollments by resolved `user_id` plus email variants
and sends a fresh one-time link to the right In-Depth or Foundation
destination. The Foundation purchase success page now routes "trouble getting
the email" to `/support/purchase-help` with the checkout email prefilled, and
purchase help pre-fills both the quick resend form and the support case form.
`/auth/confirm-device` now tolerates cross-device opens by handing
the browser into a fresh one-time auth link when the device-confirm token is
valid but the browser lacks the original session. `/api/cron/stranded-buyers`
now checks paid enrollments older than the alert window, opens deduped access
support cases when `auth.users.last_sign_in_at` is still empty, and sends a
summary ops alert when new cases are created. Remaining Gap 2 work: production
proof that the cron runs, cases appear in `/admin/support`, and recovery emails
deliver from the live domain. The red-team magic-link host bug is covered by
`src/lib/supabase/auth-admin.test.ts`, and `POST /api/auth/resend-purchase-link`
now has a focused route test proving a Foundation purchase can receive a fresh
link to `/courses/foundation/program` while preserving the generic
non-enumerating response.

Original issue: $99 and $295 fulfillment depended on a **password-less account + a single transactional magic-link email**
(personas 2, 25, 44, 65, 86, 98). For this exact audience (Mimecast/Proofpoint banks):
- If that email was filtered, the buyer had a **provisioned account they could not reach**.
- `/auth/login` **required a password the account never set**; device-confirm was same-browser-only, so a 2nd-device returner looped.
- The webhook only sent the email on `action==='created'`; a failed first send + Stripe retry was a **dedup no-op**.
- There was **no "stranded buyer" detection**; ops could not tell a stranded buyer from a lazy one.

**Action:**
1. Make `/auth/login` lead with **passwordless / magic-link sign-in** (email → link), not a password field. `M`
2. Make device-confirm **cross-device-tolerant** (let the link establish trust from any browser). `M`
3. Add a self-serve **"I bought something but can't get in"** recovery on `/auth/login` + `/support/purchase-help` that re-mints access by email regardless of webhook dedup state. `M`
4. Add a **stranded-buyer flag + ops alert** (`enrolled && never authenticated` after N hours). `S`

### GAP 3 — There is no retention loop. The funnel has a checkout but never follows up. `P0`

**Implementation update 2026-06-23:** free-assessment self-recovery is
implemented locally. `/assessment/take` now persists the selected 12-question
rotation immediately, preserves the score phase across reloads, and `Start
over` restarts the same question set instead of re-rolling. A new
service-role-only `assessment_drafts` table plus `POST /api/assessment/drafts`
and `GET /api/assessment/drafts/[token]` lets mid-assessment users email
themselves a 30-day resume link before Q12. Focused client tests cover sending
that resume draft from the question screen and restoring from a resume token.
`/api/cron/assessment-abandoned` now sends one resume reminder to stale draft records. Paid-product retention is
also implemented locally: a service-role-only `paid_reengagement_events` log plus
`/api/cron/paid-reengagement` sends deduped transactional reminders for
idle In-Depth buyers, Foundation buyers who never start, and Foundation learners
stalled on a later module. Remaining Gap 3 work: production proof for both
cron/email paths and the new migrations.

Original finding before the local retention work: no re-engagement existed anywhere
(confirmed: only `cleanup-rate-limits` + pdf-cleanup crons; no course/onboarding/abandon sequences):
- **Free-assessment abandoners** (8, 15, 35, 42, 54, 59, 92): state was `sessionStorage`-only, email was captured **only after Q12**, "Start over" **re-rolled a fresh question set**, and cross-device return was **structurally impossible** (no server identity existed until completion). Personas literally expected a reminder that did not exist.
- **Idle $99 buyers** (27, 43, 75, 98) and **never-start $295 buyers** (2, 25, 44, 51, 69, 93): nothing contacted them again.
- **Module-3 abandoners** (12, 23, 34, 57, 82): progress persisted but nothing pulled them back.

**Action:**
1. ✅ Local: add an explicit "email me my progress / resume link" mid-assessment and persist a server-side draft keyed to it. `M`
2. ✅ Local: add transactional reminders for **"finish your assessment"**, **"you haven't started your course"**, **"continue Module N"**, and **"your In-Depth is waiting"**. `M`
3. ✅ Local: stop re-rolling questions on "Start over" / "resume" — restore the same set. `S`
4. Prove the new migrations, cron routes, and Resend delivery in production. `M`

### GAP 4 — Team buyers who are ready to pay get a `mailto:`, not a checkout. `P0`

**Implementation update 2026-06-23:** the assisted team-buying path is
implemented locally. `/for-institutions` now has a real institution inquiry
form, uses the configured booking URL when available, routes assisted rollout
and Foundation seat requests to the form instead of `mailto:`, and states the
one-business-day reply expectation. `/assessment/team` now shows the same
capture flow in the self-serve-off state and no longer tells buyers the product
is gated because cohorts still need QA. Team/institution inquiries send buyer
acknowledgement, notify the support inbox, and create `team_seats` support
cases when Supabase support tables are available. The L&D cohort-pilot path now
has a visible cohort launch packet, form option, and high-priority
`cohort-pilot` support case so persona 24 no longer has to infer the cohort
artifact from generic team copy. The PMO project-plan path now has a visible
90-day workplan/owner/SLA package, form option, and high-priority
`project-plan` support case for persona 31. Remaining Gap 4 work:
production verification of form submission, support-case creation, inbox
delivery, and the later self-serve Stripe flip. Focused regression coverage now
asserts `/for-institutions` has no `mailto:` team CTAs and `POST /api/inquiry`
creates a `team_seats` support case for team assessment requests. Persona 17's
multi-institution path is now explicit with a partner/association rollout card,
form option, and high-priority `partner-rollout` support case.

Nine personas want team/cohort training; the four most ready-to-buy (55, 73, 81, 91) hit a wall:
- `/assessment/team` shows `TeamAssistedRolloutCard` whose copy literally says checkout is **"intentionally gated until two production-like cohorts pass end-to-end QA"** (`team/page.tsx:309`) — telling a CHRO with budget the product isn't ready.
- Every team CTA on `/for-institutions` is a **raw `mailto:`** (`_client.tsx:57,59,97,541,561`) — no form, no CRM capture, no scheduler, no SLA promise.
- The **full self-serve Stripe machinery exists but is flag-dark** (`ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT` unset).
- `/for-institutions` links to the team-report preview **only via a mobile-only deep link** — desktop buyers never see the proof.

**Action:**
1. Replace every `mailto:` with a real **lead-capture form + Calendly/booking link + "we respond within 1 business day"**. `S`
2. Remove the QA-gating rationale from buyer-facing copy. `S`
3. Decide: finish hardening and **flip the self-serve flag**, or present a clean assisted-sales motion — but not a wall that says "not ready." `M`
4. Surface the team-report preview on desktop. `S`

### GAP 5 — The interactive demos are convincing fakes that destroy credibility with the best prospects. `P1` (→P0 for evaluators)

**Implementation update 2026-06-23:** the public demo fakery is locally
removed from `/playground` and `/practice`. A new `POST /api/playground/run`
endpoint reuses the existing AI harness with the low-cost `gpt-4o-mini` model,
required PII and prompt-injection scans, `ai_usage_log` telemetry, 1/IP/minute
and 5/IP/day limits, and a global daily public-demo spend cap. `/playground`
now calls that endpoint instead of typewriting hardcoded output, escapes model
text before rendering, and routes "Save to Toolbox" to sign-in for the real
Toolbox. `/practice` no longer claims to be a signed-in/enrolled-only sandbox,
no longer fabricates scenario output, and no longer offers a fake `.md` export.
`/admin/toolbox-usage` now shows public demo calls, successes, rate limits,
errors, cost, daily trend, top IP hashes, and recent events. Remaining Gap 5
work: production proof with live model keys, paid-user discoverability polish,
and no further legacy mockup dead-code cleanup. The orphaned playground/my-toolbox
`_body.html` and `_script.js` files have been deleted locally. Focused UI
coverage now asserts `/playground` calls `POST /api/playground/run`, renders
returned model text, and is linked from the mockup footer.

`/playground` and `/practice` are **canned mockups** (personas 9, 18, 45, 64, 96):
- "Run" is a `setInterval` typewriter over hardcoded output; "Save to Toolbox" only `setSaved(true)`; the "recent Toolbox" panel is hardcoded fiction.
- `/practice` **falsely brands itself "Signed-in sandbox / Enrolled-only"** while public, and offers a **`.md` download of fabricated AI output**.
- The **real** working AI loop (`/dashboard/toolbox`, "AiBI Lab") is buried behind auth+payment and not in nav.
- Both are **orphaned** (no nav/home link), so only determined, technical evaluators find them — and they're the ones who notice the fakery.
- ~2,463 lines of orphaned dead code (`_script.js`/`_body.html`) sat alongside
  the active routes; this legacy code is now deleted locally.

**Action:**
1. Either wire these to the real (rate-limited, PII-scanned) model, **or** clearly label them "interactive preview" and link to the real product. `M`
2. Remove the false "Enrolled-only" claim and the fabricated `.md` export. `S`
3. Give the real Toolbox a discoverable entry for paid users. `S`
4. Delete the orphaned `_script.js`/`_body.html` dead code. `S` — implemented locally.

### GAP 6 — Every email-gated free download is broken; the user surrenders an email, then gets a 500. `P0`

**Implementation update 2026-06-23:** the two email-gated lead assets are
fixed locally. `/api/prompt-cards/download` and `/api/guides/safe-ai-use`
now stream committed static PDFs from `public/downloads/` instead of rendering
React PDF documents on request. The Prompt Cards role dropdown now matches the
server allowlist, and the unlock flow waits for the PDF response before marking
the cards available. The Safe AI Use Guide form now fetches the PDF and only
shows success after the PDF response succeeds. Local endpoint checks returned
`200` with valid PDF bytes: Prompt Cards 5 pages, Safe AI Use Guide 11 pages.
Focused regression coverage now includes the Prompt Cards static-PDF route and
the lead-gate UI path that unlocks only after `/api/prompt-cards/download`
returns successfully.
Remaining Gap 6 work: production/Vercel proof for those two endpoints, plus
the broader personalized PDF proof from Gap 1.2.

The **only two email-gated free assets** are the only two using `@react-pdf renderToBuffer`
(personas 7, 16, 28, 33, 47, 56, 63):
- **Prompt Cards PDF** (`/api/prompt-cards/download`) and **Safe AI Use Guide** (`/api/guides/safe-ai-use`) both 500 in prod (React #31).
- The Safe Guide previously showed a **false "Downloading now" success** before the 500; this is fixed locally and covered by component tests.
- Prompt Cards also has a **role-dropdown 400 bug** (`value="foundation"` rejected; default state `'practitioner'` not in the option list) and the "unlock" is a bypassable localStorage flag.
- Same pattern previously affected **5 of 7 course PDFs**. Static files now cover Prompt Cards and Skill Template Library, and the certificate, Acceptable-Use Card, and Transformation Report routes now use Chromium; the personalized routes still need Vercel proof.

**Action:**
1. Move all `renderToBuffer` downloads to the working Chromium/print path (or pre-generate static PDFs like the other 22 working assets). `M`
2. Fix the Prompt Cards role dropdown (align options ↔ server `ROLES` ↔ default state). `S`
3. Don't show "unlocked"/"success" until the file actually streams. `S`

---

## PART 2 — ACTION ITEMS BY WEBSITE FUNCTION

### Function A — Free Assessment (the primary conversion engine)
Strong: 1-click start, 14 clicks to score (12 intrinsic), good result cross-linking ($99 + role playbook + PDF). Fixes:
- `P1` Add a graceful **"see a summary without email / no thanks"** lane; the preview is good but the only exits are a dead `#restart` link and a "Start over" that wipes answers. (cohort 1) `S` — implemented locally via "View summary without email."
- `P1` Remove **hardcoded `marketingOptIn:true`**; add an opt-out checkbox — privacy-skeptic bankers (53, 72, 90) bounce on the forced opt-in. (`EmailGate.tsx:175`) `S` — implemented locally with explicit opt-in, default off.
- `P1` **Persist phase in sessionStorage** so reloading on the score/results page doesn't bounce to the questionnaire (A5); restore the same question set on resume and keep the same question set when Start over returns to Q1. `S` — implemented locally.
- `P1` Carry **ROI calculator context** into the assessment/result path so persona 84 does not lose the dollar model at click-through. `S` — implemented locally via `roi_*` query params and result-panel rendering.
- `P2` Fix the dead `#restart` anchor; allow per-question back at the score phase. `S` — implemented locally.
- Persona 30 trace: focused UI/hook coverage now proves the score screen has a
  real `#restart` target, `Review answers` calls the back path, and `Start over`
  keeps the same selected question set.
- `P2` Handle the Supabase-down / `profileId:null` case so the inline report still offers a print link (no silent no-PDF). `S` — implemented locally.
- `P2` Remove `console.log` of raw emails in `capture-email/route.ts`. `S` — implemented locally with redaction.
- `P2` Delete the dead `TierPreview.tsx` (misrepresents the gate). `S` — implemented locally.

### Function B — Resources / Downloads (well-stocked, easy wins available)
22 of 24 downloads work and are 2 clicks from desktop home. Fixes:
- `P0` Fix the 2 broken email-gated downloads (GAP 6). `M` — implemented locally; Prompt Cards and Safe AI Use Guide stream committed PDFs and only show success/unlock after the file response succeeds.
- `P1` **Discovery:** home has no resources link; `/prompt-cards` + `/playbooks` aren't in nav; the prompt-card library is reachable only via a below-the-fold button. Add resource entry points (see Clicks-to-Value §). `S` — implemented locally for the primary/mobile header and resource hub review paths; prompt cards/playbooks also have hub/footer paths.
- `P1` **Mobile tax:** "Resources" is behind the "More" panel (+1 click). Promote it. (`SiteHeader.tsx:31`) `S` — implemented locally; Resources is now a first-level mobile nav item and More only holds Pricing/Institutions.
- `P1` **Inconsistent gating:** role playbook PDFs are ungated on `/resources` but email-gated on `/playbooks` (same file). Pick one. `S` — implemented locally; `/playbooks` now links directly to the same PDF endpoint used by `/resources`.
- `P2` Remove or surface the **9 "Coming soon" Draft playbook assets** (dead-ends). `S` — implemented locally; draft/non-built assets are omitted from the Assets tab until they ship.
- `P2` Wire up or delete the **orphaned GTM Plan template** + `platform-feature-reference-card`. `S` — implemented locally; both are now discoverable from `/resources`.
- `P2` Surface a BSA-specific template in `/resources` so persona 6 does not have to infer it from the playbook. `S` — implemented locally; the BSA/AML role filter now shows the SAR Narrative Template and an editable Word-compatible download.

### Function C — $99 In-Depth Assessment
Mechanics are strong (1 click to checkout, 0 clicks to results). Fixes:
- `P1` **Discoverability:** no home/nav entry; `/security` and `/playground` have no path to it (personas 27, 43). Add a visible entry + cross-links from security/playground/course pages. `S` — implemented locally; home/pricing/footer expose the offer and `/security`, `/playground`, and `/courses` now cross-link to `/assessment/in-depth`.
- `P1` Idle-buyer re-engagement (GAP 3) + stranded-buyer detection (GAP 2). `M`
- `P2` `/assessment/in-depth/access` shows "Coming soon" scaffolding to individual buyers — hide it for them or finish it. `M` — implemented locally by redirecting entitled individual buyers to `/dashboard/assessments`.
- `P2` `/purchased` over-promises "your paid Toolbox" but browses free `/resources` — align copy. `S` — implemented locally; signed-in buyers get `/dashboard/toolbox`, unsigned buyers get the login path for paid Toolbox, and public resources are secondary.

### Function D — $295 Foundation Course
Clean 3-click purchase; solid forward-gated progression. Fixes:
- `P0` Certificate dead-end (GAP 1) + stranded buyers (GAP 2) + retention (GAP 3). `M` — certificate auto-issue, dashboard credential truth, public `/verify` lookup, stranded-buyer cases, and paid re-engagement are implemented locally; live proof remains open.
- `P1` **Module 3 difficulty cliff** — 0 activities in M2 → a 60-char authored-prompt gate in M3, no skip/scaffolding (personas 12, 23, 34, 57, 82). Add a worked example to adapt, lower the bar, or "save draft & continue". `M` — implemented locally by routing Module 3 Build to the intended strategy drill + Prompt Wizard, adding worked starter prompts, and lowering the final prompt floor to 30 characters.
- `P1` `/courses/foundation/program` home doesn't gate on enrollment (soft leak). `S` — implemented locally by redirecting true null enrollments to `/courses/foundation/program/purchase` while preserving the fetch-failed progress warning and preview/dev enrollment bypasses.
- `P1` Surface course/credential value on `/courses` — comparison shoppers can't see what they're buying. `S` — implemented locally with a `/courses` credential-value section, `/pricing` proof row, `/certifications` footer/sitemap entry, and explicit "not a license/regulator/third-party endorsement" boundary.
- `P2` `save-progress` fails silently — surface errors. `S` — implemented locally for activity-backed and activity-less modules; API and network failures now render a retryable alert in the module handoff panel instead of failing silently.
- `P2` Hardcoded module-9/5 CTAs in `CompletionCTA.tsx` are brittle. `S` — implemented locally by deriving the Executive Briefing offer from the last module in the Understanding pillar instead of a literal module number.
- `P2` Two parallel module-content systems (`micro-modules.ts` live, 14 `module-N.ts` dead) — delete the dead set. `S` — implemented locally by deleting the retired course `module-N.ts` files and replacing the lone live Module 3 dependency with `module-3-activities.ts`.

### Function E — Toolbox / Practice / Playground (product demo)
- `P1` Fake-demo credibility (GAP 5). `M`
- `P1` **PII guardrail** is a narrow regex (misses names, addresses, partial accounts, narrative PII) and is **user-overridable with no server-side audit log** — a real compliance exposure for a banking product. Add audit logging of overrides + broaden detection. (`pii-scanner.ts`, `toolbox/run/stream/route.ts:160`) `M` — implemented locally by broadening server/client detection to contextual names, street/PO Box addresses, masked identifiers, and customer/member/account/loan/card IDs, plus non-content server audit fields for paid Toolbox overrides in `ai_usage_log`. Migration `00057_ai_usage_pii_audit.sql` must be applied and live override proof remains open.
- `P2` `/api/sandbox/chat` gates auth but **not entitlement** — any free logged-in account can burn metered model budget. `S` — implemented locally by requiring the same paid toolbox entitlement before rate limiting or model calls; production proof with a signed-in free account and a paid account remains open.

### Function F — Team / Institutions
- `P0` Team checkout wall (GAP 4). `M` — assisted team, L&D cohort-pilot, and partner rollout requests are implemented locally via structured inquiry, support inbox notification, visible cohort packet, and `team_seats` support-case creation; production proof and future self-serve Stripe flip remain open.
- `P2` Label the `/for-institutions` hero dashboard mockup as illustrative. `S` — implemented locally with explicit illustrative-sample and mock-data labels on the mobile summary and desktop dashboard preview.

### Function G — Auth / Fulfillment / Account
- `P0` Passwordless login + cross-device confirm + recovery (GAP 2). `M`
- `P2` `signOut` doesn't clear the `aibi-trusted-device` cookie. `S` — implemented locally via the server sign-out action; Supabase auth cookies and the trusted-device cookie are cleared together with a focused regression test.

### Function H — Navigation / IA
- `P1` **No `/pricing` page / scattered pricing map** — comparison shoppers (3, 38, 66, 79) can't compare Free, $99, $295, and Team options. `S` — implemented locally with `/pricing`, nav/footer links, sitemap entry, and homepage comparison link.
- `P1` **Two divergent nav systems.** `/prompt-cards`, `/support/purchase-help`, `/verify/[id]` render legacy chrome with a **dead "About"→`/`** link and look like a different site. Add them to `CHROMELESS_PATHS` (or migrate to `MockupShell`) and delete `system/SiteNav` + `system/SiteFooter`. `S` — implemented locally for the flagged routes: prompt cards and purchase help now use mockup header/footer, and verify was already on `MockupShell`. Full legacy `system` chrome deletion remains future cleanup.
- `P1` **Orphan routes:** `/playground` and `/certifications` have zero inbound links. Link or retire them. `S` — implemented locally via mockup footer links for `/playground` and existing course/footer links for `/certifications`.
- `P2` Home CtaBand "Start learning" → `/courses/foundation` 307→`/courses` — repoint to `/courses`. `S` — implemented locally.
- `P2` De-duplicate `CHROMELESS_PATHS` (hand-maintained, error-prone). `S` — implemented locally.

### Function I — Support / Refund
- `P1` Refund is contact-form-only with **no SLA shown**, eligibility the buyer **can't self-check**, on a **legacy-chrome page** (personas 11, 61, 87). Show the refund policy + window inline, set a response-time expectation, fix the chrome. `S` — implemented locally with modern mockup chrome, 1-business-day refund review expectation, 7-day refund window, buyer self-check criteria, high-priority refund case intake, explicit manual-Stripe handling, and admin timeline logging for refund approval, denial, and manual issue events.

### Function J — Security / Compliance content
- `P1` `/security/data-handling` is credible but missing **AiBI's own retention window, sub-processor/residency list, DPA/SOC 2**, and is silent on the PII-override reality — insufficient for formal vendor due diligence (personas 26, 33, 89). `S` — implemented locally with an AiBI operating-posture section covering retention, usage/PII audit logs, subprocessors and residency, DPA/SOC 2 boundaries, and PII warning overrides.
- `P2` Surface `/security` from `/resources` (currently footer-only) so security-seeking personas find the governance story. `S` — implemented locally with Security & governance, LLM data handling, and IT review packet cards on `/resources`; `/security` also links counsel to LLM data handling and the IT review packet beside the Safe AI Use Guide.
- Persona 33 trace: focused coverage now proves the forwardable IT review
  packet exposes product scope, data posture, trust boundaries, and review links
  alongside the Safe AI Use Guide static-PDF route.

---

## PART 3 — CLICKS-TO-VALUE (the user's special focus)

Click count is **not** the funnel's main problem — but there are real, cheap wins, especially
the free-assessment → resource/role-playbook paths the user flagged.

| Value moment | Today | Friction | Target | Fix |
|---|---|---|---|---|
| Start free assessment | **1 click** | — | 1 | Already optimal (every hero/CTA → `/assessment/take`). |
| See free score | 1 + 12 answers + email | email gate (by design) | same | Keep email capture as primary; the no-thanks summary lane is implemented locally (Fn A). |
| **Free downloadable resource** | **2 desktop / 3 mobile** | no home link; nav-only; mobile behind "More"; prompt cards buried + broken | **1–2** | Add a **"Free downloads" item to primary nav** + a resource/role-playbook tile **on the home page** and **on the free-assessment result** (result already links the matched role playbook — extend to a "grab the kit" tile). Promote Resources out of the mobile "More" panel. |
| **Assessment → role playbook / template** | result links 1 role playbook (good); cold visitor 2–3 clicks + scroll-hunt | the specific artifact is buried under anchors; prompt cards 3–4 clicks + broken | **1–2** | On the result page, surface a **direct download of the matched role's playbook + starter kit** (not just a link to `/playbooks/[role]`). For cold visitors, feature 3–4 top resources on home. |
| Reach $99 offer | footer/upsell-only, then 1 click to Stripe | **no home/nav entry** | 1–2 | Implemented locally: home/pricing/footer expose the offer and `/security`, `/playground`, `/courses` cross-link to `/assessment/in-depth`. |
| Reach $295 checkout | 2 (`/courses`) / 3 (home) | one avoidable 307 hop | 2 | Repoint the home "Start learning" CtaBand to `/courses`. |
| Run the public AI demo | unreachable + fake | orphan + mockup | 1 | Link a **real** (or honestly-labeled) demo from nav/home. |
| Earn certificate after $295 | **BLOCKED** | no issuance path | — | GAP 1. |

**Net:** the clicks-to-value wins are (1) put **resources/role-playbooks one click from home and on the result page**, (2) keep proving the new **$99 visible entry/cross-links** in production, (3) drop the **`/courses` redirect hop**, and (4) un-bury the **real demo**. None is large; all are `S`.

---

## PART 4 — REMAINING ITEMS (polish / lower severity)

- `P2` Home hero is abstract/problem-framed ("AI use is spreading. Workflow discipline is not.") with **no ICP mirror** (no "for community banks / credit unions") and concrete value ("Free · 12 questions · 3 minutes") demoted to meta text — hurts 10-second bouncers (36, 62, 80, 95). Consider leading with the plain promise + an ICP line + above-fold proof. `S` — implemented locally; the hero now names community banks/credit unions, leads with a three-minute readiness promise, and surfaces the first artifact in the meta line.
- `P2` Sticky mobile CTA hidden until 600px scroll; animated demo renders above value copy on mobile — both hurt the first-paint window. `S` — implemented locally; hero copy now precedes the proof object in DOM order and the mobile sticky CTA is immediately reachable unless dismissed.
- `P2` Report copy is tier-generic, not role/mission-aware (MDI, teller personas note it doesn't speak to them). Content, not code. `M` — implemented locally for explicit mission institution signals: the free report now adds a mission lens when the typed institution name contains MDI, CDFI, minority depository, community development, or similar mission-context terms.
- `P2` No press/media contact surface for journalist persona (22). `S` — implemented locally on `/about` and the footer with press/media inquiry copy, deadline/outlet/topic guidance, and attribution boundaries.
- `P2` Non-FI visitors (fintech, student, consultant) have no path; acceptable if intentional, but the playground orphan means even curious evaluators bounce. `S` — implemented locally for the vendor-scout case: `/playground` is discoverable and real, pricing keeps the FI buyer map but names partner/association rollout, and `/for-institutions` accepts partner-channel inquiries.
- `P2` `/assessment/in-depth/results/[id]` and other bearer-token pages are by-design no-auth (UUID = access) — fine, but document it.

---

## Appendix — severity rollup

| Severity | Count of distinct issues | Representative |
|---|---|---|
| P0 (lost revenue / broken core promise) | 6 gaps | cert dead-end, stranded buyers, no retention, team checkout, fake demos, broken gated downloads |
| P1 (material conversion/trust leak) | ~18 | $99 discoverability, pricing scatter, module-3 cliff, nav split, PII audit log, email opt-in, refund UX |
| P2 (polish) | ~20 | hero copy, mobile first-paint, dead anchors, silent failures, dead code |

**Persona coverage:** 100/100 walked; all 14 completion-behavior buckets and every major
flow exercised. 24 reached goal cleanly, 18 damaged, 58 failed (23 critically). The clean-pass
personas are concentrated in resource-grabbing and free-assessment reading — i.e. the
**top of funnel works; the value-delivery bottom of funnel does not.**
