# `docs/reviews/` — Folder Rules

## Purpose

Code reviews, security audits, UI audits, and architecture reviews
whose **findings are still in play**. Once findings are resolved or
the review is rendered obsolete by a refactor/refresh, the file moves
to `docs/_archive/`.

## What belongs here

- Security audits (`api-auth-audit-YYYY-MM-DD.md`)
- Code reviews with open findings
- Architecture reviews informing current direction
- Accessibility / UX audits whose recommendations are still pending

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| Reviews superseded by a major refresh | `docs/_archive/` |
| Bug logs / QA sweep tallies | `tasks/qa-bug-log-*.md` |
| Pre-merge readiness reports | `docs/handoffs/` |

## Naming

`<scope>-audit-YYYY-MM-DD.md` or `<scope>-review-YYYY-MM-DD.md`.
Date is the day the review was conducted, not the day findings landed.

## Triage flow

When a review lands:

1. File it here with all findings inline
2. Lift open findings into the appropriate `tasks/<slug>.md` (or
   `tasks/launch-checklist.md` if launch-blocking)
3. Reference the review file from the task line so context isn't lost
4. When all findings closed → move review to `docs/_archive/`
