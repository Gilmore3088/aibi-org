# The AI Banking Institute (AiBI)
# CLAUDE.md — Project Intelligence File

## Reference Plans — Canonical Source of Truth

**Read [`Plans/aibi-launch-spec-v2.md`](./Plans/aibi-launch-spec-v2.md) before any non-trivial work.** It is the active May 2026 launch spec. If a request conflicts with it, flag it before coding.

### Project organization (folder roles)

The repo separates **plans**, **tasks**, **handoffs**, and **reference docs** into four folders, each with its own README that defines the local rules. Read the folder README before adding files to that folder:

| Folder | Role | Rules |
|--------|------|-------|
| [`Plans/`](./Plans/README.md) | One markdown plan per initiative (WHAT + WHY). Frontmatter required. | [`Plans/README.md`](./Plans/README.md) |
| [`tasks/`](./tasks/README.md) | One task list per active plan (checkboxes). `MASTER.md` is the universal index. | [`tasks/README.md`](./tasks/README.md) |
| [`docs/`](./docs/README.md) | Runbooks, references, reviews. Not plans. | [`docs/README.md`](./docs/README.md) |
| [`docs/handoffs/`](./docs/handoffs/README.md) | Dated session handoffs and status snapshots. Immutable once written. | [`docs/handoffs/README.md`](./docs/handoffs/README.md) |

**Index files:**
- [`CHRONOLOGY.md`](./CHRONOLOGY.md) — every plan/review/handoff in chronological order with status
- [`tasks/MASTER.md`](./tasks/MASTER.md) — the universal "what's outstanding right now?" registry
- [`DECISIONS.md`](./DECISIONS.md) — chronological override log explaining direction changes

**Subfolders (each has its own README):**
- `Plans/_archive/` — superseded or shipped plans (incl. the old HTML specs)
- `Plans/_assets/` — PDFs, docx, images referenced by plans
- `Plans/_ideas/` — stash for future ideas (gitignored, local-only)
- `docs/_archive/` — stale references and pre-Ledger audits
- `docs/reviews/` — code/security/UI reviews with open findings
- `tasks/_done/` — completed task files (kept for history)

### Workflow when you create something new

```
New plan        → Plans/<slug>.md  (frontmatter: status, created, owner-tasks)
                → tasks/<slug>.md  (the checklist)
                → append row to tasks/MASTER.md + CHRONOLOGY.md

New handoff    → docs/handoffs/<type>-YYYY-MM-DD[-context].md
New review     → docs/reviews/<scope>-audit-YYYY-MM-DD.md
New idea seed  → Plans/_ideas/<slug>.md  (low-ceremony, gitignored)
```

**Assessment content lives in `content/assessments/<version>/`** — each version is a folder (questions, scoring, copy) so content can iterate without touching component code. **Free-funnel current version: `v3`** (12 flat questions, twelve readiness dimensions, 12–48 score range). **In-Depth ($99) and Foundation post-assessment remain on `v2`** (48-question pool, eight dimensions, 48–192 raw). See `content/assessments/v3/` and the 2026-05-27 DECISIONS entry.

---

## What This Project Is

The AI Banking Institute (AiBI, pronounced "AI-bee") is an AI proficiency and education company built exclusively for community banks and credit unions (~8,400 US institutions). The business model is built around a free AI readiness assessment that leads to a Foundations Certificate plus advanced credentials (AiBI-S, AiBI-L) and optional coaching advisory for institutions running cohorts. See the 2026-04-24 entry in the Decisions Log for the shift from implementation-led consulting to education-first positioning, and the 2026-05-09 entry for the Ledger brand refresh and the AiBI-Practitioner → AiBI Foundations rename.

**The website is the sales funnel.** The assessment is the primary conversion mechanism. Every technical decision should be evaluated against whether it helps or hinders: assessment completion → email capture → Executive Briefing booking.

**Domains:** AIBankingInstitute.com (primary) + AIBankingInstitute.org (registered)
**Brand nickname:** AiBI | **Tagline:** "Turning Bankers into Builders" (as of 2026-04-15)
**Course + credentials:** AiBI Foundations (course) · Foundations Certificate (entry credential) · AiBI-S (Specialist) · AiBI-L (Leader)

> **Tagline history:** The original "A-B-C of AI Banking" tagline was retired
> per the v1 landing page PRD feedback doc and superseded by "We turn your
> bankers into your builders" (2026-04-15), which was further tightened to
> "Turning Bankers into Builders" (same session). The three-pillar framework
> (Accessible, Boundary-Safe, Capable) remains as internal curriculum
> structure but is **described**, not branded as a trademarked acronym.

---

## CRITICAL — NEVER DELETE WITHOUT EXPLICIT CONSENT

**NEVER delete, drop, or destroy ANY external resource (Supabase branches, database tables, Vercel deployments, Stripe products, DNS records, ConvertKit sequences, HubSpot contacts, etc.) without EXPLICIT user approval. This includes "recreating" — deleting and recreating IS deleting. When asking approval for ANY destructive action, use ALL CAPS:**

> "⚠️ THIS WILL DELETE THE SUPABASE PROJECT AND ALL ITS DATA. PROCEED? (yes/no)"

**No exceptions. No "it'll be fine." Ask first, in caps, every single time.**

