# 20 persona prioritized remediation plans

Date: 2026-06-23.

Canonical location: `Plans/20-persona-prioritized-remediation-plans-2026-06-23.md`.

Purpose: convert the 20-persona feedback into an execution plan ranked by
impact and urgency. This version reflects the latest owner direction: fix the
website, trust, support, data, and live-readiness issues first. The acquisition
channel remains a strategic revenue constraint, but it is staged after the
site and operating system are ready enough to receive traffic.

Source artifacts:

- `docs/reviews/persona-e2e-review-2026-06-22.md`
- `docs/reviews/red-team-review-2026-06-22.md`
- `docs/reviews/gtm-20-persona-review-2026-06-23.md`
- `docs/reviews/gtm-persona-resolution-log-2026-06-23.md`
- `docs/handoffs/persona-sweep-2026-06-23/summary.md`
- `Plans/90-day-gtm-launch-plan-2026-06-22.md`
- `docs/launch-checklist.md`

## Priority model

Impact:

- 5: Blocks revenue, live-money readiness, trust, support, or paid promotion.
- 4: Materially affects conversion, institutional trust, or operator decision quality.
- 3: Reduces friction or support burden on a meaningful buyer path.
- 2: Useful optimization after first live traffic.
- 1: Polish only.

Urgency:

- 5: Must happen before broad traffic or paid promotion.
- 4: Should happen before the first named channel is activated.
- 3: Should happen during the first 30 days.
- 2: Can wait until first conversion data review.
- 1: Backlog.

Tiers:

- P0: impact 5 or urgency 5.
- P1: impact 4, or impact 3 with urgency 4.
- P2: everything else.

Status:

- Resolved in current code: no new implementation needed beyond regression checks.
- Implemented locally: code/docs are present locally but need deploy/live verification.
- Pending: work still needs implementation or operator completion.
- Staged: important, but intentionally scheduled after site readiness.

## Master priority order

This is the current execution order, not the theoretical business-importance
order. Acquisition would normally rank first, but traffic should not be pushed
until the site, support, and live-money path are trustworthy.

| Rank | Persona | Tier | Impact | Urgency | Status | Why now |
|---:|---|---|---:|---:|---|---|
| 1 | Product manager | P0 | 5 | 5 | Pending live smoke | Paid products are not revenue-safe until live purchase, provisioning, email, access, refund, and webhook paths are proven. |
| 2 | Support / launch ops owner | P0 | 5 | 5 | Implemented locally; live operator verification pending | Support console now shows SLA, queue routine, access rescue, refund authority, and Stripe handoff; production operator flow still needs verification. |
| 3 | IT/security reviewer | P0 | 4 | 5 | Implemented locally; live verification pending | IT approval friction can veto institution use; packet, links, and legal-language cleanup are in current code and need deploy/live review. |
| 4 | UI/accessibility reviewer | P1 | 3 | 4 | Implemented locally; physical-device pending | Expanded a11y/mobile coverage passed locally and fixed FAQ CTA-band overflow; physical iPhone/Safari check remains. |
| 5 | GTM / RevOps operator | P1 | 4 | 4 | Implemented locally | Dashboard definitions were tightened, but first Friday scorecard and live metric trust still need proof. |
| 6 | Product marketer | P0 | 4 | 5 | Implemented locally; nurture pending | Paid-offer copy is improved locally, but MailerLite activation is still needed before traffic. |
| 7 | CEO buyer | P1 | 4 | 4 | Implemented locally; proof pending | A factual `/about` path exists locally, but real people/proof still depend on approved owner content. |
| 8 | CIO / InfoSec buyer | P1 | 4 | 4 | Implemented locally | `/security/data-handling` and `/security/it-approval` exist locally and need deployment/live verification. |
| 9 | UX researcher | P1 | 3 | 4 | Implemented locally | Purchase page dead-ended in the 20-person sweep; secondary links are implemented locally and need live sweep proof. |
| 10 | Branch manager | P1 | 4 | 3 | Implemented locally | Manager path needs a clear non-checkout next step and institution route. |
| 11 | Institution / L&D buyer | P1 | 4 | 4 | Resolved in current code | Assisted-sales gate is in place; keep it from regressing and verify production flag behavior. |
| 12 | CFO buyer | P1 | 4 | 4 | Resolved in current code | ROI caveat and refund reassurance are in current code; production visual QA still matters. |
| 13 | Compliance/risk officer | P1 | 4 | 3 | Resolved in current code | Claim-safety language is fixed in current code; run live crawl before promotion. |
| 14 | Skeptical examiner-minded buyer | P1 | 4 | 3 | Implemented locally | Credential, ROI, and security boundaries need deploy/live crawl proof. |
| 15 | Budget-conscious learner | P1 | 3 | 4 | Resolved in current code | Maintain refund and deliverable proof around paid CTAs. |
| 16 | Mobile-only learner | P2 | 3 | 3 | Locally verified | Local iPhone viewport audit passed; physical iPhone/Safari check remains. |
| 17 | Brand designer | P2 | 3 | 3 | Implemented locally; owner proof pending | Proof standards, artifact-gallery linkage, and approval workflow are in place; real people/proof still requires approved material. |
| 18 | Frontline banker | P2 | 3 | 2 | Resolved in current code | Protect the strong low-friction free assessment path. |
| 19 | Performance marketer | Strategic P0, staged | 5 | 5 | Staged | A named channel is required for revenue credibility, but should follow website/support readiness. |
| 20 | Sales / ABM lead | Strategic P0, staged | 5 | 4 | Staged | Controlled outbound/partner motion matters, but should not start before support, live money, and attribution are ready. |

