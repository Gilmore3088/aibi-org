# AiBI Toolbox — Design Spec v1

**Status:** Design approved — pending user review before implementation planning
**Author:** Claude (brainstorming session with James Gilmore)
**Date:** 2026-04-29
**Branch:** `feature/toolbox`
**Worktree:** `~/Projects/aibi-toolbox`
**Next step:** User review → invoke `superpowers:writing-plans` to create implementation plan

---

## ⚠️ For other agents/sessions reading this

This spec is the **canonical source of truth** for the AiBI Toolbox feature. It was produced through a structured brainstorming session and reflects locked-in decisions. Do not relitigate decisions marked ✅ Locked unless the user explicitly asks. Open items are flagged as TBD.

The spec has **not** been turned into an implementation plan yet. Implementation planning is the next step — do not start coding until a plan exists in `docs/superpowers/plans/`.

---

## 1. Summary

The **AiBI Toolbox** is a paid-only, gated product surface at `/dashboard/toolbox` containing four learner tools:

1. **Skill Builder** — guided creator for reusable AI skills (system prompt + user template + variables + teaching annotations)
2. **Skill/Prompt Template Library** — 25 bank-specific starter Skills harvested from course content
3. **Playground** — multi-provider sandbox (Claude, OpenAI, Gemini) for safe prompt experimentation with PII redaction warnings
4. **Cookbook** — curated end-to-end recipes that chain multiple Skills into full workflows

The Toolbox is **bundled with every paid course enrollment** (AiBI-P, AiBI-S, AiBI-L). In a future Phase 2, Skill Builder + Library will also be sold as a standalone monthly subscription.

The single most important interaction is **"Save to Toolbox"** — a one-click capture button surfaced everywhere a prompt example appears in course content. This creates a tight learning loop: see in lesson → test in Playground → save to personal toolbox → keep using after course ends.

---

## 2. Goals

- Make every course experience hands-on; learners leave with a personal library of AI skills they built themselves.
- Give bankers a **safe, sandboxed environment** to experiment with multiple AI providers without risking PII exposure or compliance violations.
- Build a **defensible recurring-revenue product** (Skill Builder + Library subscription) for the post-course audience in Phase 2.
- Reinforce the three-pillar curriculum (Accessible · Boundary-Safe · Capable) through tools learners use daily.
- Teach **good prompting habits** by example — every Library/Cookbook entry is a fully-worked teaching artifact, not a stub.

## 3. Non-Goals (v1)

- Not a general-purpose AI chat product. The Playground is scoped to learning, not production work.
- Not a replacement for institutional AI platforms (Microsoft Copilot, ChatGPT Enterprise).
- No team/multi-seat collaboration in v1 — single-learner toolbox only.
- No public skill marketplace in v1 (community sharing comes later).
- No Compare Mode (side-by-side multi-model output) in v1 — deferred to Phase 2.
- No standalone subscription product in v1 — Phase 2.

---

## 4. Users & Access

### 4.1 Access Rule (Locked)

Toolbox is **paid-only**. Visible only to users with at least one active paid entitlement.

```
PAID_PRODUCTS = ['aibi-p', 'aibi-s', 'aibi-l', 'toolbox-only' /* phase 2 */]

hasToolboxAccess(user) =
  user.entitlements.some(e => e.active && PAID_PRODUCTS.includes(e.product))
```

### 4.2 User Types

| User type | Access |
|-----------|--------|
| AiBI-P / AiBI-S / AiBI-L enrollee | Full Toolbox during enrollment + 12 months after |
| Free Class learner *(future)* | None. Free Classes do NOT unlock Toolbox in v1. |
| Standalone Subscriber (Phase 2) | Skill Builder + Library only (no Playground, no Cookbook curation) |
| Anonymous / unauthorized / unpaid | Redirect from `/dashboard/toolbox` to a paywall page explaining the Toolbox is included with any paid course; CTA to `/education` |

### 4.3 IA Placement (Locked)

