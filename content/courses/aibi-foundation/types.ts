// AiBI-Foundation v2 — Course Content Types
// Pattern follows content/courses/foundation-program/types.ts (the v1 Practitioner course).
// v2 introduces a four-track product family under one credential:
//   - Foundation Lite (4 modules · 90 min · $99 · mandatory bank-wide)
//   - Foundation Full (20 modules · 9.5 hrs · $495)
//   - Manager Track (3 modules · 90 min · $195)
//   - Board Briefing (2 modules · 60 min · $295/dir or $1,495 flat)
// Canonical reference: Plans/foundation-v2/AIBI-FOUNDATION-COMPLETE.md
// Decision context: CLAUDE.md → Decisions Log → 2026-05-09 entry

export type TrackId = 'lite' | 'full' | 'manager' | 'board';

export type Pillar = 'awareness' | 'understanding' | 'creation' | 'application';

export const PILLAR_META: Record<
  Pillar,
  { readonly label: string; readonly colorVar: string }
> = {
  awareness: { label: 'Awareness', colorVar: 'var(--color-sage)' },
  understanding: { label: 'Understanding', colorVar: 'var(--color-cobalt)' },
  creation: { label: 'Creation', colorVar: 'var(--color-amber)' },
  application: { label: 'Application', colorVar: 'var(--color-terra)' },
} as const;

export const PILLAR_DESCRIPTIONS: Record<Pillar, string> = {
  awareness:
    'Understanding what AI is, what it is not, and what is allowed. Modules 1 to 4 establish the data, regulatory, and behavioral floor before any building begins.',
  understanding:
    'Learning how the tools work and the rules that govern them. Modules 5 to 10 cover cybersecurity, member communication, the regulatory landscape, prompting, and project context.',
  creation:
    'Building repeatable skills. Modules 11 to 15 cover document workflows, spreadsheet patterns, tool comparison, agents, and vendor pitch evaluation.',
  application:
    'Shipping real workflows. Modules 16 to 20 cover role-based use cases, the Personal Prompt Library, incident response, examiner readiness, and the certifying Final Practitioner Lab.',
} as const;

// The v2 doc defines 8 activity types — every learner-facing minute uses one.
export type ActivityType =
  | 'single-prompt' //          Type 1 — Learner writes a prompt; one model responds.
  | 'multi-model' //            Type 2 — Same prompt sent to 3+ models in parallel.
  | 'sort-classify' //          Type 3 — Drag-and-drop classifier with adaptive feedback.
  | 'adaptive-scenario' //      Type 4 — Branching scenario; choice -> consequence.
  | 'build-test' //             Type 5 — Learner builds; platform stress-tests.
  | 'find-flaw' //              Type 6 — Learner annotates planted errors / hallucinations.
  | 'tabletop-sim' //           Type 7 — Multi-step incident walked step by step.
  | 'real-world-capture'; //    Type 8 — Sanitized real artifact upload. DEFERRED at launch.

export const ACTIVITY_TYPE_META: Record<
  ActivityType,
  { readonly label: string; readonly platformLabel: string }
> = {
  'single-prompt': { label: 'Single-model prompt', platformLabel: 'Type 1' },
  'multi-model': { label: 'Multi-model comparison', platformLabel: 'Type 2' },
  'sort-classify': { label: 'Sort / classify', platformLabel: 'Type 3' },
  'adaptive-scenario': { label: 'Adaptive scenario', platformLabel: 'Type 4' },
  'build-test': { label: 'Build & test', platformLabel: 'Type 5' },
  'find-flaw': { label: 'Find the flaw', platformLabel: 'Type 6' },
  'tabletop-sim': { label: 'Tabletop simulation', platformLabel: 'Type 7' },
  'real-world-capture': { label: 'Real-world capture', platformLabel: 'Type 8' },
} as const;

