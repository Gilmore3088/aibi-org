# Massive-Persona UX Audit — 2026-06-23

A comprehensive review of every user experience on the AI Banking Institute site,
conducted by simulating **100 diverse personas** (FI type × role × personality × source ×
goal × completion behavior) against the **real, code-grounded** site flows.

Branch: `massive-persona`. Read-only audit — no app code was changed.

## Contents
| Doc | What it is |
|---|---|
| [`00-flow-atlas.md`](./00-flow-atlas.md) | Ground truth: every route, gate, exact click-count, and known-broken surface, traced from code (sections A–G). |
| [`01-persona-roster.md`](./01-persona-roster.md) | The 100 personas, fully specified, with coverage check. |
| [`02-persona-outcomes.md`](./02-persona-outcomes.md) | All 100 walked: outcome (✅/⚠️/❌) + worst friction + severity, plus cross-cohort new issues. |
| [`03-action-items.md`](./03-action-items.md) | **The deliverable.** Prioritized fixes by largest gap, by website function, by clicks-to-value, and remaining polish. |

## How it was done
1. **Flow Atlas** — 7 agents read the actual code and mapped every flow with file:line evidence and exact click counts.
2. **Persona roster** — 100 personas authored across every diversity axis and all 14 completion-behavior buckets.
3. **Simulation** — 8 agents walked all 100 personas step-by-step through the real Atlas, recording clicks-to-value, friction, dead-ends, loops, and whether each reached their goal.
4. **Synthesis** — deduped, severity-ranked, organized as requested.

## Executive summary

**The top of the funnel works; the bottom does not.** Acquisition surfaces are strong — the
free assessment is a 1-click start (14 clicks to score, 12 of them intrinsic), resources are
well-stocked and 2 clicks away, provisioning is cleverly engineered, and the dashboard handles
empty states gracefully. **24 of 100 personas reached their goal cleanly** — almost all of them
resource-grabbers and free-assessment readers.

But **58 of 100 personas failed, bounced, or were stranded — 23 critically** — and the failures
are concentrated **after the click that matters**, in value-delivery, not in clicks:

1. **The certificate was unreachable.** Local remediation now auto-approves a completed final packet, issues the certificate, sends the first-issuance email, shows "Verified" only from a real certificate row, and adds `/verify`; the lookup form now normalizes printed IDs and routes to `/verify/<id>`. Live Vercel PDF/email/certificate-row proof remains outstanding.
2. **Paid buyers get stranded.** Access is a single magic-link email + a password-less account; bank email gateways (the exact audience) filter it; the login page demands a password they never set; the webhook won't re-send; nobody can detect who's stuck.
3. **No retention loop exists.** Abandoners, idle buyers, never-starters, and mid-course quitters are never contacted again. The free assessment can't even be resumed cross-device.
4. **Team buyers ready to pay get a `mailto:`,** while the self-serve checkout machinery sits built-but-dark and the assisted card tells them the product "isn't ready."
5. **The interactive demos are convincing fakes** that persist nothing and damage credibility with the most technical, highest-intent evaluators.
6. **Every email-gated free download is broken** — the user surrenders an email and receives a 500.

**Clicks-to-value** (the flagged concern) is real but secondary: the wins are cheap — put
resources/role-playbooks one click from home and on the result page, give the $99 a visible
entry, drop one redirect hop, and un-bury the real demo.

**Recommended sequence:** fix the 6 largest gaps (Part 1 of the action items) before any paid
marketing push — they are where money is lost and trust is broken. Then the function-level P1s,
then the clicks-to-value and polish items.

See [`03-action-items.md`](./03-action-items.md) for the full prioritized plan with file
references and effort estimates.

## Implementation status