## Execution waves

### Wave 0 - fix before traffic

1. Run live smoke tests and record evidence.
2. Make support ownership operational.
3. Create or publish the IT/security approval packet.
4. Run real-device mobile and accessibility checks.
5. Verify `/admin`, `/admin/funnel`, and `/admin/support` with the operator account.
6. Activate MailerLite nurture after seed tests.
7. Deploy and live-sweep purchase-page secondary links, `/about`, and `/security/data-handling`.

### Wave 1 - first controlled audience

1. Pick one named channel.
2. Create one channel-specific landing path.
3. Use one UTM/source taxonomy.
4. Run the Friday scorecard.
5. Collect the first proof artifacts and support learnings.

### Wave 2 - first 30 days

1. Tune one conversion surface per week.
2. Improve paid-offer proof blocks using real support and conversion data.
3. Expand proof/people content only when it is approved and attributable.
4. Keep Team Assessment assisted until cohort QA is proven.

### Wave 3 - scale or stop

1. Decide whether to scale acquisition, harden Team Assessment, or improve the individual paid funnel.
2. Use refund-adjusted revenue, support load, and conversion quality to decide.
3. Do not scale channels that create support or trust failures faster than the operator can resolve them.

## Plan 1 - Frontline banker: protect the low-friction free assessment path

**Priority:** P2. Impact 3, urgency 2.

**Persona feedback:** this user is AI-curious, mobile-first, and low-confidence.
The assessment experience was one of the strongest surfaces. The only original
friction was an unlabeled floating `N` control that looked like a debug artifact.

**Current state:** resolved in current code. The free assessment now uses an
in-flow header with wordmark, question count, `Save & exit`, progress, and
labeled answer controls.

**Objective:** keep the free assessment simple, fast, and low-anxiety while
other GTM changes are made around it.

**Action plan:**

1. Keep `/assessment/take` focused on one question at a time.
2. Do not add institution, ROI, or credential copy inside the question flow.
3. Keep the paid recommendation after the user receives value.
4. Maintain accessible names for controls, progress, and save/exit actions.
5. Regression-test the route after any global layout or nav changes.

**Acceptance criteria:**

- No unlabeled floating controls appear in the assessment flow.
- The free assessment starts and completes on mobile without horizontal overflow.
- Paid CTAs do not interrupt the question flow.
- The completion path still lands on a useful result before selling.

**Metrics:** assessment start rate, completion rate, email capture rate,
post-result paid click-through, mobile abandonment, support questions from free
assessment users.

**Owner:** product/UX.

**Dependencies:** mobile QA plan, post-result CTA review, MailerLite nurture.

## Plan 2 - Branch manager: simplify the manager path

**Priority:** P1. Impact 4, urgency 3.

**Persona feedback:** a branch or department manager wants staff capability,
quick ROI, and a clear next step. The original review found too many competing
CTAs across services/institution surfaces and the 20-person sweep found the
Foundation purchase page could become a terminal surface.

**Current state:** implemented locally. The Foundation purchase page now has
non-checkout paths to course overview, free assessment, purchase help, and
institution inquiry.

**Objective:** make the manager journey assessment-first or briefing-first,
not a menu of equal options.

**Action plan:**

1. Keep one primary manager CTA on institution/service surfaces.
2. Route uncertain managers to the free assessment or institution inquiry.
3. Keep self-serve checkout for individual products only.
4. Add a manager-facing artifact preview showing what staff leave with.
5. Deploy and live-sweep the purchase page to confirm secondary paths work.
6. Watch whether managers click help/inquiry versus abandon.

**Acceptance criteria:**

