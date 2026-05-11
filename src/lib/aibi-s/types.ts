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
  readonly prompt: string;
  readonly guidance: string;
  readonly minWords: number;
}

// --- Defend beat ---------------------------------------------------------

export interface DefendBeatPersona {
  readonly id: string;
  readonly displayName: string;
  readonly trackCode: TrackCode;
  readonly phase: 1 | 2 | 3;
  readonly memoMarkdown: string;
  readonly chatSystemPrompt: string;
  readonly maxChatTurns: number;
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
  readonly guidance: string;
}

// --- Capture beat -------------------------------------------------------

export interface CaptureBeatContent {
  readonly kind: 'capture';
  readonly artifactLabel: string;
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
  readonly id: string;
  readonly trackCode: TrackCode;
  readonly phase: 1 | 2 | 3;
  readonly title: string;
  readonly summary: string;
  readonly beats: readonly BeatContent[];
}

// --- Rubric (shared by Defend beats and AI-judge responses) ------------

export interface RubricDimension {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly maxScore: 4;
}

export interface Rubric {
  readonly id: string;
  readonly dimensions: readonly RubricDimension[];
  readonly passingTotal: number;
  readonly passingMinPerDimension: number;
}

export interface RubricScore {
  readonly rubricId: string;
  readonly dimensionScores: Readonly<Record<string, number>>;
  readonly total: number;
  readonly passed: boolean;
  readonly feedback: string;
}

// --- Persona chat --------------------------------------------------------

export interface ChatTurn {
  readonly role: 'persona' | 'learner';
  readonly content: string;
  readonly turnIndex: number;
}

// --- Learner state (prototype: localStorage-persisted) -----------------

export interface UnitLearnerState {
  readonly unitId: string;
  readonly currentBeatIndex: number;
  readonly practiceChoice: string | null;
  readonly applyResponse: string;
  readonly rebuttal: string;
  readonly chatTurns: readonly ChatTurn[];
  readonly rubricScore: RubricScore | null;
  readonly refinedRebuttal: string;
  readonly capturedAt: string | null;
}