// The Personal Prompt Library schema is a FIXED CONTRACT across the
// credential ladder — Foundation -> Specialist (Departmental Skill Library) ->
// Leader (bank-wide AI portfolio). Do not modify field names without
// coordinating across all three tiers.
export interface PromptLibraryEntry {
  readonly id: string; //                 e.g. MEM-01
  readonly name: string;
  readonly taskType:
    | 'drafting'
    | 'summarizing'
    | 'extracting'
    | 'format-shifting'
    | 'qa'
    | 'workflow';
  readonly role: string;
  readonly frequency: string;
  readonly dataTier: 'public' | 'internal' | 'confidential' | 'restricted';
  readonly toolTier:
    | 'public-ai'
    | 'copilot-chat'
    | 'm365-copilot'
    | 'approved-specialist';
  readonly tool: string;
  readonly project: string;
  readonly systemPrompt: string;
  readonly sampleInput: string;
  readonly sampleOutput: string;
  readonly verification: string;
  readonly preflight: string; //          Default: 'All five questions'
  readonly timeSavedPerUse: string;
  readonly lastTested: string; //         ISO date
  readonly quarterlyReview: string; //    ISO date of next review
  readonly notes: string;
}

export interface ActivityField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'radio' | 'select' | 'file';
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly required: boolean;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
}

// ---- Engine config types ----
// Each interactive engine type accepts a typed config that authors fill in.
// Activities without an engineConfig render the generic form fallback.

export interface ScenarioChoice {
  readonly id: string;
  readonly label: string;
  readonly nextNodeId: string; // 'END' to finish on this choice
  readonly verdict?: 'best' | 'partial' | 'wrong' | 'catastrophic';
  readonly consequence?: string; // shown after pick before continuing
}

export interface ScenarioNode {
  readonly id: string;
  readonly speaker?: string; // e.g. "Member" | "Examiner" | narration
  readonly prompt: string; // the situation / question / line presented
  readonly choices?: readonly ScenarioChoice[]; // omit for END nodes
  readonly endingRubric?: string; // shown when this node is reached as END
  readonly endingVerdict?: 'best' | 'partial' | 'wrong' | 'catastrophic';
}

export interface BranchingScenarioConfig {
  readonly intro?: string;
  readonly startNodeId: string;
  readonly nodes: readonly ScenarioNode[];
  readonly bestPathHint?: string; // shown after completion alongside rubric
}

export interface Activity {
  readonly id: string; //                 e.g. '1.1', 'L2.3', 'BB1.2'
  readonly title: string;
  readonly description: string;
  readonly activityType: ActivityType;
  readonly estimatedMinutes: number;
  readonly fields: readonly ActivityField[];
  readonly completionTrigger?: 'artifact-download' | 'module-advance' | 'save-response';
  readonly artifactId?: string;
  // Optional engine config. When present, the dispatcher renders the matching
  // interactive engine instead of the generic form fallback.
  readonly scenarioConfig?: BranchingScenarioConfig;
}

export interface Section {
  readonly id: string;
  readonly title: string;
  readonly content: string; //            Markdown prose
  readonly subsections?: readonly Section[];
  readonly tryThis?: string;
}

export interface TableColumn {
  readonly header: string;
  readonly key: string;
}

export interface ContentTable {
  readonly id: string;
  readonly caption: string;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly Record<string, string>[];
}

export interface ArtifactDefinition {
  readonly id: string; //                 e.g. '01-rewritten-member-communication'
  readonly title: string;
  readonly description: string;
  readonly format: 'pdf' | 'md' | 'pdf+md';
  readonly triggeredBy: string; //        activity ID or 'module-complete'
  readonly dynamic: boolean;
  readonly templatePath?: string; //      e.g. 'Plans/foundation-v2/.../artifacts/01-...md'
}

