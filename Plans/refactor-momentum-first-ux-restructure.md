# Momentum-First UX Restructure

**Type:** Refactor (architectural — copy + IA + nav + visual shell)
**Author plan:** 2026-05-06 / from owner UX critique
**Branch target:** new feature branch off `main` after `feature/stripe-products` lands
**Estimated scope (post-review):** 1 phase, ~1 week (was: 4 phases, 3-4 weeks)
**Owner intent (one sentence):** Replace a feature-first IA that reads like SaaS admin with a momentum-first journey shell that reads like a guided professional transformation for a non-technical, regulated-industry buyer.

---

## ⚠ Reviewer Cuts — read this first (2026-05-06)

Three reviewers (DHH-style simplicity, Kieran TypeScript taste, Code-Simplicity) read the original 869-line plan and pushed back hard. The plan that follows is the **original document**. The cuts below are **canonical** — implement against this section, not the original phase descriptions.

### Cut entirely

| Original section | What to skip | Why |
|---|---|---|
| `src/copy/index.ts` central string module (§Phase 1, §3.2) | All of it. Don't create the module. | Premature centralization for a single locale, single brand. Grep-and-edit is faster + lighter. `next-intl` migration when i18n actually arrives is a codemod either way. |
| `<CourseShell>` component extraction (§3.3, §Phase 3) | The component. | The existing `src/app/courses/aibi-p/layout.tsx` already is the shell. Edit it directly. Wrapping a layout in a component named "Shell" is a layout with extra steps. |
| `<ProgressSpine>` and `<NextStepCTA>` as new files (§Phase 3) | The "lift" framing. | Rename in place: `JourneyBanner.tsx` → keep, repoint imports if needed. `ProgressIndicator.tsx` → keep course-scoped until a real second use site appears. Don't move-and-rename in the same change. |
| URL tree rename `/dashboard/*` → `/today/*` (§Phase 3, all redirects in §Architecture-Diff) | All 7 redirects. The directory move. | Labels change in copy; URLs stay `/dashboard/*`. Eliminates: 7 308s, ConvertKit re-author, in-flight enrollee toast, internal-link audit, ~3-4 days of risk. Users read labels not paths. |
| Course IA URL restructure `lessons/`, `drills/`, `your-work/`, `mastery/` (§Phase 3) | Moving the route files. | Keep all existing URLs (`/courses/aibi-p/[module]`, `/toolkit`, `/prompt-library`, etc.). The UX win is "course feels like 4 phases, not 9 modules" — solved by re-grouping the **overview page** into 4 pillar cards and updating `CourseSidebar` to show 4 collapsible pillar groups. No URL moves, no redirects, no certificate-generation audit. |
| Phase 4 — institutional immediate-value layer | Entire phase. The `rollout_plan jsonb` migration. The new `/api/indepth/rollout` route. The anchored peer benchmarks. | N<5 cohort data; HubSpot `asset_size` unpopulated for most institutions; the "soft prerequisite" line was the tell. Ship empty-state copy improvement only ("Welcome, {leaderName}, your team's diagnostic is ready"). Build Phase 4 properly when N≥5 exists. |
| 3-state `<HomeHero>` (§3.5) | The "anonymous-returning" middle state. | Collapse to 2 states: authed / not. Returning-anonymous detection adds infrastructure for a cohort we have no traffic data for. Build when Plausible shows >5% of `/` visitors arrive with sessionStorage state. |
| Self-Review Checklist at end of original plan | Delete from spec. | If the plan needs an internal checklist, the plan is too long. |

### Keep (the 7 items that survive all three reviews)

1. **4-verb top nav** — Assess / Learn / Apply / Lead. Update `Header.tsx`, `MobileNav.tsx`, `Footer.tsx`.
2. **Vocabulary swap, in-place** — Toolbox→Playbooks, Module→Lesson, Dashboard→Today, Onboarding→Welcome, "My Toolkit"→"Your Work". No central copy module; grep + edit.
3. **Kill `/assessment/start`** — delete the page, add 308 redirect, update 24 internal link sites with `sed`.
4. **Inline assessment intro panel** — render as a dismissible card on `/assessment` itself; persist `introDismissed` flag in `useAssessmentV2`.
5. **Tighten free results page** — score + tier + 1 editorial sentence + 1 next-action CTA above the fold; collapse the 8-dimension breakdown to a `<details>` block (already exists, just promote/demote).
6. **AiBI-P overview re-groups into 4 pillar cards** — overview page renders 4 pillar tiles (Lessons / Drills / Your Work / Mastery); each tile groups existing modules by phase. **No URL changes.** Update `CourseSidebar` to show 4 collapsible pillar groups.
7. **`<JourneyShell>` for `/dashboard/*` (label changes only)** — ONE new component (verb-spine left rail + main + next-step CTA). The only genuinely new abstraction. URL stays `/dashboard`, label says "Today".

### Type contracts to keep tight (Kieran)

If a component IS built (only `<JourneyShell>` and the AssessmentIntroPanel survive), name its props in TypeScript before merging. Specifically:

- `<JourneyShell>` — `{ children: React.ReactNode; activeVerb: 'assess' | 'learn' | 'apply' | 'lead' }`
- `<AssessmentIntroPanel>` — `{ onBegin: () => void; onDismiss: () => void; defaultOpen?: boolean }`
- `useAssessmentV2` `PersistedState` — add `introDismissed: boolean` to the existing interface
- Plausible event names — keep stable across all 7 items (`assessment_*`, `toolbox_*`, `prompt_card_*` unchanged)

### Revised timeline — 1 week, single phase, one engineer

| Day | Work |
|---|---|
| 1 | Vocabulary sweep (Toolbox→Playbooks, Module→Lesson, Dashboard→Today) via grep+edit. Update Header / MobileNav / Footer to 4-verb spine. |
| 2 | Kill `/assessment/start` — delete page, add 308 redirect in `next.config.mjs`, sed 24 internal link sites to `/assessment`. |
| 3 | Inline `<AssessmentIntroPanel>` on `/assessment`. Wire `introDismissed` into `useAssessmentV2`. |
| 4 | Tighten `ResultsViewV2` — collapse to score + tier + 1 sentence + 1 CTA above the fold. Build `<JourneyShell>` for `/dashboard/*`. |
| 5 | Re-group AiBI-P overview into 4 pillar cards. Update `CourseSidebar` to show pillar groups. Visual review on iPhone Safari + Chrome desktop. Ship to staging. |

Cuts preserve ~90% of the user-perceived UX win at ~25% of the calendar cost. The original 4-phase plan below is preserved as **reference for the engineer who wants the underlying reasoning** — but implementation works against this Reviewer Cuts section.

### Reviewer audit trail

- DHH-style review: cut copy module, cut URL renames, cut Phase 4, cut 3-state hero, cut shell extractions. Verdict: "1 week of work."
- Kieran TypeScript: agreed on simplicity, added type-contract gaps for components that are built. Insisted on discriminated unions where state branches exist; `as const` copy module is fine if kept (but reviewer 1 cuts it entirely).
- Code-Simplicity: cut copy module, cut URL renames, cut Phase 4, collapse 3 states to 2. Verdict: "1 week, one engineer, one PR per day."

---

## Executive Summary

The platform's content and product architecture are strong. The user-facing shell is not. A community banker visiting today encounters 16+ named surfaces (free assessment, in-depth, AiBI-P, toolbox, certification, prompt cards, advisory, resources, quick wins, gallery, practice reps, exams, starter toolkit, dashboard, progression, institution flow), each with their own vocabulary, none arranged into an obvious next step. The fix is not new features. The fix is **a 4-verb spine — ASSESS / LEARN / APPLY / LEAD — with everything else nested**, plus a vocabulary rewrite that swaps operational terms (Dashboard, Module, Toolbox, Progression) for identity terms (Today, Lesson, Playbooks, Next Steps), plus a visual shell that makes the whole platform feel like one continuous journey rather than a collection of bolted-together products.

Two structural risks the spec doesn't address:

