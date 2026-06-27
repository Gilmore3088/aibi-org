# Persona Audit Consolidation — Complete vs Not Complete (2026-06-23)

**Purpose.** One document that reconciles the three prior persona audits (20 /
50 / 100) into a single "what was identified" and "what is complete vs not
complete" ledger — the starting position for the next round.

**Method.** Code-grounded review of the three audits, frozen at commit
`49160b14` (snapshot taken before analysis). Each audit was read end-to-end by
a dedicated reviewer; statuses below come **only** from what the audits
explicitly assert (resolution logs, "fixed in", "deferred", "TODO"), plus a few
facts independently verified against production (noted inline).

**Caveat — moving target.** A concurrent process is actively editing
`docs/persona-audit-2026-06-23/` (the 100-persona docs) while this was written.
Treat the 100-persona remediation statuses as "as of `49160b14`"; some may have
advanced since.

---

## Headline answer: was enough work done previously?

**The building is largely done. The proving is not.** Across all three audits
the dominant status is **"implemented locally, not verified in production."**
Almost every fix exists in code; almost none has been confirmed working on the
live site. The remaining gaps cluster into four buckets:

1. **Production verification** of the locally-implemented fixes (deploy + click
   through on prod). — *the single biggest gap*
2. **Owner-only activations** that no amount of code can close: live-money smoke
   tests, MailerLite nurture activation, rotating an exposed Stripe key,
   physical-device QA, named advisors/proof.
3. **Bottom-of-funnel value delivery** — the 100-persona audit's six P0 gaps
   (certificate, stranded buyers, retention, team checkout, fake demos, gated
   PDF 500s) are coded locally but unproven, and two (cert PDF, gated PDFs)
   overlap a known unresolved production PDF failure.
4. **Deferred-by-owner strategy** — acquisition channel, ABM, partner material:
   intentionally staged, not failures.

Top-of-funnel (home → free assessment → email) is in good shape and was the
focus of the 20-persona work. The risk lives **after the click that matters.**

---

## The three audits at a glance

| Audit | Date | Method | Scope | Tracks fix status? | Core finding |
|---|---|---|---|---|---|
| **20-persona** | 06-23 (10-persona predecessor 06-22) | **Real Playwright** nav sweep of prod (read-only) + UX/GTM reasoning + code-grounded remediation | 20 buyer+expert personas, top-of-funnel | **Yes** — 1,144-line resolution log | Top-of-funnel solid; fixes "implemented locally, live-verify pending" |
| **50-persona** | 06-23 | Code-grounded reasoning + local test runs (566 unit, 81 E2E pass) | 50 personas, full funnel readiness | Partial | "No new website P0"; gaps are live-proof + owner actions |
| **100-persona** | 06-23 | **Code-grounded reasoning** (NOT a browser run) | 100 personas × FI/role/journey, every flow | Local-only (nothing prod-verified) | 58/100 failed/damaged, 23 critical — **bottom-of-funnel fulfillment** |

> Note for clarity: there was **no prior 100-persona *browser* run**. The only
> real Playwright run to date was the 20-persona sweep. The new live 100-persona
> sweep (this round) is the first at that scale.

---

## Consolidated status ledger (deduped across audits)

Status legend: **DONE** = complete & verifiable · **LOCAL** = implemented in
code, production proof outstanding · **OUTSTANDING** = not done · **DEFERRED** =
intentionally staged by owner.

### A. Top of funnel — mostly 20-persona (mostly LOCAL/DONE)

