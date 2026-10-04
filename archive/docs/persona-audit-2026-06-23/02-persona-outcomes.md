# 100-Persona Outcomes — consolidated (massive-persona audit, 2026-06-23)

Every persona from `01-persona-roster.md` walked step-by-step against the grounded
`00-flow-atlas.md`. Outcome legend: ✅ reached goal · ⚠️ reached but damaged · ❌ failed/bounced/stranded.
Severity = impact of the worst friction that persona hit.

## Outcome table (all 100)

| # | Persona | Outcome | Worst friction hit | Sev |
|---|---|---|---|---|
| 1 | Curious CEO | ✅ | no-PDF if Supabase down (latent); silent acct | Low |
| 2 | Board-Pressured President | ✅ local fix | Foundation purchase-link resend, paid re-engagement, stranded-buyer cases, and canonical www magic links are implemented locally; production email/cron proof open | **Crit** |
| 3 | Skeptical CFO | ✅ local fix | `/pricing` now compares Free, $99, $295, and team paths; $99 is visible and certificate proof/value is explained locally; production proof open | High |
| 4 | Eager Innovation Officer | ✅ local fix | institution/team CTAs now route to structured inquiry, inbox notification, and `team_seats` support-case creation locally; production proof open | High |
| 5 | Overwhelmed Compliance Chief | ✅ verified | Resources -> AI Use Policy Starter -> Word download path is exposed and covered locally | Low |
| 6 | Detail-Driven BSA Officer | ✅ local fix | BSA/AML role filter now surfaces the SAR Narrative Template with a Word-compatible download from Resources | Low |
| 7 | Burned-by-Vendors CIO | ✅ local fix | Safe AI Use Guide streams from committed PDF and the form only shows success after PDF fetch succeeds locally; production proof open | **Crit** |
| 8 | Time-Starved CRO | ✅ local fix | visible mid-assessment resume-link path stores server draft and restores by token locally; production email/cron proof open | High |
| 9 | Self-Learning Lender | ✅ local fix | `/playground` has footer discovery, calls the governed public model endpoint, and renders returned model text locally; production model-key proof open | High |
| 10 | Required-to-Certify Analyst | ✅ local fix | final packet submission after all 18 modules auto-approves, issues the certificate idempotently, sends first-issuance email, and dashboard links the verified credential locally; production PDF/email proof open | **Crit** |
| 11 | Refund-Seeker | ✅ local fix | refund page now shows 7-day self-check, 1-business-day review expectation, modern chrome, high-priority support case intake, and admin refund decision logging locally | Med |
| 12 | De Novo Founder | ✅ local fix | Module 3 now uses the strategy drill plus Prompt Wizard, worked starter prompts, 30-character final prompt floor, and paid re-engagement pulls stalled learners back locally; production cron/email proof open | High |
| 13 | MDI Mission Officer | ✅ local fix | free report now shows a mission lens when the typed institution name explicitly signals MDI, CDFI, or community-development context | Low |
| 14 | CDFI Grant Writer | ✅ local fix | Resources now includes a CDFI Grant AI Evidence Checklist with a Word-compatible download for grant, impact, and community-development evidence files | Low |
| 15 | Thrift Traditionalist | ✅ local fix | hero now names community banks/credit unions, the 3-minute assessment, and first artifact; Start over returns to Q1 without changing the selected question set locally | High |
| 16 | Trust Company Counsel | ✅ local fix | Safe AI Use Guide streams from committed PDF; `/security` links counsel to LLM data handling and IT review packet; `/resources` surfaces the security/governance path locally | High |
| 17 | Bankers' Bank Strategist | ✅ local fix | `/for-institutions` now exposes a partner/association rollout path, form option, and high-priority `team_seats` support case for multi-institution inquiries locally | High |
| 18 | Fintech Vendor Scout | ✅ local fix | non-ICP can self-select out; `/playground` is discoverable and real, while pricing and `/for-institutions` expose a partner/association inquiry path for vendor or service-provider channel interest | Low |
| 19 | State Examiner | ✅ local fix | `/verify` now has a public certificate-ID lookup with normalization/error handling; completed final packet flow issues reusable certificate records locally; live certificate-row proof open | High |
| 20 | Independent Consultant | ✅ verified | free-first path works; bank-framed report is expected ICP framing and not blocking | Low |
| 21 | Grad Student | ✅ verified | public assessment and resource-learning paths work; no persona-specific product defect | Low |
| 22 | Trade Journalist | ✅ local fix | `/about` and footer now expose a press/media inquiry path with attribution boundaries and the operator inbox | Low |
| 23 | Frontline Teller | ✅ local fix | Module 3 no longer starts from a blank long prompt gate; worked starters and the wizard give low-tech learners a concrete path locally | **Crit** |
| 24 | L&D Director | ✅ local fix | `/assessment/team` and `/for-institutions` now expose an L&D cohort-pilot path, cohort launch packet, form option, and high-priority `cohort-pilot` support case locally; production proof open | High |
| 25 | Branch Ops Manager | ✅ local fix | Foundation success page now routes filtered-email recovery to prefilled purchase help; purchase-link resend, paid re-engagement, and stranded-buyer support cases are implemented locally; production email/cron proof open | **Crit** |
| 26 | CISO Gatekeeper | ✅ local fix | `/security/data-handling` now covers AiBI retention, subprocessors/residency, DPA/SOC 2 posture, and PII override audit boundaries locally; production link proof open | Med |
| 27 | Digital Banking Lead | ✅ local fix | playground now links $99 path; paid re-engagement local, production proof open | High |
| 28 | Marketing CMO | ✅ local fix | Prompt Cards and Safe AI Use Guide now stream committed PDFs; Prompt Cards waits for the PDF response before unlock/download, with focused route and UI coverage locally; production proof open | Med |
| 29 | Internal Auditor | ✅ verified | discovery-only path remains healthy; no persona-specific product defect | Low |
| 30 | Board Director | ✅ local fix | free assessment now has a no-thanks summary lane, real `#restart` target, score-phase answer review, and Start over preserves the selected question set locally | Med |
| 31 | Project Manager | ✅ local fix | `/for-institutions` now exposes a PMO project-plan path with 90-day milestones, named owners, one-business-day SLA, form option, and high-priority `project-plan` support case locally | Med |
| 32 | Chief Credit Officer | ✅ verified | healthy In-Depth/evaluation path remains intact; no persona-specific product defect | Low |
| 33 | Vendor-Mgmt Officer | ✅ local fix | Safe AI Use Guide streams from committed PDF and `/security/data-handling` plus `/security/it-approval` expose DPA/SOC 2 posture, subprocessors, residency, and forwardable review links locally; production proof open | **Crit** |
| 34 | Operations Clerk | ✅ local fix | Module 3 uses short scaffolded reps, starter prompts, and a lower final prompt floor locally; production learner-path proof open | **Crit** |
| 35 | Returning Mobile→Desktop | ✅ local fix | free assessment now offers a visible server-backed resume-link path, restores by token on another device, preserves the selected question set, sends stale-draft reminders locally, and uses a 30-day expiry for weeks-later returns; production email/cron proof open | **Crit** |
| 36 | Accidental Clicker | ✅ local fix | hero now names ICP and 3-minute value before the proof object | Med |
| 37 | Eager Early Adopter | ✅ local fix | final packet completion issues the certificate locally; dashboard/verify/certificate PDF paths exist; toolkit and post-assessment report downloads now show a retry/support path instead of failing silently on PDF 500s; production PDF/email proof open | **Crit** |
| 38 | Budget Hawk CFO | ✅ local fix | `/pricing` now compares Free, $99, $295, and team paths in one surface and links budget skeptics directly to the ROI calculator; production proof open | High |
| 39 | Compliance Box-Checker | ✅ verified | compliance resource discovery remains healthy; resources surface the compliance policy template and security/governance path, and Safe AI Use Guide download coverage passes locally | Low |
| 40 | 3rd-Party Cert Verifier | ✅ local fix | `/verify` now provides a public certificate-ID lookup, normalizes printed IDs, uses mockup chrome, and unknown IDs stay in the lookup flow for correction locally | High |
| 41 | Curious Director | ✅ verified | public discovery path remains healthy: Resources is primary/mobile nav, `/resources` exposes role playbooks/templates, and playbook PDFs download directly without an email gate locally | Low |
| 42 | Overwhelmed CEO | ✅ local fix | assessment header now reassures with question position plus answered count, mid-assessment users can email a 30-day server-backed resume link, and stale-draft reminders are implemented locally; production email/cron proof open | High |
| 43 | Risk-Averse CRO | ✅ local fix | `/security` now cross-links cautious evaluators to the $99 In-Depth report, and idle In-Depth buyers are included in paid re-engagement locally; production email/cron proof open | High |
| 44 | CUNA Newsletter Reader | ✅ local fix | Foundation success page routes filtered-email recovery to prefilled purchase help; purchase-link resend, paid not-started re-engagement, and stranded-buyer support cases are implemented locally; production email/cron proof open | **Crit** |
| 45 | IT Generalist | ✅ local fix | `/practice` is now honestly labeled as a public demo, calls the governed public model endpoint, removes the false enrolled-only/fake-export path, and sends saved work to real paid Toolbox access locally; production model-key proof open | High |
| 46 | Lending Team Lead | ✅ local fix | team/cohort CTAs now route to structured inquiry with one-business-day SLA, support inbox notification, `team_seats` support-case creation, and commercial lending context preserved in the case summary locally | Med |
| 47 | Skeptical Examiner-Whisperer | ✅ local fix | `/resources` surfaces templates plus the security/governance path, `/security` links Safe AI Use Guide with LLM data handling and IT review packet, and the Safe Guide streams from a committed PDF locally; production proof open | High |
| 48 | First-Time Founder | ✅ local fix | completed final-packet learners no longer remain stuck on `Credential Pending`; the certificate page auto-approves eligible packets, issues the certificate, and renders the credential locally; production PDF/email proof open | **Crit** |
| 49 | MDI CEO | ✅ verified | free assessment email/report path remains healthy; EmailGate sends the report with marketing opt-in default-off, offers a no-thanks summary lane, and auth/profile side effects remain non-blocking locally | Low |
| 50 | CDFI Ops Lead | ✅ verified | `/resources` surfaces the CDFI Grant AI Evidence Checklist with an inline template and Word-compatible download for grant, impact, and community-development evidence files locally | Low |
| 51 | Half-Hearted Buyer | ✅ local fix | Foundation purchase-link resend, paid not-started re-engagement, and stranded-buyer support-case detection are implemented locally for buyers who never log in; production email/cron proof open | High |
| 52 | Diligent In-Depth Buyer | ✅ verified | healthy In-Depth path remains intact: pricing/landing expose the $99 report, purchase success points to real paid access, `/access` routes entitled buyers to the assessment dashboard, and completion detection remains covered locally | Low |
| 53 | Won't-Give-Email Skeptic | ✅ local fix | EmailGate now has a visible “View summary without email” lane and marketing follow-up is explicit/default-off when sending the report locally | Med-High |
| 54 | Mid-Assessment Bailer | ✅ local fix | free assessment preserves the selected question set on restart/resume, offers a 30-day server-backed resume link mid-assessment, and stale-draft reminders are implemented locally; production email/cron proof open | High |
| 55 | Cohort Champion | ✅ local fix | ready-to-buy cohort champions now see the cohort launch packet, one-business-day assisted inquiry, and `cohort-pilot`/`team_seats` support-case path instead of QA-gate copy locally; production form/inbox proof open | **Crit** |
| 56 | Prompt-Card Collector | ✅ local fix | `/resources` and the footer expose `/prompt-cards`; Prompt Cards role values match the API allowlist, unlock waits for a successful static PDF stream, and failed PDF fetches keep the library locked locally; production PDF proof open | **Crit** |
| 57 | Module-3 Quitter | ✅ local fix | Module 3 scaffold and paid stalled-learner reminder are implemented locally; production cron/email proof open | High |
| 58 | Recommending COO | ✅ local fix | course evaluation now explains what the certificate proves, links `/certifications` and `/verify`, and completed final-packet learners auto-issue a credential locally; production PDF/email proof open | High |
| 59 | Returning Desktop Finisher | ✅ local fix | stale free-assessment drafts now trigger a 30-day resume reminder with a cross-device link, and resumed drafts restore the saved question set locally; production cron/email proof open | **Crit** |
| 60 | Cert-Completer | ✅ local fix | completed final-packet learners auto-issue a certificate, dashboard `Verified` links require a real certificate row, and certificate/report/AUP PDF helpers use Chromium/HTML print paths locally; production PDF/email proof open | **Crit** |
| 61 | Refund Regretter | ✅ local fix | same refund-support path as persona 11: policy, SLA, support-case intake, and manual Stripe handoff are explicit locally | Med |
| 62 | Quick-Bounce Director | ✅ local fix | hero now names community banks/credit unions and 3-minute value | Med |
| 63 | Security Guide Hunter | ✅ local fix | Safe AI Use Guide form now verifies the PDF response before success; static PDF endpoint covered locally; production proof open | **Crit** |
| 64 | Playground Tinkerer | ✅ local fix | `/playground` and `/practice` now call the governed public model endpoint with PII/injection scans, spend/rate caps, `playground-public` usage logging, and real paid Toolbox handoff locally; production model-key proof open | **Crit** |
| 65 | Board-Asked CRO | ✅ local fix | Foundation purchase-link resend, purchase-help quick recovery, paid not-started reminders, and stranded-buyer support cases are implemented locally for gateway-filtered $295 buyers; production email/cron proof open | **Crit** |
| 66 | Won't-Pay Browser | ✅ local fix | `/pricing` now gives a clear free/$99/$295/team buyer map with payment, proof, decision rules, and support/refund paths; header/footer discovery covered locally | Med |
| 67 | Detail Auditor | ✅ | discovery only | Low |
| 68 | Eager New Lender | ✅ | $295 upsell may exceed small-CU budget | Low |
| 69 | Sleeper Buyer | ✅ local fix | paid Foundation buyers who never start now qualify for deduped not-started reminders with magic-link recovery and send logging locally; production cron/email proof open | High |
| 70 | Mobile First-Timer | ✅ local fix | home and assessment entry now name frontline tellers, branch teams, lending, operations, compliance, and marketing before the free-assessment CTA; production mobile visual proof open | Med |
| 71 | Email-Only Reader | ✅ | corp gateway (latent, served inline) | Low |
| 72 | Stubborn Non-Emailer | ✅ local fix | free assessment now has a visible summary-without-email lane, marketing follow-up is explicit/default-off, and score-phase restart/review controls use a real `#restart` target locally; production visual proof open | Med |
| 73 | Team Pilot Buyer | ✅ local fix | team pilot buyers now get a structured cohort-pilot/L&D rollout inquiry, one-business-day SLA, support-case creation, launch packet, and no mailto/QA-gate wall locally; self-serve team checkout remains flag-dark | High |
| 74 | Certificate Auditor | ✅ local fix | `/verify` now provides a public certificate-ID lookup, footer discovery, normalization for printed IDs, and a correction path for unknown IDs locally; live certificate-row proof open | High |
| 75 | Idle $99 Owner | ✅ local fix | idle `$99` In-Depth buyers now qualify for deduped waiting reminders with a magic link to `/assessment/in-depth/take` and send logging locally; production cron/email proof open | High |
| 76 | Strategist CEO | ✅ local fix | certificate value/details, `/verify`, visible `$99` In-Depth pricing, and structured team/institution inquiry now give the CEO both expansion paths locally; production proof open | High |
| 77 | Anxious Exam-Prep CCO | ✅ local fix | /playbooks PDF gate and "Coming soon" trap removed locally; production proof open | Med |
| 78 | Self-Directed Completer | ✅ local fix | self-directed completers now auto-issue the certificate after final-packet completion, and toolkit AUP/report PDFs use the Chromium/HTML print path with retry/support UI on failures locally; production PDF/email proof open | **Crit** |
| 79 | Comparison Shopper | ✅ local fix | `/pricing` now compares Free, `$99` In-Depth, `$295` Foundation, and assisted institution rollout in one surface with nav/footer/sitemap discovery locally; production proof open | High |
| 80 | Accidental Mobile Tap | ✅ local fix | value copy now precedes demo on mobile; sticky CTA is immediate | Med |
| 81 | Whole-Team Buyer | ✅ local fix | whole-team buyers now get a clean assisted purchase motion with structured inquiry, one-business-day SLA, inbox notification, `team_seats` support-case creation, and launch-packet context locally; self-serve team checkout remains flag-dark | **Crit** |
| 82 | Module-3 Abandoner | ✅ local fix | Module 3 wall reduced and module-specific paid re-engagement can pull the learner back locally; production cron/email proof open | High |
| 83 | Curious Regulator | ✅ satisfied | coherent /about + /resources | Low |
| 84 | ROI-Calc Obsessive | ✅ local fix | ROI calculator inputs now travel into `/assessment/take` via compact `roi_*` params and surface in the score gate/result handoff locally | Med-High |
| 85 | In-Depth Finisher | ✅ | reload-on-results bounce (A5) | Low-Med |
| 86 | Returning Cert-Chaser | ✅ local fix | login now leads with passwordless sign-in, purchase-link recovery exists, cross-device device-confirmation mints a fresh auth link instead of dead-ending, and certificate/dashboard truth is locally covered; production email proof open | **Crit** |
| 87 | Reluctant Refunder | ✅ local fix | Foundation refund self-check now states 7-day, fewer-than-two-modules, and no-certificate criteria before the support form; admin can log approval, denial, and manual issue events locally | Med-High |
| 88 | Template Snatcher | ✅ | discovery only | Low |
| 89 | Skeptical IT Auditor | ✅ local fix | `/security/data-handling` now discloses retention, subprocessors/residency, DPA/SOC 2 posture, and PII warning override audit boundaries; scanner/Toolbox override metadata covered locally | Med |
| 90 | Won't-Email Director | ✅ local fix | free assessment now offers summary without email, marketing follow-up is explicit/default-off, and `/security/data-handling` explains retention/provider/PII override posture locally | Med |
| 91 | Eager Cohort Lead | ✅ local fix | cohort leads now see one structured L&D/cohort-pilot path with launch packet, one-business-day SLA, form option, and high-priority support-case creation locally instead of competing mailto dead ends | High |
| 92 | Mobile Mid-Quit | ✅ local fix | mobile/interrupted assessment users can email a 30-day server-backed resume link, restore by token with the same question set, and receive stale-draft reminders locally; production cron/email proof open | High |
| 93 | Idle Course Owner | ✅ local fix | paid Foundation owners who never start or stall now qualify for deduped magic-link reminders, including module-specific stalled links and send logging locally; production cron/email proof open | High |
| 94 | Diligent Self-Learner | ✅ local fix | final-packet submission and the certificate page now auto-approve/issue eligible completed learners instead of leaving them in refresh limbo locally; production PDF/email proof open | **Crit** |
| 95 | Quick-Glance CEO | ✅ local fix | hero leads with 3-minute readiness promise and visible ICP | Med |
| 96 | Practice-Sandbox Tester | ✅ local fix | `/practice` is honestly labeled as a public demo, calls the governed public model endpoint, removes the false enrolled-only/fake `.md` export path, and routes saved work to real paid Toolbox access locally; production model-key proof open | **Crit** |
| 97 | Cert-Verifying Examiner | ✅ local fix | `/verify` now has a public certificate-ID lookup in mockup chrome, footer/certification discovery, printed-ID normalization, and an unknown-ID correction path locally; live certificate-row proof open | High |
| 98 | $99 Buyer Who Vanishes | ✅ local fix | `$99` In-Depth buyers now have generic purchase-link resend to `/assessment/in-depth/take`, stranded-buyer detection, and idle waiting reminders locally; production email/cron/support-case proof open | **Crit** |
| 99 | Resource-Only Grazer | ✅ | discovery only | Low |
| 100 | Full-Funnel Champion | ✅ local fix | full-funnel completers now auto-issue the credential and see a post-certificate referral panel with assessment share link, peer email, and verification URL locally; production PDF/email proof open | **Crit** |

