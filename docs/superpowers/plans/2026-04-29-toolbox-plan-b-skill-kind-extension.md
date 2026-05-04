# Plan B — Skill Kind Extension (workflow + template variants)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing `toolbox_skills` table and code surface to support two Skill kinds — `workflow` (existing rich workflow definition; AI generates system_prompt) and `template` (new fill-in-the-blank prompt with `{{variables}}` for short repeatable patterns and pedagogy). Both kinds become first-class throughout the API, the buildToolboxSystemPrompt helper, and the ToolboxApp Build tab.

**Architecture:** B-extend per decision #23. Schema amended via `ALTER TABLE` (production has 0 rows so no data care). `lib/toolbox/types.ts` becomes a discriminated union. `buildToolboxSystemPrompt` dispatches on `kind`. API validators check kind-specific required fields. UI gets a "kind picker" first step plus a new template-kind builder beside the existing workflow-kind builder.

**Tech Stack:** Next.js 14 App Router · TypeScript strict (discriminated unions) · Supabase Postgres · Vitest · existing `lib/ai-harness/` and `lib/toolbox/` (extended).

---

## Existing State Notes (read before starting)

This plan was written against `feature/toolbox @ 91684e3` (2026-04-29) — Plan A0's PR #5 commits plus the spec amendment for decision #23.

What exists and stays as the workflow-kind canonical surface:
- `supabase/migrations/00012_toolbox_skills.sql` — table created with `id, user_id, template_id, command, name, maturity, skill (jsonb), created_at, updated_at`. **Plan B amends via ALTER TABLE in 00017; does not DROP/CREATE.**
- `src/lib/toolbox/types.ts` — `ToolboxSkill`, `ToolboxSkillTemplate`, `ToolboxScenario`, `ToolboxMaturity`, `ToolboxMessage`. **Becomes a discriminated union; existing names preserved as the workflow variant.**
- `src/lib/toolbox/markdown.ts` — `generateToolboxMarkdown()` (markdown export), `buildToolboxSystemPrompt()` (composes system prompt from workflow fields). **Both modified to dispatch on kind.**
- `src/app/api/toolbox/skills/route.ts` — GET/POST CRUD with `validateSkill()`. **POST validator extended to accept `kind`.**
- `src/app/api/toolbox/skills/[skillId]/route.ts` — PATCH/DELETE. **PATCH validator extended.**
- `src/app/api/toolbox/run/route.ts` — Anthropic playground with PII scan, injection scan, rate limit. **Reads kind to pick system prompt source.**
- `src/app/dashboard/toolbox/ToolboxApp.tsx` — 588-line tabbed UI (`Start Here / Cookbook / Build / Playground / My Toolbox`). **Build tab gains a kind picker first step; new TemplateBuilder component renders for kind='template'.**
- `src/content/toolbox/templates.ts` — 15 file-based workflow templates. **Untouched in Plan B.** Plan C migrates them to a DB-backed Library.

Production state confirmed empty: 0 rows in `toolbox_skills`. Schema can change freely.

---

## File Structure

