// AiBI-P Course Content Types
// Pattern: readonly typed constants, same as content/assessments/v1/
// All content is Markdown strings for Kajabi-migration-readiness (CONT-02)

export type Pillar = 'awareness' | 'understanding' | 'creation' | 'application';

export const PILLAR_META: Record<Pillar, { readonly label: string; readonly colorVar: string }> = {
  awareness:     { label: 'Awareness',     colorVar: 'var(--color-sage)' },
  understanding: { label: 'Understanding', colorVar: 'var(--color-cobalt)' },
  creation:      { label: 'Creation',      colorVar: 'var(--color-amber)' },
  application:   { label: 'Application',   colorVar: 'var(--color-terra)' },
} as const;

export const PILLAR_DESCRIPTIONS: Record<Pillar, string> = {
  awareness:
    'Identifying AI opportunities and regulatory boundaries in retail banking operations. Covers the five governance frameworks, the AIEOG Lexicon, and the difference between governed and ungoverned AI use.',
  understanding:
    'Platform mastery and safe use guardrails. Covers what you already have access to, how to activate it, platform feature deep dives, and data classification rules every practitioner must follow.',
  creation:
    'Building skills that make AI output institutional-grade. Covers the anatomy of a repeatable skill, the five-component Skill Builder, and writing your first skill with real banking language.',
  application:
    'Real-world automation and the assessed work product. Covers testing and iterating a skill, building a complete automation workflow, and the capstone submission that earns your certification.',
} as const;

export type ActivityType = 'free-text' | 'form' | 'drill' | 'builder' | 'iteration';

export interface ActivityField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'textarea' | 'radio' | 'select' | 'file';
  readonly placeholder?: string;
  readonly minLength?: number;       // CONT-05: minimum character requirements
  readonly required: boolean;
  readonly options?: readonly { readonly value: string; readonly label: string }[];
}

export interface Activity {
  readonly id: string;              // e.g. "1.1", "5.2"
  readonly title: string;
  readonly description: string;
  readonly type: ActivityType;
  readonly fields: readonly ActivityField[];
  readonly completionTrigger?: 'artifact-download' | 'module-advance' | 'save-response';
  readonly artifactId?: string;     // references ArtifactDefinition.id if this activity triggers a download
}

export interface Section {
  readonly id: string;
  readonly title: string;
  readonly content: string;         // Markdown prose — rendered by a shared Markdown component
  readonly subsections?: readonly Section[];
  readonly tryThis?: string;        // Optional practice prompt — short, concrete, applies what the section just taught
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
  readonly id: string;              // e.g. "regulatory-cheatsheet", "acceptable-use-card"
  readonly title: string;
  readonly description: string;
  readonly format: 'pdf' | 'md' | 'pdf+md';
  readonly triggeredBy: string;     // activity ID or "module-complete"
  readonly dynamic: boolean;        // true if personalized from learner data
}

export interface Module {
  readonly number: number;           // module sequence number
  readonly id: string;               // e.g. "m1-regulatory-landscape"
  readonly title: string;
  readonly pillar: Pillar;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;        // one-line description of what learner produces
  readonly sections: readonly Section[];
  readonly tables?: readonly ContentTable[];
  readonly activities: readonly Activity[];
  readonly artifacts?: readonly ArtifactDefinition[];
  readonly mockupRef?: string;       // optional — legacy stitch mockups retired 2026-05-09
  readonly roleSpecific?: boolean;   // true if content varies by onboarding role
}
