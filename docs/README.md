# `docs/` — Folder Rules

## Purpose

This folder holds **operational and reference documentation** — things
you read while working, not plans or task lists. Think: runbooks,
reviews, dated handoffs, design system bundles, integration references.

## What belongs here

- Operational runbooks (`manual-verification-runbook.md`)
- Integration references (`stripe-products.md`)
- Curriculum / research notes (`curriculum-notes-*.md`)
- `handoffs/` — dated session handoffs and status snapshots
- `reviews/` — code reviews, security audits, UI audits (recent ones)
- `brand-refresh-2026-05-09/` — the Ledger design system bundle
- `compliance/`, `mailerlite-emails/`, `superpowers/` — domain bundles
- `_archive/` — pre-Ledger UI audits, retired references

## What does NOT belong here

| Wrong location | Right location |
|----------------|----------------|
| Strategic plans | `Plans/<slug>.md` |
| Task checklists | `tasks/<slug>.md` |
| Binary assets that belong to a plan | `Plans/_assets/` |

## Subfolders

| Folder | Contents |
|--------|----------|
| [`handoffs/`](./handoffs/) | Dated session handoffs, overnight plans, status snapshots — see its README |
| [`reviews/`](./reviews/) | Security/auth/UI audits with findings still in play |
| [`_archive/`](./_archive/) | Stale audits (pre-Ledger refresh), retired references |
| `brand-refresh-2026-05-09/` | Active Ledger design system + merge roadmap |
| `compliance/` | Regulatory reference (SR 11-7, ECOA, AIEOG) |
| `mailerlite-emails/` | Email template source |
| `superpowers/` | Workflow skill notes |

## Naming

- Dated artifacts: `<slug>-YYYY-MM-DD.md` or move to `handoffs/`
- Reference docs: `<topic>.md` (kebab-case, no date if living)
- One topic per file; if a file exceeds ~500 lines, split by sub-topic

## When in doubt

- A *plan*? → `Plans/`
- A *task list*? → `tasks/`
- A *snapshot of where I left off*? → `docs/handoffs/`
- A *review of code I wrote*? → `docs/reviews/`
- A *thing I read while working*? → here, `docs/`