## CRITICAL — ALWAYS ASK WHICH BRANCH

**At the start of EVERY session, before doing ANY work:**

> "Which branch should I work on — main or a feature branch?"

Then run `git worktree list` to confirm layout before proceeding.

## CRITICAL — PUSH BACK ON BAD IDEAS

The user is not a developer. Before implementing anything proposed:

1. **Verify the premise** — Investigate first. Confirm it's actually a problem before writing code.
2. **Challenge when wrong** — If a suggestion would introduce bugs, add unnecessary complexity, or misunderstands the code, say so clearly in plain language.
3. **Propose alternatives** — If the idea has merit but the approach is off, suggest the better path.
4. **Don't be a yes-man** — "Let me check if that's actually an issue" is always a valid first response.

---

## Quick Reference

| Task | Command |
|------|---------|
| Dev server (main) | `cd ~/Projects/TheAiBankingInstitute && npm run dev` |
| Dev server (feature) | `cd ~/Projects/TheAiBankingInstitute/.worktrees/<feature> && npm run dev` |
| Build | `npm run build` (in relevant worktree) |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Open a preview (de facto staging) | `git push origin feature/<n>` — Vercel auto-builds and surfaces a preview URL on the PR |
| Push to production | `cd ~/Projects/TheAiBankingInstitute && git merge feature/<n> && git push origin main` |
| List worktrees | `git worktree list` |
| Add feature worktree | `git worktree add .worktrees/<n> -b feature/<n> main` |
| Remove worktree | `git worktree remove .worktrees/<n>` |

*Push commands require explicit user approval before execution.*

---

## Architecture

- **Framework:** Next.js 14 (App Router), TypeScript strict mode, Tailwind CSS
- **Hosting:** Vercel (AIBankingInstitute.com on main branch)
- **Database / Auth:** Supabase (Postgres + RLS)
- **Payments:** Stripe — In-Depth Assessment ($99) and AiBI-Foundation course ($295). Live unit prices in `src/app/courses/foundation/program/page.tsx` (`priceUSD: 295`) and the In-Depth purchase flow.
- **Email / Sequences:** MailerLite (assessment tier-routing groups, newsletter, automations) + Resend (transactional — assessment breakdown, course/cert emails). *(Replaced ConvertKit, 2026-05; some `lib/mailerlite` function names still read "convertkit" — legacy naming only.)*
- **CRM:** None. *(HubSpot removed — 0 refs in code as of 2026-05-21.)*
- **Analytics:** `@vercel/analytics` + Plausible coexist (2026-05-21; Plausible still has ~7 call sites — the deferred-queue pattern below still applies). Full cutover to `@vercel/analytics` is in progress, not complete.
- **Scheduling:** Calendly (popup or inline embed — Executive Briefing link)
- **LMS (Phase 2):** In-house — `src/lib/lms/`, `src/lib/course-harness/`, `src/lib/certificates/`. Course content + entitlements live in Supabase (`course_enrollments` table). No third-party LMS, no Kajabi, no Zapier.

### Git Worktree Layout