- **App surface:** `/dashboard/toolbox` — gated, behind login + entitlement check
- **NOT in public top nav** — entry is from inside course modules and the dashboard sidebar
- **Deep links from courses:** every prompt example in a course module has a "Try in Skill Builder →" or "Open in Playground →" link
- **Phase 2 marketing surface:** when standalone subscription launches, a public sales page lives at a separate URL (TBD); the *app* still lives at `/dashboard/toolbox`

---

## 5. The Four Tools

### 5.1 Skill Builder

A guided UI for creating, editing, and managing personal Skills.

**A "Skill" is (Locked: Option B):** a reusable AI instruction packet with the following schema:

```typescript
interface Skill {
  id: string;
  owner_id: string;             // user who owns this skill (null for Library originals)
  source: 'library' | 'course' | 'user' | 'forked';
  source_ref?: string;          // e.g., "aibi-p/module-3/lesson-2" or parent skill id

  title: string;                // "Draft a loan denial letter (ECOA-compliant)"
  description: string;          // 1-2 sentences on when to use it
  system_prompt: string;        // 100-300 words establishing role, rules, constraints
  user_prompt_template: string; // with {{variable}} placeholders
  variables: Variable[];        // typed list of fillable blanks
  example?: { input: Record<string, string>; output: string };

  pillar: 'A' | 'B' | 'C';      // Accessible / Boundary-Safe / Capable
  category: string;             // 'Lending' | 'Operations' | 'Compliance' | 'Marketing' | 'Executive'
  compliance_notes?: string;    // "Aligned with ECOA/Reg B §1002.9"
  teaching_annotations?: TeachingAnnotation[]; // "Why this works" callouts shown in UI

  created_at: string;
  updated_at: string;
}

interface Variable {
  name: string;       // 'applicant_name'
  label: string;      // 'Applicant Name'
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  options?: string[]; // for type='select'
  placeholder?: string;
}

interface TeachingAnnotation {
  anchor: 'system_prompt' | 'user_template' | 'variables' | 'example';
  pattern: string;    // e.g., 'role-and-context', 'explicit-constraints', 'output-format-spec'
  explanation: string; // why this prompting pattern was used here
}
```

**Skill Builder UI:**

- Step-by-step guided creation flow (title → role/system prompt → user template → variables → example → tags)
- Edit mode for existing Skills
- "Test in Playground" button that pre-loads the Skill into the Playground
- "Fork from Library" entry point that pre-fills from a Library template

### 5.2 Skill/Prompt Template Library

**v1 sourcing (Locked):** 25 launch Skills harvested directly from existing course content (AiBI-P modules). The Library is a curated, polished subset of prompts already living in lessons.

**Library entries are read-only originals.** Learners "fork" them into their personal Toolbox, which creates an editable copy with a `source: 'library'` provenance pointer back to the original.

**Authoring Standard (Locked, applies to Library AND Cookbook):**

Every Library/Cookbook entry must demonstrate **good prompting habits** because the Library is a teaching artifact, not just a utility. Each entry must:

1. **Demonstrate at least 4 of these prompting best-practice patterns** with visible teaching annotations:
   - Role + context first (system prompt establishes who the AI is and what it knows)
   - Explicit constraints (what to avoid, reading level, tone, format)
   - Structured input (XML tags, delimiters, or labeled sections)
   - Few-shot examples when behavior is hard to describe
   - Chain-of-thought scaffolding for analytical tasks ("think step by step before answering")
   - Output format spec (exact shape: headers, bullets, JSON, etc.)
   - Compliance/boundary notes (no PII, no invented citations, no legal advice)
   - Source citations (SR 11-7, ECOA §X, FDIC, etc.) where regulatory framing is relevant

2. **Include teaching annotations** — "Why this works" callouts visible in the UI as expandable elements next to the relevant section of the prompt

3. **Cite a regulatory or research source** where applicable (must follow CLAUDE.md citation rules — no unsourced statistics)

4. **Pass a prompt review** before publishing (analogous to code review — at minimum a second human eye)

**Library views/filters:**
- By department (Lending / Operations / Compliance / Marketing / Executive)
- By pillar (A / B / C)
- By complexity (Beginner / Intermediate / Advanced — based on how many best-practice patterns demonstrated)

