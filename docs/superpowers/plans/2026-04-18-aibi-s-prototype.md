# AiBI-S Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vertical-slice prototype that demonstrates one complete AiBI-S unit (/Ops Unit 1.1) with the full 6-beat loop and one persona defend beat end-to-end, so stakeholders can experience the pedagogy before we scale content to 5 tracks.

**Architecture:** Next.js 14 App Router route group for AiBI-S prototype routes alongside existing cohort-format routes. Unit content authored as typed TypeScript modules in `content/courses/aibi-s/`. Core simulation logic (beat state machine, persona-chat turn limiter, rubric grader) in `lib/aibi-s/` as pure modules with vitest coverage. Claude API integration server-side only via route handlers. UI components in `src/app/courses/aibi-s/ops/_components/` as React client components. Prototype progress persisted to `localStorage` (Supabase wiring deferred to post-prototype).

**Tech Stack:** Next.js 14.2 (App Router) · TypeScript 5 strict · Tailwind CSS 3.4 · `@anthropic-ai/sdk` 0.90 (server-side) · `@supabase/ssr` (already wired for auth prereq checks) · **vitest** (added this plan) for business-logic tests

**Scope:** Single track (`/Ops`), single unit (Unit 1.1), single persona defend beat (Department Head · Phase I memo). All other tracks, units, phases, personas, and credential/capstone infrastructure are explicitly out of scope.

**Spec reference:** `docs/superpowers/specs/2026-04-18-aibi-s-curriculum-design.md`

---

## File Structure

**New files to create:**

- `lib/aibi-s/types.ts` — shared prototype types (Unit, Beat, Persona, Rubric, ChatTurn)
- `lib/aibi-s/beat-state.ts` — 6-beat state machine (pure reducer)
- `lib/aibi-s/beat-state.test.ts` — state machine unit tests
- `lib/aibi-s/chat-limiter.ts` — persona-chat turn counter (pure)
- `lib/aibi-s/chat-limiter.test.ts` — turn-counter unit tests
- `lib/aibi-s/rubric.ts` — rubric schema + parser for AI-judge responses
- `lib/aibi-s/rubric.test.ts` — rubric parser unit tests
- `content/courses/aibi-s/ops/unit-1-1.ts` — authored unit content
- `content/courses/aibi-s/ops/persona-dept-head-phase-1.ts` — Department Head memo + system prompt + rubric for /Ops Phase I
- `src/app/courses/aibi-s/ops/page.tsx` — track overview (lists Unit 1.1 as the demo entry)
- `src/app/courses/aibi-s/ops/unit/[unitId]/page.tsx` — unit host page
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/UnitRenderer.tsx` — 6-beat orchestrator (client)
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/LearnBeat.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PracticeBeat.tsx` (DecisionSim)
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/ApplyBeat.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/DefendBeat.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PersonaMemo.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RebuttalEditor.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PersonaChat.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RubricScore.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RefineBeat.tsx`
- `src/app/courses/aibi-s/ops/unit/[unitId]/_components/CaptureBeat.tsx`
- `src/app/api/aibi-s/chat/route.ts` — POST: streams Claude persona chat response (bounded turns)
- `src/app/api/aibi-s/grade/route.ts` — POST: returns Claude-judged rubric score
- `src/app/courses/aibi-s/page.tsx` — **modify**: add new track selector showing 5 tracks (only /Ops active)

**Modified files:**

- `package.json` — add vitest + @vitest/ui + @testing-library/react as dev deps; add `test` and `test:watch` scripts
- `vitest.config.ts` — new file
- `src/app/courses/aibi-s/page.tsx` — prototype mode lists tracks; `/Ops` route link; others show "coming soon"

**Files explicitly left alone (out of scope):**

- `src/app/courses/aibi-s/[week]/page.tsx` and everything under the existing `WeekSidebar`/`WeekContent`/week-1..6 structure — the old cohort-format scaffolding stays on disk unchanged so we don't delete working code on a design pivot. We add the new unit-based structure in parallel. A cleanup pass happens after prototype validation.

---

## Tasks

### Task 1: Install vitest and scaffold the test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest and React testing library**

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Add test scripts to package.json**

Edit `package.json` scripts block to add:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Verify vitest runs (should report 'no tests found')**

Run: `npm run test`
Expected: vitest exits 0, reports "No test files found, exiting with code 0" or similar. If it exits non-zero on "no tests found", confirm vitest 1.x config and `passWithNoTests: true` option.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore(aibi-s): add vitest for prototype business-logic tests"
```

---

### Task 2: Define the prototype type system

**Files:**
- Create: `lib/aibi-s/types.ts`

- [ ] **Step 1: Write the types module**

Create `lib/aibi-s/types.ts`:

```ts
// AiBI-S prototype type system
// Scope: enough types to author and render one Unit with the 6-beat loop.
// Production types will likely extend these once we scale to 5 tracks.

export type TrackCode = 'ops' | 'lending' | 'compliance' | 'finance' | 'retail';

export type AiBIPillar = 'A' | 'B' | 'C';

export type DataTier = 1 | 2 | 3;

export type RegulatoryFramework =
  | 'SR 11-7'
  | 'Interagency TPRM'
  | 'ECOA/Reg B'
  | 'BSA/AML'
  | 'AIEOG';

export type BeatKind =
  | 'learn'
  | 'practice'
  | 'apply'
  | 'defend'
  | 'refine'
  | 'capture';

export interface UnitFrameworkHooks {
  readonly pillar: AiBIPillar;
  readonly frameworks: readonly RegulatoryFramework[];
  readonly dataTiers: readonly DataTier[];
}

// --- Learn beat -----------------------------------------------------------

export interface LearnBeatContent {
  readonly kind: 'learn';
  readonly title: string;
  readonly body: string;                  // markdown allowed
  readonly workedExample?: string;        // optional worked example (markdown)
  readonly hooks: UnitFrameworkHooks;
}

// --- Practice beat (decision sim only in the prototype) ------------------

export interface DecisionSimOption {
  readonly id: string;
  readonly label: string;
  readonly isCorrect: boolean;
  readonly feedback: string;              // shown after selection
  readonly consequenceIfWrong?: string;   // compliance failure mode to surface
}

export interface PracticeBeatContent {
  readonly kind: 'practice';
  readonly simKind: 'decision';
  readonly scenario: string;              // markdown
  readonly question: string;
  readonly options: readonly DecisionSimOption[];
  readonly hooks: UnitFrameworkHooks;
}

// --- Apply beat -----------------------------------------------------------

export interface ApplyBeatContent {
  readonly kind: 'apply';
  readonly prompt: string;                // e.g., "Describe the workflow you'll apply this to in your department"
  readonly guidance: string;              // what a good response looks like
  readonly minWords: number;
}

// --- Defend beat ---------------------------------------------------------

export interface DefendBeatPersona {
  readonly id: string;                    // e.g., 'ops-dept-head-p1'
  readonly displayName: string;           // "Department Head — Operations"
  readonly trackCode: TrackCode;
  readonly phase: 1 | 2 | 3;
  readonly memoMarkdown: string;          // the pre-authored challenge memo
  readonly chatSystemPrompt: string;      // system prompt for the AI probe
  readonly maxChatTurns: number;          // bounded; 3–5 per spec
  readonly rubric: Rubric;
}

export interface DefendBeatContent {
  readonly kind: 'defend';
  readonly persona: DefendBeatPersona;
  readonly hooks: UnitFrameworkHooks;
}

// --- Refine beat ---------------------------------------------------------

export interface RefineBeatContent {
  readonly kind: 'refine';
  readonly guidance: string;              // "Now that you've seen the score, revise your rebuttal"
}

// --- Capture beat -------------------------------------------------------

export interface CaptureBeatContent {
  readonly kind: 'capture';
  readonly artifactLabel: string;         // e.g., "Unit 1.1 — Defended rebuttal bundle"
}

// --- Beat union ----------------------------------------------------------

export type BeatContent =
  | LearnBeatContent
  | PracticeBeatContent
  | ApplyBeatContent
  | DefendBeatContent
  | RefineBeatContent
  | CaptureBeatContent;

// --- Unit and track ------------------------------------------------------

export interface Unit {
  readonly id: string;                    // e.g., '1.1'
  readonly trackCode: TrackCode;
  readonly phase: 1 | 2 | 3;
  readonly title: string;
  readonly summary: string;
  readonly beats: readonly BeatContent[];
}

// --- Rubric (shared by Defend beats and AI-judge responses) ------------

export interface RubricDimension {
  readonly id: string;                    // e.g., 'applied-rigor'
  readonly label: string;                 // "Applied rigor"
  readonly description: string;
  readonly maxScore: 4;                   // 0–4 per spec
}

export interface Rubric {
  readonly id: string;
  readonly dimensions: readonly RubricDimension[]; // 5 per spec
  readonly passingTotal: 15;              // per spec §7.4
  readonly passingMinPerDimension: 3;
}

export interface RubricScore {
  readonly rubricId: string;
  readonly dimensionScores: Readonly<Record<string, number>>; // 0..4
  readonly total: number;
  readonly passed: boolean;
  readonly feedback: string;              // narrative feedback from AI-judge
}

// --- Persona chat --------------------------------------------------------

export interface ChatTurn {
  readonly role: 'persona' | 'learner';
  readonly content: string;
  readonly turnIndex: number;             // 1-based
}

// --- Learner state (prototype: localStorage-persisted) -----------------

export interface UnitLearnerState {
  readonly unitId: string;
  readonly currentBeatIndex: number;      // 0..beats.length-1
  readonly practiceChoice: string | null; // decision-sim option id
  readonly applyResponse: string;         // Apply beat submission
  readonly rebuttal: string;              // initial written rebuttal
  readonly chatTurns: readonly ChatTurn[];
  readonly rubricScore: RubricScore | null;
  readonly refinedRebuttal: string;       // after Refine beat
  readonly capturedAt: string | null;     // ISO timestamp when Capture completes
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no new errors beyond any pre-existing errors. If there are pre-existing errors, note them and confirm this task didn't add any.

- [ ] **Step 3: Commit**

```bash
git add lib/aibi-s/types.ts
git commit -m "feat(aibi-s): add prototype type system for units and beats"
```

---

### Task 3: Beat state machine with tests (TDD)

**Files:**
- Create: `lib/aibi-s/beat-state.ts`
- Create: `lib/aibi-s/beat-state.test.ts`

- [ ] **Step 1: Write the failing state machine tests first**

Create `lib/aibi-s/beat-state.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { initialState, canAdvance, advance, type Action } from './beat-state';
import type { Unit } from './types';

