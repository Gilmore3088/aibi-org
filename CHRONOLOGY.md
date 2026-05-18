# Project Chronology — The AI Banking Institute

Single chronological log of every plan, task list, review, and handoff
created since project start. Each entry links to the artifact and shows
its current status. Use this to answer "what happened when" and "is
this still relevant."

**For day-to-day work:** see [`tasks/MASTER.md`](./tasks/MASTER.md) —
the registry of active plans and their open task counts.

**For canonical product spec:** see
[`Plans/aibi-launch-spec-v2.md`](./Plans/aibi-launch-spec-v2.md).

**For decision overrides:** see [`DECISIONS.md`](./DECISIONS.md).

---

## Status legend

| Tag | Meaning |
|-----|---------|
| **ACTIVE** | Current source of truth or work-in-progress |
| **COMPLETE** | Work shipped; kept for history |
| **SUPERSEDED** | Replaced by a later artifact (linked) |
| **STALE** | Pre-dates a major reversal/refresh; reference only |
| **REFERENCE** | Living reference doc (lessons, runbooks) |

---

## April 2026 — Foundation

| Date | Artifact | Type | Status | Note |
|------|----------|------|--------|------|
| 2026-04-15 | [`tasks/lessons.md`](./tasks/lessons.md) | LESSONS | REFERENCE | Session lessons, anti-patterns — living doc |
| 2026-04-15 | [`tasks/todo.md`](./tasks/todo.md) | BACKLOG | ACTIVE | Persistent Phase 1+2 backlog; last touched 2026-05-04 |
| 2026-04-15 | `Plans/_assets/feedback-v1-aibi-landing-page-prd.docx` | FEEDBACK | STALE | Pre-Ledger landing PRD feedback |
| 2026-04-17 | `Plans/_assets/*.pdf` (Skills Master Class, etc.) | RESEARCH | REFERENCE | Reference materials, competitor scans |
| 2026-04-27 | [`docs/_archive/audit-2026-04-27.md`](./docs/_archive/audit-2026-04-27.md) | REVIEW | STALE | Pre-Ledger visual audit |
| 2026-04-27 | [`docs/_archive/ui-review-2026-04-27.md`](./docs/_archive/ui-review-2026-04-27.md) | REVIEW | STALE | Superseded by Ledger refresh |
| 2026-04-29 | [`docs/_archive/ui-review-2026-04-29.md`](./docs/_archive/ui-review-2026-04-29.md) | REVIEW | STALE | Iteration on 04-27 audit; pre-Ledger |
| 2026-04-29 | [`Plans/_archive/plan-aibi-p-shippable-2026-04-29.md`](./Plans/_archive/plan-aibi-p-shippable-2026-04-29.md) | PLAN | COMPLETE | AiBI-P shippability plan; superseded by foundation rename + launch spec v2 |

## Early May 2026 — Course mechanics + brand refresh