2026-06-23: Gap 1 certificate auto-issue is implemented locally. The final
packet submit path now approves and issues a certificate after all 18 modules are
complete; the dashboard no longer shows "Verified" from module count alone; and
`/verify` has a certificate-ID lookup page with form coverage for normalized
printed IDs and incomplete-ID handling. The PDF-rendering migration in Gap
1.2 is partially complete: static course/resource PDFs now serve committed files
for Prompt Cards, Safe AI Use Guide, Skill Template Library, both course cards,
and all eight starter artifacts. The personalized certificate PDF endpoint now
uses a Chromium print route at `/verify/[certificateId]/print`, and the
personalized Acceptable-Use Card and Transformation Report now render escaped
HTML through Chromium. The known request-time API routes are migrated locally;
the new certificate, Acceptable-Use Card, and Transformation Report PDF paths
still need preview proof.

2026-06-23: Gap 3 free-assessment recovery is implemented locally. The free
assessment now persists the selected question rotation immediately, preserves
score-phase state across reloads, keeps the same question set on Start over,
and offers an email-resume-link flow backed by service-role-only
`assessment_drafts` records. `/api/cron/assessment-abandoned` now sends one
resume reminder to stale draft records. `/api/cron/paid-reengagement` now sends
deduped transactional reminders for idle In-Depth buyers, Foundation buyers who
never start, and Foundation learners stalled on a later module, with
service-role-only send logging in `paid_reengagement_events`. Production
migration/cron/email proof is still required.

2026-06-23: Gap 6 gated-download remediation is implemented locally for the two
broken lead-capture files.
Prompt Cards and the Safe AI Use Guide now stream committed static PDFs instead
of rendering `@react-pdf` on request; Prompt Cards waits for the file response
before unlocking, and the role dropdown value now matches the server allowlist.
Local endpoint checks returned valid PDF bytes for both routes. Production
Vercel proof remains open.

2026-06-23: Gap 4 assisted team-buying remediation is implemented locally.
`/for-institutions` and `/assessment/team` now use a real institution inquiry
form, optional booking URL, one-business-day reply expectation, support inbox
notification, and `team_seats` support-case creation when the support tables
are available. Raw team mailto CTAs and buyer-facing QA-gate copy were removed.
Persona 17's bankers' bank path is now explicit: `/for-institutions` includes a
partner/association rollout card and the form/API accept a
`partner-rollout-request` that creates a high-priority `team_seats` support case
with `product: partner-rollout`. Persona 18's vendor-scout path is handled as
intentional self-selection unless there is channel interest: pricing now names
partner/association rollout by request and links to the same institution inquiry
path.
Persona 24's L&D path is now explicit too: `/assessment/team` and
`/for-institutions` show the cohort launch packet, the form includes
`Cohort pilot / L&D rollout`, and `/api/inquiry` logs a high-priority
`cohort-pilot` support case.
Persona 31's PMO path is explicit: `/for-institutions` shows a 90-day
project-plan package with milestones, named owners, response SLA, and
first-call agenda; the form/API accept `project-plan-request` and log
`product: project-plan`.
Production form/inbox/support-case verification and the future self-serve
Stripe flip remain open.

2026-06-23: Gap 2 buyer recovery is implemented locally, including proactive
stranded-buyer detection. `/auth/login` now leads with an email sign-in link,
keeps password sign-in secondary, and offers purchase-link recovery.
`/support/purchase-help` also exposes the quick purchase-link resend path. The
Foundation success page now points "trouble getting the email" to purchase help
with the checkout email prefilled, so a buyer whose bank gateway filtered the
welcome email has an immediate self-serve recovery path. The new auth endpoints
are rate-limited and generic, device confirmation now has a cross-device
fallback into a fresh one-time auth link, and
`/api/cron/stranded-buyers` opens deduped support cases plus a summary ops alert
for paid enrollments whose auth user has never signed in after the alert window.
Production cron/support-case/email proof remains open.

