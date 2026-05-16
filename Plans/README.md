# `Plans/` — Status Index

This directory holds the project's planning artifacts. **Most are now
archival.** Read this file before treating anything in `Plans/` as
authoritative.

## Authoritative for current launch

| File | What it covers |
|------|----------------|
| **[`aibi-launch-spec-v2.md`](./aibi-launch-spec-v2.md)** | **Active May 2026 launch spec.** Product ladder, naming, routes, entitlements, pricing, assessment logic, checkout/webhook, dashboard states, QA checklist, deferred items. When code disagrees with anything here, file an issue. |

Companion (lives in repo root):
- [`../DECISIONS.md`](../DECISIONS.md) — chronological override log
  explaining why decisions changed.
- [`../CLAUDE.md`](../CLAUDE.md) — operator + agent rules (env vars,
  branch protocol, deploy commands).
- [`../tasks/aibi-p-to-foundation-deploy-checklist.md`](../tasks/aibi-p-to-foundation-deploy-checklist.md)
  — operator dashboard checklist for the AiBI-P → AiBI-Foundation
  rename + the post-#88 product-ladder cleanup.

## Archive — historical context only

The following documents predate `aibi-launch-spec-v2.md`. They contain
stale assumptions (8-question free assessment, 8–32 scoring range,
`/foundations` route, `$97` Foundations product, Kajabi LMS, AiBI-P /
AiBI-Practitioner / "AiBI Foundations" plural product names, four-track
Foundation family) and **should not steer development.** Kept for
historical reference of the project's evolution.

| File | Original purpose | Superseding section in v2 |
|------|------------------|---------------------------|
| `aibi-prd.html` | Initial product requirements | §1 (product ladder), §6 (assessment), §9 (launch QA) |
| `aibi-foundation-v3.html` | Brand identity + GTM | §2 (naming) |
| `aibi-site-v3.html` | Design system + page specs | §3 (routes) — design system now Ledger (see `docs/brand-refresh-2026-05-09/`) |
| `aibi-developer-spec.html` | Architecture + stack | §4 (entitlements), §7 (checkout/webhook) |
| `aibi-designer-brief.html` | Visual identity | superseded by Ledger refresh; see CLAUDE.md "Design Context" |
| `aibi-consultant-playbook.html` | Executive Briefing script | §10 (advisory deferred post-launch) |
| `aibi-banking-playground.html` | Sandbox concept | not in current launch scope |
| `foundation-v2/` | Four-track Foundation family bundle | **reversed 2026-05-11**; AiBI-Foundation is one course. See `DECISIONS.md`. The Personal Prompt Library 18-field schema in that bundle is the one piece still in force. |

## Adding new planning docs

Place new active specs alongside `aibi-launch-spec-v2.md` as Markdown.
If a decision supersedes part of v2, document the override in
`DECISIONS.md` first, then update v2 to reflect the new state. Do not
keep stale specs in the "Authoritative" table.