1. **The 4-verb platform spine and the proposed 4-pillar AiBI-P collapse use overlapping vocabulary** ("Learn" appears in both). Without resolving this, the restructure recreates the exact "feature-first confusion" it sets out to remove. **Resolution proposed in §3.1.**
2. **80% of inbound visitors are NOT net-new.** They're returning-and-partially-completed, or signed-in-and-mid-course. The "single-player path" recommendation is correct for the new visitor but wrong for everyone else. Every flow change must be specified for **three states**: anonymous-new, anonymous-returning-with-state, authenticated. **Resolution proposed in §3.5.**

The plan ships in four phases ranked by leverage:

- **Phase 1 — Vocabulary + nav (4-5 days).** Rename Toolbox / Dashboard / Progression in copy; introduce 4-verb top nav as labels. URL paths and routing logic do not change. Lowest risk; highest perceived impact.
- **Phase 2 — Assessment funnel compression (4-6 days).** Kill `/assessment/start` (24 link sites + redirect). Introduce inline progressive intro on `/assessment`. Tighten free results to "Bloomberg-meets-Apple-Fitness." Wire returning-visitor personalization on the homepage.
- **Phase 3 — Course pillar IA + Today view (1.5-2 weeks).** Collapse AiBI-P routes under 4 internal pillars (distinct vocabulary from platform spine). Introduce `/dashboard` "Today" hero pattern. Lift `JourneyBanner` and `ProgressIndicator` into a global `<JourneyShell>` for authenticated routes.
- **Phase 4 — Institutional immediate-value layer + copy polish (1 week).** Synthetic-anchored leader dashboard pre-aggregate. Identity-driven copy sweep across remaining surfaces.

Phases are decoupled at commit boundaries. Each phase ships independently to staging; analytics events (`assessment_*`, `toolbox_*`, `prompt_card_*`) keep stable names across the entire restructure to preserve Plausible historical comparability.

---

## Problem Statement

### What the owner is seeing

The owner's exact framing: *"You are selling confidence and simplicity but the platform currently behaves like a SaaS admin system."* This is the entire problem in 18 words.

Symptoms observed in the live build:

- Homepage CTA → `/assessment/start` → `/assessment` → email gate → results. **Four URL transitions** for one ostensibly atomic experience.
- `/dashboard` lands a user — who just paid $295 for a "career transformation" — into a KPI grid that names them "Learner" and shows them "modules to complete." LMS-speak.
- The toolbox is gated behind a paywall labeled "Paid Learner Toolbox." Banker reads "Toolbox" and assumes technical-tooling-not-for-me.
- Institution leader purchases $790+ (10 seats) and lands in an empty dashboard waiting for invitees to complete. **Idle time after spending money** is the highest-anxiety pattern in B2B sales.
- The four products (free assessment, in-depth assessment, AiBI-P course, certification) blur psychologically. *"Wait — why do I need both?"* is the failure mode.
- 16+ surfaces, no obvious "start here," no continuous visual spine across them.

### What the user actually wants from the platform

A community banker, age 35-60, in a $200M-$5B asset institution, mid-career, conservative, non-technical, mildly anxious about being left behind. They are buying:

1. **Relevance** — *will I still be useful in 3 years?*
2. **Confidence** — *can I actually do this?*
3. **Safety** — *will I get my bank in regulatory trouble?*
4. **Career protection** — *credible credential I can put on LinkedIn*
5. **Institutional trust** — *something my CEO will let me use*
6. **Practical competence** — *can I do my job better tomorrow?*

The mental model that serves these needs: **See where I stand → Learn what matters → Use AI safely → Become the AI person at my institution.** Four steps, one continuous arc, zero choose-your-own-adventure.

### Why the architecture fights this

Next.js App Router gives us free per-segment composition, which encouraged a feature-per-route architecture. Each route file produced its own header, its own metadata title, its own copy register. The result is the "many products bolted together" problem: each product was built well in isolation, and each product reads like it was built in isolation.

The technical fix is straightforward (rename + redirect + shell). The harder fix is the discipline to make every surface speak the same dialect.

---

## Proposed Solution

### 3.1 The vocabulary stack (RESOLVES the spine-vs-pillar collision)

The owner's spec proposed two 4-verb structures that collide on "Learn":

- **Platform-level spine:** ASSESS / LEARN / APPLY / LEAD
- **AiBI-P internal pillars:** Learn / Practice / Build / Certify

Two layers of nav, same vocabulary, guaranteed confusion. Resolution:

| Layer | Verbs | What it organizes |
|---|---|---|
| **Platform spine** (top nav) | ASSESS · LEARN · APPLY · LEAD | The four products' jobs-to-be-done |
| **AiBI-P internal pillars** (course IA) | Lessons · Drills · Artifacts · Mastery | The four pedagogy phases inside the course |

The platform spine answers *"what am I doing on this site?"* The internal pillars answer *"where am I in the course?"* They never collide because they're scoped to different routes.

Mapping to existing products:

| Platform verb | What's underneath | URL today | URL after Phase 3 |
|---|---|---|---|
| **ASSESS** | Free 12Q + In-Depth 48Q | `/assessment`, `/assessment/in-depth` | unchanged |
| **LEARN** | AiBI-P course (and any future S/L) | `/courses/aibi-p` | unchanged |
| **APPLY** | Banking AI Playbooks (renamed Toolbox) | `/dashboard/toolbox` | label rename only — see §6.2 |
| **LEAD** | Institution dashboard, credentials, advisory | `/assessment/in-depth/dashboard`, `/verify/[id]` | unchanged |

The AiBI-P internal pillars become the secondary nav inside `/courses/aibi-p/*` once the course IA collapses (Phase 3).

### 3.2 The vocabulary substitutions (whole-platform sweep)

Operational → Identity. Maintain a single source of truth in `src/copy/index.ts` so a future re-tune is one file.

| Today | Phase 1 | Notes |
|---|---|---|
| Dashboard | Today | The hero card is one verb-led action, not a KPI grid. |
| Progression | Your Journey | The page lives at the same URL initially; only label changes. URL move deferred to Phase 3. |
| Toolbox | Banking AI Playbooks (or **Playbooks** in compact UI) | Plausible event names stay `toolbox_*`. |
| My Toolkit (course) | Your Work | The "stuff you've made" room. |
| Module | Lesson | "Module 4 of 9" → "Lesson 4 of 9". 50+ string sites. |
| Module Complete | You're 60% to AiBI-P | Identity-driven progress copy. |
| Take Assessment | See where you stand | Verb-led CTA. |
| Start Assessment | Begin (inline, no separate URL) | Phase 2 kills `/assessment/start`. |
| Get Started | Start your journey | One CTA, one phrase. |
| Onboarding | Welcome | Three-question survey is "Welcome", not "Onboarding". |
| Enrollment | Join the program | "Enrollment includes…" → "Joining includes…". |
| Practitioner | Practitioner (KEEP) | The credential noun is identity-anchored already. |

### 3.3 The 4-state shell (visual continuity)

Not every page wears the same chrome. The clean abstraction:

| Audience | Chrome | Examples |
|---|---|---|
| **Anonymous, marketing** | Header + Footer only. No sidebar. | `/`, `/about`, `/for-institutions`, `/education`, `/resources/*` |
| **Anonymous, in-flight** | Minimal chrome (Header only, no Footer). Inline progress bar. | `/assessment`, `/assessment/in-depth/take` |
| **Authenticated, journey** | `<JourneyShell>` — Header + LeftRail (4 verb spine) + ProgressSpine + main + NextStepCTA | `/dashboard`, `/dashboard/playbooks`, `/dashboard/assessments`, `/dashboard/your-journey` |
| **Authenticated, course** | `<CourseShell>` — Header + course-scoped sidebar (lessons / drills / artifacts / mastery) | `/courses/aibi-p/*` |

The **`<JourneyShell>`** is new in Phase 3. The CourseShell exists today (`src/app/courses/aibi-p/layout.tsx`) and gets restructured in Phase 3 to expose the 4 internal pillars.

### 3.4 The assessment funnel: kill `/assessment/start`

