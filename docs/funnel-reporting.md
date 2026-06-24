# Funnel reporting — launch visibility

Supabase-derived reporting answers "how many leads / assessments / purchases /
completions do I have right now?" without a parallel write-path ledger. The
known-contact views started in `supabase/migrations/00049_funnel_reporting_views.sql`;
the current admin dashboard also applies server-side metric exclusions and
resource-download corrections from the later reporting migrations.

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

## The reporting surfaces

The browser source of truth is `/admin/funnel`, backed by service-role reads and
server-side filtering. Supabase Studio remains useful for CSV exports when the
browser table cap is hit.

### 1. Funnel scorecard — the daily numbers

One row per metric, with `all_time` / `last_7d` / `last_24h` counts. This is
the daily launch scorecard in `/admin/funnel`.

Metrics: known contacts, free assessments completed, prompt-card leads, unique
resource downloaders with known email, waitlist signups, In-Depth purchases
($99), In-Depth completed, Foundation purchases ($295), team cohorts,
certificates issued, and full refunds.

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

- Use `/admin/funnel` for the operator view: scorecard, stage distribution,
  recent contacts, and resource-download popularity.
- Use Supabase Studio's **Export → CSV** for the full contact list when the
  browser table cap is hit.
- Use `/admin/support` and `/api/admin/support/export.csv?range=7d|30d|90d`
  for support cases, refunds, access rescues, and support workload.
- The Stripe dashboard supplies revenue/refund **dollars**; admin dashboards
  supply counts and contact context.

## Metric exclusions and resource-download rules

Known-contact metrics exclude configured test/internal identities before they
reach the scorecard, stage distribution, or contacts table.

Configured exclusions:

- `ADMIN_DASHBOARD_EXCLUDED_EMAILS` — comma/newline list of exact addresses.
- `ADMIN_DASHBOARD_EXCLUDED_EMAIL_PATTERNS` — comma/newline list of wildcard
  patterns.
- Built-in default test patterns: `*@aibankinginstitute.test`, `*@example.test`,
  and `*@example.com`.

Important reading rules:

- Exact exclusions use the app's `canonicalEmail()` helper, so Gmail dot/plus
  variants are covered for exact addresses.
- The scorecard's `Resource downloaders (known email)` row counts unique known
  email people after exclusions. It is the lead-quality row.
- The resource-download tiles/table below the scorecard are raw popularity
  signals. They include anonymous, repeat, and test/seed traffic and use hashed
  IP as the approximate unique-visitor signal. Do not treat those raw tiles as
  qualified leads.
- Anonymous resource downloads are useful for content interest, not for pipeline
  counts.

## Friday scorecard cadence

Every Friday, the operator copies one row of evidence into a spreadsheet or
launch log, adds notes, and chooses exactly one next action for the following
week. The point is not dashboard watching; it is one operating decision.

Use this 20-row template:

| # | Row | Source | Pull | Decision use |
|---:|---|---|---|---|
| 1 | Named channel / audience / CTA | Channel brief | Manual note | Confirms the week had a real traffic source. |
| 2 | Sessions by channel | Vercel Analytics / Plausible | Last 7d | Shows whether traffic actually arrived. |
| 3 | Assessment starts | Vercel Analytics / Plausible | Last 7d | Measures top-of-funnel intent before email capture. |
| 4 | Known contacts | `/admin/funnel` | Last 7d + all-time | Counts people with email, after exclusions. |
| 5 | Free assessments completed | `/admin/funnel` | Last 7d | Measures core free-product completion. |
| 6 | Completion-to-known-contact rate | Manual calc | Row 5 / row 4 | Flags capture or completion leakage. |
| 7 | Prompt-card leads | `/admin/funnel` | Last 7d | Measures resource-to-email conversion. |
| 8 | Resource downloaders with known email | `/admin/funnel` | Last 7d | Counts qualified resource downloaders only. |
| 9 | Top raw resource downloads | `/admin/funnel` resource table | Last 7d | Guides content interest, not lead count. |
| 10 | Checkout starts / paid clicks | Stripe or analytics | Last 7d | Shows paid intent before purchase. |
| 11 | In-Depth purchases | `/admin/funnel` + Stripe | Last 7d + dollars | Tracks the $99 rung. |
| 12 | In-Depth completions | `/admin/funnel` | Last 7d | Finds paid buyers who still need rescue. |
| 13 | Foundation purchases | `/admin/funnel` + Stripe | Last 7d + dollars | Tracks the $295 rung. |
| 14 | Active learners | `/admin/funnel` stage distribution | Current | Confirms paid access becomes real progress. |
| 15 | Certificates issued | `/admin/funnel` | Last 7d | Measures downstream course completion. |
| 16 | Open/new/SLA support cases | `/admin/support` | Current + last 7d | Decides whether support is blocking growth. |
| 17 | Pending/approved/issued refunds | `/admin/support` + Stripe | Current + last 7d | Separates product issues from manual money movement. |
| 18 | Provisioning/email/webhook failures | `/admin` or `/admin/support` | Last 7d | Flags operational breakage. |
| 19 | Excluded test/internal rows reviewed | `/admin` + env vars | Current | Confirms data hygiene has not drifted. |
| 20 | What changed / one next action | Friday note | Manual | The single conversion/support/product change for next week. |

Rules for the Friday note:

- Every number must name its source.
- Keep test/internal exclusions visible in the note.
- Treat anonymous raw downloads as content-interest only.
- If Stripe dollars and admin counts disagree, Stripe is authoritative for
  money and admin is authoritative for app-state counts.
- The week is not reviewed until row 20 has one owner and one next action.

## Known limitations (by design)

- **Funnel contacts still depend on source-table email quality.** Known-contact
  rows are filtered for configured test/internal identities, but a real person
  who uses materially different non-Gmail addresses can still appear more than
  once.
- **Raw resource-download popularity includes noise.** The scorecard's known-email
  downloader row is filtered; the raw resource table is intentionally not
  de-duplicated by person and includes anonymous/repeat/test traffic.
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
