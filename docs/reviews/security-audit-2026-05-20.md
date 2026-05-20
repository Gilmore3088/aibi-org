# Ship-It Security Review — 2026-05-20

**Scope:** Pre-launch "ship it" re-audit across five requested risk areas —
(1) API routes without auth, (2) hardcoded credentials, (3) rate limiting on
API endpoints, (4) endpoints missing validation, (5) orphaned files — plus
other critical issues. Full re-audit, not delta: every `route.ts` re-checked,
plus the gaps the [2026-05-18 audit](./security-audit-2026-05-18.md) deferred
(RLS policies, dependency audit, in-memory rate-limit migration).

**Methodology:** Static analysis of `src/`, `next.config.mjs`, `public/`,
`supabase/migrations/`; caller tracing for the one residual auth finding;
`npm audit` for dependencies.

**Branch:** `claude/security-audit-checklist-Qfx5k`.

**Disposition this pass:** safe quick wins fixed in-branch; breaking / infra
items tracked below as a checklist (no destructive action, no dep upgrades
that break the build).

---

## Findings

| ID | Severity | Category | Finding | Status |
|----|----------|----------|---------|--------|
| F1 | **High** | Deps | `npm audit`: Next.js 14 carries **4 high** advisories (WebSocket-upgrade SSRF, RSC cache poisoning, Image-Optimization DoS, beforeInteractive XSS, Pages-Router middleware bypass) + `postcss` moderate. Clean fix = Next.js major bump (breaking). **Not covered by prior audits.** | **Open — tracked** |
| F2 | Medium | Auth / PII | `/api/user-profile` GET had an **unauthenticated fallback** returning the full profile row (score, tier, raw answers) by email via service role — email-enumeration + PII read with only an in-memory IP limit. | **Fixed** |
| F3 | Low | Rate limit | `/api/capture-email` IP limit was `50`/hr (bumped for testing); launch-gate spec is `5`/hr. | **Fixed** |
| F4 | Low | Deps | `ws` 8.x uninitialized-memory disclosure (moderate). Non-breaking patch available. | **Fixed** (`ws`→8.20.1) |
| F5 | Medium | Cost / AI | `/api/sandbox/chat` accepts a client-supplied `systemPrompt` (`route.ts:189`) sent to the billed Anthropic API — an enrolled user can repurpose it as a general Claude proxy. Bounded by auth + 50/hr/user limit. | **Open — tracked** |
| F6 | Low | Rate limit | `/api/user-profile` (now auth-only) and several public endpoints rely on **in-memory** counters that reset on cold start / aren't shared across regions. Upstash migration still pending. | **Open — tracked** |
| F7 | Info | Content gate | `public/artifacts/*.md` (skill templates, use-cards) are directly web-accessible. Confirm none are meant to be email-gated lead magnets (the Safe-AI-Use guide is correctly served via the `/api/guides/safe-ai-use` PDF route, not from `public/`). Marketing content, not PII. | **Open — verify** |
| F8 | Info | Orphaned | Two duplicate `… copy.txt` files tracked under `Plans/_archive/` and `Plans/_assets/`. Doc clutter only. Per CLAUDE.md no-delete rule, not removed without explicit approval. | **Noted** |

---

## 1. API routes without auth — PASS (one residual, now fixed)

46 `route.ts` files audited. Auth-gated routes use `getAuthUser()` /
`getPaidToolboxAccess()` correctly. The billable LLM endpoints are the
highest-risk surface and are well-defended:

- `src/app/api/toolbox/run/route.ts:48` — paid-access gate, per-minute +
  per-day cost caps, PII + injection scans.
- `src/app/api/sandbox/chat/route.ts:80` — auth required, 50/hr/user limit,
  PII + injection scans. (See F5 re: client-supplied system prompt.)
- `src/app/api/aibi-s/chat/route.ts` — stub returning 404; no live AI.

**Residual (F2, fixed):** `src/app/api/user-profile/route.ts` previously fell
back to an email-only lookup when no session was present. That row holds
assessment PII, so anyone could read another person's results by guessing
their email. **Fix:** removed the fallback — no session → `401`; session email
must still match the requested email. Verified zero blast radius:

- Only caller is `getUserDataWithSupabaseFallback()` (`src/lib/user-data.ts:137`)
  on the dashboard (`src/app/dashboard/page.tsx:78`).