### 5.3 Playground

A safe, sandboxed AI chat environment for testing Skills and prompts.

**Multi-provider model picker (Locked):** learner selects from a menu of 6 models so they experience differences across providers firsthand.

**v1 model menu:**

| Provider | Model |
|----------|-------|
| Anthropic | Claude Haiku 4.5 |
| Anthropic | Claude Sonnet 4.6 |
| OpenAI | GPT-4o-mini |
| OpenAI | GPT-4o |
| Google | Gemini 2.5 Flash |
| Google | Gemini 2.5 Pro |

Opus deferred (cost). Compare Mode (side-by-side multi-model output) deferred to Phase 2.

**Safety rules:**

- **PII detection and warning:** automatic detection of likely SSN, account numbers, full names with addresses, etc. Blocks send with a warning + "edit" or "send anyway after redaction" choice. (Detection only — not bulletproof; learners are taught this is a learning tool, not a production tool.)
- **Conversations are not used for training** — confirmed via provider API settings; surfaced to learners in the Playground UI.
- **Disclaimer banner:** "This is a learning sandbox. Do not enter real customer data. Output is for educational purposes only."
- Skills can be invoked directly in the Playground (drop-down: "Run with skill: ..." pre-loads system prompt and template).
- Session-only by default; learner can save a transcript or refined prompt to their Toolbox as a Skill.

**Quota model (Locked at concept; numbers TBD):**

- Track in **dollars of cost**, not tokens (because cost varies wildly by model — Sonnet is 15x GPT-4o-mini for output).
- Each enrolled learner gets a **daily AI budget** and **monthly ceiling**.
- Placeholder defaults (TBD calibration before launch): **$0.50/day, $10/month**
- Playground UI shows a thin "$0.31 / $0.50 today" meter
- Friendly warning at 80% utilization
- Hard cutoff at 100% with reset at midnight (daily) or first of month (monthly)

**Required environment variables (new):**

```
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
# ANTHROPIC_API_KEY already present in shell env
```

### 5.4 Cookbook

**Locked: separate surface** at `/dashboard/toolbox/cookbook`.

The Cookbook contains end-to-end **recipes** — narrative, walkthrough-style guides that chain 3–4 Skills together to accomplish a complete workflow.

Examples:
- "Drafting a credit memo from a loan application" (Skill 1: extract from application → Skill 2: generate financial summary → Skill 3: assemble memo)
- "Responding to a customer complaint with full audit trail" (Skill 1: classify complaint → Skill 2: draft response → Skill 3: log compliance summary)

Each recipe includes:
- Plain-English overview of the workflow
- Step-by-step instructions
- Each step links to a Skill in the Library
- Worked example with sample inputs and outputs
- Teaching annotations explaining why this workflow is structured this way
- Compliance notes / regulatory citations

**v1 Cookbook scope:** ~5–8 recipes at launch. Less than the Library because each recipe is more expensive to author (full narrative + multi-skill choreography).

---

## 6. Cross-Tool Behaviors

### 6.1 "Save to Toolbox" — universal capture action (Locked, named feature)

**This is the most important interaction in the entire product.**

Anywhere a prompt example, system prompt, or worked exercise appears in a course module, there is a **"Save to Toolbox"** button. One click captures that artifact into the learner's personal Toolbox as an editable Skill.

Requirements:

