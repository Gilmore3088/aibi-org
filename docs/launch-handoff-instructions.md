# Launch handoff instructions

Last verified: 2026-06-23.

This document is the handoff for taking the current launch state over the line.
It intentionally does not contain secret values. Use env var names, dashboard
checks, and the verification commands below.

## Current state

### Repository

- `main` is synced with `origin/main`.
- Current HEAD during this handoff update: `be21380f`.
- The local working tree is not clean. Do not revert it blindly; it contains
  the active 20/50/100-persona remediation work, launch docs, tests, migrations,
  static downloads, admin/support, auth recovery, retention, public demo, and PDF
  work.
- `supabase/migrations/00051_fix_funnel_active_learner.sql` is applied to
  production Supabase and marked applied in migration history, but the file is
  still untracked locally and must be included in the next commit/PR.
- `supabase/migrations/00052_resource_download_metrics_view.sql` and
  `supabase/migrations/00053_resource_downloaders_scorecard.sql` have also been
  applied to production Supabase. Do not assume `supabase db push --linked` is
  safe until the migration-history mismatch is cleaned up.

### Production service verification already completed

- Vercel Production env has the required launch vars, including:
  `FUNNEL_ADMIN_EMAILS`, `ADMIN_SUPPORT_EMAILS`,
  `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `STRIPE_FOUNDATION_PRICE_ID`,
  `STRIPE_INDEPTH_PRICE_ID`, `RESEND_API_KEY`, `OPS_ALERT_EMAIL`,
  `MAILERLITE_API_KEY`, all four tier MailerLite group IDs, and
  `MAILERLITE_GROUP_ID_PLAYBOOK`.
- `npm run audit:env:production` passed when run against pulled Production env.
- `npm run audit:secrets` passed after local `.env.local` was scrubbed to
  non-live placeholders.
- Live health endpoints passed:
  - `GET https://www.aibankinginstitute.com/api/health/stripe` returned
    `mode: "live"`.
  - `GET https://www.aibankinginstitute.com/api/health/email` returned
    Resend present and `skipResend: false`.
  - `GET https://www.aibankinginstitute.com/api/health/supabase` returned
    `ok: true`.
- Live Stripe API verification passed:
  - In-Depth Assessment price is active at USD 9900.
  - Foundation individual price is active at USD 29500.
  - Foundation institution price is active at USD 19900.
  - Live webhook endpoint exists at
    `https://www.aibankinginstitute.com/api/webhooks/stripe`.
  - Webhook is enabled, live-mode, and subscribed to:
    `checkout.session.completed`, `charge.refunded`,
    `payment_intent.payment_failed`, and `payment_intent.succeeded`.
- `POST /api/ops/alert-test` with Production `CRON_SECRET` returned
  `200`, `ok: true`, `channel: "email"`.
- Supabase production has objects from `00049`, `00050`, and `00051`.
  The remote `funnel_contacts` view now requires real course progress for
  `active_learner`: at least one completed module or `current_module > 1`.
- Supabase production has the `00052` resource-download metrics views and the
  `00053` scorecard correction. `resource_downloaders` now means unique
  known-email resource downloaders, not anonymous raw download rows.
- Local migrations now continue through `00058`. Migrations `00054`-`00058`
  cover assessment drafts, draft reminders, paid re-engagement events, PII audit
  fields, and 30-day free-assessment resume links. Apply/verify them before any
  production deploy that depends on the 100-persona remediation.
- Vercel Production env has the admin allowlists/support inbox and dashboard
  metric exclusions set:
  `FUNNEL_ADMIN_EMAILS`, `ADMIN_SUPPORT_EMAILS`, `SUPPORT_INBOX_EMAIL`,
  `ADMIN_DASHBOARD_EXCLUDED_EMAILS`, and
  `ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS`.
- Production was redeployed after the admin/support and metric corrections.
  Smoke checks confirmed `/admin` and `/admin/funnel` redirect unauthenticated
  users to login, and `/api/admin/support/metrics?range=30d` returns `401` when
  unauthenticated.
- Top-of-funnel launch direction is now locked as a permission-first
  assessment/playbook funnel plus a controlled account-based outbound pilot.
  A scraped-list blast is not an approved launch motion.
- The 20-person remediation comparison and finalized 50-person GTM readiness
  review are complete locally under `Plans/`.
- The 100-persona remediation pass is locally complete: the persona outcomes now
  count `100 ok / 0 warn / 0 fail`. The remaining 100-persona work is production
  proof, not unresolved local persona-row remediation.

### MailerLite state

MailerLite API confirms:

