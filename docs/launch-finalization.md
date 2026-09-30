# Launch finalization checklist

The single actionable list of what remains to take the funnel + nurture work
fully live. Everything below is verified against the live MailerLite account,
the deployed app, and `main` — not aspirational.

Last updated: 2026-09-30. Prior version (2026-06-23) described the pre-August
state and is superseded; see git history.

## Shipped and verified (as of 2026-09-30)

**Code (all on `main`, deployed via Vercel):**

- SR 26-2 regulatory sweep: every model-risk citation re-anchored on SR 26-2
  (supersedes SR 11-7, Apr 2026); FDIC efficiency citation refreshed to QBP
  Q1 2026; FS AI RMF added to anchors. (#569)
- Claims governance: `content/claims/registry.json` (14 verified claims with
  review-by dates) + `scripts/check-claims.mjs` CI gate (`Claims` workflow)
  + monthly re-verification routine.
- `resource_category` written to MailerLite on resource capture
  (`src/lib/mailerlite/resource-category.ts`), so the five resource segments
  populate from real traffic.
- Purchase exit signals: Stripe webhook marks `purchased_in_depth` /
  `foundation_enrolled` date fields on the subscriber after checkout.
- Deliverability loop: `/api/webhooks/mailerlite` records bounce / spam /
  unsubscribe onto `leads` (webhook registered and enabled in MailerLite;
  `MAILERLITE_WEBHOOK_SECRET` set in Vercel).
- Dependency train through 2026-08-10 (#566, #565, #567, #559) plus the
  eslint-config-next lint-crash fix and Stripe API pin.

**MailerLite account:**

- 9 automations built: 4 assessment (Day 0/3/7/14) + 5 resource (Day 1/4/8/14).
- All 37 email bodies pasted as custom HTML; subjects set; preheaders blank
  by design (HTML carries its own).
- 5 resource segments created **with** `resource_category` filter rules;
  resource automation triggers bound to them.
- Custom fields in place: `score`, `tier_label`, `profile_id`,
  `lowest_dimension`, `resource_category`, `purchased_in_depth`,
  `foundation_enrolled`, lead-source fields.
- Sending domain authenticated.
- Test batches for all 9 automations delivered to hello@aibankinginstitute.com
  (Aug 10–15).

**Monitoring:**

- Weekly engagement digest (Mondays) and monthly claims re-verification
  routines active. Funnel views live at `/admin` and `/admin/funnel`.

## Remaining before enable — operator (dashboard, ~10 min)

Verified still outstanding on 2026-08-15 (re-verify before enabling):

- [ ] Starting Point Day 0 subject → `Your assessment result: Starting Point`
      (holds Day 7's subject — swapped during an API repair; fix in the
      dashboard ONLY, the connector's subject tool destroys pasted bodies).
- [ ] Starting Point Day 7 subject → `Three board-ready AI numbers`.
- [ ] Starting Point final delay 5 → 7 days (so Day 14 lands on day 14);
      glance at the same delay in the other three assessment automations.
- [ ] Review the delivered test emails in hello@: rendering, full
      "[Ai] Banking Institute" wordmark, unsubscribe/address footer present.
- [ ] Exit conditions per automation: assessment stop on `purchased_in_depth`
      or `foundation_enrolled` set; resource additionally stop when
      `tier_label` is set.
- [ ] **Enable** the automations (assessment 4 live immediately; resource 5
      idle until traffic).

## Remaining after enable — owner

- [ ] Live-money smoke tests (`docs/manual-verification-runbook.md`): free
      assessment end-to-end, gated resource download (proves
      `resource_category` → segment), In-Depth $99 purchase (proves
      `purchased_in_depth`), Foundation $295 purchase (proves
      `foundation_enrolled`), full + partial refund behavior.
- [ ] Business decisions: top-of-funnel channel (blocks real traffic);
      founder-attribution sign-off (emails ship signed "— James"); Stripe
      live-key rotation decision.
- [ ] Start traffic per the 90-day GTM plan; watch `/admin/funnel` and the
      Monday digest.

## Engineering backlog (parallel, non-blocking)

- Free-assessment re-base onto the canonical 8-dimension framework —
  `Plans/free-assessment-rebase-plan-2026-08-10.md`, gated on owner decisions
  D1–D3.
- Next.js 16 migration: held dependabot PR (currently #584; #568 superseded).
  Real migration: Turbopack rejects a malformed `globals.css` rule,
  `middleware` → `proxy` codemod, full QA. Carries the sharp security bump.
- TypeScript 7 major bump (#574) — evaluate with the Next 16 work.
- Dependabot backlog accumulated while the claims gate was red (Sept 10–30);
  rebase and merge the green ones after the gate fix lands.

## Reference

- Full email paste console (37 emails, previews + copy buttons): private
  operator artifact; ask Claude for the current link.
- Nurture build detail: `docs/nurture-build/DASHBOARD-RUNBOOK.md`.
- Email system map: `docs/email-campaign-map.md`.
- Funnel reporting: `docs/funnel-reporting.md`.
