# AiBI Toolbox — Plan F: Save to Toolbox

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface a "Save to Toolbox" capture button everywhere a prompt example appears in course content, the Playground, or the Library, and persist captures as editable `toolbox_skills` rows with provenance backlinks.

**Architecture:** One server endpoint `/api/toolbox/save` that accepts a source artifact + origin descriptor, runs it through a kind-aware mapper (`promptCardToToolboxSkill`, `playgroundMessagesToToolboxSkill`, `libraryEntryToToolboxSkill`), and inserts a new `toolbox_skills` row scoped to the calling user. Three UI surfaces consume the endpoint: `PromptCard` (course modules + prompt library), the Playground send box, and Library detail pages (already wired to the equivalent "Fork from Library" route from Plan C — Plan F unifies the analytics event + button copy so the surface looks identical to learners). My Toolbox renders source-ref backlinks: clicking a course-sourced skill opens the originating lesson; clicking a library-sourced skill opens the library entry.

**Tech Stack:** Next.js 14 App Router · existing `toolbox_skills` table (Plan B/C) · existing `getPaidToolboxAccess()` · existing `validateSkill()` + `lib/toolbox/types.ts` discriminated union · existing `PromptCard` component · Plausible deferred-call pattern.

---

## Plan context

### What shipped earlier

- **Plan A0/B/C/D/E** — see Plans D + E for context. Notable for Plan F:
  - `toolbox_skills` table has columns `source` (`'library' | 'course' | 'user' | 'forked'`) and `source_ref` since Plan B.
  - `POST /api/toolbox/skills` already creates user skills — Plan F adds a sibling `/api/toolbox/save` route that uses the same persistence path but accepts a richer source descriptor.
  - `validateSkill()` validates a `ToolboxSkill` discriminated union; Plan F's mappers produce skills that pass through it unchanged.
  - Plan C's `POST /api/toolbox/skills/fork-from-library` already exists for Library → personal. Plan F treats Fork-from-Library as the Library origin for analytics + button copy purposes; the underlying route does not need to be replaced.

### What this plan does NOT do

- **Cookbook recipes.** → Plan G.
- **Editing a saved skill** — saved skills land in the user's Toolbox in their `kind`-appropriate Builder; existing edit flows from Plan B handle this. Plan F adds no new editing UI.
- **Authoring 25 launch Library Skills** — content track per spec §11; not engineering.
- **Mobile-specific button placement audits** — Plan F renders the button consistently with the existing PromptCard footer; mobile audit is the cross-cutting Phase 10 in the roadmap.

---

## File structure