| Directory | Branch | Purpose |
|-----------|--------|---------|
| `~/Projects/TheAiBankingInstitute` | main (permanent) | Home base, production code, plans, CLAUDE.md |
| `~/Projects/TheAiBankingInstitute/.worktrees/<feature>` | feature/* (temporary) | Per-feature, removed when merged |

**Worktrees are CORRALLED under `.worktrees/` inside the project — never as
sibling folders in `~/Projects`** (decision 2026-05-22). A worktree is the
same repo (one `.git`, shared history), just a second working dir for a
branch; `.worktrees/` keeps them out of `~/Projects` so the home directory
doesn't accumulate one folder per feature. `.worktrees/` is hidden from the
main working tree via `.git/info/exclude` (local, never committed).

There is no separate `staging` environment. Vercel auto-deploys every
non-main push as a **preview URL** (`https://aibi-<hash>-…vercel.app`);
that is the testing surface.

**Starting a feature worktree:**
```bash
cd ~/Projects/TheAiBankingInstitute
git worktree add .worktrees/<n> -b feature/<n> main
ln -s ~/Projects/TheAiBankingInstitute/.env.local .worktrees/<n>/.env.local
cd .worktrees/<n> && npm install
```

**Rules:**
- `~/Projects/TheAiBankingInstitute` stays on `main` — never switch it to a feature branch
- All worktrees live under `.worktrees/` — never create sibling `~/Projects/aibi-<feature>` folders
- `.env.local` lives in `~/Projects/TheAiBankingInstitute` and is symlinked into feature worktrees
- Never stash — commit WIP instead (`git commit -m "WIP: ..."`)

---

## Deployment

**Environments (two — there is no staging):**
- **Preview:** Vercel auto-deploys every non-main branch push to a unique
  URL (`https://aibi-<hash>-gilmore3088s-projects.vercel.app`). Surfaced
  on the PR. Uses Vercel "Preview" env scope. Test keys where applicable;
  same Supabase as production (by design — no separate Supabase project).
- **Production:** `aibankinginstitute.com` (main branch) — live keys.
  Vercel auto-deploys on push to `main`.

**MANDATORY RULES:**
- NEVER run `git push origin main` without EXPLICIT user approval —
  it goes straight to production.
- Pushes to feature branches are safe (preview URL only) but still
  require approval before the first push of a session.
- NEVER touch environment variables in Vercel — user manages these in
  the Vercel dashboard.

---

## Environment Variables

**Authoritative list:** [`docs/env-vars.md`](./docs/env-vars.md) — generated
from a full `process.env.*` audit (launch §1 item 9). Diff it against
`vercel env ls`. The block below mirrors it; if they ever disagree, the audit
doc wins.

> **2026-05-20:** this section was corrected. The old block listed
> ConvertKit, HubSpot, Plausible, and `NEXT_PUBLIC_STRIPE_KEY`, none of which
> the code uses anymore (ConvertKit→MailerLite, HubSpot removed,
> Plausible→`@vercel/analytics`, checkout is a server-side redirect so no
> client Stripe key). It also documented `STRIPE_IN_DEPTH_PRICE_ID`, but the
> code reads `STRIPE_INDEPTH_PRICE_ID` (no underscore).

```bash
# .env.local — NEVER commit this file

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=             # server-only; mark Sensitive in Vercel

# --- Email (MailerLite + Resend) ---
MAILERLITE_API_KEY=
MAILERLITE_GROUP_ID_ASSESSMENT=        # assessment tier-routing group
MAILERLITE_GROUP_ID_NEWSLETTER=        # AI Banking Brief subscribers
RESEND_API_KEY=                        # transactional email (assessment breakdown)
RESEND_FROM=hello@aibankinginstitute.com   # verified sender (lowercase exact)
RESEND_FROM_NAME=The AI Banking Institute

# --- Stripe ---
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FOUNDATION_PRICE_ID=            # $295 AiBI-Foundation (legacy fallbacks still read: STRIPE_FOUNDATIONS_PRICE_ID, STRIPE_AIBIP_PRICE_ID)
STRIPE_FOUNDATION_INSTITUTION_PRICE_ID=   # team/seat price (fallbacks: *_FOUNDATIONS_*, *_AIBIP_*)
STRIPE_INDEPTH_PRICE_ID=               # $99 In-Depth Assessment — note: INDEPTH, not IN_DEPTH

# --- AI providers (Toolbox playground + practice sandbox) ---
ANTHROPIC_API_KEY=
OPENAI_API_KEY=                        # only if OpenAI models are on the Toolbox menu
GEMINI_API_KEY=                        # only if Gemini models are on the Toolbox menu

# --- Cron + rate limiting ---
CRON_SECRET=                           # Bearer auth for /api/cron/* and pdf cron-cleanup
TOOLBOX_IP_HASH_SALT=                  # salts hashed IPs for AI rate limiting

# --- Public (shipped to the browser) ---
NEXT_PUBLIC_SITE_URL=https://www.aibankinginstitute.com
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/[handle]/executive-briefing

# Preview/local only — suppress live side-effects on non-production. Never set
# these in Production scope. (next.config throws if SKIP_MAILERLITE=true in prod.)
SKIP_MAILERLITE=true
SKIP_RESEND=true
SKIP_PDF_GENERATION=true
SKIP_SUPABASE_PROFILES=true
SKIP_ENROLLMENT_GATE=true
SKIP_CRON_AUTH=true                    # SECURITY: bypasses CRON_SECRET — must NEVER be true in Production
# COMING_SOON removed 2026-05-27 — coming-soon gate fully evicted from code. Safe to delete from Vercel.

# Optional preview-only auth bypass. The helper at
# src/lib/auth/previewBypass.ts already auto-fires when Supabase isn't
# configured, so usually you do not need to set this. Use it when
# Supabase IS configured on preview but you want to skip its gate for
# visual QA. Refused outright when VERCEL_ENV === 'production'.
PREVIEW_AUTH_BYPASS=true
```

---

## Preview Auth Bypass

`src/lib/auth/previewBypass.ts` lets `/dashboard` and
`/courses/foundation/program/*` render on a Vercel preview without a
Supabase session. Three-layer safety:

1. **Hard floor:** `VERCEL_ENV === 'production'` → always refuse,
   regardless of any env var.
2. **Explicit opt-in:** `PREVIEW_AUTH_BYPASS=true` → bypass on (set
   it on the Vercel Preview scope only).
3. **Auto-fire:** if neither of the above triggers, bypass when
   `NEXT_PUBLIC_SUPABASE_URL` is missing — the auth gate would just
   redirect to a login page that can't authenticate anyone.

The bypass only unlocks the layout-level redirect. API routes still
enforce auth (`/api/dashboard/*` returns 401). The dashboard page
handles empty data gracefully, so design QA works end-to-end on
previews. Production is inert because Supabase is configured AND the
hard-floor blocks even mis-scoped env vars.

When adding a new auth-gated layout, import and call
`isPreviewAuthBypassEnabled()` at the top — short-circuit with
`return <>{children}</>` before any redirect logic.

---

## Chromeless Routes

`src/app/layout.tsx` keeps a `CHROMELESS_PATHS` list — routes that
suppress the global `SiteNav` because they render their own brand
lockup (`/auth/*`, `/design-system`, etc.). Two notes:

- `/courses/foundation/program` is **intentionally not chromeless** —
  enrolled learners need the global nav as their way back to the
  rest of the site. `CourseShell`'s sidebar + breadcrumb cover the
  course tree only.
- The forwarding mechanism uses `x-pathname` set on the response by
  middleware. There is an in-flight question about whether that
  reaches RSC reliably; if a chromeless path ever leaks the global
  nav, the fix is to set `x-pathname` on the forwarded REQUEST
  headers in middleware, not just the response.

---

## Page Routes

| Route | Render | Priority | Notes |
|-------|--------|----------|-------|
| `/` | SSR | MVP | Homepage. ROI Calculator is a client component island. |
| `/assessment` | CSR | MVP | All state in useState + sessionStorage. Score visible before email gate. |
| `/services` | SSR | MVP | Three engagement tiers. Calendly embed. |
| `/certifications` | SSR | MVP | **Phase 1: inquiry form ONLY. No Stripe CTA until Phase 2.** |
| `/foundations` | (redirect) | — | 308 → `/education` (see `next.config.mjs`). Foundation course lives at `/courses/foundation/program` at $295. |
| `/security` | SSR | Phase 2 | Pillar B landing. Free guide download + email gate. |
| `/about` | SSR | Phase 3 | Founder story. |
| `/resources` | CSR | Shipped | Artifact Library. Starter kits, role playbooks, templates, desk cards, paid previews. Single page with anchor sections (`#starter-kits`, `#role-playbooks`, `#templates`, `#desk-cards`, `#preview-paid`). Template cards expose HTML (`/research/templates/<slug>`) + PDF (`/downloads/template-<slug>.pdf`). PDFs regenerated by `node scripts/generate-template-pdfs.mjs` against a running dev server. **Source of truth for template content is `src/app/research/templates/data.ts`** — `/resources` only links; it does not author. The 2026-05-26 `/resources → /research` exact-match redirect was removed 2026-05-28; the sub-path redirect (`/resources/:slug+ → /research/:slug+`) is preserved for legacy article URLs. |
| `/api/capture-email` | API | Shipped | MailerLite group/tier routing (`@/lib/mailerlite`) + Resend breakdown (`@/lib/resend`) + Supabase persist. Suppressed on preview via `SKIP_MAILERLITE` / `SKIP_RESEND`. Rate-limited 30/IP/hr (DECISIONS 2026-05-20). |
| `/api/create-checkout` | API | Phase 2 | Stripe Checkout Session. |
| `/api/webhooks/stripe` | API | Phase 2 | payment.success → insert into `course_enrollments` → MailerLite welcome tag. |

---

## Assessment Tool — The Most Important Feature

Must work on mobile in under 3 minutes. One question per view on mobile. Score ring animation on results. Gets the most QA time before launch.

### State Shape

```typescript
interface AssessmentState {
  currentQuestion: number;     // 0–11 (v3 has 12 questions; v2 had 8)
  answers: number[];           // scores 1–4 per question
  phase: 'questions' | 'score' | 'results';
  email: string;
  emailCaptured: boolean;
}
```

### Scoring Logic

```typescript
// v3 score range is 12–48 (12 questions × 1–4 points each).
// Tier ids unchanged from v2 so downstream consumers (sequences, dashboards) keep working.
const getTierV3 = (total: number) => {
  if (total >= 41) return { id: 'ready-to-scale',     label: 'Ready to Scale',     colorVar: 'var(--ink)' };     // 41–48
  if (total >= 33) return { id: 'building-momentum',  label: 'Building Momentum',  colorVar: 'var(--gold)' };    // 33–40
  if (total >= 23) return { id: 'early-stage',        label: 'Early Stage',        colorVar: 'var(--gold)' };    // 23–32
  return                  { id: 'starting-point',    label: 'Starting Point',     colorVar: 'var(--ink)' };     // 12–22
};
// Mockup palette: --ink (navy), --gold, --cream, --slate-{400..600}, --emerald-700.
// Never hardcode hex outside of tokens-mockup.css; never use legacy --color-* names.
```

### Critical UX Rule

The **full readiness report is gated behind email capture** — score, tier, dimension breakdown, and starter artifact all hidden until the user submits a work email at step 13 (post Q12). After submission, the on-page report renders inline (no "check your inbox" wait state). The 12-question flow gives enough sunk cost that the email gate doesn't read as extractive. See the 2026-05-18 entry in DECISIONS.md for the reversal of the prior partly-gated approach, and issue #189 for the implementation.

### State Persistence — Required Before Launch

```typescript
// Sync to sessionStorage on every answer (prevents loss on mobile tab kill)
useEffect(() => {
  if (answers.length > 0) {
    sessionStorage.setItem('aibi-assessment', JSON.stringify({ answers, currentQuestion }));
  }
}, [answers, currentQuestion]);

// Restore on mount
useEffect(() => {
  const saved = sessionStorage.getItem('aibi-assessment');
  if (saved) {
    const { answers: a, currentQuestion: q } = JSON.parse(saved);
    setAnswers(a); setCurrentQuestion(q);
  }
}, []);

// Clear on email capture
sessionStorage.removeItem('aibi-assessment');
```

### ROI Calculator

```typescript
const calcROI = ({ fte, costPerFTE, loHours, hiHours }: ROIInputs) => {
  const hourlyRate = costPerFTE / 2080;
  const midHours = (loHours + hiHours) / 2;
  return {
    mid: fte * midHours * hourlyRate * 50,
    low: fte * loHours * hourlyRate * 50,
    high: fte * hiHours * hourlyRate * 50,
    hoursPerYear: Math.round(fte * midHours * 50),
    efficiencyPoints: ((fte * midHours * hourlyRate * 50) / (fte * costPerFTE) * 100).toFixed(1)
  };
};
```

---

## Plausible Analytics — Deferred Call Pattern (Required)

**Never call `window.plausible()` directly — it throws before the async script loads.**

```typescript
// In layout.tsx — initialize queue before script loads
if (typeof window !== 'undefined') {
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };
}

// Fire events safely from anywhere:
window.plausible('assessment_complete', { props: { tier, score } });
```

**Custom events:**
- `assessment_start` — on /assessment mount
- `assessment_complete` — props: `{ tier: string, score: number }`
- `email_captured` — props: `{ tier: string }`
- `briefing_booked` — props: `{ source: 'assessment' | 'services' | 'home' | 'cta' }`
- `purchase_initiated` — props: `{ product: 'foundations' | 'aibi-p' }`

---

## MailerLite + Resend — No Test Mode

MailerLite (sequences/groups) and Resend (transactional) replaced ConvertKit
in 2026-05. Neither has a sandbox — every API call hits the live account.
Suppress on preview/local via the `SKIP_*` flags (set on the Vercel **Preview**
scope only, never Production):

```typescript
// In /api/capture-email and the email adapters
if (process.env.SKIP_MAILERLITE !== 'true') { /* MailerLite call */ }
if (process.env.SKIP_RESEND     !== 'true') { /* Resend call */ }
```

`next.config` throws if `SKIP_MAILERLITE=true` leaks into Production.
The capture-email path: validate → MailerLite adapter (`@/lib/mailerlite`,
honors `marketing_opt_in`) → Resend breakdown (`@/lib/resend`) → persist.
Some helper names still read `markConvertKitTagged` etc. — legacy naming, real
backend is MailerLite.

---

## HubSpot — REMOVED (2026-05)

HubSpot is no longer in the codebase (0 refs as of 2026-05-21). There is no
CRM integration. The old custom-property setup
(`assessment_score`, `score_tier`, `institution_name`, `asset_size`,
`lead_source`) is obsolete; assessment data lives in Supabase
`assessment_responses` and MailerLite group/field routing. Do not re-add
HubSpot calls without an explicit decision.

---

## Course Provisioning — Phase 2 (In-House LMS)

Course delivery is in-house — no third-party LMS, no Zapier, no Kajabi
(decision 2026-05-05). Existing pieces in `src/lib/lms/`,
`src/lib/course-harness/`, `src/lib/certificates/`. Course content lives
in `content/courses/foundation-program/module-{1..12}.ts` + `src/app/courses/foundation/program/`. The chain:

```
Stripe payment.success webhook
  → /api/webhooks/stripe (verify signature)
  → Insert row into Supabase `course_enrollments`
  → Tag MailerLite contact (welcome group / drip sequence)
  → User logs in with their existing Supabase Auth account
  → /courses/foundation/program reads `course_enrollments` to gate access
