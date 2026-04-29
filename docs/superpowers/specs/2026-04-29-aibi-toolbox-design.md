# AiBI Toolbox — Design Spec v1

**Status:** Design v1.1 — incorporates user review feedback 2026-04-29; pending final approval before implementation planning
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

**A "Skill" comes in two kinds (amended 2026-04-29 — see decision #23):**

- **`workflow`** — a multi-turn skill where the AI is given a role, a clarifying-questions script, a step-by-step workflow, and an output spec. The user has a conversation with the skill in the Playground; the AI runs the workflow against the user's specific scenario. Best for analytical or compositional banking work: credit memo drafting, denial-letter authoring, complaint-response composition.
- **`template`** — a single-shot prompt template with named `{{variable}}` blanks. The user fills the variables, sends once, gets one output. Best for short repeatable patterns AND for teaching prompt structure (the variables are the lesson).

Both kinds are first-class throughout the Toolbox. Library entries, Save-to-Toolbox capture, and Cookbook recipe steps may reference either kind.

```typescript
interface SkillBase {
  id: string;
  owner_id: string;             // user who owns this skill (null for Library originals)
  kind: 'workflow' | 'template';
  source: 'library' | 'course' | 'user' | 'forked';
  source_ref?: string;          // e.g., "aibi-p/module-3/lesson-2" or parent skill id

  // Common metadata
  title: string;                // "Draft a loan denial letter (ECOA-compliant)"
  description: string;          // 1-2 sentences on when to use it
  pillar?: 'A' | 'B' | 'C';     // Accessible / Boundary-Safe / Capable
  category: string;             // 'Lending' | 'Operations' | 'Compliance' | 'Marketing' | 'Executive'
  compliance_notes?: string;    // "Aligned with ECOA/Reg B §1002.9"
  teaching_annotations?: TeachingAnnotation[]; // "Why this works" callouts shown in UI

  // Output formatting (applies to both kinds)
  output_format?: string;       // 'Markdown' | 'JSON' | etc.
  tone?: string;                // 'Professional' | 'Plain language' | etc.
  length?: string;              // 'Concise' | 'Detailed' | etc.

  // Provenance / lifecycle
  maturity?: 'draft' | 'pilot' | 'production';
  owner_label?: string;         // 'Role owner' (display string, not auth)
  version: string;              // '1.0'
  created_at: string;
  updated_at: string;
}

interface WorkflowSkill extends SkillBase {
  kind: 'workflow';
  // The workflow definition — AI generates its own system_prompt from these.
  purpose: string;              // What the skill produces
  questions: string;            // Newline-delimited clarifying questions to ask
  steps: string[];              // The workflow the AI should follow
  files?: string[];             // Required context files
  connectors?: string[];        // Required apps / data sources
  guardrails?: string[];        // "Never do X" rules
  custom_guard?: string;        // Free-text escalation triggers
  samples?: { title: string; prompt: string }[];  // Example scenarios
  // Optional override — if set, skips the generated system_prompt:
  system_prompt_override?: string;
}

interface TemplateSkill extends SkillBase {
  kind: 'template';
  system_prompt: string;        // 100-300 words establishing role, rules, constraints
  user_prompt_template: string; // with {{variable}} placeholders
  variables: Variable[];        // typed list of fillable blanks
  example?: { input: Record<string, string>; output: string };
}

type Skill = WorkflowSkill | TemplateSkill;

interface Variable {
  name: string;       // 'applicant_name'
  label: string;      // 'Applicant Name'
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  options?: string[]; // for type='select'
  placeholder?: string;
}

interface TeachingAnnotation {
  // Workflow anchors target the workflow fields; template anchors target the template fields.
  anchor:
    | 'purpose' | 'questions' | 'steps' | 'guardrails'    // workflow
    | 'system_prompt' | 'user_template' | 'variables' | 'example'; // template
  pattern: string;    // e.g., 'role-and-context', 'explicit-constraints', 'output-format-spec'
  explanation: string; // why this prompting pattern was used here
}
```

**System prompt generation (workflow kind):** the existing `buildToolboxSystemPrompt()` helper composes a system prompt from `purpose / questions / steps / guardrails / output_format / tone / length` (plus a regulatory-discipline boilerplate). For workflow skills, this generated prompt is what the Playground sends to the LLM. If `system_prompt_override` is set, it replaces the generated value entirely.

**Skill Builder UI:**

- **Kind picker** as the first step: "Workflow skill" or "Template with variables" — with one-line guidance on when to use each
- Step-by-step guided creation flow, branching by kind:
  - **Workflow:** title → purpose → clarifying questions → workflow steps → output spec → guardrails → samples → tags
  - **Template:** title → role/system prompt → user template → variables → example → tags
- Edit mode for existing Skills (kind is fixed after creation; switch requires re-author)
- "Test in Playground" button that pre-loads the Skill into the Playground
- "Fork from Library" entry point that pre-fills from a Library template

### 5.2 Skill/Prompt Template Library

**v1 sourcing (Locked):** 25 launch Skills harvested directly from existing course content (AiBI-P modules). The Library is a curated, polished subset of prompts already living in lessons.

**Library entries are read-only originals.** Learners "fork" them into their personal Toolbox, which creates an editable copy with a `source: 'library'` provenance pointer back to the original.

**Both Skill kinds are eligible for the Library** (per decision #23). A Library entry may be a `workflow` skill OR a `template` skill — the authoring standard below applies to both, with kind-specific anchor mapping for teaching annotations.

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

2. **Include teaching annotations** — "Why this works" callouts visible in the UI as expandable elements next to the relevant section. Anchor mapping by kind:
   - **Workflow skills:** annotate `purpose`, `questions`, `steps`, `guardrails`, and the output spec.
   - **Template skills:** annotate `system_prompt`, `user_template`, `variables`, and `example`.

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

**Safety rules (revised — PII detection is necessary but not sufficient):**

PII regex/NER detection misses obvious combos (first name + last name + ZIP is identifiable but trips no SSN regex). Detection alone, with a "send anyway" escape hatch, is not a real control — the disclaimer ends up doing all the work. v1 layered approach:

1. **Synthetic-only mode for the first N sessions (default: first 5).** New learners can only send prompts that reference one of a curated set of synthetic example datasets surfaced in a side panel ("Sample Loan Application — fictional," "Sample Customer Complaint — fictional"). This gates experimentation onto safe data while learners build habits. Toggle off available after N sessions or after the learner explicitly acknowledges the policy.
2. **Typed confirmation on first free-form send per session.** Once free-form mode is unlocked, the first send each session requires the learner to type the literal phrase **"no real customer data"** before the request fires. Friction is the point.
3. **Heuristic detection layer.** Regex/pattern checks for SSN-shape, account-number-shape, full address-shape on every send. On hit: blocking modal with "edit" or "send anyway." The "send anyway" path is **telemetered** — if it's clicked >X% of the time, the framing isn't working and we revisit the design.
4. **Server-side classifier (optional v1.1).** A lightweight second-pass classifier on the input. Track for v1.1 if heuristic miss rate is high in QA.
5. **Disclaimer banner** persists on the Playground at all times: *"This is a learning sandbox. Do not enter real customer data. Output is for educational purposes only."*
6. **Conversations are not used for training** — see §5.3a below for per-provider specifics.
7. Skills can be invoked directly in the Playground (drop-down: "Run with skill: ..." pre-loads system prompt and template).
8. Session-only by default; learner can save a transcript or refined prompt to their Toolbox as a Skill.

#### 5.3a Provider data-handling stance (audit-grade wording)

Per-provider terms drift over time and the wording on each provider's page changes. Lock the spec to a verifiable claim with a review cadence rather than a blanket "not used for training":

> **As of [date verified] for the specific API tier in use:** Anthropic API (paid) does not train on customer prompts/completions by default; OpenAI API (paid, post-March 2023 default) does not train on API inputs; Google Gemini API (paid tier) does not use prompts for training under current terms. Verified at: [provider URL] for each. **Reviewed quarterly** by the engineering owner; date and link to provider terms recorded in `docs/compliance/llm-data-handling.md`.

Surface a learner-facing version in the Playground UI ("Last verified: 2026-MM-DD · Details") that links to the compliance doc. This converts a vague claim into an audit trail.

**Quota model (Locked at concept; numbers TBD via instrumentation):**

- Track in **dollars of cost**, not tokens (because cost varies wildly by model — Sonnet is 15x GPT-4o-mini for output).
- Each enrolled learner gets a **daily AI budget** and **monthly ceiling**.
- **Placeholder defaults are illustrative only — the real numbers come from measured usage.** A 1K-input / 800-output Sonnet call is roughly $0.015; at $0.50/day a learner gets ~33 Sonnet calls and will likely hit the cap in a single comparison-style session. With six models on the picker and learners doing comparison-style experimentation, the placeholder is too low. **Calibration plan:** before broader QA, an internal tester runs a representative learner exercise (4–6 prompts) on each of the 6 models, logs total cost, and we set caps from that data — not from feel. Implementation MUST land cost tracking with the first provider call (see §11) so calibration data is captured during build, not added later.
- Playground UI shows a thin "$0.31 / $0.50 today" meter
- Friendly warning at 80% utilization
- Hard cutoff at 100% with reset at midnight (daily) or first of month (monthly)
- Per-model caps optional in v2 if comparison usage skews spend toward expensive models

**Per-request rate limiting (required, separate from cost cap):**

The dollar cap alone is not enough — a script holding a session token can drain the daily cap in seconds and burn real provider dollars. Use the `@upstash/ratelimit` pattern from CLAUDE.md (already imported elsewhere in the project):

- **Per-user:** 10 requests/minute, 200 requests/day to `/api/toolbox/playground/run`
- **Per-IP:** 20 requests/minute (catches shared-credential abuse)
- 429 with `Retry-After` header on cap hit; surfaced in Playground UI as "slow down" message, not error

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
-- Personal skills owned by a user.
--
-- The 00012 migration shipped with a narrower shape: id, user_id (= owner),
-- template_id, command, name, maturity, skill (jsonb blob). Plan B amends
-- via ALTER TABLE rather than DROP/CREATE — production has zero rows but the
-- table is referenced by 4 live API routes. Decision #23 introduces the kind
-- discriminator so workflow-style and template-style skills coexist as
-- variants of one Skill.
--
-- After Plan B amendments, the column set is:
toolbox_skills (
  -- Existing (00012)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade, -- = owner_id
  template_id text,
  command text not null,           -- '/credit-memo' (workflow trigger)
  name text not null,              -- title
  maturity text not null default 'draft' check (maturity in ('draft','pilot','production')),
  skill jsonb not null default '{}',  -- legacy blob; remaining workflow-specific fields live here
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Added by Plan B (decision #23)
  kind text not null default 'workflow' check (kind in ('workflow','template')),
  system_prompt text,                -- explicit override (template) or null (workflow auto-generates)
  user_prompt_template text,         -- template kind only
  variables jsonb default '[]',      -- template kind only
  pillar char(1) check (pillar in ('A','B','C')),
  teaching_annotations jsonb default '[]',
  source text default 'user' check (source in ('library','course','user','forked')),
  source_ref text,

  unique (user_id, command)
);

-- Indexes added in Plan B for entitlement-and-list queries:
create index idx_toolbox_skills_user_kind on toolbox_skills (user_id, kind);
create index idx_toolbox_skills_pillar on toolbox_skills (pillar) where pillar is not null;
create index idx_toolbox_skills_source on toolbox_skills (source);

-- Read-only template library (originals). Like personal skills, library entries
-- can be either kind. Same fields as the personal table; the per-row "kind"
-- discriminator drives validation and rendering.
toolbox_library_skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('workflow','template')),
  title text not null,
  description text,
  -- Workflow-kind fields (nullable; required only when kind='workflow')
  workflow_definition jsonb,         -- { purpose, questions, steps, files, connectors, guardrails, custom_guard, samples, output_format, tone, length }
  -- Template-kind fields (nullable; required only when kind='template')
  system_prompt text,
  user_prompt_template text,
  variables jsonb default '[]',
  example jsonb,
  -- Common
  pillar char(1) check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  teaching_annotations jsonb default '[]',
  complexity text check (complexity in ('beginner','intermediate','advanced')),
  course_source_ref text,
  published boolean default false,
  created_at timestamptz default now()
);

-- Library skill versions (immutable; recipes pin to a version)
toolbox_library_skill_versions (
  id uuid primary key default gen_random_uuid(),
  library_skill_id uuid not null references toolbox_library_skills(id) on delete cascade,
  version integer not null,
  -- snapshot of all content fields at time of publish
  content jsonb not null,
  published_at timestamptz default now(),
  unique (library_skill_id, version)
);
-- Library originals are versioned: editing publishes a new row here. The
-- toolbox_library_skills row tracks the "current" pointer; recipes pin a
-- specific version_id so narrative stays aligned with the prompt content.

-- Cookbook recipes (recipe steps pin to a Skill VERSION, not just a slug)
toolbox_recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  overview text not null,
  steps jsonb not null,           -- array of { skill_slug, skill_version_id, narrative, notes }
  pillar char(1) not null check (pillar in ('A','B','C')),
  category text not null,
  compliance_notes text,
  published boolean default false,
  created_at timestamptz default now()
);
-- Note: steps[].skill_version_id is REQUIRED (not nullable in the JSONB shape).
-- When a Library Skill is updated, existing recipes continue pointing at the
-- prior version. Recipe authors can opt-in to upgrade by editing the recipe.

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