2026-06-23: Gap 5 public-demo truthfulness is implemented locally for
`/playground` and `/practice`. Both now call the real capped public model
endpoint, `POST /api/playground/run`, instead of rendering canned output. The
endpoint uses `gpt-4o-mini`, PII and prompt-injection scans, usage logging in
`ai_usage_log`, 1/IP/minute and 5/IP/day limits, and a global daily public-demo
spend cap. `/practice` no longer claims to be signed-in/enrolled-only and no
longer exports fabricated `.md` output. `/admin/toolbox-usage` provides the
public-demo usage dashboard. The orphaned playground/my-toolbox `_body.html`
and `_script.js` files are deleted locally. Remaining work: production
model-key proof.

2026-06-23: Function A free-assessment gate/polish remediation is implemented
locally. `/assessment/take` now offers a "View summary without email" lane,
keeps marketing follow-up opt-in explicit and default-off, lets users review the
last answer from the score phase, fixes the dead restart anchor, and shows a
browser print fallback whenever `profileId` is unavailable for server PDF
generation. Raw assessment-email logs are redacted, and the dead `TierPreview`
component is deleted locally. Persona 15's restart issue is covered at the hook
boundary: Start over returns to Q1 while preserving the same selected question
set. Production browser proof remains open.

2026-06-23: Persona 84 ROI-to-assessment context loss is implemented locally.
The ROI calculator now appends a compact `roi_*` context to internal assessment
links, `/assessment/take` parses it, the email gate reminds the buyer of the
modeled annual capacity, and both inline and `/results/[id]` v3 result paths
render the ROI scenario beside the readiness result. Production browser proof
remains open.

2026-06-23: Pricing-scatter remediation for personas 3, 38, 66, and 79 is
implemented locally. `/pricing` now gives comparison shoppers a single map of
the Free snapshot, $99 In-Depth report, $295 Foundation course, and assisted
institution rollout. The page is linked from the mockup and system navigation,
mobile drawers, footers, sitemap, and homepage price strip. Production browser
proof remains open.

2026-06-23: Course credential-value remediation is implemented locally.
`/courses` now explains what the AiBI-Foundation certificate proves, what the
public authenticity URL verifies, what evidence sits behind the badge, and what
the credential does not claim. `/pricing` includes a credential/proof comparison
row, and `/certifications` is linked from the course page, footer, and sitemap.
Production browser proof remains open.

2026-06-23: Module 3 difficulty-cliff remediation is implemented locally.
The Module 3 Build step now renders the strategy drill and Prompt Wizard rather
than a generic long textarea, provides worked starter prompts learners can adapt,
and lowers the final prompt floor from 60 to 30 characters. Production learner
path proof remains open.

2026-06-23: Foundation program-home enrollment gating is implemented locally.
`/courses/foundation/program` now redirects true non-enrolled users to the
purchase page instead of rendering a default course shell, while preserving the
fetch-failed fallback warning and local/preview enrollment bypass behavior.
Production proof with a signed-in non-enrolled account remains open.

2026-06-23: Foundation save-progress error surfacing is implemented locally.
Activity-backed and activity-less module completion now shows API/network save
failures in the module handoff panel instead of silently leaving the learner to
click again. Production learner-path proof remains open.

2026-06-23: Foundation completion CTA brittleness is implemented locally. The
Executive Briefing offer now appears when the learner completes the
Understanding pillar as derived from the module map, instead of depending on a
literal module number. Production learner-path proof remains open.

2026-06-23: Foundation parallel module-content cleanup is implemented locally.
The retired `module-1.ts` through `module-12.ts` course files are deleted, the
barrel export no longer exposes `module1`-style legacy modules, and the only
non-generated Module 3 behavior now lives in the narrow `module-3-activities.ts`
override. The sandbox-data `module-*` directories are separate scenario configs
and intentionally remain.

2026-06-23: Sandbox chat entitlement enforcement is implemented locally.
`/api/sandbox/chat` still returns 401 for unauthenticated requests, but
authenticated non-buyers now get 403 before rate limiting, validation, or model
streaming. Paid toolbox access continues through the existing 50/hour user rate
limit. Production proof with signed-in free and paid accounts remains open.

