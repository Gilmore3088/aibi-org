# `Plans/_ideas/` — Folder Rules

## Purpose

**Stash for future ideas.** Anything here is a seed, not a plan.
Drop quick notes, brainstorms, half-formed thoughts, "we should
maybe..." threads. Zero promises about when (or whether) any of it
becomes real work.

## What belongs here

- Loose markdown notes (`<slug>.md`) for an idea
- Voice-memo-style brain dumps
- Competitor screenshots / inspiration referenced by an idea
- Threads of "what if we..." reasoning

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| An idea you've decided to ship | Promote to `Plans/<slug>.md` |
| Active task tracking | `tasks/<slug>.md` |
| A reversed decision | document in `DECISIONS.md`, archive any old plan |

## Naming

`<slug>.md` — lowercase kebab-case. Don't worry about dates;
git history shows when it landed.

## Lifecycle

```
1. Idea drops in → Plans/_ideas/<slug>.md (no frontmatter required)
2. Idea matures → promote: move to Plans/<slug>.md, add frontmatter,
   create tasks/<slug>.md, append rows to MASTER + CHRONOLOGY
3. Idea dies → leave it here (history of considered-and-rejected
   directions is valuable) OR delete if it's noise
```

## Don't overthink it

Ideas folder is intentionally low-ceremony. If a note has more than
two checkboxes, it has graduated to a plan and should move out.
