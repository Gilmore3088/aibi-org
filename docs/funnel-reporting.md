# Funnel reporting — launch visibility

Three read-only Supabase **views** answer "how many leads / assessments /
purchases / completions do I have right now?" without a single new table,
write-path, or instrumentation call. They are added by
`supabase/migrations/00049_funnel_reporting_views.sql`.

## Why views, not a new tracking system

A proposed plan would have added `funnel_contacts` + `funnel_events` tables, a
`track.ts` write helper, ~10 instrumentation points across the app, a backfill
script, and a custom `/admin/funnel` dashboard. Three independent reviews
converged on the same finding: **every funnel signal that plan wanted to record
already lands a timestamped row in an authoritative table today.** There is no
missing-data problem — only a missing read layer.

A parallel write-path ledger would duplicate that data, need fail-open helpers
at every route, drift from the source tables the first time a write was
swallowed, and carry idempotency / race / email-canonicalization bugs that
produce **wrong dashboard numbers** — the worst failure for a reporting system.
Deriving the funnel on read removes all of it: the views cannot drift, cannot
double-count, cannot race, and have nothing to backfill. This extends the
pattern already in the schema, where `entitlements` is kept in sync from
`course_enrollments` by a trigger (migration `00015`) rather than by asking
every checkout route to remember to write.

## Source-of-truth boundaries

| System | Authoritative for |
|---|---|
| **Stripe** | Revenue and refund **dollars**. (The views count purchase/refund *events*, never sum money — read Stripe for $.) |
| **Vercel Analytics / Plausible** | Anonymous traffic and pre-email intent (assessment start, briefing CTA clicks). |
| **Supabase (these views)** | **Known-contact** funnel state — anyone who has given an email. |

## The three views

All three are read-only, derived, and **service-role only** (see Security).

### 1. `funnel_scorecard` — the daily numbers

One row per metric, with `all_time` / `last_7d` / `last_24h` counts, ordered by
`sort_order`. This is the daily launch scorecard.

```sql
select metric_label, all_time, last_7d, last_24h
from funnel_scorecard
order by sort_order;
```

Metrics: known contacts, free assessments completed, prompt-card leads, resource
downloads (incl. anonymous), waitlist signups, In-Depth purchases ($99),
In-Depth completed, Foundation purchases ($295), team cohorts, certificates
issued, full refunds.

### 2. `funnel_stage_distribution` — the funnel shape

One row per lifecycle stage (all seven always present, zero-filled), with a
contact count and percentage.

```sql
select lifecycle_stage, contacts, pct_of_contacts
from funnel_stage_distribution
order by stage_rank;
```

### 3. `funnel_contacts` — contact-level detail

One row per known contact with their derived stage, readiness tier, role,
institution, products purchased, and key timestamps. Use it to answer "who are
my In-Depth buyers?" or to export a list.

```sql
-- In-Depth buyers who have not yet completed the assessment
select display_email, role, institution, first_seen
from funnel_contacts
where has_in_depth_purchase and not has_in_depth_completed
order by first_seen desc;
```

## Lifecycle stages

A contact sits at exactly **one** stage — the furthest milestone they have
actually reached. Stages are derived top-down, so the value is naturally
forward-only (it can never report below a milestone the contact passed).

| Rank | Stage | Means |
|---|---|---|
| 1 | `lead` | Gave an email; no assessment or purchase yet. |
| 2 | `free_assessed` | Completed the free readiness assessment. |
| 3 | `in_depth_buyer` | Bought the $99 In-Depth Assessment; not completed. |
| 4 | `in_depth_completed` | Completed the In-Depth Assessment. |
| 5 | `foundation_buyer` | Bought the $295 Foundation course; no module progress yet. |
| 6 | `active_learner` | Foundation buyer who has started modules. |
| 7 | `certified` | Earned the Foundation certificate. |