- Four automations exist:
  - `AiBI Assessment - Starting Point`
  - `AiBI Assessment - Early Stage`
  - `AiBI Assessment - Building Momentum`
  - `AiBI Assessment - Ready to Scale`
- Six expected groups exist:
  - `AI Readiness Assessment`
  - `Tier - Starting Point`
  - `Tier - Early Stage`
  - `Tier - Building Momentum`
  - `Tier - Ready to Scale`
  - `AiBI Role Playbook Requests`
- Each assessment automation has 3 email steps and a
  `subscriber_joins_group` trigger.

MailerLite API also confirms all four assessment automations are still:

- `enabled: false`
- `complete: false`

That means the nurture funnel is not live yet.

## Remaining launch blockers

### 1. Complete MailerLite dashboard work

This is the main remaining operational blocker.

The MailerLite Connect API exposes automation listing/getting/activity and
create/delete operations, but it does not expose enough surface to author the
automation email HTML bodies or activate these incomplete automations. Complete
this in the MailerLite dashboard.

If an agent is expected to do this later, first make sure the selected Chrome
profile has the Codex Chrome Extension installed and enabled, and open a
logged-in MailerLite dashboard tab. During this handoff, Chrome was running but
the selected profile did not have the extension installed/enabled, so the agent
could not use the existing browser session.

#### MailerLite source files

Start a local static server from the repo root:

```bash
python3 -m http.server 8791 --directory .
```

Open:

```text
http://localhost:8791/docs/mailerlite-emails/index.html
```

Use this index as the copy source. Do not copy from the rendered email preview
page; use the index "Copy HTML" control or raw source.

#### Automation and file mapping

For `AiBI Assessment - Starting Point`:

- Day 0: `docs/mailerlite-emails/01-starting-point-day0.html`
- Day 3: `docs/mailerlite-emails/02-starting-point-day3.html`
- Day 7: `docs/mailerlite-emails/03-starting-point-day7.html`

For `AiBI Assessment - Early Stage`:

- Day 0: `docs/mailerlite-emails/04-early-stage-day0.html`
- Day 3: `docs/mailerlite-emails/05-early-stage-day3.html`
- Day 7: `docs/mailerlite-emails/06-early-stage-day7.html`

For `AiBI Assessment - Building Momentum`:

- Day 0: `docs/mailerlite-emails/07-building-momentum-day0.html`
- Day 3: `docs/mailerlite-emails/08-building-momentum-day3.html`
- Day 7: `docs/mailerlite-emails/09-building-momentum-day7.html`

For `AiBI Assessment - Ready to Scale`:

- Day 0: `docs/mailerlite-emails/10-ready-to-scale-day0.html`
- Day 3: `docs/mailerlite-emails/11-ready-to-scale-day3.html`
- Day 7: `docs/mailerlite-emails/12-ready-to-scale-day7.html`

#### Dashboard checklist

For each of the four automations:

1. Open the automation in MailerLite.
2. Confirm trigger is `subscriber joins group`.
3. Confirm the trigger group matches the tier.
4. Open each email step.
5. Use the HTML editor.
6. Paste the matching file body from `docs/mailerlite-emails/`.
7. Set or confirm the subject to match the file `<title>` and the index card.
8. Leave the dashboard "Preview text" field blank. The HTML already contains
   the hidden preheader.
9. Save each email.
10. Confirm each email step is complete.
11. Confirm cadence is Day 0, then 3 days, then 4 more days. This is the
    intended Day 0 / Day 3 / Day 7 sequence.
12. Send one seed test per tier.
13. Confirm the seed email includes:
    - resolved `{$score}`
    - resolved `{$profile_id}`
    - a working result link
    - unsubscribe footer/address footer
    - authenticated sending domain
14. Enable the automation.
15. Re-check the automation list until all four show enabled/active.

Do not enable an automation if any email step is still incomplete.

### 2. Run live purchase and refund smoke tests

These require real live-card transactions and cannot be done safely without the
owner explicitly approving the payment method and accepting processing fees.

Use controlled buyer emails that the operator can receive. Record the buyer
email, Stripe Checkout Session ID, product, and timestamp for each purchase.

#### Smoke A: free assessment

1. Go to `https://www.aibankinginstitute.com/assessment`.
2. Complete the free assessment.
3. Submit an email address.
4. Confirm the browser lands on `/results/{profile_id}` without a 404.
5. Confirm the results email is received.
6. Confirm the contact enters the expected MailerLite tier group only after
   MailerLite automations are ready.

#### Smoke B: paid In-Depth Assessment