```

No external user provisioning, no automation glue. Single auth surface
(Supabase Auth from Spec 2), single DB (Supabase), full design control.

Until the Stripe webhook handler is built and tested, manually insert
`course_enrollments` rows for any pre-launch sales.

---

## Rate Limiting — /api/capture-email

Public endpoint without rate limiting = spam vector. Add before launch:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 per IP per hour
});
const { success } = await ratelimit.limit(req.ip ?? 'anonymous');
if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 });
```

---

## Stripe Webhook Signature Verification

Never process unverified webhook events:

```typescript
const sig = req.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
// throws if invalid — let it throw
```

---

## Brand & Copy Rules — Non-Negotiable

### Correct Brand Usage

**Name standard (2026-04-15):** In running prose, always use the full name
**The AI Banking Institute** or **the Institute**. Do NOT hide behind the
acronym. Bankers do not need another acronym. Reserve "AiBI" for:
- Credential codes (AiBI-Foundation, AiBI-S, AiBI-L)
- The circular seal / wordmark logo
- Credential display format: "AiBI-Foundation · The AI Banking Institute"

Never write "AiBI helps..." or "the AiBI approach..." in body copy. Use
"The AI Banking Institute helps..." or "our approach..." instead.

| Element | Correct |
|---------|---------|
| Institute name | The AI Banking Institute (use in prose) |
| Informal reference | the Institute |
| Brand nickname | AiBI (not AiBi, not AIBI) — reserved for credentials, seal, and compound program names |
| Foundation course | AiBI-Foundation (replaces "AiBI-Practitioner" / "AiBI Foundations" — see 2026-05-11 Decisions Log) |
| Foundation credential | AiBI-Foundation (course name and credential code are the same) |
| Specialist cert | AiBI-S / AiBI-S/Ops / AiBI-S/Lending / etc. |
| Leader cert | AiBI-L |
| Advisory engagement | Leadership Advisory (describe as "fractional Chief AI Officer" when shape matters) |
| Credential display | "AiBI-Foundation · The AI Banking Institute" / "AiBI-S · The AI Banking Institute" |

