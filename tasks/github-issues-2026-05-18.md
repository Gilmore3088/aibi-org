# GitHub Issues — 44-Issue Sweep · 2026-05-18

Canonical local tracker for the 44 open GitHub issues as of 2026-05-18.
Companion to [`docs/handoffs/uat-2026-05-18.md`](../docs/handoffs/uat-2026-05-18.md) — the UAT checklist that lists every shipped fix for manual verification after deploy.

**Strategy:** one branch per issue cluster (per 2026-05-18 decision). Each cluster closes a group of related issues in a single PR. Order is roughly small/safe → larger/risky to build momentum and let the user merge incrementally.

**Legend:**
- 🤖 **Autonomous** — I can ship without user action
- 🔒 **You-only** — Requires dashboard/credentials/manual QA the user must do
- 🤝 **Collaborative** — I build, user verifies on a real device or dashboard
- ✅ Closed · 🟡 In progress · ⬜ Not started · ⏸️ Parked / deferred

---

## Wave 0 · Housekeeping (close stale + park Phase 2)

These issues don't need code — they're closures of already-shipped work or Phase 2 backlog that should be labelled/closed so the count stops weighing on the active surface.

| # | Title | Action | Status |
|---|-------|--------|--------|
| 153 | Free Assessment Output Revision — 5 tracks | Close — shipped as PR #172 (squash `028c8b0`) | ⬜ |
| 155 | Phase 1.5 — Data loop (post first 50 respondents) | Confirm Phase 2 label; leave open OR close-as-backlog | ⬜ |
| 156 | Phase 2 — Real peer benchmarks | Confirm Phase 2 label; leave open OR close-as-backlog | ⬜ |
| 157 | Polish & Parity sprint | Confirm Phase 2 label; leave open | ⬜ |
| 158 | Sandbox Phase 2 — multi-provider | Confirm Phase 2 label; leave open | ⬜ |
| 159 | Sandbox Phase 3 — AiBI-S exercises | Confirm Phase 2 label; leave open | ⬜ |
| 160 | Sandbox Phase 3 — AiBI-L exercises | Confirm Phase 2 label; leave open | ⬜ |
| 161 | Marketing & templates backlog | Confirm Phase 2 label; leave open | ⬜ |

---

## Wave 1 · Small autonomous fixes (cluster: `fix/copy-and-chrome-2026-05-18`)

Quick wins. Mostly copy, spacing, visual polish. Aim: single PR, < 200 lines.

| # | Title | Type | Mode | Status |
|---|-------|------|------|--------|
| 192 | Copy: "password forgot?" → "Forgot password?" | Copy fix | 🤖 | ⬜ |
| 186 | Hero: tighten vertical spacing H1↔subtitle | CSS tweak | 🤖 | ⬜ |
| 185 | Top nav: remove transparency (bleed-through bug) | CSS fix | 🤖 | ⬜ |
| 188 | Homepage: rewrite "Run your own numbers" section | Copy | 🤖 | ⬜ |
| 191 | Top-nav ticker: confirm wiring + canonical source | Audit + maybe wire | 🤖 | ⬜ |

---

## Wave 2 · Audit follow-ups (cluster: `chore/audit-followups-2026-05-18`)

The four 2026-05-18 audit-wave residuals. Mostly verification + small fixes.

| # | Title | Mode | Status |
|---|-------|------|--------|
| 177 | SEO follow-ups (2026-05-18 audit) | 🤖 | ⬜ |
| 178 | Security follow-ups (2026-05-18 audit) | 🤖 | ⬜ |
| 179 | Lighthouse follow-ups (2026-05-18 audit) | 🤖 | ⬜ |
| 180 | §18.468 — Production smoke confirmation for PDF Vercel fix | 🔒 (user smoke-test on prod) | ⬜ |

---

## Wave 3 · Free Assessment + Newsletter wiring (cluster: `feat/email-capture-fixes`)

Launch blockers that touch real user flows. Larger changes; need careful QA.

| # | Title | Mode | Status |
|---|-------|------|--------|
| 189 | Free Assessment: gate full report behind email | 🤖 + 🤝 QA | ⬜ |
| 190 | AI Banking Brief: fix subscribe form + wire list | 🤖 + 🔒 ConvertKit list ID | ⬜ |

---

## Wave 4 · Dashboard + toolbox (cluster: `feat/toolbox-and-playground`)

Builds the in-product surface. Medium-size, mostly autonomous but needs design alignment.

| # | Title | Mode | Status |
|---|-------|------|--------|
| 182 | Build /playground?tool= destination | 🤖 | ⬜ |
| 183 | Port v5 visual to /dashboard/toolbox | 🤖 | ⬜ |
| 184 | Real tool content for Lender / Branch / Compliance kits | 🤝 (content from user) | ⬜ |

---

## Wave 5 · Auth replacement (cluster: `feat/auth-email-password-2026-05-18`)

The biggest single item. Replaces Supabase magic-link with email+password (+ Microsoft SSO?). Touches every signup/login surface.