| Action | Path | Responsibility |
|---|---|---|
| Create | `supabase/migrations/00017_toolbox_skills_kind_extension.sql` | ALTER TABLE add 8 columns + 3 indexes |
| Modify | `src/lib/toolbox/types.ts` | Discriminated union: `ToolboxSkill = WorkflowSkill \| TemplateSkill`; type guards |
| Create | `src/lib/toolbox/types.test.ts` | Tests for `isWorkflowSkill`, `isTemplateSkill` type guards |
| Modify | `src/lib/toolbox/markdown.ts` | `buildToolboxSystemPrompt` dispatches by kind; `generateToolboxMarkdown` ditto |
| Create | `src/lib/toolbox/markdown.test.ts` | Tests for dispatch behavior on both kinds |
| Modify | `src/app/api/toolbox/skills/route.ts` | `validateSkill` accepts kind; per-kind required-field checks; persist new columns |
| Modify | `src/app/api/toolbox/skills/[skillId]/route.ts` | PATCH validator + persistence |
| Modify | `src/app/api/toolbox/run/route.ts` | No code change for workflow path; the system prompt resolver is updated upstream in markdown.ts. Verified by smoke. |
| Create | `src/app/dashboard/toolbox/_components/KindPicker.tsx` | First-step picker in Build flow |
| Create | `src/app/dashboard/toolbox/_components/TemplateBuilder.tsx` | Editor for `kind='template'` skills |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` | Build tab integrates KindPicker; routes to TemplateBuilder when template kind chosen |

---

## Task 1: Verify dev environment

**Files:** none

- [ ] **Step 1: Worktree, branch, baseline tests, tsc**

```bash
cd ~/Projects/aibi-toolbox
git status
git log --oneline -3
npx tsc --noEmit
npx vitest run 2>&1 | tail -5
```

Expected: branch `feature/toolbox`, latest commit `91684e3` or later, working tree clean, tsc zero errors, 49/49 tests passing.

No commit.

---

## Task 2: Migration 00017 — add kind discriminator columns

**Files:**
- Create: `supabase/migrations/00017_toolbox_skills_kind_extension.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 00017_toolbox_skills_kind_extension.sql
-- Plan B (decision #23): make toolbox_skills support two kinds.
--
-- - 'workflow' (existing): rich workflow definition; system prompt is generated
--   from purpose/questions/steps/guardrails by buildToolboxSystemPrompt().
-- - 'template' (new): fill-in-the-blank prompt with {{variables}}; system_prompt
--   is stored explicitly.
--
-- Production has 0 rows in toolbox_skills (verified 2026-04-29) so this is a
-- pure ALTER without data migration.

ALTER TABLE toolbox_skills
  ADD COLUMN kind text NOT NULL DEFAULT 'workflow'
    CHECK (kind IN ('workflow', 'template')),
  ADD COLUMN system_prompt text,
  ADD COLUMN user_prompt_template text,
  ADD COLUMN variables jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN pillar char(1) CHECK (pillar IN ('A', 'B', 'C')),
  ADD COLUMN teaching_annotations jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN source text DEFAULT 'user'
    CHECK (source IN ('library', 'course', 'user', 'forked')),
  ADD COLUMN source_ref text;

-- Per-kind invariants enforced at the row level. Workflow rows MAY also set
-- system_prompt (override); template rows MUST have system_prompt + template.
ALTER TABLE toolbox_skills
  ADD CONSTRAINT toolbox_skills_template_kind_required CHECK (
    kind = 'workflow'
    OR (
      kind = 'template'
      AND system_prompt IS NOT NULL
      AND user_prompt_template IS NOT NULL
    )
  );

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_user_kind
  ON toolbox_skills (user_id, kind);

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_pillar
  ON toolbox_skills (pillar) WHERE pillar IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_toolbox_skills_source
  ON toolbox_skills (source);
```

- [ ] **Step 2: Apply via supabase db query --linked**

⚠️ CONFIRM WITH USER BEFORE applying. Then from the linked main worktree:

```bash
cd ~/Projects/TheAiBankingInstitute
cp ~/Projects/aibi-toolbox/supabase/migrations/00017_toolbox_skills_kind_extension.sql supabase/migrations/
supabase db query --linked -f supabase/migrations/00017_toolbox_skills_kind_extension.sql
rm supabase/migrations/00017_toolbox_skills_kind_extension.sql
```

(The copy-then-delete dance is required because the linked worktree's Supabase project ref is in the main project; the feature worktree isn't linked.)

- [ ] **Step 3: Verify columns and constraints**

```bash
cd ~/Projects/TheAiBankingInstitute && supabase db query --linked "
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'toolbox_skills'
  AND column_name IN ('kind','system_prompt','user_prompt_template','variables','pillar','teaching_annotations','source','source_ref')
ORDER BY column_name;"
```

Expected: 8 rows.

```bash
supabase db query --linked "
SELECT conname FROM pg_constraint
WHERE conrelid = 'toolbox_skills'::regclass
  AND conname = 'toolbox_skills_template_kind_required';"
```

Expected: 1 row.

- [ ] **Step 4: Commit**

```bash
cd ~/Projects/aibi-toolbox
git add supabase/migrations/00017_toolbox_skills_kind_extension.sql
git commit -m "feat(toolbox): add kind discriminator + template fields to toolbox_skills

Per decision #23: workflow-style and template-style skills coexist as
variants of one Skill. ALTER TABLE adds 8 columns (kind, system_prompt,
user_prompt_template, variables, pillar, teaching_annotations, source,
source_ref) plus a CHECK constraint enforcing template-kind required
fields. Production has 0 rows so no data migration needed."
```

---

## Task 3: Discriminated-union types in lib/toolbox/types.ts

**Files:**
- Modify: `src/lib/toolbox/types.ts`

- [ ] **Step 1: Replace types.ts with the unified union**

```typescript
// src/lib/toolbox/types.ts
//
// Plan B (decision #23): a Skill is either a 'workflow' kind (rich
// workflow definition; system prompt is generated) or a 'template' kind
// (fill-in-the-blank with {{variables}}; system prompt is stored).

export type ToolboxMaturity = 'draft' | 'pilot' | 'production';
export type ToolboxKind = 'workflow' | 'template';
export type ToolboxSource = 'library' | 'course' | 'user' | 'forked';
export type ToolboxPillar = 'A' | 'B' | 'C';

export interface ToolboxScenario {
  readonly title: string;
  readonly prompt: string;
}

export interface ToolboxVariable {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'select' | 'number';
  readonly required: boolean;
  readonly options?: readonly string[];
  readonly placeholder?: string;
}

export interface ToolboxTeachingAnnotation {
  readonly anchor:
    | 'purpose' | 'questions' | 'steps' | 'guardrails' | 'output'
    | 'system_prompt' | 'user_template' | 'variables' | 'example';
  readonly pattern: string;
  readonly explanation: string;
}

interface ToolboxSkillCommon {
  readonly id: string;
  readonly templateId?: string;
  readonly cmd: string;            // '/credit-memo' (also functions as unique key per user)
  readonly name: string;
  readonly dept: string;
  readonly deptFull: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly timeSaved: string;
  readonly cadence: string;
  readonly desc: string;
  readonly owner: string;
  readonly maturity: ToolboxMaturity;
  readonly version: string;
  readonly created?: string;
  readonly modified?: string;

  readonly pillar?: ToolboxPillar;
  readonly source?: ToolboxSource;
  readonly sourceRef?: string;
  readonly teachingAnnotations?: readonly ToolboxTeachingAnnotation[];
}

export interface ToolboxWorkflowSkill extends ToolboxSkillCommon {
  readonly kind: 'workflow';
  readonly purpose: string;
  readonly success: string;
  readonly files: readonly string[];
  readonly connectors: readonly string[];
  readonly questions: string;       // newline-delimited
  readonly steps: readonly string[];
  readonly output: string;
  readonly tone: string;
  readonly length: string;
  readonly guardrails: readonly string[];
  readonly customGuard: string;
  readonly samples: readonly ToolboxScenario[];
  // Optional override — if set, used verbatim instead of the generated prompt
  readonly systemPromptOverride?: string;
}

export interface ToolboxTemplateSkill extends ToolboxSkillCommon {
  readonly kind: 'template';
  readonly systemPrompt: string;            // 100-300 words
  readonly userPromptTemplate: string;      // contains {{variable}} placeholders
  readonly variables: readonly ToolboxVariable[];
  readonly example?: { readonly input: Readonly<Record<string, string>>; readonly output: string };
  // Output spec fields (template kind shares with workflow but optional)
  readonly output?: string;
  readonly tone?: string;
  readonly length?: string;
}

export type ToolboxSkill = ToolboxWorkflowSkill | ToolboxTemplateSkill;

// Templates are workflow-kind only in v1 (the file-based seed set is all
// workflow). Plan C will widen this to allow either kind in the DB-backed
// Library.
export type ToolboxSkillTemplate = Omit<
  ToolboxWorkflowSkill,
  'id' | 'created' | 'modified' | 'templateId'
>;

export interface ToolboxMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

// Type guards
export function isWorkflowSkill(skill: ToolboxSkill): skill is ToolboxWorkflowSkill {
  return skill.kind === 'workflow';
}

export function isTemplateSkill(skill: ToolboxSkill): skill is ToolboxTemplateSkill {
  return skill.kind === 'template';
}
```

- [ ] **Step 2: Type-check**

Expect existing call sites to fail until updated:

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit 2>&1 | head -50
```

Expected: errors in `markdown.ts`, `ToolboxApp.tsx`, `api/toolbox/*` referencing fields like `purpose`, `steps`, etc. without narrowing — these are addressed in Tasks 4–8.

- [ ] **Step 3: Commit**

```bash
git add src/lib/toolbox/types.ts
git commit -m "feat(toolbox): discriminated-union Skill type with kind field

ToolboxSkill = ToolboxWorkflowSkill | ToolboxTemplateSkill. The
existing 23 workflow fields move under kind='workflow'; new template
fields (systemPrompt, userPromptTemplate, variables, example) live
under kind='template'. Adds isWorkflowSkill / isTemplateSkill type
guards. ToolboxSkillTemplate type narrowed to workflow-only for v1.

Call sites that read workflow-only fields will now fail tsc until
updated in subsequent Plan B tasks (markdown.ts, API routes,
ToolboxApp.tsx)."
```

---

## Task 4: Failing test for buildToolboxSystemPrompt dispatch

**Files:**
- Create: `src/lib/toolbox/markdown.test.ts`

- [ ] **Step 1: Write the test**

```typescript
// src/lib/toolbox/markdown.test.ts
import { describe, it, expect } from 'vitest';
import { buildToolboxSystemPrompt } from './markdown';
import type { ToolboxWorkflowSkill, ToolboxTemplateSkill } from './types';

const baseCommon = {
  id: 'sk_1',
  cmd: '/test',
  name: 'Test Skill',
  dept: 'Compliance',
  deptFull: 'Compliance & BSA/AML',
  difficulty: 'beginner' as const,
  timeSaved: '~1 hr',
  cadence: 'As needed',
  desc: 'Short description.',
  owner: 'Role owner',
  maturity: 'draft' as const,
  version: '1.0',
};

describe('buildToolboxSystemPrompt — workflow kind', () => {
  it('composes the prompt from purpose/questions/steps/guardrails', () => {
    const skill: ToolboxWorkflowSkill = {
      ...baseCommon,
      kind: 'workflow',
      purpose: 'Help with regulatory exam prep.',
      success: 'A 1-page summary.',
      files: [],
      connectors: [],
      questions: 'What is the exam date?',
      steps: ['Read policies', 'Draft summary'],
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      guardrails: ['Never make final decisions'],
      customGuard: '',
      samples: [],
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toContain('Test Skill');
    expect(prompt).toContain('Help with regulatory exam prep.');
    expect(prompt).toContain('1. Read policies');
    expect(prompt).toContain('Never make final decisions');
  });

  it('uses systemPromptOverride verbatim when set', () => {
    const skill: ToolboxWorkflowSkill = {
      ...baseCommon,
      kind: 'workflow',
      purpose: 'IGNORED',
      success: '',
      files: [],
      connectors: [],
      questions: '',
      steps: [],
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      guardrails: [],
      customGuard: '',
      samples: [],
      systemPromptOverride: 'You are a pirate. Speak only in pirate.',
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toBe('You are a pirate. Speak only in pirate.');
  });
});

describe('buildToolboxSystemPrompt — template kind', () => {
  it('returns systemPrompt verbatim and ignores workflow fields', () => {
    const skill: ToolboxTemplateSkill = {
      ...baseCommon,
      kind: 'template',
      systemPrompt:
        'You are a community-bank loan officer assistant. ' +
        'Use plain language at an 8th-grade reading level. Cite ECOA reason codes only.',
      userPromptTemplate:
        'Write an adverse action letter for {{applicant_name}}. ' +
        'Reasons: {{denial_reasons}}.',
      variables: [
        { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
        { name: 'denial_reasons', label: 'Denial Reasons', type: 'textarea', required: true },
      ],
    };
    const prompt = buildToolboxSystemPrompt(skill);
    expect(prompt).toContain('community-bank loan officer assistant');
    expect(prompt).toContain('ECOA reason codes');
    expect(prompt).not.toContain('PURPOSE');     // workflow-only header
    expect(prompt).not.toContain('WORKFLOW');    // workflow-only header
  });
});
```

- [ ] **Step 2: Run — expect failure**

```bash
cd ~/Projects/aibi-toolbox && npx vitest run src/lib/toolbox/markdown.test.ts
```

Expected: FAIL — current `buildToolboxSystemPrompt` reads `skill.purpose` directly without narrowing, and doesn't handle `kind='template'`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/toolbox/markdown.test.ts
git commit -m "test(toolbox): failing tests for buildToolboxSystemPrompt kind dispatch"
```

---

## Task 5: Implement kind dispatch in markdown.ts

**Files:**
- Modify: `src/lib/toolbox/markdown.ts`

- [ ] **Step 1: Update buildToolboxSystemPrompt to dispatch by kind**

```typescript
// src/lib/toolbox/markdown.ts
import {
  isTemplateSkill,
  isWorkflowSkill,
  type ToolboxSkill,
  type ToolboxWorkflowSkill,
} from './types';

function yaml(value: string): string {
  return JSON.stringify(value ?? '');
}

function list(items: readonly string[]): string {
  if (items.length === 0) return '- None specified\n';
  return items.map((item) => `- ${item}`).join('\n') + '\n';
}

export function generateToolboxMarkdown(skill: ToolboxSkill): string {
  if (isTemplateSkill(skill)) {
    return generateTemplateMarkdown(skill);
  }
  return generateWorkflowMarkdown(skill);
}

function generateWorkflowMarkdown(skill: ToolboxWorkflowSkill): string {
  const today = new Date().toISOString().split('T')[0];

  let md = '---\n';
  md += `name: ${yaml(skill.cmd.replace(/^\//, ''))}\n`;
  md += `command: ${yaml(skill.cmd)}\n`;
  md += `kind: workflow\n`;
  md += `title: ${yaml(skill.name)}\n`;
  md += `description: ${yaml(skill.desc || skill.purpose)}\n`;
  md += `version: ${yaml(skill.version || '1.0')}\n`;
  md += `owner: ${yaml(skill.owner || 'Unassigned')}\n`;
  md += `maturity: ${yaml(skill.maturity || 'draft')}\n`;
  md += `department: ${yaml(skill.deptFull || skill.dept || 'General')}\n`;
  md += `cadence: ${yaml(skill.cadence || 'As needed')}\n`;
  md += `created: ${yaml(skill.created || today)}\n`;
  md += '---\n\n';

  md += `# ${skill.name}\n\n`;
  md += `> Trigger this skill by typing \`${skill.cmd}\` in any compatible Claude interface.\n\n`;
  md += '## Purpose\n\n';
  md += `${skill.purpose || skill.desc}\n\n`;
  md += '## Definition of Done\n\n';
  md += `${skill.success || 'A reviewed, reusable institutional output.'}\n\n`;
  md += '## Required Context\n\n';
  md += '### Files and folders\n\n';
  md += list(skill.files ?? []);
  md += '\n### Connected apps\n\n';
  md += list(skill.connectors ?? []);
  md += '\n## Before Starting - Required Questions\n\n';
  const questions = (skill.questions || '')
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);
  md += questions.length
    ? questions.map((question, idx) => `${idx + 1}. ${question}`).join('\n') + '\n\n'
    : '1. What context is missing before this work can begin?\n\n';
  md += '## Workflow\n\n';
  md += (skill.steps ?? []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')
    || '1. Complete the task using the provided context.';
  md += '\n\n';
  if (skill.customGuard) {
    md += '### Escalation Triggers\n\n';
    md += `${skill.customGuard}\n\n`;
  }
  md += '## Output\n\n';
  md += '| Field | Requirement |\n| --- | --- |\n';
  md += `| Format | ${skill.output || 'Markdown'} |\n`;
  md += `| Tone | ${skill.tone || 'Professional'} |\n`;
  md += `| Length | ${skill.length || 'Concise'} |\n\n`;
  md += '## Rules - Never Do These\n\n';
  md += list(skill.guardrails ?? []);
  if (skill.customGuard) {
    md += `\n- ${skill.customGuard}\n`;
  }
  md += '\n---\n\n';
  md += '*Generated via the AI Banking Institute Toolbox.*\n';

  return md;
}

function generateTemplateMarkdown(skill: ToolboxSkill): string {
  if (!isTemplateSkill(skill)) return '';
  const today = new Date().toISOString().split('T')[0];

  let md = '---\n';
  md += `name: ${yaml(skill.cmd.replace(/^\//, ''))}\n`;
  md += `command: ${yaml(skill.cmd)}\n`;
  md += `kind: template\n`;
  md += `title: ${yaml(skill.name)}\n`;
  md += `description: ${yaml(skill.desc)}\n`;
  md += `version: ${yaml(skill.version || '1.0')}\n`;
  md += `created: ${yaml(skill.created || today)}\n`;
  md += '---\n\n';

  md += `# ${skill.name}\n\n`;
  md += `${skill.desc}\n\n`;
  md += '## System Prompt\n\n';
  md += '```\n' + skill.systemPrompt + '\n```\n\n';
  md += '## User Prompt Template\n\n';
  md += '```\n' + skill.userPromptTemplate + '\n```\n\n';
  md += '## Variables\n\n';
  if (skill.variables.length === 0) {
    md += '- None\n\n';
  } else {
    md += '| Name | Label | Type | Required |\n| --- | --- | --- | --- |\n';
    for (const v of skill.variables) {
      md += `| \`${v.name}\` | ${v.label} | ${v.type} | ${v.required ? 'yes' : 'no'} |\n`;
    }
    md += '\n';
  }
  if (skill.example) {
    md += '## Example\n\n';
    md += '**Input:**\n\n```json\n' + JSON.stringify(skill.example.input, null, 2) + '\n```\n\n';
    md += '**Output:**\n\n```\n' + skill.example.output + '\n```\n\n';
  }
  md += '\n---\n\n';
  md += '*Generated via the AI Banking Institute Toolbox.*\n';
  return md;
}

export function buildToolboxSystemPrompt(skill: ToolboxSkill): string {
  if (isTemplateSkill(skill)) {
    return skill.systemPrompt;
  }
  if (skill.systemPromptOverride) {
    return skill.systemPromptOverride;
  }
  return composeWorkflowSystemPrompt(skill);
}

function composeWorkflowSystemPrompt(skill: ToolboxWorkflowSkill): string {
  if (!isWorkflowSkill(skill)) return '';
  const guardrails = [
    ...(skill.guardrails ?? []),
    ...(skill.customGuard ? [skill.customGuard] : []),
  ];

  return `You are an AI assistant for a U.S. community bank or credit union, executing a specific institutional skill.

SKILL: ${skill.name}
TRIGGER: ${skill.cmd}
DEPARTMENT: ${skill.deptFull || skill.dept || 'General'}

PURPOSE
${skill.purpose || skill.desc || ''}

CLARIFYING QUESTIONS
${skill.questions || ''}

WORKFLOW
${(skill.steps || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

OUTPUT SPECIFICATION
- Format: ${skill.output || 'Markdown'}
- Tone: ${skill.tone || 'Professional'}
- Length: ${skill.length || 'Concise'}

RULES
${guardrails.map((rule) => `- ${rule}`).join('\n')}

DEMO MODE
This is a learning playground inside the AI Banking Institute. Produce the useful deliverable the skill is designed to create. Ask clarifying questions only when the user's scenario does not provide enough information.

REGULATORY DISCIPLINE
Do not fabricate URLs, guidance letter numbers, bulletin IDs, court cases, contact details, examiner names, or specific regulatory subsection numbers. You may cite real top-level authorities such as 12 CFR 1002, 12 CFR 1005, Dodd-Frank Section 1031, OCC 2013-29, and the FFIEC IT Handbook. If a precise citation or source is not supplied, say it needs verification instead of inventing it.

SAFETY
Do not approve credit, legal, compliance, employment, or customer-impacting decisions. Frame recommendations as draft work for human review.`;
}
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/lib/toolbox/markdown.test.ts
```

Expected: 3 tests PASS.

- [ ] **Step 3: tsc**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors in API routes and ToolboxApp.tsx (Tasks 6–10 fix). NOT in markdown.ts.

- [ ] **Step 4: Commit**

```bash
git add src/lib/toolbox/markdown.ts
git commit -m "feat(toolbox): kind-aware system prompt + markdown export

buildToolboxSystemPrompt dispatches on skill.kind:
- template kind: returns systemPrompt verbatim
- workflow kind: composes from purpose/questions/steps/guardrails
  unless systemPromptOverride is set

generateToolboxMarkdown gains a template branch that emits a markdown
description focused on system_prompt + user_template + variables +
example."
```

---

## Task 6: Failing tests for /api/toolbox/skills POST validation

**Files:**
- Create: `src/app/api/toolbox/skills/validateSkill.test.ts`

This task TDDs an extracted validator. Step 1 extracts; step 2 writes failing tests; subsequent tasks make them pass.

- [ ] **Step 1: Extract `validateSkill` into a testable module**

Create `src/app/api/toolbox/skills/validateSkill.ts`:

```typescript
// src/app/api/toolbox/skills/validateSkill.ts
//
// Pure (no Next.js or Supabase deps) validator extracted from route.ts so it
// can be unit-tested. Both /api/toolbox/skills (POST) and
// /api/toolbox/skills/[skillId] (PATCH) call this.

import type {
  ToolboxSkill,
  ToolboxTemplateSkill,
  ToolboxVariable,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asVariableArray(value: unknown): ToolboxVariable[] {
  if (!Array.isArray(value)) return [];
  const out: ToolboxVariable[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) continue;
    const v = raw as Partial<ToolboxVariable>;
    if (typeof v.name !== 'string' || !v.name.trim()) continue;
    if (typeof v.label !== 'string' || !v.label.trim()) continue;
    const type = v.type;
    if (type !== 'text' && type !== 'textarea' && type !== 'select' && type !== 'number') continue;
    out.push({
      name: v.name.trim(),
      label: v.label.trim(),
      type,
      required: Boolean(v.required),
      options: Array.isArray(v.options) ? v.options.map(String) : undefined,
      placeholder: typeof v.placeholder === 'string' ? v.placeholder : undefined,
    });
  }
  return out;
}

function commonFields(skill: Record<string, unknown>): {
  cmd: string;
  name: string;
  desc: string;
} | null {
  if (typeof skill.cmd !== 'string' || !skill.cmd.startsWith('/')) return null;
  if (typeof skill.name !== 'string' || skill.name.trim().length < 2) return null;
  return {
    cmd: skill.cmd.trim(),
    name: skill.name.trim(),
    desc: typeof skill.desc === 'string' ? skill.desc : '',
  };
}

export function validateSkill(input: unknown): ToolboxSkill | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  const common = commonFields(raw);
  if (!common) return null;

  const kind = raw.kind === 'template' ? 'template' : 'workflow';

  const sharedMeta = {
    id: typeof raw.id === 'string' ? raw.id : '',
    templateId: typeof raw.templateId === 'string' ? raw.templateId : undefined,
    cmd: common.cmd,
    name: common.name,
    dept: typeof raw.dept === 'string' ? raw.dept : 'General',
    deptFull:
      typeof raw.deptFull === 'string'
        ? raw.deptFull
        : typeof raw.dept === 'string'
          ? raw.dept
          : 'General',
    difficulty:
      raw.difficulty === 'intermediate' || raw.difficulty === 'advanced'
        ? raw.difficulty
        : 'beginner',
    timeSaved: typeof raw.timeSaved === 'string' ? raw.timeSaved : 'Varies',
    cadence: typeof raw.cadence === 'string' ? raw.cadence : 'As needed',
    desc: common.desc,
    owner: typeof raw.owner === 'string' ? raw.owner : 'Unassigned',
    maturity:
      raw.maturity === 'pilot' || raw.maturity === 'production'
        ? raw.maturity
        : 'draft',
    version: typeof raw.version === 'string' ? raw.version : '1.0',
    pillar:
      raw.pillar === 'A' || raw.pillar === 'B' || raw.pillar === 'C'
        ? raw.pillar
        : undefined,
    source:
      raw.source === 'library' ||
      raw.source === 'course' ||
      raw.source === 'forked'
        ? raw.source
        : 'user',
    sourceRef: typeof raw.sourceRef === 'string' ? raw.sourceRef : undefined,
  } as const;

  if (kind === 'template') {
    if (typeof raw.systemPrompt !== 'string' || raw.systemPrompt.trim().length < 20) return null;
    if (typeof raw.userPromptTemplate !== 'string' || raw.userPromptTemplate.trim().length < 1) {
      return null;
    }
    const tpl: ToolboxTemplateSkill = {
      ...sharedMeta,
      kind: 'template',
      systemPrompt: raw.systemPrompt.trim(),
      userPromptTemplate: raw.userPromptTemplate.trim(),
      variables: asVariableArray(raw.variables),
      example:
        typeof raw.example === 'object' && raw.example !== null
          ? raw.example as ToolboxTemplateSkill['example']
          : undefined,
      output: typeof raw.output === 'string' ? raw.output : 'Markdown',
      tone: typeof raw.tone === 'string' ? raw.tone : 'Professional',
      length: typeof raw.length === 'string' ? raw.length : 'Concise',
    };
    return tpl;
  }

  // workflow kind
  if (typeof raw.purpose !== 'string' && typeof raw.desc !== 'string') return null;
  const wf: ToolboxWorkflowSkill = {
    ...sharedMeta,
    kind: 'workflow',
    purpose:
      typeof raw.purpose === 'string'
        ? raw.purpose
        : typeof raw.desc === 'string'
          ? raw.desc
          : '',
    success: typeof raw.success === 'string' ? raw.success : '',
    files: asStringArray(raw.files),
    connectors: asStringArray(raw.connectors),
    questions: typeof raw.questions === 'string' ? raw.questions : '',
    steps: asStringArray(raw.steps),
    output: typeof raw.output === 'string' ? raw.output : 'Markdown',
    tone: typeof raw.tone === 'string' ? raw.tone : 'Professional',
    length: typeof raw.length === 'string' ? raw.length : 'Concise',
    guardrails: asStringArray(raw.guardrails),
    customGuard: typeof raw.customGuard === 'string' ? raw.customGuard : '',
    samples: Array.isArray(raw.samples)
      ? raw.samples.filter(
          (s): s is { title: string; prompt: string } =>
            typeof s === 'object' &&
            s !== null &&
            typeof (s as { title?: unknown }).title === 'string' &&
            typeof (s as { prompt?: unknown }).prompt === 'string',
        )
      : [],
    systemPromptOverride:
      typeof raw.systemPromptOverride === 'string' ? raw.systemPromptOverride : undefined,
  };
  return wf;
}
```

- [ ] **Step 2: Write the test file**

Create `src/app/api/toolbox/skills/validateSkill.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { validateSkill } from './validateSkill';

