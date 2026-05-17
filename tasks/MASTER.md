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

---

## Active plans

| Plan | Task file | Open | Status | Owner-note |
|------|-----------|------|--------|------------|
| [Launch spec v2 (canonical)](../Plans/aibi-launch-spec-v2.md) | [`launch-checklist.md`](./launch-checklist.md) | **80** | Pre-launch QA | Infra, auth, e2e, content, security — most items unchecked |
| [AiBI-P → AiBI-Foundation rename](../Plans/_archive/refactor-aibi-p-to-foundation-migration.md) (plan complete) | [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md) | **10** | External rollout | Stripe / MailerLite / Resend / Vercel display-name updates |
| [LMS prototype reskin](./lms-prototype-reskin.md) | (same file — roadmap-style) | **N/A** | Multi-PR roadmap | PR 1 scope: shared shell + course overview. Track PR status in plan body. |
| [Research page redesign](../Plans/research-page-design-brief.md) | _(not yet created)_ | — | Plan only | Break into task list when work begins |
| [Persistent backlog (Phase 1+2)](./todo.md) | [`todo.md`](./todo.md) | **40+** | Backlog | Bigger picture roadmap; mix of Phase 2 features (Supabase persistence, Stripe checkout, sandbox providers, AiBI-S/L wiring) |
| QA bug sweep (issues #92–96) | [`qa-bug-log-2026-05-15.md`](./qa-bug-log-2026-05-15.md) | **0** | Chronicle | Closed bugs only — open ones appear as plain "_Still open_" lines at bottom |

## Active reviews / runbooks (not task-trackable)

| Artifact | Type | Why active |
|----------|------|------------|
| [`docs/reviews/api-auth-audit-2026-05-11.md`](../docs/reviews/api-auth-audit-2026-05-11.md) | Security review | Findings need to be triaged into `launch-checklist.md` if not already |
| [`docs/manual-verification-runbook.md`](../docs/manual-verification-runbook.md) | Runbook | Used during launch QA |
| [`docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md`](../docs/brand-refresh-2026-05-09/MERGE-ROADMAP.md) | Migration plan | Ledger rollout phases 1–5 |
| [`docs/brand-refresh-2026-05-09/MANUAL-ACTIONS.md`](../docs/brand-refresh-2026-05-09/MANUAL-ACTIONS.md) | Manual steps | Figma / Resend / Vercel dashboard work |

## Living reference (never closes)

- [`./lessons.md`](./lessons.md) — Session lessons + anti-patterns
- [`../CLAUDE.md`](../CLAUDE.md) — Project intelligence
- [`../DECISIONS.md`](../DECISIONS.md) — Decision overrides log

---

## Adding a new plan

1. Write the plan in `Plans/<slug>.md` (frontmatter: `status: active`)
2. Create `tasks/<slug>.md` with the checklist
3. Append a row to **Active plans** above with `Open: N/N`
4. Append a row to [`../CHRONOLOGY.md`](../CHRONOLOGY.md) under today's month
5. If the plan ships, move task file to `tasks/_done/`, flip status in
   both plan frontmatter and this registry to COMPLETE