| # | Title | Mode | Status |
|---|-------|------|--------|
| 187 | Auth: replace magic-link with B2B-appropriate flow | 🤖 build + 🔒 Supabase Auth config + 🤝 QA | ⬜ |

---

## Wave 6 · Launch-checklist closeouts (cluster: per-section branches)

Section-by-section close of remaining `tasks/launch-checklist.md` items. These mirror the existing local task file; the GitHub issues are pointers, not separate work.

| # | Title | Cluster | Mode | Status |
|---|-------|---------|------|--------|
| 132 | §1 Infrastructure + env (items 1–22) | `chore/launch-§1` | 🔒 (Vercel + DNS) | ⬜ |
| 133 | §2 Supabase Auth template fixes (items 23–37) | `chore/launch-§2` | 🔒 (Supabase dashboard) | ⬜ |
| 134 | §3 E2E auth flows (items 38–90) | `test/e2e-§3` | 🤖 (after #132) | ⬜ |
| 135 | §4 E2E free assessment (items 88–127) | `test/e2e-§4` | 🤖 (after #132) | ⬜ |
| 136 | §5 E2E In-Depth Assessment (items 128–167) | `test/e2e-§5` | 🤖 (after #132) | ⬜ |
| 137 | §6 E2E course purchase + enrollment (items 168–192) | `test/e2e-§6` | 🤖 (after #132) | ⬜ |
| 138 | §7 E2E course modules + activities (items 193–252) | `test/e2e-§7` | 🤖 (after #132) | ⬜ |
| 139 | §8 E2E Foundation exam + certificate (items 253–287) | `test/e2e-§8` | 🤖 (after #132) | ⬜ |
| 140 | §9 E2E email/transactional templates (items 288–312) | `test/e2e-§9` | 🤖 + 🔒 Resend templates | ⬜ |
| 141 | §10 E2E marketing pages (items 313–342) | `test/e2e-§10` | 🤖 | ⬜ |
| 142 | §11 Brand & copy audit (items 343–362) | `chore/brand-copy-§11` | 🤖 | ⬜ |
| 143 | §12 A11y audit (items 363–387) | `chore/a11y-§12` | 🤖 | ⬜ |
| 144 | Performance optimization (Waves A leftover → E.10) | _existing perf plan_ | 🤖 | ⬜ |
| 146 | §15 Analytics — briefing_booked + certificate_issued | `feat/analytics-§15` | 🤖 | ⬜ |
| 148 | §17 LMS reskin final cleanup | `chore/lms-§17` | 🤖 | ⬜ |
| 149 | §18 Bug fixes — PDF warm, migration, prod hygiene | `chore/launch-§18` | 🤖 + 🔒 | ⬜ |
| 150 | §19 Mobile + cross-browser testing matrix | `test/mobile-§19` | 🤝 (real device QA) | ⬜ |
| 151 | §20 Final pre-launch — smoke, stress, comms | `chore/launch-§20` | 🔒 (operator final) | ⬜ |
| 152 | AiBI-P → AiBI-Foundation external rollout | `_existing aibi-p plan_` | 🔒 (Stripe/Resend/MailerLite) | ⬜ |
| 162 | 📌 Master tracker | _epic; not closed until §1–§20 done_ | n/a | ⬜ |
| 154 | /research page redesign — break into tasks | `plan/research-redesign` | 🤖 (planning only) | ⏸️ Phase 2 |

---

## Counts

- **Total open:** 44
- **Wave 0 housekeeping:** 8 (closure / label-only)
- **Wave 1 small fixes:** 5
- **Wave 2 audit follow-ups:** 4
- **Wave 3 email capture:** 2
- **Wave 4 toolbox:** 3
- **Wave 5 auth replacement:** 1
- **Wave 6 launch-checklist:** 21

## Cluster branch map

| Cluster branch | Issues | Status |
|----------------|--------|--------|
| `chore/issue-tracking-2026-05-18` | tracker + UAT scaffolding | 🟡 this branch |
| `fix/copy-and-chrome-2026-05-18` | #185, #186, #188, #191, #192 | ⬜ |
| `chore/audit-followups-2026-05-18` | #177, #178, #179, #180 | ⬜ |
| `feat/email-capture-fixes` | #189, #190 | ⬜ |
| `feat/toolbox-and-playground` | #182, #183, #184 | ⬜ |
| `feat/auth-email-password-2026-05-18` | #187 | ⬜ |
| _launch-§N branches as we get to them_ | #132–#152 | ⬜ |

---

## Process notes

- **Update this file as the source of truth.** Tick each row when the PR merges.
- **GitHub issue tick:** when you close the GitHub issue, drop a one-line comment with the PR number (or "closing as backlog — see `tasks/todo.md` Phase 2 section").
- **UAT row:** every shipped fix gets a checkbox in `docs/handoffs/uat-2026-05-18.md` so post-deploy verification is one document, not 44.
- **🔒 surfacing:** every operator-only step needs paste-ready instructions in this file before the cluster PR opens. No "go figure out Supabase" handoffs.
