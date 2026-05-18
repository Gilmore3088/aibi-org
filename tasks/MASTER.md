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

| Plan | Task file | Open | Status | GH issues |
|------|-----------|------|--------|-----------|
| [Launch spec v2 (canonical)](../Plans/aibi-launch-spec-v2.md) | [`launch-checklist.md`](./launch-checklist.md) | **~510** | Pre-launch QA | [§1 #132](https://github.com/Gilmore3088/aibi-org/issues/132) · [§2 #133](https://github.com/Gilmore3088/aibi-org/issues/133) · [§3 #134](https://github.com/Gilmore3088/aibi-org/issues/134) · [§4 #135](https://github.com/Gilmore3088/aibi-org/issues/135) · [§5 #136](https://github.com/Gilmore3088/aibi-org/issues/136) · [§6 #137](https://github.com/Gilmore3088/aibi-org/issues/137) · [§7 #138](https://github.com/Gilmore3088/aibi-org/issues/138) · [§8 #139](https://github.com/Gilmore3088/aibi-org/issues/139) · [§9 #140](https://github.com/Gilmore3088/aibi-org/issues/140) · [§10 #141](https://github.com/Gilmore3088/aibi-org/issues/141) · [§11 #142](https://github.com/Gilmore3088/aibi-org/issues/142) · [§12 #143](https://github.com/Gilmore3088/aibi-org/issues/143) · [§14 #145](https://github.com/Gilmore3088/aibi-org/issues/145) · [§15 #146](https://github.com/Gilmore3088/aibi-org/issues/146) · [§16 #147](https://github.com/Gilmore3088/aibi-org/issues/147) · [§17 #148](https://github.com/Gilmore3088/aibi-org/issues/148) · [§18 #149](https://github.com/Gilmore3088/aibi-org/issues/149) · [§19 #150](https://github.com/Gilmore3088/aibi-org/issues/150) · [§20 #151](https://github.com/Gilmore3088/aibi-org/issues/151) |
| [AiBI-P → AiBI-Foundation rename](../Plans/_archive/refactor-aibi-p-to-foundation-migration.md) | [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md) | **~14** | External rollout | [#152](https://github.com/Gilmore3088/aibi-org/issues/152) |
| [Research page redesign](../Plans/research-page-design-brief.md) | _(not yet created)_ | — | Plan only | [#154](https://github.com/Gilmore3088/aibi-org/issues/154) |
| [Persistent backlog (Phase 2)](./todo.md) | [`todo.md`](./todo.md) | **~52** | Backlog | [data loop #155](https://github.com/Gilmore3088/aibi-org/issues/155) · [peer benchmarks #156](https://github.com/Gilmore3088/aibi-org/issues/156) · [polish & parity #157](https://github.com/Gilmore3088/aibi-org/issues/157) · [sandbox ph2 #158](https://github.com/Gilmore3088/aibi-org/issues/158) · [AiBI-S #159](https://github.com/Gilmore3088/aibi-org/issues/159) · [AiBI-L #160](https://github.com/Gilmore3088/aibi-org/issues/160) · [marketing #161](https://github.com/Gilmore3088/aibi-org/issues/161) |
| [Free assessment output revision](../Plans/free-assessment-output-revision.md) | [`free-assessment-output-revision.md`](./free-assessment-output-revision.md) | **4** | Code shipped · awaiting manual QA | [#153](https://github.com/Gilmore3088/aibi-org/issues/153) — All five tracks shipped on `feature/free-assessment-output-revision`. Commits: `006ebd1` (CTA rank), `01ba011` (copy –20%), `76d2734` (Practice Picture page), `38f8464` (Maturity Ladder), `853bbe5` (Signature Insight). Build / lint / type-check / banned-phrase grep all clean. PDF is 14 pages. Remaining 4 gates: human walkthrough of 4 tiers on screen + PDF + Plausible event check, then merge to main. |
| [Performance optimization (May 2026)](../Plans/performance-optimization-2026-05-17.md) | [`performance-optimization-2026-05-17.md`](./performance-optimization-2026-05-17.md) | **~18** | Active | [#144](https://github.com/Gilmore3088/aibi-org/issues/144) — **Session 2026-05-17 total: -73 KB on `/dashboard` (208→135 via tree-shaking), -84 KB on `/assessment` (190→106), -64 KB on every marketing route, -8 KB CSS on every page, -2.4 MB deploy.** Shipped: Wave A (`13e7f65`), Wave A+ Supabase out (`3f92c4f`), SVGO hero (`fe3bd48`), lazy ResultsViewV2 (`4f61dad`), fonts off public + weights trimmed (`09100a6`), bundle-analyzer (`34b0bba`), **sideEffects tree-shaking (`bb418c4`) — biggest single win**. Open: AP9–AP14, Wave B (Early Hints), C (Cormorant SC), D (re-measure), E.1 font-override, E.4 module slim, E.7 static /, E.8 Tailwind. Audit at [`docs/reviews/performance-overhaul-2026-05-17.md`](../docs/reviews/performance-overhaul-2026-05-17.md) |

**Prioritized view:** see [`PATH-FORWARD.md`](./PATH-FORWARD.md) — tags
every outstanding work item as 🤖 autonomous / 🔒 you-only /
🤝 collaborative, with Wave 1 (done) and Wave 2 (next) queues.

## Recently closed (in `_done/`)

| Plan | Closed | Why |
|------|--------|-----|
| `dashboard-ledger-redesign.md` | 2026-05-17 | `/dashboard` Ledger rebuild + In-Depth refocus + chrome/copy sweep — all shipped same day |
| `lms-prototype-reskin.md` | 2026-05-17 | All 7 PRs merged (#52–#56, #64, #65) — Ledger LMS shipped |
| `qa-bug-log-2026-05-15.md` | 2026-05-17 | Issues #92–96 all PASS verdict |

## Active reviews / runbooks (not task-trackable)

| Artifact | Type | Why active |
|----------|------|------------|
| [`docs/reviews/api-auth-audit-2026-05-11.md`](../docs/reviews/api-auth-audit-2026-05-11.md) | Security review | Findings need to be triaged into `launch-checklist.md` if not already |
| [`docs/reviews/auth-e2e-2026-05-17.md`](../docs/reviews/auth-e2e-2026-05-17.md) | Auth E2E report | Findings 1+3 fixed; 2 unblocked 2026-05-17 |
| [`docs/reviews/a11y-audit-2026-05-17.md`](../docs/reviews/a11y-audit-2026-05-17.md) | Accessibility audit | 7/7 public routes clean |
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
