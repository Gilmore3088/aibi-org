# The AI Banking Institute (AiBI)
# CLAUDE.md — Project Intelligence File

## Reference Plans — Canonical Source of Truth

**These 6 files in `/Plans/` are the authoritative specification. Read before any non-trivial work. If a request conflicts with these, flag it before coding.**

| File | Purpose |
|------|---------|
| `aibi-prd.html` | Product requirements, user flows, success metrics, launch gate |
| `aibi-foundation-v3.html` | Brand identity, A-B-C framework, business model, GTM |
| `aibi-site-v3.html` | Full design system, page specs, navigation, components |
| `aibi-developer-spec.html` | Architecture, stack, component structure, assessment logic, integrations |
| `aibi-designer-brief.html` | Visual identity, color system, typography, Do's/Don'ts |
| `aibi-consultant-playbook.html` | Executive Briefing script, Quick Win Sprint methodology, delivery |
| `feedback-v1-aibi-landing-page-prd.docx` | V1 landing page PRD feedback — tagline, stats band, 8-section homepage spec |
| `foundation-v2/AIBI-FOUNDATION-COMPLETE.md` | _SUPERSEDED 2026-05-11._ Four-track family (Lite/Full/Manager/Board) reversed — see 2026-05-11 Decisions Log. Kept as authoring archive. |
| `foundation-v2/aibi-foundation-v2/` | _SUPERSEDED 2026-05-11._ Full v2 bundle archived; AiBI-Foundation is one course, not four tracks. |

**Assessment content lives in `content/assessments/<version>/`** — each version is a folder (questions, scoring, copy) so content can iterate without touching component code. Current version: `v1`.

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
- Credential codes (AiBI-Practitioner, AiBI-S, AiBI-L)
- The circular seal / wordmark logo
- Credential display format: "AiBI-Practitioner · The AI Banking Institute"

Never write "AiBI helps..." or "the AiBI approach..." in body copy. Use
"The AI Banking Institute helps..." or "our approach..." instead.

| Element | Correct |
|---------|---------|
| Institute name | The AI Banking Institute (use in prose) |
| Informal reference | the Institute |
| Brand nickname | AiBI (not AiBi, not AIBI) — reserved for credentials, seal, and compound program names |
| Foundations course | AiBI Foundations (replaces "AiBI-Practitioner" — see 2026-05-09 Decisions Log) |
| Foundations credential | Foundations Certificate (no AiBI prefix on the cert itself) |
| Specialist cert | AiBI-S / AiBI-S/Ops / AiBI-S/Lending / etc. |
| Leader cert | AiBI-L |
| Advisory engagement | Leadership Advisory (describe as "fractional Chief AI Officer" when shape matters) |
| Credential display | "Foundations Certificate · The AI Banking Institute" / "AiBI-S · The AI Banking Institute" |

### Phrases That Must Never Appear in the Codebase or Copy

| Never Use | Use Instead |
|-----------|-------------|
| `FFIEC-aware training` | "Aligned with SR 11-7, Interagency TPRM Guidance, ECOA/Reg B, and the AIEOG AI Lexicon" |
| `AI-enabled peers at 58.1%` | "Community bank median ~65% efficiency ratio (FDIC); industry-wide ~55.7% (Q4 2024)" |
| `BAI-P / BAI-S / BAI-L` | `AiBI Foundations / AiBI-S / AiBI-L` |
| `AiBI-Practitioner` / `AiBI-P` (user-facing copy) | `AiBI Foundations` (course) or `Foundations Certificate` (credential) — see 2026-05-09 Decisions Log |
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

Chronological record of overrides and direction changes. Add entries when
overriding something in the plans so future sessions do not relitigate.

**2026-04-15 — Score gated behind email capture.** PRD originally said "score
visible without email gate" for conversion reasons. User override: capture
every completer's email, even at the cost of completion rate. Tradeoff
accepted. Committed in `d46d99b`. **Superseded 2026-04-27** — see entry below.

**2026-04-15 — Peer benchmarks deferred to Phase 1.5+.** User wanted
"you rank Nth percentile" teasers; honest constraint is zero respondents yet.
Parked in `tasks/todo.md` Phase 2 backlog until Supabase is wired and N >= 30
per segment exists.