**Today:** `/` → `/assessment/start` → `/assessment` → email gate → `/results/[id]`. Four hops.

**After Phase 2:** `/` → `/assessment` (with inline intro panel above Q1) → email gate → `/results/[id]`. Three hops.

The intro is a dismissible inline card — not a modal, not a separate URL. **Why not a modal:** loses the shareable URL, breaks back-button, fails for paid traffic landing pages. **Why not a separate URL:** that's exactly what we're killing. **Why inline:** preserves URL, no transition, returning visitors with sessionStorage state simply don't see the intro because they're already past Q1.

The 24 inbound link sites currently pointing to `/assessment/start`:

- 4 nav links (Header, MobileNav x2, Footer)
- 14 in-page CTAs across homepage, results, dashboard, education, resources, about
- 1 sitemap entry
- 5 marketing components (ROICalculator, SampleQuestion, HomeContextStrip, Paywall, etc.)

Two options:

**A — Redirect-only:** Add `/assessment/start → /assessment` in `next.config.mjs`. Keep all 24 inbound links pointing at `/assessment/start`. Browser hits 308 once. Simple, but every internal click costs a redirect hop. Lighthouse score takes a small hit.

**B — Rewrite + redirect:** Change all 24 inbound links to `/assessment`. Keep redirect for external bookmarks, ConvertKit drip emails, HubSpot CTAs. Recommended.

Plan goes with **B** because internal performance + clarity matter and the 24 sites are mechanical.

### 3.5 The three audience states (RESOLVES "single-player path" gap)

Every flow must be specified for three states:

| State | Detection | What they see on `/` |
|---|---|---|
| **Anonymous, net-new** | No `aibi-assessment` in sessionStorage, no auth cookie, no return cookie | "Start your AI banking journey" hero with one CTA → `/assessment` |
| **Anonymous, returning with state** | `aibi-assessment` in sessionStorage with completed answers OR returning-visitor cookie | Personalized header: "Pick up where you left off" + score recap + CTA → results / next product |
| **Authenticated** | Supabase Auth session | "Welcome back, {firstName}." Hero card = next action from `/dashboard`. Skip the marketing hero entirely. |

Implementation:

- Server-side detection (auth) → render different homepage section
- Client-side hydration (sessionStorage) → swap hero on mount for anonymous-returning case
- One `<HomeHero>` component with three sub-renders, not three pages

This kills the "single-player path is wrong for 80% of traffic" problem by making the hero **adaptive** instead of one-size-fits-all.

### 3.6 The institutional immediate-value layer

**Pre-aggregate state today:** Leader purchases → lands at `/assessment/in-depth/dashboard?session=…` → sees roster (empty) + invite textarea + locked aggregate panel ("3+ responses required").

**Pre-aggregate state after Phase 4:**

```
┌─ HEADER: institution_name + amount_paid ───────────────────────┐
│ Welcome, {leaderName}. Your team's diagnostic is ready.        │
└────────────────────────────────────────────────────────────────┘

┌─ SCAFFOLDED PANEL 1: Anchored peer benchmark ──────────────────┐
│ "Banks your size ($X-$Y) typically score:"                     │
│ Pillar A: 22/24 ─── Pillar B: 18/24 ─── Pillar C: 19/24       │
│ Source: FDIC Q4 2024 + AiBI cohort N=34                        │
└────────────────────────────────────────────────────────────────┘

┌─ SCAFFOLDED PANEL 2: 90-day rollout template (editable) ───────┐
│ Day 1-7:  Send invites, collect baseline                       │
│ Day 8-30: Lessons 1-3 across staff                             │
│ Day 31-60: Quick wins implemented                              │
│ Day 61-90: First measurable efficiency gain                    │
│ [Customize for {institution_name}]                             │
└────────────────────────────────────────────────────────────────┘

┌─ ROSTER + INVITES (existing) ──────────────────────────────────┐
│ Empty state: "Send 3 invites to unlock your real aggregate."   │
└────────────────────────────────────────────────────────────────┘

┌─ LOCKED REAL AGGREGATE (existing, but shown as ghost) ─────────┐
│ Pillar A: ▓▓▓░░ (locked — needs 3 completions)                 │
└────────────────────────────────────────────────────────────────┘
```

Critical: panels 1 + 2 must be **anchored on facts the buyer declared** (asset size from purchase metadata, institution name, seat count). Generic benchmarks read as marketing fluff. The Schwartz "Voice-of-Customer" rule applies: synthetic content must mirror back what the buyer told you.

Risk: synthetic benchmarks must respect CLAUDE.md's no-unsourced-statistics rule. Solution: cite FDIC + AiBI cohort N=N where N is real (the count of completed in-depth takes in our DB). When N<5, suppress the band entirely and show "we'll surface peer benchmarks once we have N≥5 community banks at your asset tier" — honest, still anchored, doesn't fabricate.

---

## Architecture Diff

### File structure: before → after

```
BEFORE:
src/components/
  Header.tsx              ← 3 nav links: For Learners, For Institutions, Resources
  MobileNav.tsx           ← 5 nav links + Take Assessment pill
  Footer.tsx              ← 3 column groups
  JourneyBanner.tsx       ← course-scoped CTA card
  AuthDropdown.tsx        ← Dashboard label
  sections/
    HomeContextStrip.tsx  ← detects authed user, surfaces enrollment state
  
src/app/
  assessment/start/page.tsx          ← TO BE DELETED (Phase 2)
  dashboard/page.tsx                 ← rename label to "Today"
  dashboard/progression/page.tsx     ← rename label to "Your Journey"; URL stable Phase 1, moves Phase 3
  dashboard/toolbox/*                ← rename label to "Playbooks"; URL stable
  courses/aibi-p/
    layout.tsx                       ← onboarding gate; bare overview already exempt
    page.tsx
    onboarding/                      ← Phase 3: → courses/aibi-p/welcome/
    [module]/                        ← Phase 3: → courses/aibi-p/lessons/[lesson]/
    toolkit/                         ← Phase 3: → courses/aibi-p/your-work/
    prompt-library/                  ← Phase 3: → courses/aibi-p/drills/prompts/
    quick-wins/                      ← Phase 3: → courses/aibi-p/drills/quick-wins/
    post-assessment/                 ← Phase 3: → courses/aibi-p/mastery/post-assessment/
    certificate/                     ← Phase 3: → courses/aibi-p/mastery/certificate/
    settings/                        ← stable
    purchase/                        ← stable
    artifacts/[artifactId]/          ← Phase 3: → courses/aibi-p/your-work/artifacts/[artifactId]/

AFTER (Phase 3 endstate):
src/copy/
  index.ts                ← NEW — single source of UI strings
  
src/components/
  Header.tsx              ← 4 verb spine: Assess / Learn / Apply / Lead + AuthButton
  MobileNav.tsx           ← matches Header
  Footer.tsx              ← 4 verb groups
  JourneyShell.tsx        ← NEW — wraps authenticated journey routes
  CourseShell.tsx         ← NEW — wraps /courses/aibi-p; replaces existing layout role
  ProgressSpine.tsx       ← NEW (lifted from courses/_components/ProgressIndicator)
  NextStepCTA.tsx         ← NEW (lifted shape from JourneyBanner)
  HomeHero.tsx            ← NEW — 3-state adaptive hero
  
src/app/
  assessment/page.tsx                           ← inline intro panel (Phase 2)
  /assessment/start → 308 redirect (next.config.mjs)
  
  (dashboard/) renamed to (today/) in copy ONLY through Phase 1-2
  
  Phase 3 URL renames:
  dashboard/                       → today/
  dashboard/progression/           → today/journey/
  dashboard/toolbox/               → today/playbooks/
  dashboard/toolbox/library/[slug] → today/playbooks/library/[slug]
  dashboard/toolbox/cookbook/      → today/playbooks/recipes/
  dashboard/assessments/           → today/assessments/
  
  courses/aibi-p/                  → unchanged top-level URL
    welcome/                       (was: onboarding/)
    lessons/[lesson]/              (was: [module]/)
    drills/
      prompts/                     (was: prompt-library/)
      quick-wins/                  (was: quick-wins/)
      reps/                        (was: practice/[repId] surfaced inside)
    your-work/
      page.tsx                     (was: toolkit/)
      artifacts/[artifactId]/
    mastery/
      post-assessment/
      certificate/
```

