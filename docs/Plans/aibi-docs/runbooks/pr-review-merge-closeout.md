# PR Review, Verify, Merge, Close-out Checklist

A runbook for working a PR from "ready for review" to "fully cleaned up."
Use this every time. The discipline is the value.

---

## 1. Review (what the PR claims it does)

Open the PR. Read the description.

- [ ] **Summary is one paragraph or less.** If it's a wall of text, the
      PR is doing too much — consider asking for a split.
- [ ] **Each `Closes #X` is one actual issue per line.** Multi-closes
      from one PR are fine; vague closes are not.
- [ ] **Out-of-scope section exists** (or the PR is genuinely
      single-purpose). If a PR closes 6 issues and has no "out of scope"
      list, something is being hand-waved.
- [ ] **Test plan exists** with checkboxes. Empty test plan = unverified.
- [ ] **Each commit scoped to one or two related issues.** Scan the
      commit list. Mixed commits (`chore: random fixes`) are a smell.
- [ ] **Open Files Changed.** Skim the diff. Look for:
   - Files that have nothing to do with any listed issue → scope creep
   - Large auto-formatted blocks → noise hiding real changes
   - Deleted files → are they actually orphaned, or did something depend on them?
   - New files in unfamiliar paths → was a new pattern introduced without discussion?

---

## 2. Verify (what the PR actually does)

CI tells you most of this. Manual smoke catches the rest.

### Automated

- [ ] All CI jobs green on the PR's latest commit
- [ ] Lighthouse passing (if applicable)
- [ ] All E2E lanes passing (smoke, a11y, auth, others)
- [ ] Vercel preview deployment shows **Ready**

### Manual smoke (5 minutes, beats trusting CI alone)

- [ ] **Every new route** loads without error
- [ ] **Every claimed behavior change** does what the PR says it does —
      visit it, click it, fill it
- [ ] **Anything the test plan flagged as "still gates on auth/entitlement"**
      gets a real not-logged-in tab open and tested
- [ ] **Any UI claim** — render it on mobile width too, not just desktop
- [ ] **Any new telemetry** — confirm the event actually fires
      (open Plausible / network panel)

### Trust the diff, not just the commit message

- [ ] If a commit says "closes #X," open #X and confirm the issue's
      verification list is actually satisfied by the diff
- [ ] If a commit says "partially resolves #X," confirm the remaining
      work has its own issue or is explicitly tracked

---

## 3. Merge

Once 1 and 2 are clean.

- [ ] **Pick squash or rebase consistently.** Squash is fine for a chore
      sweep; rebase preserves story for feature work
- [ ] **Squash message is the PR title + the PR body's Summary line.**
      Not the default auto-generated mess
- [ ] **Head branch deletes on merge.** Settings → check "Automatically
      delete head branches" once if not already
- [ ] **Pull main locally** after the merge so your worktrees stay synced

---

## 4. Close-out (the part nobody does, that prevents drift)

The merge button is not the finish line.

### Verify auto-close

- [ ] **Every `Closes #X` line actually closed its issue.** GitHub auto-closes
      on merge IF the PR base is the default branch AND the syntax is right.
      Check the issue list. Reopen + close manually if anything missed.

### Document and label

- [ ] **Label the merged PR** for future scanning: `cleanup`, `ci`,
      `lms`, `brand`, `bug`, etc.
- [ ] **Append to `DECISIONS.md`** if anything irreversible happened
      (deletions, architectural choices, deprecations). Format:
      ```
      ## YYYY-MM-DD — <one-line decision>
      <one paragraph: what, why, what it replaces if anything>
      ```

### Open follow-ups now, not "later"

- [ ] **Any "partially resolves #X" becomes a new issue today.**
      Title it, link back to the merged PR, set scope. Future-you will
      not remember
- [ ] **Any "deferred to v2" or "layer 1" or "scaffold for now" becomes
      a new issue today.** Same logic
- [ ] **Any test plan item you skipped** becomes a new issue today.
      "I'll come back to it" is how it gets forgotten

### Final scan

- [ ] Open the issues tab. Confirm the count matches what you expect.
- [ ] Open the PRs tab. Confirm `is:open` is what you expect.
- [ ] If both are zero or near-zero, take the moment. It will not last.

---

## Quick reference: paste these into your terminal after merge

```bash
# Sync local main
git checkout main && git pull

# Confirm the closed issues
gh issue list --state closed --limit 10

# Confirm zero unexpected open issues
gh issue list --state open

# Confirm zero unexpected open PRs
gh pr list --state open
```

---

## When to break the pattern

- **Tiny PR, one-line fix, no behavior change:** Phase 1 + merge.
  Skip the rest.
- **Hotfix to production:** Phase 2 verification only.
  Do the close-out AFTER the fix lands, not before.
- **Stacked PR:** Don't merge the top until the base is merged.
  Rebase or wait.

---

*Pattern established 2026-05-17 across PR #118 (issue-sweep) and PR #120
(MVP slice + PII v1 + E2E fix + module-loop language).*