| Action | File | Responsibility |
|---|---|---|
| Create | `src/lib/toolbox/save-mappers.ts` | Pure functions: `promptCardToToolboxSkill(prompt, userId)`, `playgroundMessagesToToolboxSkill({ skill, messages, userId })`, `libraryEntryToToolboxSkill(entry, userId)`. Each returns a `ToolboxSkill` ready for insert with `source` + `source_ref` populated. |
| Create | `src/lib/toolbox/save-mappers.test.ts` | Asserts mapper output shape per origin: source/source_ref correctness, kind mapping, idempotent fields. |
| Create | `src/app/api/toolbox/save/route.ts` | POST endpoint. Discriminated request body: `{ origin: 'course' \| 'playground' \| 'library', payload }`. Dispatches to the right mapper, validates the produced skill, inserts to `toolbox_skills`, returns the new skill id. Fires `save_to_toolbox_clicked` server-side. |
| Create | `src/app/api/toolbox/save/route.test.ts` | Asserts paid-access gate, origin dispatch, validation failure path, plausible event fired, returned id matches inserted row. |
| Modify | `src/app/courses/aibi-p/_components/PromptCard.tsx` | Add a second action button "Save to Toolbox" alongside the existing "Save" button. Disabled / "Saved" state derived from a per-prompt-id call out to `/api/toolbox/save?check=...` OR a Set held in localStorage (LRU — keep it small). On click POST `{ origin: 'course', payload: { promptId, courseSlug, moduleNumber } }`. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` | Add a "Save to Toolbox" button in the Playground panel that POSTs `{ origin: 'playground', payload: { skill, messages } }`. Wire it next to the existing send/clear controls. |
| Modify | `src/app/dashboard/toolbox/library/[slug]/page.tsx` (or wherever the Library detail page renders) | Replace the existing "Fork to my Toolbox" CTA with a "Save to Toolbox" button that hits `/api/toolbox/save` with `{ origin: 'library', payload: { librarySkillId, versionId } }`. The underlying insert path stays unchanged — this is button-copy + analytics-event unification. |
| Modify | `src/app/dashboard/toolbox/ToolboxApp.tsx` (My Toolbox tab) | When rendering each saved skill row, surface a "Source: Module 3 — Lesson 2" backlink for `source: 'course'` skills, or "Forked from Library entry: …" for `source: 'library'/'forked'` skills. The link target is derived from `source_ref`. |
| Create | `src/lib/analytics/save-to-toolbox.ts` | Tiny helper: `trackSaveToToolbox({ origin, sourceRef })`. Wraps the existing `trackEvent` deferred-queue call. Imported by mappers and by client-side button handlers if a client-side mirror event is desired. |

---

## Tasks

### Task 1: Mappers from each origin to a `ToolboxSkill`

**Files:**
- Create: `src/lib/toolbox/save-mappers.ts`
- Create: `src/lib/toolbox/save-mappers.test.ts`

Three pure functions. Each one consumes a typed source artifact and returns a `ToolboxSkill` (discriminated union from `lib/toolbox/types.ts`) that is ready to feed into `validateSkill()` followed by an `insert()` on `toolbox_skills`.

**Origin → kind mapping (locked):**
- `course` (a `Prompt` from the course prompt-library) → `ToolboxTemplateSkill`. Course prompts are single-shot — they map naturally to the template kind. The prompt body becomes `userPromptTemplate`; `whenToUse`/`expectedOutput` populate `desc` + `samples[0].title`.
- `playground` (the active skill plus the conversation transcript) → preserves the source skill's `kind`. For workflow kind, the saved skill is a copy of the workflow plus a `samples` entry with the actual conversation. For template kind, the saved skill is a copy of the template plus an `example` populated from the most recent user input + assistant output.
- `library` (a `toolbox_library_skills` row + a pinned `toolbox_library_skill_versions` id) → preserves the library entry's kind. This is the same insert that Plan C's Fork-from-Library route already performs; Plan F's wrapper exists so the analytics event and button copy unify.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/toolbox/save-mappers.test.ts
import { describe, expect, it } from 'vitest';
import {
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
} from './save-mappers';

describe('promptCardToToolboxSkill', () => {
  const prompt = {
    id: 'p-001',
    title: 'Draft a denial letter (ECOA)',
    role: 'lender',
    relatedModule: 3,
    promptText: 'You are a community banker...',
    expectedOutput: 'A 1-page ECOA-compliant denial letter.',
    whenToUse: 'When a credit application is declined.',
    whatNotToPaste: 'Real applicant PII.',
    platform: 'claude',
    difficulty: 'intermediate',
    timeEstimate: '5 min',
  } as const;

  it('produces a template-kind skill with course provenance', () => {
    const skill = promptCardToToolboxSkill(prompt as any, 'user-1');
    expect(skill.kind).toBe('template');
    expect(skill.source).toBe('course');
    expect(skill.sourceRef).toBe('aibi-p/module-3/p-001');
    if (skill.kind !== 'template') throw new Error('expected template');
    expect(skill.userPromptTemplate).toContain('You are a community banker');
    expect(skill.desc.length).toBeGreaterThan(0);
  });
});

describe('playgroundMessagesToToolboxSkill', () => {
  it('preserves the source skill kind (workflow) and appends a sample', () => {
    const sourceSkill = {
      kind: 'workflow',
      cmd: '/credit-memo',
      name: 'Credit Memo',
      purpose: 'p',
      questions: 'q',
      steps: ['s1'],
      guardrails: ['g1'],
      output: 'Markdown',
      tone: 'Professional',
      length: 'Concise',
      samples: [],
      version: '1.0',
      maturity: 'draft',
      owner: 'me',
      dept: 'Lending',
      deptFull: 'Lending',
      difficulty: 'beginner',
      timeSaved: 'varies',
      cadence: 'as needed',
      desc: 'd',
    } as any;
    const messages = [
      { role: 'user', content: 'Run on this loan.' },
      { role: 'assistant', content: '...output...' },
    ] as const;
    const out = playgroundMessagesToToolboxSkill({ skill: sourceSkill, messages, userId: 'u1' });
    expect(out.kind).toBe('workflow');
    expect(out.source).toBe('user');
    if (out.kind !== 'workflow') throw new Error();
    expect(out.samples?.length).toBeGreaterThan(0);
  });

  it('preserves the source skill kind (template) and populates example', () => {
    const sourceSkill = {
      kind: 'template',
      cmd: '/x',
      name: 'X',
      systemPrompt: 'sys',
      userPromptTemplate: 'Write {{kind}}.',
      variables: [{ name: 'kind', label: 'Kind', type: 'text', required: true }],
      version: '1.0',
      maturity: 'draft',
      owner: 'me',
      dept: 'General',
      deptFull: 'General',
      difficulty: 'beginner',
      timeSaved: 'varies',
      cadence: 'as needed',
      desc: 'd',
    } as any;
    const messages = [
      { role: 'user', content: 'Write memo.' },
      { role: 'assistant', content: 'Here is your memo: ...' },
    ] as const;
    const out = playgroundMessagesToToolboxSkill({ skill: sourceSkill, messages, userId: 'u1' });
    expect(out.kind).toBe('template');
    if (out.kind !== 'template') throw new Error();
    expect(out.example?.input).toBeDefined();
    expect(out.example?.output).toContain('memo');
  });
});

describe('libraryEntryToToolboxSkill', () => {
  it('produces a forked-source skill referencing the version', () => {
    const entry = {
      id: 'lib-1',
      slug: 'denial-letter',
      kind: 'template',
      title: 'Denial Letter',
      description: 'd',
      systemPrompt: 'sp',
      userPromptTemplate: 'tmpl',
      variables: [],
      pillar: 'B',
      category: 'Lending',
    } as any;
    const out = libraryEntryToToolboxSkill(entry, 'u1', 'ver-7');
    expect(out.source).toBe('forked');
    expect(out.sourceRef).toBe('library:lib-1@ver-7');
    expect(out.kind).toBe('template');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/toolbox/save-mappers.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the mappers**

```typescript
// src/lib/toolbox/save-mappers.ts
import type { Prompt } from '@content/courses/aibi-p/prompt-library';
import type {
  ToolboxMessage,
  ToolboxSkill,
  ToolboxTemplateSkill,
  ToolboxWorkflowSkill,
} from '@/lib/toolbox/types';