### Phrases That Must Never Appear in the Codebase or Copy

| Never Use | Use Instead |
|-----------|-------------|
| `FFIEC-aware training` | "Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon" |
| `AI-enabled peers at 58.1%` | "Community bank median ~65% efficiency ratio (FDIC); industry-wide ~55.7% (Q4 2024)" |
| `BAI-P / BAI-S / BAI-L` | `AiBI-Foundation / AiBI-S / AiBI-L` |
| `AiBI-Practitioner` / `AiBI-P` / `AiBI Foundations` (plural) / `Banking AI Practitioner` (user-facing copy) | `AiBI-Foundation` (singular) — see 2026-05-11 Decisions Log |
| `AiBi` | `AiBI` |
| Any unsourced statistic | Named source + year + publication |

### Sourced Statistics for Copy

| Statistic | Source |
|-----------|--------|
| 66% of banks discussing AI budget | Bank Director 2024 Technology Survey (via Jack Henry) |
| 57% of FIs struggle with AI skill gaps | Gartner Peer Community (via Jack Henry) |
| 55% have no AI governance framework yet | Gartner (via Jack Henry) |
| 48% lack clarity on AI business impacts | Gartner (via Jack Henry) |
| Community bank median efficiency ratio ~65% | FDIC CEIC data, 1992–2025 |
| Industry-wide efficiency ratio ~55.7% | FDIC Quarterly Banking Profile Q4 2024 |
| 84% would switch FIs for AI-driven financial insights | Personetics 2025 (via Apiture) |
| 62% open to AI-powered fee alerts | 2025 consumer survey (via Apiture) |
| 76% would switch FIs for better digital experience | Motley Fool (via Apiture) |

