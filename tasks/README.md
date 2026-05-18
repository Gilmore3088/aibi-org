# `tasks/` — Folder Rules

## Purpose

This folder holds **task lists** — checkbox-driven work tracking for
active plans. Strategy lives in `Plans/<slug>.md`; the granular work
for that plan lives in `tasks/<slug>.md`.

## What belongs here

- `MASTER.md` — the universal registry of active plans (the one place
  to look when asking "what's outstanding?")
- `PATH-FORWARD.md` — prioritized work plan with autonomous /
  user-blocked / collaborative tagging (synthesized view)
- One `<slug>.md` per active plan, matching its `Plans/<slug>.md`
- `todo.md` — persistent backlog (Phase 2+ features)
- `_done/` — task files for completed plans (kept for history)

## Current contents (as of 2026-05-17)

| File | Role | Status | Open items |
|------|------|--------|------------|
| [`README.md`](./README.md) | Folder rules (this file) | — | — |
| [`MASTER.md`](./MASTER.md) | Universal plan index | Living | — |
| [`PATH-FORWARD.md`](./PATH-FORWARD.md) | Prioritized work plan | Living | — |
| [`launch-checklist.md`](./launch-checklist.md) | 20-section §1–§520 launch punch list | Active | ~510 |
| [`aibi-p-to-foundation-deploy-checklist.md`](./aibi-p-to-foundation-deploy-checklist.md) | AiBI-P → AiBI-Foundation external rollout | Active | ~14 dashboard items |
| [`todo.md`](./todo.md) | Phase 2+ feature backlog | Active | ~52 |
| [`_done/`](./_done/) | Closed task files (history) | — | — |
| └─ `qa-bug-log-2026-05-15.md` | Issues #92–96 sweep — all PASS | Closed 2026-05-17 | 0 |
| └─ `lms-prototype-reskin.md` | LMS Ledger reskin 7-PR roadmap | Closed 2026-05-17 (PRs #52–65 merged) | 0 |
| └─ `dashboard-ledger-redesign.md` | /dashboard Ledger rebuild + In-Depth refocus + chrome/copy sweep | Closed 2026-05-17 (PR #123 + 3 hotfixes shipped) | 0 |

Three files were closed and one removed in the 2026-05-17 tidy:
- `qa-bug-log-2026-05-15.md` → `_done/` (all 5 issues PASS)
- `lms-prototype-reskin.md` → `_done/` (all 7 PRs merged)
- `lessons.md` → deleted (was empty; lesson notes live in the
  per-project auto-memory under `~/.claude/projects/.../memory/`)

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| Strategic plans | `Plans/<slug>.md` |
| Session handoffs ("here's where I left off") | `docs/handoffs/` |
| Status snapshots from a specific date | `docs/handoffs/` |
| Security/auth audits | `docs/reviews/` |
| Bug reproduction notes for a single issue | this folder is OK if it's a sweep across many issues |
| Curriculum or product research notes | `docs/` |

## Naming

- Per-plan task file: same slug as the plan
  (e.g. plan `Plans/research-page-design-brief.md` ↔ task
  `tasks/research-page-design-brief.md`)
- Dated artifacts go to `docs/handoffs/` instead, not here

## Workflow

```
1. New plan created in Plans/<slug>.md
2. Break it into tasks → tasks/<slug>.md (a markdown file of checkboxes)
3. Append one row to tasks/MASTER.md (the universal index)
4. Append one row to ../CHRONOLOGY.md (the timeline)
5. As work progresses:
   - Tick the box in tasks/<slug>.md
   - Decrement the open count in tasks/MASTER.md
6. When all boxes ticked:
   - Move tasks/<slug>.md → tasks/_done/<slug>.md
   - Flip status in tasks/MASTER.md row to COMPLETE
   - Update Plans/<slug>.md frontmatter to status: shipped
   - Move Plans/<slug>.md → Plans/_archive/
```

## The MASTER registry

[`MASTER.md`](./MASTER.md) is the single answer to "what's outstanding?"
It is an **index** of active task files, not a place where individual
checkboxes live. Detailed checkboxes live in `tasks/<slug>.md` only.

## Living docs (never close)

- [`todo.md`](./todo.md) — persistent Phase 2 backlog (legacy — items
  here are being migrated into per-plan task files; treat as overflow
  until empty)