## Outcome tally

- ✅ Local persona pass: **100 / 100**
- ⚠️ Open damaged rows: **0**
- ❌ Open failed / bounced / stranded rows: **0**
- ✅ P0 gaps remediated locally: **6 / 6**
- ✅ Originally critical personas remediated locally: **23 / 23**

Original audit baseline: **24 clean**, **18 damaged**, **58 failed / bounced / stranded**, including **23 Critical** failures concentrated in (a) certificate completers, (b) stranded paid buyers, (c) team buyers with no checkout, (d) fake-demo evaluators, (e) broken email-gated downloads, and (f) cross-device returners.

Remaining proof is production-level, not persona-row-level: live Vercel env/redeploy checks, Stripe/manual-refund workflow checks, cron/email delivery checks, PDF generation checks, public model-key checks, and seeded/live data validation.

## Cross-cohort NEW issues (beyond the Atlas, surfaced by the persona lens)

1. **Re-engagement / abandonment recovery is implemented locally** — assessment drafts, assessment-abandoned reminders, paid not-started reminders, paid stalled-module reminders, and In-Depth waiting reminders now exist; production migration/cron/email proof remains open. (cohorts 2,3,6,8)
2. **"Idle" and "stranded" are now distinguishable locally** — paid-but-never-authenticated buyers can create stranded-buyer support cases; production cron/support-case proof remains open. (cohorts 5,6)
3. **Dashboard certificate truth is implemented locally** — "Verified" now requires a real certificate row and links to `/verify/<id>`. (cohort 7)
4. **Post-certificate referral is implemented locally** — the champion (100) who finishes the funnel now gets a referral panel with assessment share link, peer email, and credential verification context. Production proof remains open. (cohort 7)
5. **ROI calculator → assessment handoff is implemented locally** — `roi_*` context carries into the assessment and result surfaces. (cohort 1)
6. **Email gate privacy lane is implemented locally** — opt-in is explicit/default-off, a no-thanks summary lane exists, and dead `TierPreview` is removed. (cohort 1)
7. **Safe AI Use Guide and counsel review discovery are fixed locally** — the form waits for a successful committed-PDF fetch before showing success, `/security` links to LLM data handling and the IT review packet, and `/resources` surfaces the security/governance path. (cohort 4)
8. **Pricing comparison is implemented locally** — `/pricing` compares Free, $99, $295, and team paths and is linked from nav/footer/sitemap. (cohort 4)
9. **Certification value and verifier entry are implemented locally** — `/courses` explains the credential, `/certifications` is linked, `/verify` has an ID lookup, and the lookup form routes normalized printed IDs to `/verify/<id>`. (cohorts 4,7)
10. **Module 3 difficulty cliff is reduced locally** — the Build step uses a strategy drill, Prompt Wizard, worked starter prompts, and a 30-character floor. (cohort 6)
11. **Team, PMO, L&D cohort, and partner assisted funnel is implemented locally** — team, PMO project-plan, L&D cohort-pilot, and partner/association CTAs route to a structured inquiry form, scheduler link when configured, inbox notification, SLA copy, visible cohort/project packets, and support-case creation; self-serve Stripe remains intentionally flag-dark. (cohort 8)
12. **Public demo truthfulness is implemented locally** — `/playground` and `/practice` call the governed public model endpoint instead of fabricated output. (cohorts 4,8)
13. **Passwordless buyer recovery is implemented locally** — login leads with email sign-in, purchase-link resend exists, and device confirmation has a cross-device fallback. (cohort 2)
14. **Mobile click tax + first-paint problems** — Resources behind "More" panel (+1 click), sticky CTA hidden until 600px scroll, animated demo above value copy, abstract problem-first hero with no ICP mirror. Resources/mobile nav and home first-paint items are implemented locally; production visual proof remains open. (cohort 2)
15. **Data-handling completeness is implemented locally** — `/security/data-handling` now covers retention, subprocessors/residency, DPA/SOC 2 posture, and PII override audit boundaries; production link proof remains open. (cohort 4)
16. **Two parallel module-content systems** (live `micro-modules.ts` enumerating 18 + dead `module-N.ts` files) — maintenance trap; the "18 modules" count itself is CORRECT. (cohorts 1,6,7)
17. **Silent failures** — `DownloadReportButton` swallows 500s with no toast; `save-progress` fails silently; `/submit` promises an email no route sends. (cohorts 6,7)