### Color Variables — Never Hardcode Hex

**Mockup is the single design system as of 2026-05-27.** Ledger was fully
evicted from every rendering surface in `src/app/`, `src/components/`, and
`src/lib/` (PRs #291 + #292 + #293). `src/styles/tokens-ledger.css` is
deleted. `src/components/ledger/` is deleted. `src/styles/tokens.css` still
exists as a thin compatibility shim mapping legacy `--color-*` alias names
to mockup hex literals — its consumers will be migrated and the file
deleted in a follow-up after PR #289 + #291 + #292 + #293 merge to main.
See the 2026-05-27 DECISIONS entry.

**Mockup tokens (canonical):**

Defined in `src/styles/tokens-mockup.css`. Source of truth:
`public/sketches/_mockup.css` + per-page sketches in `public/sketches/`.

```css
/* Ink */
--ink:       #071A2F   /* primary dark — hero, dark sections, CTA */
--ink-2:     #0B2745   /* hover on ink buttons */

/* Gold — single accent (emphasis + primary CTA) */
--gold:      #C8A24A   /* primary accent */
--gold-2:    #D8B867   /* hover */
--gold-soft: #E6D39B   /* on-dark text accent (kickers, ledes) */
--gold-deep: #9A7A2F   /* on-light kicker / metadata */

/* Cream — page and recessed surfaces */
--cream:     #F7F3EA
--cream-2:   #EFE7D7

/* Slate scale — neutral text + surfaces (Tailwind palette) */
--slate-50:  #F8FAFC
--slate-100: #F1F5F9
--slate-200: #E2E8F0
--slate-400: #94A3B8
--slate-500: #64748B
--slate-600: #475569

/* Emerald — saved/success confirmation only */
--emerald-700: #047857
--emerald-800: #065F46
```

**Pillar color discipline is retired.** The mockup system uses one accent
(gold) for emphasis only. The 4-pillar curriculum structure
(Awareness · Understanding · Creation · Application) in the LMS
remains as a content frame but does not carry a visual grammar.

**Deleted (do not reintroduce):**
- `--ledger-*` tokens — Ledger design system, evicted 2026-05-27
- `--color-terra` / `--color-sage` / `--color-cobalt` / `--color-amber` — pillar palette, retired 2026-05-26

---

## Database Schema

```sql
-- Core tables
assessment_responses (
  id uuid primary key default gen_random_uuid(),
  email text,
  score integer not null,
  tier text not null,
  answers jsonb not null,
  institution_name text,
  created_at timestamptz default now()
);

course_enrollments (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product text not null,  -- 'foundations' | 'aibi-p' | 'aibi-s' | 'aibi-l'
  stripe_session_id text,
  user_id uuid references auth.users(id),  -- bound on first login
  created_at timestamptz default now()
);
```

Use `/supabase-migrate` skill for ALL schema changes. Research current Supabase docs before any implementation — APIs change frequently.

### RLS Performance Pattern

```sql
-- Wrap auth.uid() in SELECT for ~95% performance improvement
CREATE POLICY "Users read own data" ON my_table
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Always index policy columns
CREATE INDEX idx_user_id ON my_table(user_id);
```

---

## MVP Launch Gate

The post-conference email goes out when ALL items are checked:

- [ ] AIBankingInstitute.com DNS live, SSL active *(domains registered ✓)*
- [ ] Home page rendering correctly desktop + mobile
- [ ] Assessment: 12 questions functional, scoring correct (v3)
- [ ] Assessment: **email captured before any score is visible; full report (score + tier + dimension breakdown + starter artifact) renders inline immediately after email submit** (reverses 2026-04-27 decision — see 2026-05-18 DECISIONS.md entry)
- [ ] Assessment: sessionStorage persistence working (test by refreshing mid-assessment on iPhone)
- [ ] Assessment: /api/capture-email with rate limiting active
- [ ] MailerLite: assessment Day 0/3/7 sequences active; `MAILERLITE_GROUP_ID_ASSESSMENT` / `_NEWSLETTER` populated
- [ ] Resend: verified sender (`hello@aibankinginstitute.com`); assessment-breakdown transactional email tested end-to-end
- [ ] Calendly: Executive Briefing link tested on iPhone Safari
- [ ] Services page live with Calendly embed
- [ ] Certifications page: **inquiry form only — no broken Stripe CTAs**
- [ ] Plausible: deferred queue pattern installed; events firing
- [ ] 404 page exists
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] Full assessment completed on iPhone Safari in under 3 minutes
- [ ] The string "FFIEC-aware" does not appear anywhere in the deployed site
- [ ] All statistics on site have named source citations