**2026-04-15 — "A-B-C of AI Banking" retired as public tagline.** Per v1
landing page PRD feedback doc. Replaced with "We turn your bankers into your
builders" then tightened to "Turning Bankers into Builders" same day. The
three pillars remain as curriculum framework but are described, not branded
as an acronym. No "A-B-C" pills, badges, or labels anywhere on public site.

**2026-04-15 — Upstash / rate limiting deferred.** Zero traffic; add the week
before launch. Ship without rate limiting on `/api/capture-email` for now.

**2026-04-15 — Kit vs Loops / HubSpot vs Attio undecided.** User to pick when
creating accounts. Stubs in `src/lib/convertkit` and `src/lib/hubspot` are
adapter-shaped either way — wiring is a 20-minute job per service once a
vendor is selected.

**2026-04-15 — Third-party integrations deferred for prototype phase.**
User direction: focus on site-build work that requires no external accounts.
Calendly, Supabase, Kit/Loops, HubSpot/Attio, Stripe, Upstash all
deferred. When accounts exist, wire adapters in order: Supabase first (data
capture), then ConvertKit or Loops (newsletter), then HubSpot or Attio
(CRM), then Calendly (briefing booking), then Stripe (Phase 2
monetization). Course delivery is in-house — see 2026-05-05 entry.

**2026-04-17 — Supabase activation reverses prior deferral.** Connected
Supabase MCP, applied 7-table schema (already present), added security-
hardening migration (00004) for `set_updated_at` search_path and
`institution_enrollments` deny-all policy. Auth verified end-to-end
(signup → email confirm → /dashboard). Branch:
`feature/supabase-activation`.

**2026-04-17 — Dev bypass mocks removed entirely.** The `SKIP_DEV_BYPASS`
escape hatch in 17 server-side files was returning hardcoded mock data
in development, hiding the fact that every dev login showed the same
"user." Removed all 18 bypass blocks (-203 lines) instead of toggling
via env var. Real auth now required in dev (matches production behavior).

**2026-04-17 — Resend chosen for transactional email.** Replaces
Supabase's throttled built-in email service (~3-4 emails/hour limit).
Configured via Custom SMTP in Supabase Auth Settings using `smtp.resend.com:465`.
Domain `aibankinginstitute.com` verified in Resend on 2026-04-18; sender
swapped to `hello@aibankinginstitute.com` on 2026-05-06 (see entry below).
Free tier: 100/day, 3,000/month.

**2026-04-17 — ConvertKit (Kit) chosen over Loops.** Resolves the
2026-04-15 Kit vs Loops decision. ConvertKit handles marketing email
(newsletter, drip campaigns, sequences). Resend handles transactional
(auth confirmations, password resets). Wiring pending API key + form IDs.

**2026-04-17 — `/courses` and `/certifications` merged into `/education`.**
User direction: reduce nav clutter. New IA: Education hub has two
sections — Classes (free entry points: assessment + newsletter +
future short videos) and Certifications (paid AiBI-P/S/L tracks).
Top nav reduced from 5 items to 4 (removed Courses + Certifications,
added Education). Old URLs redirect via `next.config.mjs`. Sub-routes
preserved: `/courses/aibi-p`, `/courses/aibi-s`, `/courses/aibi-l`,
`/certifications/exam/*`.

**2026-04-17 — Foundations folded into Education hub.** Foundations
($97 5-module course) was already retired (redirected to /courses/aibi-p
due to pricing inversion: Foundations cost more than AiBI-P). Now
redirects to `/education` instead. Future free "Class" content can fill
the slot Foundations vacated.

**2026-04-17 — Vercel Analytics added alongside Plausible.** Vercel
Analytics installed and wired in root layout for the upcoming Vercel
deploy. Plausible setup remains in place. Open question: keep both,
or drop one. Vercel Analytics is free and built-in; Plausible has a
better privacy story for non-US visitors. Decision deferred until
both are running and we can compare data quality.