**RLS (revised — defense in depth, not API-layer-only):**

API-layer gating alone fails defense-in-depth: a misconfigured client using the Supabase anon key would expose Library/Cookbook content. v1 RLS policy:

- `toolbox_skills`, `toolbox_playground_usage`, `toolbox_playground_sessions`: owner-only (`(select auth.uid()) = owner_id` or `user_id`).
- `toolbox_library_skills`, `toolbox_library_skill_versions`, `toolbox_recipes`: **read requires authenticated user AND active Toolbox entitlement at the row level.** Implemented either as:
  - (a) a SQL function `has_toolbox_access(user_id uuid) returns boolean` called from the policy, OR
  - (b) a JWT claim `toolbox_entitled = true` set at sign-in via Supabase auth hook, checked in the policy as `(auth.jwt() ->> 'toolbox_entitled')::boolean`
- All policies follow CLAUDE.md performance pattern: wrap `auth.uid()` in `(select auth.uid())`; index policy columns (`owner_id`, `user_id`).
- Implementation plan picks (a) vs (b); (b) is faster at read time, (a) is simpler to keep consistent with `lib/entitlements.ts`.

### 7.4 Provider abstraction

A thin `lib/playground/providers/` module with one adapter per provider (Anthropic, OpenAI, Google), returning a normalized `{ output, usage: { input_tokens, output_tokens, cost_usd } }` shape plus a streaming variant. The `/api/toolbox/playground/run` endpoint dispatches to the adapter based on selected model.