1. Go to `https://www.aibankinginstitute.com/assessment/in-depth`.
2. Buy with a live card.
3. Confirm Stripe creates a live Checkout Session.
4. Confirm purchase email arrives within about 5 minutes.
5. Open the magic link.
6. Confirm it lands in authenticated `/assessment/in-depth/take`.
7. Complete the assessment.
8. Confirm the briefing/results page loads.
9. Confirm the completion/results email arrives.
10. In Stripe dashboard, confirm recent `2xx` webhook delivery for that
    Checkout Session.

#### Smoke C: Foundation purchase

1. Go to `https://www.aibankinginstitute.com/courses/foundation/program/purchase`.
2. Buy with a live card.
3. Confirm welcome/access email arrives.
4. Open the access link.
5. Confirm `/courses/foundation/program` is accessible.
6. Save at least one artifact to the Toolbox.
7. Confirm `/dashboard/toolbox` or the relevant Toolbox surface reflects access.
8. In Stripe dashboard, confirm recent `2xx` webhook delivery.

#### Smoke D: full refund revocation

Use the Foundation purchase from Smoke C or another owner-approved live test
purchase.

1. In Stripe live dashboard, issue a full refund.
2. Wait about 60 seconds.
3. Confirm Stripe shows a `charge.refunded` webhook delivery with `2xx`.
4. Confirm the app revokes access:
   - `course_enrollments` row for that `stripe_session_id` is gone, or the
     entitlement state is inactive according to the current schema behavior.
   - buyer can no longer access `/courses/foundation/program`.
5. Confirm support owner understands refund notification is manual.

#### Smoke E: partial refund retention

This requires a second owner-approved live purchase if the first one was fully
refunded.

1. Issue a partial refund.
2. Confirm Stripe sends `charge.refunded` with `2xx`.
3. Confirm access is retained.

### 3. Close GTM/proof gaps before broad promotion

The current review chain is:

- 20-persona GTM review:
  `docs/reviews/gtm-20-persona-review-2026-06-23.md`.
- 20-person remediation comparison:
  `Plans/20-persona-remediation-comparison-2026-06-23.md`.
- Finalized 50-person GTM readiness review:
  `Plans/50-persona-gtm-readiness-review-2026-06-23.md`.
- 100-persona outcome tracker:
  `docs/persona-audit-2026-06-23/02-persona-outcomes.md`.

Before broad paid promotion:

- Secure one named top-of-funnel channel with owner, date, audience, CTA, UTMs,
  and stop/continue thresholds.
- Add or intentionally defer founder/advisor attribution. Do not use names,
  logos, quotes, or advisor language without written approval.
- Live-verify the deployed secondary links on
  `/courses/foundation/program/purchase` so undecided users can go to course
  overview, free assessment, purchase help, or institution inquiry without
  committing to checkout.
- Run a Friday scorecard from `/admin`, `/admin/funnel`, and `/admin/support`.
  Treat anonymous resource-download events as non-leads and keep test/internal
  identities excluded.
- Prove the 100-persona remediation in production: personalized PDFs, gated
  downloads, buyer recovery, stranded-buyer cron, paid re-engagement cron, team
  lead capture/support-case creation, public demo model calls/rate limits,
  certificate lookup/print, and support access-rescue/refund timeline logging.

### 4. Locked business decisions

These are the launch defaults unless the owner explicitly changes them.

#### Top-of-funnel acquisition motion

Decision as of 2026-06-23: launch with a permission-first assessment/playbook
funnel and a controlled account-based outbound pilot. Do not treat a scraped
2,500-contact blast as approved.

Approved launch sequence:

1. Use founder/direct business relationships and known opted-in contacts first.
2. Publish in selected industry groups and events only where the post,
   sponsorship, presentation, booth scan, or partner placement is allowed by
   the venue rules and the contact capture language is clear.
3. Build a targeted account list for community banks and credit unions, but use
   it for account research and tightly controlled 1:1 or small-batch outbound
   outside MailerLite.
4. Start paid marketing only after the free assessment or role-playbook landing
   path has enough signal to avoid buying unqualified traffic.

List building is allowed for account research. Harvesting contacts for bulk
email is not approved. If a public contact is used for outreach, verify the
role, institution, relevance, and suppression status before sending.

Compliance / platform constraints:

- Do not import scraped, purchased, social-media, or event-organizer lists into
  MailerLite. MailerLite requires permission-based lists and explicitly bans
  web-scraped email addresses, social-media contacts without permission, and
  event attendee lists without direct consent:
  `https://www.mailerlite.com/help/who-can-i-send-emails-to-with-mailerlite`
- CAN-SPAM applies to B2B commercial email. Any cold commercial email must use
  accurate headers, non-deceptive subjects, clear ad/solicitation framing, a
  valid physical postal address, a clear opt-out mechanism, and opt-out handling
  within 10 business days:
  `https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business`
