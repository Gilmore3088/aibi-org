// AiBI-S Course Content Types
// Pattern follows content/courses/foundation/program/types.ts
// All content is Markdown strings for Kajabi-migration-readiness
// AiBI-S uses Pillar B cobalt color system throughout

export type RoleTrack = 'operations' | 'lending' | 'compliance' | 'finance' | 'retail';

export type Phase = 'foundation' | 'first-build' | 'scale-and-orchestrate';

export const ROLE_TRACK_META: Record<
  RoleTrack,
  {
    readonly label: string;
    readonly code: string;               // Certificate designation suffix
    readonly colorVar: string;           // Always cobalt for AiBI-S; accent varies by track
    readonly description: string;
    readonly primaryPlatforms: readonly string[];
  }
> = {
  operations: {
    label: 'Operations',
    code: '/Ops',
    colorVar: 'var(--color-cobalt)',
    description:
      'Operations managers, back-office leads, and project managers deploying AI to improve efficiency, exception tracking, and operational reporting.',
    primaryPlatforms: ['Copilot in Teams', 'Copilot in Outlook', 'Copilot in Excel', 'Power Automate'],
  },
  lending: {
    label: 'Lending',
    code: '/Lending',
    colorVar: 'var(--color-cobalt)',
    description:
      'Loan officers, credit analysts, and lending managers deploying AI for document analysis, pipeline reporting, and credit policy compliance.',
    primaryPlatforms: ['Claude Projects', 'ChatGPT Custom GPTs', 'Copilot in Excel'],
  },
  compliance: {
    label: 'Compliance',
    code: '/Compliance',
    colorVar: 'var(--color-cobalt)',
    description:
      'Compliance officers, BSA/AML analysts, and risk managers deploying AI for regulatory research, policy gap analysis, and examination preparation.',
    primaryPlatforms: ['Perplexity', 'NotebookLM', 'Claude Projects'],
  },
  finance: {
    label: 'Finance',
    code: '/Finance',
    colorVar: 'var(--color-cobalt)',
    description:
      'CFOs, controllers, financial analysts, and ALCO members deploying AI for variance analysis, board reporting, and financial narrative generation.',
    primaryPlatforms: ['Claude Projects', 'Copilot in Excel'],
  },
  retail: {
    label: 'Retail',
    code: '/Retail',
    colorVar: 'var(--color-cobalt)',
    description:
      'Branch managers, member services leads, and contact center managers deploying AI for member communications, FAQ automation, and service operations.',
    primaryPlatforms: ['Copilot in Outlook', 'Copilot in Teams', 'ChatGPT Custom GPTs', 'Claude Projects'],
  },
} as const;

export const PHASE_META: Record<
  Phase,
  {
    readonly label: string;
    readonly weeks: readonly number[];
    readonly colorVar: string;
    readonly coreQuestion: string;
    readonly learnerGets: string;
  }
> = {
  foundation: {
    label: 'Foundation',
    weeks: [1, 2],
    colorVar: 'var(--color-cobalt)',
    coreQuestion: 'How do I turn personal AI skills into institutional assets?',
    learnerGets:
      'Work audit identifying top automation candidates, departmental AI workspace configured and documented.',
  },
  'first-build': {
    label: 'First Build',
    weeks: [3, 4],
    colorVar: 'var(--color-cobalt)',
    coreQuestion: 'How do I build and measure something real for my department?',
    learnerGets: 'Deployed automation with measured time savings and a vendor evaluation framework applied.',
  },
  'scale-and-orchestrate': {
    label: 'Scale and Orchestrate',
    weeks: [5, 6],
    colorVar: 'var(--color-cobalt)',
    coreQuestion: 'How do I standardize, document, and transfer what I built?',
    learnerGets:
      'Departmental skill library with training materials, ownership matrix, and full capstone process improvement package.',
  },
} as const;

// Per-track variations within a single week
export interface RoleTrackContent {
  readonly platformFocus: string;              // Primary platform(s) for this track this week
  readonly deepDiveTopics: readonly string[];  // Track-specific content areas
  readonly activityVariations: string;         // How the week's activity differs for this track
  readonly skillExamples: readonly string[];   // Concrete banking examples for this track
}

// Activity field types mirror AiBI-Foundation for consistency
export type ActivityType = 'free-text' | 'form' | 'drill' | 'builder' | 'iteration' | 'audit';

export interface ActivityField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'radio' | 'select' | 'file' | 'table';
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly required: boolean;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
}

export interface Activity {
  readonly id: string;               // e.g. "1.1", "3.1"
  readonly title: string;
  readonly description: string;
  readonly type: ActivityType;
  readonly estimatedMinutes: number;
  readonly fields: readonly ActivityField[];
  readonly submissionFormat: string;
  readonly dueBy: string;            // e.g. "Before the W2 live session"
  readonly peerReview: boolean;
  readonly peerReviewPrompt?: string;
  readonly completionTrigger?: 'artifact-download' | 'module-advance' | 'save-response';
}

export interface Section {
  readonly id: string;
  readonly title: string;
  readonly content: string;          // Markdown prose
  readonly subsections?: readonly Section[];
}

export interface ContentTable {
  readonly id: string;
  readonly caption: string;
  readonly columns: readonly { readonly header: string; readonly key: string }[];
  readonly rows: readonly Record<string, string>[];
}

export interface CohortWeek {
  readonly number: number;           // 1-6
  readonly phase: Phase;
  readonly title: string;
  readonly estimatedLiveMinutes: number;
  readonly estimatedAssignmentMinutes: number;
  readonly learningGoals: readonly string[];
  readonly whyThisWeekExists: string;   // Rationale for the week's design
  readonly sections: readonly Section[];
  readonly tables?: readonly ContentTable[];
  readonly activities: readonly Activity[];
  readonly keyOutput: string;           // One-line description of the primary deliverable
  readonly roleTrackContent: Record<RoleTrack, RoleTrackContent>;
  readonly mockupRef?: string;
}