function freshIds(userId: string, baseCmd: string) {
  return {
    id: '', // assigned by Postgres on insert
    cmd: `${baseCmd}-${Date.now().toString(36)}`,
    owner: userId,
  };
}

export function promptCardToToolboxSkill(prompt: Prompt, userId: string): ToolboxTemplateSkill {
  const { id, cmd, owner } = freshIds(userId, `/${prompt.id}`);
  return {
    kind: 'template',
    id,
    cmd,
    name: prompt.title,
    dept: 'General',
    deptFull: 'General',
    difficulty: prompt.difficulty,
    timeSaved: prompt.timeEstimate,
    cadence: 'As needed',
    desc: prompt.whenToUse ?? prompt.expectedOutput,
    owner,
    maturity: 'draft',
    version: '1.0',
    systemPrompt: '', // course prompts are typically a single user message
    userPromptTemplate: prompt.promptText,
    variables: [],
    example: { input: {}, output: prompt.expectedOutput },
    source: 'course',
    sourceRef: `aibi-p/module-${prompt.relatedModule}/${prompt.id}`,
  };
}

interface PlaygroundCapture {
  readonly skill: ToolboxSkill;
  readonly messages: readonly ToolboxMessage[];
  readonly userId: string;
}

export function playgroundMessagesToToolboxSkill(input: PlaygroundCapture): ToolboxSkill {
  const { skill, messages, userId } = input;
  const { id, cmd, owner } = freshIds(userId, skill.cmd);

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  if (skill.kind === 'workflow') {
    const fresh: ToolboxWorkflowSkill = {
      ...skill,
      id, cmd, owner,
      maturity: 'draft',
      source: 'user',
      sourceRef: undefined,
      samples: [
        ...(skill.samples ?? []),
        ...(lastUser ? [{ title: 'From Playground', prompt: lastUser.content }] : []),
      ],
    };
    return fresh;
  }

  const fresh: ToolboxTemplateSkill = {
    ...skill,
    id, cmd, owner,
    maturity: 'draft',
    source: 'user',
    sourceRef: undefined,
    example: {
      input: {},
      output: lastAssistant?.content ?? skill.example?.output ?? '',
    },
  };
  return fresh;
}

interface LibraryEntry {
  readonly id: string;
  readonly slug: string;
  readonly kind: 'workflow' | 'template';
  readonly title: string;
  readonly description: string;
  readonly systemPrompt?: string;
  readonly userPromptTemplate?: string;
  readonly variables?: ReadonlyArray<unknown>;
  readonly workflowDefinition?: Record<string, unknown>;
  readonly pillar?: 'A' | 'B' | 'C';
  readonly category: string;
}

