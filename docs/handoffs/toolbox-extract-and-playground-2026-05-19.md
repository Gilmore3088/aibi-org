# Toolbox tools extracted + playground wired — 2026-05-19

**Session goal:** close #182 — the one production gap the v5 toolbox
work created (the v5 design navigates to `/playground?tool=<key>` from
two surfaces, but the destination was a 35-line stub that ignored the
query string).

**Result:** [PR #217](https://github.com/Gilmore3088/aibi-org/pull/217)
open against `main` with two atomic commits.

## What shipped (in the PR)

### Commit `c5e458c` — PR-a, refactor only

Extracts the 12-tool `TOOLS` map from `src/app/my-toolbox/_script.js`
(~900 lines of inline JS) into a typed TypeScript module at
`src/lib/my-toolbox/tools.ts`. Mechanism:

- New file owns all data fields: `type`, `name`, `cat`, `ver`,
  `edited`, `runs`, `keep`, `origin`, `body`, `bodyLabel`,
  `composes`, `history`, `share`. Typed via `ToolData` / `ToolType` /
  `ToolHistoryEntry` / `ToolShareInfo` / `ToolComposesRef` interfaces.
- `src/app/my-toolbox/page.tsx` now injects the data as a JSON island:
  `<script id="toolbox-tools-data" type="application/json">…</script>`
  with `</script` escape for body-content safety.
- `_script.js` hydrates a local `TOOLS` map at runtime by merging the
  JSON island with a `TOOLS_VIEWS` object that holds the only fields
  that cannot serialize: `previewBody` and `footer`. Both return inline
  HTML using `rowsHTML` / `footerHTML` helpers next to them, so they
  stay in the script with their callers.

No behavior change on `/my-toolbox`. `tsc` clean, lint clean.

### Commit `dd7a2e9` — PR-b, wire the destination

`/playground?tool=<key>` now pre-loads any tool from `/my-toolbox`.

- `src/app/playground/page.tsx` injects the same JSON island.
- A `preloadFromQuery` block at the end of `src/app/playground/_script.js`
  parses `?tool=<key>`:
  - **Known key** → `promptInput` gets `tool.body` (the full
    production-grade prompt). `runTitle` gets the plain-text name.
    `detectVars()` re-runs so `{{PLACEHOLDER}}` chips are current.
    First variable input receives focus.
  - **Unknown key** → first-run suggestion stays + small advisory
    banner ("Unknown tool key: … — showing default editor").
  - **No key** → first-run suggestion stays (existing behavior).
  - **JSON island missing** → silent fallback to first-run.
- A bordered banner above the textarea identifies the source:
  *"From My Toolbox · &lt;name&gt; · &lt;category&gt; · v&lt;version&gt;"*
  with a one-click "↩ back to My Toolbox" link.

## What got intentionally deferred

The original #182 acceptance criteria included extracting an
`exports.ts` for the Markdown / JSON / .prompt / PDF helpers currently
inline in `/my-toolbox/_script.js`. **Left unchecked in the PR body.**

Reasoning: the exports work fine where they are. They only have one
consumer today (the drawer). Splitting them out now is churn without a
second user. The right time to extract is alongside
[#183](https://github.com/Gilmore3088/aibi-org/issues/183) (Supabase-
backed `/dashboard/toolbox`) when the exports actually need to be
reused. Called out explicitly in the PR body so the reviewer knows
it's a deliberate punt, not an oversight.

## Architecture call worth remembering

The window-bridge pattern (TS module → JSON island → vanilla JS reads
at runtime) was the right call for two reasons:

1. Both `/my-toolbox` and `/playground` are still injected via
   `dangerouslySetInnerHTML` from the design bundle. A native `import`
   from inside that injected script isn't possible without rewriting
   both pages as React — the right move eventually, but out of scope
   here.
2. The injection adds ~50 KB of typed data to the page payload, but
   it's build-time-determinable and SSR-cacheable.

When #183 lands and `/dashboard/toolbox` adopts the v5 visual as a
React surface, it can drop the JSON-island indirection and
`import { TOOLS }` directly.

## Smoke tests (local dev server)

```
/my-toolbox             → 200, renders identically, JSON island present, SAR body found
/playground?tool=sar    → 200, JSON island present, SAR body present in HTML
/playground?tool=bogus  → 200, falls back to default editor + advisory banner
/playground             → 200, unchanged
```

## Outstanding (post-merge cleanup)

- [ ] Merge [PR #217](https://github.com/Gilmore3088/aibi-org/pull/217) once reviewed.
- [ ] `git worktree remove /Users/jgmbp/Projects/aibi-toolbox-extract`
- [ ] `git push origin --delete feature/toolbox-tools-extract`
- [ ] Local `main` will be behind origin/main by ~2–4 commits;
      `git pull --ff-only origin main` to reconcile.

## Related issues

- **Closes:** [#182](https://github.com/Gilmore3088/aibi-org/issues/182) (the playground destination).
- **Unblocks:** [#183](https://github.com/Gilmore3088/aibi-org/issues/183) (visual port to `/dashboard/toolbox` can now `import { TOOLS }` directly).
- **Independent:** [#184](https://github.com/Gilmore3088/aibi-org/issues/184) (real tool content for Lender / Branch manager / Compliance — still needs SME sign-off; nothing in this PR changes its status).
