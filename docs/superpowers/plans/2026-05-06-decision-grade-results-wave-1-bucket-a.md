# Decision-Grade Assessment Results — Wave 1 (Bucket A: Diagnostic Framework) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the data foundation that every subsequent wave depends on — tier maturity substance, per-dimension threshold meaning, cross-cutting governance metadata, banking-role taxonomy, and score-authority framing copy — exposed through pure resolver functions and lightly wired into two existing surfaces to prove the data flows.

**Architecture:** Pure data + pure resolvers in `content/assessments/v2/`. New modules wrap (do not replace) the existing `scoring.ts` `Tier` type. Resolvers are total functions over the existing `Dimension` union. No React, no fetching, no state — just the typed knowledge graph that Waves B/C/D will render. Two thin integrations on `/results/[id]` and the print `ExecSummary` prove the data renders end-to-end without redesigning any surface.

**Tech Stack:** TypeScript strict mode, Vitest, existing v2 assessment module structure.

**Spec:** `docs/superpowers/specs/2026-05-06-decision-grade-assessment-results-design.md`

**Design Bar:** Every piece of authored content must read as consulting-grade. McKinsey-tight, banker-direct, no marketing voice, no AI buzzwords. Sourced or framed as self-reported. The prose is the product — Waves B/C will render it but cannot rescue weak content.

---

## File Structure

**New files:**
- `content/assessments/v2/maturity.ts` — tier-maturity substance, per-dimension tier ladder, banking-role taxonomy, total resolvers
- `content/assessments/v2/maturity.test.ts` — Vitest suite for maturity resolvers
- `content/assessments/v2/governance.ts` — governance metadata schema + per-dimension defaults + resolver
- `content/assessments/v2/governance.test.ts` — Vitest suite for governance resolver
- `content/assessments/v2/scoring-authority.ts` — static framing copy: scale meaning, threshold logic, what the score claims and does not claim