export function libraryEntryToToolboxSkill(
  entry: LibraryEntry,
  userId: string,
  versionId: string,
): ToolboxSkill {
  const { id, cmd, owner } = freshIds(userId, `/${entry.slug}`);
  const common = {
    id, cmd, owner,
    name: entry.title,
    dept: entry.category,
    deptFull: entry.category,
    difficulty: 'intermediate' as const,
    timeSaved: 'varies',
    cadence: 'As needed',
    desc: entry.description,
    maturity: 'draft' as const,
    version: '1.0',
    pillar: entry.pillar,
    source: 'forked' as const,
    sourceRef: `library:${entry.id}@${versionId}`,
  };

  if (entry.kind === 'workflow') {
    return {
      ...common,
      kind: 'workflow',
      ...(entry.workflowDefinition as object),
    } as ToolboxWorkflowSkill;
  }
  return {
    ...common,
    kind: 'template',
    systemPrompt: entry.systemPrompt ?? '',
    userPromptTemplate: entry.userPromptTemplate ?? '',
    variables: (entry.variables ?? []) as never,
  } as ToolboxTemplateSkill;
}
```

> **Note:** the spread of `entry.workflowDefinition` assumes that JSONB column carries the workflow fields with the same key names as `ToolboxWorkflowSkill`. Plan B's seed loader confirmed this. If shapes diverged in Plan C's library inserts, add an explicit field-by-field map.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/toolbox/save-mappers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/toolbox/save-mappers.ts src/lib/toolbox/save-mappers.test.ts
git commit -m "feat(toolbox): origin -> ToolboxSkill mappers for Save"
```

---

### Task 2: `/api/toolbox/save` endpoint

**Files:**
- Create: `src/app/api/toolbox/save/route.ts`
- Create: `src/app/api/toolbox/save/route.test.ts`

POST-only. Body shape:

```typescript
type SaveRequest =
  | { origin: 'course'; payload: { promptId: string; courseSlug: 'aibi-p'; moduleNumber: number } }
  | { origin: 'playground'; payload: { skill: ToolboxSkill; messages: ToolboxMessage[] } }
  | { origin: 'library'; payload: { librarySkillId: string; versionId: string } };
```

Response: `{ id: string }` (the new `toolbox_skills.id`) or `{ error }`.

Server-side `trackEvent('save_to_toolbox_clicked', { origin, source_ref })` per spec §9.

- [ ] **Step 1: Write the failing test**

```typescript
// src/app/api/toolbox/save/route.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock, select: () => ({ single: async () => ({ data: { id: 'new-id' }, error: null }) }) }));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: () => ({ from: fromMock }),
  isSupabaseConfigured: () => true,
}));
vi.mock('@/lib/toolbox/access', () => ({
  getPaidToolboxAccess: vi.fn(async () => ({ userId: 'u1' })),
}));
vi.mock('@/lib/analytics/plausible', () => ({
  trackEvent: vi.fn(),
}));
vi.mock('@content/courses/aibi-p/prompt-library', async () => ({
  getPromptById: (id: string) => id === 'p-1' ? {
    id: 'p-1', title: 't', promptText: 'pt', relatedModule: 2,
    expectedOutput: 'eo', difficulty: 'beginner', timeEstimate: '5 min',
    role: 'lender', platform: 'claude',
  } : null,
}));

afterEach(() => vi.clearAllMocks());

function req(body: unknown): Request {
  return new Request('http://localhost/api/toolbox/save', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/toolbox/save', () => {
  it('rejects unauthenticated', async () => {
    const access = (await import('@/lib/toolbox/access')).getPaidToolboxAccess as ReturnType<typeof vi.fn>;
    access.mockResolvedValueOnce(null);
    const res = await POST(req({ origin: 'course', payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 } }));
    expect(res.status).toBe(403);
  });

  it('saves a course prompt and returns the new id', async () => {
    insertMock.mockResolvedValueOnce({ data: { id: 'new-id' }, error: null });
    const res = await POST(req({ origin: 'course', payload: { promptId: 'p-1', courseSlug: 'aibi-p', moduleNumber: 2 } }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('new-id');
  });

  it('rejects an unknown origin', async () => {
    const res = await POST(req({ origin: 'cookbook', payload: {} }));
    expect(res.status).toBe(400);
  });

  it('rejects a course payload pointing at a missing prompt', async () => {
    const res = await POST(req({ origin: 'course', payload: { promptId: 'does-not-exist', courseSlug: 'aibi-p', moduleNumber: 2 } }));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/toolbox/save/route.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the route**

```typescript
// src/app/api/toolbox/save/route.ts
import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import {
  promptCardToToolboxSkill,
  playgroundMessagesToToolboxSkill,
  libraryEntryToToolboxSkill,
} from '@/lib/toolbox/save-mappers';
import { trackEvent } from '@/lib/analytics/plausible';
import { getPromptById } from '@content/courses/aibi-p/prompt-library';
import type { ToolboxMessage, ToolboxSkill } from '@/lib/toolbox/types';