- The dashboard is server-auth-gated (`src/app/dashboard/layout.tsx:28-72`);
  the same-origin client `fetch` carries the session cookie, so the
  authenticated branch is always taken for legitimate callers.
- New-device visitors log in via magic link (email capture provisions a
  Supabase Auth account — `ensureAuthUser`, `capture-email/route.ts:177`) and
  read results from the auth-enforced `/api/dashboard/assessments`.
- Free-assessment results pages read by row-UUID (bearer pattern), never by
  email — unaffected.

The now-dead in-memory rate-limit helper in that route was also removed.

## 2. Hardcoded credentials — PASS

- Only `.env.local.example` is tracked; `.env*` correctly gitignored
  (`.gitignore:39-41`). No `sk_live` / `pk_live` / `whsec` / `AKIA` / JWT
  matches in tracked source.
- `SUPABASE_SERVICE_ROLE_KEY` read only in `src/lib/supabase/client.ts`; no
  true secret carries a `NEXT_PUBLIC_` prefix, so none reaches a client bundle.
- `public/` contains no secrets or credentials.

## 3. Rate limiting — PARTIAL (one quick win fixed)

- Public form/checkout endpoints use `rateLimitOrFail` backed by the Supabase
  `rate_limits` table (atomic across instances). `capture-email` is
  Supabase-backed via `email_capture_log`.
- **F3 (fixed):** `capture-email` limit reset `50 → 5`/IP/hr.
- **F6 (open):** in-memory counters elsewhere should move to Upstash
  sliding-window for cold-start / multi-region correctness.

## 4. Input validation — PASS

Typed payload guards, email regex, length caps, allow-listed enums across
routes. `capture-email`'s `isValidPayload` enforces `score === sum(answers)`,
answer bounds (1–4), array length (8 or 12), and bounded optional fields. All
DB access is parameterized via the Supabase SDK — no SQL injection, no SSRF
(no user-controlled fetch URLs).

## 5. Orphaned files — minimal (no deletion this pass)

- No backup/temp/`.bak`/`~` code files tracked.
- `public/` is clean: `lms-prototype/` is intentionally framed by
  `src/app/lms-preview/page.tsx` (not orphaned); PDF fonts were already moved
  out of `public/` to `assets/pdf-fonts/` (2026-05-17).
- Only clutter: two `… copy.txt` duplicates under `Plans/` (F8) — left in
  place per the CLAUDE.md "never delete without explicit consent" rule.

## Other critical checks

- **RLS — PASS:** `user_profiles` has RLS on with an own-row SELECT policy
  (`00002_user_profiles.sql:33-47`); `institution_enrollments` is
  service-role-only with anon/auth denied (`00004_security_hardening.sql:25`);
  `set_updated_at` has a pinned `search_path`. (The `user-profile` route's
  service-role read bypasses RLS by design — now gated behind auth, see F2.)
- **Headers / CSP — PASS:** enforced CSP (no `unsafe-eval`), HSTS w/ preload,
  `X-Frame-Options: SAMEORIGIN`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, COOP (`next.config.mjs:126-185`).
- **Preview auth bypass — PASS:** hard floor on `VERCEL_ENV === 'production'`
  (`src/lib/auth/previewBypass.ts:18`).
- **Stripe webhook — PASS:** signature verified via
  `stripe.webhooks.constructEvent` (`webhooks/stripe/route.ts`).

---

## Ship-it checklist

**Fixed in this branch**
- [x] `/api/user-profile` unauth fallback removed → 401 (F2)
- [x] `/api/capture-email` rate limit 50 → 5 (F3)
- [x] `ws` advisory patched via `npm audit fix` (F4)

**Blocking / decide before launch**
- [ ] **Next.js security upgrade (F1)** — own PR + regression pass; 4 high advisories
- [ ] Confirm `public/artifacts/*` are intentionally ungated (F7)

**Tracked, non-blocking**
- [ ] Upstash for remaining in-memory rate limits (F6)
- [ ] `/api/sandbox/chat` server-side system-prompt selection (F5)
- [ ] gitleaks in CI (carried from 2026-05-18 audit)
- [ ] External pen-test; responsible-disclosure body for `security.txt`

---

## What this audit does NOT cover

- Live pen-test of login/signup endpoints (external scope).
- Browser-bundle inspection of actual built output (only `NEXT_PUBLIC_`
  filtering verified statically).
- Runtime RLS verification against the live database (policy source reviewed,
  not queried).
