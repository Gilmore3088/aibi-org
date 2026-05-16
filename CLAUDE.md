# The AI Banking Institute (AiBI)
# CLAUDE.md — Project Intelligence File

## Reference Plans — Canonical Source of Truth

**Read [`Plans/aibi-launch-spec-v2.md`](./Plans/aibi-launch-spec-v2.md) before any non-trivial work.** It is the active May 2026 launch spec. If a request conflicts with it, flag it before coding.

The HTML files in `Plans/` are **archive only** — they predate the issue #88 product-ladder cleanup and contain stale assumptions (8-question free assessment, 8–32 scoring, `/foundations` route, AiBI-P / AiBI-Practitioner naming, four-track Foundation family). See [`Plans/README.md`](./Plans/README.md) for the full mapping.

| File | Status |
|------|--------|
| **`Plans/aibi-launch-spec-v2.md`** | **Active.** Product ladder, naming, routes, entitlements, pricing, assessment logic, checkout/webhook, dashboard states, launch QA checklist, deferred items |
| `DECISIONS.md` | Companion to v2 — chronological override log explaining why decisions changed |
| `Plans/README.md` | Status index for everything in `Plans/` — read this when in doubt |
| `Plans/aibi-prd.html` | _Archive._ Initial PRD — superseded by v2 §1, §6, §9 |
| `Plans/aibi-foundation-v3.html` | _Archive._ Brand identity — superseded by v2 §2 |
| `Plans/aibi-site-v3.html` | _Archive._ Design system + page specs — design now Ledger (see `docs/brand-refresh-2026-05-09/`) |
| `Plans/aibi-developer-spec.html` | _Archive._ Architecture — superseded by v2 §4, §7 |
| `Plans/aibi-designer-brief.html` | _Archive._ Visual identity — superseded by Ledger refresh below |
| `Plans/aibi-consultant-playbook.html` | _Archive._ Advisory engagements deferred post-launch — see v2 §10 |
| `Plans/foundation-v2/` | _Archive — REVERSED 2026-05-11._ Four-track Foundation family scrapped; AiBI-Foundation is one course. The Personal Prompt Library 18-field schema is the one piece still in force. |

**Assessment content lives in `content/assessments/<version>/`** — each version is a folder (questions, scoring, copy) so content can iterate without touching component code. Current version: **`v2`** (48-question pool, eight readiness dimensions, 12–48 scoring range for the free rotation and 48–192 raw for the In-Depth full 48). See spec v2 §6.

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

> "⚠️ THIS WILL DELETE THE STAGING SUPABASE BRANCH AND ALL ITS DATA. PROCEED? (yes/no)"

**No exceptions. No "it'll be fine." Ask first, in caps, every single time.**

## CRITICAL — ALWAYS ASK WHICH BRANCH

**At the start of EVERY session, before doing ANY work:**

> "Which branch should I work on — main, staging, or a feature branch?"

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
| Dev server (feature) | `cd ~/Projects/aibi-<feature> && npm run dev` |
| Dev server (staging) | `cd ~/Projects/aibi-staging && npm run dev` |
| Build | `npm run build` (in relevant worktree) |
| Type check | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Test on staging | `git push origin HEAD:staging --force` (from feature worktree) |
| Reset staging | `cd ~/Projects/aibi-staging && git reset --hard origin/main && git push origin staging --force` |
| Push production | `cd ~/Projects/TheAiBankingInstitute && git merge <branch> && git push origin main` |
| List worktrees | `git worktree list` |
| Add feature worktree | `git worktree add ../aibi-<n> feature/<n>` |
| Remove worktree | `git worktree remove ../aibi-<n>` |

*Push commands require explicit user approval before execution.*

---

## Architecture

- **Framework:** Next.js 14 (App Router), TypeScript strict mode, Tailwind CSS
- **Hosting:** Vercel (AIBankingInstitute.com on main branch)
- **Database / Auth:** Supabase (Postgres + RLS)
- **Payments:** Stripe (Checkout Sessions for $97 and $295 products)
- **Email / Sequences:** ConvertKit (Kit) — assessment captures, newsletter, automated sequences
- **CRM:** HubSpot free tier — contact tracking, deal pipeline
- **Analytics:** Plausible (privacy-first, custom events — see deferred call pattern below)
- **Scheduling:** Calendly (popup or inline embed — Executive Briefing link)
- **LMS (Phase 2):** In-house — `src/lib/lms/`, `src/lib/course-harness/`, `src/lib/certificates/`. Course content + entitlements live in Supabase (`course_enrollments` table). No third-party LMS, no Kajabi, no Zapier.