describe('validateSkill — workflow kind (default)', () => {
  it('accepts a minimal workflow payload and defaults kind', () => {
    const result = validateSkill({
      cmd: '/credit-memo',
      name: 'Credit Memo Drafter',
      desc: 'Drafts a credit memo from a loan application.',
    });
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('workflow');
    expect(result!.cmd).toBe('/credit-memo');
  });

  it('rejects when cmd does not start with slash', () => {
    expect(validateSkill({ cmd: 'credit-memo', name: 'X', desc: 'Y' })).toBeNull();
  });

  it('rejects when name is too short', () => {
    expect(validateSkill({ cmd: '/x', name: 'A', desc: 'Y' })).toBeNull();
  });

  it('preserves arrays for files / connectors / steps / guardrails', () => {
    const result = validateSkill({
      cmd: '/x',
      name: 'Test Skill',
      desc: 'd',
      files: ['/policies/'],
      connectors: ['Google Drive'],
      steps: ['Step one', 'Step two'],
      guardrails: ['Never decide'],
    });
    expect(result).not.toBeNull();
    if (result!.kind !== 'workflow') throw new Error('expected workflow');
    expect(result!.files).toEqual(['/policies/']);
    expect(result!.connectors).toEqual(['Google Drive']);
    expect(result!.steps).toEqual(['Step one', 'Step two']);
    expect(result!.guardrails).toEqual(['Never decide']);
  });
});