- A manager can identify the next step within one page.
- The Foundation purchase page no longer dead-ends in link-only navigation.
- Institution interest routes to assisted inquiry, not unproven team self-serve.
- Purchase help is visible before the user gives up.

**Metrics:** `/for-institutions` CTA clicks, assessment starts from manager
paths, institution inquiries, purchase-page secondary-link clicks, checkout
starts, support questions about "which option is right".

**Owner:** product marketing/UX.

**Dependencies:** purchase-page deployment, support purchase-help route,
Team Assessment gate.

## Plan 3 - Compliance/risk officer: keep governance copy claim-safe

**Priority:** P1. Impact 4, urgency 3.

**Persona feedback:** compliance buyers like governance language, but they will
reject anything that sounds like regulator approval, examiner endorsement, or
guaranteed acceptability.

**Current state:** resolved in current code. Examiner/regulator-adjacent copy
was softened across governance resources, certification content, course examples,
and MailerLite copy. Remaining scanner hits are training hypotheticals or
explicit guardrails.

**Objective:** preserve trust by keeping all governance, security, credential,
and nurture copy within factual boundaries.

**Action plan:**

1. Maintain a banned-phrase scan before each deploy.
2. Keep "no regulator endorsement" language close to credential claims.
3. Frame governance output as internal evidence organization, not examiner approval.
4. Keep source/year next to statistics used in campaigns.
5. Add all new emails and landing pages to the copy-audit scan.
6. Run a production crawl after deploy.

**Acceptance criteria:**

- No copy implies regulator approval, examiner acceptance, or third-party certification.
- Credential verification means authenticity only.
- Statistics have a named source.
- Emails, Stripe product descriptions, public pages, and PDFs agree on product counts and scope.

**Metrics:** security/certification page exits, compliance objections in support
notes, regulator-approval questions, refund/support cases caused by misunderstood claims.

**Owner:** product marketing/compliance reviewer.

**Dependencies:** claim-safety scanner, certification copy, MailerLite activation.

## Plan 4 - CFO buyer: make ROI defensible

**Priority:** P1. Impact 4, urgency 4.

**Persona feedback:** a CFO will challenge large ROI numbers unless assumptions
are adjacent and the number is clearly not guaranteed savings.

**Current state:** resolved in current code. The ROI calculator includes formula,
source/assumptions link, and a CFO caveat explaining that the estimate is
recaptured labor capacity, not guaranteed savings or a projected
efficiency-ratio change. Refund reassurance is adjacent to $99 and $295 CTAs.

**Objective:** make ROI a credible conversation starter without overclaiming.

**Action plan:**

1. Preserve adjacent methodology wherever ROI appears.
2. Keep the efficiency-ratio workbook linked from calculator-adjacent surfaces.
3. Add example report/action-register proof where ROI is used as a hook.
4. Live-verify the caveat fits on mobile and desktop.
5. Do not use ROI in ads or partner copy without the assumptions link.
6. Track whether ROI users progress to paid CTAs or institution inquiry.

**Acceptance criteria:**

- Every ROI figure has a visible assumptions or methodology path.
- Copy states the number depends on whether hours are eliminated, redeployed, or converted into throughput.
- No page implies guaranteed savings.
- Refund terms stay visible near paid decisions.

**Metrics:** ROI interactions, paid CTA clicks from ROI path, checkout starts,
refund requests, finance-role inquiries, support questions about pricing or ROI.

**Owner:** product marketing/GTM.

**Dependencies:** live visual QA, launch scorecard, proof artifact collection.

## Plan 5 - CEO buyer: create a factual trust path

**Priority:** P1. Impact 4, urgency 4.

**Persona feedback:** CEOs and senior buyers vet the people and operating
standards behind a credentialing product. Redirecting `/about` to home created
a credibility gap.

**Current state:** implemented locally. `/about` is restored as a factual
operating-standards page, footer/sitemap links exist, and the homepage trust
anchor names the founder without inventing advisors, testimonials, logos, or
regulator endorsement.

**Objective:** answer "who is behind this and what are the boundaries" without
fabricating proof.

**Action plan:**

1. Deploy and live-verify `/about`.
2. Keep the founder/operator content factual unless approved bio content is provided.
3. Do not populate advisors, logos, or testimonials without permission and attribution.
4. Create a proof collection workflow for first 10 to 20 users.
5. Add real proof only when it can be backed by screenshots, anonymized artifacts, or approved quotes.
6. Keep endorsement boundaries near any proof.

**Acceptance criteria:**

- `/about` returns 200 in production.
- Buyer can see who operates the Institute and how claims are governed.
- No fabricated authority signals appear.
- Proof collection process is ready before scale.

