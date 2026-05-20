# Ship-It Security Review — 2026-05-20

**Scope:** Pre-launch "ship it" re-audit across five requested risk areas —
(1) API routes without auth, (2) hardcoded credentials, (3) rate limiting,
(4) input validation, (5) orphaned files — plus other critical issues. Full
re-audit, not delta, including the gaps the
[2026-05-18 audit](./security-audit-2026-05-18.md) deferred (RLS policies,
dependency audit, git-history secret scan).

**Methodology:** Static analysis of `src/`, `next.config.mjs`, `public/`,
`supabase/migrations/`; caller tracing; `npm audit`; git-history secret scan;
and **runtime smoke tests** (`next start` + curl) of representative routes.

**Branch:** `claude/security-audit-checklist-Qfx5k`.

**Disposition:** safe fixes applied in-branch and runtime-verified; the
Next.js major upgrade was attempted, found to regress a paid feature, and
reverted (see F1).

---

## Findings

| ID | Severity | Category | Finding | Status |
|----|----------|----------|---------|--------|
| F1 | **High** | Deps | `npm audit`: Next.js 14.2.35 carries 4 high advisories. **Only fixed in next@15.5.16+** (14.x has no patch). Upgrade to 15.5.18 was implemented and built clean, but **regresses PDF generation** (react-pdf throws React #31 under Next 15's runtime — see below). **Reverted.** | **Open — tracked** |
| F2 | Medium | Auth / PII | `/api/user-profile` GET returned the full profile (score, tier, raw answers) by email with no session (only in-memory IP limit) — enumeration + PII read. | **Fixed** (401 when unauthenticated) |
| F3 | Medium | RLS | `certificates` had a `"Public read" USING (true)` policy granting the **public anon key** SELECT on the whole table — enumerate every graduate's name/designation/date. | **Fixed** (migration 00035 + service-role verify) |
| F4 | Low | DoS / cost | `/api/guides/safe-ai-use` rendered a PDF on every request with **no rate limiting** — scrape/DoS vector on an expensive `renderToBuffer`. | **Fixed** (20/IP/hr, mirrors prompt-cards) |
| F5 | Low | Rate limit | `/api/capture-email` IP limit was 50/hr (test value). Set to a funnel-safe 30/hr (not the spec's literal 5 — would 429 conference/NAT crowds; see DECISIONS.md 2026-05-20). | **Fixed** |
| F6 | Moderate | Deps | `@anthropic-ai/sdk` ^0.90 in advisory range (filesystem-memory-tool perms — feature unused here); `ws` 8.x memory disclosure. | **Fixed** (sdk→0.91.1, ws→8.20.1) |
| F7 | Medium | Cost / AI | `/api/sandbox/chat` accepts a client-supplied `systemPrompt` to the billed Anthropic API — an enrolled user can repurpose it as a Claude proxy (bounded by auth + 50/hr). | **Open — tracked** |
| F8 | Low | Rate limit | A few auth-gated endpoints still use in-memory counters (cold-start/region resets). Lower priority since they require a session. Upstash migration pending. | **Open — tracked** |
| F9 | Info | Deps | `postcss` moderate (CSS-stringify XSS) chains to next/geist/@vercel/analytics. **Build-time only** — postcss processes the project's own trusted CSS, not user input. Clearing needs next@16. | **Accepted (N/A at runtime)** |

---

## 1. API routes without auth — PASS (one residual, fixed)

All 46 `route.ts` handlers audited individually (not sampled):
- LLM endpoints well-defended: `toolbox/run` (paid gate + per-min + daily-cost
  caps + PII/injection scan), `sandbox/chat` (auth + 50/hr + scans),
  `aibi-s/chat` & `aibi-s/grade` are 404 stubs.
- Cron routes (`cron/cleanup-rate-limits`, `assessment/pdf/cron-cleanup`)
  gate on `Authorization: Bearer ${CRON_SECRET}`.
- `assessment/pdf/download` enforces `user.id === profileId` (no IDOR).
- `certifications/exam/submit`, `save-proficiency`, all `courses/*` writes
  verify session + enrollment ownership.
- Stripe webhook verifies the signature (`constructEvent`).
- **F2 (fixed):** `user-profile` unauth fallback removed → 401. Verified
  zero blast radius (sole caller is the auth-gated dashboard; new-device flow
  uses magic-link + `/api/dashboard/assessments`).

## 2. Hardcoded credentials — PASS

- Only `.env.local.example` tracked; `.env*` gitignored. No secrets in source.
- **Git-history scan (all commits/branches):** zero committed secret values —
  every match was the variable *name* in docs/env-templates/CI or SQL policy
  names. (History repeatedly notes an operator TODO: rotate
  `SUPABASE_SERVICE_ROLE_KEY` in Vercel — a dashboard action, not code.)
- `SUPABASE_SERVICE_ROLE_KEY` server-only; no true secret has a
  `NEXT_PUBLIC_` prefix; `public/` holds no secrets.

## 3. Rate limiting — PASS after fixes

- Public endpoints use `rateLimitOrFail` (Supabase `rate_limits`, atomic);
  `capture-email` uses the Supabase-backed `email_capture_log`.
- **F4 (fixed):** added rate limiting to `guides/safe-ai-use`.
- **F5 (fixed):** `capture-email` 50→30/IP/hr.
- **F8 (tracked):** remaining in-memory counters are on auth-gated routes.

## 4. Input validation — PASS

Typed payload guards, email regex, length caps, allow-listed enums; DB access
parameterized via the Supabase SDK; no SQLi/SSRF.

## 5. Orphaned files — minimal (no deletion)

No backup/temp/dead code files. `public/lms-prototype/` is intentionally
framed by `/lms-preview`; PDF fonts already moved out of `public/`. Only
clutter: two `… copy.txt` duplicates under `Plans/` — left per the CLAUDE.md
no-delete rule. (Note: `public/artifacts/*.md` are directly downloadable —
confirm none are meant to be email-gated; they're course content, not PII.)

## Other critical checks

- **RLS — PASS (corrected).** An initial grep (single-space regex) falsely
  flagged 4 tables as lacking RLS; they are all enabled in
  `00001_course_tables.sql:150-153` (aligned multi-space formatting).
  Verified: `course_enrollments` (own-row), `activity_responses` /
  `work_submissions` (own-row via enrollment join), `user_profiles` (own-row),
  `institution_enrollments` (service-role-only). The one real issue was
  `certificates` (**F3, fixed**).
- **Headers/CSP — PASS:** enforced CSP (no `unsafe-eval`), HSTS preload,
  X-Frame SAMEORIGIN, nosniff, Referrer-Policy, Permissions-Policy, COOP.
- **Preview auth bypass — PASS:** hard floor on `VERCEL_ENV==='production'`.

---

## F1 detail — why the Next.js upgrade was reverted

The 4 high advisories (RSC cache poisoning, request smuggling in rewrites,
Server-Components DoS, image-optimizer issues) are only patched in
**next ≥ 15.5.16**; 14.x has none. Most are low-applicability here (no remote
images, no i18n, no `beforeInteractive`, no CSP nonces; on Vercel hosting),
with the RSC-cache class being the main genuinely-relevant one.

The upgrade to **15.5.18** was implemented end-to-end: async
`cookies()`/`params`/`searchParams` migration across ~40 files, the
`serverComponentsExternalPackages` → `serverExternalPackages` rename, and
`<a>`→`<Link>` lint fixes. **tsc and `next build` passed (141 pages).**

**But runtime testing showed all PDF routes return HTTP 500** (React error
#31). Root cause: Next 15's server runtime and the externalized
`@react-pdf/renderer` end up using **two different React instances**, so
react-pdf's reconciler receives foreign elements. Bundling react-pdf instead
of externalizing it did **not** fix it. An A/B test (clean worktree on the
original Next 14) confirmed PDF generation returns **200 on 14, 500 on 15** —
i.e., a real regression in the **In-Depth assessment PDF** (paid deliverable)
and the **lead-magnet guide downloads**.

**Decision:** revert to 14.2.35. Shipping a framework major that breaks a paid
feature, days before launch, to close advisories that are largely N/A on this
stack, is the wrong trade. The upgrade is a tracked follow-up needing a
react-pdf/Next-15 compatibility fix (likely a dedicated PDF render path or a
react-pdf release that resolves the React-instance issue) **plus full PDF-surface QA**.

---

## Ship-it checklist

**Fixed in this branch (runtime-verified)**
- [x] `/api/user-profile` unauth PII fallback → 401 (F2)
- [x] `certificates` blanket anon read dropped; verify uses service-role (F3)
- [x] `/api/guides/safe-ai-use` rate-limited (F4)
- [x] `/api/capture-email` 50→30/IP/hr (F5)
- [x] `@anthropic-ai/sdk`→0.91.1, `ws`→8.20.1 (F6)
- [x] PDF generation re-verified working after revert (200 application/pdf)

**Open — decide / schedule**
- [ ] **Next.js 15 upgrade (F1)** — needs react-pdf compatibility fix + PDF QA. 4 highs remain on 14.x until then.
- [ ] Confirm `public/artifacts/*` are intentionally ungated.
- [ ] `apply migration 00035` to the Supabase project (drops the certificates anon-read policy).

**Tracked, non-blocking**
- [ ] `/api/sandbox/chat` server-side system-prompt selection (F7)
- [ ] Upstash for remaining in-memory rate limits (F8)
- [ ] Rotate `SUPABASE_SERVICE_ROLE_KEY` in Vercel (operator)
- [ ] gitleaks in CI; external pen-test; responsible-disclosure body

---

## What this audit does NOT cover

- Live runtime RLS verification against the production DB (policy source
  reviewed; the `user-profile`/`verify` 401/auth paths need a Supabase-configured
  preview to exercise — this container has no Supabase env).
- External pen-test; actual browser-bundle inspection.
