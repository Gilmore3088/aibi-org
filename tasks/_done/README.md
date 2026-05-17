# `tasks/_done/` — Folder Rules

## Purpose

Task files for **completed plans**. When every checkbox in
`tasks/<slug>.md` is ticked and the corresponding plan ships, the
task file lands here so that `tasks/` itself shows only active work.

## What belongs here

- `<slug>.md` — completed task files, same name they had in `tasks/`
- Nothing else

## When to move a task file here

```
1. All checkboxes in tasks/<slug>.md are ticked
2. Corresponding Plans/<slug>.md has status: shipped in frontmatter
3. tasks/MASTER.md row for this plan is marked COMPLETE
4. Move: git mv tasks/<slug>.md tasks/_done/
5. Append a row to ../../CHRONOLOGY.md under today's month with
   status COMPLETE
```

## Do not delete

The closed task file is the receipt — it shows what shipped and when.
Useful for retrospectives and for explaining why something was
done a particular way.

## Reviving a "done" task

If reopened, move back to `tasks/`, add a note at the top about the
revival, and re-add the row to `tasks/MASTER.md`.