---

## Workflow Orchestration

### Plan Mode Default
- Non-trivial tasks (3+ steps or architectural decisions): plan mode first
- Straightforward bug fixes with clear scope: just fix them
- If something goes sideways: STOP and re-plan

### Post-Implementation Audit

After any feature or fix, before committing, run 3 parallel subagents:

1. **DRY Agent** — Pattern reuse, flag duplication
2. **Security Agent** — Input validation, auth, data exposure; extra focus on `/api/capture-email` and Stripe webhooks
3. **Regression Agent** — Does this break the assessment flow, ROI calculator, or Calendly CTAs?

Run `/simplify` before committing. Skip for trivial one-liners.

### Self-Improvement Loop
- After any correction: update `tasks/lessons.md`
- Review lessons at session start

### Autonomous Bug Fixing
- Confirm branch, then fix it
- Don't ask "how do I debug this?" — figure it out

---

## Task Management

- **`tasks/todo.md`** — Persistent across sessions
- **TodoWrite tool** — Real-time visibility during session

---

## Core Principles

- **Simplicity First** — Minimal code impact. Senior developer standards.
- **Assessment First** — Never introduce regressions to the assessment flow without mobile testing.
- **Citations Always** — No unsourced statistics in any user-facing copy. Every claim traces to a named document.
- **No Laziness** — Find root causes. No temporary fixes.

---

## Modular Development

- One responsibility per file — if it does two things, split it
- Side effects (ConvertKit, HubSpot, Stripe) live in `lib/` not in route handlers or components
- Generic helpers → `lib/utils/` | Domain-specific → `lib/convertkit/`, `lib/hubspot/`, `lib/stripe/`

---

## Security

- Environment variables for all secrets — never hardcode
- Validate all inputs at API boundaries
- Verify Stripe webhook signatures — never process unverified events
- Use Supabase client from `@/lib/supabase` — never create new instances
- Check for secrets before commits: `npx gitleaks detect --source .`
- Prefer server components; `'use client'` only when interactivity is needed

---

## Feature Development Workflow

**Before any feature:** "Which branch — main, or new feature branch?"

**Before starting work:** `git worktree list`. Check `git status`.

**Dirty working tree rule:** Uncommitted changes present → notify user first. Never silently carry dirty changes.

**Promoting to production:**
1. `cd ~/Projects/TheAiBankingInstitute && git merge feature/<n>`
2. `git push origin main` (with explicit user approval)
3. `git worktree remove .worktrees/<n>`

---

## Reference Documents

| Document | Publisher | Date | Key Data |
|----------|-----------|------|----------|
| AIEOG AI Lexicon | US Treasury / FBIIC / FSSCC | Feb 2026 | Official definitions: hallucination, AI governance, AI use case inventory, HITL, third-party AI risk, explainability |
| AI Playbook for Banks and Credit Unions | Cornerstone Advisors | 2025 | Use cases by department; tool names: Fathom, Zoom AI Companion, UiPath, Pega, Power Automate, Nintex, Ocrolus, Informatica |
| Getting Started in AI | Jack Henry & Associates | 2025 | 66% banks discussing AI; 57% skill gaps; 55% no governance; 48% lack business impact clarity — all via Gartner |
| The Digital Loyalty Dividend | Apiture (now part of CSI) | 2025 | 84% would switch for AI-driven insights; 62% open to AI alerts; 76% would switch for better UX |
| Digital Transformation for Community Banks | Apiture | 2025 | 55% millennial SMBs would switch; 80%+ youngest consumers digital-first; 60% cite security as #1 factor |
| Hybrid Multi-Cloud AI Strategy | SS&C Managed IT | 2025 | PII never in public LLMs; private cloud for sensitive inference; Zero Trust + RBAC |
| GAO-25-107197 | US GAO | May 2025 | No comprehensive AI-specific banking framework yet; SR 11-7, TPRM, ECOA/Reg B apply |
| FDIC Quarterly Banking Profile | FDIC | Ongoing | Community bank median efficiency ratio ~65%; industry-wide ~55.7% Q4 2024 |

**FDIC research tool:** BankFind Suite at banks.data.fdic.gov — free public data on efficiency ratios, assets, and FTE counts for every FDIC-insured institution. Use before every Executive Briefing.