export interface FoundationModule {
  readonly number: number; //             sequence within track
  readonly id: string; //                 e.g. 'm12-spreadsheet', 'l4-member-talk', 'bb1-vocabulary'
  readonly trackId: TrackId;
  readonly trackPosition: string; //      Display label: '1', 'L1', 'M1', 'BB1'
  readonly title: string;
  readonly pillar?: Pillar; //            Required for Full track; optional for Lite/Manager/Board
  readonly estimatedMinutes: number;
  readonly keyOutput: string; //          One-line description of what learner produces
  readonly dailyUseOutcomes: readonly string[];
  readonly whyThisExists?: string; //     Markdown — the v2 doc framing for this module
  readonly learningObjectives?: readonly string[];
  readonly activityTypes: readonly ActivityType[]; //  Which types this module exercises
  readonly sections: readonly Section[];
  readonly tables?: readonly ContentTable[];
  readonly activities: readonly Activity[];
  readonly artifacts?: readonly ArtifactDefinition[];
  readonly forwardLinks?: readonly string[]; // module IDs this feeds into
  readonly dependencies?: readonly string[]; // module IDs this depends on
  readonly specRef: string; //            Path under Plans/foundation-v2/
}

export interface Track {
  readonly id: TrackId;
  readonly label: string;
  readonly tagline: string;
  readonly audience: string;
  readonly mandate: 'mandatory-bank-wide' | 'opt-in' | 'role-based' | 'no-prereq';
  readonly prerequisite?: string;
  readonly totalModules: number;
  readonly totalMinutes: number;
  readonly priceCents: number; //         Per-learner price in cents
  readonly priceCentsAlternate?: number; // For Board: $1,495 flat-rate alternative
  readonly priceLabel: string; //         Human-readable price label
  readonly pillarColor: string; //        Lite=cobalt, Full=terra, Manager=cobalt, Board=sage
  readonly modules: readonly FoundationModule[];
}

export const TRACK_META: Record<TrackId, Omit<Track, 'modules'>> = {
  lite: {
    id: 'lite',
    label: 'AiBI-Foundation Lite',
    tagline: 'Literacy and safe-use baseline for every bank employee.',
    audience:
      'Every employee — tellers, vault, custodial, board orientation, seasonal staff. Designed for staff who need to recognize and avoid risk without building AI workflows themselves.',
    mandate: 'mandatory-bank-wide',
    totalModules: 4,
    totalMinutes: 90,
    priceCents: 9900,
    priceLabel: '$99',
    pillarColor: 'var(--color-cobalt)',
  },
  full: {
    id: 'full',
    label: 'AiBI-Foundation Full',
    tagline: 'The full skill-building practitioner course.',
    audience:
      'Any employee who will actually use AI for work — drafting, analyzing documents, building workflows. Includes the certifying Final Practitioner Lab.',
    mandate: 'opt-in',
    totalModules: 20,
    totalMinutes: 570,
    priceCents: 49500,
    priceLabel: '$495',
    pillarColor: 'var(--color-terra)',
  },
  manager: {
    id: 'manager',
    label: 'AiBI Manager Track',
    tagline: 'Coaching, reviewing, and closing the loop on team AI use.',
    audience:
      'Anyone supervising AI users — branch managers, department heads, team leads, compliance supervisors.',
    mandate: 'role-based',
    prerequisite: 'Foundation Full (or Foundation Lite + 6 months supervisory experience).',
    totalModules: 3,
    totalMinutes: 90,
    priceCents: 19500,
    priceLabel: '$195',
    pillarColor: 'var(--color-cobalt)',
  },
  board: {
    id: 'board',
    label: 'AiBI Board Briefing',
    tagline: 'AI governance for community bank directors.',
    audience: 'Directors. No prerequisites — designed to be the starting point for board-level AI fluency.',
    mandate: 'no-prereq',
    totalModules: 2,
    totalMinutes: 60,
    priceCents: 29500,
    priceCentsAlternate: 149500,
    priceLabel: '$295/director or $1,495 flat board rate',
    pillarColor: 'var(--color-sage)',
  },
} as const;

// Forward-compatible flag: activity types that depend on platform features
// not yet built. Used by the route layer to render a "coming soon" state.
export const DEFERRED_ACTIVITY_TYPES: readonly ActivityType[] = [
  'real-world-capture', // Type 8 — NPI regex guard + sanitized upload (deferred at v2 launch)
] as const;