2026-06-23: Toolbox PII guardrail hardening is implemented locally. The shared
scanner now catches contextual customer/member names, street/PO Box addresses,
masked identifiers, and customer/member/account/loan/card IDs in addition to
SSNs, email, phone, DOB, and raw account-number patterns. Paid Toolbox override
sends now log non-content audit fields (`pii_flagged`, `pii_override`,
`pii_kind`) to `ai_usage_log`; no prompt text or matched value is stored.
Migration `00057` and live proof of the audit fields remain open.

2026-06-23: Institution dashboard-mockup labeling is implemented locally.
The `/for-institutions` hero dashboard now labels the example as an
illustrative sample and mock-data preview on both mobile and desktop. Production
visual proof remains open.

2026-06-23: Trusted-device sign-out cleanup is regression-tested locally.
The server sign-out action now routes through a tested helper that clears all
Supabase auth cookies plus `aibi-trusted-device`, while leaving unrelated
browser cookies alone. Production sign-out proof remains open.

2026-06-23: Navigation/chrome cleanup is implemented locally for the flagged
Function H routes. `/prompt-cards` and `/support/purchase-help` now render the
mockup header/footer instead of legacy global chrome, `/verify` remains on
`MockupShell`, `/playground` is linked from the mockup footer, the home CtaBand
points directly to `/courses`, and duplicate `CHROMELESS_PATHS` entries were
removed. Production visual/link proof remains open.

2026-06-23: Refund UX remediation is implemented locally for Function I.
`/support/purchase-help` now shows the 7-day refund window, buyer self-check
criteria, 1-business-day refund review expectation, and the manual Stripe
handoff boundary before the support form. Refund requests create high-priority
support cases, and admin case controls log refund approval, denial, and manual
issue events without calling Stripe APIs. Production visual/form proof remains
open.

2026-06-23: Data-handling due-diligence remediation is implemented locally for
Function J. `/security/data-handling` now includes AiBI's own retention posture,
usage and PII audit log boundaries, subprocessors and residency caveats, DPA/SOC
2 posture, and PII warning override handling. Production visual/link proof
remains open.

2026-06-23: Resource discovery remediation is implemented locally for Function
B and the Function J security-from-resources path. The mobile header now exposes
Resources as a first-level nav item instead of hiding it behind More, and
`/resources` now links directly to Security & governance, LLM data handling, and
the IT review packet. Persona 16's counsel path is covered by the `/security`
page itself as well: the Safe AI Use Guide preview links to LLM data handling
and the IT review packet, with page-level coverage added locally. Production
mobile/link proof remains open.

2026-06-23: In-Depth post-purchase polish is implemented locally for Function
C. `/assessment/in-depth/access` no longer exposes unfinished cohort-dashboard
scaffolding to entitled individual buyers; it redirects them to
`/dashboard/assessments`. `/assessment/in-depth/purchased` now sends the paid
Toolbox CTA to the real signed-in/login path and treats public resources as a
secondary option. Production checkout/signed-in proof remains open.

2026-06-23: Playbook/resource dead-end cleanup is implemented locally for
Function B. `/playbooks` now uses the same direct role-PDF endpoints as
`/resources`, Draft/non-built playbook assets are omitted from the Assets tab
until they ship, and the GTM Plan template plus Platform Feature Reference Card
are discoverable from the resource hub. Production link/download proof remains
open.

2026-06-23: In-Depth discoverability is implemented locally for Function C.
The $99 offer already appears on the home pricing strip, `/pricing`, footer,
assessment, and result surfaces; `/security`, `/playground`, and `/courses` now
add direct cross-links to `/assessment/in-depth` so security, demo, and course
evaluators have a next step. Production link proof remains open.

2026-06-23: Home first-paint polish is implemented locally for the remaining
P2 bounce-risk items. The hero now names community banks and credit unions,
leads with a three-minute readiness promise, puts the value copy before the
redline proof object in DOM order for mobile, and makes the mobile sticky CTA
immediately reachable unless dismissed. Production visual proof remains open.