**2026-04-24 — `/services` reworked to `/for-institutions`; education-first
positioning.** The old consulting page led with three implementation tiers
(Quick Win Sprint / Audit / Transformation), which contradicted the
"Turning Bankers into Builders" tagline. Rebuilt as `/for-institutions`
with three *enrollment* tiers (Individual / Team cohort / Institution-wide
capability program) plus a free self-serve sample library. The three
consulting engagements were reframed as coaching that pairs with a
cohort and moved to `/for-institutions/advisory` (Pilot · Program ·
Leadership Advisory). Old `/services` URL 301s to `/for-institutions`;
top nav relabelled "For Institutions". Prices removed from advisory
tiers until case studies exist. The "Quick Win Sprint" phrase was
retired across the codebase.

**2026-04-24 — `AiBI fCAIO` retired as a public product name.** The
reserved use of "AiBI" for the fCAIO program (one of the four canonical
uses listed earlier in this file) is discontinued. Leadership Advisory
is the new name; "fractional Chief AI Officer" remains available as a
descriptor in prose where it clarifies shape. Credential codes
(AiBI-P/S/L) and the circular seal are unaffected.

**2026-04-27 — Email gate is partly-gated with substantive value.**
Supersedes the 2026-04-15 full-gate decision. The current shape:
**score + tier visible without email** (the headline diagnostic the
PRD originally promised); **dimension breakdown + tailored starter
artifact gated behind email capture**. Rationale: a thin gate ("just
ask for the email") feels extractive; a substantive gate ("you handed
us your email, here's a real artifact you can take to your team this
week") earns the conversion. Eight dimension-keyed starter artifacts
live in `content/assessments/v2/starter-artifacts.ts` — one per
lowest-scoring dimension. Server-side persistence of dimension
breakdown added in migration `00011_readiness_dimension_columns.sql`.
Resend transactional email is deferred — the artifact is on-screen,
copy-to-clipboard, and download-as-md only for now.

**2026-05-04 — Four-surface assessment results program shipped.**
Brainstormed and shipped over a single sprint: Spec 1 (briefing
reshape, PR #40), Spec 2 (PDF download, PR #41), Spec 3 (ConvertKit
tier sequences, PR #42), Spec 4 (owner-bound `/results/{id}` URL,
PR #43). All four merged to main. Operator setup remaining: Vercel
env vars (CRON_SECRET, four CONVERTKIT_TAG_ID_*, CONVERTKIT_API_SECRET,
RESEND_API_KEY, HUBSPOT_API_KEY, NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
NEXT_PUBLIC_CALENDLY_URL, AI keys) plus four ConvertKit Tags +
four Sequences with 12 emails authored. Tracked at
`tasks/weekend-env-setup.md`.

**2026-05-05 — Kajabi and Zapier dropped from Phase 2 architecture.**
The original CLAUDE.md plan routed `Stripe payment.success → Zapier
→ Kajabi` for course delivery. User decision: drop both. Course
delivery is in-house using existing `src/lib/lms/`,
`src/lib/course-harness/`, `src/lib/certificates/` modules and the
HTML mockups in `public/AiBI-P/`. Reasons: avoid the ~$199/mo Kajabi
fee, keep a single auth surface (Supabase Auth from Spec 2), keep
a single DB (Supabase), maintain full design control. New chain:
`Stripe payment.success → /api/webhooks/stripe → insert
course_enrollments row → ConvertKit welcome tag → user logs in
with existing Supabase Auth → /courses/aibi-p reads
course_enrollments to gate access`. The `course_enrollments`
schema lost its `kajabi_user_id` column; gained `user_id` referencing
`auth.users(id)` (bound on first login).

**2026-05-05 — Product menu simplified to four tiers.** Public site
reduced to: free assessment, In-Depth Assessment ($99 / $79 at 10+),
AiBI-Practitioner course ($295 / $199 at 10+), and a "custom engagements —
contact us" stub. AiBI-S and AiBI-L soft-hidden (route redirects to
/education, products deactivated in Stripe — reversible by toggle).
Advisory tiers (Pilot/Program/Leadership Advisory) removed pending
case-study content; replaced by a mailto stub on /for-institutions.
The 48 questions in `content/assessments/v2/questions.ts` now back
two products: the existing free 12-question rotation, and a new paid
48-question In-Depth Assessment with hybrid individual/institution
flow plus an anonymized aggregate report for institution leaders.
Tier thresholds rebalanced from 8-32 to 12-48 scale (equal-spaced
9-point bands: 12-20 Starting Point, 21-29 Early Stage, 30-38
Building Momentum, 39-48 Ready to Scale). Champion threshold for
aggregate dashboards is overall ≥ 39, top 2 emails surfaced.
Plans/ canonical specs left unchanged — site intentionally diverges
from plans for tiers being held back. Decision drivers + design
discussion in
`docs/superpowers/specs/2026-05-05-product-simplification-and-indepth-assessment-design.md`.

**2026-05-08 — MailerLite e2e setup complete.** Five Automations created
in production MailerLite (account `2331976`, sender
`hello@aibankinginstitute.com`): one Newsletter welcome bound to the
Newsletter group, plus four assessment tier sequences (Starting Point /
Early Stage / Building Momentum / Ready to Scale), each triggered on
"subscriber joins group" with a Day 0 / Day 3 / Day 7 cadence. All thirteen
emails authored against brand voice (full name "The AI Banking Institute"
in prose, AiBI only for credentials, sourced statistics with citations,
DM Mono numbers, no buzzwords) and live in
`src/lib/mailerlite/email-content.ts` as the version-controlled source of
truth — operators may polish in dashboard but the canonical copy is in the
repo. After the every-style-editor audit pass, all 5 Automations were
deleted and recreated with corrected copy (drop H1 terminal periods,
remove em-dash spaces, replace single quotes with doubles, eliminate
semicolons, drop retired "A-B-C framework" reference, spell out
February 2026, replace alternative slashes with "and"/"or"). Final
automation ids: Newsletter `186965438418126829`, Starting Point
`186965478342657970`, Early Stage `186965527420208336`, Building Momentum
`186965564883732340`, Ready to Scale `186965601924679393`. Project-level
style decisions documented in the email-content.ts header: subject =
headline (title case OK), H1 = subhead (sentence case, no period); bold
reserved for visual labels not prose emphasis; percentages stay in DM
Mono (`X%`) per brand rule, overriding Every's "X percent"; no semicolons
in email copy.

**Manual steps remaining before activation:** (1) authenticate sender
`hello@aibankinginstitute.com` in MailerLite Settings → Domains so the
"Sender email must be authenticated" config error clears on each email
step; (2) review each automation in the dashboard and toggle from Draft
to Active. End-to-end verified locally: a `marketingOptIn=true` POST to
`/api/capture-email` with tier `starting-point` lands the subscriber in
both `Tier · Starting Point` and `AI Readiness Assessment` groups via
the `tagAssessmentTier` upsert path (subscriber `186964712064288484`).
The route does NOT subscribe non-opted-in users to MailerLite — they
still get transactional Resend emails (assessment breakdown), but no
nurture sequence. This honors marketing-consent expectations.

**2026-05-06 — End-of-day state after long debug session.**
Outstanding follow-ups for next session:
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and mark Sensitive in Vercel
  (currently flagged by Vercel as plaintext-readable). Steps in
  /Users/jgmbp/Projects/TheAiBankingInstitute punch list.
- Clean `+aliasN@gmail.com` test rows from `auth.users`,
  `user_profiles`, `course_enrollments`. Multiple test users
  pollute the DB; intentional, will clean once flow is stable.
- Author 12 ConvertKit emails across 4 tier sequences + create
  the matching Tags. Only the code-side hooks are wired.
- End-to-end test the Stripe webhook: real $295 Checkout →
  payment → webhook → enrollment row + course-purchase email.
- Decide whether to fully kill `COMING_SOON=true` env var (current
  bypass list covers /assessment, /results, /verify, /education,
  /for-institutions, /courses, /dashboard, /admin, /auth, /api).
- PDF generation route `/api/assessment/pdf/warm` 500s with
  `libnss3.so missing` on Vercel serverless — pre-existing.
- Gitignore `.superpowers/brainstorm/` runtime state (got
  accidentally committed in `f0232a5`).

**2026-05-06 — Email + auth pipeline rebuild.** Started as a Resend
template wire-up, escalated when /results auth gate kept breaking
the magic-link round-trip. Final architecture:
- All transactional email runs through 5 published Resend Templates
  with sender `hello@aibankinginstitute.com` (domain verified
  2026-04-18). Helpers in `src/lib/resend/index.ts`.
- Supabase Auth emails (signup confirm, password reset, magic
  link, email change) go through Custom SMTP (Resend) with the
  `aibi-supabase-smtp` full-access key. Sender must be exact-case
  lowercase `hello@aibankinginstitute.com` — Resend's verified-domain
  check is case-sensitive.
- Email templates in Supabase Auth dashboard rewritten to use
  `{{ .TokenHash }}` and route through `/auth/callback?token_hash=
  ...&type=...&next=...` (PKCE flow). The default
  `{{ .ConfirmationURL }}` was rejected by verifyOtp.
- `/results/[id]` is a bearer-token URL — UUID is the access
  credential, no auth gate. `loadAssessmentResponse` queries
  `user_profiles` by `id` directly. This eliminated the
  magic-link round-trip that was the source of most pain.
- `EmailGate` auto-skips for logged-in users by reading
  `supabase.auth.getUser()` on mount and auto-submitting with
  the session email.
- `/courses/aibi-p/purchase` shows a clear "already enrolled"
  state instead of silently redirecting.
- Stripe env vars `STRIPE_AIBIP_PRICE_ID` ($295) and
  `STRIPE_AIBIP_INSTITUTION_PRICE_ID` ($199) live in Vercel
  Production scope.
- Coming-soon middleware bypasses `/results`, `/verify`,
  `/education`, `/for-institutions`, `/courses` so transactional
  email recipients aren't bounced to the placeholder.

**2026-05-06 — Five Resend transactional email templates +
AiBI-P → AiBI-Practitioner rename.** Authored five Resend Templates
in the dashboard so non-developers can edit copy without a code
deploy: `assessment-results-breakdown`, `course-purchase-individual`,
`course-purchase-institution`, `certificate-issued`, `inquiry-ack`.
Refactored `src/lib/resend/index.ts` to a generic `sendTemplate`
helper plus five named wrappers; wired the wrappers into
`/api/webhooks/stripe` (purchase emails, individual + institution),
`/api/courses/generate-certificate` POST (cert-issued email on
first issuance only — not idempotent retrieval), and `/api/inquiry`
(ack email). Swapped Resend sender from `onboarding@resend.dev` to
`hello@aibankinginstitute.com` (domain verified 2026-04-18). All
sends are best-effort, non-blocking, and no-op when
`RESEND_API_KEY` is unset. Renamed `AiBI-P` → `AiBI-Practitioner`
across user-facing copy (web pages, certificate PDF designation
and filename, transformation report, skill template library,
emails). Internal identifiers preserved: route `/courses/aibi-p`,
DB `product='aibi-p'`, file path `public/AiBI-P/`, env vars,
Stripe metadata, Resend template aliases — all kept short to avoid
URL/DB/integration churn. ConvertKit (marketing sequences,
newsletter) is unchanged. Auth emails (signup/reset/magic link) go
through Supabase Custom SMTP using Resend as transport — they are
configured in the Supabase Auth dashboard, NOT in Resend Templates;
their sender `From` field also needs swapping in the Supabase
dashboard (not yet done — manual step).

**2026-05-09 — Ledger brand refresh (Slice 0).** Executed on
`feature/brand-refresh`. The 2026-04-15 Terra/Sage/Cobalt designer brief
is superseded by a new "Ledger" design system delivered as a Claude
Design handoff bundle (saved at `docs/brand-refresh-2026-05-09/`,
original URLs in chats). Three canonical artifacts: `Design System.html`
(full token system + 21 component specs), `AI Readiness Briefing.html`
(assessment results page), and `LMS Prototype.html` + `lms/*.jsx`
(course harness React shell). The new palette is parchment/linen +
ink/navy + gold accent + oxblood for destructive only. Typography swaps
Cormorant/DM Sans/DM Mono for Newsreader/Geist/JetBrains Mono.
**Pillar color discipline is retired** — sage/cobalt/terra are no
longer enforced as visual grammar. The 4-pillar curriculum structure
shown in the LMS prototype data (Awareness · Understanding · Creation ·
Application) is descriptive, not a color rule. Slice 0 (this commit) is
additive only: new tokens in `src/styles/tokens-ledger.css`, new fonts
wired alongside existing ones, zero visible change. Migration proceeds
surface-by-surface in subsequent slices: internal `/design-system`
reference page → assessment results (Briefing) → LMS harness →
marketing site → cleanup of legacy tokens and fonts.

> _Note: An earlier coupled rename plan in this entry (AiBI-Practitioner
> → "AiBI Foundations" plural with route `/courses/foundations`) was
> superseded by PR #45 on 2026-05-11, which landed the canonical
> singular "AiBI-Foundation" with route `/courses/foundation/program`.
> See the 2026-05-11 PR #45 entry below for the canonical rename._


**2026-05-09 — AiBI-Foundation v2 redesign accepted; staged migration.**
The current AiBI-Practitioner course (12 modules, 6.6 hrs, $295) is
superseded by AiBI-Foundation v2 — a four-track product family under
one credential: Foundation Lite (4 modules · 90 min · $99 · mandatory
bank-wide), Foundation Full (20 modules · 9.5 hrs · $495), Manager Track
(3 modules · 90 min · $195), Board Briefing (2 modules · 60 min · $295/
director or $1,495 flat). Activity-driven (8 activity types, 80%+
hands-on, video capped at 60–90 sec per module). Multi-model platform:
Claude + ChatGPT + Gemini + Copilot Chat in parallel. Six new modules
in Full vs current course: M3 (How AI Got Here), M5 (Cybersecurity & AI
Threats), M6 (Talking About AI With Members), M12 (Spreadsheet
Workflows), M15 (Vendor Pitch Decoder), M18 (Incident Response Drill),
M19 (Examiner Q&A Practice). Pillar order is now strictly linear
(Awareness 1–4 · Understanding 5–10 · Creation 11–15 · Application
16–20) — explicitly framed as "defensible to examiners reviewing the
bank's AI training program." The Personal Prompt Library schema (18
fields) is the spine artifact and a FIXED CONTRACT — forward-compatible
with AiBI-Specialist's Departmental Skill Library and AiBI-Leader's
bank-wide AI portfolio. Canonical bundle now lives at
`Plans/foundation-v2/` (29 module specs, 33 artifact templates,
platform brief, positioning).

