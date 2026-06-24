# 20-persona remediation comparison

Date: 2026-06-23.

Purpose: compare the original 20-person GTM readiness review against the
current remediation state, after the persona-by-persona website/support/trust
fixes. This is the required bridge before the next 50-person review.

Source artifacts:

- `docs/reviews/persona-e2e-review-2026-06-22.md`
- `docs/reviews/red-team-review-2026-06-22.md`
- `docs/reviews/gtm-20-persona-review-2026-06-23.md`
- `docs/reviews/gtm-persona-resolution-log-2026-06-23.md`
- `docs/handoffs/persona-sweep-2026-06-23/summary.md`
- `Plans/90-day-gtm-launch-plan-2026-06-22.md`
- `docs/launch-checklist.md`

## Executive Comparison

The original 20-person review had two kinds of issues:

1. Website/product/support issues that could be remediated in the repo.
2. Live/operator issues that require production access, Stripe, MailerLite,
   support inbox, real-device testing, or owner-approved proof.

The website/product/support issues are now addressed locally. The remaining
launch blockers are not unplanned website gaps; they are production verification
and owner-operated proof:

- Deploy and live-verify the locally implemented pages and links.
- Run live purchase/refund smoke tests.
- Verify the support operator account and inbox workflow.
- Paste, seed-test, and enable MailerLite nurture.
- Rotate the exposed Stripe live secret.
- Run physical iPhone/Safari QA.
- Add real named people/proof only after approval.
- Name a first acquisition channel after site/support readiness.

## Original P0 Findings

| Original finding | Original risk | Current remediation state | Remaining gate |
|---|---|---|---|
| No named top-of-funnel channel | Revenue model is hypothetical without traffic source. | Intentionally staged by owner direction. `Plans/20-persona-prioritized-remediation-plans-2026-06-23.md` keeps performance marketer and ABM as strategic staged plans after website readiness. | Later choose one named channel; do not treat revenue model as forecast until then. |
| Live-money path needs human smoke tests | Charged buyer could fail access/provisioning/refund. | `docs/live-smoke-test-evidence-log.md` added and launch checklist §6 points to it. Stripe test-mode wording corrected. | Owner runs live card purchases/refunds and records evidence. |
| MailerLite nurture is not live | Free captures may not convert without follow-up. | Persona 12 copy tightened in HTML/source files. | Operator paste/seed/domain-auth/enable in MailerLite dashboard. |

## Original P1 Findings

| Original finding | Original risk | Current remediation state | Remaining gate |
|---|---|---|---|
| Proof gap for credentialing organization | Senior buyers may see product as plausible but unproven. | `/about` restored; homepage trust anchor names founder; `/about` now has proof standards; `/courses/foundation/gallery` is linked and in sitemap; `docs/proof-collection-runbook.md` defines approval workflow. | Owner supplies approved founder bio/advisors/quotes/artifacts; publish only after approval. |
| ROI methodology must stay adjacent | CFO/CEO distrust large ROI claims. | ROI calculator has formula, source link, and CFO caveat; $99/$295 refund reassurance remains adjacent to paid CTAs. | Live visual QA after deploy; preserve caveat on campaign pages. |
| Data handling visible pre-purchase | IT/security can veto adoption. | `/security/data-handling` added and linked from security, courses, Foundation purchase, footer, and sitemap. `/security/it-approval` added as forwardable packet; privacy/terms language softened. | Deploy and live-verify links; have owner/IT reviewer read packet once. |
| Foundation purchase page terminal | Undecided users dead-end on purchase route. | Purchase page now links to course overview, free assessment, purchase help, and institution inquiry near hero and final CTA. | Deploy and rerun production link sweep. |
| Campaign material not channel-specific | Poor learning from first traffic source. | Staged until website readiness. Source taxonomy and Friday scorecard documented in `docs/funnel-reporting.md`; acquisition plans now treated as later GTM step. | Build one channel brief when owner chooses a channel. |

## Persona-by-Persona Comparison

