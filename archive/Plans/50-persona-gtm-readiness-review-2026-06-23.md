# 50-persona GTM readiness review

Date: 2026-06-23.

Scope: updated local site and launch documents after the 20-persona remediation
pass and the larger 100-persona remediation pass. This review tests whether the
website, trust, support, accessibility, and operational surfaces are ready for a
controlled launch path. It does not claim production live-money readiness until
the launch checklist evidence is filled.

Finalization note: the later `docs/persona-audit-2026-06-23/` 100-persona audit
did find deeper post-click P0s outside the original 50-person GTM-readiness
scope: certificate issuance, paid-buyer access rescue, retention, team buying,
public demos, and PDF/resource downloads. Those persona rows now pass locally.
The remaining gates are production proof and operator execution, not an
unresolved local persona-row backlog.

Source artifacts:

- `Plans/20-persona-remediation-comparison-2026-06-23.md`
- `Plans/20-persona-prioritized-remediation-plans-2026-06-23.md`
- `docs/reviews/gtm-persona-resolution-log-2026-06-23.md`
- `docs/reviews/persona-e2e-review-2026-06-22.md`
- `docs/reviews/red-team-review-2026-06-22.md`
- `docs/reviews/gtm-20-persona-review-2026-06-23.md`
- `docs/handoffs/persona-sweep-2026-06-23/summary.md`
- `Plans/90-day-gtm-launch-plan-2026-06-22.md`
- `docs/launch-checklist.md`

Validation evidence used:

- 20-person remediation comparison completed in
  `Plans/20-persona-remediation-comparison-2026-06-23.md`.
- 100-persona status counts now show `100 ok / 0 warn / 0 fail` in
  `docs/persona-audit-2026-06-23/02-persona-outcomes.md` and 100 `ok` rows in
  `docs/persona-audit-2026-06-23/index.html`.
- `npx tsc --noEmit --pretty false`, `npm run lint`, `npm test` (566 tests),
  and `npm run build` passed after the 100-persona remediation pass.
- The focused 100-person remediation regression batch passed: 11 files,
  31 tests.
- Plan-named Chromium E2E suites passed locally: 81 passed, 6 skipped because
  seeded dashboard Supabase prerequisites were unavailable in this environment.
  Covered suites: `dashboard-personas`, `resource-delivery`, `resources`,
  `api-gates`, and `a11y`.
- Focused scans found no stale public-code hits for absolute model-data phrases
  or unsupported assurance language such as `regulator-approved`,
  `examiner-approved`, `security certified`, `SOC 2 compliant`, or
  `GLBA compliant`.

## Executive Read

The updated local site is materially stronger than the original 20-person
review state. The original website issues are now either resolved in code or
reclassified as live/operator gates. The later 100-persona audit then expanded
the attack surface and all 100 persona rows now pass locally.

No new website P0 emerged from the 50-person review scope. The 100-persona audit
did find post-click P0s that had to be fixed before paid promotion; those are
implemented locally, with production proof still required. The blocking risks
are now production proof and operator execution:

1. Live purchase/refund smoke tests are not complete.
2. Support console and admin login must be verified with the real operator.
3. MailerLite nurture must be pasted, seed-tested, domain-authenticated, and enabled.
4. Physical iPhone/Safari QA remains required.
5. Real people/proof content still requires owner approval.
6. A named acquisition channel is still required before revenue targets become forecasts, but it should follow site/support readiness.

The recommended launch posture is unchanged but sharper: controlled
founder-led individual funnel only, no broad paid traffic, no self-serve Team
Assessment, and no scaled acquisition until the launch checklist evidence is
complete.

## Severity Model

- P0: blocks paid promotion or live-money trust.
- P1: materially affects conversion, regulated-buyer trust, support, or launch learning.
- P2: useful improvement after initial controlled launch.
- Deferred: acquisition or owner-proof work intentionally staged after website readiness.

## 50 Persona Matrix

