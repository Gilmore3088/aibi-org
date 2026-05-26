# AiBI — Technical Design Doc
*The top-level engineering blueprint. Stack choices, service boundaries, repo layout, hosting, environments, secrets, CI/CD. Stitches the Sandbox, Database, and Auth specs into one operable system.*

| | |
|---|---|
| **Audience** | Engineers (new + existing) · DevOps · the PM |
| **Scope** | Foundation Course web app + Sandbox Service + Readiness Assessment + Toolbox + admin surfaces |
| **Authority** | Architecture-level decisions. Per-component specs (Sandbox, Database, Auth) own their internals; this doc owns the seams. |
| **Status** | Spec v1 — read before scaffolding the repo |

---

## 1 · The high-level picture

```
                                                  ┌──────────────────────────────┐
                                                  │   Stripe (hosted checkout)   │
                                                  └───────────────┬──────────────┘
                                                                  │ webhook
   ┌────────────────────────────┐                                  ▼
   │ Learner / Team admin       │   HTTPS    ┌────────────────────────────────────┐
   │ (browser, mobile-responsive│ ─────────► │ Next.js web app (Vercel)            │
   │  Next.js client)            │            │  · App Router (server-first)        │
   └────────────────────────────┘            │  · Tier/role gating · Toolbox UI    │
                                              │  · Stripe webhook handler           │
                                              │  · Resend transactional             │
                                              │  · Lead-bind, gate, team flows      │
                                              └─────┬──────────┬────────┬──────────┘
                                                    │          │        │
                                                    ▼          ▼        ▼
                                       ┌────────────────────┐  │   ┌──────────────────┐
                                       │  Sandbox Service   │  │   │  MailerLite      │
                                       │  (standalone svc)  │  │   │  (nurture, list) │
                                       │  · provider gateway│  │   └──────────────────┘
                                       │  · prompt assembler│  │
                                       │  · output gate     │  ▼
                                       │  · session log     │  ┌────────────────────────────────┐
                                       └─────────┬──────────┘  │  Supabase                       │
                                                 │             │  · Postgres (DB + RLS)          │
                                                 ▼             │  · Auth (email/password + OAuth)│
                                       ┌─────────────────────┐ │  · Storage (media + exports)    │
                                       │ Anthropic · OpenAI ·│ │  · Realtime (optional)          │
                                       │ Google APIs (LLM)   │ │  · Edge Functions (cron jobs)   │
                                       └─────────────────────┘ └────────────────────────────────┘
```

**Reading guide:** the Sandbox Service is the *only* component with LLM API keys. The web app never holds them and never calls a provider. Supabase is the canonical store of record for everything (auth, learner data, events, media, sandbox config + sessions). MailerLite is the lead-nurture engine; Resend is transactional only.

---

## 2 · Stack choices (and why)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 14 (App Router)** | Already in use on `main`; server components default; supports the SSR + selective `'use client'` posture that CLAUDE.md mandates |
| Language | **TypeScript strict mode** | Repo convention; no `any` without justification |
| Styling | **Tailwind + Ledger design tokens** | CLAUDE.md Design Context; tokens in `src/styles/tokens-ledger.css` |
| Database | **Supabase Postgres** | Already provisioned; RLS gives us the security floor; Auth + Storage in one |
| Auth | **Supabase Auth** | One auth surface, integrates with RLS via `auth.uid()` |
| Payments | **Stripe** | Hosted checkout (no PCI scope); the natural Supabase pairing |
| LLM | **Anthropic (default) · OpenAI · Google** | Multi-provider per PRD FR-S1; cross-vendor comparison is a teachable feature |
| Marketing email | **MailerLite** | Already wired on main (replaced ConvertKit 2026-05) |
| Transactional email | **Resend** | Already wired; verified sender `hello@aibankinginstitute.com` |
| Hosting (web) | **Vercel** | Already production; preview-per-branch is the de facto staging |
| Hosting (Sandbox Service) | **Vercel Edge or a dedicated Node service** — decide before sandbox build (open §13) | LLM streaming + injection-test guarantees may push us to a long-running runtime |
| Analytics | **`@vercel/analytics`** + Supabase `events` table | Plausible is being phased out; the `events` table is the source of truth |
| Scheduling (briefing) | **Calendly** | Existing |

