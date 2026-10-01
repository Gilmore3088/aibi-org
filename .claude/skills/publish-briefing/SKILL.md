---
name: publish-briefing
description: Mechanics of shipping an approved briefing — file conventions, claims entries, local checks, branch/PR/label rules, and the auto-merge guardrails for pulse content. Use after the lead-consultant pass returns PUBLISH.
---

# Publish a briefing

Run this only with a PUBLISH verdict in hand.

## Files

- Briefing: `content/briefings/<YYYY-MM-DD>-<slug>.mdx` — date prefix and
  slug MUST equal `meta.date` and `meta.slug` (the registry throws on
  mismatch). Date is today in UTC. One briefing per day per tier.
- Claims: new entries appended to `content/claims/registry.json`. Pulse
  changes are **additive-only** — never modify or remove an existing entry
  in a pulse PR (the guard rejects it; corrections go through a separate
  non-auto PR).
- A pulse PR touches exactly these paths and nothing else:
  `content/briefings/*.mdx` + `content/claims/registry.json`.

## Local checks (all must pass before pushing)

```
node scripts/check-claims.mjs
npx vitest run content/briefings/_lib/registry.test.ts src/app/sitemap.test.ts
npx tsc --noEmit
```

## Branch / PR conventions

- **Pulse:** branch `claude/pulse-<YYYY-MM-DD>` from `origin/main`. PR title
  `Pulse: <briefing title>`. Body = one-paragraph summary + the consultant's
  VERDICT block + the attribution footer. Label **`pulse-auto`** ONLY when
  the operator has confirmed branch protection with required checks is
  active on `main` — without that, auto-merge merges instantly and ungated;
  if unsure, open the PR unlabeled and say so. Then enable GitHub auto-merge
  (squash) and `subscribe_pr_activity`. If CI fails: fix and push, or close
  the PR with the reason. Never bypass a failing check.
- **Deep dive:** branch `claude/deep-dive-<YYYY-MM-DD>`, byline James, PR
  body carries VERDICT block, **no label, no auto-merge** — James reviews
  and merges his own byline. Same local checks.
- Commit messages and PR bodies end with the session's attribution footer
  convention. Never name the model in committed artifacts.

## After the PR

Update the week's `content` issue (link the PR, tick the stage), post a
one-line summary to the session, and stop. Do not touch MailerLite, courses,
or downloads from a briefing run — elevation and distribution are separate,
owner-gated workflows.