| # | Persona | Lens / path | Outcome after remediation | Remaining risk | Action |
|---:|---|---|---|---|---|
| 1 | Frontline banker | Mobile free assessment | Strong path. Ambiguous floating control is gone; a11y/mobile coverage includes `/assessment/take`. | Physical phone proof still pending. | Run physical iPhone/Safari QA. |
| 2 | Nervous first-time AI user | `/assessment/take` on phone | Low-pressure flow remains focused and does not force paid language mid-assessment. | None beyond real-device timing. | Preserve simplicity. |
| 3 | Teller seeking quick win | Home to free assessment | CTA remains clear; post-result paid motion is after value. | Traffic quality unknown. | No additional site fix. |
| 4 | Branch manager | Home/ROI to Foundation or institution path | Purchase page now has recovery links; institution path remains assisted. | Production sweep not rerun. | Live-sweep purchase page after deploy. |
| 5 | Department supervisor | Foundation purchase from course page | Can continue to overview, free assessment, support, or institution inquiry. | Undecided-user click behavior unknown. | Track secondary-link clicks. |
| 6 | Retail banking lead | Course value and staff artifacts | $295 copy now leads with artifacts and Foundation Packet. | Needs proof from first users. | Use proof runbook for artifacts/quotes. |
| 7 | Operations manager | Workflow templates and SOP value | Course/artifact language is concrete; gallery provides synthetic examples. | Public gallery is synthetic, not customer proof. | Label synthetic clearly and collect first-user proof. |
| 8 | Budget-conscious individual | $99 then $295 | Refund reassurance and tangible deliverables are near decisions. | Live refund execution unproven. | Run live refund smokes. |
| 9 | Expense-reimbursement buyer | FAQ, Stripe receipt, price | FAQ and support path explain receipt/invoice help. | Stripe receipt content still needs live confirmation. | Include receipt screenshot in smoke log. |
| 10 | Mobile-only learner | Entire funnel on 375/390/414px | Expanded local mobile matrix passed; FAQ overflow fixed. | Physical Safari/browser chrome untested. | Physical iPhone/Safari gate. |
| 11 | CFO | ROI and pricing confidence | ROI formula, source link, and CFO caveat are adjacent. | Live/campaign pages could drift later. | Keep ROI disclosure on every ROI use. |
| 12 | CEO | Credibility and trust | `/about` restored; founder/operator and proof standards visible. | Founder bio/advisors/customer proof still owner-provided. | Add real proof only after approval. |
| 13 | Board member | Credential and governance credibility | No-endorsement posture clearer; public references are mapped, not used as approvals. | Needs real institutional proof before board-heavy campaign. | Use proof runbook before scaling. |
| 14 | Compliance officer | Security/resources/certifications | Examiner/regulator-adjacent copy softened; claim boundaries documented. | Live crawl after deploy still required. | Run claim crawl on production. |
| 15 | Risk officer | AI governance proof | Artifacts, review standards, and data boundaries are clearer. | Real support/proof evidence pending. | Collect first proof targets. |
| 16 | Internal auditor | Reviewable evidence | About/security/data pages now emphasize inspectable artifacts and human ownership. | Saved artifacts from real users not yet public. | Publish approved anonymized artifacts later. |
| 17 | Skeptical examiner-minded buyer | Reads for overclaims | Credential verification and ROI boundaries are much safer. | Future campaign/email copy can regress. | Keep banned-phrase scan in launch gate. |
| 18 | Credential skeptic | `/certifications`, `/verify` | Verification is authenticity only, not endorsement. | Needs live certificate URL check with real certificate. | Include in smoke/proof review. |
| 19 | CIO | Data flow and AI providers | `/security/data-handling` explains provider calls and stored records. | Provider terms can change. | Review provider terms quarterly. |
| 20 | InfoSec lead | Forwardable review packet | `/security/it-approval` now packages scope, data, support, and boundaries. | Needs real reviewer read-through. | Owner/IT reviewer review before use. |
| 21 | Procurement reviewer | Privacy/terms/security packet | Privacy/terms language now avoids absolute model-data claims and links to data handling. | Legal review not complete. | Owner accepts or gets counsel review. |
| 22 | Vendor management | Institution rollout and support | Assisted rollout language avoids self-serve team product risk. | Team Assessment hardening still future work. | Keep team self-serve flag off. |
| 23 | HR / L&D buyer | Seats, course, certificate | Institution path routes to scoped seats and support. | Bulk workflow not live-proven. | Treat as assisted sales only. |
| 24 | Training coordinator | Learner support and handoff | Support flow and purchase help exist; runbook clearer. | Live support inbox workflow unverified. | Run support operator live check. |
| 25 | Team Assessment sponsor | `/assessment/team` | Self-serve gate fails closed unless explicit flag is enabled. | Production env could be changed later. | Keep flag unset until two cohorts pass QA. |
| 26 | Product manager | End-to-end paid readiness | Evidence log exists; local tests cover key Stripe logic. | Live card, webhook, entitlement, refund still unproven. | Complete live smoke log. |
| 27 | Support operator | `/admin/support` queue | Console now includes queue routine, SLA, access rescue, refund authority. | Operator login and email delivery unverified. | Live-verify support flow. |
| 28 | Refund requester | Support and Stripe handoff | Refund eligibility and manual Stripe workflow are documented. | App does not send refund email automatically. | Human reply remains required. |
| 29 | Missing purchase email buyer | Purchase help and access rescue | Access rescue flow visible in console/runbook. | Real email deliverability unproven. | Test access rescue in production. |
| 30 | Duplicate-purchase buyer | Support/refund | Runbook covers duplicate purchase and refund flow. | Live Stripe manual refund process not tested. | Include duplicate/refund scenario in support drill. |
| 31 | Admin operator | `/admin`, `/admin/funnel`, `/admin/support` | Console surfaces are better documented. | Prior user friction around login/reset means this is still a live gate. | Verify allowlist, Supabase session, trusted device, and reset/confirmation email. |
| 32 | RevOps operator | Funnel metric trust | Dashboard copy now distinguishes known-contact metrics and raw popularity signals. | First Friday review not run. | Run scorecard with source notes. |
| 33 | Data-quality skeptic | Resource downloads | Metrics now avoid treating anonymous raw downloads as qualified leads. | Production data should be checked after deploy. | Verify admin counts with known fixtures. |
| 34 | Marketing ops | Nurture and segmentation | Email content improved locally. | MailerLite flows not active. | Paste, seed-test, authenticate, enable. |
| 35 | Product marketer | Offer ladder | $99/$295 value is more concrete and less credential-first. | Stripe product descriptions need copy parity check. | Include Stripe copy in pre-launch audit. |
| 36 | Copywriter | Claim safety across pages | Safer public/nurture copy exists. | Future campaign copy could overclaim. | Use claim-boundary checklist. |
| 37 | Brand designer | Proof/people layer | Proof standards and runbook prevent fake authority. | Real people/proof still absent until approved. | Collect approved proof from first 10-20 users. |
| 38 | Visual QA reviewer | Mobile layout and CTA bands | Local mobile overflow matrix passed; shared CTA band is more robust. | Visual polish on physical device still unverified. | Physical device screenshot pass. |
| 39 | Accessibility reviewer | Axe smoke | 81-test focused route set passed no serious/critical axe violations. | Axe is not a full manual audit. | Manual keyboard/SR spot checks before scale. |
| 40 | Legal/privacy reviewer | Privacy, terms, AI use | Model-data wording is more precise; do-not-enter rules visible. | Not legal advice and no counsel signoff. | Owner accepts or routes to counsel. |
| 41 | Community bank COO | Practical workflow value | Course promise emphasizes reviewed workflows and saved artifacts. | Needs first-user proof. | Capture before/after workflow artifact. |
| 42 | Credit union executive | Member-data concern | Data pages say customer/member data is not needed and should not be entered. | Needs trust from real deployment evidence. | Use IT packet and proof runbook. |
| 43 | Compliance training buyer | Staff training evidence | Certificate boundary and artifacts clearer. | Examiners decide acceptance. | Keep language factual; no acceptance claims. |
| 44 | Existing buyer needing help | Support intake | `/support/purchase-help` covered by a11y/mobile tests and creates cases per design. | Live mail/case creation needs production test. | Submit test case after deploy. |
| 45 | Cold visitor from partner link | Landing path | General site is stronger but no channel landing page yet. | Channel-specific page missing by design. | Build once channel is named. |
| 46 | Performance marketer | Measurement and channel | Strategy remains staged; scorecard exists. | No named source. | Later choose one channel. |
| 47 | ABM seller | Outbound safety | Plan says keep cold outbound outside nurture with suppression. | Actual list/copy not built. | Later create controlled pilot. |
| 48 | Association partner | One-pager/webinar need | Not yet built. | Deferred acquisition material. | Build after launch readiness. |
| 49 | Founder/operator | Daily operating burden | Support, smoke, proof, and scorecard routines are clearer. | Workload remains high for one person. | Do not scale traffic until routines are proven. |
| 50 | Red-team reviewer | Attack full launch chain | Website issues reduced; live proof gaps are explicit. | Launch still not paid-promotion ready. | Complete launch checklist evidence before promotion. |