### Plausible event names — DO NOT CHANGE

```
KEEP STABLE (analytics historical comparability):
  assessment_start
  assessment_complete
  email_captured
  briefing_booked
  purchase_initiated
  closing_cta_click
  pdf_download_clicked / pdf_downloaded
  toolbox_skill_saved
  toolbox_scenario_run
  toolbox_skill_exported
  toolbox_paywall_shown
  cookbook_recipe_viewed
  prompt_card_*
  convertkit_tag_added
```

Add a code comment in each rename site explaining "event name kept for Plausible continuity."

### Redirects to add to `next.config.mjs`

```js
// Phase 2 (assessment funnel)
{ source: '/assessment/start', destination: '/assessment', permanent: true }, // 308

// Phase 3 (dashboard tree → today tree)
{ source: '/dashboard', destination: '/today', permanent: true },
{ source: '/dashboard/progression', destination: '/today/journey', permanent: true },
{ source: '/dashboard/assessments', destination: '/today/assessments', permanent: true },
{ source: '/dashboard/toolbox', destination: '/today/playbooks', permanent: true },
{ source: '/dashboard/toolbox/library/:slug*', destination: '/today/playbooks/library/:slug*', permanent: true },
{ source: '/dashboard/toolbox/cookbook/:slug*', destination: '/today/playbooks/recipes/:slug*', permanent: true },
{ source: '/dashboard/:path*', destination: '/today/:path*', permanent: true }, // catch-all LAST

// Phase 3 (course internal IA)
{ source: '/courses/aibi-p/onboarding', destination: '/courses/aibi-p/welcome', permanent: true },
{ source: '/courses/aibi-p/:module(\\d+)', destination: '/courses/aibi-p/lessons/:module', permanent: true },
{ source: '/courses/aibi-p/toolkit', destination: '/courses/aibi-p/your-work', permanent: true },
{ source: '/courses/aibi-p/artifacts/:id', destination: '/courses/aibi-p/your-work/artifacts/:id', permanent: true },
{ source: '/courses/aibi-p/prompt-library', destination: '/courses/aibi-p/drills/prompts', permanent: true },
{ source: '/courses/aibi-p/quick-wins', destination: '/courses/aibi-p/drills/quick-wins', permanent: true },
{ source: '/courses/aibi-p/post-assessment', destination: '/courses/aibi-p/mastery/post-assessment', permanent: true },
{ source: '/courses/aibi-p/certificate', destination: '/courses/aibi-p/mastery/certificate', permanent: true },
```

Order matters: more specific rules above generic catch-alls. The `/dashboard/:path*` catch-all goes last in the dashboard block so explicit rules win.

---

## Implementation Phases

### Phase 1 — Vocabulary + nav labels (4-5 days)

**Goal:** Top nav and surface labels read momentum-first. Zero URL changes. Zero behavior changes. Pure copy + simple component swaps.

#### Files

**Create:**

- `src/copy/index.ts` — central UI string module. Plain TS module, `as const`. Sections: `nav`, `cta`, `assessment`, `course`, `dashboard`, `toolbox`, `institution`, `auth`. ~150 strings.

```ts
// src/copy/index.ts (skeleton)
export const copy = {
  nav: {
    assess: 'Assess',
    learn: 'Learn',
    apply: 'Apply',
    lead: 'Lead',
    takeAssessment: 'See where you stand',
    todayCta: 'Today',
  },
  assessment: {
    intro: {
      eyebrow: 'Free · 3 minutes',
      title: 'See where you stand.',
      subtitle: '12 questions. No login required. Your score is yours immediately.',
      beginCta: 'Begin',
    },
    startOver: 'Start over',
    saving: 'Saving your answers…',
  },
  dashboard: {
    todayTitle: 'Today',
    nextActionLabel: 'Your next step',
    welcomeBack: 'Welcome back, {firstName}.',
  },
  course: {
    sidebar: {
      lessons: 'Lessons',
      drills: 'Drills',
      yourWork: 'Your Work',
      mastery: 'Mastery',
    },
    moduleAsLesson: 'Lesson',
  },
  toolbox: {
    title: 'Banking AI Playbooks',
    sidebarLabel: 'Playbooks',
    starterBanner: 'Read-only library access from your In-Depth Assessment purchase.',
  },
  // …
} as const;
```

**Modify:**

- `src/components/Header.tsx` — replace `NAV_LINKS` with the 4-verb spine. Each verb → its primary destination:
  - Assess → `/assessment` (was `/courses/aibi-p` "For Learners")
  - Learn → `/courses/aibi-p`
  - Apply → `/dashboard/toolbox` (label "Playbooks")
  - Lead → `/for-institutions`
  - Right rail pill → "See where you stand" / `/assessment`
- `src/components/MobileNav.tsx` — match Header.
- `src/components/Footer.tsx` — restructure 3 groups → 4 groups (Assess, Learn, Apply, Lead) + Institute (legal).
- `src/components/AuthDropdown.tsx:17` — "Dashboard" → "Today".
- `src/app/dashboard/page.tsx:109` — heading "Learner Dashboard" → "Today" + welcome line.
- `src/app/dashboard/toolbox/page.tsx:9, 29, 32` — title "Banking AI Toolbox" → "Banking AI Playbooks". Eyebrow "Paid Learner Toolbox" → "Banking AI Playbooks". Body "Build durable AI skills…" → identity copy.
- `src/app/dashboard/toolbox/library/page.tsx:15` metadata "Toolbox Library" → "Playbooks Library".
- `src/app/dashboard/toolbox/library/[slug]/page.tsx:31, 35` matching metadata.
- `src/app/dashboard/toolbox/cookbook/page.tsx:15, 44, 58` → "Recipes" or "Cookbook · Playbooks".
- `src/app/dashboard/toolbox/library/[slug]/ForkButton.tsx:54` "Save to Toolbox" → "Save to Playbooks".
- `src/app/dashboard/toolbox/_components/Paywall.tsx:19, 25` headings.
- `src/app/courses/aibi-p/_components/CourseSidebar.tsx:164` "My Toolkit" → "Your Work" (deferred to Phase 3 if scope tight).
- `src/app/courses/aibi-p/toolkit/page.tsx:27` metadata "My Toolkit" → "Your Work" (deferred to Phase 3).
- `src/app/dashboard/progression/page.tsx:455` breadcrumb "Dashboard" → "Today".
- All `module N of M` strings → `Lesson N of M` (~50 sites — see scoped list in repo inventory):
  - `src/app/courses/aibi-p/_components/ModuleHeader.tsx:33` — "Module {n}" → "Lesson {n}"
  - `src/app/courses/aibi-p/_components/ModuleNavigation.tsx:42, 64` — "Next Module" → "Next Lesson"
  - `src/app/courses/aibi-p/_components/CompletionCTA.tsx:145-156, 160, 166` — 12 strings
  - `src/app/courses/aibi-p/_components/CourseSidebar.tsx:55, 76`
  - `src/app/courses/aibi-p/_components/MobileSidebarDrawer.tsx:141, 161`
  - `src/app/courses/aibi-p/_components/ModuleContentClient.tsx:94`
  - `src/app/courses/aibi-p/_components/ActivitySection.tsx:241`
  - `src/app/courses/aibi-p/toolkit/page.tsx:283-488` (~17 sites)
  - `src/app/dashboard/page.tsx:169, 330`
  - `src/components/sections/HomeContextStrip.tsx:103`
  - and 20+ others — full list in repo-research-analyst output

**Code identifiers stay** — `module_id` in DB, `currentModule` in state, `ModuleHeader` component name. Copy-only sweep.

#### Acceptance criteria