- The FTC notes that bought or harvested lists are risky, including because they
  may include prior opt-outs or addresses obtained by prohibited harvesting /
  dictionary-attack methods:
  `https://www.ftc.gov/business-guidance/blog/2015/08/candid-answers-can-spam-questions`

Approved channel framing:

- MailerLite is for opted-in nurture only: assessment opt-ins, playbook requests,
  event opt-ins, and direct business contacts who affirmatively agreed to be
  added.
- Cold outbound, if used, must run outside the MailerLite nurture account on a
  separate cold-outreach process with its own suppression list, unsubscribe
  handling, domain/inbox plan, bounce monitoring, and legal review.
- Industry groups/events should be permission-first: sponsorships, talks,
  resource posts allowed by group rules, QR/signup pages, booth scans with clear
  consent language, and partner/newsletter placements.
- Paid marketing should send to a measurement-ready landing path with UTMs and a
  single conversion goal, ideally the free assessment or a role-specific
  playbook download.

Outbound pilot minimum operating rules:

- Do not use MailerLite for cold outbound.
- Do not use scraped, purchased, social-media, or event-organizer lists as
  newsletter/nurture imports.
- Use accurate sender identity, non-deceptive subject lines, a valid physical
  postal address, and a visible opt-out path.
- Maintain one suppression list across all outbound sends and apply opt-outs
  within the required window.
- Start with a small pilot before scaling volume. Stop or rewrite the campaign
  if bounce rate, complaints, unsubscribe rate, or negative replies indicate the
  list or offer is weak.
- Keep acquisition copy focused on readiness, governance, examiner-facing
  documentation, and staff enablement. Do not imply regulatory endorsement,
  peer adoption, or advisor backing that is not approved for public use.

Launch KPI gates:

- MailerLite opt-in nurture: automations complete/enabled and seed-tested before
  any meaningful traffic push.
- Warm/community traffic: free-assessment completion and role-playbook opt-in
  are the primary conversion metrics. Use at least 100 known contacts or 300
  qualified sessions before judging the channel. Continue if known-contact
  conversion is at least 10%, assessment start-to-complete is at least 60%, and
  click/reply/briefing intent is at least 5%.
- Outbound pilot: positive replies, assessment starts, playbook requests, and
  sales conversations matter more than opens. Cap the first pilot at 300-500
  hand-vetted contacts. Continue only if hard bounces stay below 2%, spam
  complaints stay at zero, unsubscribes stay below 2%, positive replies reach at
  least 3%, and real assessment or briefing conversions appear.
- Paid marketing: do not scale beyond small tests until the landing path has
  proven conversion from warm/community or outbound traffic. Send paid traffic
  to one goal: free assessment, playbook, or briefing request; not the homepage.

#### Founder/advisor attribution

Default launch decision: defer named founder/advisor attribution. Launch copy
may say the work is founder-led and built for banking AI readiness, but it must
not imply named advisor, institution, regulator, or examiner endorsement unless
that approval exists in writing.

Only add named people with explicit public-attribution approval.

If approved advisors are available, populate `content/advisors.ts` with:

- real first and last name
- real role
- institution or `Independent` / `Former <institution>`
- optional quote under 140 characters

Do not add anonymous advisors, fabricated quotes, institution logos without
approval, or regulator/examiner endorsement language.

## Local repo handoff

Current dirty-worktree status at handoff:

- Branch: `main`.
- HEAD: `be21380f`.
- `git status --short | wc -l` reported 260 entries during this update.
- The dirty tree includes both tracked edits and untracked files from the
  20/50/100-persona remediation pass. Treat it as active work, not disposable
  scratch.

Local/untracked artifacts created for the persona remediation and reviews include:

```text
Plans/20-persona-prioritized-remediation-plans-2026-06-23.md
Plans/20-persona-remediation-comparison-2026-06-23.md
Plans/50-persona-gtm-readiness-review-2026-06-23.md
docs/reviews/gtm-20-persona-review-2026-06-23.md
docs/handoffs/persona-sweep-2026-06-23/summary.md
docs/handoffs/persona-sweep-2026-06-23/sweep.json
docs/handoffs/persona-sweep-2026-06-23/shots/*.png
docs/persona-audit-2026-06-23/
docs/live-smoke-test-evidence-log.md
docs/proof-collection-runbook.md
```

Production-applied migrations now represented in the repo:

- `supabase/migrations/00051_fix_funnel_active_learner.sql`
- `supabase/migrations/00052_resource_download_metrics_view.sql`
- `supabase/migrations/00053_resource_downloaders_scorecard.sql`

