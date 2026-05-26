# Branch cleanup — 2026-05-19

> **RESOLVED 2026-05-21 — the 4 HOLD worktrees are all closed out.** A follow-up
> cleanup pass investigated each before deleting:
> - `design-2.0` — retired. Visual direction conflicted with the shipped Ledger
>   refresh; its only unique surface (instructor/reviewer grading loop) was
>   explicitly declined by the operator.
> - `feature/mailerlite-automations` — retired. MailerLite work already on main;
>   rest superseded/retired/unwanted.
> - `feature/wave-1-bucket-a` / `feature/wave-2-bucket-b` — **content rescued**
>   (governance + maturity + score-authority) onto main via **PR #276**, then
>   retired.
>
> Same pass pruned the remote: **77 → 7 branches** (70 deleted: 64 merged + 5
> closed-unmerged + 1 superseded docs). Kept: 4 open-PR branches + `content-engine`,
> `sandbox-multi-provider`, `auth-audit`. See DECISIONS 2026-05-21.

**Trigger:** session-start `git worktree list` showed 21 worktrees, 24 local branches, and 5 orphan directories that weren't git worktrees at all. Multiple branches stale or superseded; risk of merge conflicts and tree clutter.

**Method:** systematic per-branch review — last commit, ahead/behind main, PR state (open/merged/closed/none), connection check (downstream branches, referenced issues), supersession check (work landed via a different SHA?).

## Outcome

| Bucket | Before | After |
|---|---|---|
| Worktrees | 21 | **10** |
| Local branches | 24 | **10** |
| Orphan directories (not git worktrees) | 5 | **0** |

## What was removed

### Orphan directories (5) — bucket A

Not git worktrees at all. Files left over from incomplete `git worktree remove` runs.

- `~/Projects/aibi-issue-97`
- `~/Projects/aibi-issue-98`
- `~/Projects/aibi-s-prototype`
- `~/Projects/aibi-shippable`
- `~/Projects/aibi-site-polish`

Deleted with `rm -rf`. Git was unaware they existed.

### Worktrees on merged or dead branches (10) — bucket B

All branches confirmed merged into main (via the same or a renamed PR) or had their PR closed unmerged with work superseded by a later effort.

| Worktree | Branch | Status |
|---|---|---|
| `aibi-brand-refresh` | `feature/brand-refresh` | origin merged |
| `aibi-c3c-toolbox-prompts` | `feature/c3c-toolbox-prompts` | origin merged |
| `aibi-foundation-content-alignment` | `feature/foundation-cleanup-pr2` | origin merged |
| `aibi-harness-unification` | `feature/lms-harness-phase-b2` | origin merged |
| `aibi-tool-guides-c1c` | `feature/tool-guides-canonical` | PR #128 merged |
| `aibi-issue-88` | `feature/issue-88-product-ladder` | PR #90 merged (force-removed: 5 untracked stale draft files, 2 differed from main, all confirmed as drafts superseded by PRs #97/#99) |
| `aibi-redesign-v3-cd` | `feature/redesign-v3-cd` | PR #47 merged |
| `aibi-c3-wire-content` | `feature/c3-wire-content` | PR #129 closed — replaced by `-clean` variant which merged |
| `aibi-stripe-products` | `feature/stripe-products` | PR #44 closed — dead per memory note (one-hyphen `in-depth-assessment` variant) |
| `aibi-staging` | `staging` | retired environment per `CLAUDE.md` ("there is no separate `staging`") |

For each: `git worktree remove <path>` + `git branch -D <branch>`. Origin branches retained — recoverable from remote if ever needed.

### Orphan branches with no worktrees (13) — bucket C

After bucket B, 13 local branch refs remained without worktrees. Bulk-classified by ahead/behind main + PR state.

#### Deleted (12)

All 0 commits ahead of main except where noted. Either work landed via different SHAs (squash-merge) or branch was abandoned without ever reaching a PR.

| Branch | Verdict |
|---|---|
| `chore/kill-coming-soon` | 0 ahead — work merged a different way |
| `feat/mailerlite-swap` | 0 ahead, no PR — abandoned |
| `feat/skills-accordion` | 0 ahead, no PR — abandoned |
| `feature/aibip-purchased-page` | 0 ahead — `aibi-p` → `foundation` rename made it obsolete |
| `feature/in-depth-fulfillment` | 0 ahead — In-Depth shipped via `design-2.0` lineage |
| `feature/lms-harness-unification` | 6 unique commits, PR #126 CLOSED. **Superseded by PR #127 (`-phase-b2`) which merged** — B1/B2/B3/B4 work landed via different SHAs. |
| `feature/post-purchase-magic-link` | 0 ahead — post-purchase flow shipped differently |
| `feature/stripe-indepth-checkout` | 0 ahead — In-Depth checkout shipped via design-2.0 |
| `fix/homepage-strip-hero` | 0 ahead — hero shipped via different chain |
| `fix/indepth-placement` | 0 ahead — In-Depth placement shipped |
| `polish/skills-prompts` | 0 ahead — abandoned polish branch |
| `wip/e1-newsreader-fallback-metrics` | 1 unique WIP commit, but **E.1 was SHIPPED via `fbdf9ea`** on main (cf. `tasks/performance-optimization-2026-05-17.md` §E.1). Different approach landed cleaner. |

