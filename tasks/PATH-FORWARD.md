# Path Forward — what to do next

Living action list. Updated **2026-05-18** after the multi-agent audit session.

**One canonical source of "what's next."** Atomic checkboxes still live in their source files (`launch-checklist.md`, `aibi-p-to-foundation-deploy-checklist.md`, `todo.md`). This doc tells you what to attack and in what order.

**Current open counts:** launch-checklist 442 / 524 · aibi-p rollout 14 · perf 19 · backlog 52.

Tag legend:
- 🔒 **You-only** — needs your dashboard, decision, or credentials
- 🤖 **Autonomous** — agent can do without you (most gated on 🔒 first)
- 🤝 **Collaborative** — agent builds, you verify (mailbox, dashboard)

---

## 🚦 The next 3 actions (highest unblock ratio)

Do these first. They block the bulk of remaining work.

| # | Task | Why first | Unlocks |
|---|------|-----------|---------|
| **1** | 🔒 **Pull Supabase env keys to `.env.local`** (U.1) — service role + anon + URL | Without these, agent can't run Playwright e2e (§3–§8 — 200+ tests blocked) | §3 auth, §4 free, §5 in-depth, §6 purchase, §7 modules, §8 exam, §19 cross-browser |
| **2** | 🔒 **Fix the 4 Supabase Auth email templates** (U.6 / §2.23–.26) — change `next=/dashboard` → `{{ .RedirectTo }}` per 2026-05-10 handoff | Without this, signup confirm + magic link + password reset + email change are broken in prod | §2 (all), §9 email round-trips, real signups |
| **3** | 🔒 **Verify DNS + SSL on apex + www + .org redirect** (U.4 / §1.11–.14) | Production traffic can't land until this is right | §20 launch-day smoke |

After those three, ~75% of remaining §3–§19 work becomes autonomous.

---

## 🔒 Operator-only — launch-blocking

Grouped by dashboard so you can batch context switches.

### Vercel dashboard
- [ ] U.1 Pull Supabase env keys to `.env.local`
- [ ] U.2 Rotate `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAILERLITE_API_KEY` + mark Sensitive (§1.5–.8)
- [ ] U.3 `vercel env ls` to verify all expected names present (§1.9)
- [ ] U.5 (optional) Password-protect staging preview (§1.17)
- [ ] Add `STRIPE_FOUNDATION_PRICE_ID` + `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` (same values as `STRIPE_AIBIP_*` — Foundation rollout Step 3)

### Supabase dashboard
- [ ] U.6 Fix the 4 Auth email templates → `{{ .RedirectTo }}` pattern (§2.23–.26)
- [ ] Site URL = `https://www.aibankinginstitute.com` (§2.27)
- [ ] Additional Redirect URLs include www, apex, localhost, staging (§2.28)
- [ ] SMTP sender = `hello@aibankinginstitute.com` (lowercase) (§2.29)
- [ ] Apply migration `00028_add_foundation_product_value.sql` (Foundation rollout Step 2)
- [ ] After 24h deploy gap, apply migration `00029_backfill_foundation_product.sql` (Step 7)
- [ ] Smoke-test signup → confirm → /dashboard, magic-link, password reset, email change (§2.30–.34)

### Stripe dashboard
- [ ] U.7 Foundation product display name = `AiBI-Foundation Course`
- [ ] In-Depth product display name = `In-Depth Assessment`
- [ ] Foundation description mentions "lifetime access"
- [ ] Statement descriptors banker-readable
- [ ] Metadata: `canonical_slug=foundation`, `legacy_slug=aibi-p`
- [ ] Deactivate "myproduct" test stray (§18.476)
- [ ] Verify production products renamed (§18.475)

### Resend dashboard
- [ ] U.9 Review + fix 5 template bodies for "AiBI-Practitioner" / "AiBI-P":
  - [ ] `assessment-results-breakdown`
  - [ ] `course-purchase-individual`
  - [ ] `course-purchase-institution`
  - [ ] `certificate-issued`
  - [ ] `inquiry-ack`

