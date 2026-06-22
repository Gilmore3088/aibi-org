# Launch finalization checklist

The single actionable list of what remains to take the funnel + nurture work
fully live. Code/content work is done and merged (see "Shipped"); everything
below either requires a dashboard, an env var, or a business decision.

Last updated: 2026-06-22.

## Shipped (merged to `main`)

| PR | What |
|----|------|
| #509 | Derived funnel reporting views (`funnel_scorecard`, `funnel_stage_distribution`, `funnel_contacts`) — applied to the DB. See [funnel reporting](funnel-reporting.md). |
| #510 | Gated `/admin/funnel` dashboard + [paid buyer support runbook](paid-buyer-support-runbook.md). |
| #511 | 12 assessment nurture emails rebranded to brand v1 + marketing-review fixes. |

MailerLite automation **subjects** for all 12 steps were also set via API.

## Remaining steps (by owner)

### MailerLite dashboard — operator (~30–40 min)
The API cannot author automation email HTML, so the bodies are pasted by hand.
Run a local preview to copy each one: `python3 -m http.server 8791 --directory .`
from the repo root, then open `http://localhost:8791/docs/mailerlite-emails/index.html`.

- [ ] For each of the 4 tier automations (Starting Point, Early Stage, Building Momentum, Ready to Scale), paste the 3 matching email bodies (Design email → Use HTML editor → paste → save).
- [ ] Set each step's **Preview text** field to the hidden preheader line at the top of its HTML.
- [ ] Authenticate the sending domain (MailerLite → Settings → Domains) — 9 of 12 steps reported `needs_domain_auth`.
- [ ] Verify the cadence is day 0 / 3 / 7 on each automation.
- [ ] Enable all 4 automations.
- [ ] Send a test of each tier to confirm `{$score}` / `{$profile_id}` resolve and the result link works.

### Vercel env — owner (never set by the agent)
- [ ] `FUNNEL_ADMIN_EMAILS` = operator email(s), Production scope. Until set, `/admin/funnel` is inaccessible (fail-closed).
- [ ] `OPS_ALERT_WEBHOOK_URL` or `OPS_ALERT_EMAIL`, then run the `/api/ops/alert-test` curl (see [paid buyer support runbook](paid-buyer-support-runbook.md)) once that code merges.

### Secrets — no action required
The `npm run audit:secrets` failure is a **false positive**: the scanner walks the
whole working tree and flags real keys in `.env.local`, which is gitignored and
**was never committed** (verified against full git history). No leak, no rotation
needed. Fix in the (currently uncommitted) `scripts/scan-secrets.mjs`: enumerate
committable files instead of walking the FS —
`git ls-files --cached --others --exclude-standard`.

### Business / content decisions — owner
- [ ] Name a top-of-funnel channel (GTM red-team item).
- [ ] Provide approved founder/advisor names + attribution before any trust/testimonial copy ships.

### Uncommitted root-tree work — owner
`scripts/scan-secrets.mjs`, `package.json` (`audit:secrets`), `/api/ops`,
`OPS_ALERT_*`, `TrustAnchor.tsx`, team-assessment self-serve, etc. are
uncommitted in the working tree — commit/PR them from that stream.

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
- Numbers: Supabase SQL editor → `select * from funnel_scorecard;` (also `funnel_stage_distribution`, `funnel_contacts`). Revenue $ lives in Stripe.
- Browser: `/admin/funnel` once `FUNNEL_ADMIN_EMAILS` is set.
- Full reference: [funnel reporting](funnel-reporting.md).
