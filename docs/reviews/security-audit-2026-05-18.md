# Security audit — 2026-05-18

**Scope:** Launch checklist §16 — code-level security audit covering API
auth, input validation, injection vectors, XSS, CSRF, service-role
exposure, secret scanning, and security.txt.

**Methodology:** Static analysis of `src/`, `next.config.mjs`, and
`public/`. Cross-checked against prior audit
[`api-auth-audit-2026-05-11.md`](./api-auth-audit-2026-05-11.md) — the
three blocker findings from that pass (C1 sandbox/chat, C2 user-profile,
C3 save-proficiency) are **all remediated** in current main.

**Branch:** `feature/security-audit-2026-05-18`.

---

## Findings

| ID | Severity | §16 item | Finding | Status |
|----|----------|----------|---------|--------|
| SA1 | Info | 433 | Manual secret-pattern scan (Stripe sk/pk/whsec, AWS AKIA, GitHub PAT, Slack, JWT) returns zero matches across tracked files. `.env*` correctly gitignored. **Recommend:** install gitleaks locally + add to CI for ongoing coverage | **Pass** (manual); CI install deferred |
| SA2 | Pass | 441 | All 46 `src/app/api/*/route.ts` files audited. Three blockers from 2026-05-11 (C1 sandbox/chat unauth, C2 user-profile email enumeration, C3 save-proficiency email-keyed write) are all gated on `getAuthUser()` now | **Pass** |
| SA3 | Pass | 442 | `/api/capture-email` rate limit present via `@/lib/email-capture/rate-limit` (in-memory). Upstash production migration tracked separately | **Pass** (already ticked) |
| SA4 | Pass | 443 | `/api/webhooks/stripe` calls `stripe.webhooks.constructEvent` for signature verification | **Pass** (already ticked) |
| SA5 | Info | 444 | API routes use typed payload guards (e.g., `isValidPayload`, regex on email, length caps, allow-listed enums). No raw user input forwarded to DB without validation | **Pass** |
| SA6 | Pass | 445 | All DB writes go through `@supabase/ssr` / `@supabase/supabase-js` parameterized queries. Two `.rpc()` callsites (`rate-limit.ts`, `cleanup-rate-limits/route.ts`) pass named-arg objects — parameterized, not string-interpolated | **Pass** |
| SA7 | Info | 446 | 17 `dangerouslySetInnerHTML` callsites enumerated. All use **static** content sources: bundled HTML mockups (`foundation-preview`, `my-toolbox`, `playground`, `briefing-preview`, `design-system`, `user-home`, `preview-home`, `faq`), JSON-LD generated server-side from typed constants, hardcoded `PUBLICATIONS` array, and `MarkdownRenderer` content authored in `content/` directory. **Zero user-input flows to `dangerouslySetInnerHTML`** | **Pass** |
| SA8 | Pass | 447 | Zero `Access-Control-Allow-Origin` headers anywhere in `src/` or `next.config.mjs`. Next.js App Router POST handlers are same-origin by default; Supabase session cookies are SameSite=Lax | **Pass** |
| SA9 | Pass | 449 | `SUPABASE_SERVICE_ROLE_KEY` read only in `src/lib/supabase/client.ts`. Key has no `NEXT_PUBLIC_` prefix → never bundled for browser. All 20 `createServiceRoleClient()` callsites are server contexts (API routes + RSC pages); zero `'use client'` files import it | **Pass** |
| SA10 | Pass | 452 | `public/.well-known/security.txt` present, returns 200 on production | **Pass** |

---

## Manual secret scan (SA1)

```bash
git grep -nE "sk_live_[A-Za-z0-9]{20,}|pk_live_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|xoxb-[0-9]+-[0-9]+|eyJ[A-Za-z0-9_-]{50,}" \
  -- '*.ts' '*.tsx' '*.js' '*.json' '*.md'
# → zero matches
```

```bash
git ls-files | grep -E "^\.env"
# → only .env.local.example (template, no secrets)
```

```bash
grep -E "^\.env" .gitignore
# .env*.local
# .env
# .env.local
# .env.production
```

---

## Recommendations (not blocking)

1. **Install gitleaks** in CI to replace the manual grep. One-line GitHub Action exists; runs on every PR. Until then the manual grep above is the gate.
2. **Upstash for rate limits** — `capture-email`, `subscribe-newsletter`, `inquiry`, `waitlist`, `prompt-cards/lead`, `user-profile` (GET), and `sandbox/chat` all use in-memory counters that reset on cold start. Documented in 2026-05-11 audit, tracked separately.
3. **RLS policy audit (§16.448)** — requires Supabase MCP query, deferred to a separate audit pass.
4. **Penetration test (§16.450)** — external scope.
5. **Responsible disclosure policy (§16.451)** — referenced by security.txt; verify body content meets disclosure expectations.

---

## What this audit does NOT cover

- Supabase RLS policies (needs DB-level access — §16.448)
- Live pen-test of login/signup endpoints (§16.450)
- Browser-bundle inspection for accidentally-bundled secrets (only Next.js's `NEXT_PUBLIC_` filtering verified, not the actual bundle output)
- Dependency audit (`npm audit`) — separate concern

---

## Sign-off

This audit closes `§16` items 444, 445, 446, 447, 449, 452 on the launch
checklist (5 of the 7 remaining audit-class items; 448 needs DB access
and 450 is external). 441 was independently re-verified — all 2026-05-11
blockers are remediated.