| Date | Artifact | Type | Status | Note |
|------|----------|------|--------|------|
| 2026-05-05 | [`docs/handoffs/outstanding-plan.md`](./docs/handoffs/outstanding-plan.md) | PLAN | SUPERSEDED | Post-conference sprint plan → see launch-spec-v2 |
| 2026-05-05 | [`docs/handoffs/weekend-env-setup.md`](./docs/handoffs/weekend-env-setup.md) | RUNBOOK | COMPLETE | One-time env + branch setup |
| 2026-05-05 | [`docs/manual-verification-runbook.md`](./docs/manual-verification-runbook.md) | RUNBOOK | ACTIVE | Pre-launch manual smoke runbook |
| 2026-05-06 | [`docs/stripe-products.md`](./docs/stripe-products.md) | REFERENCE | ACTIVE | Stripe SKU inventory + pricing |
| 2026-05-07 | [`docs/handoffs/overnight-2026-05-07.md`](./docs/handoffs/overnight-2026-05-07.md) | HANDOFF | STALE | Pre-reversal overnight plan |
| 2026-05-07 | [`docs/handoffs/stripe-status-2026-05-07.md`](./docs/handoffs/stripe-status-2026-05-07.md) | STATUS | STALE | Superseded by `docs/stripe-products.md` |
| 2026-05-09 | [`docs/_archive/AiBI-P-Practitioner-Course-Overview.md`](./docs/_archive/AiBI-P-Practitioner-Course-Overview.md) | REFERENCE | STALE | Old AiBI-P naming; renamed to AiBI-Foundation 2026-05-11 |
| 2026-05-09 | [`docs/handoffs/PRE-MERGE-2026-05-09.md`](./docs/handoffs/PRE-MERGE-2026-05-09.md) | HANDOFF | COMPLETE | MailerLite branch merge readiness; merged |
| 2026-05-09 | [`docs/brand-refresh-2026-05-09/`](./docs/brand-refresh-2026-05-09/) | DESIGN-SYSTEM | ACTIVE | Ledger refresh hub — design tokens, merge roadmap, manual actions |
| 2026-05-09 | [`docs/curriculum-notes-tool-calling.md`](./docs/curriculum-notes-tool-calling.md) | REFERENCE | ACTIVE | Tool-calling curriculum research |

## Mid May 2026 — Foundation rename + launch run-up