Implementation note, 2026-06-23: item 5 is implemented locally. The ROI
calculator now passes compact `roi_*` context into `/assessment/take`, and v3
gate/result surfaces render the modeled capacity beside the readiness result.

Implementation note, 2026-06-23: item 8 is implemented locally. `/pricing`
now compares Free, $99 In-Depth, $295 Foundation, and assisted institution
rollout options; mockup/system navigation, the footer, sitemap, and homepage
price strip link to it.

Implementation note, 2026-06-23: the Function C post-purchase polish is
implemented locally. `/assessment/in-depth/access` no longer exposes unfinished
cohort scaffolding to entitled individual buyers, and
`/assessment/in-depth/purchased` now points paid Toolbox access at the real
signed-in/login path with public resources as a secondary option.

Implementation note, 2026-06-23: item 9 is implemented locally for the buying
path. `/courses` now explains the AiBI-Foundation certificate, public
authenticity URL, evidence packet, and claim boundary; `/pricing` includes a
credential/proof row; `/certifications` is no longer orphaned from the course,
footer, or sitemap.

Implementation note, 2026-06-23: item 10 is implemented locally. Module 3 now
uses the intended strategy drill plus Prompt Wizard in the Build step, provides
worked starter prompts for both scenarios, and lowers the final prompt floor
from 60 to 30 characters. Paid re-engagement also sends module-specific
Foundation stalled reminders locally; production cron/email proof remains open.