Local migrations that must be applied/verified for the 100-persona production
proof gate:

- `supabase/migrations/00054_assessment_drafts.sql`
- `supabase/migrations/00055_assessment_draft_reminders.sql`
- `supabase/migrations/00056_paid_reengagement_events.sql`
- `supabase/migrations/00057_ai_usage_pii_audit.sql`
- `supabase/migrations/00058_extend_assessment_draft_ttl.sql`

Do not run `git reset --hard` or delete ignored artifacts unless the owner
explicitly decides this local work should be discarded.

Recommended PR scope from this handoff: split the local work by functional risk
area rather than landing the entire 260-entry dirty tree as one change. Suggested
groups: launch docs/reviews, assessment resume/retention, buyer recovery/auth,
PDF/downloads/certificate verification, team/support intake, public demo/toolbox
usage, pricing/nav/security/copy, and course Module 3/certificate UX.

## Verification commands

Run these before handing to review:

```bash
git diff --check
npm run audit:secrets
npx tsc --noEmit --pretty false
npm test -- src/lib/admin/metric-exclusions.test.ts src/lib/support/metrics.test.ts
npm run lint
npm test
npm run build
npx playwright test e2e/dashboard-personas.spec.ts e2e/resource-delivery.spec.ts e2e/resources.spec.ts e2e/api-gates.spec.ts e2e/a11y.spec.ts --project=chromium
```

Run production env audit without committing pulled secrets:

```bash
tmpdir=$(mktemp -d)
chmod 700 "$tmpdir"
vercel env pull "$tmpdir/prod.env" --environment=production --yes
set -a
source "$tmpdir/prod.env"
set +a
VERCEL_ENV=production node scripts/audit-env.mjs --strict --production
rm -rf "$tmpdir"
```

Run live health checks:

```bash
curl -sS https://www.aibankinginstitute.com/api/health/stripe
curl -sS https://www.aibankinginstitute.com/api/health/email
curl -sS https://www.aibankinginstitute.com/api/health/supabase
```

Check MailerLite automation state via API using the Production
`MAILERLITE_API_KEY`:

```bash
curl -sS https://connect.mailerlite.com/api/automations?limit=100 \
  -H "Authorization: Bearer $MAILERLITE_API_KEY" \
  -H "Accept: application/json"
```

Required final MailerLite state:

- all four assessment automations exist
- all four are complete
- all four are enabled
- each has 3 email steps
- each has correct tier trigger group

## Supabase migration notes

`supabase db push --linked` is currently not a reliable path in this repo
because remote migration history includes older timestamped migrations that are
not represented in the local numeric migration directory. Do not repair the
whole historical migration table casually.

For a reviewed numeric migration that must be applied before the migration
history is cleaned up, the current practical path is:

```bash
supabase db query --linked --file supabase/migrations/000NN_name.sql
supabase migration repair --linked --status applied 000NN
```

Use this only after reviewing the SQL and confirming it is safe/idempotent.

`00051`, `00052`, and `00053` are already applied to production through the
direct-query path above. Local migrations now run through `00058`. Keep the
applied files in the next reviewed PR, apply/repair `00054`-`00058` only after
reviewing them, and reconcile migration history before relying on
`supabase db push --linked` again.

## Final go/no-go

Code and infrastructure are close enough for controlled live smoke testing.
They are not ready for broad paid promotion until all of these are true:

- MailerLite automations complete and enabled.
- One live free assessment smoke test passes.
- One live paid In-Depth smoke test passes.
- One live Foundation purchase smoke test passes.
- Full refund revocation is proven.
- Stripe dashboard shows `2xx` webhook deliveries for the smoke events.
- Supabase migrations through `00058` are applied/verified and
  `/api/health/supabase` is `ok:true`.
- 100-persona production proof is complete: personalized PDFs, gated downloads,
  buyer recovery, stranded-buyer cron, retention cron, team lead capture,
  public demo model call/rate-limit/PII behavior, certificate lookup/print, and
  support access-rescue/refund timeline logging.
- Outbound pilot operating setup is complete if cold outreach is used:
  suppression list, unsubscribe path, sending domain/inbox plan, UTMs, source
  rules, and stop thresholds.
- One named top-of-funnel channel is secured; otherwise revenue targets remain
  planning math.
- Founder/advisor attribution remains deferred across live copy, or approved
  names are populated without unsupported trust claims.
- Foundation purchase page secondary links for undecided buyers are deployed
  and live-verified.
- Dirty local work is committed into reviewed PRs or intentionally discarded by
  the owner.