Because stages are mutually exclusive, **"total who ever bought Foundation" is
not `foundation_buyer` alone** — it is `foundation_buyer + active_learner +
certified`, or simply the `foundation_purchases` row in `funnel_scorecard`. Use
the scorecard for "ever did X" and the stage distribution for "currently at X".

`high_intent` from the original plan is intentionally **not** a stage: it has no
durable signal in these tables. Pre-purchase intent (briefing CTA clicks,
abandoned checkouts) lives in Vercel/Plausible and Stripe, not here.

## Reading and exporting

- Run any of the queries above in the **Supabase SQL editor** (Studio →
  SQL Editor). Studio's **Export → CSV** fills a spreadsheet in one click, which
  is the manual daily scorecard.
- The Stripe dashboard supplies revenue/refund **dollars**; these views supply
  counts and contact context.

## Known limitations (by design)

- **Email dedupe is `lower(trim(email))`.** It does *not* replicate the Gmail
  dot/`+tag` stripping in `src/lib/email/canonicalize.ts`, to avoid a second
  canonicalization definition that could drift from the app. A person who used a
  Gmail alias on one form and the plain address on another may appear as two
  contacts. Negligible at launch scale.
- **Counts include test/seed data.** The shared database holds development rows
  (seeded enrollments, downloads, etc.). The views report what is in the table;
  they do not try to guess which rows are real. Factor this in when reading
  launch numbers, or clean seed rows separately (never via these views).
- **No revenue dollars.** Intentional — Stripe is authoritative for money.

## Security model

- All three views are `SECURITY INVOKER`, so the underlying tables' RLS is
  enforced against the querying role.
- As defense in depth, `anon` and `authenticated` are `REVOKE`d from all three
  views; only `service_role` can read them. They aggregate PII (emails), so any
  future reader must use the **service-role client server-side** — never the
  anon/authenticated client. This matches the existing append-only audit tables
  (`resource_downloads`, `refunded_checkout_sessions`).

## Applying the migration

This migration is additive (three views + grants) and reversible. It was
**applied to the linked Supabase project on 2026-06-22** (via the Supabase MCP,
after validating the exact DDL in a rolled-back transaction). Re-running it is
idempotent (`CREATE OR REPLACE VIEW`). Rollback if ever needed:

```sql
-- rollback, if ever needed:
drop view if exists funnel_stage_distribution;
drop view if exists funnel_scorecard;
drop view if exists funnel_contacts;
```

## Viewing in the browser — `/admin/funnel`

A read-only operator page at `/admin/funnel` renders all three views (scorecard,
stage distribution, most-recent contacts). It reads via the service-role client
and is gated two ways:

- **Auth + allowlist:** `src/app/admin/layout.tsx` requires a Supabase session
  whose email is on the `FUNNEL_ADMIN_EMAILS` env allowlist (comma-separated).
  Fail-closed — unset allowlist or a non-matching email returns 404; logged-out
  returns a login redirect. There is **no** preview-auth bypass on `/admin`.
- **No indexing:** `robots.txt` disallows `/admin/`, and the route sets
  `robots: { index: false }`.

To grant access, set `FUNNEL_ADMIN_EMAILS` in Vercel (Production scope) to the
operator email(s), then sign in normally. Supabase Studio remains the CSV export
path for the full contact list when the page caps the table (500 rows).

## Deferred — build only when traffic justifies it

- **A real `funnel_events` table** with idempotency keys and an atomic
  forward-only stage update. Build it the day there is a behavioral question the
  authoritative tables genuinely cannot answer (e.g. repeated CTA clicks, soft
  event ordering) — and not before. If/when that day comes, the prerequisites
  are: a unique `(event_type, external_ref)` key on Stripe's `event.id` for
  idempotency, an atomic SQL conditional update for forward-only stage, a shared
  email-canonicalization helper used by every write path, and per-source
  synthetic refs so any backfill stays idempotent against the live stream.
