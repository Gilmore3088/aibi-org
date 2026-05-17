# `Plans/` — Folder Rules

## Purpose

This folder holds **plans only** — one markdown file per initiative,
describing the WHAT and the WHY. A plan is a strategic document, not
a checklist. Detailed task tracking lives in `tasks/<same-slug>.md`.

## What belongs here

- Active plan markdown files (the strategic doc for an initiative)
- `README.md` (this file) — the folder rules
- `_archive/` — superseded, completed, and historical specs (incl. old HTML)
- `_assets/` — PDFs, docx, images, screenshots referenced by plans

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| Task checklists | `tasks/<slug>.md` |
| Session handoffs / status snapshots | `docs/handoffs/` |
| Code reviews, security audits | `docs/reviews/` |
| Runbooks, operational reference | `docs/` |
| Binary assets dropped in via Finder | `Plans/_assets/` |

## Naming

- Active plans: `<slug>.md` (lowercase kebab-case)
- One plan file per initiative — do not split across multiple files
- Add YAML frontmatter to every plan:

```yaml
---
status: active | shipped | superseded | archived
created: YYYY-MM-DD
owner-tasks: tasks/<slug>.md   # link to the task list, if one exists
superseded-by: <filename>       # only if status: superseded
---
```

## Lifecycle

1. **Create:** write `Plans/<slug>.md` with frontmatter
2. **Activate:** create `tasks/<slug>.md` with the checklist; append a
   row to [`tasks/MASTER.md`](../tasks/MASTER.md); append a row to
   [`../CHRONOLOGY.md`](../CHRONOLOGY.md)
3. **Ship:** flip `status: shipped`; move plan to `_archive/`; move
   task file to `tasks/_done/`; update MASTER + CHRONOLOGY
4. **Supersede:** flip `status: superseded`; set `superseded-by:`;
   move to `_archive/`; update CHRONOLOGY

## Canonical plan

**[`aibi-launch-spec-v2.md`](./aibi-launch-spec-v2.md)** — the May 2026
launch spec. Single source of truth for product ladder, naming, routes,
entitlements, pricing. When code disagrees with this doc, file an issue
rather than coding around it.

## Pointers

- [`CHRONOLOGY.md`](../CHRONOLOGY.md) — full timeline of every plan
- [`DECISIONS.md`](../DECISIONS.md) — chronological override log
- [`_archive/`](./_archive/) — superseded specs (read its README first)
- [`_assets/`](./_assets/) — binary attachments referenced by plans
