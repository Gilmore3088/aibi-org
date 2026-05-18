# GitHub Issues — 44-Issue Sweep · 2026-05-18

Canonical local tracker for the 44 open GitHub issues as of 2026-05-18.
Companion to [`docs/handoffs/uat-2026-05-18.md`](../docs/handoffs/uat-2026-05-18.md) — the UAT checklist that lists every shipped fix for manual verification after deploy.

**Live status (updated 2026-05-18 evening):** **6 issues closed**, **2 new issues opened** (#194 mobile umbrella + #197 Builders gold). Net open: ~40.

**Strategy:** one branch per issue cluster (per 2026-05-18 decision). Each cluster closes a group of related issues in a single PR. Order is roughly small/safe → larger/risky to build momentum and let the user merge incrementally.

**Legend:**
- 🤖 **Autonomous** — I can ship without user action
- 🔒 **You-only** — Requires dashboard/credentials/manual QA the user must do
- 🤝 **Collaborative** — I build, user verifies on a real device or dashboard
- ✅ Closed · 🟡 In progress · ⬜ Not started · ⏸️ Parked / deferred

---

## Wave 0 · Housekeeping (close stale + park Phase 2) · ✅ COMPLETE

| # | Title | Action | Status |
|---|-------|--------|--------|
| 153 | Free Assessment Output Revision — 5 tracks | Closed — shipped as PR #172 (squash `028c8b0`) | ✅ |
| 155–161 | Phase 2 backlog (data loop, peer benchmarks, polish, sandbox, AiBI-S/L exercises, marketing) | Kept open with `backlog` label per 2026-05-18 decision | ⏸️ |

---

## Wave 1 · Small autonomous fixes · ✅ MERGED (PR #195)

| # | Title | Type | Status |
|---|-------|------|--------|
| 192 | Copy: "password forgot?" → "Forgot password?" | Copy fix | ✅ |
| 186 | Hero: tighten vertical spacing H1↔subtitle | CSS tweak | ✅ |
| 185 | Top nav: remove transparency (bleed-through bug) | CSS fix | ✅ |

---

## Wave 1b · Homepage ROI section · ✅ MERGED (PR #196)

| # | Title | Status |
|---|-------|--------|
| 188 | Homepage: rewrite "Run your own numbers" — banker-friendly, outcome-led | ✅ |

---

## Wave 1c · Homepage Builders gold + responsive hero + /education accordion · ✅ MERGED (PR #200)

Filed mid-session in response to direct user feedback. Closes #197 (new); contributes heavily to #194 (new).

| # | Title | Status |
|---|-------|--------|
| 197 | Homepage hero: "Builders." legacy Terra → Ledger gold | ✅ |
| (part of) 194 | Hero SVG responsive on mobile (was clipped at "Turning B") | ✅ |
| (part of) 194 | Mobile renders HTML H1 instead of shrunken desktop SVG | ✅ |
| (part of) 194 | `/education` Models/Prompts/Skills/Agents panels stack on mobile | ✅ |
| (part of) 194 | `/education` accordion on mobile/tablet, tab+panel on desktop | ✅ |
| n/a | Remove "06 of many" count badges from /education panels | ✅ |
| 191 | Top-nav ticker — audit + content schema | ⬜ Not started (deferred from Wave 1) |

---

## Wave 2 · Audit follow-ups · ✅ PARTIAL (PR #199)

| # | Title | Status |
|---|-------|--------|
| 177 | SEO follow-ups (4 items) | ✅ Partial — gitleaks workflow + canonical on /assessment shipped. Per-route `openGraph.url` + Vercel env var = 🔒 operator-only |
| 178 | Security follow-ups (3 items, all 🔒) | ⬜ Open with status comment — RLS audit, pen test, security.txt review |
| 179 | Lighthouse follow-ups (3 items) | ⬜ Open with status comment — Ledger token migration partially shipped via PR #200. Newsreader subsetting + auth-gated CWV deferred |
| 180 | §18.468 — PDF prod smoke (🔒 single curl) | ⬜ Open with status comment + ready-to-run curl |

---

## Mobile foundations · 🟡 IN PROGRESS

### Phase 2 (system fixes) · ✅ MERGED (PR #198)

| Fix | Status |
|---|---|
| `.ledger-field input` font-size 14 → 16 (kills iOS Safari forced zoom on every form) | ✅ |
| ROI result tableau: `grid-cols-3` → `grid-cols-1 sm:grid-cols-3` with divide-y/sm:divide-x | ✅ |
| Explicit `viewport` export in `app/layout.tsx` | ✅ |

### Phase 2.5 (hero + /education panels) · ✅ MERGED (PR #200)

See Wave 1c above.

### Phase 3 (remaining) · ⬜ NOT STARTED

| Item | Affected files |
|---|---|
| Table overflow-x wrappers on 6 components | AIPracticeSandbox, LMS ContentTable, ProgramPage tables, AiBI-L ROI workbook, RadarChart, ToolboxApp |
| research.css fixed widths (240/260/300px) — add mobile fallbacks | `src/app/research/research.css` |
| briefing-preview.css fixed widths (170/300/1200px) | `src/app/briefing-preview/briefing-preview.css` |
| Touch-target audit (≥ 44×44px) on every `< 10.5px` mono-caps interactive element | site-wide |

### Audit harness · ✅ MERGED (PR #201)

Playwright viewport audit on 18 routes × 3 mobile widths. Non-blocking CI workflow. Screenshots in `mobile-viewport-screenshots` artifact on every PR.

---

## Wave 3 · Email capture wiring · ⬜ NOT STARTED

| # | Title | Mode | Status |
|---|-------|------|--------|
| 189 | Free Assessment: gate full report behind email | 🤖 + 🤝 QA | ⬜ |
| 190 | AI Banking Brief: fix subscribe form + wire list | 🤖 + 🔒 ConvertKit list ID | ⬜ |

---

## Wave 4 · Dashboard + toolbox · ⬜ NOT STARTED

| # | Title | Mode | Status |
|---|-------|------|--------|
| 182 | Build /playground?tool= destination | 🤖 | ⬜ |
| 183 | Port v5 visual to /dashboard/toolbox | 🤖 | ⬜ |
| 184 | Real tool content for Lender / Branch / Compliance kits | 🤝 (content from user) | ⬜ |

---

## Wave 5 · Auth replacement · ⬜ NOT STARTED

| # | Title | Mode | Status |
|---|-------|------|--------|
| 187 | Auth: replace magic-link with B2B-appropriate flow | 🤖 build + 🔒 Supabase Auth config + 🤝 QA | ⬜ |

---

## Wave 6 · Launch-checklist closeouts · ⬜ NOT STARTED

| # | Section | Mode | Status |
|---|---|------|--------|
| 132 | §1 Infrastructure + env | 🔒 (Vercel + DNS) | ⬜ |
| 133 | §2 Supabase Auth template fixes | 🔒 (Supabase dashboard) | ⬜ |
| 134 | §3 E2E auth flows | 🤖 (after #132) | ⬜ |
| 135 | §4 E2E free assessment | 🤖 (after #132) | ⬜ |
| 136 | §5 E2E In-Depth Assessment | 🤖 (after #132) | ⬜ |
| 137 | §6 E2E course purchase + enrollment | 🤖 (after #132) | ⬜ |
| 138 | §7 E2E course modules + activities | 🤖 (after #132) | ⬜ |
| 139 | §8 E2E Foundation exam + certificate | 🤖 (after #132) | ⬜ |
| 140 | §9 E2E email/transactional templates | 🤖 + 🔒 Resend templates | ⬜ |
| 141 | §10 E2E marketing pages | 🤖 | ⬜ |
| 142 | §11 Brand & copy audit | 🤖 | ⬜ |
| 143 | §12 A11y audit | 🤖 | ⬜ |
| 144 | Performance optimization | 🤖 | ⬜ |
| 146 | §15 Analytics — briefing_booked + certificate_issued | 🤖 | ⬜ |
| 148 | §17 LMS reskin final cleanup | 🤖 | ⬜ |
| 149 | §18 Bug fixes — PDF warm, migration, prod hygiene | 🤖 + 🔒 | ⬜ |
| 150 | §19 Mobile + cross-browser testing matrix | 🤝 (real device QA) | ⬜ |
| 151 | §20 Final pre-launch — smoke, stress, comms | 🔒 (operator final) | ⬜ |
| 152 | AiBI-P → AiBI-Foundation external rollout | 🔒 (Stripe/Resend/MailerLite) | ⬜ |
| 162 | 📌 Master tracker | _epic; closes when §1–§20 done_ | ⬜ |
| 154 | /research page redesign — break into tasks | 🤖 (planning only) | ⏸️ Phase 2 |

---

## Counts (current)

- **Total open at session start:** 44
- **Closed this session:** 6 (#153 #185 #186 #188 #192 #197) + partial #177
- **New issues created this session:** 2 (#194 mobile umbrella, #197 Builders — now closed)
- **Net open:** ~40

## PRs merged this session

| # | What | Closes |
|---|------|--------|
| #193 | Tracker + UAT scaffolding | — |
| #195 | Wave 1 — solid nav, tight hero, "Forgot password" link | #185 #186 #192 |
| #196 | Wave 1b — ROI section copy rewrite | #188 |
| #198 | Mobile Phase 2 — iOS form zoom + ROI grid + viewport export | (part of) #194 |
| #199 | Wave 2 — gitleaks + canonical on /assessment | (part of) #177 |
| #200 | Builders gold + responsive hero + /education accordion | #197 (part of) #194 |
| #201 | Playwright viewport audit harness | — (harness for #194) |

## Cluster branch map (final)

| Cluster branch | Issues | Status |
|----------------|--------|--------|
| `chore/issue-tracking-2026-05-18` | tracker + UAT scaffolding | ✅ merged #193 |
| `fix/copy-and-chrome-2026-05-18` | #185, #186, #192 | ✅ merged #195 |
| `fix/roi-copy-2026-05-18` | #188 | ✅ merged #196 |
| `fix/mobile-phase-2-2026-05-18` | partial #194 | ✅ merged #198 |
| `chore/audit-followups-2026-05-18` | partial #177; status comments on #178/#179/#180 | ✅ merged #199 |
| `fix/builders-ledger-color-2026-05-18` | #197 + part of #194 | ✅ merged #200 |
| `test/mobile-viewport-audit-2026-05-18` | harness for #194 | ✅ merged #201 |
| _next: Wave 1c #191 ticker_ | #191 | ⬜ Not started |
| _next: Wave 3 email capture_ | #189, #190 | ⬜ Not started |
| _next: Wave 5 auth replacement_ | #187 | ⬜ Not started |

---

## Process notes

- **This file is the source of truth for the issue-sweep status.** Tick rows as PRs merge.
- **GitHub issue tick:** when a PR merges, the linked issue auto-closes via `Closes #N` in the merge commit. Verify on the issue page.
- **UAT row:** every shipped fix gets a checkbox in `docs/handoffs/uat-2026-05-18.md` so post-deploy verification is one document, not 7 PRs.
- **🔒 surfacing:** every operator-only step has paste-ready instructions in the issue's status comment. No "go figure out Supabase" handoffs.
- **Merge-flow policy (clarified 2026-05-18):** I open PRs and notify user with preview link; user reviews on Vercel preview; user says "merge"; I merge. No auto-merge.