**Streaming responses (required for v1):** Sonnet/GPT-4o/Gemini Pro on multi-paragraph outputs takes 4–8 seconds. Without streaming the Playground feels broken. Use the Vercel AI SDK (`ai` package) `streamText`/`streamObject` affordances — it normalizes streaming across all three providers and is a small lift, not a heavy one. Cost is recorded on stream completion.

### 7.5 Entitlement check (Locked: real entitlements table from v1)

A single `lib/entitlements.ts` exposing:

```typescript
async function hasToolboxAccess(userId: string): Promise<boolean>
async function getActiveEntitlements(userId: string): Promise<Entitlement[]>
```

**Backed by a dedicated `entitlements` table from v1**, not derived ad-hoc from `course_enrollments`. Rationale: Phase 2 standalone Toolbox subscribers will not have a `course_enrollments` row, so derived entitlements would require a refactor as soon as Phase 2 ships. Building it now is cheaper than rebuilding in 6 months.

```sql
entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,                    -- 'aibi-p' | 'aibi-s' | 'aibi-l' | 'toolbox-only'
  source text not null,                     -- 'course_enrollment' | 'subscription' | 'manual'
  source_ref text,                          -- enrollment_id, stripe_subscription_id, admin_note
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now()
);
create index idx_entitlements_user_active on entitlements (user_id) where active = true;
```