---

## Preferences

- Use `claude-opus-4-6` for complex reasoning tasks
- TypeScript strict mode — no `any` without explicit justification
- Prefer server components; minimize `'use client'` surface area

---

## Decisions Log

Moved to [`DECISIONS.md`](./DECISIONS.md) — chronological record of overrides and direction changes. Read it when a request might conflict with a prior decision, and append new entries there (not here) when overriding something in the plans.

---

## Design Context

**Canonical source (2026-05-26 onward):**
`public/sketches/mockup.html` (home) and the per-page sketches in
`public/sketches/` — they are the literal HTML port of
`/Users/jgmbp/Downloads/aibi_homepage_mockup.jsx` and adjacent JSX files.
The shared chrome lives in `public/sketches/_mockup.css`. The
React-ported tokens live in `src/styles/tokens-mockup.css`.

The 2026-05-09 Ledger refresh was retired on 2026-05-26 in favor of
this mockup system, then fully evicted from every rendering surface on
2026-05-27 (PRs #291 + #292 + #293). See DECISIONS.md for the timeline.
Mockup is the single design system.

**Aesthetic:** Modern editorial-meets-software. Dark navy hero with a
warm cream page, brighter gold as a focused accent, rounded card-based
composition, generous whitespace, restrained drop shadows on
interactive cards. References: financial print publications styled for
a 2026 SaaS audience — credible but warm, deliberate but inviting.

**Emotional goals:** Authority + Trust, Aspiration + Confidence.

**Accessibility:** WCAG 2.1 AA. Verify contrast on every new pairing;
gold (`#C8A24A`) on dark navy passes; gold on cream does NOT pass for
body text — reserve gold-on-cream for kickers/metadata/headlines only.
Body text on cream uses `--ink`/`--slate-600`.

**Color:** Single primary accent — gold (`#C8A24A`). Used for
emphasis, primary CTA fill, and on-dark kickers. Never decorative.
Navy `--ink` (`#071A2F`) for primary fills and dark sections. Cream
`#F7F3EA` for page surfaces. Slate scale for neutral text. Emerald
(`#047857`) only for saved/success confirmation toasts. No oxblood,
no terra, no sage — old pillar discipline is gone.

**Typography:** **Inter** for everything (display, body, UI). Weights
400/500/600/700/800. Font fallback chain
`"Inter", ui-sans-serif, system-ui, -apple-system, "Helvetica Neue",
Arial, sans-serif` already wired in `_mockup.css` and `tokens-mockup.css`.
Newsreader, Geist, and JetBrains Mono are still loaded in `layout.tsx`
because the legacy `--font-serif` / `--font-mono` aliases in `tokens.css`
remain — the print-results PDF route is the main remaining consumer.
Those font loads can be dropped once `tokens.css` is deleted. Italics
remain retired site-wide (`*{font-style:normal!important}` in
`base.css`); emphasis carried by weight (600/700) and color.

**Design principles:**
1. Show the artifact — every section leads with the practical thing the
   product produces (a sample report card, a scenario, a saved prompt).
2. Interactive previews where possible — tabs, scenario pickers, role
   tabs. Static screenshots are last resort.
3. Specific over clever — concrete numbers, scenario names, role labels.
4. Two-tone restraint — at most two surfaces per section (dark + cream,
   or white + cream). No tertiary color noise.
5. Accessible by default — WCAG 2.1 AA, focus rings, skip links, real
   semantic HTML.

**Wordmark:** Inline `seal` + two-line text. Seal = 40×40 navy square
(`--ink`), 12px radius, gold landmark icon (`--gold`). Text line 1
"The AI Banking Institute" (14px, weight 600, navy). Text line 2
"Regulated Intelligence" (12px, slate-500, weight 400). No symbol-only
lockup; the brand always appears as seal + name.

**Radii:**
- 12px — buttons, pill tabs, small infoboxes
- 16px — feature pieces, scenario cards, list rows
- 24px — content cards, suite cards
- 28px / 32px — hero cards, role cards, large feature cards
- 999px — chips, eyebrow pills

**Shadows:** Three approved levels —
- `--shadow-soft` (`0 1px 2px rgba(0,0,0,.06)`) — nav, pcards
- `--shadow-feature` (`0 24px 40px -20px rgba(0,0,0,.20)`) — interactive cards
- `--shadow-hero` (`0 30px 60px -20px rgba(0,0,0,.45)`) — hero report card

**Motion:** 120ms UI / 200ms page transitions,
cubic-bezier(0.4, 0, 0.2, 1). Hover transforms are small (translateY(-4px))
on pcards/scards only; rest are color/border-color shifts. No skeleton
shimmers, no parallax, no scroll-jacking, no spring physics.

**Voice:** Editorial-first, promotional-never. Lead with the artifact,
not the tool. Specific over clever. No exclamation points. No emoji
(unless quoting someone using one). Banned words: supercharge, unlock,
revolutionize, leverage, synergy, AI-powered, users (use "you").

**Never:** gradients, terra/sage/cobalt/oxblood, icon libraries, stock
photos, dark mode, "AI-powered" badges, sentence-case CTAs (UPPER on
button labels), italics, more than one accent color in a single section.