describe('validateSkill — template kind', () => {
  const goodTemplate = {
    kind: 'template' as const,
    cmd: '/denial-letter',
    name: 'Denial Letter Drafter',
    desc: 'Drafts an ECOA-compliant adverse action letter.',
    systemPrompt:
      'You are a community-bank loan officer assistant. Use plain language at an 8th-grade level.',
    userPromptTemplate:
      'Write an adverse action letter for {{applicant_name}}. Reasons: {{denial_reasons}}.',
    variables: [
      { name: 'applicant_name', label: 'Applicant Name', type: 'text', required: true },
      { name: 'denial_reasons', label: 'Denial Reasons', type: 'textarea', required: true },
    ],
  };

  it('accepts a valid template payload', () => {
    const result = validateSkill(goodTemplate);
    expect(result).not.toBeNull();
    expect(result!.kind).toBe('template');
    if (result!.kind !== 'template') throw new Error('expected template');
    expect(result!.variables).toHaveLength(2);
    expect(result!.variables[0].name).toBe('applicant_name');
  });

  it('rejects when systemPrompt is missing', () => {
    const { systemPrompt: _omit, ...rest } = goodTemplate;
    expect(validateSkill(rest)).toBeNull();
  });

  it('rejects when userPromptTemplate is missing', () => {
    const { userPromptTemplate: _omit, ...rest } = goodTemplate;
    expect(validateSkill(rest)).toBeNull();
  });

  it('rejects when systemPrompt is too short (<20 chars)', () => {
    expect(validateSkill({ ...goodTemplate, systemPrompt: 'short' })).toBeNull();
  });

  it('drops invalid variables silently', () => {
    const result = validateSkill({
      ...goodTemplate,
      variables: [
        { name: 'ok', label: 'OK', type: 'text', required: false },
        { name: '', label: 'Bad — empty name', type: 'text', required: false },
        { name: 'bad_type', label: 'Bad type', type: 'image', required: false },
      ],
    });
    expect(result).not.toBeNull();
    if (result!.kind !== 'template') throw new Error('expected template');
    expect(result!.variables).toHaveLength(1);
    expect(result!.variables[0].name).toBe('ok');
  });
});
```

- [ ] **Step 3: Run — expect failures because route.ts hasn't been refactored to consume the new module yet, but the new module's tests should PASS now**

```bash
npx vitest run src/app/api/toolbox/skills/validateSkill.test.ts
```

Expected: all 9 tests PASS (we wrote validateSkill.ts implementation in Step 1; tests are red→green within this task because the module is new).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/toolbox/skills/validateSkill.ts src/app/api/toolbox/skills/validateSkill.test.ts
git commit -m "feat(toolbox): extract validateSkill with kind-aware validation

Pulls validateSkill out of /api/toolbox/skills/route.ts into a pure
testable module. Adds kind handling: template requires systemPrompt
(min 20 chars) and userPromptTemplate; workflow keeps existing
purpose-or-desc check. Both kinds populate the new metadata fields
(pillar, source, sourceRef). 9 unit tests."
```