interface CoursePayload { origin: 'course'; payload: { promptId: string; courseSlug: 'aibi-p'; moduleNumber: number } }
interface PlaygroundPayload { origin: 'playground'; payload: { skill: ToolboxSkill; messages: ToolboxMessage[] } }
interface LibraryPayload { origin: 'library'; payload: { librarySkillId: string; versionId: string } }
type SaveBody = CoursePayload | PlaygroundPayload | LibraryPayload;

function isSaveBody(v: unknown): v is SaveBody {
  if (!v || typeof v !== 'object') return false;
  const o = v as { origin?: unknown };
  return o.origin === 'course' || o.origin === 'playground' || o.origin === 'library';
}

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });

  let body: SaveBody;
  try {
    const parsed = await request.json();
    if (!isSaveBody(parsed)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 400 });
    body = parsed as SaveBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  let skill: ToolboxSkill;
  let sourceRef: string | undefined;

  if (body.origin === 'course') {
    const prompt = getPromptById(body.payload.promptId);
    if (!prompt) return NextResponse.json({ error: 'Prompt not found.' }, { status: 404 });
    skill = promptCardToToolboxSkill(prompt, access.userId);
    sourceRef = skill.sourceRef;
  } else if (body.origin === 'playground') {
    skill = playgroundMessagesToToolboxSkill({
      skill: body.payload.skill,
      messages: body.payload.messages,
      userId: access.userId,
    });
    sourceRef = undefined;
  } else {
    const client = createServiceRoleClient();
    const { data: entry } = await client.from('toolbox_library_skills').select('*').eq('id', body.payload.librarySkillId).single();
    if (!entry) return NextResponse.json({ error: 'Library entry not found.' }, { status: 404 });
    skill = libraryEntryToToolboxSkill(entry as never, access.userId, body.payload.versionId);
    sourceRef = skill.sourceRef;
  }

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('toolbox_skills')
    .insert({
      user_id: access.userId,
      command: skill.cmd,
      name: skill.name,
      maturity: skill.maturity,
      kind: skill.kind,
      system_prompt: skill.kind === 'template' ? skill.systemPrompt : null,
      user_prompt_template: skill.kind === 'template' ? skill.userPromptTemplate : null,
      variables: skill.kind === 'template' ? skill.variables : [],
      pillar: skill.pillar ?? null,
      teaching_annotations: skill.teachingAnnotations ?? [],
      source: skill.source ?? 'user',
      source_ref: sourceRef ?? null,
      skill: skill,  // legacy blob field that already accepts the full object
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed.' }, { status: 500 });
  }

  trackEvent('save_to_toolbox_clicked', { origin: body.origin, source_ref: sourceRef ?? null });
  return NextResponse.json({ id: (data as { id: string }).id });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/toolbox/save/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/toolbox/save/route.ts src/app/api/toolbox/save/route.test.ts
git commit -m "feat(toolbox): /api/toolbox/save endpoint with three origin paths"
```

---

### Task 3: "Save to Toolbox" button on `PromptCard`

**Files:**
- Modify: `src/app/courses/aibi-p/_components/PromptCard.tsx`

Add a second action button labelled **"Save to Toolbox"**, distinct from the existing "Save" button (which manages a generic saved-prompts list). The new button hits `/api/toolbox/save`. State: `idle | saving | saved | error`. After a successful save, replace the button with a "View in Toolbox →" link pointing at `/dashboard/toolbox?skill={id}` for that session's lifetime.

Hide the button entirely for unauthenticated visitors and for free-tier learners — `getPaidToolboxAccess()` is server-only, so the page-level guard either passes a `canSaveToToolbox` prop down or the button calls `/api/toolbox/save` and shows a paywall toast on 403. Pick the explicit prop path: it is one less round-trip and matches how `ContentGate` is already used in this file.

- [ ] **Step 1: Add the prop and the click handler**

Add to `PromptCardProps`:

```tsx
readonly canSaveToToolbox?: boolean;
```

Inside the component, add state and handler:

```tsx
type ToolboxSaveState = 'idle' | 'saving' | 'saved' | 'error';
const [toolboxState, setToolboxState] = useState<ToolboxSaveState>('idle');
const [toolboxSkillId, setToolboxSkillId] = useState<string | null>(null);

const handleSaveToToolbox = useCallback(async () => {
  setToolboxState('saving');
  try {
    const res = await fetch('/api/toolbox/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'course',
        payload: { promptId: prompt.id, courseSlug: 'aibi-p', moduleNumber: prompt.relatedModule },
      }),
    });
    if (!res.ok) {
      setToolboxState('error');
      return;
    }
    const json = await res.json() as { id: string };
    setToolboxSkillId(json.id);
    setToolboxState('saved');
  } catch {
    setToolboxState('error');
  }
}, [prompt.id, prompt.relatedModule]);
```

- [ ] **Step 2: Render the button in the footer**

Inside the existing footer-actions block, after the "Saved/Save" button, add:

```tsx
{canSaveToToolbox && toolboxState === 'idle' && (
  <button
    type="button"
    onClick={handleSaveToToolbox}
    className="font-sans text-[12px] text-[color:var(--color-terra)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
  >
    Save to Toolbox
  </button>
)}
{canSaveToToolbox && toolboxState === 'saving' && (
  <span className="font-sans text-[12px] text-[color:var(--color-slate)]">Saving…</span>
)}
{canSaveToToolbox && toolboxState === 'saved' && toolboxSkillId && (
  <Link
    href={`/dashboard/toolbox?skill=${toolboxSkillId}`}
    className="font-sans text-[12px] text-[color:var(--color-sage)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-1 rounded-sm"
  >
    View in Toolbox →
  </Link>
)}
{canSaveToToolbox && toolboxState === 'error' && (
  <span className="font-sans text-[12px] text-[color:var(--color-error)]">Save failed</span>
)}
```

- [ ] **Step 3: Pass `canSaveToToolbox` from the host pages**

In each host that renders `<PromptCard ...>` — `PromptLibraryClient.tsx`, `MiniTutorial.tsx`, `ToolGuide.tsx`, the module page — add the prop. Source the boolean from the page-level entitlement check:

- For server components (module page), call the existing `getPaidToolboxAccess()` (or read from the existing entitlement check that already gates the dashboard) and pass the resulting boolean to the client island.
- For client components that already receive an entitlement-shape prop, pass the relevant boolean through.

If the existing entitlement check in module pages is server-only, the smallest patch is: import `hasToolboxAccess` (from `lib/entitlements.ts`) once at the top of the module page server component, evaluate, and pass `canSaveToToolbox={canSave}` into the rendered card. Where module content is rendered through `ModuleContentClient`, thread the prop through.

- [ ] **Step 4: Type check + manual smoke test**

Run: `npx tsc --noEmit`
Expected: zero errors.

Run: `npm run dev`. As a paid user, visit any module page or `/courses/aibi-p/prompt-library`. Verify:
1. "Save to Toolbox" appears alongside "Save" in the PromptCard footer.
2. Click — button transitions to "Saving…" then to "View in Toolbox →".
3. Click the resulting link — lands on `/dashboard/toolbox?skill=…` and the saved skill is visible in My Toolbox with `Source: aibi-p/module-X/p-Y` shown.
4. As an unauthenticated visitor, the button does not render.

- [ ] **Step 5: Commit**

```bash
git add src/app/courses/aibi-p/_components/PromptCard.tsx src/app/courses/aibi-p/prompt-library/PromptLibraryClient.tsx src/app/courses/aibi-p/_components/MiniTutorial.tsx src/app/courses/aibi-p/_components/ToolGuide.tsx src/app/courses/aibi-p/\[module\]/page.tsx
git commit -m "feat(toolbox): Save to Toolbox button on PromptCard"
```

(Adjust the commit's `git add` list to whichever host files the previous step modified.)

---

### Task 4: "Save to Toolbox" in the Playground

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx`

