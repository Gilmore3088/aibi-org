# `Plans/_archive/` — Folder Rules

## Purpose

Historical plans. Anything here is **superseded, completed, or stale**
and must not steer current development.

## What's in here

- Original HTML specs from project start (`aibi-prd.html`,
  `aibi-site-v3.html`, `aibi-developer-spec.html`, etc.) — replaced by
  `Plans/aibi-launch-spec-v2.md`
- `foundation-v2/` — the four-track Foundation family bundle, **reversed
  2026-05-11**. AiBI-Foundation is one course. The Personal Prompt
  Library 18-field schema in this bundle is the one surviving piece.
- `refactor-aibi-p-to-foundation-migration.md` — shipped as PR #45
- `plan-aibi-p-shippable-2026-04-29.md` — pre-rename course plan,
  superseded by launch spec v2

## When to move a plan here

- Plan ships → flip its frontmatter to `status: shipped`, then move
- Plan is replaced → flip to `status: superseded`, set `superseded-by:`,
  then move
- Plan is abandoned → flip to `status: archived`, add a note in
  `DECISIONS.md` explaining why, then move

## Do not delete

Old plans are kept for context — they explain why we made the
decisions we made. Search them before reverting a direction.

For the timeline of what was active when, see
[`../../CHRONOLOGY.md`](../../CHRONOLOGY.md).