**Modified files:**
- `content/assessments/v2/index.ts` — re-export new modules
- `src/app/results/[id]/page.tsx` — render tier-blocker line beneath tier label (proof integration #1)
- `src/app/assessment/results/print/_components/ExecSummary.tsx` — render tier-blocker line + score-authority footer (proof integration #2)

**Untouched (intentional):** `scoring.ts`, `personalization.ts`, `starter-artifacts.ts`, `pdf-content.ts`. Wave 1 is additive; later waves restructure these.

---

## Task 1: Author maturity types and resolvers (no content yet — schema first)

**Files:**
- Create: `content/assessments/v2/maturity.ts`
- Test: `content/assessments/v2/maturity.test.ts`

- [ ] **Step 1: Write failing tests for the maturity resolver shape**

```typescript
// content/assessments/v2/maturity.test.ts
import { describe, it, expect } from 'vitest';
import {
  getTierMaturity,
  getDimensionTier,
  BANKING_ROLES,
  type TierMaturity,
} from './maturity';
import { tiers } from './scoring';

describe('getTierMaturity', () => {
  it('returns substance for every tier id', () => {
    for (const tier of tiers) {
      const m = getTierMaturity(tier.id);
      expect(m.tierId).toBe(tier.id);
      expect(m.stageName.length).toBeGreaterThan(0);
      expect(m.whatIsTrue.length).toBeGreaterThan(0);
      expect(m.blockerToNext === null || m.blockerToNext.length > 0).toBe(true);
    }
  });

  it('only the top tier has a null blockerToNext', () => {
    const top = getTierMaturity('ready-to-scale');
    expect(top.blockerToNext).toBeNull();
    expect(getTierMaturity('starting-point').blockerToNext).not.toBeNull();
  });
});

describe('getDimensionTier', () => {
  it('returns starting-point when dimension scored at minimum', () => {
    expect(getDimensionTier('governance' as never, 0, 4)).toBe('starting-point');
  });

  it('returns ready-to-scale when dimension scored at maximum', () => {
    expect(getDimensionTier('security-posture', 4, 4)).toBe('ready-to-scale');
  });

  it('handles fractional coverage (free 12Q has 1 question per dimension)', () => {
    // 1 of 1 question scored 4/4 → ready-to-scale
    expect(getDimensionTier('leadership-buy-in', 4, 4)).toBe('ready-to-scale');
    // 1 of 1 scored 1/4 → starting-point
    expect(getDimensionTier('leadership-buy-in', 1, 4)).toBe('starting-point');
  });
});

describe('BANKING_ROLES', () => {
  it('includes the nine canonical seats from the spec', () => {
    const ids = BANKING_ROLES.map((r) => r.id);
    expect(ids).toEqual([
      'deposit-operations',
      'loan-operations',
      'bsa-aml',
      'treasury-management',
      'branch-leadership',
      'compliance-review',
      'marketing',
      'collections',
      'card-operations',
    ]);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail with module-not-found**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: FAIL — `Cannot find module './maturity'`

- [ ] **Step 3: Create the maturity module with types and resolver skeletons (no authored content yet — placeholder strings that satisfy the schema)**

```typescript
// content/assessments/v2/maturity.ts
// Maturity-stage substance for the four-tier system. Wraps (does not replace)
// the Tier type in scoring.ts. Authored content lives here as the single
// source of truth consumed by every assessment-results surface.

import type { Tier } from './scoring';
import type { Dimension } from './types';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface TierMaturity {
  readonly tierId: Tier['id'];
  /** Maturity-stage label (e.g. "Individual Experimentation"). Internal frame; not a public rebrand. */
  readonly stageName: string;
  /** One-paragraph "what is true at this stage" — banker-direct, present tense. */
  readonly whatIsTrue: string;
  /** The single named blocker holding the institution at this stage. Null only at the top tier. */
  readonly blockerToNext: string | null;
}

export interface BankingRole {
  readonly id:
    | 'deposit-operations'
    | 'loan-operations'
    | 'bsa-aml'
    | 'treasury-management'
    | 'branch-leadership'
    | 'compliance-review'
    | 'marketing'
    | 'collections'
    | 'card-operations';
  readonly label: string;
  /** Two-line description used when overlaying recommendations onto a role context. */
  readonly contextLine: string;
}

/** Per-dimension tier substance: what does dimension X mean at tier Y. 8 dims × 4 tiers = 32 cells. */
export interface DimensionTierMeaning {
  readonly dimension: Dimension;
  readonly tierId: Tier['id'];
  /** One-line meaning of this dimension at this tier. Banker-direct, present tense. */
  readonly meaning: string;
}

// ---------------------------------------------------------------------------
// AUTHORED CONTENT — populated in Tasks 2, 3, 4
// ---------------------------------------------------------------------------

export const TIER_MATURITY: Record<Tier['id'], TierMaturity> = {
  'starting-point': {
    tierId: 'starting-point',
    stageName: 'Individual Experimentation',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'early-stage': {
    tierId: 'early-stage',
    stageName: 'Team Adoption',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'building-momentum': {
    tierId: 'building-momentum',
    stageName: 'Program Building',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: 'TODO: authored in Task 2',
  },
  'ready-to-scale': {
    tierId: 'ready-to-scale',
    stageName: 'Operational Integration',
    whatIsTrue: 'TODO: authored in Task 2',
    blockerToNext: null,
  },
};

export const BANKING_ROLES: readonly BankingRole[] = [
  { id: 'deposit-operations', label: 'Deposit Operations', contextLine: 'TODO: authored in Task 4' },
  { id: 'loan-operations', label: 'Loan Operations / Underwriting Support', contextLine: 'TODO: authored in Task 4' },
  { id: 'bsa-aml', label: 'BSA / AML Support', contextLine: 'TODO: authored in Task 4' },
  { id: 'treasury-management', label: 'Treasury Management', contextLine: 'TODO: authored in Task 4' },
  { id: 'branch-leadership', label: 'Branch Leadership', contextLine: 'TODO: authored in Task 4' },
  { id: 'compliance-review', label: 'Compliance Review', contextLine: 'TODO: authored in Task 4' },
  { id: 'marketing', label: 'Marketing', contextLine: 'TODO: authored in Task 4' },
  { id: 'collections', label: 'Collections', contextLine: 'TODO: authored in Task 4' },
  { id: 'card-operations', label: 'Card Operations', contextLine: 'TODO: authored in Task 4' },
] as const;

/** 32-cell ladder. Populated in Task 3. */
export const DIMENSION_TIER_LADDER: readonly DimensionTierMeaning[] = [];

// ---------------------------------------------------------------------------
// RESOLVERS — pure, total functions
// ---------------------------------------------------------------------------

export function getTierMaturity(tierId: Tier['id']): TierMaturity {
  return TIER_MATURITY[tierId];
}

/**
 * Map a per-dimension score (out of maxScore) onto the four-tier ladder.
 * Uses the same equal-spaced 9-point logic as overall scoring, normalized
 * to whatever maxScore the dimension actually has in this session.
 *
 * For the in-depth 48Q assessment a dimension's maxScore is typically 24
 * (6 questions × 4 points). For the free 12Q rotation it's typically 4
 * (1 question × 4 points).
 */
export function getDimensionTier(
  _dimension: Dimension,
  score: number,
  maxScore: number
): Tier['id'] {
  if (maxScore <= 0) return 'starting-point';
  const ratio = score / maxScore; // 0.25 → 0.50 → 0.75 → 1.00 are the band edges
  if (ratio >= 0.875) return 'ready-to-scale'; // top eighth
  if (ratio >= 0.625) return 'building-momentum';
  if (ratio >= 0.375) return 'early-stage';
  return 'starting-point';
}

export function getDimensionTierMeaning(
  dimension: Dimension,
  tierId: Tier['id']
): DimensionTierMeaning | undefined {
  return DIMENSION_TIER_LADDER.find((c) => c.dimension === dimension && c.tierId === tierId);
}
```

- [ ] **Step 4: Run tests — schema tests should now pass; banking-roles + tier-maturity-shape pass; dimension-tier numeric tests pass**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: PASS — all tests green. (Authored content is still placeholder, but schema + resolvers are correct.)

- [ ] **Step 5: Commit**

```bash
git add content/assessments/v2/maturity.ts content/assessments/v2/maturity.test.ts
git commit -m "feat(assessment): scaffold maturity types + resolvers (Wave 1, Bucket A)"
```

---

## Task 2: Author the four-tier maturity substance

**Files:**
- Modify: `content/assessments/v2/maturity.ts:38-65` (the `TIER_MATURITY` map)

This is content work. Replace each `TODO` placeholder with consulting-grade prose. Each tier needs:
- `whatIsTrue` — 2–3 sentences. Present tense. Concrete. What is *actually* happening at this stage inside a community bank or credit union. Banker-direct. No marketing voice.
- `blockerToNext` — one named blocker (1 sentence). The single thing that, if removed, lets the institution graduate to the next stage.

Authoring guidance from the spec's A.1 table:

| Tier | Stage | What's true | Blocker to next |
|------|-------|-------------|-----------------|
| Starting Point | Individual Experimentation | A few people use AI privately. No shared knowledge. No policy. | No leadership signal; no permission to use AI on bank work; no place to share what works. |
| Early Stage | Team Adoption | Pockets of AI use within teams. Informal best practices emerging. Still unsanctioned. | No governance frame; no measurement; no executive sponsor. |
| Building Momentum | Program Building | AI use is sanctioned. Policy + inventory + named owners exist. Workflows exist but are fragile. | No defensible measurement; security/compliance retrofit incomplete; institutional knowledge lives in individuals. |
| Ready to Scale | Operational Integration | AI is part of how work gets done across departments. Governance is operating. Measurement produces budget-defensible numbers. | (null — top tier) |

- [ ] **Step 1: Replace `starting-point.whatIsTrue` and `blockerToNext` with authored prose**

```typescript
'starting-point': {
  tierId: 'starting-point',
  stageName: 'Individual Experimentation',
  whatIsTrue:
    'A handful of staff are using AI tools — usually a free chat tool, usually on personal devices, usually for tasks they were going to do anyway. Nothing is shared. Nothing is documented. Leadership is either unaware or has not signaled whether this is allowed.',
  blockerToNext:
    'There is no leadership signal that AI use is sanctioned, no shared place where what works can be captured, and no permission to bring AI use onto bank work without ambiguity about policy.',
},
```

- [ ] **Step 2: Replace `early-stage.whatIsTrue` and `blockerToNext`**

```typescript
'early-stage': {
  tierId: 'early-stage',
  stageName: 'Team Adoption',
  whatIsTrue:
    'AI use has spread inside one or two teams — often Marketing, Operations, or a single curious branch. Informal best practices are emerging in the form of shared prompts and side-channel chatter. Most use is still unsanctioned by formal policy and invisible to compliance.',
  blockerToNext:
    'No written governance frame, no measurement of what AI use is producing, and no named executive sponsor to convert isolated team wins into an institutional program.',
},
```

- [ ] **Step 3: Replace `building-momentum.whatIsTrue` and `blockerToNext`**

```typescript
'building-momentum': {
  tierId: 'building-momentum',
  stageName: 'Program Building',
  whatIsTrue:
    'AI use is sanctioned. A written acceptable-use policy exists, a use-case inventory is being maintained, and at least one named owner is accountable for AI risk. Real workflows are running in real seats — but the program is fragile because most institutional knowledge still lives in three or four individuals.',
  blockerToNext:
    'Measurement is not yet defensible to leadership or examiners, security and compliance review was bolted on rather than built in, and the program has not yet survived the loss of a key person.',
},
```

- [ ] **Step 4: Replace `ready-to-scale.whatIsTrue` (blockerToNext stays null)**

```typescript
'ready-to-scale': {
  tierId: 'ready-to-scale',
  stageName: 'Operational Integration',
  whatIsTrue:
    'AI is part of how work gets done across multiple departments. Governance is operating, not theoretical — the policy is enforced, the inventory is current, and reviews happen on a schedule. Measurement produces budget-defensible numbers, and the next move is the builder move: building bank-specific tools rather than only adopting vendor tools.',
  blockerToNext: null,
},
```

- [ ] **Step 5: Re-run tests and commit**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: PASS (no test changes — content authoring satisfies the same shape contract).

```bash
git add content/assessments/v2/maturity.ts
git commit -m "content(assessment): author 4-tier maturity substance + blockers"
```

---

## Task 3: Author the per-dimension tier ladder (8 dims × 4 tiers = 32 cells)

**Files:**
- Modify: `content/assessments/v2/maturity.ts:78` (replace the empty `DIMENSION_TIER_LADDER` array)
- Modify: `content/assessments/v2/maturity.test.ts` (add coverage assertion)

This is the largest content task. Each cell answers: *"what does this dimension look like inside a community bank at this tier?"* One sentence per cell. Concrete. Present tense.

Authoring rule: a banker reading the cell for their dimension at their tier should think *"yes, that is what is happening here."* If the cell could apply to any industry, rewrite it.

- [ ] **Step 1: Add the coverage assertion to the test file**

```typescript
// Append to content/assessments/v2/maturity.test.ts
import { DIMENSION_TIER_LADDER, getDimensionTierMeaning } from './maturity';
import { DIMENSION_LABELS } from './types';
import { tiers } from './scoring';

describe('DIMENSION_TIER_LADDER', () => {
  it('has exactly 32 cells (8 dimensions × 4 tiers)', () => {
    expect(DIMENSION_TIER_LADDER).toHaveLength(32);
  });

  it('every dimension × tier combination is present exactly once', () => {
    const dimensions = Object.keys(DIMENSION_LABELS) as (keyof typeof DIMENSION_LABELS)[];
    for (const dim of dimensions) {
      for (const tier of tiers) {
        const matches = DIMENSION_TIER_LADDER.filter(
          (c) => c.dimension === dim && c.tierId === tier.id
        );
        expect(matches, `missing or duplicate cell for ${dim} × ${tier.id}`).toHaveLength(1);
      }
    }
  });

  it('every cell has non-empty meaning copy', () => {
    for (const cell of DIMENSION_TIER_LADDER) {
      expect(cell.meaning.length, `${cell.dimension} × ${cell.tierId}`).toBeGreaterThan(40);
    }
  });

  it('getDimensionTierMeaning returns the matching cell', () => {
    const cell = getDimensionTierMeaning('security-posture', 'building-momentum');
    expect(cell).toBeDefined();
    expect(cell?.meaning).toMatch(/.+/);
  });
});
```

- [ ] **Step 2: Run tests — expect failures (32 cells expected, 0 present)**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: FAIL — `expected length 0 to be 32`.

- [ ] **Step 3: Replace the empty `DIMENSION_TIER_LADDER` with all 32 authored cells**

Replace the existing line `export const DIMENSION_TIER_LADDER: readonly DimensionTierMeaning[] = [];` with:

```typescript
export const DIMENSION_TIER_LADDER: readonly DimensionTierMeaning[] = [
  // current-ai-usage
  { dimension: 'current-ai-usage', tierId: 'starting-point',
    meaning: 'AI use, if it exists, is private and invisible — a few staff using free tools on personal devices for tasks management never sees the inputs or outputs of.' },
  { dimension: 'current-ai-usage', tierId: 'early-stage',
    meaning: 'AI use has surfaced inside one or two teams. Time savings are real but inconsistent and not yet documented anywhere a manager can find them.' },
  { dimension: 'current-ai-usage', tierId: 'building-momentum',
    meaning: 'AI is embedded in two or three repeating workflows. The bank can name which seats use which tools for which tasks, and someone owns each one.' },
  { dimension: 'current-ai-usage', tierId: 'ready-to-scale',
    meaning: 'AI is a routine part of how work gets done across multiple departments. Workflows are documented, owned, and survive turnover.' },

  // experimentation-culture
  { dimension: 'experimentation-culture', tierId: 'starting-point',
    meaning: 'Trying new tools is treated as personal time. There is no forum where staff can share what worked, and no signal that experimentation is welcome.' },
  { dimension: 'experimentation-culture', tierId: 'early-stage',
    meaning: 'A handful of curious staff experiment in side channels. Wins stay verbal; nothing is captured in a place the next person can find.' },
  { dimension: 'experimentation-culture', tierId: 'building-momentum',
    meaning: 'Experimentation is sanctioned and lightly structured — a shared prompt library, a monthly demo, or a small budget for tool trials with a named owner.' },
  { dimension: 'experimentation-culture', tierId: 'ready-to-scale',
    meaning: 'Experimentation is a managed pipeline: ideas are captured, scored, piloted, and either operationalized or retired on a known cadence.' },

  // ai-literacy-level
  { dimension: 'ai-literacy-level', tierId: 'starting-point',
    meaning: 'Most staff cannot articulate what generative AI is, what it is bad at, or where the bank’s sensitive data is at risk when using it.' },
  { dimension: 'ai-literacy-level', tierId: 'early-stage',
    meaning: 'A few power users have working intuition for AI. The rest of the institution has heard the buzzwords but not had any structured exposure.' },
  { dimension: 'ai-literacy-level', tierId: 'building-momentum',
    meaning: 'A baseline literacy program has been delivered to a meaningful share of staff. Frontline managers can answer basic questions about acceptable use without escalating.' },
  { dimension: 'ai-literacy-level', tierId: 'ready-to-scale',
    meaning: 'AI literacy is treated as a job skill — onboarded into new-hire training, refreshed annually, and tested in role-relevant context.' },

  // quick-win-potential
  { dimension: 'quick-win-potential', tierId: 'starting-point',
    meaning: 'Repeating workflows that would benefit from AI have not been mapped or named. The bank cannot answer "where would we even start" without a discovery exercise.' },
  { dimension: 'quick-win-potential', tierId: 'early-stage',
    meaning: 'One or two obvious candidate workflows have been identified informally. No one has yet committed to running a structured pilot with a measured before/after.' },
  { dimension: 'quick-win-potential', tierId: 'building-momentum',
    meaning: 'A short list of candidate workflows is being worked, with at least one pilot in flight that has a baseline measurement and a named owner.' },
  { dimension: 'quick-win-potential', tierId: 'ready-to-scale',
    meaning: 'Quick-win identification is a managed backlog. New candidates are surfaced from frontline staff and prioritized against measurable institutional impact.' },

  // leadership-buy-in
  { dimension: 'leadership-buy-in', tierId: 'starting-point',
    meaning: 'Leadership has not made a public statement about AI. Staff infer the position from silence — usually as "do not bring it up."' },
  { dimension: 'leadership-buy-in', tierId: 'early-stage',
    meaning: 'A senior leader has signaled openness to AI in a meeting or two, but no budget, owner, or written direction has followed.' },
  { dimension: 'leadership-buy-in', tierId: 'building-momentum',
    meaning: 'AI is a named line item — an executive sponsor exists, a budget exists, and AI updates appear on at least a quarterly leadership agenda.' },
  { dimension: 'leadership-buy-in', tierId: 'ready-to-scale',
    meaning: 'AI capability is treated as a strategic objective with board-level visibility, defended in budget cycles, and tracked alongside other operational KPIs.' },

  // security-posture
  { dimension: 'security-posture', tierId: 'starting-point',
    meaning: 'There is no written acceptable-use policy for AI tools. Staff using free chat tools may be pasting non-public information without anyone reviewing the exposure.' },
  { dimension: 'security-posture', tierId: 'early-stage',
    meaning: 'Verbal guardrails exist ("don’t paste customer data") but nothing is written, tested, or auditable. Compliance has not yet been brought into the conversation.' },
  { dimension: 'security-posture', tierId: 'building-momentum',
    meaning: 'A written AI acceptable-use policy exists, a use-case inventory is maintained, and named owners are accountable for AI risk inside the institution.' },
  { dimension: 'security-posture', tierId: 'ready-to-scale',
    meaning: 'AI risk is integrated into existing third-party and model risk programs (SR 11-7, TPRM). Reviews happen on schedule. Examiner questions have defensible answers.' },

  // training-infrastructure
  { dimension: 'training-infrastructure', tierId: 'starting-point',
    meaning: 'No AI-specific training exists. New hires receive no orientation on what tools they may or may not use, or on what good prompting looks like.' },
  { dimension: 'training-infrastructure', tierId: 'early-stage',
    meaning: 'Training, if it exists, is one-off — a lunch-and-learn, a forwarded webinar. Nothing is required, repeatable, or refreshed.' },
  { dimension: 'training-infrastructure', tierId: 'building-momentum',
    meaning: 'A baseline AI literacy module is part of onboarding for at least one role family. Refresh cadence is defined even if not yet fully operationalized.' },
  { dimension: 'training-infrastructure', tierId: 'ready-to-scale',
    meaning: 'AI training is role-specific, sustained, and measured. New hires arrive prepared; existing staff are kept current as tools and policy evolve.' },

  // builder-potential
  { dimension: 'builder-potential', tierId: 'starting-point',
    meaning: 'No staff have been identified as candidates to build bank-specific AI workflows. The institution is in pure tool-consumer mode.' },
  { dimension: 'builder-potential', tierId: 'early-stage',
    meaning: 'A few staff have shown aptitude for prompt engineering or workflow design but have no time, mandate, or path to develop the skill further.' },
  { dimension: 'builder-potential', tierId: 'building-momentum',
    meaning: 'One or two staff have been informally designated as "the AI person" for their team. They are building reusable prompts, agents, or small workflows.' },
  { dimension: 'building-potential', tierId: 'ready-to-scale',
    meaning: 'The bank has a defined builder track — staff who design, ship, and maintain bank-specific AI workflows as a recognized part of their role.' } as DimensionTierMeaning,
];
```

> **Implementer note:** the final `building-potential` entry is intentionally typed as `DimensionTierMeaning` because TypeScript will reject the typo. Fix the typo (`building-potential` → `builder-potential`) and remove the `as DimensionTierMeaning` cast. This is a deliberate trap to make sure you read the content rather than blindly pasting it.

- [ ] **Step 4: Run tests**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: PASS — 32 cells, no duplicates, all non-empty.

- [ ] **Step 5: Commit**

```bash
git add content/assessments/v2/maturity.ts content/assessments/v2/maturity.test.ts
git commit -m "content(assessment): author per-dimension tier ladder (8x4 = 32 cells)"
```

---

## Task 4: Author banking-role taxonomy context lines

**Files:**
- Modify: `content/assessments/v2/maturity.ts:67-77` (the `BANKING_ROLES` array)

Each role needs a `contextLine` — one or two sentences describing what *this seat* spends time on that AI most plausibly accelerates. Banker-specific. Concrete tasks.

- [ ] **Step 1: Add context-line assertion to the test file**

```typescript
// Append to content/assessments/v2/maturity.test.ts inside the BANKING_ROLES describe
it('every role has a non-trivial contextLine', () => {
  for (const role of BANKING_ROLES) {
    expect(role.contextLine.length, role.id).toBeGreaterThan(40);
    expect(role.contextLine, role.id).not.toMatch(/TODO/);
  }
});
```

- [ ] **Step 2: Run tests — expect failure (placeholders still present)**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: FAIL — `expected '...TODO...' not to match /TODO/`

- [ ] **Step 3: Replace each `contextLine: 'TODO: authored in Task 4'` with authored copy**

Replace the `BANKING_ROLES` array body with:

```typescript
export const BANKING_ROLES: readonly BankingRole[] = [
  { id: 'deposit-operations', label: 'Deposit Operations',
    contextLine: 'Account exception research, document review, customer correspondence drafting, and procedure summarization — high-volume, structured work where written language and lookups dominate the day.' },
  { id: 'loan-operations', label: 'Loan Operations / Underwriting Support',
    contextLine: 'Credit memo drafting, condition tracking, loan file review, and policy lookup — work where summarization and structured-document handling consume hours that compound across the pipeline.' },
  { id: 'bsa-aml', label: 'BSA / AML Support',
    contextLine: 'Alert narrative drafting, SAR support, news adverse-media review, and policy interpretation — tasks where written reasoning and source synthesis are the bottleneck.' },
  { id: 'treasury-management', label: 'Treasury Management',
    contextLine: 'RFP responses, onboarding documentation, customer education materials, and product comparison memos — long-form written work that scales poorly with relationship-manager headcount.' },
  { id: 'branch-leadership', label: 'Branch Leadership',
    contextLine: 'Coaching notes, performance summaries, customer escalations, and procedure interpretation — the management overhead between customer-facing time and reporting upward.' },
  { id: 'compliance-review', label: 'Compliance Review',
    contextLine: 'Regulatory change tracking, policy gap analysis, exam prep, and procedure update drafting — reading-heavy work where AI shifts the bottleneck from intake to judgment.' },
  { id: 'marketing', label: 'Marketing',
    contextLine: 'Email drafting, social copy, segment analysis, and brand-consistent content production — a department where AI adoption is usually furthest along and policy needs to catch up.' },
  { id: 'collections', label: 'Collections',
    contextLine: 'Account-history summarization, customer correspondence, and call-prep notes — structured, repeatable communication tasks that benefit from drafting acceleration with human review on the send.' },
  { id: 'card-operations', label: 'Card Operations',
    contextLine: 'Dispute documentation, fraud-case narrative drafting, network rule lookup, and customer correspondence — procedure-heavy work where the right answer is buried in long documents.' },
] as const;
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run content/assessments/v2/maturity.test.ts`
Expected: PASS — 9 roles, all non-trivial.

- [ ] **Step 5: Commit**

```bash
git add content/assessments/v2/maturity.ts content/assessments/v2/maturity.test.ts
git commit -m "content(assessment): author banking-role taxonomy context lines"
```

---

## Task 5: Build the governance metadata module

**Files:**
- Create: `content/assessments/v2/governance.ts`
- Test: `content/assessments/v2/governance.test.ts`

The cross-cutting governance layer (spec A.3): for any recommendation tied to a dimension, surface five attributes — risk level, governance complexity, data sensitivity, human review, examiner defensibility.

This module exposes a *default* governance profile per dimension. Wave B will let individual recommendations override these defaults; Wave 1 just ships the defaults.

- [ ] **Step 1: Write failing tests**

```typescript
// content/assessments/v2/governance.test.ts
import { describe, it, expect } from 'vitest';
import {
  getGovernanceFor,
  GOVERNANCE_BY_DIMENSION,
  type GovernanceAttrs,
} from './governance';
import { DIMENSION_LABELS } from './types';

describe('GOVERNANCE_BY_DIMENSION', () => {
  it('covers every dimension', () => {
    for (const dim of Object.keys(DIMENSION_LABELS)) {
      expect(GOVERNANCE_BY_DIMENSION[dim as keyof typeof GOVERNANCE_BY_DIMENSION]).toBeDefined();
    }
  });

  it('every entry has all five attributes populated', () => {
    for (const [dim, attrs] of Object.entries(GOVERNANCE_BY_DIMENSION)) {
      expect(attrs.riskLevel, dim).toMatch(/^(Low|Moderate|Elevated)$/);
      expect(attrs.governanceComplexity, dim).toMatch(/^(None|Policy update|Formal review)$/);
      expect(attrs.dataSensitivity, dim).toMatch(/^(Public|Internal|Confidential|NPI)$/);
      expect(attrs.humanReview, dim).toMatch(/^(Optional|Recommended|Required)$/);
      expect(attrs.examinerDefensibility.length, dim).toBeGreaterThan(40);
    }
  });
});

describe('getGovernanceFor', () => {
  it('returns the dimension default', () => {
    const attrs: GovernanceAttrs = getGovernanceFor('security-posture');
    expect(attrs.riskLevel).toBe('Elevated');
  });
});
```

- [ ] **Step 2: Run tests — expect module-not-found**

Run: `npx vitest run content/assessments/v2/governance.test.ts`
Expected: FAIL — `Cannot find module './governance'`

- [ ] **Step 3: Create the module with full authored content**

```typescript
// content/assessments/v2/governance.ts
// Cross-cutting governance + risk metadata. Five attributes per dimension,
// rendered as the governance strip beneath every recommendation in Wave B.
//
// Voice on examinerDefensibility: one sentence, written as if the bank
// officer is sitting across from an examiner being asked "what is your
// posture on this." Plain-English, not legalese, but defensible.

import type { Dimension } from './types';

export type RiskLevel = 'Low' | 'Moderate' | 'Elevated';
export type GovernanceComplexity = 'None' | 'Policy update' | 'Formal review';
export type DataSensitivity = 'Public' | 'Internal' | 'Confidential' | 'NPI';
export type HumanReview = 'Optional' | 'Recommended' | 'Required';

export interface GovernanceAttrs {
  readonly riskLevel: RiskLevel;
  readonly governanceComplexity: GovernanceComplexity;
  readonly dataSensitivity: DataSensitivity;
  readonly humanReview: HumanReview;
  /** One-sentence examiner-defensibility line. Plain English, not legalese. */
  readonly examinerDefensibility: string;
}

export const GOVERNANCE_BY_DIMENSION: Record<Dimension, GovernanceAttrs> = {
  'current-ai-usage': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Internal',
    humanReview: 'Recommended',
    examinerDefensibility:
      'AI tool usage is inventoried, the inventory is current, and named owners exist for each sanctioned use case.',
  },
  'experimentation-culture': {
    riskLevel: 'Low',
    governanceComplexity: 'None',
    dataSensitivity: 'Internal',
    humanReview: 'Optional',
    examinerDefensibility:
      'Experimentation happens within sanctioned tools and against non-sensitive data; production use crosses a separate review gate.',
  },
  'ai-literacy-level': {
    riskLevel: 'Low',
    governanceComplexity: 'None',
    dataSensitivity: 'Public',
    humanReview: 'Optional',
    examinerDefensibility:
      'AI literacy is part of staff training; the institution can produce completion records and curriculum on request.',
  },
  'quick-win-potential': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Internal',
    humanReview: 'Recommended',
    examinerDefensibility:
      'Pilots are scoped to non-customer-impacting workflows first, with measured before/after and a documented decision to operationalize.',
  },
  'leadership-buy-in': {
    riskLevel: 'Low',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'Internal',
    humanReview: 'Optional',
    examinerDefensibility:
      'A named executive owns AI program risk; the program is reviewed at the same cadence as other strategic initiatives.',
  },
  'security-posture': {
    riskLevel: 'Elevated',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'NPI',
    humanReview: 'Required',
    examinerDefensibility:
      'AI use is governed by a written acceptable-use policy; non-public information cannot be processed by tools that have not passed third-party risk review.',
  },
  'training-infrastructure': {
    riskLevel: 'Low',
    governanceComplexity: 'Policy update',
    dataSensitivity: 'Public',
    humanReview: 'Optional',
    examinerDefensibility:
      'Required AI training is part of onboarding for relevant roles, with refresh cadence defined and tracked alongside other compliance training.',
  },
  'builder-potential': {
    riskLevel: 'Moderate',
    governanceComplexity: 'Formal review',
    dataSensitivity: 'Confidential',
    humanReview: 'Required',
    examinerDefensibility:
      'Internally built AI workflows are subject to the same model-risk and change-management controls as any other internally developed system.',
  },
};

export function getGovernanceFor(dimension: Dimension): GovernanceAttrs {
  return GOVERNANCE_BY_DIMENSION[dimension];
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run content/assessments/v2/governance.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add content/assessments/v2/governance.ts content/assessments/v2/governance.test.ts
git commit -m "feat(assessment): add governance metadata layer (Wave 1, A.3)"
```

---

## Task 6: Author the score-authority framing copy

**Files:**
- Create: `content/assessments/v2/scoring-authority.ts`

Static copy module. No tests — pure data, no logic. Drives the framing block that explains what the score *is* and *is not*.

- [ ] **Step 1: Create the module**

```typescript
// content/assessments/v2/scoring-authority.ts
// Framing copy that earns the score's authority. Rendered as a short
// "About this score" block on the in-depth report and as a footer on the
// free 12Q result. Voice: institutional. Banker-direct. Not promotional.

export interface ScoreAuthority {
  /** What the 12–48 scale represents. One paragraph. */
  readonly scaleMeaning: string;
  /** Why the bands are 9 points wide. One paragraph. */
  readonly thresholdLogic: string;
  /** What the score legitimately claims. */
  readonly whatItClaims: readonly string[];
  /** What the score does NOT claim — the integrity guardrail. */
  readonly whatItDoesNotClaim: readonly string[];
}

export const SCORE_AUTHORITY: ScoreAuthority = {
  scaleMeaning:
    'The score is a self-reported readiness index across eight dimensions of AI capability — current usage, experimentation culture, literacy, quick-win potential, leadership buy-in, security posture, training infrastructure, and builder potential. The 12–48 range reflects four points per dimension, summed across all eight.',
  thresholdLogic:
    'The four maturity bands are equal-spaced nine-point ranges (12–20, 21–29, 30–38, 39–48). Equal spacing is intentional: it prevents the optical illusion that the difference between Building Momentum and Ready to Scale is smaller than the difference between Starting Point and Early Stage. Every step on the ladder is the same distance.',
  whatItClaims: [
    'A directional reading of where the institution sits on a recognizable maturity ladder.',
    'A named blocker holding the institution at its current stage.',
    'A per-dimension breakdown that surfaces the limiting capability — the dimension that, raised one tier, lifts the overall posture.',
  ],
  whatItDoesNotClaim: [
    'A model-risk audit. The score does not substitute for SR 11-7, TPRM, or any internal control review.',
    'A peer benchmark. The institution is not yet ranked against a calibrated cohort; benchmarks will be introduced when the dataset supports them honestly.',
    'A regulatory finding. The score is a self-reported diagnostic and is not produced by, sponsored by, or filed with any examining authority.',
  ],
};
```

- [ ] **Step 2: Quick smoke check (no test file — just compile)**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add content/assessments/v2/scoring-authority.ts
git commit -m "content(assessment): add score-authority framing copy (Wave 1, A.2)"
```

---

## Task 7: Re-export new modules from the v2 index barrel

**Files:**
- Modify: `content/assessments/v2/index.ts`

- [ ] **Step 1: Read the existing barrel file to understand its export style**

Run: `cat content/assessments/v2/index.ts`

- [ ] **Step 2: Append three re-export lines (preserve existing exports)**

Add to the end of `content/assessments/v2/index.ts`:

```typescript
export * from './maturity';
export * from './governance';
export * from './scoring-authority';
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add content/assessments/v2/index.ts
git commit -m "chore(assessment): re-export Wave 1 modules from v2 barrel"
```

---

## Task 8: Wire tier-blocker into `/results/[id]` (proof integration #1)

**Files:**
- Modify: `src/app/results/[id]/page.tsx`

The integration is intentionally minimal: render the tier-blocker line beneath wherever the tier label currently appears, plus the stage name as a small subtitle. This proves data flows and gives the user something visible, but does not redesign the page (Wave C does that).

- [ ] **Step 1: Read the current page to find where the tier label is rendered**

Run: `cat src/app/results/[id]/page.tsx`

Identify the JSX block where the tier label (e.g., "Building Momentum") is shown. The integration goes immediately beneath it.

- [ ] **Step 2: Import the maturity helpers at the top of the file**

Add to the imports:

```typescript
import { getTierMaturity } from '@/../content/assessments/v2/maturity';
```

(Adjust the import path to match the existing project convention used for other v2 imports in this file. Check the existing imports first.)

- [ ] **Step 3: Render the stage name and blocker beneath the tier label**

Find the JSX that renders the tier label and append immediately after it (preserve existing classes; add the new block with consistent typography — DM Sans body, Cormorant SC for the stage label):

```tsx
{(() => {
  const m = getTierMaturity(tier.id);
  return (
    <div className="mt-2">
      <div className="text-xs uppercase tracking-wide font-display-sc text-ink/60">
        {m.stageName}
      </div>
      {m.blockerToNext && (
        <p className="mt-2 text-sm text-ink/80 max-w-prose">
          <span className="font-medium">What’s holding you here:</span>{' '}
          {m.blockerToNext}
        </p>
      )}
    </div>
  );
})()}
```

(If the local component already has access to `tier` under a different name, substitute it. If `font-display-sc` is not the project's Cormorant SC class, use the actual class name from the existing codebase.)

- [ ] **Step 4: Build and visually verify locally**

Run:
```bash
npm run build
```
Expected: zero TypeScript errors.

Then start the dev server and visit any `/results/<id>` to confirm the stage name + blocker render beneath the tier label without breaking layout.

- [ ] **Step 5: Commit**

```bash
git add src/app/results/[id]/page.tsx
git commit -m "feat(results): render maturity stage + blocker beneath tier label"
```

---

## Task 9: Wire tier-blocker + score-authority footer into `ExecSummary` (proof integration #2)

**Files:**
- Modify: `src/app/assessment/results/print/_components/ExecSummary.tsx`

The print/PDF surface is the gold-standard deliverable per the spec's Design Bar. Same blocker line rendered with print-appropriate typography, plus a small "About this score" footer block citing `SCORE_AUTHORITY.whatItDoesNotClaim` (the integrity-earning section).

- [ ] **Step 1: Read the current component**

Run: `cat src/app/assessment/results/print/_components/ExecSummary.tsx`

- [ ] **Step 2: Add imports**

```typescript
import { getTierMaturity } from '@/../content/assessments/v2/maturity';
import { SCORE_AUTHORITY } from '@/../content/assessments/v2/scoring-authority';
```

(Match path convention used for other v2 imports in this file.)

- [ ] **Step 3: Render the stage subtitle + blocker beneath the tier label**

Locate the JSX that renders the tier label in `ExecSummary`. Append:

```tsx
{(() => {
  const m = getTierMaturity(tier.id);
  return (
    <div className="mt-1">
      <div className="text-[10pt] uppercase tracking-[0.08em] font-display-sc text-ink/60">
        {m.stageName}
      </div>
      {m.blockerToNext && (
        <p className="mt-3 text-[11pt] leading-snug text-ink/85">
          <span className="font-medium">What’s holding you here:</span>{' '}
          {m.blockerToNext}
        </p>
      )}
    </div>
  );
})()}
```

- [ ] **Step 4: Append the "About this score" footer block at the end of the component's main content (before the closing wrapper)**

```tsx
<aside className="mt-10 pt-6 border-t border-ink/10 text-[9pt] leading-relaxed text-ink/65">
  <div className="font-display-sc uppercase tracking-[0.08em] mb-2 text-ink/55">
    About this score
  </div>
  <p className="mb-2">{SCORE_AUTHORITY.scaleMeaning}</p>
  <p className="font-medium mt-3 mb-1 text-ink/75">This score does not claim:</p>
  <ul className="list-disc pl-4 space-y-1">
    {SCORE_AUTHORITY.whatItDoesNotClaim.map((claim, i) => (
      <li key={i}>{claim}</li>
    ))}
  </ul>
</aside>
```

(Adapt typographic classes to whatever the existing print components use. The point is: small, footer-weight, integrity-earning, not promotional.)

- [ ] **Step 5: Build and visually verify**

Run: `npm run build`
Expected: zero TypeScript errors.

Then visit a print-results URL locally and confirm the new content renders without breaking the print layout.

- [ ] **Step 6: Commit**

```bash
git add src/app/assessment/results/print/_components/ExecSummary.tsx
git commit -m "feat(print): render maturity stage + score-authority footer in ExecSummary"
```

---

## Task 10: Run full test suite and type check

**Files:** none

- [ ] **Step 1: Run the full Vitest suite**

Run: `npm test`
Expected: all green. New tests in `maturity.test.ts` and `governance.test.ts` pass alongside existing tests.

- [ ] **Step 2: Run the full TypeScript build**

Run: `npm run build`
Expected: zero errors, build completes.

- [ ] **Step 3: Run the linter**

Run: `npm run lint`
Expected: clean, or only pre-existing warnings unrelated to Wave 1 files.

- [ ] **Step 4: Final Wave 1 commit (only if anything dirty remains)**

```bash
git status
# if any housekeeping changes appear:
git add -A && git commit -m "chore(assessment): Wave 1 housekeeping"
```

---

## Wave 1 Definition of Done

- [ ] `content/assessments/v2/maturity.ts` exports `TIER_MATURITY`, `BANKING_ROLES`, `DIMENSION_TIER_LADDER`, `getTierMaturity`, `getDimensionTier`, `getDimensionTierMeaning`
- [ ] `content/assessments/v2/governance.ts` exports `GOVERNANCE_BY_DIMENSION`, `getGovernanceFor`
- [ ] `content/assessments/v2/scoring-authority.ts` exports `SCORE_AUTHORITY`
- [ ] All 32 dimension-tier ladder cells authored, no duplicates, all non-empty
- [ ] All 9 banking roles authored with non-trivial context lines
- [ ] All 8 dimensions have governance defaults across all 5 attributes
- [ ] `/results/[id]` renders stage name + blocker beneath tier label
- [ ] Print `ExecSummary` renders stage name, blocker, and "About this score" footer
- [ ] `npm test`, `npm run build`, `npm run lint` all pass
- [ ] All commits land on a feature branch (`feature/wave-1-bucket-a-diagnostic-framework`); no direct pushes to `main` or `staging`

## Notes for the Implementer

- This wave is content-heavy. Resist the temptation to rewrite content "to make it better" without checking with the user — every line was authored against the Design Bar in the spec. If you spot a real prose issue, flag it; do not silently rewrite.
- Wave 1 deliberately does not redesign any surface. The two integrations exist only to prove the data flows. Visual treatments (radar, governance strip, progression visual, operating-briefing-card) are Wave C.
- The trap in Task 3 step 3 (`building-potential` typo) is intentional. If you missed it and tests passed anyway, slow down — the tests will pass with the typo because the cast suppresses the type error, and the runtime test counts the wrong row as the missing one. Read the code.
- Banking-role overlay onto starter artifacts is *not* in Wave 1 — that's Wave A.4's overlay step which lands as part of Wave B's recommendation restructure. Wave 1 ships only the taxonomy.
