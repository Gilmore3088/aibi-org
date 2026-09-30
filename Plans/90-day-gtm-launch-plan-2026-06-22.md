# 90-Day GTM Launch Plan And Hard Readiness Review

Last updated: 2026-06-23.

Source-of-truth branch: `main`.
Current docs index: [Current Docs](../CURRENT_DOCS.md).

Related June 23 readiness artifacts:

- [20-persona prioritized remediation plans](../archive/Plans/20-persona-prioritized-remediation-plans-2026-06-23.md)
- [20-persona remediation comparison](../archive/Plans/20-persona-remediation-comparison-2026-06-23.md)
- [50-persona GTM readiness review](../archive/Plans/50-persona-gtm-readiness-review-2026-06-23.md)
- [100-persona audit action items](../archive/docs/persona-audit-2026-06-23/03-action-items.md)

## Executive Position

Launch the AI Banking Institute around the individual buyer funnel first:

1. Free 12-question readiness snapshot.
2. $99 individual In-Depth Assessment.
3. $295 Foundation Course.
4. Toolbox saves, certificate, referral, and later institutional expansion.

The harsher read: the codebase is production-deployable, but that is not the same as being revenue-safe. The individual funnel can be promoted after live transaction QA. The team/institution funnel should stay assisted-sales until fulfillment, reporting, support, privacy, and buyer handoff have been manually proven with real production-like cohorts.

As of the June 23 persona pass, the 20-person remediation plans, the 50-person
GTM readiness review, and the larger 100-persona remediation pass are complete
locally. The 100-persona audit expanded the attack surface and found deeper
post-click P0s; those persona rows now pass locally. The remaining blockers are
production/operator gates: live transaction evidence, personalized PDF and
download proof, cron/email delivery, admin/support login, MailerLite activation,
physical iPhone/Safari QA, and first-user proof.

> **Gating precondition (before anything else in this plan).** Supabase production
> migrations must be applied through the current local ceiling, `00058`, and verified via
> `/api/health/supabase` → `ok: true`. This is the #1 launch blocker: a missing column
> 404'd **every** assessment result on 2026-06-18. **✅ Former outage resolved
> 2026-06-22:** `00044`–`00048` applied via MCP; `/api/health/supabase` returned
> `ok:true`. Re-verify after applying `00049`–`00058`.
> Everything else here is recoverable. The binary go/no-go list is
> `docs/launch-checklist.md` — this plan owns strategy and sequencing, that file owns the gate.

## What Is Currently True

| Area | Current Evidence | Launch Meaning |
|---|---|---|
| Branch hygiene | Remote branch list is only `origin/main`; local branch list is only `main`; stale work archived. | Production source of truth is clean. |
| Deployment | Vercel status for `2f6defd0` is green. | Public site can deploy from `main`. |
| Tests | `npx tsc --noEmit --pretty false`, `npm run lint`, `npm test` (566 tests), `npm run build`, and the plan-named Chromium E2E batch pass locally. | Repo-level quality gate is green; production proof remains separate. |
| Free Assessment | `/assessment` and `/assessment/take` exist. | Lead magnet exists, but live completion/email/PDF behavior still needs production smoke. |
| In-Depth Assessment | `/assessment/in-depth`, `/assessment/in-depth/take`, `/api/checkout/in-depth`, and webhook provisioning exist. | Individual $99 offer is the first paid conversion target after live QA. |
| Foundation Course | 18-module course exists under `/courses/foundation/program`. | Course can be sold if checkout, entitlement, toolbox saves, and certificate flows pass live QA. |
| Toolbox | `/dashboard/toolbox`, multi-provider AI harness, save routes, and access helpers exist. | Strong paid-value story, but the public journey must route buyers to real product surfaces. |
| Team Assessment | `/assessment/team`, checkout, cohort, participant, admin, and print routes exist. | Product should not be pushed hard until a dedicated team-report hardening pass is complete. |
| Refund Copy | FAQ, Terms, and purchase FAQ now state a 7-day policy. | Trust blocker reduced, but support execution must be assigned. |
| Dependencies | GitHub Dependabot open alerts are empty; `npm audit` is clean. | Security-alert blocker cleared. |
| Admin/support operations | `/admin`, `/admin/funnel`, `/admin/support`, buyer search, support CSV export, purchase-help intake, ops alerts, metric exclusions, and support-owner flow exist in current code. | The operating system exists; it still needs live operator login, inbox/email delivery, daily queue handling, and Friday scorecard discipline. |
| Trust/security packet | `/about`, `/security/data-handling`, `/security/it-approval`, proof standards, and the proof collection runbook exist in current code. | CEO, CIO, InfoSec, and legal-review friction is reduced; real proof and live page verification are still required. |
| Persona remediation | 20 persona plans are prioritized, the 20-person comparison is complete, the 50-person review is finalized, and the 100-persona audit rows are `100 ok / 0 warn / 0 fail` locally. Plan-named Chromium E2E coverage passed 81 tests locally with 6 seeded-dashboard tests skipped for missing local Supabase seed prerequisites. | Remaining P0s are live-money, production proof, and operator proof, not another broad website rewrite. |