Implementation note, 2026-06-23: the Function D program-home soft leak is
implemented locally. The `/courses/foundation/program` overview now redirects a
true null enrollment to the Foundation purchase page, while keeping the
fetch-failed warning and preview/dev bypass behavior intact.

Implementation note, 2026-06-23: item 17 is partially implemented locally for
Foundation course progress saves. Activity-backed and activity-less module
completion now shows API/network save failures in the module handoff panel
instead of silently leaving the learner to re-click. `DownloadReportButton`
error surfacing remains separate.

Implementation note, 2026-06-23: the Function D completion CTA brittleness is
implemented locally. The Executive Briefing offer now keys off completion of
the Understanding pillar from the current module map, not a hardcoded module
number.

Implementation note, 2026-06-23: the refund/support issue for personas 11, 61,
and 87 is implemented locally. `/support/purchase-help` now uses the modern
mockup chrome and shows the 7-day refund window, buyer self-check criteria,
1-business-day refund review expectation, and manual Stripe handoff boundary
before the support form. Focused tests cover the public refund-support page,
refund-request case creation, refund eligibility calculation, refund metrics,
and admin refund approval/denial/manual-issued timeline actions.

Implementation note, 2026-06-23: item 15 is implemented locally. The
`/security/data-handling` page now includes AiBI's own retention posture,
usage and PII audit log boundaries, subprocessor and residency caveats, DPA/SOC
2 posture, and PII warning override handling for personas 26, 33, and 89.

Implementation note, 2026-06-23: item 14 is partially implemented locally for
resource and security discovery. Resources is now a first-level mobile nav item
instead of sitting behind More, and `/resources` now links directly to Security
& governance, LLM data handling, and the IT review packet. The remaining
first-paint hero/sticky-CTA polish is tracked separately.

Implementation note, 2026-06-23: item 16 is implemented locally. The retired
course `module-1.ts` through `module-12.ts` files are deleted, the Foundation
barrel no longer exports `module1`-style legacy modules, and Module 3's
intentional strategy drill / Prompt Wizard override now lives in
`module-3-activities.ts`.

Implementation note, 2026-06-23: item 15 is partially implemented locally for
AI-route PII handling. The shared scanner now flags contextual names,
addresses, masked identifiers, and contextual customer/account/member/loan/card
IDs, and paid Toolbox override sends write non-content audit fields to
`ai_usage_log`. The Function J data-handling page now discloses the override
behavior and non-content audit boundary.