**Metrics:** `/about` visits, trust-anchor clicks, senior-role inquiries,
conversion from `/about` paths, support/sales questions about credibility.

**Owner:** founder/brand owner.

**Dependencies:** owner-approved biography/proof, footer/sitemap deployment,
brand proof plan.

## Plan 6 - CIO / InfoSec buyer: make data handling inspectable

**Priority:** P1. Impact 4, urgency 4.

**Persona feedback:** IT/security wants a literal answer to where bank data,
customer PII, prompts, saved artifacts, and AI-provider calls go before
approving staff use.

**Current state:** implemented locally. `/security/data-handling` explains model
calls, PII/injection checks, stored records, provider stance, and human review,
with links from security, courses, Foundation purchase, footer, and sitemap.

**Objective:** let IT/security answer basic data questions before purchase or inquiry.

**Action plan:**

1. Deploy and live-verify `/security/data-handling`.
2. Link data-handling wherever Toolbox, sandbox, saved prompts, or AI tools are promoted.
3. Keep "do not enter customer PII/account data/confidential files" visible.
4. Clarify that PII checks are guardrails, not a substitute for institution policy.
5. Create an IT/security FAQ entry or route to the approval packet.
6. Re-check provider-term references on a scheduled cadence.

**Acceptance criteria:**

- A buyer can answer "where does our data go?" without emailing support.
- The site distinguishes account/profile data, assessment responses, saved artifacts, support cases, and AI prompts.
- No security certification or compliance status is claimed unless it exists.
- Data-handling links are reachable before checkout.

**Metrics:** security page visits, data-handling clicks, institution inquiry
conversion, IT objections, support cases about data/PII.

**Owner:** product/security content owner.

**Dependencies:** IT review packet, privacy/terms wording, live link sweep.

## Plan 7 - Skeptical examiner-minded buyer: package the trust boundaries

**Priority:** P1. Impact 4, urgency 3.

**Persona feedback:** this buyer reads for the one sentence that overclaims.
"Verify", "examiner", ROI, credential, and security claims all need visible
boundaries.

**Current state:** implemented locally. Purchase reviewer copy, certificate
verification copy, credential disclaimers, ROI caveat, and data-handling caveat
have been tightened. Deploy/live crawl still required.

**Objective:** make the limits of the product as clear as the benefits.

**Action plan:**

1. Keep credential verification copy explicit: authenticity only.
2. Keep no-endorsement disclaimers near credential and security claims.
3. Prefer "maps to public source vocabulary" over "what examiners expect".
4. Add trust-boundary FAQ links from security/certification paths.
5. Scan emails, PDFs, Stripe descriptions, and public pages together.
6. Re-run the production claim crawl after deploy.

**Acceptance criteria:**

- A skeptical buyer can tell what is training, what is credential verification, and what is not external approval.
- Claims are consistent across site, email, checkout, and certificates.
- No reviewer-facing sentence implies guaranteed acceptability.

**Metrics:** certification page exits, FAQ clicks, support objections about
approval, refund requests tied to misunderstood credential value.

**Owner:** product marketing/compliance reviewer.

**Dependencies:** certificate verification deployment, claim scan, MailerLite activation.

## Plan 8 - Budget-conscious learner: sell deliverables, not just access

**Priority:** P1. Impact 3, urgency 4.

**Persona feedback:** individual learners need to understand what $99 and $295
buy them, and they need refund reassurance near the decision point.

**Current state:** resolved in current code. The $99 path leads with written
report, peer band, eight scores, and a 90-day action register. The $295 path
leads with saved prompts, templates, Foundation Packet, artifacts, and adjacent
refund reassurance.

**Objective:** reduce price hesitation without discounting.

**Action plan:**

1. Keep the paid CTA area focused on deliverables.
2. Keep "7-day refund if unused" next to $99 and $295 purchase actions.
3. Show report/action-register and Foundation Packet examples.
4. Use nurture to answer price, time, refund, and "is this for me" objections.
5. Monitor support questions that indicate unclear value.
6. Do not position the $99 offer as simply more questions.

**Acceptance criteria:**

- Buyer can see what they receive before checkout.
- Refund terms are visible without visiting FAQ/Terms.
- Copy avoids discounting as the main conversion lever.
- Paid offer value is concrete on mobile and desktop.

**Metrics:** paid CTA click rate, checkout completion rate, refund requests,
price objections, email click-through by offer.

**Owner:** product marketing/UX.

**Dependencies:** MailerLite activation, live visual QA, proof artifact collection.

## Plan 9 - Mobile-only learner: verify the full mobile journey

**Priority:** P2. Impact 3, urgency 3.