## Harsher Critique

### 1. Green Code Is Not A Launch Strategy

The site builds and deploys, but the revenue chain depends on external state: Vercel env vars, Stripe live prices, Stripe webhook subscriptions, Supabase migrations through `00058`, Resend sender health, analytics access, and production email deliverability. None of that is proven by a green build.

Launch rule: do not buy traffic or announce paid products until a human completes live purchase QA for Free Assessment, In-Depth, Foundation, refunds, emails, entitlements, and Toolbox access.

### 2. Documentation Drift Is A Real Credibility Risk

The product has changed quickly: free assessment is 12 questions, Foundation is 18 modules, In-Depth is individual, and Team Assessment is separate. Any old 8-question, 9-module, 12-module, or board-ready-individual language will damage trust.

Launch rule: every public page, transactional email, nurture email, PDF, Stripe product description, and sales doc must be audited before promotion.

### 3. Team Assessment Is Tempting But Not Yet A Self-Serve Revenue Engine

The team product exists, but it asks a buyer to pay institutional money and trust aggregate reporting, privacy thresholds, seat handling, participant links, admin access, and print output. That is a higher support and reputational risk than the individual funnel.

Launch rule: sell Team Assessment only as assisted sales until at least two internal production-like cohorts pass end-to-end QA with 10+ completed responses.

### 4. The Foundation Course Promise Must Stay Concrete

The strongest Foundation value is not "AI education." It is saved prompts, reusable skills, workflow templates, safety checklists, a final packet, and confidence using AI safely in a bank. If the course pages drift back to abstract claims or heavy prose, conversion will suffer.

Launch rule: every Foundation CTA should point to a tangible outcome: prompt builder, skill builder, saved Toolbox artifact, certificate, or manager-ready packet.

### 5. Analytics Events Are Not Yet An Operating System

Typed events exist, but a launch team needs a weekly scorecard that someone actually reviews. If the data is scattered across Vercel, Stripe, Supabase, Resend, and analytics tools, decisions will become anecdotal.

Launch rule: define one weekly funnel table before launch. If automated dashboards are not ready, use a manual spreadsheet every Friday.

### 6. Paid Trust Depends On Support

Refund copy is now public, but support execution is still the risk. Buyers will ask about access, failed payment, missing email, report PDF, certificate, refund, and team seats. Slow or improvised support makes a small product feel fragile.

Launch rule: assign an owner, inbox, SLA, and response macros before serious promotion.

### 7. The Funnel Can Over-Promise Without Real Proof

The site has product surfaces, but not enough external proof yet. Without testimonials, before/after artifacts, buyer screenshots, or anonymized outcomes, conversion will rely on copy alone.

Launch rule: collect proof from the first 10-20 users before scaling beyond warm/organic channels.

### 8. The 50-Person Review Tightened The Launch Gates

The June 23 50-person review confirms that the updated website is materially
stronger than the original 20-person review state, but production readiness is
still not proven by local tests.

Launch rule: before paid promotion, verify admin/support login with the real
operator, run the live smoke log, activate MailerLite after seed tests, complete
physical iPhone/Safari QA, and collect the first approved proof items before
scaling beyond a controlled founder-led launch.

## Strategic Positioning

Primary audience:

- Individual banking professionals.
- Frontline and department managers.
- Compliance-adjacent operators.
- AI-curious staff who need bank-safe confidence.

Core promise:

Know where you stand, get one practical next move, and build reusable AI skills safely in a bank.

Offer ladder:

| Step | Offer | Value | CTA |
|---|---|---|---|
| Free | 12-question readiness snapshot | Baseline score, top gap, 30-day next move | Start free assessment |
| Paid entry | $99 In-Depth Assessment | Individual report, peer-band comparison, and 90-day action register | Get the full report |
| Course | $295 Foundation Course | 18 bite-sized modules, saved prompts, skills, workflows, Toolbox, certificate | Build the Foundation packet |
| Assisted sales | Foundation seats / Team Assessment | Bulk capability building or cohort view | Talk to us / assisted rollout |

Do not position the individual In-Depth Assessment as board-ready or institution-wide. Position the Team Assessment as the product that can support an aggregate institutional view, after hardening.

## Revenue Targets

Base 90-day model:

| Metric | Target | Notes |
|---|---:|---|
| Qualified sessions | 8,000 | Organic, partner, direct, email. **See reality check — this input has no named channel yet.** |
| Free assessment starts | 1,500 | 18.75% of qualified sessions. |
| Free assessment completions | 900 | 60% of starts. |
| Email captures | 450 | 50% of completions. |
| In-Depth purchases | 90 | **20%** of captures. Gross: $8,910. |
| Foundation purchases | 10 | ~11% attach off In-Depth buyers. Gross: $2,950. |
| Total gross revenue | $11,860 | Before Stripe, SaaS, support, and refunds. |

> **Reality check (added 2026-06-22 after red-team review). This table is a planning
> model, not a forecast — and it is optimistic on one unresolved axis:**
> 1. **Top-of-funnel is unfunded.** "8,000 qualified sessions, organic/$0 paid" has **no
>    named acquisition channel** — the newsletter was retired, no partner is signed, a new
>    domain has no SEO runway. Every number below it is a percentage of a figure the plan
>    cannot yet produce. **Treat securing one real, named channel (a banking-association
>    placement, a core-provider co-market slot, a conference list, or a rebuilt owned list)
>    as the binding constraint before any revenue target is credible.** Multiplying a missing
>    top-of-funnel by a better landing page is still ~$0.
> 2. **Capture→In-Depth at 20% is still aggressive for a cold audience,** but the
>    previous base case's ~39% In-Depth→Foundation attach has been lowered to ~11% so
>    Foundation revenue no longer carries the model. A conservative cold-launch scenario
>    (≈1,500 real sessions, 2–3% capture→$99, 5–15% Foundation attach) lands closer to
>    **$1k–$5k**. The "minimum viable success" below ($10k) is itself the optimistic
>    floor, not a worst case.
>
> Earlier this row read "10% of captures" while listing 90 purchases (= 20%); the rate is
> now corrected to 20% so the arithmetic is internally consistent.

Stretch 90-day model (only credible once a named top-of-funnel channel exists):

- 150 In-Depth purchases = $14,850.
- 60 Foundation purchases = $17,700.
- Total gross revenue = $32,550.

Minimum viable success:

- $10,000 gross revenue.
- 50 In-Depth purchases.
- 20 Foundation purchases.
- 100 saved Toolbox artifacts.
- 10 credible proof points.

Cost assumptions:

| Cost | Base Estimate | Harsh Note |
|---|---:|---|
| Stripe fees | $650-$1,150 | Depends on mix and refunds. |
| Hosting/email/monitoring | $300-$900/quarter | Can rise with PDF and AI usage. |
| AI provider usage | Unknown until measured | Must be capped before sandbox promotion. |
| Support labor | 25-45 hours | Underestimated if auth/email issues persist. |
| Paid media | $0 initially | Do not spend until organic conversion is proven. |

## Operating Metrics

Track weekly:

- Sessions by landing page.
- Assessment starts.
- Assessment completions.
- Email captures.
- In-Depth checkout starts.
- In-Depth purchases.
- Foundation checkout starts.
- Foundation purchases.
- Gross revenue.
- Refunds.
- Failed payments.
- Email send failures.
- Support tickets by category.
- Toolbox saves.
- Course module starts/completions.
- Certificate completions.