const fixtureUnit: Unit = {
  id: '1.1',
  trackCode: 'ops',
  phase: 1,
  title: 'Test Unit',
  summary: 'fixture',
  beats: [
    { kind: 'learn', title: 'L', body: 'b', hooks: { pillar: 'A', frameworks: [], dataTiers: [] } },
    { kind: 'practice', simKind: 'decision', scenario: 's', question: 'q', options: [
      { id: 'a', label: 'A', isCorrect: true, feedback: 'good' },
    ], hooks: { pillar: 'A', frameworks: [], dataTiers: [] } },
    { kind: 'apply', prompt: 'p', guidance: 'g', minWords: 10 },
    { kind: 'defend', persona: {
      id: 'x', displayName: 'X', trackCode: 'ops', phase: 1,
      memoMarkdown: 'm', chatSystemPrompt: 'sp', maxChatTurns: 3,
      rubric: { id: 'r', dimensions: [], passingTotal: 15, passingMinPerDimension: 3 },
    }, hooks: { pillar: 'B', frameworks: ['SR 11-7'], dataTiers: [2] } },
    { kind: 'refine', guidance: 'refine' },
    { kind: 'capture', artifactLabel: 'bundle' },
  ],
};

describe('beat-state', () => {
  it('initialState starts at beat 0 with clean fields', () => {
    const s = initialState(fixtureUnit);
    expect(s.currentBeatIndex).toBe(0);
    expect(s.practiceChoice).toBeNull();
    expect(s.applyResponse).toBe('');
    expect(s.rebuttal).toBe('');
    expect(s.chatTurns).toEqual([]);
    expect(s.rubricScore).toBeNull();
    expect(s.refinedRebuttal).toBe('');
    expect(s.capturedAt).toBeNull();
  });

  it('cannot advance from Learn until nothing is required (Learn is immediate)', () => {
    const s = initialState(fixtureUnit);
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('cannot advance from Practice until a choice is recorded', () => {
    let s = advance(fixtureUnit, initialState(fixtureUnit), { type: 'advance' });
    expect(s.currentBeatIndex).toBe(1);
    expect(canAdvance(fixtureUnit, s)).toBe(false);
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('cannot advance from Apply until response meets minWords', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    expect(s.currentBeatIndex).toBe(2);
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three' });
    expect(canAdvance(fixtureUnit, s)).toBe(false); // only 3 words, minWords is 10

    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three four five six seven eight nine ten eleven' });
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('cannot advance from Defend until a rubric score exists', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'one two three four five six seven eight nine ten eleven' });
    s = advance(fixtureUnit, s, { type: 'advance' });
    expect(s.currentBeatIndex).toBe(3);
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'rebuttalWrite', text: 'my rebuttal' });
    expect(canAdvance(fixtureUnit, s)).toBe(false);

    s = advance(fixtureUnit, s, { type: 'rubricScore', score: {
      rubricId: 'r', dimensionScores: {}, total: 18, passed: true, feedback: 'ok',
    }});
    expect(canAdvance(fixtureUnit, s)).toBe(true);
  });

  it('advances through all beats and Capture records a timestamp', () => {
    let s = initialState(fixtureUnit);
    s = advance(fixtureUnit, s, { type: 'advance' });                                   // -> practice
    s = advance(fixtureUnit, s, { type: 'practiceChoose', optionId: 'a' });
    s = advance(fixtureUnit, s, { type: 'advance' });                                   // -> apply
    s = advance(fixtureUnit, s, { type: 'applyWrite', text: 'word '.repeat(12).trim() });
    s = advance(fixtureUnit, s, { type: 'advance' });                                   // -> defend
    s = advance(fixtureUnit, s, { type: 'rebuttalWrite', text: 'r' });
    s = advance(fixtureUnit, s, { type: 'rubricScore', score: {
      rubricId: 'r', dimensionScores: {}, total: 18, passed: true, feedback: 'ok',
    }});
    s = advance(fixtureUnit, s, { type: 'advance' });                                   // -> refine
    s = advance(fixtureUnit, s, { type: 'refineWrite', text: 'refined' });
    s = advance(fixtureUnit, s, { type: 'advance' });                                   // -> capture
    expect(s.currentBeatIndex).toBe(5);
    s = advance(fixtureUnit, s, { type: 'capture' });
    expect(s.capturedAt).not.toBeNull();
  });

  it('advance is a no-op when canAdvance is false', () => {
    const s0 = initialState(fixtureUnit);
    let s = advance(fixtureUnit, s0, { type: 'advance' });       // learn -> practice
    const s2 = advance(fixtureUnit, s, { type: 'advance' });     // should not advance: no choice
    expect(s2.currentBeatIndex).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `npm run test`
Expected: FAIL — "beat-state module not found" or similar.

- [ ] **Step 3: Implement the state machine**

Create `lib/aibi-s/beat-state.ts`:

```ts
import type { Unit, UnitLearnerState, RubricScore, ChatTurn } from './types';

export type Action =
  | { type: 'advance' }
  | { type: 'practiceChoose'; optionId: string }
  | { type: 'applyWrite'; text: string }
  | { type: 'rebuttalWrite'; text: string }
  | { type: 'chatAppend'; turn: ChatTurn }
  | { type: 'rubricScore'; score: RubricScore }
  | { type: 'refineWrite'; text: string }
  | { type: 'capture' };

export function initialState(unit: Unit): UnitLearnerState {
  return {
    unitId: unit.id,
    currentBeatIndex: 0,
    practiceChoice: null,
    applyResponse: '',
    rebuttal: '',
    chatTurns: [],
    rubricScore: null,
    refinedRebuttal: '',
    capturedAt: null,
  };
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function canAdvance(unit: Unit, state: UnitLearnerState): boolean {
  const beat = unit.beats[state.currentBeatIndex];
  if (!beat) return false;
  switch (beat.kind) {
    case 'learn':
      return true;
    case 'practice':
      return state.practiceChoice !== null;
    case 'apply':
      return wordCount(state.applyResponse) >= beat.minWords;
    case 'defend':
      return state.rubricScore !== null;
    case 'refine':
      return state.refinedRebuttal.trim().length > 0;
    case 'capture':
      return state.capturedAt !== null;
  }
}

export function advance(
  unit: Unit,
  state: UnitLearnerState,
  action: Action,
): UnitLearnerState {
  switch (action.type) {
    case 'advance': {
      if (!canAdvance(unit, state)) return state;
      const next = state.currentBeatIndex + 1;
      if (next >= unit.beats.length) return state;
      return { ...state, currentBeatIndex: next };
    }
    case 'practiceChoose':
      return { ...state, practiceChoice: action.optionId };
    case 'applyWrite':
      return { ...state, applyResponse: action.text };
    case 'rebuttalWrite':
      return { ...state, rebuttal: action.text };
    case 'chatAppend':
      return { ...state, chatTurns: [...state.chatTurns, action.turn] };
    case 'rubricScore':
      return { ...state, rubricScore: action.score };
    case 'refineWrite':
      return { ...state, refinedRebuttal: action.text };
    case 'capture':
      return { ...state, capturedAt: new Date().toISOString() };
  }
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test`
Expected: all 7 beat-state tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/aibi-s/beat-state.ts lib/aibi-s/beat-state.test.ts
git commit -m "feat(aibi-s): add 6-beat state machine with test coverage"
```

---

### Task 4: Persona chat turn limiter (TDD)

**Files:**
- Create: `lib/aibi-s/chat-limiter.ts`
- Create: `lib/aibi-s/chat-limiter.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/aibi-s/chat-limiter.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { canContinueChat, nextTurnIndex } from './chat-limiter';
import type { ChatTurn } from './types';

const turn = (role: ChatTurn['role'], idx: number, content = '...'): ChatTurn =>
  ({ role, turnIndex: idx, content });

describe('chat-limiter', () => {
  it('allows the first persona turn when no turns exist', () => {
    expect(canContinueChat([], 3)).toEqual({ allowed: true, nextRole: 'persona' });
  });

  it('requires learner turn after each persona turn', () => {
    const turns = [turn('persona', 1)];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: true, nextRole: 'learner' });
  });

  it('allows next persona turn after a learner response', () => {
    const turns = [turn('persona', 1), turn('learner', 2)];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: true, nextRole: 'persona' });
  });

  it('blocks once maxTurns reached (counting persona prompts only)', () => {
    // 3 persona turns + 3 learner responses = chat exhausted at maxTurns=3
    const turns = [
      turn('persona', 1), turn('learner', 2),
      turn('persona', 3), turn('learner', 4),
      turn('persona', 5), turn('learner', 6),
    ];
    expect(canContinueChat(turns, 3)).toEqual({ allowed: false, nextRole: null });
  });

  it('blocks midway if persona turn count is at max and learner has responded', () => {
    const turns = [
      turn('persona', 1), turn('learner', 2),
      turn('persona', 3), turn('learner', 4),
      turn('persona', 5), turn('learner', 6),
    ];
    expect(canContinueChat(turns, 3).allowed).toBe(false);
  });

  it('nextTurnIndex is 1 for empty transcript', () => {
    expect(nextTurnIndex([])).toBe(1);
  });

  it('nextTurnIndex increments correctly', () => {
    const turns = [turn('persona', 1), turn('learner', 2)];
    expect(nextTurnIndex(turns)).toBe(3);
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the limiter**

Create `lib/aibi-s/chat-limiter.ts`:

```ts
import type { ChatTurn } from './types';

export interface ChatContinuation {
  readonly allowed: boolean;
  readonly nextRole: ChatTurn['role'] | null;
}

export function nextTurnIndex(turns: readonly ChatTurn[]): number {
  return turns.length + 1;
}

export function canContinueChat(
  turns: readonly ChatTurn[],
  maxPersonaTurns: number,
): ChatContinuation {
  const personaCount = turns.filter((t) => t.role === 'persona').length;
  const last = turns[turns.length - 1];

  if (personaCount >= maxPersonaTurns && last?.role === 'learner') {
    return { allowed: false, nextRole: null };
  }
  if (!last) return { allowed: true, nextRole: 'persona' };
  if (last.role === 'persona') return { allowed: true, nextRole: 'learner' };
  return { allowed: true, nextRole: 'persona' };
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test`
Expected: all chat-limiter tests PASS, total test count now matches prior + 7 new.

- [ ] **Step 5: Commit**

```bash
git add lib/aibi-s/chat-limiter.ts lib/aibi-s/chat-limiter.test.ts
git commit -m "feat(aibi-s): add persona-chat turn limiter with tests"
```

---

### Task 5: Rubric schema and AI-judge response parser (TDD)

**Files:**
- Create: `lib/aibi-s/rubric.ts`
- Create: `lib/aibi-s/rubric.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/aibi-s/rubric.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseRubricResponse, buildJudgePrompt } from './rubric';
import type { Rubric } from './types';

const testRubric: Rubric = {
  id: 'dept-head-p1',
  dimensions: [
    { id: 'scope', label: 'Scope clarity', description: '...', maxScore: 4 },
    { id: 'roi', label: 'ROI argument', description: '...', maxScore: 4 },
    { id: 'risk', label: 'Risk acknowledgment', description: '...', maxScore: 4 },
  ],
  passingTotal: 15,
  passingMinPerDimension: 3,
};

describe('rubric', () => {
  it('buildJudgePrompt includes dimension ids and labels', () => {
    const prompt = buildJudgePrompt(testRubric, 'my rebuttal', ['persona: why', 'learner: because']);
    expect(prompt).toContain('scope');
    expect(prompt).toContain('Scope clarity');
    expect(prompt).toContain('roi');
    expect(prompt).toContain('my rebuttal');
    expect(prompt).toContain('persona: why');
  });

  it('parses valid AI-judge JSON response', () => {
    const raw = `Some preamble. \`\`\`json
{
  "dimensionScores": { "scope": 3, "roi": 4, "risk": 2 },
  "feedback": "Solid on ROI, weak on risk."
}
\`\`\` trailing text`;
    const score = parseRubricResponse(raw, testRubric);
    expect(score.dimensionScores).toEqual({ scope: 3, roi: 4, risk: 2 });
    expect(score.total).toBe(9);
    expect(score.passed).toBe(false); // 9 < 15 passingTotal; also risk=2 < 3
    expect(score.feedback).toBe('Solid on ROI, weak on risk.');
  });

  it('passes when total >= passingTotal and no dim below minPerDimension', () => {
    const highRubric: Rubric = { ...testRubric, passingTotal: 8, passingMinPerDimension: 2 };
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 3, "roi": 3, "risk": 2 }, "feedback": "ok" }
\`\`\``;
    const score = parseRubricResponse(raw, highRubric);
    expect(score.total).toBe(8);
    expect(score.passed).toBe(true);
  });

  it('rejects scores outside 0..maxScore', () => {
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 5, "roi": 3, "risk": 3 }, "feedback": "x" }
\`\`\``;
    expect(() => parseRubricResponse(raw, testRubric)).toThrow(/out of range/i);
  });

  it('rejects response missing a dimension', () => {
    const raw = `\`\`\`json
{ "dimensionScores": { "scope": 3, "roi": 3 }, "feedback": "x" }
\`\`\``;
    expect(() => parseRubricResponse(raw, testRubric)).toThrow(/missing dimension/i);
  });

  it('rejects non-JSON garbage', () => {
    expect(() => parseRubricResponse('no json here', testRubric)).toThrow();
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `npm run test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement rubric module**

Create `lib/aibi-s/rubric.ts`:

```ts
import type { Rubric, RubricScore } from './types';

export function buildJudgePrompt(
  rubric: Rubric,
  rebuttal: string,
  chatTranscript: readonly string[],
): string {
  const dimList = rubric.dimensions
    .map((d) => `- "${d.id}" (${d.label}) 0-${d.maxScore}: ${d.description}`)
    .join('\n');

  const transcript = chatTranscript.length
    ? `\n\nFollow-up chat transcript:\n${chatTranscript.join('\n')}`
    : '';

  return `You are grading a banker's written rebuttal (and any follow-up chat) against a rubric. Score each dimension 0-4 based on the rubric definition. Return strict JSON wrapped in a \`\`\`json code block.

Rubric dimensions (id, label, range, description):
${dimList}

Passing rule: total >= ${rubric.passingTotal} AND no single dimension below ${rubric.passingMinPerDimension}.

Written rebuttal to grade:
---
${rebuttal}
---${transcript}

Respond ONLY with JSON in this shape, wrapped in a \`\`\`json code block:
{
  "dimensionScores": { ${rubric.dimensions.map((d) => `"${d.id}": <0-${d.maxScore}>`).join(', ')} },
  "feedback": "<2-4 sentences of substantive feedback>"
}`;
}

interface RawJudgeResponse {
  readonly dimensionScores: Record<string, number>;
  readonly feedback: string;
}

function extractJsonBlock(raw: string): string {
  const match = raw.match(/```json\s*([\s\S]*?)```/);
  if (match) return match[1];
  // fallback: try to find a bare JSON object
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) return raw.slice(first, last + 1);
  throw new Error('No JSON block found in judge response');
}

export function parseRubricResponse(raw: string, rubric: Rubric): RubricScore {
  const json = extractJsonBlock(raw);
  let parsed: RawJudgeResponse;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(`Judge response is not valid JSON: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.dimensionScores) {
    throw new Error('Judge response missing dimensionScores');
  }

  const dimensionScores: Record<string, number> = {};
  let total = 0;
  let minDim = Infinity;

  for (const dim of rubric.dimensions) {
    const score = parsed.dimensionScores[dim.id];
    if (typeof score !== 'number') {
      throw new Error(`Judge response missing dimension: ${dim.id}`);
    }
    if (score < 0 || score > dim.maxScore) {
      throw new Error(`Score for ${dim.id} out of range: ${score}`);
    }
    dimensionScores[dim.id] = score;
    total += score;
    if (score < minDim) minDim = score;
  }

  const passed = total >= rubric.passingTotal && minDim >= rubric.passingMinPerDimension;

  return {
    rubricId: rubric.id,
    dimensionScores,
    total,
    passed,
    feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
  };
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test`
Expected: all rubric tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/aibi-s/rubric.ts lib/aibi-s/rubric.test.ts
git commit -m "feat(aibi-s): add rubric schema and AI-judge response parser"
```

---

### Task 6: Author Unit 1.1 content for /Ops

**Files:**
- Create: `content/courses/aibi-s/ops/unit-1-1.ts`
- Create: `content/courses/aibi-s/ops/persona-dept-head-phase-1.ts`
- Create: `content/courses/aibi-s/ops/index.ts`

- [ ] **Step 1: Author the Department Head Phase I persona content**

Create `content/courses/aibi-s/ops/persona-dept-head-phase-1.ts`:

```ts
import type { DefendBeatPersona } from '@/../lib/aibi-s/types';

export const opsDepartmentHeadPhase1: DefendBeatPersona = {
  id: 'ops-dept-head-p1',
  displayName: 'Department Head — Operations',
  trackCode: 'ops',
  phase: 1,
  maxChatTurns: 3,
  memoMarkdown: `**FROM:** Dana Nguyen, VP Operations
**TO:** [Learner]
**RE:** Your work-audit proposal — three questions before I sign off

Thanks for sending over the audit of our department's recurring workflows. I've read it. I like that you've actually counted hours — most "AI project" pitches I get don't bother. But before I approve you moving into a deployment, three things are bothering me and I want them answered in writing.

1. **Why this workflow first?** You've flagged the weekly exception-report review as your top candidate. I agree it's painful, but it also touches member data and gets eyeballed by Compliance every month. If this goes wrong — if the AI miscategorizes an exception or drops a row — the noise lands on my desk, not yours. Make the case for why the upside here justifies the exposure compared to, say, meeting-summary automation, which has none of the compliance weight.

2. **What's the ROI arithmetic I should take to the CEO?** You said "about 6 hours a week." Six hours of whose time, at what rate, reclaimed to do what? I need a number that survives being repeated in Diane's leadership meeting without anyone reaching for a calculator.

3. **What happens when it breaks?** It will break. At some point the tool will output something weird, or miss a record, or hallucinate a category that doesn't exist in our core. Tell me in plain English what our detection mechanism is, who owns the fix, and what we tell Compliance if it ships a bad output before we catch it.

Keep it tight. One page. I need this before I can put your name on anything.

— Dana`,

  chatSystemPrompt: `You are Dana Nguyen, VP of Operations at a $600M community bank. You are speaking with a department manager (an AiBI-S learner) who has just submitted a written rebuttal to your challenge memo about their proposed AI automation of the weekly exception-report review workflow.

Your personality: plainspoken, busy, values specifics over adjectives. You are not hostile — you want this to succeed — but you are protective of your team and allergic to hand-wavy reasoning. You will absolutely approve a good proposal and will push back hard on a weak one.

Your goals in this follow-up conversation:
1. Probe the learner's SPECIFIC answers, not generic ones. Pick the weakest one and ask a sharper follow-up.
2. Prefer concrete numbers over abstractions. "Hours saved" needs a rate. "HITL checkpoint" needs a person and a cadence.
3. If they dodge a question, name the dodge. If they show real thought, acknowledge it and move on.
4. Never lecture. Never monologue. One question at a time. 1-3 sentences per turn.

Track: Operations. This is a department-level conversation, NOT an Examiner-level or Board-level one. Stay in the operations domain — scope, adoption, measurable throughput, colleague trust, Compliance handoff. Do NOT bring up SR 11-7 model validation frameworks, ECOA disparate-impact analysis, or board-governance topics — those are out of scope for a Department Head at this stage.

You will have at most 3 turns in this conversation before the learner's performance is graded. Make them count.`,

  rubric: {
    id: 'ops-dept-head-p1',
    dimensions: [
      { id: 'scope', label: 'Scope clarity', description: 'Did the learner make a specific, defensible case for why THIS workflow first, acknowledging the compliance exposure relative to lower-stakes candidates?', maxScore: 4 },
      { id: 'roi', label: 'ROI arithmetic', description: 'Did the learner produce a number that survives scrutiny: hours × specific rate × frequency, with a plausible use for the reclaimed time?', maxScore: 4 },
      { id: 'failure-mode', label: 'Failure-mode plan', description: 'Did the learner name a detection mechanism, an owner for the fix, and a specific escalation path to Compliance?', maxScore: 4 },
      { id: 'defense-quality', label: 'Defense coherence', description: 'Did the learner hold up under Dana\'s follow-up probes: specific responses, no hedging, direct engagement with objections?', maxScore: 4 },
      { id: 'tone', label: 'Professional tone', description: 'Did the learner communicate as a peer to a Department Head — confident, specific, not defensive or over-apologetic?', maxScore: 4 },
    ],
    passingTotal: 15,
    passingMinPerDimension: 3,
  },
};
```

- [ ] **Step 2: Author the Unit 1.1 content**

Create `content/courses/aibi-s/ops/unit-1-1.ts`:

```ts
import type { Unit } from '@/../lib/aibi-s/types';
import { opsDepartmentHeadPhase1 } from './persona-dept-head-phase-1';

export const opsUnit1_1: Unit = {
  id: '1.1',
  trackCode: 'ops',
  phase: 1,
  title: 'From Personal Skills to Institutional Assets',
  summary: 'The shift from personal AI productivity to institutional AI capability. You arrive with a skill. You leave with a skill that can be deployed, measured, and handed off.',
  beats: [
    // --- LEARN ----------------------------------------------------------
    {
      kind: 'learn',
      title: 'The shift from personal to institutional',
      body: `In AiBI-P you built a skill that makes **one person faster** — you. That skill lives in your personal account, has the documentation you wrote for yourself, and would disappear if you left the institution tomorrow.

AiBI-S starts at a different question: *how do you make your department faster?*

The answer is not "give everyone my skill." That would be like solving the department's Excel problem by emailing everyone your personal spreadsheet. You'd create:
- **Version drift.** Ten people, ten slightly different copies. Three months in, nobody knows which one is current.
- **Data-handling risk.** Your personal skill may have been fine for your own workflow. Your colleagues will paste things you never would.
- **Single point of failure.** If you leave, the whole thing goes with you.

The institutional version requires governance, documentation, versioning, ownership, and measurement. This unit introduces each — and this week you will begin **auditing your department's work** to find the one workflow that's worth deploying a real skill against.`,
      workedExample: `**Worked example.** A Compliance Officer at a $400M credit union built a personal NotebookLM skill for navigating their policy library. It saved her an hour a week. She told three colleagues about it, and within a month, two of them were pasting member PII (Tier 3) into their own NotebookLM accounts trying to replicate it — because her workflow documentation was three bullet points in a Teams message.

The skill itself was good. The deployment was a shadow-AI incident waiting to be written up. AiBI-S is the difference between those two things.`,
      hooks: {
        pillar: 'A',
        frameworks: ['AIEOG'],
        dataTiers: [2],
      },
    },

    // --- PRACTICE (decision sim: data-tier classification) -------------
    {
      kind: 'practice',
      simKind: 'decision',
      scenario: `You are the Operations Manager for a community bank. Your team runs a weekly exception-report review. Today's queue includes 14 rows. Two of the rows contain a member's full account number, routing number, and name. Four rows contain institution-internal process codes not visible to members. The remaining eight rows contain dollar amounts and generic product descriptions visible on public rate sheets.

You're considering pasting the entire 14-row report into your institution-sanctioned Copilot environment to get a summary.`,
      question: 'What data tier governs this workflow, and what must you do before any AI processing?',
      options: [
        {
          id: 'opt-tier-1',
          label: 'Tier 1 (public). Paste the whole report — rate data is published.',
          isCorrect: false,
          feedback: 'Incorrect. The PRESENCE of Tier 3 data in two rows makes the whole package Tier 3, regardless of what surrounds it. The highest-tier element governs.',
          consequenceIfWrong: 'In a real incident, this becomes a shadow-AI write-up: member PII entered into an AI system without the required redaction step. Under the AIEOG lexicon this is an "AI use case" that must be in the institutional inventory with explicit data-handling controls.',
        },
        {
          id: 'opt-tier-2',
          label: 'Tier 2 (internal). Paste it — Copilot is our sanctioned platform.',
          isCorrect: false,
          feedback: 'Incorrect. Sanctioned-platform status is necessary but not sufficient. The data classification is about what is IN the payload, not where it goes. Two rows contain member account identifiers, which is Tier 3.',
          consequenceIfWrong: 'Sanctioned platforms can still create compliance exposure if they ingest Tier 3 data outside an approved use case. Your Compliance Liaison will ask whether this specific use case is in the inventory and what TPRM due diligence has been done on the vendor\'s AI-data-handling terms.',
        },
        {
          id: 'opt-tier-3-redact',
          label: 'Tier 3 (restricted). Redact account and routing numbers first, then paste the redacted report.',
          isCorrect: true,
          feedback: 'Correct. The two PII rows make the whole workflow Tier 3. Tier 3 requires either (a) explicit institutional approval of an AI-data-handling agreement covering this use case, or (b) redaction to Tier 2 before processing. Redaction is the right first step for a departmental automation you haven\'t yet governed through the full institutional approval flow.',
        },
        {
          id: 'opt-tier-3-block',
          label: 'Tier 3 (restricted). Do not use AI for this workflow at all.',
          isCorrect: false,
          feedback: 'Partially correct on the classification, wrong on the action. Blanket "no AI for Tier 3" is a common over-correction that blocks legitimate, well-governed use cases. The right default is tier the data, redact what you can, and document what you cannot — then evaluate whether the residual is worth the workflow.',
          consequenceIfWrong: 'An Ops department that defaults to "no AI" for any workflow touching Tier 3 data will miss most of its real automation opportunities. AiBI-S is about deploying responsibly, not avoiding.',
        },
      ],
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [3],
      },
    },

    // --- APPLY ---------------------------------------------------------
    {
      kind: 'apply',
      prompt: `Identify ONE recurring workflow in YOUR actual department — one you'd like to pilot for AI automation.

Write 4–6 sentences covering:
- What the workflow is (name it and describe it in two sentences)
- Who does it today and how often
- Roughly how long it takes per occurrence
- Which data tier(s) are involved and any redaction you'd need to do
- Why you think it's the right first candidate (vs. something lower-risk)`,
      guidance: `A good response is specific. "The weekly funding-exception review" is specific. "Meeting notes" is not. You'll use this workflow in the next beat to defend your choice to your Department Head — so pick something real.`,
      minWords: 60,
    },

    // --- DEFEND --------------------------------------------------------
    {
      kind: 'defend',
      persona: opsDepartmentHeadPhase1,
      hooks: {
        pillar: 'B',
        frameworks: ['AIEOG', 'Interagency TPRM'],
        dataTiers: [2, 3],
      },
    },

    // --- REFINE --------------------------------------------------------
    {
      kind: 'refine',
      guidance: `You've seen how Dana graded your rebuttal. Rewrite it now, applying the feedback. The refined version is what gets captured into your AiBI-S portfolio as the defended artifact for this unit — so make it the version you'd be comfortable actually sending.`,
    },

    // --- CAPTURE -------------------------------------------------------
    {
      kind: 'capture',
      artifactLabel: 'Unit 1.1 — /Ops — Defended departmental-automation proposal',
    },
  ],
};
```

- [ ] **Step 3: Create /Ops index**

Create `content/courses/aibi-s/ops/index.ts`:

```ts
export { opsUnit1_1 } from './unit-1-1';
export { opsDepartmentHeadPhase1 } from './persona-dept-head-phase-1';

import { opsUnit1_1 } from './unit-1-1';

export const opsUnits = {
  '1.1': opsUnit1_1,
} as const;
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add content/courses/aibi-s/ops/
git commit -m "content(aibi-s): author /Ops Unit 1.1 with Dept Head Phase I persona"
```

---

### Task 7: Claude API route for persona chat

**Files:**
- Create: `src/app/api/aibi-s/chat/route.ts`

- [ ] **Step 1: Implement the chat route**

Create `src/app/api/aibi-s/chat/route.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { canContinueChat } from '../../../../../lib/aibi-s/chat-limiter';
import type { ChatTurn } from '../../../../../lib/aibi-s/types';
import { opsUnit1_1 } from '../../../../../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ChatRequestBody {
  readonly unitId: string;          // e.g., '1.1'
  readonly trackCode: 'ops';        // prototype: only ops
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

interface ChatResponseBody {
  readonly personaTurn: ChatTurn;
  readonly allowMoreTurns: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponseBody | { error: string }>> {
  const body = (await req.json()) as ChatRequestBody;

  if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
    return NextResponse.json({ error: 'Unit/track not supported in prototype' }, { status: 400 });
  }

  const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
  if (!defendBeat || defendBeat.kind !== 'defend') {
    return NextResponse.json({ error: 'Defend beat not found' }, { status: 500 });
  }
  const persona = defendBeat.persona;

  const continuation = canContinueChat(body.turns, persona.maxChatTurns);
  if (!continuation.allowed || continuation.nextRole !== 'persona') {
    return NextResponse.json({ error: 'Chat exhausted' }, { status: 409 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build the message history for Claude.
  // Seed the conversation with the rebuttal and any prior turns.
  const messages: Anthropic.MessageParam[] = [];
  messages.push({
    role: 'user',
    content: `This is the learner's written rebuttal to your challenge memo:\n\n---\n${body.rebuttal}\n---`,
  });
  for (const turn of body.turns) {
    messages.push({
      role: turn.role === 'persona' ? 'assistant' : 'user',
      content: turn.content,
    });
  }

  const resp = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 400,
    system: persona.chatSystemPrompt,
    messages,
  });

  const textBlock = resp.content.find((b) => b.type === 'text');
  const content = textBlock && textBlock.type === 'text' ? textBlock.text : '';

  const nextIndex = body.turns.length + 1;
  const personaTurn: ChatTurn = {
    role: 'persona',
    content,
    turnIndex: nextIndex,
  };

  // After THIS persona turn plus a future learner turn, check whether another round is allowed.
  const hypothetical: ChatTurn[] = [
    ...body.turns,
    personaTurn,
    { role: 'learner', turnIndex: nextIndex + 1, content: '' },
  ];
  const afterLearnerContinuation = canContinueChat(hypothetical, persona.maxChatTurns);

  return NextResponse.json({
    personaTurn,
    allowMoreTurns: afterLearnerContinuation.allowed,
  });
}
```

- [ ] **Step 2: Add ANTHROPIC_API_KEY to .env.local (note for engineer)**

The .env.local file is not committed. Confirm with the user that `ANTHROPIC_API_KEY` is already set; if not, have them add it before running the route. Do not attempt to edit .env.local programmatically.

Run: `grep -c ANTHROPIC_API_KEY .env.local 2>/dev/null || echo 0`
Expected: returns `1` (key present). If `0`, stop and request the user add the key.

- [ ] **Step 3: Verify the route type-checks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/aibi-s/chat/route.ts
git commit -m "feat(aibi-s): add persona-chat API route with turn limiting"
```

---

### Task 8: Claude API route for rubric grading

**Files:**
- Create: `src/app/api/aibi-s/grade/route.ts`

- [ ] **Step 1: Implement the grade route**

Create `src/app/api/aibi-s/grade/route.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { buildJudgePrompt, parseRubricResponse } from '../../../../../lib/aibi-s/rubric';
import type { ChatTurn, RubricScore } from '../../../../../lib/aibi-s/types';
import { opsUnit1_1 } from '../../../../../content/courses/aibi-s/ops/unit-1-1';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface GradeRequestBody {
  readonly unitId: string;
  readonly trackCode: 'ops';
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
}

export async function POST(req: NextRequest): Promise<NextResponse<RubricScore | { error: string }>> {
  const body = (await req.json()) as GradeRequestBody;

  if (body.unitId !== '1.1' || body.trackCode !== 'ops') {
    return NextResponse.json({ error: 'Unit/track not supported in prototype' }, { status: 400 });
  }

  const defendBeat = opsUnit1_1.beats.find((b) => b.kind === 'defend');
  if (!defendBeat || defendBeat.kind !== 'defend') {
    return NextResponse.json({ error: 'Defend beat not found' }, { status: 500 });
  }

  const transcript = body.turns.map((t) => `${t.role}: ${t.content}`);
  const prompt = buildJudgePrompt(defendBeat.persona.rubric, body.rebuttal, transcript);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const resp = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1000,
    system: 'You are a strict but fair grader. Respond ONLY with the requested JSON.',
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = resp.content.find((b) => b.type === 'text');
  const raw = textBlock && textBlock.type === 'text' ? textBlock.text : '';

  let score: RubricScore;
  try {
    score = parseRubricResponse(raw, defendBeat.persona.rubric);
  } catch (err) {
    return NextResponse.json({ error: `Grading parse failed: ${(err as Error).message}` }, { status: 502 });
  }

  return NextResponse.json(score);
}
```

- [ ] **Step 2: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/aibi-s/grade/route.ts
git commit -m "feat(aibi-s): add rubric-grading API route with AI judge"
```

---

### Task 9: Beat components (LearnBeat · PracticeBeat · ApplyBeat · RefineBeat · CaptureBeat)

**Files:**
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/LearnBeat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PracticeBeat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/ApplyBeat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RefineBeat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/CaptureBeat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/FrameworkHooks.tsx`

- [ ] **Step 1: FrameworkHooks display**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/FrameworkHooks.tsx`:

```tsx
import type { UnitFrameworkHooks } from '@/../lib/aibi-s/types';

export function FrameworkHooks({ hooks }: { readonly hooks: UnitFrameworkHooks }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs font-mono text-[color:var(--color-ink)]/70 border border-[color:var(--color-ink)]/10 rounded px-3 py-2 bg-[color:var(--color-parch)]">
      <span className="font-semibold">Pillar {hooks.pillar}</span>
      {hooks.frameworks.length > 0 && (
        <span>· {hooks.frameworks.join(', ')}</span>
      )}
      {hooks.dataTiers.length > 0 && (
        <span>· Tier {hooks.dataTiers.join('/')}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: LearnBeat**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/LearnBeat.tsx`:

```tsx
'use client';

import type { LearnBeatContent } from '@/../lib/aibi-s/types';
import { FrameworkHooks } from './FrameworkHooks';

export function LearnBeat({
  beat,
  onAdvance,
}: {
  readonly beat: LearnBeatContent;
  readonly onAdvance: () => void;
}) {
  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">{beat.title}</h2>
      <div className="prose prose-slate max-w-none whitespace-pre-wrap">{beat.body}</div>
      {beat.workedExample && (
        <aside className="border-l-2 border-[color:var(--color-cobalt)] pl-4 bg-[color:var(--color-parch)] p-4 whitespace-pre-wrap">
          {beat.workedExample}
        </aside>
      )}
      <button
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
      >
        Continue to Practice →
      </button>
    </section>
  );
}
```

- [ ] **Step 3: PracticeBeat (decision sim)**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PracticeBeat.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { PracticeBeatContent } from '@/../lib/aibi-s/types';
import { FrameworkHooks } from './FrameworkHooks';

export function PracticeBeat({
  beat,
  selectedOptionId,
  onChoose,
  onAdvance,
}: {
  readonly beat: PracticeBeatContent;
  readonly selectedOptionId: string | null;
  readonly onChoose: (id: string) => void;
  readonly onAdvance: () => void;
}) {
  const [revealed, setRevealed] = useState<boolean>(selectedOptionId !== null);
  const chosen = beat.options.find((o) => o.id === selectedOptionId);

  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">Practice: data-tier classification</h2>
      <div className="whitespace-pre-wrap">{beat.scenario}</div>
      <p className="font-semibold">{beat.question}</p>
      <ul className="space-y-3">
        {beat.options.map((opt) => {
          const isSelected = opt.id === selectedOptionId;
          return (
            <li key={opt.id}>
              <button
                disabled={revealed}
                onClick={() => { onChoose(opt.id); setRevealed(true); }}
                className={`w-full text-left p-4 border rounded transition
                  ${isSelected
                    ? opt.isCorrect
                      ? 'border-[color:var(--color-sage)] bg-[color:var(--color-sage)]/10'
                      : 'border-[color:var(--color-error)] bg-[color:var(--color-error)]/5'
                    : 'border-[color:var(--color-ink)]/20 hover:border-[color:var(--color-cobalt)]'}
                  ${revealed && !isSelected ? 'opacity-50' : ''}`}
              >
                {opt.label}
              </button>
              {isSelected && revealed && (
                <div className="mt-2 p-3 bg-[color:var(--color-parch)] text-sm space-y-2">
                  <p>{opt.feedback}</p>
                  {opt.consequenceIfWrong && !opt.isCorrect && (
                    <p className="text-[color:var(--color-error)]">
                      <strong>Consequence: </strong>{opt.consequenceIfWrong}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {chosen && (
        <button
          onClick={onAdvance}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
        >
          {chosen.isCorrect ? 'Continue to Apply →' : 'Try again from here — or continue anyway →'}
        </button>
      )}
    </section>
  );
}
```

- [ ] **Step 4: ApplyBeat**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/ApplyBeat.tsx`:

```tsx
'use client';

import type { ApplyBeatContent } from '@/../lib/aibi-s/types';

export function ApplyBeat({
  beat,
  value,
  onChange,
  onAdvance,
  canAdvance,
}: {
  readonly beat: ApplyBeatContent;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onAdvance: () => void;
  readonly canAdvance: boolean;
}) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Apply it to your department</h2>
      <div className="whitespace-pre-wrap">{beat.prompt}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full p-4 border rounded font-sans"
        placeholder="Write 4-6 sentences..."
      />
      <p className="text-sm text-[color:var(--color-ink)]/60">
        {words} / {beat.minWords} words minimum
      </p>
      <p className="text-sm italic">{beat.guidance}</p>
      <button
        disabled={!canAdvance}
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
      >
        Continue to Defend →
      </button>
    </section>
  );
}
```

- [ ] **Step 5: RefineBeat**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RefineBeat.tsx`:

```tsx
'use client';

import type { RefineBeatContent, RubricScore } from '@/../lib/aibi-s/types';

export function RefineBeat({
  beat,
  originalRebuttal,
  score,
  refined,
  onRefine,
  onAdvance,
  canAdvance,
}: {
  readonly beat: RefineBeatContent;
  readonly originalRebuttal: string;
  readonly score: RubricScore;
  readonly refined: string;
  readonly onRefine: (v: string) => void;
  readonly onAdvance: () => void;
  readonly canAdvance: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Refine</h2>
      <p>{beat.guidance}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold mb-1">Your original rebuttal</p>
          <div className="p-3 border rounded whitespace-pre-wrap text-sm bg-[color:var(--color-parch)]">
            {originalRebuttal}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Feedback</p>
          <div className="p-3 border rounded text-sm bg-[color:var(--color-parch)]">
            {score.feedback}
          </div>
        </div>
      </div>

      <textarea
        value={refined}
        onChange={(e) => onRefine(e.target.value)}
        rows={10}
        className="w-full p-4 border rounded font-sans"
        placeholder="Rewrite your rebuttal, applying the feedback..."
      />

      <button
        disabled={!canAdvance}
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
      >
        Capture defended artifact →
      </button>
    </section>
  );
}
```

- [ ] **Step 6: CaptureBeat**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/_components/CaptureBeat.tsx`:

```tsx
'use client';

import type { CaptureBeatContent, UnitLearnerState } from '@/../lib/aibi-s/types';

export function CaptureBeat({
  beat,
  state,
  onCapture,
  captured,
}: {
  readonly beat: CaptureBeatContent;
  readonly state: UnitLearnerState;
  readonly onCapture: () => void;
  readonly captured: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Capture</h2>
      <p>This is what will be added to your AiBI-S portfolio:</p>
      <div className="p-4 border rounded bg-[color:var(--color-parch)] space-y-2 font-mono text-sm">
        <p><strong>Artifact:</strong> {beat.artifactLabel}</p>
        <p><strong>Practice choice:</strong> {state.practiceChoice ?? '—'}</p>
        <p><strong>Apply response:</strong> {state.applyResponse.slice(0, 200)}…</p>
        <p><strong>Rubric total:</strong> {state.rubricScore?.total} / 20</p>
        <p><strong>Passed:</strong> {state.rubricScore?.passed ? 'Yes' : 'No'}</p>
        <p><strong>Refined rebuttal length:</strong> {state.refinedRebuttal.length} chars</p>
      </div>
      {!captured ? (
        <button
          onClick={onCapture}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded hover:opacity-90"
        >
          Capture to portfolio
        </button>
      ) : (
        <p className="text-[color:var(--color-sage)] font-semibold">
          ✓ Captured at {state.capturedAt}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 7: Verify all beat components type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/courses/aibi-s/ops/unit/
git commit -m "feat(aibi-s): add Learn/Practice/Apply/Refine/Capture beat components"
```

---

### Task 10: Defend beat components (PersonaMemo · RebuttalEditor · PersonaChat · RubricScore · DefendBeat orchestrator)

**Files:**
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PersonaMemo.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RebuttalEditor.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/PersonaChat.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/RubricScore.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/DefendBeat.tsx`

- [ ] **Step 1: PersonaMemo**

Create `PersonaMemo.tsx`:

```tsx
'use client';

import type { DefendBeatPersona } from '@/../lib/aibi-s/types';

export function PersonaMemo({ persona }: { readonly persona: DefendBeatPersona }) {
  return (
    <article className="p-6 border-l-4 border-[color:var(--color-cobalt)] bg-[color:var(--color-parch)] font-serif">
      <header className="text-xs font-sans uppercase tracking-wide text-[color:var(--color-ink)]/60 mb-2">
        Challenge Memo · {persona.displayName}
      </header>
      <div className="whitespace-pre-wrap text-[color:var(--color-ink)]">
        {persona.memoMarkdown}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: RebuttalEditor**

Create `RebuttalEditor.tsx`:

```tsx
'use client';

export function RebuttalEditor({
  value,
  onChange,
  onSubmit,
  submitted,
}: {
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly submitted: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="block font-semibold">Your written rebuttal</label>
      <textarea
        disabled={submitted}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        className="w-full p-4 border rounded font-sans"
        placeholder="Address the three questions one at a time. Be specific."
      />
      {!submitted && (
        <button
          disabled={value.trim().length < 50}
          onClick={onSubmit}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
        >
          Submit rebuttal — open the probe
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: PersonaChat**

Create `PersonaChat.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { ChatTurn, DefendBeatPersona } from '@/../lib/aibi-s/types';
import { canContinueChat } from '@/../lib/aibi-s/chat-limiter';

export function PersonaChat({
  persona,
  rebuttal,
  turns,
  onAppend,
  onGrade,
}: {
  readonly persona: DefendBeatPersona;
  readonly rebuttal: string;
  readonly turns: readonly ChatTurn[];
  readonly onAppend: (t: ChatTurn) => void;
  readonly onGrade: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const continuation = canContinueChat(turns, persona.maxChatTurns);
  const exhausted = !continuation.allowed;
  const firstPersonaFetchNeeded = turns.length === 0;

  async function fetchPersonaTurn(history: readonly ChatTurn[]) {
    setLoading(true);
    setErr(null);
    try {
      const resp = await fetch('/api/aibi-s/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unitId: '1.1', trackCode: 'ops', rebuttal, turns: history }),
      });
      if (!resp.ok) throw new Error((await resp.json()).error ?? 'Chat failed');
      const data = (await resp.json()) as { personaTurn: ChatTurn; allowMoreTurns: boolean };
      onAppend(data.personaTurn);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function sendLearnerTurn() {
    if (!draft.trim()) return;
    const t: ChatTurn = { role: 'learner', content: draft, turnIndex: turns.length + 1 };
    onAppend(t);
    setDraft('');
    const next = [...turns, t];
    const c = canContinueChat(next, persona.maxChatTurns);
    if (c.allowed && c.nextRole === 'persona') await fetchPersonaTurn(next);
  }

  return (
    <div className="space-y-4 border rounded p-4">
      <header className="flex items-center justify-between">
        <h3 className="font-semibold">Probe from {persona.displayName}</h3>
        <span className="text-xs text-[color:var(--color-ink)]/60">
          {turns.filter((t) => t.role === 'persona').length} / {persona.maxChatTurns} persona turns
        </span>
      </header>

      <ol className="space-y-3">
        {turns.map((t, i) => (
          <li
            key={i}
            className={`p-3 rounded ${t.role === 'persona'
              ? 'bg-[color:var(--color-cobalt)]/5 border-l-2 border-[color:var(--color-cobalt)]'
              : 'bg-white border-l-2 border-[color:var(--color-ink)]/20'}`}
          >
            <p className="text-xs uppercase tracking-wide mb-1 text-[color:var(--color-ink)]/50">
              {t.role === 'persona' ? persona.displayName : 'You'}
            </p>
            <p className="whitespace-pre-wrap">{t.content}</p>
          </li>
        ))}
      </ol>

      {err && <p className="text-[color:var(--color-error)] text-sm">{err}</p>}

      {firstPersonaFetchNeeded && !loading && (
        <button
          onClick={() => fetchPersonaTurn([])}
          className="px-4 py-2 bg-[color:var(--color-cobalt)] text-white rounded"
        >
          Open the probe
        </button>
      )}

      {!exhausted && turns.length > 0 && continuation.nextRole === 'learner' && !loading && (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded"
            placeholder="Respond to the question..."
          />
          <button
            disabled={!draft.trim()}
            onClick={sendLearnerTurn}
            className="px-4 py-2 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40"
          >
            Send response
          </button>
        </div>
      )}

      {loading && <p className="text-sm italic">…thinking</p>}

      {exhausted && (
        <button
          onClick={onGrade}
          className="px-6 py-3 bg-[color:var(--color-sage)] text-white rounded"
        >
          Probe complete — grade my defense
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: RubricScore display**

Create `RubricScore.tsx`:

```tsx
'use client';

import type { RubricScore as ScoreT, Rubric } from '@/../lib/aibi-s/types';

export function RubricScore({
  rubric,
  score,
  onContinue,
}: {
  readonly rubric: Rubric;
  readonly score: ScoreT;
  readonly onContinue: () => void;
}) {
  return (
    <div className="space-y-4 border rounded p-4 bg-[color:var(--color-parch)]">
      <h3 className="font-serif text-2xl">
        {score.passed ? 'Passed' : 'Work to do'} — {score.total} / 20
      </h3>
      <ul className="space-y-2">
        {rubric.dimensions.map((d) => {
          const v = score.dimensionScores[d.id] ?? 0;
          return (
            <li key={d.id} className="flex justify-between">
              <span>{d.label}</span>
              <span className={`font-mono ${v < rubric.passingMinPerDimension ? 'text-[color:var(--color-error)]' : ''}`}>
                {v} / {d.maxScore}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="italic text-sm">{score.feedback}</p>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded"
      >
        Continue to Refine →
      </button>
    </div>
  );
}
```

- [ ] **Step 5: DefendBeat orchestrator**

Create `DefendBeat.tsx`:

```tsx
'use client';

import { useState } from 'react';
import type { DefendBeatContent, ChatTurn, RubricScore } from '@/../lib/aibi-s/types';
import { PersonaMemo } from './PersonaMemo';
import { RebuttalEditor } from './RebuttalEditor';
import { PersonaChat } from './PersonaChat';
import { RubricScore as RubricScoreView } from './RubricScore';
import { FrameworkHooks } from './FrameworkHooks';

type Phase = 'memo' | 'rebuttal' | 'chat' | 'grading' | 'scored';

export function DefendBeat({
  beat,
  rebuttal,
  onRebuttalChange,
  turns,
  onAppendTurn,
  score,
  onScore,
  onAdvance,
}: {
  readonly beat: DefendBeatContent;
  readonly rebuttal: string;
  readonly onRebuttalChange: (v: string) => void;
  readonly turns: readonly ChatTurn[];
  readonly onAppendTurn: (t: ChatTurn) => void;
  readonly score: RubricScore | null;
  readonly onScore: (s: RubricScore) => void;
  readonly onAdvance: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(score ? 'scored' : 'memo');
  const [err, setErr] = useState<string | null>(null);

  async function requestGrade() {
    setPhase('grading');
    setErr(null);
    try {
      const resp = await fetch('/api/aibi-s/grade', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ unitId: '1.1', trackCode: 'ops', rebuttal, turns }),
      });
      if (!resp.ok) throw new Error((await resp.json()).error ?? 'Grading failed');
      const s = (await resp.json()) as RubricScore;
      onScore(s);
      setPhase('scored');
    } catch (e) {
      setErr((e as Error).message);
      setPhase('chat');
    }
  }

  return (
    <section className="space-y-6">
      <FrameworkHooks hooks={beat.hooks} />
      <h2 className="font-serif text-3xl">Defend</h2>
      <PersonaMemo persona={beat.persona} />

      {phase === 'memo' && (
        <button
          onClick={() => setPhase('rebuttal')}
          className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded"
        >
          Write my rebuttal
        </button>
      )}

      {(phase === 'rebuttal' || phase === 'chat' || phase === 'grading' || phase === 'scored') && (
        <RebuttalEditor
          value={rebuttal}
          onChange={onRebuttalChange}
          onSubmit={() => setPhase('chat')}
          submitted={phase !== 'rebuttal'}
        />
      )}

      {(phase === 'chat' || phase === 'grading' || phase === 'scored') && (
        <PersonaChat
          persona={beat.persona}
          rebuttal={rebuttal}
          turns={turns}
          onAppend={onAppendTurn}
          onGrade={requestGrade}
        />
      )}

      {phase === 'grading' && <p className="italic">Grading your defense…</p>}

      {err && <p className="text-[color:var(--color-error)]">{err}</p>}

      {phase === 'scored' && score && (
        <RubricScoreView rubric={beat.persona.rubric} score={score} onContinue={onAdvance} />
      )}
    </section>
  );
}
```

- [ ] **Step 6: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/courses/aibi-s/ops/unit/[unitId]/_components/
git commit -m "feat(aibi-s): add Defend beat (memo + rebuttal + chat + rubric)"
```

---

### Task 11: UnitRenderer orchestrator and unit page

**Files:**
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/_components/UnitRenderer.tsx`
- Create: `src/app/courses/aibi-s/ops/unit/[unitId]/page.tsx`
- Create: `lib/aibi-s/persist.ts`

- [ ] **Step 1: localStorage persistence helper**

Create `lib/aibi-s/persist.ts`:

```ts
import type { UnitLearnerState } from './types';

const PREFIX = 'aibi-s:prototype:unit:';

export function loadUnitState(unitId: string): UnitLearnerState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PREFIX + unitId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UnitLearnerState;
  } catch {
    return null;
  }
}

export function saveUnitState(state: UnitLearnerState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFIX + state.unitId, JSON.stringify(state));
}

export function clearUnitState(unitId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + unitId);
}
```

- [ ] **Step 2: UnitRenderer**

Create `UnitRenderer.tsx`:

```tsx
'use client';

import { useEffect, useReducer } from 'react';
import type { Unit, UnitLearnerState, ChatTurn, RubricScore } from '@/../lib/aibi-s/types';
import { advance, initialState, canAdvance, type Action } from '@/../lib/aibi-s/beat-state';
import { loadUnitState, saveUnitState, clearUnitState } from '@/../lib/aibi-s/persist';
import { LearnBeat } from './LearnBeat';
import { PracticeBeat } from './PracticeBeat';
import { ApplyBeat } from './ApplyBeat';
import { DefendBeat } from './DefendBeat';
import { RefineBeat } from './RefineBeat';
import { CaptureBeat } from './CaptureBeat';

function reducer(state: UnitLearnerState, action: { unit: Unit; action: Action }): UnitLearnerState {
  return advance(action.unit, state, action.action);
}

export function UnitRenderer({ unit }: { readonly unit: Unit }) {
  const saved = typeof window !== 'undefined' ? loadUnitState(unit.id) : null;
  const [state, dispatch] = useReducer(reducer, saved ?? initialState(unit));

  useEffect(() => { saveUnitState(state); }, [state]);

  const beat = unit.beats[state.currentBeatIndex];
  const mayAdvance = canAdvance(unit, state);

  const doAction = (a: Action) => dispatch({ unit, action: a });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <header className="flex justify-between items-baseline">
        <h1 className="font-serif text-4xl">{unit.title}</h1>
        <span className="text-xs font-mono text-[color:var(--color-ink)]/60">
          Beat {state.currentBeatIndex + 1} / {unit.beats.length}
        </span>
      </header>
      <p className="text-lg italic">{unit.summary}</p>

      {beat.kind === 'learn' && (
        <LearnBeat beat={beat} onAdvance={() => doAction({ type: 'advance' })} />
      )}
      {beat.kind === 'practice' && (
        <PracticeBeat
          beat={beat}
          selectedOptionId={state.practiceChoice}
          onChoose={(id) => doAction({ type: 'practiceChoose', optionId: id })}
          onAdvance={() => doAction({ type: 'advance' })}
        />
      )}
      {beat.kind === 'apply' && (
        <ApplyBeat
          beat={beat}
          value={state.applyResponse}
          onChange={(v) => doAction({ type: 'applyWrite', text: v })}
          onAdvance={() => doAction({ type: 'advance' })}
          canAdvance={mayAdvance}
        />
      )}
      {beat.kind === 'defend' && (
        <DefendBeat
          beat={beat}
          rebuttal={state.rebuttal}
          onRebuttalChange={(v) => doAction({ type: 'rebuttalWrite', text: v })}
          turns={state.chatTurns}
          onAppendTurn={(t: ChatTurn) => doAction({ type: 'chatAppend', turn: t })}
          score={state.rubricScore}
          onScore={(s: RubricScore) => doAction({ type: 'rubricScore', score: s })}
          onAdvance={() => doAction({ type: 'advance' })}
        />
      )}
      {beat.kind === 'refine' && state.rubricScore && (
        <RefineBeat
          beat={beat}
          originalRebuttal={state.rebuttal}
          score={state.rubricScore}
          refined={state.refinedRebuttal}
          onRefine={(v) => doAction({ type: 'refineWrite', text: v })}
          onAdvance={() => doAction({ type: 'advance' })}
          canAdvance={mayAdvance}
        />
      )}
      {beat.kind === 'capture' && (
        <CaptureBeat
          beat={beat}
          state={state}
          onCapture={() => doAction({ type: 'capture' })}
          captured={state.capturedAt !== null}
        />
      )}

      <footer className="pt-8 border-t border-[color:var(--color-ink)]/10">
        <button
          onClick={() => { if (confirm('Clear your progress for this unit?')) { clearUnitState(unit.id); window.location.reload(); } }}
          className="text-xs text-[color:var(--color-ink)]/50 hover:underline"
        >
          Reset unit progress (prototype only)
        </button>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Unit page**

Create `src/app/courses/aibi-s/ops/unit/[unitId]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { opsUnits } from '@/../content/courses/aibi-s/ops';
import { UnitRenderer } from './_components/UnitRenderer';

interface UnitPageProps {
  readonly params: { readonly unitId: string };
}

export default function UnitPage({ params }: UnitPageProps) {
  const unit = opsUnits[params.unitId as keyof typeof opsUnits];
  if (!unit) return notFound();
  return <UnitRenderer unit={unit} />;
}
```

- [ ] **Step 4: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/courses/aibi-s/ops/unit/[unitId]/page.tsx src/app/courses/aibi-s/ops/unit/[unitId]/_components/UnitRenderer.tsx lib/aibi-s/persist.ts
git commit -m "feat(aibi-s): wire UnitRenderer orchestrator with localStorage persistence"
```

---

### Task 12: /Ops track overview page

**Files:**
- Create: `src/app/courses/aibi-s/ops/page.tsx`

- [ ] **Step 1: Track overview page**

Create `src/app/courses/aibi-s/ops/page.tsx`:

```tsx
import Link from 'next/link';
import { opsUnits } from '@/../content/courses/aibi-s/ops';

export default function OpsTrackPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--color-cobalt)]">
          AiBI-S · Prototype · /Ops track
        </p>
        <h1 className="font-serif text-5xl">Operations Specialist</h1>
        <p className="text-lg italic">
          Deploy AI to your department. Measure it. Defend it.
        </p>
      </header>

      <section>
        <h2 className="font-serif text-2xl mb-4">Phase I — Foundation</h2>
        <ul className="space-y-3">
          {Object.entries(opsUnits).map(([id, unit]) => (
            <li key={id} className="border rounded p-4 hover:border-[color:var(--color-cobalt)] transition">
              <Link href={`/courses/aibi-s/ops/unit/${id}`} className="block">
                <p className="font-mono text-xs text-[color:var(--color-ink)]/60 mb-1">Unit {id}</p>
                <p className="font-serif text-xl">{unit.title}</p>
                <p className="text-sm mt-2">{unit.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <aside className="border-l-2 border-[color:var(--color-cobalt)] pl-4 text-sm italic text-[color:var(--color-ink)]/70">
        Prototype scope: one unit available. The full /Ops track will have ~6 units across three phases, plus a capstone.
      </aside>
    </main>
  );
}
```

- [ ] **Step 2: Verify type-check and page renders**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/courses/aibi-s/ops/page.tsx
git commit -m "feat(aibi-s): add /Ops track overview page"
```

---

### Task 13: Modify AiBI-S landing page to show new track selector

**Files:**
- Modify: `src/app/courses/aibi-s/page.tsx`

- [ ] **Step 1: Read the existing AiBI-S page**

Run: `cat src/app/courses/aibi-s/page.tsx`

Confirm the existing page structure. If it redirects to `/courses/aibi-s/[week]/1` or similar, the modification below preserves that behavior for the old scaffolding but adds a prototype-mode section at the top.

- [ ] **Step 2: Replace the page content with the prototype-mode landing**

Overwrite `src/app/courses/aibi-s/page.tsx` with:

```tsx
// AiBI-S landing page — prototype mode
// During prototype phase, this page shows the 5 track selector with only /Ops active.
// After the prototype is validated and additional tracks are authored, this will be
// replaced with the production track selector.

import Link from 'next/link';
import type { TrackCode } from '@/../lib/aibi-s/types';

interface TrackMeta {
  readonly code: TrackCode;
  readonly label: string;
  readonly tagline: string;
  readonly active: boolean;
}

const tracks: readonly TrackMeta[] = [
  { code: 'ops',        label: 'Operations',  tagline: 'Back-office efficiency. Throughput. Exception handling.', active: true },
  { code: 'lending',    label: 'Lending',     tagline: 'Loan-file analysis. Credit research. Pipeline insight.',   active: false },
  { code: 'compliance', label: 'Compliance',  tagline: 'Regulatory research. Policy corpus. BSA/AML support.',     active: false },
  { code: 'finance',    label: 'Finance',     tagline: 'Variance narrative. Board memos. ALCO support.',           active: false },
  { code: 'retail',     label: 'Retail',      tagline: 'Member comms. FAQ automation. Service recovery.',          active: false },
];

export default function AiBISLanding() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <header className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--color-cobalt)]">
          AiBI-S · Banking AI Specialist · Prototype
        </p>
        <h1 className="font-serif text-5xl">Choose your track</h1>
        <p className="text-lg">
          AiBI-S includes all five role tracks. Complete one to earn
          <span className="font-mono"> AiBI-S/<span className="italic">track</span></span>.
          Complete all five to earn the <span className="font-semibold">Full Specialist</span> honorific.
        </p>
      </header>

      <ul className="grid gap-4 md:grid-cols-2">
        {tracks.map((t) => (
          <li key={t.code}>
            {t.active ? (
              <Link
                href={`/courses/aibi-s/${t.code}`}
                className="block border-2 border-[color:var(--color-cobalt)] p-6 rounded hover:bg-[color:var(--color-parch)] transition"
              >
                <p className="font-mono text-xs mb-1">AiBI-S/{t.code}</p>
                <p className="font-serif text-2xl">{t.label}</p>
                <p className="text-sm mt-2">{t.tagline}</p>
                <p className="text-xs mt-3 text-[color:var(--color-cobalt)] font-semibold">Active in prototype →</p>
              </Link>
            ) : (
              <div className="block border border-[color:var(--color-ink)]/15 p-6 rounded opacity-60 cursor-not-allowed">
                <p className="font-mono text-xs mb-1">AiBI-S/{t.code}</p>
                <p className="font-serif text-2xl">{t.label}</p>
                <p className="text-sm mt-2">{t.tagline}</p>
                <p className="text-xs mt-3 text-[color:var(--color-ink)]/50">Coming soon</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 3: Verify type-check and no lint errors**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (or no new errors beyond pre-existing).

- [ ] **Step 4: Commit**

```bash
git add src/app/courses/aibi-s/page.tsx
git commit -m "feat(aibi-s): prototype landing with 5-track selector (/Ops active)"
```

---

### Task 14: End-to-end manual verification via dev server

**Files:**
- No code changes. This is a manual verification task; document findings in the commit message if any issues are found and fixed.

- [ ] **Step 1: Kill any zombie dev servers**

Run: `pkill -f "next dev" || true`

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`

Expected: server starts on http://localhost:3000 (or reports an alternative port). Leave running.

- [ ] **Step 3: Visit and walk the full flow**

In a browser:

1. Navigate to http://localhost:3000/courses/aibi-s
   - **Verify:** 5-track selector renders; only /Ops is clickable; others show "Coming soon"
2. Click `/Ops`
   - **Verify:** /Ops overview page renders with Unit 1.1 listed
3. Click Unit 1.1
   - **Verify:** Beat 1 (Learn) renders with framework hooks showing Pillar A, AIEOG, Tier 2
4. Click "Continue to Practice"
   - **Verify:** Beat 2 (Practice) renders with the decision-sim scenario and 4 options
5. Select an incorrect option (e.g., "Tier 1 public")
   - **Verify:** red highlight on the wrong option; feedback + consequence render below
6. Select the correct option
   - **Verify:** the correct option highlights sage; feedback renders; Continue button enables
7. Click "Continue to Apply"
   - **Verify:** Beat 3 (Apply) renders with textarea and word counter
8. Type 60+ words about a real workflow
   - **Verify:** word counter increments, Continue enables when ≥60
9. Click "Continue to Defend"
   - **Verify:** Beat 4 (Defend) opens. Dana's challenge memo is visible
10. Click "Write my rebuttal"; type a rebuttal (at least 50 chars)
    - **Verify:** Rebuttal editor accepts text; Submit button enables
11. Click "Submit rebuttal — open the probe"
    - **Verify:** PersonaChat renders; "Open the probe" button visible
12. Click "Open the probe"
    - **Verify:** loading spinner shown; within ~10s Dana's first question appears
13. Respond to Dana's question; verify she responds again
    - **Verify:** persona turn counter increments; at 3 persona turns the chat exhausts and "Probe complete — grade my defense" button appears
14. Click "grade my defense"
    - **Verify:** grading spinner; within ~15s the rubric score renders with dimension breakdown + narrative feedback
15. Click "Continue to Refine"
    - **Verify:** Refine beat shows original rebuttal + feedback side-by-side; textarea accepts refined version
16. Type a refined rebuttal
    - **Verify:** Continue to Capture enables when text present
17. Click "Capture defended artifact"
    - **Verify:** Capture beat shows artifact summary with all captured fields
18. Click "Capture to portfolio"
    - **Verify:** timestamp rendered; "Captured at [ISO timestamp]" shown

- [ ] **Step 4: Verify localStorage persistence**

Reload the page mid-flow (say, at Beat 3 Apply with 60 words written). Verify the state restores and you pick up where you left off.

- [ ] **Step 5: Verify the reset button works**

Click "Reset unit progress (prototype only)" at the bottom of the unit. Confirm, then verify the page reloads at Beat 1 with no saved state.

- [ ] **Step 6: If any issues found, fix them, re-verify, and commit individually**

For any issue found during manual verification, fix it, re-run the affected steps, and commit with a descriptive message like:

```bash
git add <files>
git commit -m "fix(aibi-s): <specific thing that was broken>"
```

- [ ] **Step 7: Final verification commit**

If no issues found:

```bash
git commit --allow-empty -m "verify(aibi-s): prototype flow verified end-to-end in browser"
```

---

## Post-Plan: Hand Back to User

Once all 14 tasks are complete, surface the prototype URL to the user and request they walk through the flow themselves. Do not claim "done" — claim "ready for review," and ask them to try to break it.

---

## Spec Coverage Self-Check

Cross-referencing this plan against `docs/superpowers/specs/2026-04-18-aibi-s-curriculum-design.md`:

| Spec section | Covered by |
|-------------|------------|
| §2 Format (self-paced, prereq) | Prototype skips prereq verification (deferred); self-paced rhythm demonstrated |
| §2.3 Five role tracks | Task 13 — all 5 rendered, only /Ops active (prototype scope) |
| §3 Single A→C thread | Deferred — only one unit in the prototype, so thread demonstration is future |
| §4 Three phases | Task 6 unit content marked Phase I; full 3-phase flow deferred |
| §5 The 6-beat unit loop | Tasks 3, 9, 10, 11 — state machine + all 6 beat components |
| §5.2 Simulation types | Decision sim (Task 9 PracticeBeat) + persona sim (Task 10 DefendBeat) — other 3 sim types deferred |
| §6 Persona roster | Task 6 Department Head authored; other 3 personas deferred to post-prototype |
| §6.2 Persona execution mechanism | Tasks 7, 8, 10 — memo + rebuttal + AI chat probe + rubric grading |
| §7 Capstone, grading | Unit-level grading demonstrated; phase gates + cert + human review deferred |
| §8 Regulatory + security | Task 9 Practice beat enforces data-tier classification; Task 6 content tags frameworks; Compliance Liaison persona deferred |
| §8.3 AiBI pillar markers | Task 9 FrameworkHooks renders pillar tags |
| §8.4 RTFC+D+G | Not rendered in prototype UI — deferred to later plans (mentioned in content body copy only) |
| §9 Commercial structure | Deferred — purchase flow already exists but prototype does not gate on it |
| §10 Platform capabilities | Partial: unit renderer, persona chat runtime, AI-judge grader, pillar callouts, data-tier gate in Practice beat, localStorage persistence. Deferred: Supabase persistence, phase gates, cert workflow, credential display, multi-track stacking, human review queue, resubmission flow |

**Explicit deferrals (all acknowledged as out-of-scope in plan frontmatter):**

- Other 4 tracks (lending / compliance / finance / retail)
- Other 2 phases for /Ops (First Build, Scale)
- Other 3 personas (Compliance Liaison, Resistant Team Member, Peer Department Manager)
- Phase gates + capstone + certification human-review workflow
- Credential generation, multi-track stacking, Full Specialist honorific
- Supabase persistence (localStorage only for prototype)
- Prereq verification (AiBI-P completion check) — prototype doesn't gate
- Other simulation types (workflow, edge-case, regulatory sims)

These are the natural contents of subsequent plans after prototype validation.

---

## Placeholder Scan

Searched the plan for TBD / TODO / "implement later" / "similar to" / unspecified types. None found. Every step shows actual code or exact commands.

## Type Consistency

- `Unit`, `BeatContent`, `DefendBeatPersona`, `Rubric`, `RubricScore`, `ChatTurn`, `UnitLearnerState`, `Action` — all defined in Task 2 and used consistently in Tasks 3-13.
- `canAdvance`, `advance`, `initialState` — defined in Task 3, consumed in Task 11.
- `canContinueChat`, `nextTurnIndex` — defined in Task 4, consumed in Task 7 and Task 10.
- `buildJudgePrompt`, `parseRubricResponse` — defined in Task 5, consumed in Task 8.
- `opsUnit1_1`, `opsDepartmentHeadPhase1`, `opsUnits` — defined in Task 6, consumed in Tasks 7, 8, 11, 12.
- All type import paths use `@/../lib/aibi-s/types` — verify this alias resolves against the `tsconfig.json` `paths` config before Task 2 (if the alias doesn't work, substitute relative paths throughout).

**If `@/../lib/...` does not resolve:** after Task 1, run `cat tsconfig.json` and either add `"@/*": ["./src/*"]` with a parallel `"lib/*": ["./lib/*"]` mapping, or substitute `@/../lib/aibi-s/types` → `../../../../lib/aibi-s/types` (relative from the component path) throughout.
