# Handoff — 2026-05-21 — Operator Punch-List + Recap

**For:** the operator (James) and a desktop agent picking this up cold.
**Companion to:** [`launch-readiness-2026-05-20.md`](./launch-readiness-2026-05-20.md) (the scoreboard) — this doc is the *action list* one day later, after the PR consolidation.

Status legend: ✅ done · 🟡 partial / in flight · ⛔ blocked · 🔧 operator-only (no engineer/agent can close it)

---

## 0. State of play — read this first

- **PR #254** is open: `claude/security-audit-checklist-Qfx5k` → `main`. It is the **single integration branch** that consolidates the scattered open PRs (#234 token sweep, #252 program/page split, #235 a11y/brand/perf sweep, #223 marketing E2E) plus this session's security + E2E work. `tsc` clean, `npm run build` ✓ (147 pages).
- **One Vercel preview** covers the whole bundle (not five separate previews):
  `https://aibi-org-git-claude-sec-af1be3-james-gilmores-projects-72eaae09.vercel.app`
  ⚠️ Preview shares the **production Supabase** (by design — no separate DB). Email/PDF side-effects are suppressed via `SKIP_*` flags, but form submits write live rows. QA accordingly.
- **Merging #254 to `main` is an operator action** (production deploy) and needs explicit approval. Plan: QA on the preview → merge → it auto-closes the sub-PRs.
- **PR #253** (unsolicited external-fork PR against the paid toolbox) — **closed**.
- **HELD BACK, do not merge yet:** PR **#224** (Starter Toolkit tier). Its code reads `entitlements.tier`, which is created by migration **`00035_entitlements_tier_and_indepth.sql`**. That migration must be applied to Supabase **first** (preview shares prod, so it breaks both otherwise); then #224 folds in cleanly ahead of cert migration `00036`. The dead Plausible event calls in `ToolboxApp.tsx` also live in #224 — re-wire-to-Vercel-or-drop is part of that PR's review.
- **Next.js 15 upgrade:** reverted — it regresses PDF generation (security review F1).

---

## PART 1 — OPERATOR PUNCH-LIST (only you can do these)

Ordered by leverage. None of these are code; they live in external dashboards or on a real device.

### 🔧 1. Supabase Auth email templates — *highest leverage* (#133, ~15 min)
The single biggest unblock: it ungates the entire authenticated experience and the §3/§9 E2E suites.
- [ ] In Supabase dashboard, edit all four templates to use the `{{ .RedirectTo }}` pattern (not hardcoded `next=/dashboard`):
  - Confirm Signup · Magic Link (`type=magiclink`) · Reset Password (`type=recovery`) · Email Change (`type=email_change`)
  - Reference for the exact pattern: `docs/handoffs/handoff-2026-05-10.md`.
