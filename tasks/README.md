# `tasks/` — Folder Rules

## Purpose

This folder holds **task lists** — checkbox-driven work tracking for
active plans. Strategy lives in `Plans/<slug>.md`; the granular work
for that plan lives in `tasks/<slug>.md`.

## What belongs here

- `MASTER.md` — the universal registry of active plans (the one place
  to look when asking "what's outstanding?")
- One `<slug>.md` per active plan, matching its `Plans/<slug>.md`
- `lessons.md` — living anti-pattern + lesson notes (never closes)
- `todo.md` — persistent backlog (Phase 1+2 features)
- `_done/` — task files for completed plans (kept for history)

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

- [`lessons.md`](./lessons.md) — anti-patterns, dev hygiene
- [`todo.md`](./todo.md) — persistent backlog (legacy — being migrated
  to per-plan task files; treat as overflow until empty)