#### Preserved as tag (1)

| Branch | Action |
|---|---|
| `feature/sandbox-multi-provider` | 1 unique commit (`1332f54`) adding OpenAI + Gemini providers. **Work is still on the active roadmap** (`tasks/todo.md:191-196`, `tasks/PATH-FORWARD.md:176 #158`, `launch-checklist.md:312 #237`, GitHub issue #158 OPEN). Branch is 390 commits behind main — rebasing is more work than restarting. **Tagged as `wip/sandbox-multi-provider-2026-05-07` and branch deleted.** Commented on issue #158 noting the tag's existence for future cherry-pick. |

## What was kept (worktrees that survived)

| Worktree | Branch | Status |
|---|---|---|
| `TheAiBankingInstitute` | `main` | home, production |
| `aibi-audit-sweep` | `feature/audit-sweep` | **PR #235 OPEN** — today's audit sweep, awaiting visual QA + merge |
| `aibi-toolbox-content` | `feature/toolbox-content-184` | **DRAFT PR #225** — 5 commits behind main, deferred rebase to SME signoff time (rebase guidance noted on PR) |
| `aibi-starter-tier` | `feature/starter-toolkit-tier` | PR #224 OPEN |
| `aibi-marketing-e2e` | `feature/marketing-e2e-section-10` | PR #223 OPEN |
| `aibi-ledger-color-migration` | `feature/ledger-color-migration` | PR #234 OPEN |
| `aibi-design-2.0` | `design-2.0` | **HOLD** — 90 local commits unpushed, not on main. Needs inspection before any action. |
| `aibi-mailerlite` | `feature/mailerlite-automations` | **HOLD** — no PR, last commit 05-09. Inspection deferred. |
| `aibi-wave-1-bucket-a` | `feature/wave-1-bucket-a-diagnostic-framework` | **HOLD** — no PR, last 05-06. |
| `aibi-wave-2-bucket-b` | `feature/wave-2-bucket-b-executive-ammunition` | **HOLD** — no PR, last 05-08. |

Four holds still to investigate one-by-one in a follow-up session.

## Follow-up issues filed during this session

These were filed alongside the cleanup to capture deferred items from PR #235's audit-sweep:

- **#235** — site-wide audit sweep PR (open)
- **#238** — refactor(brand): finish Terra→Ledger token rename on the last 5 routes
- **#236** — perf: dynamic-import `AIPracticeSandbox` to shrink module-page bundle
- **#237** — perf: replace width transition with transform on `/briefing-preview .bar` fill

## Lessons (informal, not yet promoted to CLAUDE.md)

1. **Orphan worktree dirs are silent.** `git worktree list` showed clean state but 5 dirs persisted on disk. Worth a periodic `comm` check between `git worktree list` paths and `ls -d ~/Projects/aibi-*`.
2. **"0 commits ahead of main" + "no PR" is the safe-delete signature.** All 10 of the deletable-with-zero-due-diligence branches matched this pattern.
3. **Closed PRs need a second look.** Closed != abandoned. `feature/lms-harness-unification` was superseded by `-phase-b2`; `feature/c3-wire-content` was superseded by `-clean`; `feature/stripe-products` was superseded by `design-2.0` lineage. Always check for a renamed/replacement branch before assuming closure = trash.
4. **Tag before deleting a branch with unique work.** `feature/sandbox-multi-provider`'s single useful commit would have been unreachable after `git branch -D`. Lightweight tag (`git tag <name> <sha>`) preserves it for future cherry-pick without keeping branch clutter.
5. **Force-push to development branches is fine; classifier blocks it as a one-time check.** Worth approving explicitly when rebasing a stale dev branch.

## What this enables

- Visual QA + merge of PR #235 is no longer blocked by tree noise
- Future `git worktree list` is meaningful — every line maps to either home, today's open PR, or a known hold
- `tasks/MASTER.md` and `CHRONOLOGY.md` now reflect ground truth