| # | Persona | Original friction | Remediation evidence | Current state |
|---:|---|---|---|---|
| 1 | Frontline banker | Mobile assessment strong, but unlabeled floating `N` control looked suspicious. | Current `/assessment/take` uses branded flow header, question count, progress, Save & exit; no floating `N` remains. | Resolved in current code. |
| 2 | Branch manager | Too many possible next steps; purchase page could become terminal. | Foundation purchase page adds course overview, free assessment, purchase help, and institution inquiry links. | Implemented locally; production verification pending. |
| 3 | Compliance/risk officer | Governance/security copy could drift into examiner/regulator endorsement. | Examiner/regulator-adjacent phrasing softened across resource, certification, course examples, and MailerLite copy; claim scan recorded. | Resolved in current code; live crawl pending. |
| 4 | CFO | ROI needed adjacent assumptions; refund reassurance needed near paid CTAs. | ROI formula/source/CFO caveat added; $99/$295 refund lines stay near CTAs. | Resolved in current code; live visual QA pending. |
| 5 | CEO | `/about` redirected home; no who-we-are credibility path. | `/about` restored with founder/operator, standards, evidence rules, trust boundaries; homepage trust anchor links to it. | Implemented locally; production verification and owner-approved bio/proof pending. |
| 6 | CIO / InfoSec | Data/PII/LLM handling unclear before purchase. | `/security/data-handling` added and linked from security/course/purchase/footer/sitemap. | Implemented locally; production verification pending. |
| 7 | Skeptical examiner-minded buyer | "Verify", examiner, ROI, and credential language needed boundaries. | Credential verification clarified as authenticity only; no-endorsement language kept near claims; purchase reviewer copy neutralized. | Implemented locally; live copy check pending. |
| 8 | Budget-conscious learner | Need tangible deliverables and refund reassurance near $99/$295 decisions. | $99 framed as report/peer band/action register; $295 framed as artifacts/Foundation Packet; refund text adjacent. | Resolved in current code. |
| 9 | Mobile-only learner | Long paid pages need CTA reachability and real-device proof. | Local iPhone viewport audit passed earlier; Persona 18 expanded mobile matrix to 375/390/414px critical routes. | Locally verified; physical iPhone/Safari pending. |
| 10 | Institution / L&D buyer | Team Assessment self-serve could rearm before fulfillment is proven. | `/assessment/team` defaults to assisted rollout; checkout API fails closed unless explicit flag is true; tests pass. | Resolved in current code; keep production flag off. |
| 11 | Performance marketer | No named channel or measurable launch campaign. | Deferred by owner direction; three-strategy/channel work staged after website readiness. | Strategic staged item, not a current website blocker. |
| 12 | Product marketer | $99 could read as "longer quiz"; nurture not activated. | Homepage/email copy now sells report/action-register and Foundation Packet/artifact value. | Implemented locally; MailerLite activation pending. |
| 13 | Sales / ABM lead | Outbound needs source rules, suppression, approved copy, briefing path. | Deferred by owner direction; controlled ABM plan staged. | Strategic staged item, not a current website blocker. |
| 14 | GTM / RevOps operator | Metrics needed trusted definitions and review cadence. | `/admin/funnel` copy clarifies exclusions; `docs/funnel-reporting.md` defines exclusions and 20-row Friday scorecard. | Implemented locally; first Friday review pending. |
| 15 | Product manager | Live paid fulfillment evidence missing. | `docs/live-smoke-test-evidence-log.md` added; test-mode/live proof wording corrected. | Evidence template implemented; live smoke pending. |
| 16 | IT/security reviewer | Need forwardable approval packet and no unsupported assurance language. | `/security/it-approval` added; privacy/terms softened; packet linked from security/data/institution/footer/sitemap. | Implemented locally; live verification pending. |
| 17 | UX researcher | Foundation purchase was a link-navigation dead end. | Same purchase-page secondary links as Persona 2; mobile/a11y run covers route. | Implemented locally; production sweep pending. |
| 18 | UI/accessibility reviewer | Need real CTA/a11y/mobile pass beyond route availability. | Expanded Playwright a11y/mobile tests; fixed FAQ CTA-band overflow; 81/81 focused checks passed locally. | Implemented locally; physical-device check pending. |
| 19 | Brand designer | Proof/people layer underdeveloped, but should not fake authority. | `/about` proof standards added; artifact gallery in sitemap; proof collection runbook added. | Implemented locally; owner-approved proof pending. |
| 20 | Support / launch ops owner | Console existed, but routine/SLA/refund authority needed ownership. | `/admin/support` now displays owner routine, SLA, access rescue, and refund authority flow; paid-buyer runbook updated. | Implemented locally; live operator verification pending. |

## Resolved Website Issues

The following website or repo-resolvable issues from the original review are
closed locally:

- Assessment-flow ambiguous control removed.
- Purchase-page continuity links added.
- Examiner/regulator-adjacent claim drift reduced.
- ROI methodology and caveat placed adjacent.
- `/about` credibility path restored.
- Public data-handling page added.
- IT approval packet added.
- Credential verification boundaries clarified.
- $99/$295 deliverables and refund reassurance strengthened.
- Team Assessment self-serve gate fails closed.
- Paid-offer copy and nurture source copy repositioned.
- Funnel dashboard definitions and Friday scorecard documented.
- Live smoke evidence log added.
- A11y/mobile test coverage expanded and FAQ overflow fixed.
- Proof collection workflow added.
- Support owner flow added to admin UI and runbook.

## Remaining Launch Gates

These are explicitly not hidden website defects; they are production/operator
checks before paid promotion:

1. Rotate exposed `STRIPE_SECRET_KEY`.
2. Deploy all local changes and live-verify changed public/admin routes.
3. Run live free, In-Depth, Foundation, full-refund, and partial-refund smokes.
4. Fill in `docs/live-smoke-test-evidence-log.md` with real evidence.
5. Paste, seed-test, domain-authenticate, and enable MailerLite flows.
6. Verify support operator login, purchase-help case creation, access rescue,
   refund decision logging, and manual Stripe handoff.
7. Run physical iPhone/Safari QA.
8. Collect and approve real proof before publishing named advisors, quotes,
   logos, or outcomes.
9. Run the first Friday scorecard.
10. Later, choose one named channel and create the channel-specific landing path.

## Decision

Proceed to the 50-person review against the updated local product and launch
docs. The 50-person review should not re-open staged acquisition as the current
website priority, but it should continue to identify whether new buyer, support,
trust, accessibility, or operational issues remain before launch.