A reconciliation job (or trigger on `course_enrollments` insert/update) writes a corresponding `entitlements` row. Used as a gate in middleware for `/dashboard/toolbox/*` and at the top of every Toolbox API route.

---

## 8. Business Model

| Phase | Bundle | Price |
|-------|--------|-------|
| **Phase 1** (this spec) | Toolbox included with AiBI-P / AiBI-S / AiBI-L | $0 marginal |
| **Phase 2** (~6 mo post-launch) | Standalone subscription: Skill Builder + Library only | TBD ($19–$49/mo range) |
| **Phase 3** | Team/institution plans, Compare Mode, sharing, analytics | TBD |

**Phase 2 caveat — author-and-export, not author-and-test:** standalone Phase 2 subscribers do not get Playground access in the v1 model of Phase 2. That means subscribers can build Skills but cannot test them inside the Toolbox; they must copy the rendered prompt out to their institutional AI tool to verify behavior. This is a real product gap and the marketing for Phase 2 must position the Toolbox accordingly: *"Author and export your prompts. Test them in the AI tool you already use."* If this gap kills conversion in early Phase 2, options are (a) add a small Playground budget for subscribers (~$2/month), or (b) move Playground access into a higher subscription tier. Track conversion data and revisit at Phase 2 launch.

---

