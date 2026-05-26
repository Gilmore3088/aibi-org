# Master Task Registry

The universal index of active work. **One row per active plan.** Each
row links to the plan (the WHAT/WHY) and the detailed task file
(the checkboxes). Counts are open / total — update them when you tick
boxes.

For chronological history of every artifact (active and archived), see
[`../CHRONOLOGY.md`](../CHRONOLOGY.md).

---

## How this works

```
Plans/<plan>.md   →  the plan: goal, scope, done-criteria
tasks/<plan>.md   →  the task list: checkboxes for that plan only
tasks/MASTER.md   →  this file: one row per active plan, with counts

When a checkbox is ticked, tick it in tasks/<plan>.md AND
decrement the count here. When all boxes ticked, move
tasks/<plan>.md to tasks/_done/ and mark the row COMPLETE here.
```

The detailed checkboxes never live in two places — they live in
`tasks/<plan>.md` only. This file is an **index** of those files.

> **GitHub issues (2026-05-17):** The outstanding work in every active
> plan below has been mirrored as GitHub issues #132–#162 for tracking
> on the board. The master tracker is **[issue #162](https://github.com/Gilmore3088/aibi-org/issues/162)**
> and maps every section to its issue. Local task files stay
> authoritative for atomic checkboxes; tick locally AND on the issue.

---

## Active plans

> **2026-05-21 consolidation** (see [`docs/handoffs/session-signoff-2026-05-21.md`](../docs/handoffs/session-signoff-2026-05-21.md)):
> #254 (security + #238 + E2E + infra), #256 (toolbox onboarding 1/2/4a), #257
> (perf bars) all merged to production. Auto-closed #141/#229/#237/#239; closed
> #236 won't-fix + redundant PRs #223/#235. **⚠️ migration `00036` committed but
> NOT applied** (cert RLS). Onboarding Slices 3 + 4b/c blocked on #224
> (`access.tier`, needs migration `00035`).
>
> **Board consolidation (same session):** the scattered launch §-umbrellas were
> collapsed into two tracker tickets so they stop sitting open on shared blockers:
> **[#267](https://github.com/Gilmore3088/aibi-org/issues/267)** — operator
> launch punch-list (absorbed + closed #132 §1, #133 §2, #151 §20, #152 rename,
> #180 PDF smoke; #146 closed code-complete). **[#268](https://github.com/Gilmore3088/aibi-org/issues/268)**
> — E2E coverage gated on Supabase CI keys (absorbed + closed #134–#140 §3–§9).
> Granular checkboxes stay authoritative in `launch-checklist.md`. **Open issues
> 50 → 35.** What's left: #267/#268 trackers, deferred-LMS series (#240–#251),
> #143/#148/#149/#150 QA umbrellas, #178/#179/#238 audit residue, backlog.

| Plan | Task file | Open | Status | GH issues |
|------|-----------|------|--------|-----------|
| [44-issue sweep · 2026-05-18](./github-issues-2026-05-18.md) | [`github-issues-2026-05-18.md`](./github-issues-2026-05-18.md) | **~34** | 🟢 Substantially shipped · 14 PRs merged this session (#193, #195, #196, #198, #199, #200, #201, #202, #203, #204, #206, #207, #208, #209, #210, #211). Issues closed: #153 #185 #186 #188 #189 #190 #192 #197 #205. #142 #146 #194 partially closed. Companion UAT at [`docs/handoffs/uat-2026-05-18.md`](../docs/handoffs/uat-2026-05-18.md). | (see tracker) |
| [Launch spec v2 (canonical)](../Plans/aibi-launch-spec-v2.md) | [`launch-checklist.md`](./launch-checklist.md) | **~495** | Pre-launch QA · 2026-05-18 audit wave closed 15 items (§13.388-391/400, §14.405-408, §16.444-447/449/452, §18.468). See [audit-wave handoff](../docs/handoffs/audit-wave-2026-05-18.md) | **Consolidated 2026-05-21:** operator §1/§2/§20 + rename + observability → [#267](https://github.com/Gilmore3088/aibi-org/issues/267) · E2E §3–§9 → [#268](https://github.com/Gilmore3088/aibi-org/issues/268). Still open as standalone: [§12 a11y #143](https://github.com/Gilmore3088/aibi-org/issues/143) · [§17 LMS #148](https://github.com/Gilmore3088/aibi-org/issues/148) · [§18 bugs #149](https://github.com/Gilmore3088/aibi-org/issues/149) · [§19 mobile #150](https://github.com/Gilmore3088/aibi-org/issues/150). Closed: #132 #133 #141 #146 #151 #152 #180. |
| [AiBI-P → AiBI-Foundation rename](../Plans/_archive/refactor-aibi-p-to-foundation-migration.md) | [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md) | **~14** | External rollout | [#152](https://github.com/Gilmore3088/aibi-org/issues/152) |
| [Research page redesign](../Plans/research-page-design-brief.md) | _(not yet created)_ | — | Plan only | [#154](https://github.com/Gilmore3088/aibi-org/issues/154) |
| [Persistent backlog (Phase 2)](./todo.md) | [`todo.md`](./todo.md) | **~52** | Backlog | [data loop #155](https://github.com/Gilmore3088/aibi-org/issues/155) · [peer benchmarks #156](https://github.com/Gilmore3088/aibi-org/issues/156) · [polish & parity #157](https://github.com/Gilmore3088/aibi-org/issues/157) · [sandbox ph2 #158](https://github.com/Gilmore3088/aibi-org/issues/158) · [AiBI-S #159](https://github.com/Gilmore3088/aibi-org/issues/159) · [AiBI-L #160](https://github.com/Gilmore3088/aibi-org/issues/160) · [marketing #161](https://github.com/Gilmore3088/aibi-org/issues/161) |
| [Performance optimization (May 2026)](../Plans/performance-optimization-2026-05-17.md) | [`performance-optimization-2026-05-17.md`](./performance-optimization-2026-05-17.md) | **~19** | Active — gates HIT | [#144](https://github.com/Gilmore3088/aibi-org/issues/144) — **2026-05-18 update:** Lighthouse acceptance gates all HIT on production (mobile Perf 98, LCP 2.44s, FCP <1s, TBT 0, CLS 0). E.4 shipped via PR #171 (`/courses/foundation/program/[module]` 140→117 kB First Load JS, -16%, via `next/dynamic` on activity widgets). Wave B (Early Hints), Wave D (re-measure) closed. **2026-05-17 session totals: -73 KB on `/dashboard` (208→135 via tree-shaking), -84 KB on `/assessment` (190→106), -64 KB on every marketing route, -8 KB CSS on every page, -2.4 MB deploy.** Shipped: Wave A (`13e7f65`), Wave A+ Supabase out (`3f92c4f`), SVGO hero (`fe3bd48`), lazy ResultsViewV2 (`4f61dad`), fonts off public + weights trimmed (`09100a6`), bundle-analyzer (`34b0bba`), **sideEffects tree-shaking (`bb418c4`) — biggest single bundle win**, E.4 activity-widget dynamic-import (PR #171). Remaining open: AP9–AP14 manual smokes, A4 visual QA, D1 Playwright, C1 Cormorant SC brand decision, E.2.2 / E.3.3 / E.10.2 optional follow-ups, E.7 static homepage (architectural). Audit at [`docs/reviews/performance-overhaul-2026-05-17.md`](../docs/reviews/performance-overhaul-2026-05-17.md) |

**Prioritized view:** see [`PATH-FORWARD.md`](./PATH-FORWARD.md) — tags
every outstanding work item as 🤖 autonomous / 🔒 you-only /
🤝 collaborative, with Wave 1 (done) and Wave 2 (next) queues.

## Recently closed (in `_done/`)

| Plan | Closed | Why |
|------|--------|-----|
| `dashboard-ledger-redesign.md` | 2026-05-17 | `/dashboard` Ledger rebuild + In-Depth refocus + chrome/copy sweep — all shipped same day |
| `lms-prototype-reskin.md` | 2026-05-17 | All 7 PRs merged (#52–#56, #64, #65) — Ledger LMS shipped |
| `qa-bug-log-2026-05-15.md` | 2026-05-17 | Issues #92–96 all PASS verdict |
| `free-assessment-output-revision.md` | 2026-05-18 | 10 commits → **merged as PR [#172](https://github.com/Gilmore3088/aibi-org/pull/172)** (squash `028c8b0`). CTA rank, copy –20%, Practice Picture, Maturity Ladder, Signature Insight, dashboard + 2×2 grid + chart-led strengths + PDF cover report card, type-size bump, macOS PDF gen fix, Puppeteer Chrome isolation. **🔒 HUMAN post-deploy QA H1–H4** still open — see `tasks/_done/free-assessment-output-revision.md` Ship-gate section. |
| `seo-sweep-2026-05-18` _(single-PR, no plan file)_ | 2026-05-18 | **PR [#173](https://github.com/Gilmore3088/aibi-org/pull/173)** (squash `2f058ae`) — root self-canonicals + sitemap +9 routes (privacy/terms/faq/ai-use-disclaimer + 4 essays). Closes PATH-FORWARD W2.4. |
| `banned-word-sweep-2026-05-18` _(single-PR, no plan file)_ | 2026-05-18 | **PR [#174](https://github.com/Gilmore3088/aibi-org/pull/174)** (squash `08c1c44`) — repo-wide banned-phrase audit; one real violation fixed (`derive.ts` "fastest unlock" → "fastest fix"). Closes PATH-FORWARD W1.3. |

## Active reviews / runbooks (not task-trackable)

| Artifact | Type | Why active |
|----------|------|------------|
| [`docs/reviews/api-auth-audit-2026-05-11.md`](../docs/reviews/api-auth-audit-2026-05-11.md) | Security review | Findings need to be triaged into `launch-checklist.md` if not already |
| [`docs/reviews/auth-e2e-2026-05-17.md`](../docs/reviews/auth-e2e-2026-05-17.md) | Auth E2E report | Findings 1+3 fixed; 2 unblocked 2026-05-17 |
| [`docs/reviews/a11y-audit-2026-05-17.md`](../docs/reviews/a11y-audit-2026-05-17.md) | Accessibility audit | 7/7 public routes clean |
| [`docs/reviews/site-wide-audit-2026-05-19.md`](../docs/reviews/site-wide-audit-2026-05-19.md) | Site-wide audit | PR #235 open; follow-ups tracked as issues #236, #237, #238 |
| [`docs/reviews/branch-cleanup-2026-05-19.md`](../docs/reviews/branch-cleanup-2026-05-19.md) | Branch cleanup pass | ✅ **CLOSED 2026-05-21** — the 4 HOLD worktrees (design-2.0, mailerlite, wave-1, wave-2) all retired; wave content rescued via #276; remote pruned 77→7. See resolution note in the doc + DECISIONS 2026-05-21. |
| [`docs/manual-verification-runbook.md`](../docs/manual-verification-runbook.md) | Runbook | Used during launch QA |
| [`docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md`](../docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md) | Migration plan | Ledger rollout phases 1–5 |
| [`docs/brand-refresh-2026-05-09/MANUAL-ACTIONS.md`](../docs/brand-refresh-2026-05-09/MANUAL-ACTIONS.md) | Manual steps | Figma / Resend / Vercel dashboard work |

## Living reference (never closes)

- [`../CLAUDE.md`](../CLAUDE.md) — Project intelligence (also the lessons surface)
- [`../DECISIONS.md`](../DECISIONS.md) — Decision overrides log
- `~/.claude/projects/.../memory/MEMORY.md` — Auto-memory (lessons, feedback, project state) — local-only, not in repo

---

## Adding a new plan

1. Write the plan in `Plans/<slug>.md` (frontmatter: `status: active`)
2. Create `tasks/<slug>.md` with the checklist
3. Append a row to **Active plans** above with `Open: N/N`
4. Append a row to [`../CHRONOLOGY.md`](../CHRONOLOGY.md) under today's month
5. If the plan ships, move task file to `tasks/_done/`, flip status in
   both plan frontmatter and this registry to COMPLETE