A simple addition next to the Playground's existing send/clear buttons. Posts the active `skill` and the `messages` array to `/api/toolbox/save` with `origin: 'playground'`.

- [ ] **Step 1: Add the handler near the existing playground state**

```tsx
const [playgroundSaveState, setPlaygroundSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const handleSavePlayground = useCallback(async () => {
  if (!activeSkill || messages.length === 0) return;
  setPlaygroundSaveState('saving');
  try {
    const res = await fetch('/api/toolbox/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'playground',
        payload: { skill: activeSkill, messages },
      }),
    });
    setPlaygroundSaveState(res.ok ? 'saved' : 'error');
  } catch {
    setPlaygroundSaveState('error');
  }
}, [activeSkill, messages]);
```

- [ ] **Step 2: Render the button**

Place next to the existing send/clear controls in the Playground panel JSX:

```tsx
<button
  type="button"
  onClick={handleSavePlayground}
  disabled={messages.length === 0 || playgroundSaveState === 'saving'}
  className="px-4 py-2 border border-[color:var(--color-ink)]/30 text-sm font-mono uppercase tracking-widest"
>
  {playgroundSaveState === 'saved' ? 'Saved to Toolbox' :
   playgroundSaveState === 'saving' ? 'Saving…' :
   playgroundSaveState === 'error' ? 'Save failed' :
   'Save to Toolbox'}
</button>
```

- [ ] **Step 3: Smoke test**