**Decisions captured this session:**
1. **Rename continues** — AiBI-Practitioner → AiBI-Foundation in
   user-facing copy. Internal IDs (`aibi-p` route, DB `product='aibi-p'`,
   file paths, Stripe metadata, Resend template aliases) kept short
   per the 2026-05-06 rename pattern to avoid URL/DB churn.
2. **9.5-hr commit acknowledged** — Full track is no longer "evening +
   weekend"; closer to a 2–3-weekend commit. Manager support and
   pacing matter more in marketing/onboarding copy.
3. **Lite is a real new SKU** — $99 mandatory bank-wide is a different
   sales motion (volume-priced site licenses). Stripe checkout needs
   a volume-pricing path before Lite goes live.
4. **M5 ships text-only** — Voice-clone and deepfake elements
   deferred. v2 launch curriculum covers prompt injection, AI-
   augmented phishing, and member conversation handling. The voice-
   verification protocol artifact stays in source bundle as future
   scope; affected specs (M5, L2, L4, voice artifacts) carry an
   editorial banner marking the deferral.
5. **Real-world capture (Type 8) deferred** — Activity Type 8
   (learner uploads sanitized real artifact) and the NPI regex
   guard are out of v2 launch scope. Final Lab (M20) reverts to
   synthetic-only inputs for launch.
