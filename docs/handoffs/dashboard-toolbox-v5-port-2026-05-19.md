# `/dashboard/toolbox` v5 visual port — 2026-05-19

**PR:** [#220](https://github.com/Gilmore3088/aibi-org/pull/220)
**Branch:** `feature/dashboard-toolbox-v5-port`
**Closes:** [#183](https://github.com/Gilmore3088/aibi-org/issues/183)
**Worktree (post-merge cleanup):** `/Users/jgmbp/Projects/aibi-toolbox-v5-port`

## What shipped

A new client component `src/app/dashboard/toolbox/_components/ToolboxHomeV5.tsx` (~810 LOC after fixup) that ports the v5 toolbox visual onto the real Supabase-backed `/dashboard/toolbox` surface, plus a Ledger restyle of the page header.

Three commits on the branch:

| SHA | Subject |
|-----|---------|
| `0bc97c6` | `feat(dashboard-toolbox): port v5 visual + Ledger refresh` |
| `e237192` | `fix(dashboard-toolbox-v5): address review findings — blockers + cleanups` |
| (closeout) | docs + tracker close-out (this handoff) |

## Why this was a smaller PR than #183's title implies

The pre-implementation research surfaced that **the v5 design's "Starter Toolkit" read-only tier is documented but unimplemented in code** — no `entitlements.tier` column, no per-feature API gates, no tier prop threaded through `ToolboxApp`. That whole arc spins out into a new issue ([#219](https://github.com/Gilmore3088/aibi-org/issues/219)) instead of bloating this PR. The scope was narrowed to: port the v5 visual onto the existing Foundation access path.

The result is a clean visual port with all existing security boundaries preserved.

## Architecture call

Considered three integration shapes:

1. **Replace `/dashboard/toolbox/page.tsx` entirely** — too risky; would have required moving the existing Build/Playground/Library/Cookbook tab logic into a sibling route. Rejected.
2. **Add a new top-level "Home" tab to `ToolboxApp`** — would have meant editing tab enums in two places and inventing a new URL pattern. Rejected.
3. **Replace the existing "My Toolbox" tab content (a single ~60-LOC function called `ToolboxPanel`) with the new component, keeping all other tabs untouched.** ✓ Picked this.

That third option is the minimum-invasive port: same prop signature, same callbacks (`onRun` / `onEdit` / `onExport` / `onDelete` / `onBrowse` / `onBuild`), parent still owns mutations, no URL changes, no behavior change on the four other tabs.

## Subagents used

Five parallel subagent runs informed this PR:

**Pre-implementation research (3 in parallel):**
- **Explore** — mapped the existing `/dashboard/toolbox` surface (files, public interfaces, data flows, design tokens currently used).
- **general-purpose** — mapped the toolbox Supabase schema (existing tables, RLS, gap-list for v5 features).
- **security-sentinel** — enumerated the 13 entitlement invariants and the risk register for the port.

**Post-implementation review (3 in parallel):**
- **kieran-typescript-reviewer** — caught the `typeLabel` dead-typed branch, the unsafe `JSON.parse` cast, and the stale-closure register pattern in the Drawer's Escape handler.
- **code-simplicity-reviewer** — caught the pinned/grid `.includes` O(n²) bug + the 4-pass filter waste in the TypeFilter counts prop.
- **security-sentinel** (re-audit) — verified all 13 invariants preserved post-port; flagged the shared-browser localStorage pin visibility as MEDIUM (UX/privacy, not data leak — server RLS protects against actual data leak).

Three blockers fixed in the `e237192` fixup commit. Hygiene issue addressed with a tightened code comment instead of a code change (the proper fix lands when server-backed pins ship in #219).

## What's new in the v5 home

Rendered when a user lands on the "My Toolbox" tab inside the existing `ToolboxApp`:

- **Stats ribbon** — Total skills / new this week / stale (30d+) / in-production %. Real counts from `toolbox_skills`.
- **Ask bar** — Live substring filter across `name` / `desc` / `cmd`.
- **Type filter** — Prompts / Skills / Agents / Playbooks. Type inferred from `skill.cmd` keywords.
- **Starter kits row** — 4 cards. BSA officer marked "✓ Live" (links to the shipped catalog). The other 3 (Lender, Branch manager, Compliance) toast "Awaiting SME →" and point at [#184](https://github.com/Gilmore3088/aibi-org/issues/184).
- **Shared-with-you** — Honest empty state explaining the sharing model is a gap (no `institution_memberships` table exists today).
- **Pinned shelf** — Pinned tiles first, capped at 4; overflow falls through into the grid with ★ retained. Pin state in localStorage; key documented as scoped-for-server-migration in #219.
- **Grid** — Remaining tiles sorted by `modified DESC`.
- **Side drawer** — Full skill body preview, Run / Edit / Export / Delete CTAs that delegate to the existing `ToolboxApp` handlers. Escape key + backdrop click close. Delete prompts `window.confirm` before destructive call.
- **Toast** — Soft feedback for kit clicks and exports.
- **Empty state** — Browse / Build CTAs (Ledger-restyled, same behavior as the legacy ToolboxPanel empty state).

## What's NOT here, by design

| Deferred | Tracked in |
|----------|------------|
| Server-backed pin persistence (`toolbox_pins` table) | #219 |
| Real kit content for Lender / Branch / Compliance | #184 |
| Read-only Starter Toolkit tier (In-Depth buyers) | #219 |
| Sharing model (`institution_memberships` + `toolbox_shares`) | follow-up after Starter tier |
| Static catalog merge with user skills | follow-up after #184 content lands |
| Real export helpers extracted to shared module | follow-up alongside #219 |

## Spinoff: #219

[Issue #219](https://github.com/Gilmore3088/aibi-org/issues/219) was filed during the research phase. It tracks: schema work (`entitlements.tier` column, extended product CHECK), trigger for In-Depth payment.success → Starter row, server access helper changes, per-feature API gating on every `/api/toolbox/**` mutating endpoint, prop-threading `tier` through the React tree. The acceptance criteria are spelled out fully on the issue.

Until #219 ships, In-Depth Assessment buyers continue to get zero toolbox access (status quo before this PR).

## Post-merge cleanup

```bash
git worktree remove /Users/jgmbp/Projects/aibi-toolbox-v5-port
git push origin --delete feature/dashboard-toolbox-v5-port
git pull --ff-only origin main
```

Local `main` will be behind origin/main after the squash-merge; `git pull --ff-only` reconciles.

## Verification before merge

- [x] tsc clean
- [x] next lint clean
- [x] Dev-server smoke (`/dashboard/toolbox` returns 200, new Ledger header renders)
- [ ] CI checks green (running on PR #220)
- [x] 13 security invariants verified PRESERVED by security-sentinel
- [x] 3 blocker findings from code review addressed in fixup commit
- [ ] Visual review (manual click-through after merge to confirm the v5 tab content renders against real user data)
