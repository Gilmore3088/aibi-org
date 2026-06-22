# Environment Variables — authoritative reference

Generated from a full audit of every `process.env.*` reference in `src/`,
`next.config.mjs`, and `middleware.ts` (launch-checklist §1 item 9, 2026-05-20).
Use this to diff against `vercel env ls` for each scope. **This list — not the
`CLAUDE.md` snippet — is authoritative**; CLAUDE.md's env section is stale (see
"Discrepancies" below).

## Required in Production (server secrets — mark Sensitive)

| Var | Used by |
|-----|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | server DB writes / RLS-bypass reads |
| `STRIPE_SECRET_KEY` | checkout + webhook |
| `STRIPE_WEBHOOK_SECRET` | webhook signature verification |
| `MAILERLITE_API_KEY` | assessment tier-routing groups |
| `RESEND_API_KEY` | transactional email (assessment breakdown) |
| `ANTHROPIC_API_KEY` | Toolbox playground + practice sandbox |
| `CRON_SECRET` | auth for `/api/cron/*` and `/api/assessment/pdf/cron-cleanup` |
| `TOOLBOX_IP_HASH_SALT` | salts hashed IPs for AI rate limiting |

### Admin access (Production)

| Var | Used by |
|-----|---------|
| `FUNNEL_ADMIN_EMAILS` | comma-separated allowlist of operator emails allowed to view `/admin/*` (e.g. `/admin/funnel`). Server-only; not a secret but gates PII. Unset → `/admin` is inaccessible (fail-closed). |

### Stripe price IDs (Production)
| Var | Notes |
|-----|-------|
| `STRIPE_FOUNDATION_PRICE_ID` | $295 Foundation. Legacy fallbacks still read: `STRIPE_FOUNDATIONS_PRICE_ID`, `STRIPE_AIBIP_PRICE_ID` |
| `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID` | team/seat price. Fallbacks: `STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID`, `STRIPE_AIBIP_INSTITUTION_PRICE_ID` |
| `STRIPE_INDEPTH_PRICE_ID` | **note the spelling — `INDEPTH`, not `IN_DEPTH`.** $99 In-Depth Assessment |

### MailerLite + Resend config (Production)
| Var | Notes |
|-----|-------|
| `MAILERLITE_GROUP_ID_ASSESSMENT` | tier-routing group |
| `RESEND_FROM` | verified sender, e.g. `hello@aibankinginstitute.com` |
| `RESEND_FROM_NAME` | display name |

### Optional LLM providers (only if enabled in the Toolbox model menu)
`OPENAI_API_KEY`, `GEMINI_API_KEY`

## Public (NEXT_PUBLIC_ — shipped to the browser, not secret)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CALENDLY_URL`

## Preview/test flags — NEVER set in Production scope

| Var | Effect |
|-----|--------|
| `PREVIEW_AUTH_BYPASS` | unlocks auth-gated layouts on preview (hard-floored off in prod) |
| `SKIP_MAILERLITE` | suppress live MailerLite calls (next.config throws if `true` in prod) |
| `SKIP_RESEND` | suppress live email |
| `SKIP_PDF_GENERATION` | skip PDF render |
| `SKIP_SUPABASE_PROFILES` | skip profile writes |
| `SKIP_ENROLLMENT_GATE` | bypass course entitlement checks |
| `SKIP_CRON_AUTH` | **security-sensitive** — bypasses the `CRON_SECRET` check on cron routes. Must never be `true` in Production. |
| `COMING_SOON` | coming-soon gate toggle |

## Platform-injected (do not set manually)

`NODE_ENV`, `VERCEL`, `VERCEL_ENV` (Vercel sets these); `ANALYZE`,
`PUPPETEER_LOCAL_CHROME` (local only).

## Discrepancies found (need a docs fix — not yet applied)

CLAUDE.md's "Environment Variables" block is out of date. These appear there
but have **zero code usage** and should be removed/corrected:

- `CONVERTKIT_API_KEY`, `CONVERTKIT_ASSESSMENT_FORM_ID`,
  `CONVERTKIT_NEWSLETTER_FORM_ID` → superseded by MailerLite.
- `HUBSPOT_API_KEY` → HubSpot integration not present in code.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` → analytics is `@vercel/analytics`, not Plausible.
- `NEXT_PUBLIC_STRIPE_KEY` → unused (checkout is a server-side redirect; no
  client publishable key needed).
- `SKIP_CONVERTKIT` → superseded by `SKIP_MAILERLITE` (one stale code reference remains).
- `STRIPE_IN_DEPTH_PRICE_ID` (CLAUDE.md) vs `STRIPE_INDEPTH_PRICE_ID` (code) —
  **operator trap**: setting the CLAUDE.md spelling in Vercel leaves In-Depth
  checkout misconfigured. Code reads `STRIPE_INDEPTH_PRICE_ID`.