**Persona feedback:** mobile layouts stack well, but long paid pages can bury
the purchase CTA, refund language, and support links.

**Current state:** locally verified. iPhone 14 viewport audit passed for key
routes with no horizontal overflow and sticky/fixed CTAs where expected. A
physical iPhone/Safari production check is still required.

**Objective:** make the phone-only path from free assessment to paid decision clear.

**Action plan:**

1. Test `/`, `/assessment`, `/assessment/take`, `/assessment/in-depth`, `/courses`, Foundation purchase, `/security`, `/security/data-handling`, and `/support/purchase-help` on a real iPhone.
2. Confirm primary CTAs are visible at natural decision points.
3. Confirm refund/support text appears before checkout.
4. Confirm sticky bars do not cover content or conflict with browser chrome.
5. Check page speed and layout shift on first load.
6. Record screenshots and defects.

**Acceptance criteria:**

- Free assessment completes under 3 minutes on a physical phone.
- Paid CTA, refund language, and support links are tappable and readable.
- No horizontal overflow, overlap, or hidden controls on key routes.
- Any accepted mobile gaps are documented.

**Metrics:** mobile start/completion rate, mobile paid CTA clicks, mobile
checkout starts, mobile support cases, scroll depth on purchase pages.

**Owner:** UI/QA.

**Dependencies:** production deploy, physical device access, live smoke log.

## Plan 10 - Institution / L&D buyer: keep institution rollout assisted

**Priority:** P1. Impact 4, urgency 4.

**Persona feedback:** institution buyers need cohort setup, reporting, privacy,
seat handling, and support confidence. Team Assessment should not become
accidentally self-serve before fulfillment is proven.

**Current state:** resolved in current code. Team Assessment self-serve remains
off by default, `/assessment/team` renders assisted rollout unless an explicit
flag is set, and checkout fails closed with 403 unless enabled.

**Objective:** route institutional demand into a controlled assisted-sales path.

**Action plan:**

1. Keep `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT` off in production.
2. Verify the production route renders assisted rollout.
3. Create a cohort readiness checklist before any team pilot.
4. Require two production-like cohorts before reconsidering self-serve.
5. Keep institution inquiry connected to support/admin follow-up.
6. Document what changes if self-serve is intentionally re-enabled later.

**Acceptance criteria:**

- A Stripe price env var cannot re-arm public team checkout by itself.
- Institution buyer sees a clear assisted inquiry path.
- Cohort privacy/reporting/support criteria are explicit.
- Team product is not promoted as self-serve in public copy.

**Metrics:** institution inquiries, qualified briefing requests, cohort setup
time, team support cases, cohort completion rate.

**Owner:** product/GTM.

**Dependencies:** production env review, support routine, cohort QA.

## Plan 11 - Performance marketer: secure a named channel after readiness

**Priority:** Strategic P0, staged. Impact 5, urgency 5.

**Persona feedback:** revenue math is hypothetical until a real top-of-funnel
channel exists. The review's "8,000 qualified sessions" assumption cannot be
treated as a forecast without a named source.

**Current state:** intentionally staged. The owner direction is to solve website
and support issues before channel planning. This remains the first GTM scaling
constraint after readiness.

**Objective:** secure one measurable, permission-safe channel once the funnel can receive traffic.

**Action plan:**

1. Pick one first channel: banking association email, partner newsletter, webinar, sponsor slot, owned opted-in list, warm community post, or controlled ABM pilot.
2. Document audience, send date, owner, source rules, expected reach, and opt-in constraints.
3. Build one channel-specific landing path.
4. Use one primary CTA, not a menu.
5. Add UTMs/source codes before launch.
6. Define stop/continue thresholds before traffic goes live.

**Acceptance criteria:**

- The channel is named, not generic.
- Traffic is measurable in the admin/funnel scorecard.
- The channel has one CTA and one follow-up path.
- Source rules are permission-safe.

**Metrics:** sessions by source, assessment starts/completions, captures, paid
clicks, checkout starts, purchases, support cases, refunds, positive replies.

**Owner:** GTM/marketing owner.

**Dependencies:** live smoke tests, support routine, MailerLite activation,
Friday scorecard.

## Plan 12 - Product marketer: activate the paid-offer message engine

**Priority:** P0. Impact 4, urgency 5.

**Persona feedback:** the $99 rung can read like paying for a longer quiz unless
the report, peer band, and 90-day plan lead. The $295 rung must feel like
artifact creation, not abstract education.

**Current state:** implemented locally. Homepage and nurture copy were updated
to sell report/action-register value and Foundation Packet/artifact value.
MailerLite activation remains dashboard-only.

