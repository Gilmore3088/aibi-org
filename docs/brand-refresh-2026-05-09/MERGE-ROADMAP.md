---
title: Merge roadmap — feature/redesign-v3-cd → main
audience: a fresh-context agent picking this up
date: 2026-05-10
status: ready to execute
---

# Merge roadmap — feature/redesign-v3-cd → main

You're picking up a stalled merge. Read this whole doc before running anything.

## Context (what shipped before you got here)

The Ledger redesign lives on `feature/redesign-v3-cd`. The user's other agent
shipped 4 cleanup commits to `main` (the AiBI-Practitioner → AiBI Foundation
rename, codename PR #45, plus a four-track-product reversal). The redesign
branch and main have **diverged on the rename pattern** — both touched the
same ~150 files renaming `aibi-p` to `foundation`, but with different
exact strings and slightly different code shapes.

Last attempt to merge `origin/main` into `feature/redesign-v3-cd` produced
**398 file conflicts**. Almost all are mechanical rename diffs (different
strings for the same intent). It was aborted to preserve work; nothing on
origin changed.

## State on origin (verified)

| Thing | Value |
|---|---|
| `main` HEAD | `8f06d66` |
| `feature/brand-refresh` HEAD | `11cbad0` (rebased, 2 commits ahead of main) |
| `feature/redesign-v3-cd` HEAD | `36539b0` (27 commits ahead of brand-refresh) |
| Archive tag | `archive/old-brand-2026-05-10` |
| PR #46 | `feature/brand-refresh` → `main` (open, 2 commits) |
| PR #47 | `feature/redesign-v3-cd` → `feature/brand-refresh` (open, 27 commits) |

## State locally

Worktree: `~/Projects/aibi-redesign-v3-cd`. Branch: `feature/redesign-v3-cd`.
Working tree clean (last successful commit: `36539b0`).

## Vercel context

| Thing | Value |
|---|---|
| Project | `gilmore3088s-projects/aibi-org` |
| Production URL | https://aibankinginstitute.com |
| Auto-deploys from | `main` branch on push |
| Production env `COMING_SOON` | The user is flipping to `false` (verify in Vercel UI before merge) |

When the merge completes and you push to main, Vercel auto-builds in
~1–2 min. Confirm with `vercel ls` after.

## The plan — six steps

### 1. Confirm clean start

```bash
cd ~/Projects/aibi-redesign-v3-cd
git status                                # must be clean
git log --oneline -2                      # must show 36539b0 at HEAD
git fetch origin --quiet
```

If status shows anything in flight (rebase in progress, merge in progress,
unstaged changes), STOP and surface it to the user before doing anything.

### 2. Re-run the merge

```bash
git merge origin/main
```

Expect ~398 conflicts. Confirm the count:

```bash
git status --short | grep -c "^UU\|^DU\|^UD\|^AU\|^UA"
```

### 3. Mechanical conflict resolution

The vast majority of conflicts follow a **single pattern**: both branches
renamed `aibi-p` to `foundation` (or `Foundation`, or `Foundations`) but
with slight differences in:

- which exact identifier was renamed (`aibi-p` vs `aibiP` vs `AIBI_P` vs `AIBIP_`)
- which strings/types/aliases got introduced
- whether legacy fallbacks were preserved or deleted

**Resolution rule: prefer main's version unless main strips Ledger work.**
PR #45 is the canonical rename. The redesign branch's earlier rename
attempts (commits `49646a4`, `e418730` — "visible copy rename" + "internal
sweep") are now redundant. Main's version reflects the production-blessed
shape.

**Practical workflow:**

For each conflicted file, classify it:

a) **Pure rename conflict** (both branches renamed the same things, slight
   string differences): `git checkout --theirs <file>` to take main's version.
   Run this in batch:

   ```bash
   # WARNING: only run this on files you've verified are pure-rename conflicts.
   # Ledger-touching files (tokens.css, SiteNav, SiteFooter, layout.tsx,
   # middleware.ts, anything in src/components/ledger/, src/app/auth/,
   # src/app/privacy/, src/app/terms/, src/app/ai-use-disclaimer/,
   # src/app/verify/, src/app/redesign-checklist/, src/app/design-system/,
   # src/app/user-home/, src/app/my-toolbox/, src/app/playground/,
   # src/app/faq/, src/app/preview-home/, src/app/briefing-preview/,
   # src/app/lms-preview/, src/app/courses/foundation-preview/,
   # src/lib/redesign/, src/lib/analytics/plausible.ts) need MANUAL review.
   ```

b) **Ledger-touching conflict** (main's rename touches a file the redesign
   also restyled): MANUAL merge. The Ledger work usually wins for the
   visual layer; main's rename usually wins for any business-logic strings
   inside. Open the file, find the conflict markers, keep both intents.