Use the admin dashboard as the operating source of truth: `/admin` for launch health,
`/admin/funnel` for known-contact funnel movement, and `/admin/support` for queue/refund
state. Test/internal identities must stay excluded from these metrics, and anonymous
resource-download rows should not be treated as leads.

Decision rules:

- If assessment start rate is weak, simplify `/assessment` above-the-fold again.
- If completion rate is weak, reduce assessment friction before changing paid CTAs.
- If email capture is weak, improve the free report preview and post-result CTA.
- If In-Depth checkout starts are weak, make the paid deliverable preview more concrete.
- If In-Depth purchases are weak after checkout starts, inspect price trust, refund clarity, and Stripe UX.
- If Foundation purchases are weak, show saved prompt/skill/toolbox artifacts earlier.
- If support tickets spike, pause promotion until root causes are fixed.

## Phase 1: Readiness Lock, Week 1

**Phase 1 = pass every item in [`docs/launch-checklist.md`](../docs/launch-checklist.md).**
That file is the single binary go/no-go gate (SPOF preflight, env vars, SKIP flags,
webhook events, live smoke tests, refund full/partial/comp, copy audit, support,
tax trigger). Do not maintain a second copy of it here — a duplicated checklist drifts.

Phase 1 is complete when the launch checklist is fully green and a human has personally
completed the live purchase + refund flows for Free Assessment, In-Depth, and Foundation.
No paid traffic, no announcement, until then.

## Phase 2: Organic Funnel Push, Weeks 2-4

| Task | Internal Check |
|---|---|
| Launch weekly assessment CTA campaign. | Report starts, completions, capture rate, and paid click-through. |
| Publish one proof resource per week. | Each resource has one CTA, not three. |
| Add concrete paid previews. | Show report sections, Toolbox saves, and course artifacts without adding walls of copy. |
| Collect proof points. | Capture at least three quotes/screenshots/anonymized artifacts. |
| Friday funnel review. | One-page scorecard, one change for next week. |

## Phase 3: Conversion Tightening, Weeks 5-8

| Task | Internal Check |
|---|---|
| Optimize `/assessment`. | Subtle paid nudge, not a busy hero. |
| Optimize `/assessment/in-depth`. | Individual value only; no board/institution overclaim. |
| Optimize `/courses`. | Emphasize prompt builder, skill builder, Toolbox, 18 micro-modules. |
| Improve post-result CTA. | Route by tier and gap; avoid generic "buy now" language. |
| Segment nurture. | Message by readiness tier and product behavior. |

## Phase 4: Scale Or Stop, Weeks 9-13

| Task | Internal Check |
|---|---|
| Push Foundation to qualified users. | Focus In-Depth buyers and high-intent free users. |
| Package proof artifacts. | Use real screenshots and anonymized outputs. |
| Test paid media only if organic works. | Cap spend; judge by CAC and refund-adjusted revenue. |
| Decide next product priority. | Choose Team Assessment hardening, Foundation UX, or In-Depth conversion based on data. |
| Complete 90-day review. | Revenue, costs, conversion, support load, defects, next-quarter recommendation. |

## All-Systems-Go Manual Launch List

**Moved.** The manual go/no-go list now lives in one place:
[`docs/launch-checklist.md`](../docs/launch-checklist.md) (§0 SPOF preflight through §10
tax trigger). It absorbed every item that used to be duplicated here — branch hygiene,
mobile QA routes, "no mockup-only CTAs", copy-audit counts, support readiness, and the
weekly scorecard. Maintain it there; do not re-add a copy to this plan.

## Known Defects And Unknowns

