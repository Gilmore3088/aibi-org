# Launch finalization checklist

The single actionable list of what remains to take the funnel + nurture work
fully live. The original admin/support/funnel work is deployed (see "Shipped").
The later 100-persona remediation pass is locally complete but still needs
commit/PR review, production deployment, migration proof, and live verification.
Everything below requires either third-party dashboard work, live-money smoke
testing, production proof, a business decision, or PR cleanup.

Last updated: 2026-06-23.

## Shipped (merged to `main`)

| PR | What |
|----|------|
| #509 | Derived funnel reporting views (`funnel_scorecard`, `funnel_stage_distribution`, `funnel_contacts`) — applied to the DB. See [funnel reporting](funnel-reporting.md). |
| #510 | Gated `/admin/funnel` dashboard + [paid buyer support runbook](paid-buyer-support-runbook.md). |
| #511 | 12 assessment nurture emails rebranded to brand v1 + marketing-review fixes. |
| #512 | Launch-finalization checklist + nurture branch/segmentation plan. |
| #513 | Final email launch blockers cleared: canonical score bands, responsive HTML width, valid markup, encoded links, softened claims, CTA alignment, and one-screen QA index. |
| #514 | Support console, purchase-help intake, ops alerts, and team self-serve guardrails. |

MailerLite automation **subjects** for all 12 steps were also set via API.

Also deployed after the original checklist:

- `/admin`, `/admin/funnel`, `/admin/support`, support CSV export, buyer search,
  purchase-help intake, and support-case metrics.
- Production admin allowlists/support inbox, ops alert email, and admin dashboard
  test-data exclusions.
- Supabase `00051`, `00052`, and `00053` metric corrections. `resource_downloaders`
  now means unique known-email downloaders, not anonymous raw resource-download events.
- 20-persona GTM readiness review:
  [`docs/reviews/gtm-20-persona-review-2026-06-23.md`](reviews/gtm-20-persona-review-2026-06-23.md).

Locally completed after the original checklist, pending commit/deploy/live proof:

- 20-person remediation comparison:
  [`archive/Plans/20-persona-remediation-comparison-2026-06-23.md`](../archive/Plans/20-persona-remediation-comparison-2026-06-23.md).
- Finalized 50-person GTM readiness review:
  [`archive/Plans/50-persona-gtm-readiness-review-2026-06-23.md`](../archive/Plans/50-persona-gtm-readiness-review-2026-06-23.md).
- 100-persona audit remediation: local outcome rows now count
  **100 ok / 0 warn / 0 fail** in
  [`archive/docs/persona-audit-2026-06-23/02-persona-outcomes.md`](../archive/docs/persona-audit-2026-06-23/02-persona-outcomes.md).
- Current launch gate:
  [`docs/launch-checklist.md`](launch-checklist.md) now treats the remaining
  100-persona work as production proof rather than unresolved local persona rows.

## Remaining steps (by owner)

### MailerLite dashboard — operator (~30–40 min)
The API cannot author automation email HTML, so the bodies are pasted by hand.
From an up-to-date `main`, run a local preview to copy each one:
`python3 -m http.server 8791 --directory .` from the repo root, then open
`http://localhost:8791/docs/mailerlite-emails/index.html`.

- [ ] For each of the 4 tier automations (Starting Point, Early Stage, Building Momentum, Ready to Scale), paste the 3 matching email bodies (Design email → Use HTML editor → paste → save).
- [ ] Leave each step's **Preview text** field blank. The pasted HTML already includes a hidden preheader and filler; setting the dashboard field duplicates preview text.
- [ ] Authenticate the sending domain (MailerLite → Settings → Domains) — 9 of 12 steps reported `needs_domain_auth`.
- [ ] Verify the cadence is day 0 / 3 / 7 on each automation.
- [ ] Send a test of each tier to confirm `{$score}` / `{$profile_id}` resolve and the result link works.
- [ ] Confirm MailerLite appended or preserved the required unsubscribe/address footer in the sent seed email.
- [ ] Enable all 4 automations.

### Vercel env — completed for admin/support
- [x] `FUNNEL_ADMIN_EMAILS`, `ADMIN_SUPPORT_EMAILS`, `SUPPORT_INBOX_EMAIL`, and `OPS_ALERT_EMAIL` are set in Production.
- [x] `ADMIN_DASHBOARD_EXCLUDED_EMAILS` and `ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS` are set in Production for known test/internal data.
- [x] `/api/ops/alert-test` returned `ok: true`, `channel: "email"` during handoff verification.