## New Findings From The 50-Person Review

### Finding 1 - Admin/support login remains a live gate

Severity: P0 for launch operations.

The support console exists and now includes the operating routine, but prior
operator friction around admin access, confirmation/reset email, and 404s means
the production admin path must be verified explicitly. A green build does not
prove the operator can log in.

Required launch evidence:

- Allowlisted operator reaches `/admin/support`.
- Trusted-device confirmation succeeds.
- Password reset or magic-link flow is received if used.
- `/admin/support/search` works for a known test buyer.
- Access rescue sends email and writes a timeline event.

### Finding 2 - Proof is safer but still thin

Severity: P1.

The site now avoids fake authority and includes a proof collection runbook, but
the public proof layer is still founder-led and artifact-led until real users
approve quotes, artifacts, and outcomes. This is acceptable for a controlled
launch, not for broad paid media or high-stakes institutional selling.

Required launch evidence:

- At least three first-user proof items collected before scaling.
- No advisor/testimonial/logos published without approval record.
- Public examples stay labeled synthetic or anonymized.

### Finding 3 - Physical device QA is now the main UI gap

Severity: P1.

The expanded Playwright matrix substantially reduces mobile/a11y risk, and it
found a real FAQ CTA overflow that was fixed. The remaining UI gap is a
physical iPhone/Safari pass because sticky browser chrome, real tap targets,
and email/app handoffs can differ from Chromium.