- [ ] `npm run dev` and visit every public page; verify no string from the rename list appears in the rendered DOM (run `grep -r 'Toolbox' src/app/ src/components/` after the sweep — should match only code identifiers).
- [ ] Plausible custom-event reporting unchanged. Open Network tab, complete the assessment, confirm `assessment_start` and `assessment_complete` events fire with same names.
- [ ] No URL changes. `npm run build` produces the same route manifest as `main`.
- [ ] Visual review on iPhone Safari + Chrome desktop: every header, breadcrumb, sidebar reads new vocabulary.
- [ ] `src/copy/index.ts` exists and is the source of every string the rename touches. No literal strings in component files for the renamed terms.
- [ ] All 250 vitest tests still pass.
- [ ] Git diff shows only copy + import changes (no logic or routing changes).

#### Phase 1 risk register

| Risk | Mitigation |
|---|---|
| Missed string sites — "Toolbox" appears somewhere not in the inventory | Pre-commit grep: `git diff --staged \| grep -E '\b(Toolbox\|Dashboard\|Module \\d)\b'` before each commit. CI grep as a check. |
| Breaking the existing PDF report which references "Module N" in PDF metadata | Audit `src/lib/certificates/` and `src/app/assessment/results/print/[id]/page.tsx`. PDF terminology is downstream of email — confirm both before Phase 1 ships. |
| ConvertKit drip emails saying "Module 4 of 9" out in subscriber inboxes today | Cannot change retroactively. Phase 1 only fixes new emails. Email templates in `src/lib/resend/index.ts` are part of Phase 1 scope. |
| Plausible event drift if a code-identifier rename slips in | Lint rule: `event_name` literal calls inside `trackEvent(...)` and `window.plausible(...)` get a `// keep stable` comment. Code review checks. |

---

### Phase 2 — Assessment funnel compression (4-6 days)

**Goal:** Three hops to results, not four. Cleaner free-results page. Adaptive homepage hero.

#### Files

**Create:**

- `src/components/HomeHero.tsx` — adaptive 3-state hero. Server component reads auth session via `createServerClientWithCookies(cookies())`. Client subcomponent reads sessionStorage on hydration to detect anonymous-returning state. Three sub-renders:
  - `AnonymousNewHero` — "Start your AI banking journey" + one CTA → `/assessment`
  - `AnonymousReturningHero` — "Pick up where you left off" + score recap + CTA → results / next product
  - `AuthenticatedHero` — "Welcome back, {firstName}" + next-action card pulled from `/api/dashboard/learner`

**Modify:**

- `src/app/assessment/page.tsx` — render `<AssessmentIntroPanel>` above `<QuestionCard>` when `currentQuestion === 0` AND `answers.length === 0`. Once user clicks "Begin" or answers Q1, panel collapses.
- `src/app/assessment/_lib/useAssessmentV2.ts` — add `introDismissed` boolean to persisted state so refresh doesn't re-show the intro.
- `src/app/assessment/_components/AssessmentIntroPanel.tsx` — NEW. Accordion-style; collapsible; `aria-expanded`; ESC key to dismiss; mobile-keyboard-safe.
- `src/app/assessment/_components/ResultsViewV2.tsx` — tighten section 1-3 to a "Bloomberg-meets-Apple-Fitness" hero:
  - Score ring + tier label + ONE editorial sentence
  - ONE next-action CTA (per tier band)
  - "See full diagnostic" affordance (existing `<details>` block) hides everything else
- `src/app/page.tsx` — replace homepage hero block with `<HomeHero />`. Remove redundant CTAs that linked to `/assessment/start`.
- All 24 inbound link sites: `s,/assessment/start,/assessment,g`. Files listed in repo inventory §4.
- `next.config.mjs` — add `/assessment/start → /assessment` 308 redirect.
- `src/app/sitemap.ts:7` — replace `/assessment/start` entry with `/assessment` (or remove — homepage already covers it).
- `src/lib/resend/index.ts` — completion email templates: tighten copy to match new results-page voice.
- **Delete:** `src/app/assessment/start/page.tsx`.

#### Acceptance criteria

- [ ] Returning visitor with completed `aibi-assessment` sessionStorage lands on `/` and sees their score teaser, not the cold-start hero.
- [ ] Authenticated user lands on `/` and sees a personalized hero pulling next-action from learner dashboard.
- [ ] Anonymous net-new user lands on `/` and sees "Start your AI banking journey" with one CTA.
- [ ] `/assessment/start` returns 308 to `/assessment`. Verified with `curl -I http://localhost:3000/assessment/start`.
- [ ] Inline intro panel collapses on first answer, never reappears for that session.
- [ ] Free results page: score + tier + 1 sentence + 1 CTA visible above the fold on iPhone Safari (375×667).
- [ ] All 24 internal links point at `/assessment`. Grep confirms zero hits for `'/assessment/start'` outside of `next.config.mjs`.
- [ ] Plausible event `assessment_start` still fires (preserved name). New event `home_hero_state` fires with `{ state: 'new' | 'returning' | 'authed' }` for the adaptive hero.
- [ ] All 250 tests pass + new tests:
  - `AssessmentIntroPanel` renders + dismisses
  - `useAssessmentV2` persists `introDismissed` correctly
  - `HomeHero` server component branches by auth state
  - Redirect 308 verified in a route handler test

#### Phase 2 risk register

| Risk | Mitigation |
|---|---|
| Third-party drip emails (ConvertKit) cached in inboxes link to `/assessment/start` for 30+ days | 308 redirect handles this — no action needed. |
| Mobile keyboard pop on iOS Safari pushes intro panel off-screen, user never sees it | Intro panel uses `min-height: 100dvh` not `100vh`; tested on iPhone 12 / iPhone 14 / iPad. |
| Free results simplification reduces email-capture rate | A/B not feasible at our scale; track `email_captured` event before/after deploy as a proxy. Roll back if rate drops >10% in week 1. |
| `<HomeHero>` server component reads auth on every homepage render — perf hit | Auth read is already cheap (Supabase cookie check, no DB round-trip required for `getUser()` on a valid cached cookie). Measure on staging. Cache the homepage segment if cold-start hero render exceeds 100ms p95. |
| Returning visitor cookie collides with privacy banner / GDPR | Use `sessionStorage` (not cookie) for return-state detection — no consent required. |

---

### Phase 3 — Course pillar IA + Today view + JourneyShell (1.5-2 weeks)

**Goal:** AiBI-P collapses to 4 internal pillars. `/dashboard/*` tree renames to `/today/*`. Authenticated journey routes share a `<JourneyShell>` with the verb-spine sidebar and a global progress spine.

This is the structural phase. Highest risk, highest leverage.

#### Files

**Create:**