## 9. Success Metrics

Targets:

- **Engagement:** ≥ 70% of paid enrollees create at least 3 custom skills during their course
- **Retention:** ≥ 50% of enrollees log into the Toolbox at least once 30+ days after course completion
- **Save-to-Toolbox uptake:** ≥ 60% of enrollees use the Save to Toolbox button at least once during the course
- **Cost discipline:** average per-learner Playground spend stays under daily/monthly caps; <5% of learners hit hard cutoff
- **Safety signal:** "send anyway after PII warning" rate <10% of warnings — higher means the framing isn't working and we revisit the design
- **Phase 2 conversion:** ≥ 10% of completed-but-unsubscribed enrollees convert to standalone Toolbox subscription within 6 months of launch

**Instrumentation (required, wired at the API layer not the client):**

Plausible custom events follow the deferred-call pattern from CLAUDE.md. Server-side events fire from API routes; client events fire from UI interactions where no API call is involved.

| Event | Layer | Props |
|---|---|---|
| `toolbox_paywall_shown` | client | `{ source: 'direct' | 'course-link' | 'dashboard' }` |
| `skill_created` | server (POST /api/toolbox/skills) | `{ source, pillar, category }` |
| `skill_forked_from_library` | server | `{ library_skill_slug, library_skill_version_id }` |
| `save_to_toolbox_clicked` | server (POST /api/toolbox/save) | `{ origin: 'course' | 'playground' | 'library' | 'cookbook', source_ref }` |
| `playground_run` | server | `{ provider, model, input_tokens, output_tokens, cost_usd, used_skill_id }` |
| `playground_pii_warning_shown` | server | `{ pattern_matched }` |
| `playground_pii_send_anyway` | server | `{ pattern_matched }` |
| `playground_quota_warning_80` | server | `{ scope: 'daily' | 'monthly' }` |
| `playground_quota_blocked` | server | `{ scope: 'daily' | 'monthly' }` |
| `library_skill_viewed` | client | `{ slug, version_id }` |
| `cookbook_recipe_viewed` | client | `{ slug }` |

