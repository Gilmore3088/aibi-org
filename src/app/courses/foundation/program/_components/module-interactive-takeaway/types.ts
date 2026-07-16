export interface ModuleInteractiveTakeawayProps {
  readonly moduleNumber: number;
  readonly moduleId: string;
  readonly artifactLabel: string;
}

export interface DraftPayload {
  readonly moduleId: string;
  readonly moduleNumber: number;
  readonly model: string;
  readonly dataset: string;
  readonly savedAt: string;
  readonly reviewChecklist: readonly string[];
  readonly content: string;
}

export interface MicroTakeawayStep {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export type SafetyKind = 'pii' | 'action' | 'send';

export interface SafetyHit {
  readonly start: number;
  readonly end: number;
  readonly kind: SafetyKind;
}

export type EmailMove = 'redact' | 'action' | 'owner' | 'deadline';

export type ClaimVerdict = 'verified' | 'unsupported' | 'wrong';

export type ToolCategory = 'general' | 'copilot' | 'search' | 'notebook' | 'escalate';
export type ToolZone = 'green' | 'yellow' | 'red';

export interface StructuredBuilderMove {
  readonly id: string;
  readonly label: string;
  readonly short: string;
  readonly missing: string;
  readonly artifactLine: string;
}

export interface StructuredBuilderConfig {
  readonly moduleNumber: number;
  readonly testId: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly scoreLabel: string;
  readonly badLabel: string;
  readonly badWay: string;
  readonly previewLabel: string;
  readonly artifactHeading: string;
  readonly model: string;
  readonly dataset: string;
  readonly reviewChecklist: readonly string[];
  readonly completeLine: string;
  readonly incompleteLine: string;
  readonly moves: readonly StructuredBuilderMove[];
}

export interface ToolChoiceAnswer {
  readonly category?: ToolCategory;
  readonly zone?: ToolZone;
}