`npm run dev`. As a paid user:
1. In Playground, send a prompt to any skill, get a response.
2. Click "Save to Toolbox" — button shows "Saved to Toolbox".
3. Switch to My Toolbox tab — confirm the new skill is there with `source: 'user'`.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): Save to Toolbox from Playground"
```

---

### Task 5: Unify Library "Fork" → "Save to Toolbox"

**Files:**
- Modify: the Library detail page component (the one rendering "Fork to my Toolbox" today; from Plan C). Likely `src/app/dashboard/toolbox/library/[slug]/page.tsx` or its client island.

The underlying insert logic stays the same — only the button copy and the analytics event change. Two options:

**Decision (locked 2026-05-04):** switch the Fork button to `/api/toolbox/save` and delete Plan C's `/api/toolbox/skills/fork-from-library` route. One path to one state. Same row gets written; `/api/toolbox/save` adds the unified analytics event.

- [ ] **Step 1: Switch the button handler**

Replace the existing Fork POST with a `/api/toolbox/save` POST:

```tsx
const res = await fetch('/api/toolbox/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'library',
    payload: { librarySkillId: entry.id, versionId: entry.currentVersionId },
  }),
});
```

- [ ] **Step 2: Update the button copy**

Change "Fork to my Toolbox" → "Save to Toolbox". Keep the surrounding helper text ("This creates an editable copy in your personal Toolbox.") unchanged.

- [ ] **Step 3: Remove the Plan-C fork-from-library route**

Decision (locked 2026-05-04): delete the Plan-C route now that Save covers it. Two paths to the same state is exactly the kind of drift to avoid. Search the codebase first to confirm no other callers:

```bash
grep -rn "fork-from-library\|/api/toolbox/skills/fork-from-library" src/ --include="*.ts" --include="*.tsx"
```

If any caller besides the Library detail page surfaces, STOP and surface the list before deleting. Otherwise:

```bash
rm src/app/api/toolbox/skills/fork-from-library/route.ts
rm -f src/app/api/toolbox/skills/fork-from-library/route.test.ts
rmdir src/app/api/toolbox/skills/fork-from-library 2>/dev/null || true
```

- [ ] **Step 4: Smoke test**

As a paid user, open any Library entry detail. Click "Save to Toolbox". Confirm a new row appears in My Toolbox with `source: 'forked'` and `source_ref: 'library:<id>@<version>'`.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/toolbox/library
git commit -m "feat(toolbox): unify Library Fork into Save to Toolbox"
```

---

### Task 6: Source-ref backlinks in My Toolbox

**Files:**
- Modify: `src/app/dashboard/toolbox/ToolboxApp.tsx` (My Toolbox tab)

Each saved skill row in My Toolbox already shows skill metadata. Plan F adds a small "Source:" line below the title with a link derived from `source` + `source_ref`:

| `source` | `source_ref` example | Link target |
|---|---|---|
| `course` | `aibi-p/module-3/p-001` | `/courses/aibi-p/3` |
| `forked` | `library:lib-1@ver-7` | `/dashboard/toolbox/library/<slug>` (resolve `lib-1` → slug via the library list already loaded in state, or fetch on demand) |
| `library` | (originals never appear in My Toolbox; ignore) | — |
| `user` | (no link) | render nothing |
| `playground` capture | `source: 'user'`, `source_ref: undefined` | render nothing |

- [ ] **Step 1: Add a `<SourceBacklink>` helper**

```tsx
function SourceBacklink({ skill }: { skill: ToolboxSkill }) {
  if (!skill.source || skill.source === 'user' || !skill.sourceRef) return null;

  if (skill.source === 'course') {
    // sourceRef shape: aibi-p/module-N/<promptId>
    const match = /^aibi-p\/module-(\d+)\//.exec(skill.sourceRef);
    if (!match) return null;
    return (
      <p className="text-xs text-[color:var(--color-slate)]">
        Source:{' '}
        <Link href={`/courses/aibi-p/${match[1]}`} className="underline">
          AiBI-P · Module {match[1]}
        </Link>
      </p>
    );
  }

  if (skill.source === 'forked' || skill.source === 'library') {
    // sourceRef shape: library:<libraryId>@<versionId>
    const match = /^library:([^@]+)@/.exec(skill.sourceRef);
    if (!match) return null;
    return (
      <p className="text-xs text-[color:var(--color-slate)]">
        Source:{' '}
        <Link href={`/dashboard/toolbox/library?id=${match[1]}`} className="underline">
          Library entry
        </Link>
      </p>
    );
  }

  return null;
}
```

- [ ] **Step 2: Render under each My Toolbox row**

Inside the My Toolbox row JSX, add `<SourceBacklink skill={skill} />` immediately after the title.

- [ ] **Step 3: Smoke test**

