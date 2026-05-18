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
