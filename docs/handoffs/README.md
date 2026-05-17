# `docs/handoffs/` — Folder Rules

## Purpose

Dated snapshots of work-in-progress. A handoff captures **where you
left off** at a point in time: what was running, what was blocked,
what to pick up next. Once written, a handoff is **frozen** — it
doesn't get updated; a new one is written for the next session.

## What belongs here

- `handoff-YYYY-MM-DD[-context].md` — end-of-session handoffs
- `overnight-plan-YYYY-MM-DD.md` — start-of-overnight plans
- `overnight-status-YYYY-MM-DD.md` — morning status report
- `*-status-YYYY-MM-DD.md` — point-in-time status snapshots
- `PRE-MERGE-YYYY-MM-DD.md` — pre-merge readiness reports
- `weekend-env-setup.md` and similar one-time setup runbooks (after use)

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| Strategic plans | `Plans/<slug>.md` |
| Living task lists | `tasks/<slug>.md` |
| Living runbooks (used every launch) | `docs/manual-verification-runbook.md` |
| Reviews with open findings | `docs/reviews/` |

## Naming

`<type>-YYYY-MM-DD[-context].md` — always date-prefixed or
date-suffixed. Examples:

- `handoff-2026-05-10.md`
- `handoff-2026-05-11-evening.md`
- `overnight-plan-2026-05-10.md`
- `PRE-MERGE-2026-05-09.md`

## Lifecycle

Handoffs are **immutable history**. Do not edit them after the next
session starts. They become stale by design — that's their purpose.
If the work they describe is still relevant, lift the open items into
the appropriate `tasks/<slug>.md` and let the handoff stay as a
historical record.
