// AiBI-Foundation v2 — Quarterly Refresh Slots
//
// Phase 6 architecture. The v2 curriculum bakes a 90-day refresh cycle into
// the design — planted-error rotation, scenario rotation, vendor pitch deck
// rotation, examiner-question rotation. This file declares the slot SHAPES;
// the actual content variations are authored quarterly.
//
// Slot lifecycle:
//   - `current`   — the variation live in production right now
//   - `onDeck`    — the next variation, authored and reviewed, ready to swap
//                   in at the next quarterly release
//   - `archive`   — past variations kept for examiner audit + author bible
//
// At quarter rollover the operator promotes onDeck -> current and writes a
// new onDeck. Archive grows by one entry per quarter.
//
// The runtime reads `current` only. The other slots are operator-side state
// and never reach the learner.

export type RefreshFrequency = 'quarterly' | 'annual';

export interface RefreshVariation<T> {
  readonly id: string; //          e.g. '2026-Q2-set-A'
  readonly authoredOn: string; //  ISO date
  readonly authorNote?: string; // why this variation, what it tests
  readonly content: T;
}

export interface RefreshSlot<T> {
  readonly slotId: string; //              e.g. 'm04-data-tier-sort'
  readonly moduleId: string; //            FoundationModule.id
  readonly description: string; //         what gets rotated
  readonly frequency: RefreshFrequency;
  readonly current: RefreshVariation<T>;
  readonly onDeck?: RefreshVariation<T>;
  readonly archive: readonly RefreshVariation<T>[];
}

// The seven slots called out by the v2 spec. Content shapes are intentionally
// loose (`unknown`) at this stage — concrete shapes get filled in when the
// activity engines bind to them in Phase 5.

export interface SortItem {
  readonly id: string;
  readonly artifact: string; //            e.g. 'Loan list with member names'
  readonly correctTier: 'public' | 'internal' | 'confidential' | 'restricted';
  readonly explanation: string; //         shown after a wrong pick
}

export interface PlantedFabrication {
  readonly id: string;
  readonly prompt: string; //              the prompt sent to the model
  readonly fabricatedClaim: string; //     the lie the model produced
  readonly correctSource: string; //       primary source for verification
}

export interface VendorPitch {
  readonly id: string;
  readonly vendorName: string; //          anonymized
  readonly pitchSummary: string;
  readonly evasionPattern: 'wrap-around' | 'we-will-get-back' | 'compliance-implies' | 'none';
  readonly substanceScore: number; //      0-12, against the scorecard
}

export interface ExaminerScenario {
  readonly id: string;
  readonly question: string;
  readonly bestPath: string;
  readonly artifactsToReference: readonly string[];
}

export interface FinalLabError {
  readonly id: string;
  readonly description: string;
  readonly category:
    | 'data-tier'
    | 'hallucination'
    | 'wrong-tool'
    | 'missing-checkpoint'
    | 'compliance-misread'
    | 'verification-skip';
  readonly severity: 'minor' | 'major' | 'catastrophic';
}

// The slot DEFINITIONS — what gets rotated per module. Concrete `current`
// variation content lives in companion files (one per quarter).
export const REFRESH_SLOTS = {
  m04SortBank: {
    slotId: 'm04-data-tier-sort',
    moduleId: 'f4-five-never-dos',
    description: '20-item sort bank for the data-tier classifier (Foundation Full M4 / Lite L3 12-item subset).',
    frequency: 'quarterly' as const,
  },
  m02Hallucinations: {
    slotId: 'm02-planted-fabrications',
    moduleId: 'f2-what-ai-is',
    description: 'Planted hallucinations across three models for the Hallucination Lab.',
    frequency: 'quarterly' as const,
  },
  m11ExtractError: {
    slotId: 'm11-extraction-flaw',
    moduleId: 'f11-document-workflows',
    description: 'Planted issue in structured extraction (one row per quarter).',
    frequency: 'quarterly' as const,
  },
  m12AnomalyHunt: {
    slotId: 'm12-anomaly-false-positive',
    moduleId: 'f12-spreadsheet-workflows',
    description: 'Planted real anomalies + at least one false positive in the 50-row dataset.',
    frequency: 'quarterly' as const,
  },
  m15VendorPitches: {
    slotId: 'm15-vendor-pitch-decks',
    moduleId: 'f15-vendor-pitch',
    description: 'Three anonymized vendor pitch decks for the decoder lab.',
    frequency: 'annual' as const,
  },
  m19ExaminerQuestions: {
    slotId: 'm19-examiner-scenarios',
    moduleId: 'f19-examiner-prep',
    description: 'Five examiner scenarios; rotate at least 2 of 5 per quarter.',
    frequency: 'quarterly' as const,
  },
  m20FinalLabErrors: {
    slotId: 'm20-final-lab-errors',
    moduleId: 'f20-final-lab',
    description: '6-9 planted errors in the certifying scenario, rotated quarterly so labs do not go stale.',
    frequency: 'quarterly' as const,
  },
} as const;

export type RefreshSlotKey = keyof typeof REFRESH_SLOTS;

// --- Current quarter state ---
// Empty until the first content variations are authored. This is the runtime
// surface — engines read from here. Operator workflow:
//
//   1. Author the first set of variations under
//      content/courses/aibi-foundation/refresh/2026-Q2-*.ts
//   2. Import them into this map under `current`.
//   3. At the next quarterly release, author the next set; populate `onDeck`.
//   4. At rollover, promote onDeck to current; current goes to archive[0].

export const CURRENT_VARIATIONS: {
  readonly [K in RefreshSlotKey]?: RefreshSlot<unknown>;
} = {
  // Empty in v2.0.0 — variations authored quarterly.
  // First set due 2026-Q2 release per the v2 launch plan.
};

// --- Helper for runtime engine access ---
// Engines call `getCurrentVariation('m04SortBank')` and either render the
// current variation or fall back to a "content authoring pending" state.

export function getCurrentVariation<T>(key: RefreshSlotKey): RefreshSlot<T> | undefined {
  return CURRENT_VARIATIONS[key] as RefreshSlot<T> | undefined;
}