- [ ] Auth → URL config: Site URL = `https://www.aibankinginstitute.com`; Additional Redirect URLs include `https://aibankinginstitute.com/*`, `https://www.aibankinginstitute.com/*`, `http://localhost:3000/*`, and the Vercel preview pattern.
- [ ] Custom SMTP uses the verified Resend sender `hello@aibankinginstitute.com` (lowercase exact).
- [ ] Verify Auth rate limits match expected production volume.
- [ ] Smoke-test all five round-trips: signup→confirm→/dashboard · signup `?next=/assessment/in-depth/take` · password reset · magic link · email change.
- *(Code follow-up after this lands: item 37 — document the RedirectTo-vs-SiteURL pattern in CLAUDE.md so it can't regress. An agent can do this once you confirm the final template text.)*

### 🔧 2. DNS + SSL live (#132)
- [ ] `aibankinginstitute.com` + `www` resolve and serve over HTTPS via Vercel; `.org` 308→`.com`.
- [ ] Confirm against `docs/env-vars.md` (the env audit) that Vercel Production env matches; never edit env vars from code.

### 🔧 3. Email sequences — MailerLite, not ConvertKit (#152, #161)
The MVP gate text still says "ConvertKit"; the code is **MailerLite + Resend** now (see CLAUDE.md env block, corrected 2026-05-20).
- [ ] MailerLite Day 0 / 3 / 7 assessment sequences active; groups `MAILERLITE_GROUP_ID_ASSESSMENT` / `_NEWSLETTER` populated.
- [ ] Resend verified sender confirmed; transactional assessment-breakdown email tested end-to-end.

### 🔧 4. AiBI-P → AiBI-Foundation external rollout (#152)
The codebase rename is done; the **external systems** still say the old name.
- [ ] Stripe: product/price names → "AiBI-Foundation"; confirm `STRIPE_FOUNDATION_PRICE_ID` / `_INSTITUTION_PRICE_ID` / `STRIPE_INDEPTH_PRICE_ID` (note: `INDEPTH`, no underscore).
- [ ] Resend / MailerLite template copy updated to "AiBI-Foundation".
- [ ] Vercel env names reconciled against `docs/env-vars.md`.

### 🔧 5. Calendly + a live transaction (#151)
- [ ] Executive Briefing Calendly link tested on **real iPhone Safari**.
- [ ] One **live purchase + refund** through Stripe (In-Depth $99 and/or Foundation $295) to confirm webhook → `course_enrollments` → enrollment gate.
- [ ] Full assessment completed on a real iPhone in **under 3 minutes**.

### 🔧 6. Observability / alerting tail (#146 #428–432, #149, #178, #180)
- [ ] Sentry (or chosen stack) installed + DSN in env · Slack alert on 500 spike · Stripe Radar fraud rules · Supabase error-rate alert (>2%) · Vercel deploy notifications.
- [ ] #180: confirm the PDF Linux fix in **production** (smoke a real certificate PDF).
- *(Tell the desktop agent which observability stack you're standardizing on and it can do the Sentry code wiring; the dashboards are yours.)*

---

## PART 2 — DECISIONS NEEDED (block code work until you answer)

1. **#187 — Auth flow.** Keep magic-link, or move to email+password (B2B-appropriate) with optional Microsoft SSO and available MFA? This is a large standalone rewrite; scope it before an agent starts. Launch-blocker label, but arguably launch can ship on magic-link if templates (#133) are fixed — your call.
2. **#229 — Toolbox kits.** 3 of 4 starter kits are metadata-only (no real content). Decide: hide the three empty kits for launch, or fill them (SME-gated content — see #184). Launch-blocker because empty kits on a paid surface read as broken.
3. **#146 — Assessment-page briefing CTA (small).** `/assessment/page.tsx` does not fire `briefing_booked`. Three reconciliation passes say this is likely *intentional* (the assessment funnels to the email gate, not a briefing). Confirm "leave as-is" and #146's code portion can be ticked closed.

---

## PART 3 — GENUINELY-OPEN CODE (hand to the desktop agent)

All low-risk, no decision required, **post-launch-grade** (none on the launch-email critical path):

- **#240–#250** — LMS refactor series: behavior-preserving file splits, direct siblings of #239 (program/page.tsx) which shipped this session via PR #252. Same proven pattern. (#250 is likely exempt — pure-data file.)
- **#251** — onboarding bug: preserve original "Free tiers"/"None" selection for settings re-edit.
- **#236** — perf: dynamic-import `AIPracticeSandbox` to shrink the module-page bundle.
- **#237 / #179 / #143** — perf bar transform, Lighthouse follow-ups, axe a11y tests (partially addressed by PR #235 in #254 — verify before reopening scope).

**Stale / done — verify on the preview then close:** #146 (analytics, code complete), #239/#141/#135/#137/#138 (in #254), #238 (token sweep done), color portion of #233, parts of #132/#178/#179.

**Blocked on an input (don't start):** #134/#140 (need #133 + Supabase env in CI) · #136 (needs #224's `tier` column) · #139 (needs `exam_results` schema decision) · #148 (delete legacy `tokens.css` — wait until token migration fully lands) · #155/#156 (need production respondents) · #159/#160 (product decisions).

---

## PART 4 — SESSION RECAP (2026-05-21, what changed today)

1. **Consolidated five+ streams of work into one green integration branch** and opened **PR #254** (→ `main`). Resolved a real conflict in `src/app/dashboard/toolbox/ToolboxApp.tsx` (#234 Ledger tokens vs. #235 solid-paper/no-blur brand fix) by keeping **both**. Verified `tsc --noEmit` clean and `npm run build` ✓ (147 pages). Playwright specs compile but were **not executed** here (need a running app + Supabase).
2. **Closed PR #253** — unsolicited external-fork PR with boilerplate description targeting the paid toolbox; not merged.
3. **Reconciled the issue board against reality.** Key finding: the issue *count* overstates remaining engineering. The launch is gated by **operator tasks (#133, #132, #152, #151) and two decisions (#187, #229)** — not by a backlog of code. The open *code* (#240–#251) is polish.
4. Confirmed #146 is effectively done in code (`certificate_issued` fires server-side at `generate-certificate/route.ts:276`; `briefing_booked` wired at `ROICalculatorBody.tsx`, `BriefingButton.tsx`, `CompletionCTA.tsx`).

### Immediate next steps
1. QA the #254 preview (assessment funnel → `/courses/foundation/program` → `/dashboard/toolbox`).
2. Approve + merge #254 to `main` when satisfied.
3. Apply migration `00035` then bring in PR #224.
4. Work Part 1 punch-list (start with #133 — 15 minutes, biggest unblock).
5. Answer Part 2 decisions so the desktop agent can pick up Part 3.