Required launch evidence:

- Screenshots or notes for `/`, `/assessment/take`, `/assessment/in-depth`,
  `/courses/foundation/program/purchase`, `/support/purchase-help`,
  `/security/data-handling`, and `/security/it-approval`.

### Finding 4 - Live transaction proof is still the highest-risk launch gate

Severity: P0.

The product manager persona remains correctly marked live-smoke pending.
Without real Checkout Session ids, webhook event ids, email delivery, and
entitlement evidence, paid launch trust is not proven.

Required launch evidence:

- Free assessment result and email.
- In-Depth purchase, magic link, paid assessment access, completion, and email.
- Foundation purchase, course access, artifact save, and webhook 2xx.
- Full refund revokes access.
- Partial refund retains access.
- Manual refund email is sent by support owner.

### Finding 5 - Acquisition should remain staged

Severity: Deferred strategic P0.

The 50-person review confirms the owner direction: acquisition is still the
business binding constraint, but it should not drive the current website fix
pass. The revenue plan must still say the named channel is required before
targets become forecasts.

Three later strategy options:

1. Banking association education placement: one free assessment CTA and a
   follow-up webinar.
2. Controlled founder-led ABM pilot: small hand-vetted list, suppression rules,
   and briefing CTA.
3. Partner/resource path: one role-specific downloadable artifact with source
   tracking and nurture entry.

## Current Launch Recommendation

Recommended state: controlled founder-led launch after launch checklist evidence
is complete.

Do not:

- Start broad paid traffic.
- Sell Team Assessment as self-serve.
- Publish unapproved advisors, quotes, logos, or institutional outcomes.
- Treat the 90-day revenue model as a forecast.

Do:

- Deploy current changes.
- Run live smoke tests.
- Verify support/admin login.
- Enable nurture.
- Run physical device QA.
- Run first Friday scorecard.
- Collect first proof points.

## Launch Checklist Updates Applied

`docs/launch-checklist.md` now references this review and makes the newest
explicit gates visible:

- 50-person review completed locally.
- 100-persona local remediation completed: 100 persona rows pass locally.
- Admin/support login verification is a P0 launch-ops gate.
- First three proof items are required before scaling beyond controlled launch.
- Physical iPhone/Safari route list remains required.
- Production proof is required for live purchase/refund, emails, crons,
  personalized PDFs, gated downloads, team lead capture, buyer recovery, public
  demo model calls, support case creation, and certificate verification.
- Named acquisition channel is staged until after site/support readiness.