---

## Task 7: Update /api/toolbox/skills/route.ts to use validateSkill + persist new columns

**Files:**
- Modify: `src/app/api/toolbox/skills/route.ts`

- [ ] **Step 1: Replace the inline `validateSkill` and the upsert payload**

```typescript
// src/app/api/toolbox/skills/route.ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';
import { validateSkill } from './validateSkill';

interface ToolboxSkillRow {
  readonly id: string;
  readonly skill: ToolboxSkill;
  readonly created_at: string;
  readonly updated_at: string;
}

function normalizeSkill(row: ToolboxSkillRow): ToolboxSkill {
  return {
    ...row.skill,
    id: row.id,
    created: row.skill.created ?? row.created_at,
    modified: row.updated_at,
  } as ToolboxSkill;
}

export async function GET(): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ skills: [] });

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .select('id, skill, created_at, updated_at')
    .eq('user_id', access.userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load Toolbox skills.' }, { status: 500 });
  }

  return NextResponse.json({
    skills: ((data ?? []) as ToolboxSkillRow[]).map(normalizeSkill),
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Server-side Toolbox storage is not configured.' }, { status: 503 });
  }

  let body: { skill?: unknown };
  try {
    body = (await request.json()) as { skill?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const skill = validateSkill(body.skill);
  if (!skill) return NextResponse.json({ error: 'Invalid skill payload.' }, { status: 400 });

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .upsert(
      {
        user_id: access.userId,
        template_id: skill.templateId ?? null,
        command: skill.cmd,
        name: skill.name,
        maturity: skill.maturity,
        // Preserve full skill blob in the JSONB column for back-compat with
        // existing reads (normalizeSkill reads from row.skill).
        skill,
        // New explicit columns (Plan B / decision #23):
        kind: skill.kind,
        system_prompt:
          skill.kind === 'template'
            ? skill.systemPrompt
            : skill.kind === 'workflow' && skill.systemPromptOverride
              ? skill.systemPromptOverride
              : null,
        user_prompt_template:
          skill.kind === 'template' ? skill.userPromptTemplate : null,
        variables: skill.kind === 'template' ? skill.variables : [],
        pillar: skill.pillar ?? null,
        teaching_annotations: skill.teachingAnnotations ?? [],
        source: skill.source ?? 'user',
        source_ref: skill.sourceRef ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,command' },
    )
    .select('id, skill, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not save Toolbox skill.' }, { status: 500 });
  }

  return NextResponse.json({ skill: normalizeSkill(data as ToolboxSkillRow) }, { status: 201 });
}
```

- [ ] **Step 2: tsc**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: this file is now clean. Errors remain in `[skillId]/route.ts`, `run/route.ts`, and `ToolboxApp.tsx` — addressed in subsequent tasks.

- [ ] **Step 3: Run tests**

```bash
npx vitest run 2>&1 | tail -5
```

Expected: still 49 + 12 (3 markdown + 9 validateSkill) = 61+ tests passing; 0 failing.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/toolbox/skills/route.ts
git commit -m "feat(toolbox): persist kind + template fields on POST /skills