### Secrets — owner
- [ ] Rotate the exposed live Stripe secret in the Stripe dashboard if it appeared in any transcript/log outside the trusted operator environment.
- [ ] Keep local `.env.local` scrubbed to non-live placeholders.
- [ ] Rerun `npm run audit:secrets` before PR/commit review.

### Business / content decisions — owner
- [ ] Name a top-of-funnel channel (GTM red-team item).
- [ ] Provide approved founder/advisor names + attribution before any trust/testimonial copy ships.
- [ ] Live-verify the deployed non-checkout secondary links on
      `/courses/foundation/program/purchase` for undecided users.

### Live-money smoke tests — owner
- [ ] Free assessment submit/email/results smoke passes on the live domain.
- [ ] In-Depth live purchase, webhook 2xx, access email, magic link, and completion smoke pass.
- [ ] Foundation live purchase, access email, course access, and Toolbox save smoke pass.
- [ ] Full refund revokes access; partial refund retains access.

### 100-persona production proof — operator + agent
- [ ] Apply/verify production migrations through `00058`.
- [ ] Deploy the local 100-persona remediation work.
- [ ] Prove gated/static downloads and personalized PDFs on the deployed app.
- [ ] Prove team/institution inquiry creates cases and sends inbox notifications.
- [ ] Prove buyer recovery, stranded-buyer cron, and paid re-engagement cron email delivery.
- [ ] Prove public demo model calls, rate limits, PII/injection blocking, and admin usage visibility.
- [ ] Prove `/verify` lookup and certificate print route with a real certificate row.
- [ ] Prove support operator login, buyer search, access rescue email, and refund timeline logging.

### Uncommitted root-tree work — owner
The root working tree is intentionally dirty with the 20/50/100-persona
remediation, docs, tests, migrations, static downloads, support/admin, auth
recovery, retention, public demo, and PDF work. Do not reset it casually.
Split into reviewed commits/PRs or explicitly decide what to discard.

## Drafted plan: nurture behavior branches + segmentation

Design captured here so it can be built in the MailerLite automation builder
when ready. The MailerLite API cannot express conditional branches, so these are
dashboard builds. All send live email — enable only after review.

### Segments
- **By tier** — `tier_label` field is already synced, so segments are buildable now: Starting Point / Early Stage / Building Momentum / Ready to Scale. (Largely redundant with the existing per-tier group triggers, but useful for one-off campaigns.)
- **By role / institution** — **blocked**: no `role`/`institution` field exists in MailerLite, the app doesn't sync them, and the *free* assessment doesn't collect them (only the In-Depth flow captures `role`). To enable: (1) decide whether to collect role/institution in the free funnel, (2) add the fields to `src/lib/mailerlite/sequences.ts` field sync + create them in MailerLite, (3) build the segments. Step 2 is a small PR once step 1 is decided.

### Behavior branches (per automation)
| Trigger | Action | Why |
|---|---|---|
| Replied to any email | Remove from automation | A human conversation has started; stop the drip. |
| Clicked the course CTA but no purchase in 48h | One course-objection-handling follow-up (price/credential/time) | Highest-intent non-buyer. |
| Clicked the briefing CTA | Tag + (optionally) accelerate to a scheduling nudge | Warm advisory/briefing intent. |
| Opened/clicked nothing by Day 3 | Resend Day 0 with an alternate subject line | Recover non-engagers before the sequence continues. |
| Viewed results page | Move the course CTA earlier in the next send | Sunk-cost signal; closer to purchase. |

Recommended build order: replied-suppression first (protects the buyer
experience), then no-engagement resend, then the click-intent branches.

## Using the funnel (already live)
- Numbers: `/admin` and `/admin/funnel`, or Supabase SQL editor → `select * from funnel_scorecard;` (also `funnel_stage_distribution`, `funnel_contacts`). Revenue $ lives in Stripe.
- Resource downloads are not raw demand by default. Use unique known-email resource downloaders and exclude configured test/internal identities.
- Browser: `/admin/funnel` and `/admin/support` with an allowlisted Supabase session.
- Full reference: [funnel reporting](funnel-reporting.md).