**Objective:** make the offer ladder and nurture sequence concrete before traffic.

**Action plan:**

1. Deploy the updated homepage and page copy.
2. Paste updated MailerLite HTML/source copy into the dashboard.
3. Seed-test merge fields, links, sender/domain authentication, and unsubscribe.
4. Activate the four intended nurture flows.
5. Add objection blocks for price, time, data use, regulator approval, and refund.
6. Track nurture-to-paid movement in the Friday scorecard.

**Acceptance criteria:**

- No paid CTA leads with "more questions".
- Free capture users receive functioning nurture.
- Links, merge fields, and unsubscribe work in seed tests.
- Paid-offer language is consistent across homepage, assessment, course, email, and Stripe.

**Metrics:** email capture to paid click, paid click to purchase, unsubscribe
rate, nurture link clicks, refund/support objections by category.

**Owner:** product marketing/operator.

**Dependencies:** MailerLite access, domain auth, source taxonomy.

## Plan 13 - Sales / ABM lead: prepare controlled outbound, do not improvise it

**Priority:** Strategic P0, staged. Impact 5, urgency 4.

**Persona feedback:** outbound or partner motion can solve channel uncertainty,
but an improvised blast creates sender, compliance, and brand risk.

**Current state:** staged. No outbound should start until the site, support,
MailerLite, scorecard, and live-money path are ready.

**Objective:** create a controlled first ABM or partner test after readiness.

**Action plan:**

1. Build a hand-vetted account list with role/institution rationale.
2. Keep cold outbound separate from opted-in MailerLite nurture.
3. Establish suppression and unsubscribe handling.
4. Create 2 to 3 short outreach variants.
5. Offer a low-friction CTA: free assessment, role playbook, or briefing.
6. Build a partner/association one-pager.
7. Cap the pilot and judge by positive replies, not opens.

**Acceptance criteria:**

- No purchased/scraped list is imported into nurture.
- Every outbound contact has a rationale.
- Opt-outs can be honored quickly.
- Pilot volume is capped and measurable.

**Metrics:** positive replies, briefing requests, assessment starts, bounces,
unsubscribes, complaints, support cases created by confused recipients.

**Owner:** sales/GTM owner.

**Dependencies:** named channel decision, source taxonomy, support routine,
proof/people content.

## Plan 14 - GTM / RevOps operator: make metrics trustworthy

**Priority:** P1. Impact 4, urgency 4.

**Persona feedback:** dashboard data is only useful if definitions are trusted.
Raw anonymous resource downloads and test/internal identities can distort
decisions.

**Current state:** implemented locally. `/admin/funnel` copy now says
known-contact metrics exclude configured test/internal identities and raw
resource downloads are popularity signals. `docs/funnel-reporting.md` defines
exclusions and a 20-row Friday scorecard.

**Objective:** make the admin dashboard the weekly launch operating system.

**Action plan:**

1. Deploy and verify `/admin`, `/admin/funnel`, and `/admin/support`.
2. Confirm allowlisted operator access.
3. Confirm test/internal exclusions in production env.
4. Treat anonymous resource downloads as content-interest signals, not leads.
5. Run the first Friday scorecard with 15 to 20 rows.
6. Record one decision and one change per week.

**Acceptance criteria:**

- Every metric has a source and definition.
- Test/internal identities are excluded.
- Known-contact versus anonymous activity is clearly separated.
- The scorecard drives a weekly action.

**Metrics:** known contacts, assessment starts/completions, capture rate,
checkout starts, purchases, support rate, refund rate, source conversion,
certificates, active entitlements.

**Owner:** GTM/RevOps operator.

**Dependencies:** production env, admin login, scorecard cadence, CSV export.

## Plan 15 - Product manager: prove live-money readiness

**Priority:** P0. Impact 5, urgency 5.

**Persona feedback:** green builds do not prove that a real buyer can pay,
receive access, use the product, and be refunded correctly.

**Current state:** evidence template implemented locally. Actual live smokes are
still owner-run because they require live cards, Stripe dashboard, and production
access.

**Objective:** produce evidence that the individual paid funnel works end to end.

**Action plan:**

1. Run one live free assessment smoke.
2. Run one live In-Depth purchase smoke.
3. Run one live Foundation purchase smoke.
4. Confirm purchase emails, magic links, entitlements, dashboard/course access, and Toolbox save.
5. Confirm Stripe webhook 2xx delivery for each paid session.
6. Run full refund and confirm access revocation.
7. Run partial refund and confirm access retention.
8. Record buyer email, timestamp, product, Stripe Checkout Session ID, webhook result, and support outcome in the evidence log.