- `src/components/JourneyShell.tsx` — wraps authenticated journey routes. Slots: header, left rail (verb spine), main, right rail (next step). RSC + minimal client state.
- `src/components/CourseShell.tsx` — wraps `/courses/aibi-p/*`. Replaces existing layout's chrome role. Shows 4 pillars (Lessons / Drills / Your Work / Mastery) + active state via `usePathname()`.
- `src/components/ProgressSpine.tsx` — lifted from `src/app/courses/aibi-p/_components/ProgressIndicator.tsx`. Generic `{ steps: number; completed: number; current: number }`.
- `src/components/NextStepCTA.tsx` — lifted from `src/components/JourneyBanner.tsx`. Generic; takes `{ eyebrow, headline, ctaLabel, ctaHref }`.
- `src/app/today/layout.tsx` — wraps with `<JourneyShell>`.
- `src/app/today/page.tsx` — Today view. Hero card with one verb-led action + editorial nudge.
- `src/app/today/journey/page.tsx` — was `/dashboard/progression`. Same content, new chrome.
- `src/app/today/playbooks/page.tsx` — was `/dashboard/toolbox/page.tsx`. Same content, new chrome.
- `src/app/today/playbooks/library/page.tsx` and `library/[slug]/page.tsx` — moved.
- `src/app/today/playbooks/recipes/page.tsx` and `recipes/[slug]/page.tsx` — moved.
- `src/app/today/assessments/page.tsx` — was `/dashboard/assessments`. Same content, new chrome.
- `src/app/courses/aibi-p/welcome/page.tsx` — was `onboarding/`.
- `src/app/courses/aibi-p/lessons/[lesson]/page.tsx` — was `[module]/`.
- `src/app/courses/aibi-p/lessons/page.tsx` — NEW lesson hub (replaces overview's lesson list).
- `src/app/courses/aibi-p/drills/page.tsx` — NEW drill hub.
- `src/app/courses/aibi-p/drills/prompts/page.tsx` — was `prompt-library/`.
- `src/app/courses/aibi-p/drills/quick-wins/page.tsx` — was `quick-wins/`.
- `src/app/courses/aibi-p/your-work/page.tsx` — was `toolkit/`.
- `src/app/courses/aibi-p/your-work/artifacts/[artifactId]/page.tsx` — was `artifacts/[artifactId]/`.
- `src/app/courses/aibi-p/mastery/page.tsx` — NEW mastery hub.
- `src/app/courses/aibi-p/mastery/post-assessment/page.tsx` — moved.
- `src/app/courses/aibi-p/mastery/certificate/page.tsx` — moved.

**Modify:**

- `src/app/courses/aibi-p/layout.tsx` — replace inline chrome with `<CourseShell>`. Onboarding gate logic stays. Bare overview exemption stays.
- `src/app/courses/aibi-p/page.tsx` — overview now lists 4 pillars instead of 9 modules. Each pillar card shows "Lessons (4 of 9 done)", "Drills", etc.
- `src/app/courses/aibi-p/_components/CourseSidebar.tsx` — replaced (or significantly reworked) to render 4 pillars instead of module list. Module list moves into Lessons hub.
- `src/components/JourneyBanner.tsx` — DELETE (replaced by `NextStepCTA`).
- `src/components/sections/HomeContextStrip.tsx:103, 142` — update to point at new `/today/*` URLs (the 308 covers it but cleaner to update internal links).
- `next.config.mjs` — add all redirects from §4 (dashboard tree + course internal IA).
- `src/app/sitemap.ts` — update to new URLs.
- `src/lib/certificates/*` — verify completion logic still keys off module IDs (which haven't changed). Likely no change but audit required.
- All internal `<Link href="/dashboard/...">` and `<Link href="/courses/aibi-p/{module}">` callsites — sweep with grep, update to new URLs.

#### Course progress migration

`course_enrollments.completed_modules` is a `bigint[]` of module numbers. New IA does NOT change module IDs — just URLs. Existing enrollee at Module 4 still has `completed_modules: [1, 2, 3]`, and the new `/courses/aibi-p/lessons/4` page reads the same DB column. **No data migration required.**

#### Pillar mapping (content → IA)

| Pillar | Contents (existing → relocated) |
|---|---|
| **Lessons** | All 9 module pages. Module = lesson; URLs `/lessons/[1..9]`. Sequential. |
| **Drills** | Quick Wins log; Prompt Library; Practice Reps (currently at `/practice/[repId]` — surface inside the course). |
| **Your Work** | Toolkit page (artifacts, saved skills, prompts the learner authored). |
| **Mastery** | Post-Assessment; Certificate. |

Tool Guides (currently `/courses/aibi-p/tool-guides`) — sit alongside Lessons (it's reference content). Stays accessible via Lessons hub.

Gallery (currently `/courses/aibi-p/gallery`) — sits in Drills as "Output gallery" (peer reps). Or in Your Work as "Community Work." Owner decision before Phase 3 starts.

Settings — top-level inside CourseShell footer, like before. Not a pillar.

#### Acceptance criteria

- [ ] `/dashboard` redirects 308 to `/today`. Same for every old dashboard URL → new today URL. `curl -I` verified for all 7 paths.
- [ ] `/courses/aibi-p` overview shows 4 pillar cards (Lessons / Drills / Your Work / Mastery) with progress per pillar.
- [ ] CourseSidebar shows 4 pillars; clicking expands to children. Active pillar highlights via `usePathname()`.
- [ ] An existing AiBI-P enrollee with `completed_modules: [1,2,3]` lands on `/courses/aibi-p` and sees Lessons pillar at "3 of 9 complete." Clicking Lessons → `/courses/aibi-p/lessons` lists all 9 with status. Clicking lesson 4 → `/courses/aibi-p/lessons/4` renders the same module content as before the rename.
- [ ] Certificate generation still works. Enroll → complete all 9 lessons → land on `/courses/aibi-p/mastery/certificate`. Confirm certificate PDF generates with same template.
- [ ] `<JourneyShell>` renders identical chrome on `/today`, `/today/journey`, `/today/playbooks`, `/today/assessments`. Sidebar verb spine + progress spine + next-step CTA visible on each.
- [ ] All authenticated journey routes pass Lighthouse accessibility audit ≥95 (sidebar nav must have proper landmarks).
- [ ] All internal links updated to new URLs. Grep zero hits for `/dashboard/` outside `next.config.mjs`.
- [ ] All 250 vitest tests + new tests:
  - `JourneyShell` renders all slots
  - `CourseShell` highlights active pillar
  - Existing enrollee with mid-course state lands on lesson 4 correctly via 308
  - Certificate generation passes integration test
- [ ] ConvertKit drip emails authored (or queued for re-author) with new lesson URLs. Existing emails 308-redirect transparently.
- [ ] Plausible events: rename internally `dashboard_view` → `today_view` IF such an event exists (audit). All product-feature events (`toolbox_*`, `prompt_card_*`) keep stable names.

#### Phase 3 risk register

| Risk | Mitigation |
|---|---|
| `course_enrollments.completed_modules` array semantics break if module IDs ever drift | Verify migration plan: module IDs are stable (they're 1-9, hardcoded in `@content/courses/aibi-p`). Lesson rename is URL-only. Audit `src/lib/lms/` for any string-based module key. |
| Certificate generation logic reads module URLs in completion email | Audit `src/lib/certificates/`, `src/lib/resend/index.ts`. If templates have hardcoded URLs, update. |
| HTML mockups in `public/AiBI-P/` reference module URLs in their internal anchors | Audit. If they do, fix or accept that mockups link to old URLs (308-redirect transparent). |
| In-flight ConvertKit sequences for AiBI-P welcome / Day-3 / Day-7 emails link to old module URLs | 308 covers it. Re-author emails over time but no urgency. |
| Existing enrollees mid-course see new sidebar after deploy and feel disoriented | Add a one-time toast: "We've renamed Modules to Lessons. Your progress is unchanged." Dismissible; localStorage flag `aibi-p-rename-toast-dismissed`. |
| `<JourneyShell>` introduces a new persistent sidebar that breaks mobile layouts | Mobile collapse pattern: drawer behind hamburger, identical to existing `MobileSidebarDrawer`. Reuse the pattern. |
| Sidebar verb spine on `/today/playbooks/library/[slug]` looks weird because the slug-detail page is content-heavy | Consider whether deep slug pages escape JourneyShell into a single-column layout (route group `/today/(focus)/playbooks/library/[slug]`). Defer decision until visual review on staging. |

---

### Phase 4 — Institutional immediate-value layer + identity copy polish (1 week)

**Goal:** Leader landing post-purchase shows scaffolded value before invitees complete. Identity copy sweeps remaining surfaces.

#### Files

**Modify:**

- `src/app/assessment/in-depth/dashboard/_DashboardClient.tsx` — add two scaffolded panels above the existing roster + invite section:
  - **Anchored peer benchmark** — reads `seats_purchased` and (if available) institution metadata from HubSpot enrichment. Shows FDIC peer band + "AiBI cohort N=N" where N = SELECT COUNT(*) FROM indepth_assessment_takers WHERE completed_at IS NOT NULL. If N<5, suppress and show "we'll surface peer benchmarks once N≥5 community banks at your asset tier complete."
  - **90-day rollout template** — editable. Pre-filled with institution_name + dates relative to today. Day 1-7 / 8-30 / 31-60 / 61-90. Save edits to a new column on `indepth_assessment_institutions.rollout_plan jsonb`.
- `src/app/assessment/in-depth/dashboard/page.tsx` — pass new props (cohort_count, institution metadata).
- `supabase/migrations/00030_indepth_rollout_plan.sql` — NEW migration adding `indepth_assessment_institutions.rollout_plan jsonb`.
- `src/app/api/indepth/rollout/route.ts` — NEW. POST to save rollout plan edits.
- Identity copy sweep on remaining surfaces:
  - `src/app/courses/aibi-p/_components/CompletionCTA.tsx:145-156` — "Module 9 complete." → "You're now a Banking AI Practitioner." (12 strings)
  - `src/app/dashboard/page.tsx:238` — "Banking AI Practitioner" stays (correct identity noun)
  - `src/app/dashboard/progression/page.tsx:355, 463` — progress copy → identity copy
  - `src/components/sections/InteractiveSkillsPreview.tsx:153, 254` — CTA copy
  - `src/lib/resend/index.ts` — email template copy alignment with new on-page voice

#### Acceptance criteria

- [ ] Leader purchases In-Depth (use Stripe test mode + comp coupon) → lands on dashboard → sees 2 scaffolded panels above empty roster.
- [ ] Peer benchmark cites real cohort N. If N<5, suppresses cleanly with honest copy.
- [ ] Rollout plan template renders with institution_name + today's date. Editable. Saves to DB. Reloads from DB on revisit.
- [ ] Once 3+ invitees complete, real aggregate panel unlocks below; scaffolded panels stay visible above for context.
- [ ] All 250 tests + new:
  - `IndepthDashboard` renders scaffolded panels with N<5 and N≥5
  - Rollout plan saves and rehydrates correctly
  - Peer benchmark math (FDIC band + cohort delta) verified
- [ ] Identity copy sweep complete: grep for "Module N complete" returns zero hits. "Lesson N complete" appears throughout. "You are becoming a Practitioner" / "You're now a Practitioner" surfaces in completion screens.
- [ ] No statistics without sources. Audit of new copy passes the CLAUDE.md "no unsourced statistics" rule.

#### Phase 4 risk register

| Risk | Mitigation |
|---|---|
| Anchored benchmarks fabricate data when cohort N is small | Strict rule: N<5 = suppress band entirely + show honest copy. Code path verified by test. |
| Rollout plan editing UX is more complex than scope allows | MVP is read-only template with download-as-PDF or copy-to-clipboard. Editable version is Phase 4.5. |
| Identity copy reads as cult-y / cringe | Designer review of copy before shipping. Keep Cormorant restraint; avoid "you've earned the title of…" theatre. |

---

## Alternative Approaches Considered

### A. Modal-as-route for assessment intro (rejected)

The owner's spec suggested a modal/fullscreen intro. Researched and rejected because:

- Loses the shareable URL — `/assessment/start` is the primary funnel artifact (sales emails, conference QR codes, LinkedIn).
- Browser back-button + refresh + screen-reader announcement all break in modal-as-route patterns.
- Next.js parallel + intercepting routes solve the technical problem but add complexity for a single intro card.

Replaced with **inline progressive intro** on the same `/assessment` URL. Stripe Checkout / Cal.com pattern — page-level URL with modal-style chrome (no nav, single column, dismissible). Best of both.

### B. Rename URL paths in Phase 1 instead of Phase 3 (rejected)

Faster perceived progress but coupling fails:

- 24 inbound links to `/assessment/start` AND `/dashboard/*` tree all need rewrites simultaneously.
- ConvertKit drip emails would all need new authoring at once.
- Course IA collapse depends on JourneyShell, which doesn't exist until Phase 3.

Phase 1 is intentionally label-only so it ships fast and de-risks Phase 3.

### C. Replace Plausible event names alongside surface renames (rejected)

Cleaner code, terrible analytics. Plausible doesn't merge old + new event names — historical comparability dies. Industry guidance (NN/g, Plausible docs): track goals, not URLs. Event names stay stable through every phase.

### D. Single-page-app rebuild (rejected)

Would solve "feel like one continuous product" perfectly. Not on the table — Next.js App Router gives us most of the benefit (no full-page reloads on internal nav) and a SPA rebuild is a 6-month project.

### E. Fold In-Depth Assessment into AiBI-P as a pre-course (rejected)

Tempting because it kills "two products that blur." But In-Depth is institution-priced ($79 × seats); AiBI-P is per-learner ($295 individual / $199 institution). Different buyer, different sales motion, different business model. Keep separate.

### F. Defer the 4-pillar AiBI-P collapse indefinitely (rejected)

Phase 3 is the highest-risk phase; tempting to skip. But without it, the platform spine is incoherent: top nav says "Learn" → user clicks → arrives at a 9-module sequential list with no pillars. Dissonance. Ship Phase 3 or don't ship the 4-verb spine.

---

## Acceptance Criteria (rolled-up)

### Functional

- [ ] All 4 phases ship to staging and pass the per-phase acceptance criteria above.
- [ ] Zero broken internal links in production.
- [ ] All 308 redirects verified with `curl -I`.
- [ ] Existing AiBI-P enrollees with mid-course state (1≤completed_modules.length<9) land on the right lesson after rename.
- [ ] Existing In-Depth assessment results pages (`/results/in-depth/[id]`) still render correctly post-rename.
- [ ] Free assessment completion flow works end-to-end on iPhone Safari.
- [ ] In-Depth purchase + take + results flow works end-to-end on iPhone Safari.
- [ ] Institution leader purchase + invite + aggregate flow works end-to-end on Chrome desktop.
- [ ] Toolbox starter tier (In-Depth buyer) sees Playbooks read-only with banner explaining the limitation.
- [ ] Toolbox full tier (AiBI-P enrollee) sees full Playbooks with all 5 tabs.

### Non-functional

- [ ] Lighthouse Performance ≥90 on `/`, `/assessment`, `/today`, `/courses/aibi-p` desktop + mobile.
- [ ] Lighthouse Accessibility ≥95 on the same pages.
- [ ] Bundle size on routes touched does not exceed pre-restructure baseline by more than 15%.
- [ ] CLS (Cumulative Layout Shift) ≤0.1 on adaptive HomeHero (server vs client hydration).
- [ ] Plausible custom event names unchanged across the entire restructure.

### Quality gates

- [ ] All 250 vitest tests + new tests pass.
- [ ] `npm run build` succeeds with zero TypeScript errors.
- [ ] `npm run lint` passes.
- [ ] Visual regression tests (if added) pass.
- [ ] `src/copy/index.ts` is the single source of strings for renamed terms.

---

## Success Metrics

| Metric | Source | Baseline (pre-restructure) | Target (4 weeks post) |
|---|---|---|---|
| Free assessment completion rate | Plausible `assessment_complete / assessment_start` | TBD — capture week before Phase 1 ships | +5pts (cleaner funnel reduces drop-off) |
| Email-capture rate on results | Plausible `email_captured / assessment_complete` | TBD | -10pts to +0pts (results simplification may reduce gate friction; we accept slight drop in exchange for higher quality leads) |
| Free → In-Depth conversion (within 30 days) | Stripe + Plausible `purchase_initiated` | TBD | +25% (clearer product positioning) |
| Free → AiBI-P conversion (within 90 days) | Stripe | TBD | +15% |
| Time-to-first-action on `/dashboard` (now `/today`) | Plausible | TBD | -50% (single hero card vs KPI grid) |
| In-Depth institution leader 30-day return rate | Supabase + Plausible | TBD | +30% (immediate-value layer reduces post-purchase abandonment) |
| Bookmark / direct-traffic preservation | Plausible Pages report | All current URLs receive traffic | All 308-redirected URLs continue receiving traffic; new URLs accumulate |

Caveats: traffic volume is low (decision log notes "zero traffic"). Metrics are directional, not statistically significant. Rolling back Phase 4 specifically possible if benchmarks read as fluff in user feedback.

---

## Dependencies & Prerequisites

**Hard prerequisites (must be merged to main before this branch starts):**

- `feature/stripe-products` merged. The 4-state shell logic + course-pillar-aware redirects assume the In-Depth product exists at its current paths.
- Migrations 00028 + 00029 applied to staging + production.
- `RESEND_API_KEY` and the four `CONVERTKIT_TAG_ID_INDEPTH_*` env vars set on Vercel.

**Soft prerequisites (nice to have):**

- Designer review of the new vocabulary (Phase 1) and the JourneyShell layout (Phase 3) before code review.
- HubSpot custom property `asset_size` populated for at least 50 institutions before Phase 4 ships (so the anchored benchmark band has a denominator).
- 5+ completed In-Depth takes in the cohort before Phase 4 ships (so cohort-N citation isn't immediately suppressed).

**Tooling:**

- Stripe CLI for local webhook testing.
- Supabase CLI for migration runs.
- Plausible dashboard access to baseline metrics before Phase 1 ships.

---

## Risk Analysis (rolled-up)

| Severity | Risk | Phase | Mitigation |
|---|---|---|---|
| H | Course IA collapse breaks existing enrollees mid-course | 3 | Module IDs stable; URL renames + 308s; in-app toast on first post-deploy visit. |
| H | Anchored benchmarks fabricate data when N<5 | 4 | Strict suppression rule + honest copy; tested code path. |
| H | Plausible event continuity broken by rename | All | Code review + lint check that event-name strings stay identical. |
| M | Inline assessment intro mobile keyboard interactions | 2 | Test on iPhone 12 / 14 / iPad before merge. |
| M | Free results simplification drops email-capture rate | 2 | Track `email_captured` event; rollback threshold -10% in week 1. |
| M | JourneyShell sidebar contradicts content-heavy slug pages | 3 | Route group escape hatch; deferred decision until visual review. |
| M | ConvertKit drip emails out in inboxes link to renamed URLs | 2, 3 | 308 redirects cover transparently; re-author over time. |
| L | HubSpot custom property `asset_size` unpopulated for some institutions | 4 | Suppression + honest copy. |
| L | HTML mockups in `public/AiBI-P/` link to old URLs | 3 | 308 covers; audit if anyone links into them. |

---

## Resource Requirements

| Resource | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|---|---|---|---|---|
| Engineer | 4-5 days | 4-6 days | 1.5-2 weeks | 1 week |
| Designer | 1 day (vocab review) | 2 days (HomeHero + AssessmentIntro) | 4 days (JourneyShell + CourseShell visual) | 2 days (Leader dashboard + copy review) |
| Owner / PM | 0.5 day (vocab signoff) | 0.5 day (results-page direction) | 1 day (pillar mapping signoff) | 0.5 day (rollout-plan template signoff) |

Total engineer effort: ~4 weeks. Calendar time: 4-5 weeks with one person and the dependencies above.

---

## Future Considerations (out of scope, noted for the record)

- **Internationalization.** Plain `src/copy/index.ts` is English-only. `next-intl` upgrade path is mechanical (wrap keys in `t()`).
- **Onboarding personalization.** Three-state hero is a foundation. A real personalization engine (return-rule scoring, cohort tagging) is a separate project.
- **Mobile-first redesign of the In-Depth take experience.** 48 questions on a 4" screen needs work that this restructure doesn't tackle.
- **Per-tier framing on the In-Depth starter artifact.** Same artifact body for all four tier bands today. A short tier-specific preface would lift perceived value. Flagged in CLAUDE.md as a future lever.
- **Search.** No global search exists. With 4 verb pillars + ~50 surfaces, search becomes valuable. Future project.
- **`next-intl` migration** if a Spanish-language community-bank cohort surfaces.
- **AiBI-S and AiBI-L reactivation.** Currently soft-hidden via redirects. When they return, slot them under the LEARN spine alongside AiBI-P.

---

## Documentation Plan

- Update `CLAUDE.md` Decisions Log with 2026-05-06 entry summarizing the spine + the vocabulary.
- Update the Reference Plans table in CLAUDE.md to reflect that this PRD supersedes pieces of `aibi-prd.html` and `aibi-site-v3.html`.
- New file: `docs/superpowers/2026-05-06-vocabulary-source-of-truth.md` — explains why `src/copy/index.ts` is the canonical text store and how to add strings.
- New file: `docs/superpowers/2026-05-06-journey-shell-architecture.md` — design notes on JourneyShell + CourseShell + ProgressSpine + NextStepCTA.
- Update `tasks/outstanding-plan.md` with Phase 1-4 status as each ships.

---

## References & Research

### Internal references

- Repo inventory: `docs/superpowers/2026-05-06-combined-journey-and-merge-brief.md`
- User-journey PRD: `docs/superpowers/2026-05-06-user-journey-prd.md`
- Merge brief: `docs/superpowers/2026-05-06-merge-brief.md`
- Decision log: `/Users/jgmbp/Projects/TheAiBankingInstitute/CLAUDE.md` Decisions Log section
- Existing primitives to lift:
  - `src/components/JourneyBanner.tsx`
  - `src/app/courses/aibi-p/_components/ProgressIndicator.tsx`
  - `src/app/courses/aibi-p/_components/CourseSidebar.tsx`
- Existing layout patterns:
  - `src/app/courses/aibi-p/layout.tsx` (onboarding gate + chrome)
  - `src/app/layout.tsx` (chromeless detection)

### External references

- NN/g, "Progressive Disclosure": https://www.nngroup.com/articles/progressive-disclosure
- NN/g, "Flat vs Deep Hierarchy": https://www.nngroup.com/articles/flat-vs-deep-hierarchy
- NN/g, "Modal vs Non-Modal Dialog": https://www.nngroup.com/articles/modal-nonmodal-dialog
- Eugene Schwartz, *Breakthrough Advertising* (1966) — awareness ladder taxonomy
- James Clear, *Atomic Habits* — identity-based habit formation
- Joanna Wiebe, Voice of Customer methodology — copyhackers.com
- Next.js App Router redirects: https://nextjs.org/docs/app/api-reference/next-config-js/redirects
- Next.js parallel + intercepting routes: https://nextjs.org/docs/app/building-your-application/routing/parallel-routes
- Next.js layouts: https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
- next-intl (recommended copy/i18n library): https://next-intl.dev

### Reference products studied

- Duolingo — single skill tree, identity copy, streak as identity badge
- TurboTax — interview-style flow for regulated/anxious users
- Calm / Headspace — "Today" view, single hero session
- Apple Fitness — "rings" as continuous progress shape, never %
- Carta — onboarding wizard for cap-table setup, regulated finance
- Gusto — linear "set up your company" pathway
- Monzo / Wealthfront / Acorns / Mercury — FinTech "Home" not "Dashboard"
- Khan Academy — "Learn / Practice / Teach" 3-verb top nav
- Coursera — "Learn / Career / Degrees" 3-verb top nav
- Strava — "Home / Maps / Groups / You" 4-verb top nav with identity noun ("athlete")
- Linear — anchored empty state with pre-seeded sample issues
- Vanta — pre-launch compliance scorecard with N=N citation
- Lattice — "your first review cycle" template
- Noom / WHOOP — awareness-ladder pricing
- MasterClass — "Become a better writer" identity copy
- Peloton — "You are a [#OPC] member" identity badge
- Stripe Checkout / Cal.com — page-level URL with modal-style chrome

---

## Self-Review Checklist (planner)

- [x] Spec coverage: all 10 ROI items mapped to phases. ✓
- [x] Placeholder scan: no "TBD" inside acceptance criteria except metric baselines (intentional — captured pre-Phase-1). ✓
- [x] Type consistency: file paths verified against `git diff main..HEAD --name-status`. ✓
- [x] Phase coupling: Phase 1 is independent; Phase 2 depends on copy module from Phase 1; Phase 3 depends on shell-component lifting which Phase 1+2 introduce; Phase 4 depends on Phase 3 chrome. ✓
- [x] Audience-state coverage: all flows specified for anonymous-new / anonymous-returning / authenticated. ✓
- [x] Vocabulary collision (LEARN platform vs Learn pillar) resolved via §3.1. ✓
- [x] Plausible event preservation: documented + acceptance criteria + risk register. ✓
- [x] Migration / data implications: zero schema changes Phase 1-3; one additive jsonb column Phase 4. ✓