| Issue | Severity | Why It Matters | Required Action |
|---|---:|---|---|
| Live external services not proven by repo checks | High | Stripe/Supabase/Resend failures break revenue even with green code. | Complete live QA before promotion. |
| Product copy drift history | High | Buyers lose trust when pages, emails, docs, and receipts disagree. | Run copy audit across public pages, emails, Stripe, and PDFs. |
| 100-persona production proof remains | High | The larger audit found value-delivery failures after users buy, submit, or request downloads. The local remediations are now implemented and the persona rows pass locally, but production behavior is not proven by repo checks. | Finish production proof for PDF/resource rendering, stranded-buyer recovery, retention crons/email delivery, team lead capture, public demo truthfulness, email-gated download fixes, certificate verification, and support-case creation before paid promotion. |
| Team Assessment hardening gap | High | Institutional buyers expect robust aggregate reporting and support. | Keep assisted-sales; run seeded and real cohort QA before scaling. |
| Metric definitions need discipline | Medium | Admin metrics now exclude known test/internal identities, but launch analysis can still be distorted if source rules and exclusions drift. | Keep metric exclusions documented and treat anonymous resource-download events as non-leads. |
| First named channel not secured | High | The 8,000-session model remains a planning model until a real channel exists. | Secure one named acquisition channel with owner, date, audience, CTA, UTMs, and stop/continue thresholds after the site/support readiness gates pass. |
| Admin/support operator login not live-verified | High | The support console exists, but prior admin-login/reset friction means the real operator path can still fail in production. | Verify allowlist, Supabase session, trusted-device confirmation, reset or magic-link delivery, buyer search, case creation, access rescue email, and timeline logging. |
| Dashboard cadence not proven | Medium | `/admin`, `/admin/funnel`, and `/admin/support` exist, but launch decisions still fail if nobody reviews them. | Run a Friday scorecard with notes and one next action per week. |
| Support operating routine not proven | Medium | Paid buyers need fast resolution. `hello@aibankinginstitute.com` and `/admin/support` are the v1 support setup, but manual refund authority and daily queue handling still need live practice. | Confirm owner, business-hours SLA, refund authority, and Stripe click path before promotion. |
| AI usage costs unknown | Medium | Sandbox/toolbox success can create unpredictable COGS. | Add usage caps and weekly cost review. |
| Proof gap | Medium | Product can look plausible but unproven even with safer claim boundaries. | Use `docs/proof-collection-runbook.md`, `/about` proof standards, and `/courses/foundation/gallery`; collect at least three approved proof items before scaling beyond controlled launch. |
| Physical iPhone/Safari QA not complete | Medium | Chromium viewport tests passed locally, but real Safari browser chrome, tap targets, and email/app handoffs can differ. | Run the physical-device route list in `docs/launch-checklist.md` and record screenshots or notes. |
| Team Assessment self-serve must remain gated | High | Code now keeps `/assessment/team` assisted-sales by default and `/api/checkout/team-assessment` returns 403 unless `ENABLE_TEAM_ASSESSMENT_SELF_SERVE_CHECKOUT=true`. | Do not set the flag until two production-like cohorts pass E2E QA and owner accepts self-serve risk. |
| No named founder/advisor content in the funnel | Medium | A factual trust anchor now names public references and claim boundaries, but `AdvisorsStrip` remains empty until real people approve attribution. | Owner supplies founder/advisor content; keep placeholders out of production. Ties to Proof gap. |
| Buying-path friction needs live verification | Medium | Code now adds refund terms near $99/$295 CTAs, makes `/for-institutions` assessment-first, and links ROI methodology from the calculator. | Verify on the live build before scaling traffic. |
| Foundation purchase page can become a terminal surface | Medium | The 2026-06-23 production persona sweep found no 4xx/JS failures, but three personas dead-ended on `/courses/foundation/program/purchase`. | Add secondary links to course overview, free assessment, purchase help, and institution inquiry. |
| Comp ($0) access can't be auto-revoked | Low | $0 sessions have no charge, so `charge.refunded` never fires for comps. | Revoke comps by deleting the `course_enrollments` row; documented in stripe-products.md + checklist §6. |
| Stripe Tax disabled crosses its own threshold | Low | The 90-day model targets >50 paid transactions; the tax-revisit trigger is 50. | Tracked as checklist §10 — re-evaluate Stripe Tax at 50 transactions or first multi-state pattern. |

## Bottom-Line Recommendation

Proceed with a controlled individual-funnel launch after live QA passes. Do not run paid media yet. Do not sell Team Assessment as a fully self-serve product yet. The next strategic task is not more features; it is proving the transaction, fulfillment, support, analytics, and proof loops on the products already built.