### MailerLite dashboard
- [ ] U.8 Recreate 5 automations from `src/lib/mailerlite/email-content.ts` if any reference AiBI-P:
  - [ ] Newsletter welcome
  - [ ] Starting Point sequence
  - [ ] Early Stage sequence
  - [ ] Building Momentum sequence
  - [ ] Ready to Scale sequence

### DNS / SSL
- [ ] U.4 Apex + www A/AAAA → Vercel; `.org` 301 → `.com`; SSL valid on both (§1.11–.14)
- [ ] Canonical = www (§1.15)

### Search Console + observability
- [ ] Submit sitemap to Google Search Console (§14.411)
- [ ] Submit sitemap to Bing Webmaster Tools (§14.412)
- [ ] Verify both domains (§14.413)
- [ ] Set preferred domain (§14.414)
- [ ] Sentry / error tracking (§15.428)
- [ ] Slack alert on production 500 spike (§15.429)
- [ ] Stripe Radar fraud detection (§15.430)
- [ ] Supabase error-rate alerts >2% (§15.431)
- [ ] Vercel deployment notifications (§15.432)

### Data hygiene (Supabase queries)
- [ ] §18.469 Investigate `+alias` test rows in `auth.users`, clean up
- [ ] §18.473 Verify no test data in production `auth.users`
- [ ] §18.474 Verify no test data in production `course_enrollments`