**Acceptance criteria:**

- Free assessment lands on results and sends email.
- In-Depth buyer reaches paid assessment and receives results/briefing.
- Foundation buyer reaches course and can save an artifact.
- Full refund revokes access.
- Partial refund retains access.
- Webhooks show 2xx in Stripe.

**Metrics:** purchase success, email delivery time, webhook success, magic-link
success, entitlement success, refund revocation success, support cases per test.

**Owner:** product/operator with Stripe access.

**Dependencies:** production env, live Stripe keys/webhook, Resend sender,
support console.

## Plan 16 - IT/security reviewer: create the internal approval packet

**Priority:** P0. Impact 4, urgency 5.

**Persona feedback:** a security reviewer needs a forwardable packet, not just
marketing pages. They also need privacy/terms language that does not overstate
model/data assurances.

**Current state:** implemented locally; live verification pending. Public
data-handling exists locally, `/security/it-approval` now provides the
forwardable packet, and privacy/terms language has been softened.

**Objective:** make internal IT/risk/procurement review easy and factual.

**Action plan:**

1. Deploy the public `/security/it-approval` forwardable page.
2. Include product scope: assessment, course, Toolbox/Lab, support, refunds.
3. Include data posture: no customer PII practice, synthetic/sanitized examples,
   saved artifacts, support records, and provider call boundaries.
4. Include claim boundaries: no SOC 2/ISO/FedRAMP/GLBA certification claim unless
   actually obtained, no regulator endorsement, AI output is draft until human-owned.
5. Keep privacy/terms language clear that AiBI does not train AiBI-owned models on user data or course content, while selected provider paths apply when AI features run.
6. Live-verify the packet links from `/security`, `/security/data-handling`, `/for-institutions`, footer, and sitemap.
7. Date/version the packet and review quarterly.

**Acceptance criteria:**

- Buyer can forward one page to IT/risk/procurement.
- It links to privacy, terms, AI use disclaimer, security, data-handling, and institution inquiry.
- It contains no unsupported assurance language.
- Public site language and packet language match.

**Metrics:** approval-packet views/downloads, institution inquiries after packet
view, security objections, support cases about data/PII, time from inquiry to briefing.

**Owner:** product/security content owner.

**Dependencies:** data-handling page, privacy/terms patch, footer/sitemap links,
claim-safety review.

## Plan 17 - UX researcher: close purchase-page dead ends

**Priority:** P1. Impact 3, urgency 4.

**Persona feedback:** the 20-person production sweep found three dead ends on
`/courses/foundation/program/purchase`. This was not a 404, but it meant
undecided users had no visible recovery path except browser back.

**Current state:** implemented locally through the same fix as the branch-manager
plan: secondary links to course overview, free assessment, purchase help, and
institution inquiry.

**Objective:** keep checkout dominant while giving undecided buyers a way to continue.

**Action plan:**

1. Deploy the purchase-page secondary links.
2. Verify mobile and desktop placement does not dilute the main enroll CTA.
3. Re-run the 20-person or targeted link-only sweep in production.
4. Track secondary-link clicks after launch.
5. If many users choose help instead of checkout, improve the purchase-page FAQ.
6. If many users choose overview, move a missing proof block higher on purchase page.

**Acceptance criteria:**

- Link-only crawler no longer reports the Foundation purchase page as a dead end.
- Users can choose overview, assessment, help, or institution inquiry without browser back.
- Main purchase CTA remains visually dominant.

**Metrics:** purchase-page secondary-link clicks, checkout starts, help cases,
overview returns, mobile scroll depth, exit rate.

**Owner:** UX/product.

**Dependencies:** production deploy, route sweep, analytics/source tracking.

## Plan 18 - UI/accessibility reviewer: complete launch QA on real devices

**Priority:** P1. Impact 3, urgency 4.

**Persona feedback:** automated route sweeps found no 4xx or JS errors, but real
mobile devices, forms, CTA bars, labels, and error states still need launch QA.

**Current state:** implemented locally; physical-device pending. Expanded
Playwright a11y/mobile coverage now includes assessment take, security,
data-handling, IT approval, courses, Foundation purchase, and purchase-help
routes. The local run passed after fixing a 375px FAQ CTA-band overflow.

**Objective:** prevent avoidable mobile or assistive-tech friction before traffic.

**Action plan:**

1. Run the expanded Playwright a11y and mobile viewport specs before deploy.
2. Test the top conversion routes on physical iPhone/Safari and desktop Chrome.
3. Verify CTA visibility, hit targets, sticky bars, and no content overlap.
4. Confirm forms have labels, clear errors, and keyboard focus states.
5. Confirm support intake never reveals whether an account exists.
6. Confirm assessment completion timing and answer-card accessibility.
7. Record screenshots and accepted gaps.