| Date | Artifact | Type | Status | Note |
|------|----------|------|--------|------|
| 2026-05-10 | [`Plans/_archive/refactor-aibi-p-to-foundation-migration.md`](./Plans/_archive/refactor-aibi-p-to-foundation-migration.md) | PLAN | COMPLETE | AiBI-P → AiBI-Foundation rename; shipped as PR #45 |
| 2026-05-10 | [`docs/handoffs/overnight-plan-2026-05-10.md`](./docs/handoffs/overnight-plan-2026-05-10.md) | HANDOFF | STALE | Pre-reversal plan |
| 2026-05-10 | [`docs/handoffs/overnight-status-2026-05-10.md`](./docs/handoffs/overnight-status-2026-05-10.md) | STATUS | STALE | Pre-reversal snapshot |
| 2026-05-10 | [`docs/handoffs/handoff-2026-05-10.md`](./docs/handoffs/handoff-2026-05-10.md) | HANDOFF | STALE | Pre-reversal session handoff |
| 2026-05-10 | [`tasks/launch-checklist.md`](./tasks/launch-checklist.md) | CHECKLIST | ACTIVE | 80+ pre-launch QA items (infra, auth, e2e) |
| 2026-05-10 | [`tasks/lms-prototype-reskin.md`](./tasks/lms-prototype-reskin.md) | PLAN | ACTIVE | LMS Ledger reskin — multi-PR roadmap |
| 2026-05-10 | [`tasks/aibi-p-to-foundation-deploy-checklist.md`](./tasks/aibi-p-to-foundation-deploy-checklist.md) | CHECKLIST | ACTIVE | External-system rollout: Stripe/MailerLite/Resend/Vercel |
| 2026-05-11 | **Foundation v2 four-track plan REVERSED** — see DECISIONS.md | — | — | AiBI-Foundation collapsed to one SKU |
| 2026-05-11 | [`docs/reviews/api-auth-audit-2026-05-11.md`](./docs/reviews/api-auth-audit-2026-05-11.md) | REVIEW | ACTIVE | RLS / CORS / webhook signature audit findings |
| 2026-05-11 | [`docs/handoffs/handoff-2026-05-11-evening.md`](./docs/handoffs/handoff-2026-05-11-evening.md) | HANDOFF | STALE | Captures the reversal moment |
| 2026-05-11 | [`docs/handoffs/launch-status-2026-05-11.md`](./docs/handoffs/launch-status-2026-05-11.md) | STATUS | STALE | Snapshot; live state in launch-checklist |
| 2026-05-15 | [`tasks/qa-bug-log-2026-05-15.md`](./tasks/qa-bug-log-2026-05-15.md) | BUG-LOG | ACTIVE | Issues #92–96 QA sweep tally |
| 2026-05-16 | [`Plans/aibi-launch-spec-v2.md`](./Plans/aibi-launch-spec-v2.md) | PLAN | **ACTIVE — canonical** | May 2026 launch spec — single source of truth |
| 2026-05-16 | [`Plans/research-page-design-brief.md`](./Plans/research-page-design-brief.md) | PLAN | ACTIVE | /research page rebuild as AI Banking Brief |
| 2026-05-17 | [`Plans/dashboard-ledger-redesign.md`](./Plans/dashboard-ledger-redesign.md) | PLAN | COMPLETE | /dashboard rebuilt on Ledger + In-Depth $99 sell + chrome fixes; shipped same day |
| 2026-05-17 | [`tasks/_done/dashboard-ledger-redesign.md`](./tasks/_done/dashboard-ledger-redesign.md) | CHECKLIST | COMPLETE | Companion task tally for the dashboard redesign |
| 2026-05-17 | [`docs/handoffs/handoff-2026-05-17-dashboard-ledger.md`](./docs/handoffs/handoff-2026-05-17-dashboard-ledger.md) | HANDOFF | ACTIVE | Session handoff — what shipped + state of the repo |
| 2026-05-17 | [`Plans/performance-optimization-2026-05-17.md`](./Plans/performance-optimization-2026-05-17.md) | PLAN | ACTIVE | LCP < 2.5s overhaul — font surgery, code-split, Early Hints |
| 2026-05-17 | [`tasks/performance-optimization-2026-05-17.md`](./tasks/performance-optimization-2026-05-17.md) | CHECKLIST | ACTIVE | Wave A–D execution list for the perf plan |
| 2026-05-17 | [`docs/reviews/performance-overhaul-2026-05-17.md`](./docs/reviews/performance-overhaul-2026-05-17.md) | REVIEW | ACTIVE | Audit trail: 6 LCP attempts, kept vs reverted, bytes-bound root cause; Wave A appended PM (`13e7f65`) |
| 2026-05-17 | Wave A perf shipped (`13e7f65`) | COMMIT | DONE | ROIDossier code-split + Newsreader hero/heavy split (-3 italic font files, deferred ROI calculator JS). Bundled with In-Depth completion-detection dashboard fix. |
| 2026-05-17 | Wave A+ perf shipped (`3f92c4f`) | COMMIT | DONE | **Drop Supabase JS SDK from marketing routes** — HomeContextStrip → server component, signOut/sendMagicLink → server actions, EmailGate/PdfDownloadButton → /api/auth/me. **-64 KB First Load JS on `/`, `/assessment`, `/results`, every marketing route.** |
| 2026-05-17 | SVGO hero shipped (`fe3bd48`) | COMMIT | DONE | SVGO over the Satori hero output — 20.6 KB → 10.4 KB inline HTML (-49%). Baked SVGO into the regen script. |
| 2026-05-17 | Lazy ResultsViewV2 shipped (`4f61dad`) | COMMIT | DONE | `/assessment` First Load JS 127 → 106 KB (-21 KB). Combined with Wave A+: 190 → 106 KB (-44%) on the funnel's most critical page. |
| 2026-05-17 | Fonts off public + weights trimmed (`09100a6`) | COMMIT | DONE | TTF fonts moved from public/ to assets/pdf-fonts/ (-2.4 MB deploy). Cormorant SC 500/600/700 + JetBrains Mono 500 weights dropped (no usage). -8 KB CSS on every page. |
| 2026-05-17 | Bundle analyzer wired (`34b0bba`) | COMMIT | DONE | `@next/bundle-analyzer` behind `ANALYZE=true`. First run identified `/dashboard` page chunk (80 KB gz) and `/courses/foundation/program/[module]/page` (41 KB gz) as next-cycle targets. |
| 2026-05-17 | `sideEffects` tree-shaking (`bb418c4`) | COMMIT | DONE | **Single biggest bundle win of the session.** Declared `sideEffects` in package.json → webpack tree-shakes content barrels. `/dashboard` First Load JS 208 → 135 KB (-73 KB, -35%). Dashboard page chunk gzipped 80 → 36 KB (-55%). |
| 2026-05-18 | Newsreader Fallback @font-face (`fbdf9ea`) | COMMIT | DONE | E.1 — manual size-adjusted fallback (Times New Roman with metric overrides matching Newsreader). Closes CLS hop on first paint. Build still emits the warning but visible effect gone. |
| 2026-05-18 | Wave B Early Hints verified | CHECK | DONE | Production already emits `Link: rel=preload` headers for 5 font woff2 files (`curl -sLI https://www.aibankinginstitute.com/`); Vercel auto-promotes to HTTP 103 on prod tier. No config change required. |
| 2026-05-18 | Tailwind content path trim (`176a71f`) | COMMIT | DONE | E.8.2 — dropped `./content/**/*.{md,mdx}` from JIT scan. Content MDX has no `className=` (verified). Hygiene only; no measurable CSS delta. |
| 2026-05-18 | [`docs/handoffs/perf-overhaul-2026-05-18.md`](./docs/handoffs/perf-overhaul-2026-05-18.md) | HANDOFF | ACTIVE | Two-day perf session wrap-up + next-session priorities (E.4, E.7, Wave D Lighthouse re-measure, AP9–AP14 manual smokes). |
| 2026-05-18 | Wave D Lighthouse re-measure on production | CHECK | DONE | 6 Lighthouse runs against prod (mobile + desktop × `/` and `/assessment`). All acceptance gates HIT: mobile Perf 98, LCP 2.44s / 2.43s, FCP <1s, TBT 0ms, CLS 0; desktop Perf 100, LCP <0.6s. Closes A2/A5/A6/B3/D2/D3/E1.5. See [`docs/reviews/performance-overhaul-2026-05-17.md`](./docs/reviews/performance-overhaul-2026-05-17.md) §"Lighthouse measurement — 2026-05-18". |
| 2026-05-17 | [`Plans/_archive/free-assessment-output-revision.md`](./Plans/_archive/free-assessment-output-revision.md) | PLAN | COMPLETE | Six-track revision shipped on `feature/free-assessment-output-revision` (awaits merge). CTA rank, copy –20%, Practice Picture page, six-rung Maturity Ladder, Signature Insight, dashboard band + 2×2 grid + chart-led strengths + PDF cover report card. PDF is 14 pages. |
| 2026-05-17 | [`tasks/_done/free-assessment-output-revision.md`](./tasks/_done/free-assessment-output-revision.md) | CHECKLIST | COMPLETE | All code tracks shipped; 4 manual QA gates deferred to merge time |
| 2026-05-17 | Free assessment Track 1 shipped (`006ebd1`) | COMMIT | DONE | CTA hierarchy rank — Foundation $295 primary for tiers 1–3; In-Depth $99 secondary; Executive Briefing tertiary. Tier 4 inverts to Advisory primary. Same ranking flows into PDF NextStepsTrio with primary/secondary/tertiary visual rank. Plausible event sources tagged per slot. |
| 2026-05-17 | Free assessment Track 2 shipped (`01ba011`) | COMMIT | DONE | Copy rewrite – plainspoken voice, density –20% across PERSONAS / BIG_INSIGHT / FINANCIAL_IMPLICATIONS / GAP_CONTENT. Banned-phrase grep clean across assessment surfaces. |
| 2026-05-17 | Free assessment Track 3 shipped (`76d2734`) | COMMIT | DONE | "What this looks like in practice" recognition page — four-row dl keyed by role (Operations / Compliance / Managers / Executives) per tier. Inserts on-screen between Diagnosis and Big Insight; new PDF page 3 (downstream page numbers bumped). |
| 2026-05-17 | Free assessment Track 4 shipped (`38f8464`) | COMMIT | DONE | Six-rung maturity ladder with "you are here" pin — AI Curiosity → Controlled Experimentation → Building Momentum → Operational Adoption → Governed Scale → Institutional Advantage. On-screen between Strengths-and-Gaps and First Move; new PDF page 8 (downstream bumped again). aria-current="step" on active rung. |
| 2026-05-17 | Free assessment Track 5 shipped (`853bbe5`) | COMMIT | DONE | Signature insight callout — italic display serif on parchment with hairline rules: "Most institutions do not fail because employees refuse to use AI. They struggle because experimentation spreads faster than operational standards." Single constant; same string on screen and in PDF. |
| 2026-05-17 | [`docs/foundation-content-inventory-2026-05-17.md`](./docs/foundation-content-inventory-2026-05-17.md) | INVENTORY | DONE | Audit + usage map for Foundation course content. Drove the cleanup + harness work that shipped 2026-05-18. |
| 2026-05-18 | Foundation cleanup wave 1 — PR #124 (`dc72624`) | COMMIT | DONE | Deleted 1,196 lines of dead tool-guide files; moved 8.8 MB orphan archives to `Plans/_archive` + `Plans/_assets`; fixed stale path comments. |
| 2026-05-18 | Foundation cleanup wave 2 — PR #131 (`3dbd04e`) | COMMIT | DONE | Stripped legacy `sections` arrays from `module-1..module-12.ts` (~660 lines, V4 canonical). Renamed `AIBI_P_*` → `FOUNDATION_*` (kept `dbProductKey: 'aibi-p'`). |
| 2026-05-18 | LMS harness extraction + Foundation migration — PR #127 (`a23dfe0`) | COMMIT | DONE | New `src/lib/lms/` with canonical `CourseConfig`, body templates (Tabbed/Linear/Custom), progress helpers, README, contract test. Foundation migrated via lean modules + `FOUNDATION_MODULES_META`. Subsumed PR #126. |
| 2026-05-18 | Canonical tool guides — PR #128 (`fa569c7`) | COMMIT | DONE | `/courses/foundation/program/tool-guides` renders all 6 platforms (ChatGPT, Claude, Copilot, Gemini, NotebookLM, Perplexity) on one schema instead of 2. Per-platform files in `content/courses/foundation-program/tool-guides/`. |
| 2026-05-18 | Prompt-library / Toolbox split documented — PR #130 (`f8b87e2`) | COMMIT | DONE | `ALL_PROMPTS` documented as authoring source for migration 00022 (Toolbox library is runtime); 4 dead helpers dropped. |
| 2026-05-18 | RolePathCard + M3/M7 tutorials wired — PR #163 (`5ad1fdf`) | COMMIT | DONE | RolePathCard renders on course overview when `enrollment.onboarding_answers.primary_role` is set. New `MiniTutorialList` renders 7 M3 + 11 M7 tutorials on respective Practice tabs. |
| 2026-05-18 | [`docs/handoffs/foundation-content-and-harness-2026-05-17.md`](./docs/handoffs/foundation-content-and-harness-2026-05-17.md) | HANDOFF | DONE | Session summary — Phase A cleanup, Phase B harness, C-series content wiring. Decisions, merge complications, parked work. |

## Archived design specs (Plans/_archive/*.html)

Seven HTML specs from project start (`aibi-prd.html`, `aibi-site-v3.html`,
`aibi-developer-spec.html`, `aibi-foundation-v3.html`,
`aibi-designer-brief.html`, `aibi-consultant-playbook.html`,
`aibi-banking-playground.html`) plus `Plans/_archive/foundation-v2/` are
**STALE** — superseded by `Plans/aibi-launch-spec-v2.md` and the Ledger
refresh. Kept for history per `Plans/README.md`.

---

## How this file gets updated

When a **new plan** is created in `Plans/`, **append a row** to the
appropriate month section above (or add a new month). When a plan is
**completed**, flip its status to COMPLETE. When **superseded**, flip
to SUPERSEDED and link the replacement.

The aim is a one-glance view of "what happened when." If this file
ever gets longer than ~150 rows, fold older months into a single
"_Pre-{date} — see git history_" line.