c) **CLAUDE.md** conflict: keep both date entries in chronological order.
   See `feature/brand-refresh`'s recent rebase resolution
   (commit `40af594`) for an example. The pattern: the four-track entries
   from main are already correct; insert the Ledger Slice 0 entry from
   the redesign branch into the correct chronological slot.

d) **Files DELETED in main** but modified in redesign (e.g.
   `docs/brand-refresh-2026-05-09/MANUAL-ACTIONS.md`,
   `supabase/migrations/00028_rename_aibi_p_product_to_foundations.sql`):
   accept the deletion. `git rm <file>`. Main's cleanup superseded these.

### 4. Suggested batch resolution

Group the conflicts by type:

```bash
# Get the list of conflicted files
git diff --name-only --diff-filter=U > /tmp/conflicts.txt
wc -l /tmp/conflicts.txt

# Bucket: Ledger-touching files (manual)
grep -E "src/components/ledger/|src/app/(auth|privacy|terms|ai-use-disclaimer|verify|redesign-checklist|design-system|user-home|my-toolbox|playground|faq|preview-home|briefing-preview|lms-preview|courses/foundation-preview)/|src/lib/redesign/|src/lib/analytics/plausible|src/components/system/(SiteNav|SiteFooter)|src/styles/tokens.css|src/middleware.ts|src/app/layout.tsx|.env.local.example|CLAUDE.md" /tmp/conflicts.txt > /tmp/manual.txt
wc -l /tmp/manual.txt

# Bucket: everything else — likely pure-rename, candidates for `--theirs`
grep -vFf /tmp/manual.txt /tmp/conflicts.txt > /tmp/auto.txt
wc -l /tmp/auto.txt

# Auto-resolve the rename batch (take main's version)
xargs -a /tmp/auto.txt git checkout --theirs --
xargs -a /tmp/auto.txt git add
```

Then walk `/tmp/manual.txt` file by file. There are probably ~20-30 files
in that bucket; manageable.

### 5. Verify before commit

After resolving every conflict:

```bash
git status --short | grep -c "^UU\|^DU\|^UD\|^AU\|^UA"   # must be 0
npx tsc --noEmit                                          # must be clean
npm run build 2>&1 | tail -20                             # must succeed
```

If `npm run build` fails, the most common cause is a stale type cache —
try `rm -rf .next && npm run build`.

### 6. Commit + push + merge

```bash
git commit -m "merge: main into feature/redesign-v3-cd

Resolves 398 conflicts from PR #45 (aibi-p → foundation rename) landing
on main while the redesign branch carried its own earlier rename. Took
main's version for pure-rename conflicts, kept Ledger work for visual
files. Verified clean tsc + build before commit."

git push origin feature/redesign-v3-cd
```

Then on GitHub:

1. PR #46 (brand-refresh → main) — review and merge first if you want
   the brand-refresh in main as a separate landing. OR skip and just
   merge #47.
2. PR #47 (redesign → brand-refresh) — change base to `main` via the
   GitHub UI ("Edit" next to the PR title, change base branch).
3. Merge PR #47 to main. Vercel auto-deploys.

### 7. Verify production

```bash
sleep 60   # let Vercel build
vercel ls 2>&1 | head -5
```

Visit https://aibankinginstitute.com — should render Ledger (parchment
background, gold accents, Newsreader serif, two-line "The AI Banking" /
"Institute" lockup top-left).

If the placeholder still shows: confirm `COMING_SOON=false` on Vercel
Production env vars, and trigger a redeploy.

## Rollback if anything goes wrong

```bash
# Undo the merge before pushing (if conflicts get unrecoverable)
git merge --abort

# Restore old brand on prod (after merge has shipped)
vercel rollback https://aibi-1jygare6w-gilmore3088s-projects.vercel.app

# Restore old brand on disk (worktree)
git checkout archive/old-brand-2026-05-10
```

## What success looks like

- `feature/redesign-v3-cd` merged to `main`, no open conflicts
- `main` HEAD has the merge commit + all redesign work + all main work
- Vercel production deploy is green
- https://aibankinginstitute.com renders Ledger
- PRs #46 and #47 closed (or merged) on GitHub

## Reference docs

- `docs/brand-refresh-2026-05-09/HANDOFF.md` — original handoff plan
  (covers the redesign work itself)
- `docs/brand-refresh-2026-05-09/scope-css.mjs` — CSS scoper used for
  bundle routes (re-runnable for future bundle imports)
- `CLAUDE.md` Decisions Log — chronological history; the 2026-05-09
  Ledger entry and the 2026-05-09/05-11 four-track entries should both
  be present after the CLAUDE.md merge resolution

## Time estimate

A fresh agent should be able to complete this in ~30-45 min:

- 5 min — re-run merge, classify conflicts
- 5 min — auto-resolve the rename bucket
- 15-20 min — manual resolution of ~20-30 Ledger-touching files
- 5 min — verify (tsc + build)
- 5 min — commit + push + merge PRs
- 5 min — verify production