**Why not** — explicit rejections worth pinning so we don't relitigate:
- **No third-party LMS** (no Kajabi, no Thinkific) — PRD FR-N1 + CLAUDE.md decision 2026-05-05.
- **No xAPI / SCORM** — events log direct to Supabase.
- **No third-party CRM** — HubSpot removed 2026-05; not coming back without an explicit decision.
- **No client-side Stripe key** — checkout is a server-side redirect.

---

## 3 · Service boundaries (what runs where)

### 3.1 Web app (Next.js on Vercel)
- All learner-facing UI.
- Server Components for content reads; client islands for interactives.
- Owns: gating UI, Toolbox UI, dashboard, checkout initiation, gate fork.
- Talks to Supabase via the Auth-aware SDK (RLS enforced) for learner reads/writes.
- Talks to the Sandbox Service over HTTPS for any LLM-touching surface.
- Hosts the Stripe webhook handler (`/api/webhooks/stripe`) and the lead-bind hook.

### 3.2 Sandbox Service (standalone)
- See `AiBI_Sandbox_Service_Tech_Spec.md` for full detail.
- Boundary justification: this service owns LLM API keys + system prompts + injection defenses. Isolating it means a Next.js bug or page leak cannot exfiltrate provider keys or system prompts.
- Deployment model: TBD — Vercel Functions vs. dedicated Node service. Decided before sandbox build §13.
- Same Supabase project; uses `service_role` for `sandbox_sessions` writes; reads `exercises` via the server-only view.

### 3.3 Supabase (single project, multiple roles)
- Single project for v1. (Separate test/prod projects deferred — `main` already shares Supabase across preview and production.)
- Three database roles in practice: `anon` (very narrow, public free content), `authenticated` (RLS-scoped to own rows), `service_role` (server-only, used by Stripe webhook, lead-bind, sandbox writes, admin flows).
- Edge Functions used sparingly — only for cron-like jobs (e.g., reconciling missed Stripe webhooks, expiring `pending_entitlements`).

### 3.4 External SaaS
- **Stripe:** checkout sessions, webhook receipts, refund handling.
- **MailerLite:** lead/contact storage, nurture automations.
- **Resend:** verified sender, transactional sends.
- **LLM providers:** Anthropic (default), OpenAI, Google — accessed only via the Sandbox Service.

---

## 4 · Repo layout

The work continues in the existing repo (`TheAiBankingInstitute`), on `feature/addie-v1`. The ADDIE rebuild does not require a new repo — it requires net-new and replaced code in named directories.

```
src/
  app/
    (marketing)/           # / · /about · /resources · /security ...
    courses/foundation/    # course player (replaces /courses/foundation/program)
      [moduleId]/
        [lessonId]/
          page.tsx          # server component; renders modality
          interactive/      # client-component islands per modality
    assessment/            # the $99 In-Depth Assessment (re-spec; extends content/assessments/v2/)
    dashboard/             # learner dashboard
      team/                # admin dashboard (FR-D1..D4)
    api/
      gate/
        capture-email/route.ts
        decline/route.ts
      checkout/
        individual/route.ts
        team/route.ts
        assessment/route.ts
      webhooks/
        stripe/route.ts
      sandbox/
        run/route.ts        # proxy to Sandbox Service (auth-checked)
        ab/route.ts
      team/
        seats/invite/route.ts
        seats/revoke/route.ts
      toolbox/
        items/route.ts
        items/[id]/route.ts
        export/route.ts
  lib/
    supabase/                # SSR client + service-role helpers
    stripe/                  # checkout, webhook verification, products
    mailerlite/              # adapter (legacy "convertkit" names allowed; see CLAUDE.md)
    resend/                  # transactional adapter
    sandbox/                 # client for the Sandbox Service (no LLM logic here)
    auth/                    # session helpers, gating predicates, preview-bypass
    entitlements/            # has-paid? team-admin? predicates
    toolbox/                 # artifact CRUD, versioning, .md export
    analytics/               # events writer
  styles/
    tokens-ledger.css        # Ledger design tokens (existing on main)
content/
  assessments/v2/            # questions + scoring (reconciled with ADDIE spec)
  modules/                   # module/lesson content (DB-backed, but seeded from here)
docs/
  Foundation-Course-ADDIE/   # this spec + siblings
supabase/
  migrations/                # numbered, time-stamped SQL files
  seed/                      # module/lesson seed data
sandbox-service/             # the standalone Sandbox Service (deployment shape TBD §3.2)
  src/
    gateway/                 # provider adapters
    assembler/               # prompt assembly
    gate/                    # output gating
    api/                     # /run, /ab, /skill
  tests/
    security/                # the §14 acceptance suite from the Sandbox spec
```

