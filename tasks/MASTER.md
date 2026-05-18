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
| [Launch spec v2 (canonical)](../Plans/aibi-launch-spec-v2.md) | [`launch-checklist.md`](./launch-checklist.md) | **~510** | Pre-launch QA | Infra, auth, e2e, content, security — 13 ticked 2026-05-17, the rest open |
| [AiBI-P → AiBI-Foundation rename](../Plans/_archive/refactor-aibi-p-to-foundation-migration.md) (plan complete) | [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md) | **~14** | External rollout | Stripe / MailerLite / Resend / Vercel display-name updates |
| [Research page redesign](../Plans/research-page-design-brief.md) | _(not yet created)_ | — | Plan only | Break into task list when work begins |
| [Persistent backlog (Phase 2)](./todo.md) | [`todo.md`](./todo.md) | **~52** | Backlog | Phase 2 features (Supabase persistence, sandbox providers, AiBI-S/L wiring) |
| [Free assessment output revision](../Plans/free-assessment-output-revision.md) | [`free-assessment-output-revision.md`](./free-assessment-output-revision.md) | **34** | Active | Five-track revision of the on-screen results view + print PDF. Foundation $295 primary CTA for tiers 1–3; new "What This Looks Like" page; maturity ladder; signature insight callout; copy density –20%. |
| [Performance optimization (May 2026)](../Plans/performance-optimization-2026-05-17.md) | [`performance-optimization-2026-05-17.md`](./performance-optimization-2026-05-17.md) | **~32** | Active | Wave A shipped (`13e7f65`). **Wave A+ shipped (`3f92c4f`) — Supabase JS off marketing critical path, -64 KB First Load JS across `/`, `/assessment`, `/results`, `/about`, every marketing route.** Open: AP9–AP14 post-ship validation, Wave B (Early Hints), Wave C (Cormorant SC decision), Wave D (Lighthouse re-measure), Wave E (10 newly-identified opportunities). Audit trail at [`docs/reviews/performance-overhaul-2026-05-17.md`](../docs/reviews/performance-overhaul-2026-05-17.md) |

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
