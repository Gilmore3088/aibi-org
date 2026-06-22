# `docs/` Folder Guide

For the shortest path, start with [Current Docs](../CURRENT_DOCS.md).

This folder holds current operational and reference documentation: launch
runbooks, product integration references, compliance notes, email assets, brand
references, and reusable templates. Strategic plans belong in
[Plans/](../Plans/README.md).

## Current Docs

| Doc | Use |
|---|---|
| [Launch checklist](launch-checklist.md) | Production readiness gates and external-system checks. |
| [Stripe products](stripe-products.md) | Product pricing, Stripe metadata, webhook setup, and refund notes. |
| [Environment variables](env-vars.md) | Vercel/local env var reference. |
| [Manual verification runbook](manual-verification-runbook.md) | Manual QA steps for launch-critical flows. |
| [Assessment flow and taxonomy](assessment-flow-and-taxonomy.md) | Assessment routing, taxonomy, and flow reference. |
| [LLM data handling](compliance/llm-data-handling.md) | AI / LLM safety and data-handling guidance. |
| [MailerLite automations](mailerlite-automations-overview.html) | Email automation overview. |
| [Email templates](mailerlite-emails/index.html) | MailerLite email HTML templates. |
| [Brand guide](brand/brand-guide-v1.html) | Brand reference. |
| [Logo kit](brand/logo-kit.html) | Logo and mark reference. |
| [Templates](templates/README.md) | Reusable HTML templates. |

## Folder Rules

| Content type | Location |
|---|---|
| Operational runbooks | `docs/` |
| Integration references | `docs/` |
| Compliance references | `docs/compliance/` |
| Email assets | `docs/mailerlite-emails/` |
| Brand references | `docs/brand/` |
| Strategic plans | `Plans/` |
| New task lists | `tasks/` if needed |

## Archive

Old ignored docs and stale local planning clutter were moved out of the repo to:

`/Users/jgmbp/Projects/TheAiBankingInstitute-docs-archive-2026-06-22`

Do not reintroduce those archived files unless one is explicitly reviewed and
promoted back into the current docs set.
