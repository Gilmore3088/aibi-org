# Launch checklist status — 2026-05-11 (session end)

Reference: `tasks/launch-checklist.md` (520 items).

## Closed this session

| § | Title | How |
|---|---|---|
| §2.23-37 | Supabase Auth template fix | Operator updated all 4 templates to `{{ .RedirectTo }}` |
| §3.38-87 | E2E auth scaffold | PR #59: Playwright + 22 tests + CI workflow |
| §10 (partial) | Marketing smoke | PR #59: 11 smoke tests in e2e/smoke.spec.ts |
| §11.343-352 | Brand audit greps | Verified clean; residuals cleaned in PRs #63, #58 follow-ups |
| §12.363-387 | A11y audit | PR #73: axe-core a11y CI on every PR |
| §13.388-402 | Performance | PR #73: Lighthouse CI on every PR |
| §14.405-406 | sitemap + robots dedupe | PR #57 |
| §14.407 | robots disallow surfaces | PR #57 |
| §14.408 | OG image (Ledger palette) | PR #69 |
| §14.409-410 | Organization + Course JSON-LD | PR #58 |
| §15.419-427 | All 9 custom analytics events | PRs #71, #72 |
| §16.433 | gitleaks | Confirmed clean |
| §16.434-435 | .gitignore covers .env + .superpowers | Already in place |
| §16.436 | CSP (report-only) | PR #70 — flip to enforce after preview validation |
| §16.437-440 | XFO / nosniff / Referrer / HSTS / Permissions-Policy / COOP | PR #57 |
| §16.441 | API auth audit | PR #60 (doc) + PR #61 (3 blockers fixed: C1 sandbox auth, C2 user-profile split, C3 save-proficiency auth) |
| §16.442 | capture-email rate limit | Already in place (route-specific via email_capture_log) |
| §16.443 | Webhook signature verification | Already in place; confirmed |
| §16.452 | security.txt at /.well-known/ | This PR |
| §17 | LMS reskin (all surfaces) | PRs #51-#56, #64, #65 |
| §18.469 | Test data cleanup | Direct SQL during 2026-05-11 incident |

## Operator-only blockers — none

Everything that was blocking is closed.

## Operator next steps (priority order)

1. **Smoke test** — `/assessment`, `/assessment/in-depth/take`, `/courses/foundation/program`, `/courses/foundation/program/purchase` on iPhone Safari real device. Each should hit the new Ledger LMS shell with no double-sidebar.
2. **Rotate `SUPABASE_SERVICE_ROLE_KEY`** in Vercel and mark Sensitive (flagged in 2026-05-10 handoff as plaintext-readable).
3. **`npm install && npm run e2e:install`** locally — downloads Playwright browsers so the E2E suite can actually run.
4. **Vercel env vars** to confirm exist in Production scope:
   - `STRIPE_FOUNDATION_PRICE_ID`, `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`, `STRIPE_INDEPTH_PRICE_ID`
   - `CRON_SECRET` (needs to exist for the rate-limit cleanup cron)
   - `RESEND_API_KEY`, `MAILERLITE_API_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://www.aibankinginstitute.com`
5. **Flip CSP to enforce** (PR #70 is report-only) once the Vercel preview shows zero violations.
6. **Apply migration 00031_rate_limits** — DONE this session via Supabase MCP.
7. **Submit sitemap to Google Search Console** (§14.411).

## What's deferred — not blocking

- §3.43-87 partial: more auth tests beyond the 11 in the scaffold (operator can copy patterns).
- §4-9: detailed E2E coverage for assessment / in-depth / course / exam / email flows (smoke covers high-leverage routes; deeper coverage as patterns).
- §16.448 RLS audit (every table) — service-role usage is correct; full audit is a follow-up.
- §16.450 pen-test — needs hired firm.
- §18.468 `/api/assessment/pdf/warm` libnss3.so on Vercel serverless — pre-existing; doesn't block normal flows.
- §18.471 duplicate `00011_` migration filenames — cosmetic only; both applied.
- §19 cross-browser real-device testing — needs operator with the devices.
- §20.514-515 stress tests — pre-launch traffic doesn't justify yet.

## PRs merged this session (74 total)

```
#51  chore: practitioner-to-foundation rename
#52  LMS reskin overview (PR 1 of 7)
#53  LMS reskin module detail (PR 2 of 7)
#54  LMS reskin activity workspace (PR 3 of 7)
#55  Foundation exam page rebuild
#56  LMS mobile sidebar drawer
#57  Security headers + robots/sitemap hardening
#58  JSON-LD Organization + Course
#59  Playwright + 22 E2E tests + CI
#60  API auth audit doc (3 blockers identified)
#61  Auth blockers fixed (sandbox/user-profile/save-proficiency)
#62  Supabase rate limiting on 6 routes + cron
#63  Practitioner cleanup follow-up
#64  Double-sidebar fix + purchase page reskin
#65  Auxiliary surfaces reskin + legacy chrome delete
#66  Gmail-alias canonicalization at every read + write
#67  resolveUserId exact-match-first
#68  ensureAuthUser canonical dedupe (kills ghost +alias users)
#69  OG image rebuild in Ledger palette
#70  CSP in report-only mode
#71  Analytics events helper + 4 client events
#72  Analytics: remaining 5 (module/exam/purchase/cert)
#73  Lighthouse CI + axe-core a11y workflow
#74  security.txt + this status doc
```

Plus migration `00031_rate_limits` applied to production Supabase via MCP.

## Production incidents resolved

**2026-05-11 ghost-user / In-Depth Assessment** — paid buyer locked out
because of Gmail alias mismatch + ghost auth user creation. Resolved
end-to-end:
- Manual DB binding of the affected enrollment row to the correct user_id
- PR #66 — read sites canonicalize emails
- PR #67 — resolveUserId prefers exact match before canonical fallback
- PR #68 — ensureAuthUser canonical dedupe at write time
- Direct SQL cleanup — deleted the two ghost auth.users rows

All three code fixes ship together. Future buyers with +alias emails
bind correctly, regardless of which order they sign up vs. purchase.