For each save path (course, playground, library), confirm the My Toolbox row renders the right backlink (or none for user/playground origins).

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/toolbox/ToolboxApp.tsx
git commit -m "feat(toolbox): source-ref backlinks in My Toolbox"
```

---

## Acceptance criteria

- [ ] Three mappers in `save-mappers.ts` produce valid `ToolboxSkill` shapes; tests cover all three origins.
- [ ] `/api/toolbox/save` accepts `origin: 'course' | 'playground' | 'library'`, dispatches to the right mapper, inserts to `toolbox_skills`, returns the new id, and fires `save_to_toolbox_clicked` server-side.
- [ ] `PromptCard` renders "Save to Toolbox" alongside "Save" for paid learners; unauthenticated/free users do not see it.
- [ ] Save-from-Playground button works on a real run; the resulting My Toolbox row carries `source: 'user'`.
- [ ] Library detail page CTA reads "Save to Toolbox" and goes through `/api/toolbox/save`. Plan-C `fork-from-library` route deleted; no callers remain.
- [ ] My Toolbox shows source-ref backlinks for course-sourced and library-forked skills; the link resolves to the originating module or library entry.
- [ ] `npx tsc --noEmit` passes; `npx vitest run` passes; `npm run build` succeeds.
- [ ] End-to-end smoke: as a paid user, save a prompt from Module 3, save a Playground response, and save a Library entry. All three appear in My Toolbox with the expected provenance.

---

## What Plan F explicitly does NOT do

- **Cookbook recipe save flows.** → **Plan G**.
- **Saving from outside `/courses/aibi-p/...`** — the Save button only mounts on PromptCard surfaces. AiBI-S and AiBI-L surfaces will plug in when those courses ship; they reuse the same endpoint by passing their own `courseSlug` in the payload (and the mapper grows a switch — out of scope for F).
- **Edit-on-save** — saved skills land in `maturity: 'draft'` and the user opens them in the existing Builder to edit. No new editing UI.
- **Bulk save / "save all prompts in this lesson"** — friction is on purpose at v1; one-by-one save trains learners to read each prompt before keeping it.
- **Synthetic-mode + typed-confirmation** layering for the Playground — still tracked via the issue opened in Plan D Task 10.

---

## Self-Review

### Spec coverage check

| Spec section | Plan F coverage |
|---|---|
| §6.1 "Save to Toolbox" — universal capture action | All tasks |
| §6.1 Provenance backlink (`source: 'course'`, `source_ref: 'aibi-p/module-3/lesson-2'`) | Task 1 mapper + Task 6 backlink |
| §6.1 Save button surfaces: course modules, Playground, Library, Cookbook | Tasks 3 (modules + library), 4 (Playground), 5 (Library — unify Fork). Cookbook is Plan G. |
| §5.2 "Library entries are read-only originals; learners 'fork' them" | Task 5 unifies Fork into Save with the right `source: 'forked'`. |
| §9 `save_to_toolbox_clicked` server-side Plausible event | Task 2 fires it; props `{ origin, source_ref }` per spec table. |
| §7.2 `/api/toolbox/save` route | Task 2 |
| §7.3 `toolbox_skills.source` + `source_ref` columns | Already present from Plan B; consumed unchanged. |
| §6.2 Use Anywhere (open in Builder, run in Playground, copy as plain text) | Existing My Toolbox row actions from Plans A0/B/C; Plan F adds backlinks alongside, does not replace. |

### Placeholder scan

Searched plan for: TBD, TODO, "implement later", "fill in details", "add appropriate error handling", "similar to Task N", "write tests for the above" — zero hits. Task 3 Step 3 includes pseudocode for prop threading because the exact set of host files is determined by the codebase state at execution time; the engineer reading Task 3 has the file list (`PromptLibraryClient.tsx`, `MiniTutorial.tsx`, `ToolGuide.tsx`, the module page) and the smallest-patch goal explicitly named.

### Type consistency

- `ToolboxSkill` (and its workflow/template variants) imported from `@/lib/toolbox/types` consistently across the mappers, the route, and the UI.
- `Prompt` imported from `@content/courses/aibi-p/prompt-library` matches the shape consumed by the existing `PromptCard`.
- `SaveBody` discriminated union in the route mirrors the three mapper inputs 1:1; the `origin` discriminant string is identical in TS and on the wire.
- `source` values used in the mappers (`'course'`, `'user'`, `'forked'`) match the `toolbox_skills.source` CHECK constraint added in Plan B.

### Scope check

6 tasks: 1 mapper module, 1 endpoint, 3 surface integrations (PromptCard / Playground / Library), 1 backlink. All within one coherent "ship Save to Toolbox" arc. The endpoint without surfaces is dead; surfaces without the endpoint cannot persist; the backlink without provenance fields is meaningless. The whole set is one PR.