### Git Worktree Layout

| Directory | Branch | Purpose |
|-----------|--------|---------|
| `~/Projects/TheAiBankingInstitute` | main (permanent) | Home base, production code, plans, CLAUDE.md |
| `~/Projects/aibi-staging` | staging (permanent) | Staging testing |
| `~/Projects/aibi-<feature>` | feature/* (temporary) | Per-feature, removed when merged |

**Starting a feature worktree:**
```bash
cd ~/Projects/TheAiBankingInstitute && git worktree add ../aibi-<n> -b feature/<n> main
ln -s ~/Projects/TheAiBankingInstitute/.env.local ../aibi-<n>/.env.local
cd ../aibi-<n> && npm install
```

**Rules:**
- `~/Projects/TheAiBankingInstitute` stays on `main` — never switch it to a feature branch
- `.env.local` lives in `~/Projects/TheAiBankingInstitute` and is symlinked into feature worktrees
- Never stash — commit WIP instead (`git commit -m "WIP: ..."`)

---

## Deployment

**Environments:**
- **Staging:** `staging.aibankinginstitute.com` (staging branch) — test Stripe keys, `SKIP_CONVERTKIT=true`
- **Production:** `aibankinginstitute.com` (main branch) — live keys

**MANDATORY RULES:**
- NEVER run `git push` to staging or production without EXPLICIT user approval
- Always ask "Push to staging, production, or both?" and WAIT for a response
- NEVER touch environment variables in Vercel — user manages these in the Vercel dashboard

---

## Environment Variables

```bash
# .env.local — NEVER commit this file
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CONVERTKIT_API_KEY=
CONVERTKIT_ASSESSMENT_FORM_ID=        # assessment email captures
CONVERTKIT_NEWSLETTER_FORM_ID=        # AI Banking Brief subscribers

HUBSPOT_API_KEY=                       # Private App access token

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
STRIPE_FOUNDATIONS_PRICE_ID=           # $97 AI Foundations
STRIPE_PRACTITIONER_PRICE_ID=          # $295 AiBI-Practitioner

NEXT_PUBLIC_PLAUSIBLE_DOMAIN=aibankinginstitute.com
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/[handle]/executive-briefing

# Staging only — suppresses live ConvertKit calls
SKIP_CONVERTKIT=true
```

---

## Page Routes

| Route | Render | Priority | Notes |
|-------|--------|----------|-------|
| `/` | SSR | MVP | Homepage. ROI Calculator is a client component island. |
| `/assessment` | CSR | MVP | All state in useState + sessionStorage. Score visible before email gate. |
| `/services` | SSR | MVP | Three engagement tiers. Calendly embed. |
| `/certifications` | SSR | MVP | **Phase 1: inquiry form ONLY. No Stripe CTA until Phase 2.** |
| `/foundations` | SSR | Phase 2 | $97 course. Stripe Checkout. |
| `/security` | SSR | Phase 2 | Pillar B landing. Free guide download + email gate. |
| `/about` | SSR | Phase 3 | Founder story. |
| `/resources` | SSR | Phase 3 | AI Banking Brief archive + newsletter. |
| `/api/capture-email` | API | Shipped | ConvertKit assessment-form subscribe + tier sequence tagging + HubSpot upsert. Suppressed on staging via `SKIP_CONVERTKIT=true`. Rate limiting deferred (see 2026-04-15 Decisions Log). |
| `/api/create-checkout` | API | Phase 2 | Stripe Checkout Session. |
| `/api/webhooks/stripe` | API | Phase 2 | payment.success → insert into `course_enrollments` → ConvertKit welcome tag. |

---

## Assessment Tool — The Most Important Feature

Must work on mobile in under 3 minutes. One question per view on mobile. Score ring animation on results. Gets the most QA time before launch.

### State Shape

```typescript
interface AssessmentState {
  currentQuestion: number;     // 0–7
  answers: number[];           // scores 1–4 per question
  phase: 'questions' | 'score' | 'results';
  email: string;
  emailCaptured: boolean;
}
```

### Scoring Logic

```typescript
// Score range is 8–32 (8 questions × 1–4 points each)
const getTier = (total: number) => {
  if (total >= 28) return { label: 'Ready to Scale',    color: 'var(--color-sage)' };         // 28–32
  if (total >= 22) return { label: 'Building Momentum', color: 'var(--color-terra-light)' };  // 22–27
  if (total >= 15) return { label: 'Early Stage',       color: 'var(--color-terra)' };        // 15–21
  return               { label: 'Starting Point',       color: 'var(--color-error)' };        // 8–14
};
// NEVER hardcode hex values — always reference CSS variables
```

### Critical UX Rule

The **score ring and tier label are visible WITHOUT email capture.** Email is requested only for the detailed dimension breakdown. Gating the score kills conversion.

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

## ConvertKit — No Test Mode

ConvertKit has no sandbox. Every API call hits the live account. Suppress on staging:

```typescript
// In /api/capture-email
if (process.env.SKIP_CONVERTKIT !== 'true') {
  await fetch('https://api.convertkit.com/v3/forms/...', { ... });
}
```

Set `SKIP_CONVERTKIT=true` in Vercel staging environment. Never in production.

---

## HubSpot — Custom Properties Must Be Pre-Created

The API silently ignores unknown properties. **Create these in HubSpot dashboard before going live:**

| Property | Type |
|----------|------|
| `assessment_score` | Number |
| `score_tier` | Single-line text |
| `institution_name` | Single-line text |
| `asset_size` | Dropdown: <$100M / $100–500M / $500M–$1B / $1B+ |
| `lead_source` | Dropdown: assessment / referral / linkedin / conference |

---

## Course Provisioning — Phase 2 (In-House LMS)

Course delivery is in-house — no third-party LMS, no Zapier, no Kajabi
(decision 2026-05-05). Existing pieces in `src/lib/lms/`,
`src/lib/course-harness/`, `src/lib/certificates/`. Course content lives
in `public/AiBI-P/` HTML mockups + `src/app/courses/`. The chain:

```
Stripe payment.success webhook
  → /api/webhooks/stripe (verify signature)
  → Insert row into Supabase `course_enrollments`
  → Tag ConvertKit contact (for welcome / drip sequence)
  → User logs in with their existing Supabase Auth account
  → /courses/aibi-p reads `course_enrollments` to gate access
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

**Two systems coexist during the 2026-05-09 brand refresh.** Legacy Terra/Sage/Cobalt
tokens stay in `src/styles/tokens.css` for surfaces not yet migrated. New Ledger
tokens live in `src/styles/tokens-ledger.css` and are the target system. New work
uses Ledger; migrated surfaces drop Terra references. When migration completes,
`tokens.css` is deleted and `tokens-ledger.css` is renamed to take its place.

**Ledger (target — use for all new and migrated work):**

```css
--ledger-bg:           #ECE9DF   /* page field — linen */
--ledger-paper:        #F4F1E7   /* card field */
--ledger-parch:        #E4E0D2   /* recessed surfaces */
--ledger-tape:         #F1E9D0   /* highlight tape (reviewer notes) */
--ledger-ink:          #0E1B2D   /* primary text, primary fill */
--ledger-ink-2:        #1F2A3F   /* secondary text */
--ledger-muted:        #5C6B82   /* muted text */
--ledger-soft:         #8C95A8   /* softest text — wordmark line 2 */
--ledger-accent:       #B5862A   /* gold — emphasis, primary CTA alt */
--ledger-accent-2:     #1E3A5F   /* navy — secondary accent */
--ledger-weak:         #8E3B2A   /* oxblood — destructive only */
--ledger-rule:         #D5D1C2   /* hairline divider */
--ledger-rule-strong:  #A8AEBE   /* strong rule — section heads */
```

**Legacy (Terra/Sage/Cobalt — do not use for new work):**

```css
--color-terra:        #b5512e   /* superseded by --ledger-accent */
--color-sage:         #4a6741   /* retired — pillar discipline gone */
--color-cobalt:       #2d4a7a   /* superseded by --ledger-accent-2 */
--color-ink:          #1e1a14   /* superseded by --ledger-ink */
--color-parch:        #f5f0e6   /* superseded by --ledger-paper */
--color-linen:        #f9f6f0   /* superseded by --ledger-bg */
--color-error:        #9b2226   /* superseded by --ledger-weak */
```

**Pillar color discipline (sage = Pillar A, cobalt = Pillar B, terra = Pillar C)
is retired with the Ledger refresh.** Ledger uses one accent (gold) for emphasis
and oxblood for destructive states. The 4-pillar curriculum structure
(Awareness · Understanding · Creation · Application) shown in the new LMS
prototype carries soft pillar marks for navigation but they do not enforce a
visual grammar. See the 2026-05-09 Decisions Log entry.

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
- [ ] Assessment: 8 questions functional, scoring correct
- [ ] Assessment: **score + tier visible WITHOUT email gate; dimension breakdown + starter artifact gated** (see 2026-04-27 decision)
- [ ] Assessment: sessionStorage persistence working (test by refreshing mid-assessment on iPhone)
- [ ] Assessment: /api/capture-email with rate limiting active
- [ ] ConvertKit: form configured, Day 0/3/7 sequences active
- [ ] HubSpot: all 5 custom properties pre-created; contact creation tested end-to-end
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

**Before any feature:** "Which branch — main, staging, or new feature branch?"

**Before starting work:** `git worktree list`. Check `git status`.

**Dirty working tree rule:** Uncommitted changes present → notify user first. Never silently carry dirty changes.

**Promoting to production:**
1. `cd ~/Projects/TheAiBankingInstitute && git merge feature/<n>`
2. `git push origin main` (with explicit user approval)
3. `git worktree remove ../aibi-<n>`

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

**Canonical source (2026-05-09 onward):**
`docs/brand-refresh-2026-05-09/project/Design System.html` plus the
adjoining `AI Readiness Briefing.html` and `LMS Prototype.html`.

**Aesthetic:** "Newspaper bones, software polish." Editorial ledger:
parchment field, ink type, gold accent, oxblood for destructive states.
Authoritative, dry, slightly editorial. References: financial print
publications, hand-kept ledgers.

**Emotional goals:** Authority + Trust, Aspiration + Pride.

**Accessibility:** WCAG 2.1 AA.

**Color:** Gold (`--ledger-accent` `#B5862A`) for emphasis only — never
decoration. Oxblood (`--ledger-weak` `#8E3B2A`) for destructive / late /
failed only — never marketing. Navy (`--ledger-accent-2` `#1E3A5F`) as
a secondary accent. Body text on Paper or BG, never on Parch (insufficient
contrast). The pillar color discipline (sage / cobalt / terra) is retired.