---

## 10. Open Questions / TBD

These do not block the design — they are launch-time calibrations or Phase 2 decisions. Items resolved during user review have been moved to §12.

1. **Daily/monthly Playground cost caps** — placeholder $0.50/day, $10/month is illustrative only. Calibrate from real usage data captured during build (cost tracking lands with first provider call — see §11).
2. **Phase 2 standalone subscription price.**
3. **Phase 2 Playground access for subscribers** — see §8 caveat. Decide based on conversion data after Phase 2 launch.
4. **Compare Mode** — deferred to Phase 2.
5. **Free Class entitlement** — v1 says no Toolbox for free Classes. Revisit if Free Classes launch and adoption is poor.
6. **PII heuristic library** — pick a specific regex set + optional NER library in implementation. Keep conservative; better to false-positive than miss.
7. **Synthetic dataset count for first-N-sessions safety mode** — start at N=5 sessions; tune from telemetry.
8. **RLS implementation choice** — SQL function vs. JWT claim (see §7.3); implementation plan picks one.
9. **Session-count source for synthetic-only mode** — implementation plan picks: either `count(*) from toolbox_playground_sessions where user_id = ...`, or add a denormalized `playground_sessions_count` column to a profile/entitlement row. Latter is cheaper at read time; former has zero schema cost.
10. **Entitlements reconciliation method** — recommended: **trigger on `course_enrollments` insert/update** (no signup-to-Toolbox-access lag). A cron reconcile job is the fallback if trigger ergonomics are messy in Supabase, but the lag risk makes it the second choice.
11. **Content authoring capacity** — 70–85h estimate in §11 assumes a single dedicated author. Single author = ~2–3 weeks of focused work; if the work must share calendar with code review, instructional design, or other content production, plan multiplier accordingly. Confirm capacity with the named owner (§11 C1) before kickoff.

---

## 11. Implementation Phasing

Build order for the implementation plan (writing-plans will refine this). Two parallel tracks: Engineering and Content.

### Engineering track

1. **Foundation:** `entitlements` table + `lib/entitlements.ts`, gated `/dashboard/toolbox` shell, paywall page, navigation deep-link affordances.
2. **Skill schema + storage:** all toolbox tables (skills, library_skills, library_skill_versions, recipes, playground_usage, playground_sessions), RLS policies (defense-in-depth per §7.3), Skill CRUD API.
3. **Skill Builder UI:** create/edit flow.
4. **Library v1 (read path):** read-only browse + fork from seeded data; filters by department/pillar/complexity.
5. **Playground v1 — Anthropic, with cost tracking and rate limiting from day one.** Anthropic adapter, streaming responses (Vercel AI SDK), cost recorded on stream completion, `@upstash/ratelimit` per-user and per-IP, dollar-cap meter wired in. Cost data captured during this phase IS the calibration data for §10.1.
6. **PII safety layer:** synthetic-only mode, typed-confirmation gate, heuristic detection, telemetered "send anyway" path, persistent disclaimer banner.
7. **Save to Toolbox capture:** course-content integration, provenance backlinks. Universal capture button surfaces in course modules, Playground, Library, Cookbook.
8. **Playground v2 — multi-provider:** OpenAI + Google adapters, model picker, per-provider streaming, normalized cost.
9. **Cookbook:** browse + detail, version-pinned recipe steps.
10. **Provider data-handling page** (`docs/compliance/llm-data-handling.md`) + Playground UI link to it. Quarterly review reminder set.
11. **Polish, accessibility pass, mobile QA, instrumentation verification.**

### Content track (PARALLEL — must run alongside engineering, not after)

