# Handoff — Audit wave (SEO + Security + Lighthouse + PDF unblock)

**Date:** 2026-05-18
**Session theme:** Close code-level audit items in launch checklist §13, §14, §16, §18.
**Status:** All work merged or superseded. No open PRs from this session.

---

## What shipped

Five PRs reached `main`, plus one closed-as-superseded:

| PR | Scope | Result |
|----|-------|--------|
| [#164](https://github.com/Gilmore3088/aibi-org/pull/164) | Foundation/harness handoff + CHRONOLOGY + DECISIONS catch-up | Merged |
| [#167](https://github.com/Gilmore3088/aibi-org/pull/167) | SEO §14 — sitemap leak fix, www-canonical, per-page `alternates.canonical` | Merged |
| [#168](https://github.com/Gilmore3088/aibi-org/pull/168) | Security §16 — 5 audit items pass | Merged |
| [#171](https://github.com/Gilmore3088/aibi-org/pull/171) | Lighthouse §13 — Perf 98 on 5 marquee routes + `/verify` 404 fix | Merged |
| ~~#175~~ | PDF libnss3 fix on Vercel | Closed — superseded by your parallel rewrite of `src/lib/pdf/generate.ts` on main |

Three parallel PRs landed from your side during the session and are accounted for in this handoff: #165 (analytics + rate-limits + SEO metadata), #166 (CSP enforce), #169 (a11y + banned-word), #172 (free-assessment output revision), #173 (root canonicals + expanded sitemap), #174 (banned-phrase sweep).

---

## Findings docs created

| Doc | Closes |
|-----|--------|
| [`docs/reviews/seo-audit-2026-05-18.md`](../reviews/seo-audit-2026-05-18.md) | §14.405-408 |
| [`docs/reviews/security-audit-2026-05-18.md`](../reviews/security-audit-2026-05-18.md) | §16.444-447, .449, .452 |
| [`docs/reviews/lighthouse-2026-05-18.md`](../reviews/lighthouse-2026-05-18.md) | §13.388-391, .400 |

---

## Launch checklist items closed this session

**§13 Performance (5 items)** — 388, 389, 390, 391, 400. Measured on production with Lighthouse 13.3.0 mobile preset. All five marquee marketing routes (`/`, `/assessment`, `/assessment/in-depth`, `/education`, `/for-institutions`) score Perf 98 / A11y 96 / BP 96 / SEO 100. LCP 2.4 s, FCP 0.9 s, TBT 0 ms, CLS 0. Recent perf optimization plan (Wave A–E) is fully landed and validated.

**§14 SEO (3 items)** — 405, 406, 408. Sitemap leak fixed (`/courses/foundation/program` was 307-ing to `/auth/login`); per-page `alternates.canonical` added to 7 marketing pages; `SITE_URL` defaults to `www.aibankinginstitute.com` (matches the apex→www edge redirect).

**§16 Security (6 items)** — 444, 445, 446, 447, 449, 452. Code-level audit confirms: input validation via typed payload guards on all 46 API routes, parameterized DB writes via Supabase JS client, all 17 `dangerouslySetInnerHTML` callsites use static content, zero CORS headers, `SUPABASE_SERVICE_ROLE_KEY` is server-only (no `NEXT_PUBLIC_` prefix and zero `'use client'` callsites), `security.txt` already present at `public/.well-known/`.

**§18 Bug fixes (1 item)** — 468 PDF `libnss3.so` on Vercel: code shipped via your parallel `src/lib/pdf/generate.ts` rewrite on main (dynamic `@sparticuz/chromium` import + Linux-runtime detection + isolated `--user-data-dir` for local Chrome). Checklist tick pending production smoke confirmation.

**Cross-cutting bug caught:** `SiteFooter.tsx` linked to `/verify` (404). Removed the link as part of #171 — third parties verify with the URL printed on the credential itself, which already includes the ID.

---

## What is NOT done — outstanding queue

### Code-shaped, autonomous-safe (some blockers)

| ID | Status | Why |
|----|--------|-----|
| §17.466-467 Ledger token consolidation | **BLOCKED** | 174 files still reference Terra/Sage/Cobalt tokens. Lighthouse confirmed `text-terra`, `bg-terra`, `text-dust` classes still on the live homepage. Migration needs to complete before legacy `tokens.css` can be deleted |
| §13.392 CWV on `/courses/foundation/program/[module]` | **DEFERRED** | Auth-gated route. Needs Playwright Lighthouse run with a seeded user session |
| §18.472 Cherry-pick PR #44 migrations from backup tag into git | **NEEDS DECISION** | Requires locating the backup tag and confirming migrations 00028/00029/00030 are still desired (the rename has shipped) |

### Needs Supabase env keys

| ID | Item |
|----|------|
| W2.1 | §3 — round-out remaining 30+ Playwright auth e2e tests (signup confirm-email round-trip, magic-link expiry, etc.) |
| W2.8 | §19 — cross-browser Playwright multi-project setup (`webkit`, `firefox`, mobile emulation) |
| §3.41 | `.github/workflows/e2e.yml` running on PR |

### You-only (external systems)

| ID | Item |
|----|------|
| §1.5-§1.8 | Rotate `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `MAILERLITE_API_KEY` + mark Sensitive in Vercel |
| §1.9-§1.10 | Verify Vercel env scope (`vercel env ls`) |
| §1.11-§1.14 | DNS / SSL verification |
| §2.23-§2.26 | Supabase Auth email templates — `{{ .RedirectTo }}` pattern |
| §16.448 | Supabase RLS audit (needs Supabase MCP query pass; can be agent-assisted) |
| §16.450 | Pen-test login + signup (or hire firm) |
| §18.469, .473-.476 | Production data hygiene — test rows in `auth.users` and `course_enrollments`, Stripe product display names |

### Marketing / GTM follow-ups (not launch-blockers per spec)

- §14.411-414 — Submit sitemap to Google Search Console, Bing Webmaster, verify both domains, set preferred domain
- §15 — Analytics call-site coverage for `briefing_booked` (partially closed by #165) and `certificate_issued`

---

## Repo bookkeeping snapshot

- Active plans: `Plans/aibi-launch-spec-v2.md` (canonical), `Plans/performance-optimization-2026-05-17.md`, `Plans/research-page-design-brief.md`
- Plans recently completed and archived during this session window: `free-assessment-output-revision.md` (via #172)
- All session-created docs live under `docs/reviews/` and `docs/handoffs/`
- Local `main` has two un-pushed bookkeeping commits (`e9b5c4f`, `d04a51e`) from your toolbox handoff work — push these if/when ready

---

## Headline metric

Before this session: launch checklist ~510 open / 67 ticked (per Wave 5 log).
After this session: **15 additional items closed** (388, 389, 390, 391, 400, 405, 406, 408, 444, 445, 446, 447, 449, 452, 468 once smoke-confirmed).

Most remaining launch-blockers are environment / data / external-system items that require your hands on Vercel, Supabase, Stripe, and DNS. The code-shaped audit work is substantially exhausted for this pass.