| # | Item | Severity | Status | Source(s) |
|---|---|---|---|---|
| A1 | Floating unlabeled "N" control on `/assessment/take` | Low | DONE | 20 (P1) |
| A2 | ROI methodology adjacency + refund reassurance near CTAs | Med | DONE (local; visual QA pending) | 20 (P4,P8) |
| A3 | `/about` restored + trust anchor | High | LOCAL (deploy + founder bio/proof pending) | 20 (P5), 50 (#12) |
| A4 | Examiner/regulator claim-safety softening | Med | DONE (local; prod copy crawl pending) | 20 (P3,P7) |
| A5 | Foundation purchase page secondary links (dead-end fix) | High | LOCAL (deploy + live sweep pending) | 20 (P2,P17) |
| A6 | `/security/data-handling` + `/security/it-approval` packet | High | LOCAL (deploy/verify pending) | 20 (P6,P16), 100 |
| A7 | Mobile CTA reachability | Med | LOCAL (local audit pass; physical device pending) | 20 (P9,P18), 50 (F3) |
| A8 | Offer-ladder / $99 discoverability copy | High | LOCAL (homepage done; nav entry + MailerLite pending) | 20 (P12), 100 |
| A9 | Support ops checklist / SLA / refund authority | High | LOCAL (live operator verify pending) | 20 (P20), 50 (F1) |

### B. Bottom of funnel — 100-persona P0 gaps (all LOCAL, none prod-verified)

| # | Item | Severity | Status | Source(s) |
|---|---|---|---|---|
| B1 | **Certificate unreachable** — no approval→issuance path; cert PDF route | Critical | LOCAL — **prod UNVERIFIED; overlaps known prod PDF 500** | 100 (GAP1) |
| B2 | **Paid buyers stranded** — passwordless acct + single magic-link filtered by bank gateways | Critical | LOCAL (prod email/case/cron unverified) | 100 (GAP2) |
| B3 | **No retention loop** — abandoners/idle buyers never re-contacted; no cross-device resume | Critical | LOCAL (drafts + crons coded; migration/cron/email unverified) | 100 (GAP3) |
| B4 | **Team checkout is a `mailto:`** — self-serve Stripe flag-dark | Critical | LOCAL — assisted path coded; self-serve intentionally off | 100 (GAP4), 20 (P10), 50 |
| B5 | **Fake interactive demos** — `/playground`,`/practice` canned; `/practice` mislabeled "Enrolled-only" | P1→P0 | LOCAL (real endpoint coded; model-key prod unverified) | 100 (GAP5) |
| B6 | **Email-gated downloads 500** — Prompt Cards + Safe-AI Guide | Critical | LOCAL (static-PDF fix coded) — **prod UNVERIFIED; overlaps known prod PDF 500** | 100 (GAP6) |

> **Independent corroboration (project memory):** `@react-pdf` `renderToBuffer`
> routes have been failing with a 500 in production (an unresolved launch
> blocker). That directly overlaps **B1** (certificate PDF) and **B6** (gated
> PDFs). The local fixes reportedly move these to static PDFs, so a **targeted
> production download test of the cert and gated PDFs is the priority check** —
> the new nav-only sweep cannot exercise them (they sit behind `/api`, which is
> skipped for safety).

### C. Cross-cutting / owner-only actions (OUTSTANDING)

| # | Item | Severity | Status | Source(s) |
|---|---|---|---|---|
| C1 | **Live-money smoke tests** (free / $99 / $295 / refund / webhook 2xx) | Critical | OUTSTANDING (owner-run) | 20 (P15), 50 (F4) |
| C2 | **MailerLite nurture activation** (paste/seed/domain-auth/enable automations) | Critical | OUTSTANDING (owner dashboard) | 20 (P0-3,P12), 50, 100 (GAP3) |
| C3 | **Rotate exposed `STRIPE_SECRET_KEY`** | Critical | OUTSTANDING (security) | 20 (comparison) |
| C4 | **Production verification of ALL local fixes** (deploy + click-through) | Critical (umbrella) | OUTSTANDING | all three |
| C5 | Physical iPhone/Safari QA pass | High | OUTSTANDING | 20 (P9,P18), 50 (F3) |
| C6 | Public proof / named advisors / quotes-logos | High | LOCAL/blocked on owner approval | 20 (P5,P19), 50 (F2) |
| C7 | Legal / counsel signoff (privacy / terms) | High | OUTSTANDING | 50 (#21,#40) |
| C8 | PII guardrail breadth + audit log | P1 | **migration `00057` LIVE in prod (verified)**; app-side breadth LOCAL | 100 |

### D. Deferred by owner (intentional, not failures)

| # | Item | Severity | Status | Source(s) |
|---|---|---|---|---|
| D1 | Named acquisition channel | Strategic-Critical | DEFERRED | 20 (P11), 50 (F5) |
| D2 | Sales / ABM outbound motion | High | DEFERRED | 20 (P13) |
| D3 | Partner one-pager / webinar material | Med | DEFERRED | 50 (#48) |
| D4 | Team Assessment self-serve hardening (flag off until 2 cohorts QA) | High | DEFERRED | 20 (P10), 50 |

### E. Lower priority — 100-persona P1/P2 (mostly LOCAL/DONE)

| # | Item | Severity | Status | Source(s) |
|---|---|---|---|---|
| E1 | `console.log` of raw emails redacted | P2 | DONE (local) | 100 |
| E2 | `signOut` clears `aibi-trusted-device` cookie | P2 | DONE (local, regression-tested) | 100 |
| E3 | Dead-code cleanup (`TierPreview`, `module-N.ts`, `#restart`) | P2 | DONE (local) | 100 |
| E4 | Nav split / dead "About" link / two nav systems | P1 | LOCAL (full legacy deletion future) | 100 |
| E5 | Module 3 difficulty cliff (60-char gate) | P1 | LOCAL | 100 |
| E6 | Forced `marketingOptIn:true` (EmailGate) / no-thanks lane | P1 | LOCAL | 100 |
| E7 | No `/pricing` page (scattered pricing) | P1 | LOCAL (page coded) | 100 |

---

## Repeat / overlapping issues across audits (so the next round doesn't double-count)

- **Live transaction proof** — appears in all three (20 P15, 50 F4, 100 GAP2). One item, owner-run.
- **MailerLite activation** — 20 P0-3, 50, 100 GAP3. One item.
- **Proof / advisors thinness** — 20 P5/P19, 50 F2. One item, owner-gated.
- **Physical-device QA** — 20 P9/P18, 50 F3. One item.
- **Acquisition channel** — 20 P11, 50 F5. One deferred strategic item, not N.
- **Team assisted-sales gate** — 20 P10, 50 #25, 100 GAP4. Same control, three lenses.
- **Security data-handling visibility** — 20 P6/P16, 100 data-handling P1. One theme.

## What the new live 100-persona sweep adds (and cannot add)

- **Adds:** real-browser confirmation of top-of-funnel + mid-funnel navigation
  health across 100 diverse personas on production — broken links, 4xx, JS
  errors, dead-ends, reachability of each persona's intended destination, mobile
  vs desktop. This is the empirical complement to the reasoning audits.
- **Cannot add (by design / safety):** anything behind a form submit, email
  gate, login, checkout, or `/api` — so the six bottom-of-funnel P0s (B1–B6)
  still need **targeted production verification** outside the nav sweep. That is
  the single most important next action, alongside the owner-only items (C1–C3).