This is undercounted in any spec that lists "seed 25 Skills" as a single bullet. Each Library Skill at the §5.2 quality bar (≥4 best-practice patterns, teaching annotations, regulatory citation, prompt review) is realistically **1–2 hours of authoring**, plus review. Each Cookbook recipe is **3–5 hours**. Total content authoring load:

- 25 Library Skills × 1.5h avg = ~37 hours
- 5–8 Cookbook recipes × 4h avg = ~20–32 hours
- Prompt review pass (second human eye) = ~10–15 hours
- **Total: roughly 70–85 hours of content work**

**Without seeded content, the Toolbox launches empty and fails its core value promise.**

Content track owners and deliverables:

- **C1.** Confirm content authoring owner(s). Without a named owner this work does not happen on the engineering timeline.
- **C2.** Author 25 Library Skills (harvested from existing course content but RE-AUTHORED to the Skill schema with system_prompt / user_prompt_template / variables / teaching_annotations — this is not a copy-paste exercise).
- **C3.** Author 5–8 Cookbook recipes choreographing 3–4 Skills each.
- **C4.** Prompt-review pass on every Library and Cookbook entry before publish.
- **C5.** Provider data-handling stance verified and recorded in `docs/compliance/llm-data-handling.md` (cross-cuts with engineering step 10).

Content track must be 50%+ complete before engineering step 4 ships, otherwise the Library page is a stub.

---

## 12. Decisions Locked

### During brainstorming

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

### During v1.1 user review (this revision)

| # | Decision | Choice |
|---|---|---|
| 11 | Content authoring | Tracked as a parallel track in §11, not an engineering step. Owner must be named before kickoff. ~70–85 hours of work. |
| 12 | Cost cap calibration | Placeholder is illustrative only. Real numbers come from instrumented usage during build, not from feel. |
| 13 | RLS posture | Defense-in-depth: row-level entitlement check on Library/Cookbook tables, not API-layer-only. |
| 14 | PII control layering | Synthetic-only mode (first N sessions) + typed confirmation + heuristic detection + telemetered "send anyway" + persistent disclaimer. Detection alone is not a control. |
| 15 | Provider data-handling | Audit-grade wording in `docs/compliance/llm-data-handling.md`, reviewed quarterly, surfaced in Playground UI. |
| 16 | Phase 2 Playground gap | Phase 2 standalone subscription is author-and-export only (no Playground). Marketing must position accordingly. |
| 17 | Recipe → Skill version pinning | Library Skills are versioned (`toolbox_library_skill_versions`); recipes pin to a `version_id`, not a slug. |
| 18 | Rate limiting | `@upstash/ratelimit` per-user (10/min, 200/day) and per-IP (20/min) on `/api/toolbox/playground/run`, in addition to dollar cap. |
| 19 | Streaming responses | Required in v1 via Vercel AI SDK; cost recorded on stream completion. |
| 20 | Instrumentation | Server-side Plausible events for skill_created, save_to_toolbox_clicked, playground_run, PII warning/bypass, quota events; not client-only. |
| 21 | Entitlements model | Real `entitlements` table from v1 (not derived from `course_enrollments`); reconciliation job/trigger from enrollment events. |
| 22 | Phasing reorder | Cost tracking + rate limiting land WITH the first provider call, not after Playground v1/v2 ship. |

### Plan B amendment (2026-04-29 — pre-Plan-B reconciliation with existing code)

| # | Decision | Choice |
|---|---|---|
| 23 | Skill kind discriminator | Workflow-style and template-style skills coexist as variants of one Skill, distinguished by `kind: 'workflow' \| 'template'`. Both kinds are first-class throughout Library, Save-to-Toolbox, and Cookbook. The existing 23-field workflow schema (cmd/purpose/questions/steps/guardrails/samples) is preserved as the workflow variant; the template variant adds `system_prompt` + `user_prompt_template` + `variables` + `example`. Schema is amended via `ALTER TABLE` on the existing `toolbox_skills` (production has 0 rows; no data migration needed). See §5.1 for the unified schema and §7.3 for the DDL. |