6. **AiBI-S/L deferrals confirmed** — multi-agent orchestration,
   MCP, departmental governance held for Specialist; board strategy
   deck and 3-year roadmap held for Leader. Handoffs via the fixed
   Personal Prompt Library schema.

**Migration is staged, not shipped.** Touching course content, Stripe
pricing, the rename, and the Lite/Manager/Board track shells is
multi-week work. Punch list at `tasks/foundation-v2-migration.md`.
Plans/ canonical specs (aibi-prd.html etc.) left unchanged for the
v1 site — v2 supersedes only the course tier, not the homepage,
assessment, or institutional positioning.

**2026-05-11 — `aibi-p` → `foundation` systematic rename merged (PR #45).**
The 10-phase rename from the 2026-05-09 plan shipped to `main` as merge
commit `c172923`. 11 commits covering: forever-shim `normalizeProduct` /
`dbReadValues` at every DB read boundary (Stripe webhooks, course
enrollments, entitlements), 4 write-side flips from `'aibi-p'` to
`'foundation'`, migrations 00028 (CHECK constraint accepts both values)
and 00029 (backfill `course_enrollments.product`, `entitlements.product`,
`prompt_library.course_source_ref`, plus `course_id` on `user_artifacts`,
`saved_prompts`, `practice_rep_completions` with DELETE-on-UNIQUE
pre-flight), pedagogical prose swap (AiBI-P → AiBI-Foundation across 66
files), env var rename `STRIPE_AIBIP_*` → `STRIPE_FOUNDATION_*` (legacy
names kept as fallback). Internal identifiers preserved per 2026-05-06
pattern: route `/courses/aibi-p`, DB `product='aibi-p'` legacy value,
`AIBIP-` cert ID prefix, file path `public/AiBI-P/`. Shim is permanent —
Stripe retry events from 2026-Q1 enrollments can land at any future date
with `metadata.product='aibi-p'` and must collapse to `'foundation'`.

**Operator deploy steps remaining for the rename** (per
`tasks/aibi-p-to-foundation-deploy-checklist.md`): apply migrations
00028 then 00029 to staging then prod (in order — 00028 first so the
CHECK constraint accepts both values before the backfill flips rows);
add `STRIPE_FOUNDATION_PRICE_ID` and `STRIPE_FOUNDATION_INSTITUTION_PRICE_ID`
Vercel env vars (legacy `STRIPE_AIBIP_*` already work as fallback);
re-sync ConvertKit/MailerLite copy where "AiBI-Practitioner" appears;
update Stripe product *display* names; verify Resend template bodies.

**2026-05-11 — Four-track Foundation family REVERSED. AiBI-Foundation is
one course.** Reverses the 2026-05-09 Decisions Log entry. The four-track
product family (Lite $99 bank-wide, Full $495, Manager Track $195, Board
Briefing $295/director) is scrapped. There is one Foundation course — the
current 12-module curriculum at `content/courses/foundation-program/`,
served at `/courses/foundation/program/*`. AiBI-Practitioner is the old
name; AiBI-Foundation is the new name. Same course, renamed.

**What this means going forward:** anything pointing at the four-track
shape is dead. `Plans/foundation-v2/` (29 module specs, 33 artifact
templates) is archived authoring work — keep for historical reference but
**not** the source of truth. The single-course Foundation product runs on
the renamed v1 curriculum.

**Cleanup commits shipped to `main` 2026-05-11** (commits `b3ad031`,
`d3436f3`, plus this commit's stranded-code delete):
- `/courses/foundation` now redirects to `/courses/foundation/program`
  (was a marketing overview for the four tracks).
- `/education` page drops the "AiBI-Foundation v2 — preview" tile.
- Deleted: `src/app/courses/foundation/[track]/` (route tree),
  `src/app/courses/foundation/_components/` (ActivityRenderer +
  engines/BranchingScenarioEngine + LightMarkdown + SectionRenderer),
  `content/courses/aibi-foundation/` (32 files: Lite + Full + Manager +
  Board + refresh-slots), `tasks/foundation-v2-migration.md`.
- Demoted `Plans/foundation-v2/` rows in the Reference Plans table.

**What did NOT change:**
- The 2026-05-11 rename (PR #45, commit `c172923`) is unaffected — that
  was internal hygiene (aibi-p → foundation). The reversal here is about
  product shape (one course vs four tracks), not about names.
- The Personal Prompt Library 18-field schema is **still a fixed
  contract** for future AiBI-Specialist / AiBI-Leader compatibility.
- AiBI-S and AiBI-L deferrals remain in place; the single Foundation
  course is the only active SKU.

**Why the reversal:** The four-track design was a planning document;
the actual product has always been one course. Shipping four SKUs would
have required new Stripe products, new checkout flows, new institutional
volume-pricing logic, and ~5,500 lines of new platform code (8 activity
engines). None of that exists. The single-course shape matches both the
current code reality and the operator's mental model.

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