**Typography:** Newsreader (display, ledes, quotes, wordmark) ·
Geist (body, UI labels, sans buttons) · JetBrains Mono (kickers,
metadata, code, version + status pills, tabular numbers). Three families;
do not add a fourth. Italics signal voice (ledes, quotes, trailing
clauses on section titles), not emphasis. Caps + 0.16–0.20em tracking
only on mono; never track sans.

**Design principles:**
1. Content is the design — restraint over decoration
2. Every number earns its place — sourced, mono, tabular-nums
3. Institutional, not promotional — consulting materials, not SaaS
4. Lines do real work — they replace boxes and shadows
5. Accessible by default — WCAG 2.1 AA, focus rings, skip links

**Wordmark:** Two-line lockup, both lines Geist 700 UPPER, line-height
1.0, 0–2px gap. Line 1 in `--ledger-ink`, line 2 in `--ledger-soft`.
Sans-serif. No italics. No symbol. No monogram. No circular seal — the
old AiBI seal is retired with this refresh.

**Radii:** 2px (buttons, inputs, chips) · 3px (cards, sidebars, sections)
· 4px (hero cards). One shadow only — `--ledger-shadow` — and only on
hero/feature cards; nothing else gets a shadow.

**Motion:** Almost none. 120ms (UI) / 200ms (page transitions),
cubic-bezier(0.4, 0, 0.2, 1). Hover = border darken. No skeleton
shimmers, no parallax, no scroll-jacking, no spring physics.

**Voice:** Editorial first, promotional never. Lead with the artifact,
not the tool. Specific over clever. No exclamation points. No emoji
(unless quoting someone using one). Banned words: supercharge, unlock,
revolutionize, leverage, synergy, AI-powered, users (use "you").

**Never:** gradients, drop shadows beyond `--ledger-shadow` on hero
cards, rounded corners >4px, emoji, icon libraries, stock photos,
dark mode, "AI-powered" badges, sentence-case CTAs (mono caps only).