GET path unchanged. POST upserts the new columns (kind, system_prompt,
user_prompt_template, variables, pillar, teaching_annotations, source,
source_ref) alongside the existing JSONB blob. The blob is preserved
for back-compat with the existing GET path's normalizeSkill reader."
```

---

## Task 8: Update [skillId]/route.ts PATCH to use validateSkill

**Files:**
- Modify: `src/app/api/toolbox/skills/[skillId]/route.ts`

- [ ] **Step 1: Replace inline validation with the shared validator and persist new columns**

```typescript
// src/app/api/toolbox/skills/[skillId]/route.ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import type { ToolboxSkill } from '@/lib/toolbox/types';
import { validateSkill } from '../validateSkill';

interface RouteParams {
  readonly params: { readonly skillId: string };
}

function validId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Toolbox storage is not configured.' }, { status: 503 });
  if (!validId(params.skillId)) return NextResponse.json({ error: 'Invalid skill id.' }, { status: 400 });

  let body: { skill?: unknown };
  try {
    body = (await request.json()) as { skill?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validated = validateSkill(body.skill);
  if (!validated) return NextResponse.json({ error: 'Invalid skill payload.' }, { status: 400 });

  const skill: ToolboxSkill = { ...validated, id: params.skillId } as ToolboxSkill;

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .update({
      template_id: skill.templateId ?? null,
      command: skill.cmd,
      name: skill.name,
      maturity: skill.maturity,
      skill,
      kind: skill.kind,
      system_prompt:
        skill.kind === 'template'
          ? skill.systemPrompt
          : skill.kind === 'workflow' && skill.systemPromptOverride
            ? skill.systemPromptOverride
            : null,
      user_prompt_template:
        skill.kind === 'template' ? skill.userPromptTemplate : null,
      variables: skill.kind === 'template' ? skill.variables : [],
      pillar: skill.pillar ?? null,
      teaching_annotations: skill.teachingAnnotations ?? [],
      source: skill.source ?? 'user',
      source_ref: skill.sourceRef ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.skillId)
    .eq('user_id', access.userId)
    .select('id, skill, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not update Toolbox skill.' }, { status: 500 });
  }

  return NextResponse.json({
    skill: {
      ...(data.skill as ToolboxSkill),
      id: data.id,
      created: (data.skill as ToolboxSkill).created ?? data.created_at,
      modified: data.updated_at,
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteParams): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Toolbox storage is not configured.' }, { status: 503 });
  if (!validId(params.skillId)) return NextResponse.json({ error: 'Invalid skill id.' }, { status: 400 });

  const client = createServiceRoleClient();
  const { error } = await client
    .from('toolbox_skills')
    .delete()
    .eq('id', params.skillId)
    .eq('user_id', access.userId);

  if (error) return NextResponse.json({ error: 'Could not delete Toolbox skill.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: tsc + tests**

```bash
npx tsc --noEmit 2>&1 | head -10 && npx vitest run 2>&1 | tail -3
```

Expected: this file clean; ToolboxApp.tsx still has narrowing errors (Tasks 10–11 fix); tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/toolbox/skills/[skillId]/route.ts
git commit -m "feat(toolbox): kind-aware PATCH on /skills/[skillId]

Uses the shared validateSkill module; persists the same new columns
as POST. DELETE path unchanged."
```

---

## Task 9: Verify /api/toolbox/run still works after dispatch change

**Files:** none (no code changes — the change in Task 5 to `buildToolboxSystemPrompt` already covers run/route.ts since it imports the helper)

- [ ] **Step 1: Confirm run/route.ts compiles cleanly**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit src/app/api/toolbox/run/route.ts 2>&1 | head -20
```

Expected: zero errors. If errors appear, the issue is one of:
- The route's `isSkill` type guard rejects non-workflow skills (since the original guard checks for `cmd` and `name` which both kinds have, this should work)
- The `body.skill` path passes a non-narrowed skill into `buildToolboxSystemPrompt` which now accepts `ToolboxSkill` (the union) — should work

If `isSkill` does need updating to be kind-aware, change:

```typescript
function isSkill(value: unknown): value is ToolboxSkill {
  return typeof value === 'object' &&
    value !== null &&
    typeof (value as ToolboxSkill).cmd === 'string' &&
    typeof (value as ToolboxSkill).name === 'string';
}
```

into:

```typescript
function isSkill(value: unknown): value is ToolboxSkill {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolboxSkill>;
  if (typeof v.cmd !== 'string' || typeof v.name !== 'string') return false;
  return v.kind === 'workflow' || v.kind === 'template' || v.kind === undefined;
}
```

(The `undefined` branch lets old client payloads without an explicit kind through; defaults to workflow at the validator. But /api/toolbox/run doesn't go through validateSkill — it consumes the skill payload directly. Treat this as the only acceptable place to back-default: workflow is the existing behavior.)

- [ ] **Step 2: Commit only if you changed isSkill**

```bash
git add src/app/api/toolbox/run/route.ts
git commit -m "fix(toolbox): kind-aware isSkill guard in /run

Accepts kind='workflow', kind='template', or absent (legacy).
Pairs with kind dispatch in buildToolboxSystemPrompt."
```

If no change needed, skip this task's commit.

---

## Task 10: KindPicker component

**Files:**
- Create: `src/app/dashboard/toolbox/_components/KindPicker.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/app/dashboard/toolbox/_components/KindPicker.tsx
'use client';

import type { ToolboxKind } from '@/lib/toolbox/types';

interface KindPickerProps {
  readonly value: ToolboxKind | null;
  readonly onChange: (kind: ToolboxKind) => void;
}

const OPTIONS: ReadonlyArray<{
  kind: ToolboxKind;
  title: string;
  blurb: string;
  example: string;
}> = [
  {
    kind: 'workflow',
    title: 'Workflow Skill',
    blurb:
      'A multi-step skill the AI runs against your scenario. You give it a role, clarifying questions, a workflow, and an output spec — then chat with it about your specific case.',
    example: 'Credit memo drafting · Denial letter authoring · Complaint response composition',
  },
  {
    kind: 'template',
    title: 'Template with Variables',
    blurb:
      'A single-shot prompt with named {{variable}} blanks. You fill the variables, send once, get one output. Best for short repeatable patterns and for teaching prompt structure.',
    example: 'Adverse-action snippet · Loan-summary one-pager · Compliance disclosure draft',
  },
];

export function KindPicker({ value, onChange }: KindPickerProps) {
  return (
    <div>
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        Choose a kind
      </p>
      <h2 className="mt-2 font-serif text-2xl text-[color:var(--color-ink)]">
        What kind of skill are you building?
      </h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.kind;
          return (
            <li key={opt.kind}>
              <button
                type="button"
                onClick={() => onChange(opt.kind)}
                aria-pressed={selected}
                className={`w-full text-left rounded-[3px] border p-5 transition-colors ${
                  selected
                    ? 'border-[color:var(--color-terra)] bg-[color:var(--color-parch)]'
                    : 'border-[color:var(--color-ink)]/15 hover:border-[color:var(--color-terra)]'
                }`}
              >
                <h3 className="font-serif text-xl text-[color:var(--color-ink)]">
                  {opt.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink)]/75">
                  {opt.blurb}
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-slate)]">
                  Examples: {opt.example}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: this file clean.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/toolbox/_components/KindPicker.tsx
git commit -m "feat(toolbox): KindPicker component for Build flow

First-step picker; accessible (aria-pressed), terra-tinted on select,
shows 1-2 banking examples per kind to help learners choose."
```

---

## Task 11: TemplateBuilder component

**Files:**
- Create: `src/app/dashboard/toolbox/_components/TemplateBuilder.tsx`

- [ ] **Step 1: Write the component**

```tsx
// src/app/dashboard/toolbox/_components/TemplateBuilder.tsx
'use client';

import { useMemo } from 'react';
import type { ToolboxTemplateSkill, ToolboxVariable } from '@/lib/toolbox/types';

interface TemplateBuilderProps {
  readonly skill: ToolboxTemplateSkill;
  readonly onChange: (next: ToolboxTemplateSkill) => void;
}

function renderPreview(template: string, vars: readonly ToolboxVariable[]): string {
  let out = template;
  for (const v of vars) {
    const placeholder = v.placeholder ?? `<${v.label}>`;
    out = out.replace(new RegExp(`{{\\s*${v.name}\\s*}}`, 'g'), placeholder);
  }
  return out;
}

export function TemplateBuilder({ skill, onChange }: TemplateBuilderProps) {
  const preview = useMemo(
    () => renderPreview(skill.userPromptTemplate, skill.variables),
    [skill.userPromptTemplate, skill.variables],
  );

  function update<K extends keyof ToolboxTemplateSkill>(
    key: K,
    value: ToolboxTemplateSkill[K],
  ) {
    onChange({ ...skill, [key]: value });
  }

  function setVariable(idx: number, next: Partial<ToolboxVariable>) {
    const variables = skill.variables.map((v, i) =>
      i === idx ? ({ ...v, ...next } as ToolboxVariable) : v,
    );
    update('variables', variables);
  }

  function addVariable() {
    update('variables', [
      ...skill.variables,
      { name: 'new_variable', label: 'New Variable', type: 'text', required: false } as ToolboxVariable,
    ]);
  }

  function removeVariable(idx: number) {
    update('variables', skill.variables.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-8">
      <Section label="Title" hint="A short, descriptive name learners will see in the Library.">
        <input
          type="text"
          value={skill.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-sans text-sm"
        />
      </Section>

      <Section
        label="Description"
        hint="When to use this template — one sentence."
      >
        <input
          type="text"
          value={skill.desc}
          onChange={(e) => update('desc', e.target.value)}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-sans text-sm"
        />
      </Section>

      <Section
        label="System Prompt"
        hint="The role, context, and rules. 100–300 words. This is where most of the teaching happens."
      >
        <textarea
          value={skill.systemPrompt}
          onChange={(e) => update('systemPrompt', e.target.value)}
          rows={8}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-xs"
        />
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-slate)]">
          {skill.systemPrompt.length} chars · min 20
        </p>
      </Section>

      <Section
        label="User Prompt Template"
        hint="The fill-in request. Use {{variable_name}} for blanks the learner will fill in."
      >
        <textarea
          value={skill.userPromptTemplate}
          onChange={(e) => update('userPromptTemplate', e.target.value)}
          rows={4}
          className="w-full rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-2 font-mono text-xs"
        />
      </Section>

      <Section
        label="Variables"
        hint="Each {{variable}} in the template above should be defined here so the Skill Builder can render the right input control."
      >
        <ul className="space-y-3">
          {skill.variables.map((v, i) => (
            <li
              key={i}
              className="grid gap-2 rounded-[2px] border border-[color:var(--color-ink)]/15 p-3 md:grid-cols-[1.5fr_1.5fr_1fr_auto_auto]"
            >
              <input
                aria-label="Variable name"
                value={v.name}
                onChange={(e) => setVariable(i, { name: e.target.value })}
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-mono text-xs"
                placeholder="snake_case_name"
              />
              <input
                aria-label="Variable label"
                value={v.label}
                onChange={(e) => setVariable(i, { label: e.target.value })}
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-sans text-xs"
                placeholder="Display label"
              />
              <select
                aria-label="Variable type"
                value={v.type}
                onChange={(e) =>
                  setVariable(i, { type: e.target.value as ToolboxVariable['type'] })
                }
                className="rounded-[2px] border border-[color:var(--color-ink)]/15 px-2 py-1 font-mono text-xs"
              >
                <option value="text">text</option>
                <option value="textarea">textarea</option>
                <option value="number">number</option>
                <option value="select">select</option>
              </select>
              <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                <input
                  type="checkbox"
                  checked={v.required}
                  onChange={(e) => setVariable(i, { required: e.target.checked })}
                />
                Req
              </label>
              <button
                type="button"
                onClick={() => removeVariable(i)}
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-error)]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addVariable}
          className="mt-3 inline-flex items-center rounded-[2px] border border-[color:var(--color-ink)]/20 px-3 py-1 font-sans text-[11px] uppercase tracking-[1.2px] text-[color:var(--color-ink)] hover:border-[color:var(--color-terra)]"
        >
          + Add variable
        </button>
      </Section>

      <Section
        label="Preview"
        hint="Variables substituted with their placeholder text or label. This is what the LLM will see when the learner runs the skill."
      >
        <pre className="whitespace-pre-wrap rounded-[2px] bg-[color:var(--color-parch)] p-3 font-mono text-xs">
          {preview}
        </pre>
      </Section>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  readonly label: string;
  readonly hint: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section>
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)]">
        {label}
      </p>
      <p className="mt-1 text-xs text-[color:var(--color-slate)]">{hint}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: tsc**

```bash
npx tsc --noEmit 2>&1 | head -10
```

Expected: this file clean. Errors remaining are in ToolboxApp.tsx (Task 12).

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/toolbox/_components/TemplateBuilder.tsx
git commit -m "feat(toolbox): TemplateBuilder component for kind='template'

Editable form for systemPrompt + userPromptTemplate + variables, with
a live preview that substitutes {{variable}} placeholders. No
network/state plumbing — Task 12 wires it into ToolboxApp Build tab."
```

---

## Task 12: Wire KindPicker + TemplateBuilder into ToolboxApp Build tab

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx`

The existing Build tab assumes workflow shape end-to-end. Plan B preserves that path; the kind picker chooses between it and the new TemplateBuilder.

- [ ] **Step 1: Read the Build tab section to find the integration point**

```bash
grep -n "Build\|EMPTY_SKILL\|toSkill\|currentTab === 'build'" src/app/dashboard/toolbox/ToolboxApp.tsx | head -10
```

Expected: locate where the Build tab's content is rendered. The 588-line file has tabbed rendering switching on `safeTab`. Find the `'build'` branch.

- [ ] **Step 2: Add kind state + branching render**

The exact patch depends on the Build tab's structure. The intent: at the top of the Build tab content, render `<KindPicker>` first if no kind is selected; once selected, render either the existing workflow editor or the new `<TemplateBuilder>`.

Pseudocode for the patch:

```tsx
// Imports at top of ToolboxApp.tsx
import { KindPicker } from './_components/KindPicker';
import { TemplateBuilder } from './_components/TemplateBuilder';
import type { ToolboxKind, ToolboxTemplateSkill } from '@/lib/toolbox/types';

// New state alongside existing skill state:
const [kind, setKind] = useState<ToolboxKind | null>(null);
const [templateSkill, setTemplateSkill] = useState<ToolboxTemplateSkill>(() => ({
  ...EMPTY_SKILL_COMMON,    // shared subset of EMPTY_SKILL
  kind: 'template',
  systemPrompt: 'You are a community-bank assistant. ' +
    'Use plain language at an 8th-grade reading level. Cite sources only when provided.',
  userPromptTemplate: 'Write a {{kind_of_output}} for {{recipient}}.\n\nContext:\n{{context}}',
  variables: [
    { name: 'kind_of_output', label: 'Kind of output', type: 'text', required: true },
    { name: 'recipient', label: 'Recipient', type: 'text', required: true },
    { name: 'context', label: 'Context', type: 'textarea', required: true },
  ],
}));

// In the Build tab branch:
if (safeTab === 'build') {
  if (!kind) return <KindPicker value={null} onChange={(k) => setKind(k)} />;
  if (kind === 'template') {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <button onClick={() => setKind(null)} className="...">← Choose a different kind</button>
        <TemplateBuilder skill={templateSkill} onChange={setTemplateSkill} />
        <SaveAndTestButtons skill={templateSkill} />
      </div>
    );
  }
  // kind === 'workflow' — render the existing editor (unchanged)
  return <ExistingWorkflowEditor ... />;
}
```

The exact integration hinges on the existing 588-line file's structure. The implementer must read the Build tab carefully and make the smallest patch that:

1. Adds the imports above.
2. Adds the `kind`, `templateSkill` state hooks.
3. Wraps the existing Build tab content in a `kind === 'workflow'` branch.
4. Adds a `kind === 'template'` branch rendering `<TemplateBuilder>` plus a Save button that POSTs to `/api/toolbox/skills` with `{ skill: { ...templateSkill } }`.
5. Adds a `kind === null` branch rendering `<KindPicker>`.

If the Build tab is more tangled than expected and a clean patch isn't obvious, the implementer should stop and surface to the user with two options: (a) write a smaller refactor task first, or (b) accept a slightly messier patch with a follow-up cleanup task.

**Save handler shape (use the existing fetch pattern in the file as a reference):**

```typescript
async function saveTemplateSkill(skill: ToolboxTemplateSkill) {
  const res = await fetch('/api/toolbox/skills', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ skill }),
  });
  if (!res.ok) {
    // Surface error in the existing toast/banner pattern used elsewhere in
    // ToolboxApp.tsx (look for fetch error handling on the workflow path).
    return;
  }
  const { skill: saved } = await res.json();
  // Refresh local list state in the same way the existing workflow saver does.
}
```

- [ ] **Step 3: tsc + tests + dev server smoke**

```bash
npx tsc --noEmit 2>&1 | head -10
npx vitest run 2>&1 | tail -3
lsof -ti:3000 | xargs -r kill
npm run dev
```

Visit `http://localhost:3000/dashboard/toolbox?tab=build`:
- KindPicker renders.
- Click "Workflow Skill" → existing builder appears (regression check).
- Back, click "Template with Variables" → TemplateBuilder renders.
- Edit a variable → preview updates live.
- Save a template skill → POST returns 201; skill appears in My Toolbox tab.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): wire KindPicker and TemplateBuilder into Build tab

Build tab now starts with KindPicker. Workflow path is unchanged
(existing 23-field editor). Template path renders TemplateBuilder
and POSTs to /api/toolbox/skills with kind='template'."
```

---

## Task 13: End-to-end smoke test

**Files:** none

- [ ] **Step 1: Full verification**

```bash
cd ~/Projects/aibi-toolbox && npx tsc --noEmit && npx vitest run 2>&1 | tail -3 && npm run build 2>&1 | tail -10
```

Expected: zero TypeScript errors, all tests passing (49 from Plan A0 + ~14 from Plan B = ~63), build succeeds.

- [ ] **Step 2: Manual matrix in dev**

Confirm in browser:
1. `/dashboard/toolbox?tab=build` → KindPicker renders.
2. Choose Workflow → existing editor unchanged.
3. Choose Template → TemplateBuilder renders with seeded example.
4. Edit `userPromptTemplate`, change a `{{variable}}` name, watch the preview update.
5. Save template skill → POST 201 → My Toolbox shows the new skill with `kind: 'template'`.
6. Edit the saved template skill via PATCH → loads correctly, edits persist.
7. Run a workflow skill in `/dashboard/toolbox?tab=playground` → still works, system prompt is generated as before.
8. Run a template skill in playground → system prompt is the stored verbatim text (verify by inspecting network panel of the run request response).

- [ ] **Step 3: Production trigger from Plan A0 still working**

Per Plan A0 §11 verification, paid `course_enrollments` rows still create active `entitlements` rows via the trigger. Plan B did not touch this — re-confirm via:

```bash
cd ~/Projects/TheAiBankingInstitute && supabase db query --linked "
SELECT
  (SELECT count(*) FROM course_enrollments WHERE product IN ('aibi-p','aibi-s','aibi-l')) AS enrollments,
  (SELECT count(*) FROM entitlements WHERE source='course_enrollment' AND active=true) AS entitlements;"
```

Expected: counts still match.

- [ ] **Step 4: No commit needed** if everything passed cleanly.

---

## Definition of Done

Plan B is complete when ALL of the following are true:

- [ ] Migration 00017 applied; `toolbox_skills` has 8 new columns + 3 new indexes + the `toolbox_skills_template_kind_required` CHECK constraint.
- [ ] `src/lib/toolbox/types.ts` exports `ToolboxSkill = ToolboxWorkflowSkill | ToolboxTemplateSkill` plus `isWorkflowSkill` / `isTemplateSkill` type guards.
- [ ] `buildToolboxSystemPrompt` dispatches by kind and tests pass.
- [ ] `validateSkill` is extracted into `src/app/api/toolbox/skills/validateSkill.ts` with kind-aware validation; 9 unit tests passing.
- [ ] POST `/api/toolbox/skills` and PATCH `/api/toolbox/skills/[skillId]` persist the new columns.
- [ ] POST `/api/toolbox/run` accepts both kinds without changes (or with the small kind-check in `isSkill`).
- [ ] ToolboxApp Build tab starts with KindPicker; workflow path unchanged; template path renders TemplateBuilder and saves correctly.
- [ ] `npx tsc --noEmit`, `npx vitest run`, `npm run build` all pass with zero new errors.
- [ ] All existing `/api/toolbox/*` routes still serve the same shapes for workflow skills (regression check).

---

## What Plan B explicitly does NOT do

- **DB-backed Library** (move file-based templates from `src/content/toolbox/templates.ts` into `toolbox_library_skills` table) — **Plan C**
- **Library versioning + Fork-to-Toolbox** — **Plan C**
- **Multi-provider Playground** (OpenAI, Google adapters; streaming; cost-as-dollars; per-IP rate limit; layered PII safety) — **Plans D and E**
- **"Save to Toolbox" capture from inside course modules** — **Plan F**
- **Cookbook recipes** — **Plan G**

---

## Self-Review

**Spec coverage check (Plan B-relevant sections only):**

| Spec section | Plan B coverage |
|---|---|
| §5.1 Skill schema (amended decision #23) | Tasks 2, 3 |
| §5.1 Workflow vs template kind dispatch | Tasks 4, 5 |
| §5.1 Skill Builder UI (kind picker + template builder) | Tasks 10, 11, 12 |
| §5.2 Library auth standard applies to both kinds | Honored by §7.3 DDL allowing kind on `toolbox_library_skills`; actual library work is **Plan C** |
| §7.3 DDL `toolbox_skills` ALTER | Task 2 |
| §12 decision #23 | Spec amendment landed in `91684e3`; Plan B implements |

**Placeholder scan:** Task 12 contains a small pseudocode block where the precise patch into `ToolboxApp.tsx` depends on its existing structure. The instruction is explicit about the intent and the smallest-patch goal, with an escape hatch ("stop and ask the user") if the file is more tangled than expected. This is intentional, not a placeholder — the engineer reading Task 12 has the file in front of them and can make the right surgical patch.

**Type consistency:** `ToolboxSkill` discriminated union is defined in Task 3 and used by every subsequent task. `validateSkill` (Tasks 6–8) returns `ToolboxSkill`. `KindPicker` (Task 10) returns the chosen `ToolboxKind`. `TemplateBuilder` (Task 11) takes/yields `ToolboxTemplateSkill`. All consistent.

**Scope check:** 13 tasks across 1 schema migration, 5 lib/api modifications, 1 extraction, 2 new components, 1 wiring task, and 1 verification. All within one coherent foundation refactor. No subsystem could ship independently of the others.