- Every course-embedded prompt is **Toolbox-ready** — authored to the same teaching-artifact standard (system prompt + user template + variables + annotations).
- Saved Skills retain a **provenance backlink**: `source: 'course'`, `source_ref: 'aibi-p/module-3/lesson-2'`. Clicking the backlink in the Toolbox opens the originating lesson.
- The Save button is also present:
  - Inside the Playground (save the current refined prompt)
  - Inside Library entries (fork to personal Toolbox)
  - On any Cookbook recipe step (save that recipe's individual Skill)

### 6.2 Use Anywhere

A Skill in the Toolbox can be:
- Opened in the Skill Builder (to edit)
- Opened in the Playground (to run)
- Copied as plain text (system prompt + user prompt rendered with current variable values, ready to paste into the learner's institutional AI tool)

### 6.3 Pillar Tagging

Every Skill carries a Pillar A/B/C tag, enforcing the curriculum framework as visual grammar (sage = A only, cobalt = B only, terra = C only — non-negotiable per CLAUDE.md).

---

## 7. Architecture

### 7.1 Stack alignment

Same as rest of project: Next.js 14 App Router · TypeScript strict · Tailwind · Supabase · Vercel.

### 7.2 New routes

| Route | Type | Notes |
|-------|------|-------|
| `/dashboard/toolbox` | SSR + CSR islands | Toolbox home: my skills, library shortcut, recent playground sessions |
| `/dashboard/toolbox/skills` | SSR | Personal skill library (CRUD list) |
| `/dashboard/toolbox/skills/new` | CSR | Skill Builder — create flow |
| `/dashboard/toolbox/skills/[id]` | CSR | Skill Builder — edit flow |
| `/dashboard/toolbox/library` | SSR | Read-only template library, with filters |
| `/dashboard/toolbox/library/[slug]` | SSR | Library entry detail + Fork button |
| `/dashboard/toolbox/playground` | CSR | Multi-provider sandbox |
| `/dashboard/toolbox/cookbook` | SSR | Recipe index |
| `/dashboard/toolbox/cookbook/[slug]` | SSR | Recipe detail |
| `/api/toolbox/skills` | API | CRUD for personal skills |
| `/api/toolbox/playground/run` | API | Provider-routed inference call with cost tracking |
| `/api/toolbox/save` | API | Universal "Save to Toolbox" capture endpoint |
| `/api/toolbox/usage` | API | Returns user's current daily/monthly cost meter |

### 7.3 New database tables (Supabase)

```sql
-- Personal skills owned by a user
toolbox_skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('library','course','user','forked')),
  source_ref text,
  title text not null,
  description text,
  system_prompt text not null,
  user_prompt_template text not null,
  variables jsonb not null default '[]',
  example jsonb,
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  teaching_annotations jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Read-only template library (originals)
toolbox_library_skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  -- same content fields as toolbox_skills, no owner_id
  title text not null,
  description text,
  system_prompt text not null,
  user_prompt_template text not null,
  variables jsonb not null default '[]',
  example jsonb,
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  teaching_annotations jsonb default '[]',
  complexity text check (complexity in ('beginner','intermediate','advanced')),
  course_source_ref text,  -- where in the course this skill was harvested from
  published boolean default false,
  created_at timestamptz default now()
);

-- Cookbook recipes
toolbox_recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  overview text not null,
  steps jsonb not null,           -- array of { skill_slug, narrative, notes }
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  published boolean default false,
  created_at timestamptz default now()
);

-- Playground usage tracking (cost-based quota)
toolbox_playground_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,         -- 'anthropic' | 'openai' | 'google'
  model text not null,
  input_tokens integer not null,
  output_tokens integer not null,
  cost_usd numeric(10,6) not null,
  created_at timestamptz default now()
);
create index idx_playground_usage_user_day on toolbox_playground_usage (user_id, created_at);

-- Optional: saved playground sessions
toolbox_playground_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  messages jsonb not null,        -- conversation transcript
  model text not null,
  saved_at timestamptz default now()
);
```

**RLS:** standard pattern from CLAUDE.md — wrap `auth.uid()` in `(select auth.uid())`, index policy columns. Library and Cookbook tables are world-readable for entitled users (gated at the API layer); skills/usage/sessions tables are owner-only.

### 7.4 Provider abstraction

A thin `lib/playground/providers/` module with one adapter per provider (Anthropic, OpenAI, Google), returning a normalized `{ output, usage: { input_tokens, output_tokens, cost_usd } }` shape. The `/api/toolbox/playground/run` endpoint dispatches to the adapter based on selected model.

### 7.5 Entitlement check (new)

A single `lib/entitlements.ts` exposing:

```typescript
async function hasToolboxAccess(userId: string): Promise<boolean>
async function getActiveEntitlements(userId: string): Promise<Entitlement[]>
```

Backed by an `entitlements` table (or derived from existing `course_enrollments` + Stripe customer state — to be settled in the implementation plan). Used as a gate in middleware for `/dashboard/toolbox/*` and at the top of every Toolbox API route.

---

## 8. Business Model

| Phase | Bundle | Price |
|-------|--------|-------|
| **Phase 1** (this spec) | Toolbox included with AiBI-P / AiBI-S / AiBI-L | $0 marginal |
| **Phase 2** (~6 mo post-launch) | Standalone subscription: Skill Builder + Library only | TBD ($19–$49/mo range) |
| **Phase 3** | Team/institution plans, Compare Mode, sharing, analytics | TBD |

---

## 9. Success Metrics

- **Engagement:** ≥ 70% of paid enrollees create at least 3 custom skills during their course
- **Retention:** ≥ 50% of enrollees log into the Toolbox at least once 30+ days after course completion
- **Save-to-Toolbox uptake:** ≥ 60% of enrollees use the Save to Toolbox button at least once during the course
- **Cost discipline:** average per-learner Playground spend stays under daily/monthly caps; <5% of learners hit hard cutoff
- **Phase 2 conversion:** ≥ 10% of completed-but-unsubscribed enrollees convert to standalone Toolbox subscription within 6 months of launch

---

## 10. Open Questions / TBD

These do not block the design — they are launch-time calibrations or Phase 2 decisions.

1. **Daily/monthly Playground cost caps** — placeholder $0.50/day, $10/month. Calibrate before launch with real usage data; configurable via env or admin setting.
2. **Phase 2 standalone subscription price** — defer.
3. **Compare Mode** — deferred to Phase 2.
4. **Free Class entitlement** — v1 says no Toolbox for free Classes. Revisit if Free Classes launch and adoption is poor.
5. **Entitlement table vs. derived entitlements** — implementation plan to settle whether we add a new `entitlements` table or derive access from `course_enrollments` + active Stripe state.
6. **PII detection library** — pick a specific library/regex set in implementation. Keep it conservative; better to false-positive a warning than miss real PII.

---

## 11. Implementation Phasing

Suggested build order for the implementation plan (writing-plans will refine this):

1. **Foundation:** entitlement check, gated `/dashboard/toolbox` shell, paywall page, navigation
2. **Skill schema + storage:** tables, RLS, CRUD API
3. **Skill Builder UI:** create/edit flow
4. **Library:** seed 25 harvested Skills, read-only browse + fork
5. **Playground v1:** Anthropic-only first (already have key), single-model
6. **Playground v2:** OpenAI + Google adapters, model picker
7. **Cost tracking + quota meter**
8. **PII detection + safety banner**
9. **Save to Toolbox** capture button: course-content integration
10. **Cookbook:** schema, seeding 5–8 recipes, browse + detail
11. **Polish, accessibility pass, mobile QA**

---

## 12. Decisions Locked During Brainstorming

For traceability and to prevent relitigation in future sessions:

| # | Decision | Choice |
|---|---|---|
| 1 | Skill schema | Option B: prompt + instructions bundle (system + user template + variables + example + annotations) |
| 2 | Cookbook surface | Separate surface, pedagogical authoring standard |
| 3 | IA placement | `/dashboard/toolbox`, paid-only, no public top-nav, deep-linked from courses |
| 4 | Library v1 sourcing | Harvested from course content + universal "Save to Toolbox" capture mechanic |
| 5 | Playground model strategy | Multi-provider picker, 6-model v1 menu (Anthropic + OpenAI + Google) |
| 6 | Quota model | Track in dollars of cost, not tokens (TBD calibration of caps) |
| 7 | Compare Mode | Deferred to Phase 2 |
| 8 | Worktree | New `feature/toolbox` branch in `~/Projects/aibi-toolbox` |
| 9 | Free Classes | Not entitled to Toolbox in v1 |
| 10 | "Save to Toolbox" | Named first-class feature; required everywhere prompts appear in course content |