### Decisions to close out
- [ ] U.10 `Plans/aibi-docs/` — promote, gitignore, or remove?
- [ ] U.11 Branch hygiene — `design-2.0` 90 ahead, `feature/brand-refresh` 37 behind — push, rebase, or delete?
- [ ] Wave C decision — drop Cormorant SC for Geist tracked-uppercase? (perf #144)
- [ ] §17.465 Keep `/lms-preview` as design reference or delete?
- [ ] §16.450 Pen-test — hire firm or skip pre-launch?
- [ ] `npx gitleaks detect --source .` (§16.433) — or accept the risk

### Customer comms (around launch day)
- [ ] Send AiBI-P → Foundation rename email to existing `course_enrollments`
- [ ] Raise 30-day in-app banner on `/dashboard` + `/courses/foundation/program/*`
- [ ] Pre-paste customer-support one-pager into Notion

### Final pre-launch (§20)
- [ ] Real-money test purchase + refund: Foundation $295 (§20.506)
- [ ] Real-money test purchase + refund: In-Depth $99 (§20.507)
- [ ] Calendly link on real iPhone Safari (§20.511)
- [ ] Stripe Checkout on real iPhone Safari (§20.512)
- [ ] Magic-link round-trip on real iPhone (§20.513)
- [ ] Backup/restore procedure for Supabase (§20.516)
- [ ] On-call rotation + escalation path (§20.517)
- [ ] Draft launch email (§20.518)
- [ ] Schedule launch send (§20.519)

---

## 🤖 Autonomous — launch-blocking (agent ready when unblocked)

| Section | Items | Gated on | Effort |
|---------|-------|----------|--------|
| §3 E2E auth flows | ~21 open | **U.1** Supabase env | 2–4h |
| §4 E2E free assessment | ~30 open | **U.1** + a few standalone | 3–5h |
| §5 E2E In-Depth | ~38 open | **U.1** + Stripe test mode | 4–6h |
| §6 E2E course purchase | 25 open | **U.1** + Stripe test mode | 3–4h |
| §7 E2E course modules | 60 open | **U.1** + seeded enrollment | 6–8h |
| §8 E2E exam + cert | 35 open | **U.1** + `exam_results` schema | 3–5h |
| §10 E2E marketing pages | 30 open | None — agent can start now | 2–3h |
| §11.508 Deployed-HTML banned-word grep | 1 item | Prod deploy of latest main | 5 min |
| §12 A11y manual VoiceOver + auth-gated routes | manual + 3 routes | None for routes | 30 min routes |
| §19 Cross-browser matrix | 25 open | **U.1** for authed flows | 2–3h |

---

## 🤝 Collaborative — agent writes, you verify

- C.1 §9 Email round-trip tests — agent writes test code, you confirm emails land in inbox
- C.2 §15 Analytics — agent adds event-firing code, you set up dashboards
- C.4 Any push to `main` — agent needs your explicit approval each time (CLAUDE.md)
- **C.5 Free assessment post-deploy QA (PR [#172](https://github.com/Gilmore3088/aibi-org/pull/172) shipped 2026-05-18)** — see `tasks/_done/free-assessment-output-revision.md` Ship-gate § for the four 🔒 HUMAN actions:
  - H1 Walk all four tier results on `/assessment` (desktop + iPhone Safari)
  - H2 Walk all four tier PDFs at `/assessment/results/print/<id>` — verify page numbering 1–14, cover report card, no orphaned hairlines
  - H3 Confirm Plausible fires `purchase_initiated · source: 'free-results-primary'` on Foundation CTA click
  - H4 Production smoke after Vercel deploy completes

---

## 📦 Initiative groupings

### Launch (§1–§20 punch list)
- 442 of 524 open in [`launch-checklist.md`](./launch-checklist.md)
- Biggest unblock: **U.6 Supabase Auth templates** (~15 min → unblocks signup flow)

### AiBI-P → AiBI-Foundation external rollout
- Code shipped; 14 operator items remain in [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md)
- Hard rule: **24-hour gap between Step 4 deploy and Step 6 Stripe rename** so in-flight Checkout Sessions expire safely

### Performance (post-2026-05-18)
- 19 of 79 open
- **All Lighthouse gates HIT on production:** Perf 98 · LCP 2.44s · FCP <1s · TBT 0 · CLS 0
- Remaining mostly measurement: Wave B Early Hints, Wave C Cormorant SC decision, E.7 static `/`, E.8 Tailwind audit
- Audit: [`docs/reviews/lighthouse-2026-05-18.md`](../docs/reviews/lighthouse-2026-05-18.md)

### Brand refresh (Ledger migration)
- 174 files still reference Terra/Sage/Cobalt tokens
- Final consolidation (delete `tokens.css`, rename `tokens-ledger.css`) gated on full migration
- See [`docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md`](../docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md)

### Phase 2 backlog (post-launch — 52 items in [`todo.md`](./todo.md))
- #155 Phase 1.5 data loop (after ~50 respondents)
- #156 Phase 2 peer benchmarks (after ~200 respondents)
- #157 Polish & parity sprint
- #158 Sandbox phase 2 multi-provider
- #159 AiBI-S sandbox exercises (6 weeks)
- #160 AiBI-L sandbox exercises (4 sessions) + shared infra
- #161 Marketing / templates backlog

---

## ✅ Verified clean / shipped this session (2026-05-17 → 2026-05-18)

| Area | Status | PRs / commits |
|------|--------|---------------|
| §11 Brand audit (code-grep + preview-home soft finding) | ✅ Clean | #169 |
| §12 A11y baseline + 3 routes added | ✅ 10/10 axe routes pass | #169 |
| §13 Lighthouse on 5 marquee routes | ✅ All gates hit | #171 |
| §14 SEO — sitemap, canonicals, OG, JSON-LD, per-page metadata | ✅ Structural complete | #165, #167, #173 |
| §15 Analytics call sites | ✅ `briefing_booked` + `certificate_issued` wired | #165 |
| §16 Security — rate limits + CSP enforced + audit doc | ✅ Code clean | #165, #166, #168 |
| §17 LMS reskin code | ✅ All earlier PRs merged | #51–#56, #64, #65 |
| §18.468 PDF libnss3 | ✅ Chromium v148 + shell-headless rewrite | main 2026-05-18 |
| §18.470, .471, .472, .477 | ✅ Ticked (resolved or stale) | — |
| Perf Wave A / A+ / A4 + E.1 + E.4 + L (sideEffects tree-shake) | ✅ Shipped | #171 + earlier |
| Free-assessment output revision (5 tracks) | ✅ Shipped | #172 |
| Foundation rename code | ✅ Shipped earlier in session | — |

---

## Update protocol

When you finish a 🔒 item, tick it here AND in its source file.

When something new surfaces, append it under "Triage" — sort it into the right section later.

## Triage

(Add new items here as they come up.)