### Why one repo (monorepo-lite)
- The Sandbox Service shares a small amount of code with the web app (typed Exercise descriptors, event shapes). Keeping them in one repo avoids version-skew at the seam.
- Vercel can deploy multiple projects from one repo if Sandbox Service ends up on Vercel.
- If Sandbox Service moves to a separate runtime later, splitting is a `git mv` away — keep the directory boundary clean now to make that cheap.

---

## 5 · Environments

| Env | Branch | URL | Supabase | Stripe | Sandbox keys | Notes |
|---|---|---|---|---|---|---|
| **Local** | any | `localhost:3000` | shared dev Supabase | test keys | test API keys | `.env.local` (gitignored); `SKIP_*` flags active |
| **Preview** | feature/* | `aibi-<hash>-….vercel.app` | shared prod Supabase | test keys | test API keys | `PREVIEW_AUTH_BYPASS` available; `SKIP_MAILERLITE/RESEND=true` |
| **Production** | `main` | `aibankinginstitute.com` | prod Supabase | live keys | live API keys | All `SKIP_*` flags must be unset; `next.config` throws if `SKIP_MAILERLITE=true` |

**No separate staging.** Vercel preview URLs are the testing surface (CLAUDE.md decision). This branch (`feature/addie-v1`) deploys to its own preview URL by default once pushed.

**Branch promotion (production):**
1. `cd ~/Projects/TheAiBankingInstitute && git merge feature/addie-v1`
2. `git push origin main` — *requires explicit user approval per CLAUDE.md*
3. `git worktree remove .worktrees/addie-v1`

---

## 6 · Environment variables (additions to CLAUDE.md's authoritative list)

The base list lives in [`docs/env-vars.md`](../env-vars.md). This branch *adds*:

```bash
# Sandbox Service
SANDBOX_SERVICE_URL=                  # e.g. https://sandbox.aibankinginstitute.com
SANDBOX_SERVICE_INTERNAL_TOKEN=       # web app ↔ sandbox service bearer (mTLS or shared secret)

# Stripe — Team SKU (new on this branch)
STRIPE_FOUNDATION_TEAM_SEAT_PRICE_ID= # per-seat price, min 10
                                      # (existing STRIPE_FOUNDATION_INSTITUTION_PRICE_ID may still serve this)

# Anonymous session signing (cookies)
ANON_SESSION_COOKIE_SECRET=           # HMAC key for anon_session_id cookie integrity
```

**Rules unchanged from CLAUDE.md:** never touch Vercel env vars from code; user manages them in dashboard. Service-role + provider keys are server-only, never client-bundled.

---

## 7 · API surface (server endpoints owned by the web app)

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET  /api/lessons/:id` | anon (free) / authenticated (paid) | Lesson body + checks + track variant |
| `POST /api/gate/capture-email` | anon session | Email-to-keep fork |
| `POST /api/gate/decline` | anon session | Decline fork (logs only) |
| `POST /api/checkout/individual` | optional | Stripe Checkout Session for $295 |
| `POST /api/checkout/team` | optional | Stripe Checkout Session for $199/seat × N (N≥10) |
| `POST /api/checkout/assessment` | optional | Stripe Checkout Session for $99 |
| `POST /api/webhooks/stripe` | Stripe signature | Entitlement writes + team/seat creation |
| `POST /api/sandbox/run` | session (anon or auth) | Proxy to Sandbox Service `/run` (auth + rate-limit checked here too) |
| `POST /api/sandbox/ab` | session | Proxy to Sandbox Service `/ab` |
| `POST /api/skill/run` | paid entitlement | Proxy to Sandbox Service `/skill/run` |
| `GET/POST /api/toolbox/items` | lead OR auth | List or save artifacts (server enforces 4-cap on free) |
| `GET  /api/toolbox/items/:id/export` | owner only | `.md` download (signed URL) |
| `POST /api/team/seats/invite` | team admin | Invite seats |
| `POST /api/team/seats/revoke` | team admin | Revoke seat |
| `GET  /api/dashboard/team/progress` | team admin | Reads `team_progress_v` view |
| `GET  /api/account/export` | auth | Export own data (PRD NFR-PRIV2) |
| `POST /api/account/delete` | auth | Initiate 30-day soft-delete |
| `POST /api/cron/reconcile-stripe` | `CRON_SECRET` | Reconcile missed webhooks |

The Sandbox Service exposes its own `/api/exercise/:id`, `/api/sandbox/run`, `/api/sandbox/ab`, `/api/skill/run` (see Sandbox spec §9). Web-app routes above are **proxies** that add auth/rate-limit checks before forwarding. The browser never talks to the Sandbox Service directly.

---

## 8 · CI/CD

| Stage | Tool | Trigger |
|---|---|---|
| Lint | ESLint (`npm run lint`) | Pre-commit (husky) + CI |
| Typecheck | `npx tsc --noEmit` | CI |
| Unit tests | Vitest | CI |
| Sandbox security suite | dedicated harness (Sandbox spec §14) | CI on changes to `sandbox-service/`; **mandatory before pilot** |
| Build | `next build` | Vercel on every push |
| Migrations | `supabase db push` (manual on production; CI may dry-run) | Tag-gated; explicit user approval before prod apply |
| Deploy preview | Vercel | Auto on push to any non-`main` branch |
| Deploy prod | Vercel | Auto on push to `main` (explicit user approval per CLAUDE.md) |

**Pre-commit hooks:** lint + format + `gitleaks` for secret detection (CLAUDE.md). Never bypass with `--no-verify` unless the user explicitly says so.

**Migrations: never `supabase db push` if local and remote histories have diverged** (memory note). Use `supabase db query --linked` for one-off reads on remote; reconcile naming before push.

---

## 9 · Observability

### Logs
- Next.js → Vercel logs (default).
- Sandbox Service → wherever it deploys (Vercel logs or its own platform).
- Supabase logs accessible via `mcp__supabase__get_logs` when debugging.

### Metrics
- Per Sandbox spec §13: p50/p95 latency, daily spend by provider, error/failover rate, injection-attempt rate, runs per lesson.
- Web app: p95 page TTFB, error rate, gate-fork distribution, conversion rates.
- Database: query plan checks (especially RLS policies — confirm partial indexes are used).

### Events
- The `events` table is the analytical spine — every meaningful learner action lands there (see Database spec §5.9).
- Internal dashboards read via `service_role`; no third-party LMS.

### Alerts
- LLM daily spend > budget (Sandbox circuit breaker).
- Stripe webhook signature failure spike.
- Email send failure rate > 1%.
- Sandbox injection-flag rate spike.
- Auth error rate spike (potential credential stuffing).

---

## 10 · Performance budgets

| Surface | Target | Notes |
|---|---|---|
| Content page TTFB | < 500ms p50 | Server components + CDN |
| Lesson player interaction-ready | < 2s p50 | per PRD NFR-PERF1 |
| Sandbox first response | < 3s p50 | per PRD NFR-PERF1 + Sandbox §12 |
| Gate-fork submit | < 1s p50 | The conversion moment — must feel instant |
| Stripe webhook ack | < 1s | Stripe retries on 5xx |
| Page weight (mobile) | JS < 200KB gzipped | mobile-first; bankers won't have great connections |

Hard rules: no client-side LLM SDKs. No third-party analytics scripts beyond `@vercel/analytics` (Plausible exit in progress).

---

## 11 · Build sequence (the order things get built)

A merged sequencing from the Sandbox, Database, and Auth specs.

1. **Infra:** Supabase project confirmed, env vars laid in (Vercel Preview + Production scopes), Stripe products created in test mode, MailerLite groups created, Resend sender verified.
2. **Database migrations 1–7** (Database spec §11 steps 1–7): enums, leads, learner_profiles, teams, seats, modules/lessons/track-variants, entitlements.
3. **Sandbox Service build 1–5** (Sandbox spec §15 steps 1–5): provider gateway with Anthropic adapter; Exercise model + assembler; output gating; `/run` + auth + rate limits; OpenAI + Gemini adapters + switcher.
4. **Database migrations 8–11**: knowledge_checks, assessment_results, toolbox_items + versions, events.
5. **Auth flows:** anon sessions, gate fork endpoints, lead-bind trigger, Stripe webhook + checkout endpoints, team seat invite/accept.
6. **Sandbox Service build 6–8**: A/B and skill modes; logging/events/budgets; security suite passes.
7. **Web app:** lesson player, gate UI, Toolbox UI, account/dashboard.
8. **Team admin dashboard.**
9. **Assessment surfaces** (reconciled with `content/assessments/v2/`).
10. **Content production** (per `AiBI_Module_Production_Tracker.md`) — runs in parallel with steps 2–9 once specs are stable.
11. **Pilot the complete course** with one friendly community bank or credit union.

The critical path: **infra → migrations → sandbox (steps 1–5) → auth flows → lesson player + gate.** Everything else can run in parallel.

---

## 12 · Risks (engineering)

| Risk | Impact | Mitigation |
|---|---|---|
| Sandbox Service deployment shape wrong for streaming | Re-platform mid-build | Lock the deployment target (Vercel Functions vs. dedicated Node) before §3 of Sandbox build sequence. Open §13. |
| LLM provider terms change (training opt-out) | Compliance/buyer-trust hit | Per PRD NFR-PRIV3: confirm commercial terms quarterly; publish provider-data posture page |
| Migration history divergence between local and remote Supabase | Failed `db push` | Use `supabase db query --linked` for one-offs; never `db push` without verifying parity |
| Page-level gating bypassed by a learner | Cross-tenant data leak | RLS is the floor — see Auth §8 layers; treat any cross-tenant leak as sev-1 |
| Webhook reliability | Lost entitlements | Reconciliation cron (§7) + idempotent handlers |
| Anonymous-side abuse | LLM cost spike | Sandbox rate limits + global budget circuit breaker (Sandbox §11) |
| Single Supabase project for preview + prod | Test data contamination | `SKIP_*` flags on preview; never run destructive seed scripts against preview env |

---

## 13 · Open decisions (engineering)

1. **Sandbox Service deployment target** — Vercel Functions (zero-ops, but watch streaming + cold starts) vs. dedicated Node service (more control, more ops). Decide before Sandbox build step 1.
2. **Streaming responses from the sandbox** — Sandbox spec v1 is non-streaming for output-gate integrity. Post-stream scanning is a v1.5 enhancement; design the API contract today so it doesn't break.
3. **Separate Supabase project for preview** — currently shared with prod. Cheap to add later; defer unless a destructive test forces it.
4. **Edge vs. Node runtime per route** — most routes run Node for full Supabase SDK support; static marketing pages can be Edge. Decide per-route; no global default.
5. **Cron host** — Vercel Cron vs. Supabase Edge Functions. Either works; pick on the first concrete job (Stripe reconciliation).
6. **Image/CDN strategy for course media** — Supabase Storage + Next.js Image? Or a dedicated CDN for video segments? Decide once recorded media exists.

---

## 14 · Cross-references

- Foundation PRD §9 (integrations), §10 (architecture).
- Sandbox Service Tech Spec (this doc's §3.2 references it for internals).
- Database Schema & RLS Spec (this doc's §11 step-2 references its §11 migration order).
- Auth & Entitlements Spec (this doc's §11 step-5 references its §4–§7 flows).
- CLAUDE.md — Architecture, Quick Reference, Git Worktree Layout, Deployment, Env Vars, Workflow Orchestration.
- Handoff Docs Checklist — closes the "Technical Design Doc" P1.