**Acceptance criteria:**

- Free assessment completes under 3 minutes on mobile.
- Key paid and support forms are label-clear and error-clear.
- Buttons and sticky elements do not overlap content.
- No mysterious unlabeled controls remain in critical flows.

**Metrics:** mobile completion rate, form errors, accessibility defects, support
questions from mobile users, QA defect count.

**Owner:** UI/QA.

**Dependencies:** production deploy, live smoke path, physical device access.

## Plan 19 - Brand designer: add real proof without fake authority

**Priority:** P2. Impact 3, urgency 3.

**Persona feedback:** the brand system is coherent, but proof/people are thin.
The site should not invent advisors, logos, testimonials, or customer evidence.

**Current state:** implemented locally; owner proof pending. The factual trust
path exists locally, `/about` now explains proof standards, the artifact gallery
is linked as product proof, and `docs/proof-collection-runbook.md` defines how
real proof can be collected and approved.

**Objective:** add credibility using only real, approved material.

**Action plan:**

1. Keep the proof/people component empty-safe until advisor content is approved.
2. Use the artifact gallery pattern for synthetic and anonymized outputs.
3. Collect first-user screenshots, quotes, or before/after artifacts with permission under the proof collection runbook.
4. Avoid stock-like or fake trust imagery.
5. Keep design restrained and banking-appropriate.
6. Add proof incrementally after first users, not as placeholder decoration.

**Acceptance criteria:**

- Proof uses approved names, artifacts, or anonymized outputs.
- No fake logos, fake people, or unsupported authority signals.
- The design supports scanning and does not overwhelm the conversion path.

**Metrics:** proof-section engagement, credibility objections, `/about` to paid
path movement, senior-buyer inquiries.

**Owner:** founder/brand/design.

**Dependencies:** owner approval, first live users, proof collection process.

## Plan 20 - Support / launch ops owner: make the support console operational

**Priority:** P0. Impact 5, urgency 5.

**Persona feedback:** support tooling exists, but someone still needs to own the
queue, SLA, refund authority, access rescue, and Stripe handoff. For this
business, that owner is the founder/operator using `hello@aibankinginstitute.com`.

**Current state:** implemented locally; live operator verification pending.
`/admin/support`, purchase help intake, support cases, CSV export, buyer search,
access-rescue action, ops-alert case creation, daily routine, SLA, and manual
Stripe refund authority flow exist. Production operator access still needs proof.

**Objective:** make paid-buyer support reliable before promotion.

**Action plan:**

1. Confirm the allowlisted operator can log in to `/admin/support`.
2. Confirm `/support/purchase-help` creates a case and sends the right emails.
3. Follow the console-visible first-response SLA and daily queue-check times.
4. Use the refund authority flow: app records eligibility/decision; Stripe refund is manual.
5. Confirm access-rescue email works and writes a timeline event.
6. Confirm search by buyer email and Stripe session works.
7. Confirm ops-alert events create or update deduped support cases.
8. Use macros for missing email, access rescue, duplicate purchase, refund request, and unresolved provisioning issue.

**Acceptance criteria:**

- Operator can access `/admin/support` in production.
- Case timeline tells the next action clearly.
- Refund approved/denied/issued can be recorded without calling Stripe refund APIs.
- Access rescue works and is logged.
- SLA breaches and open cases are visible in metrics.

**Metrics:** open cases, new cases, SLA breaches, median first response, median
resolution time, access rescues sent, refund requests pending/approved/denied,
support cases per 10 paid enrollments, provisioning/email/webhook failure cases.

**Owner:** support/operator.

**Dependencies:** admin allowlist, Supabase trusted-device auth, support inbox,
Stripe dashboard access, live smoke tests.

## Immediate execution board

1. Deploy and live-verify the IT/security approval packet and privacy/terms data-language cleanup.
2. Run live free, In-Depth, Foundation, full-refund, and partial-refund smoke tests.
3. Verify support login, purchase-help intake, buyer search, access rescue, and refund decision logging.
4. Run real iPhone/Safari and accessibility QA on the conversion paths.
5. Deploy and live-sweep Foundation purchase secondary links, `/about`, `/security/data-handling`, and the support intake path.
6. Paste, seed-test, and activate MailerLite nurture.
7. Run the first Friday scorecard from corrected admin metrics.
8. Collect the first proof artifacts and decide what can be public.
9. Then name the first acquisition channel and build a channel-specific landing path.
10. Keep Team Assessment assisted until two production-like cohorts pass QA.
