import type { LearnerRole } from '@/types/course';

// 'aibi-p' kept as a legacy value forever for Stripe webhook retries and
// pre-Phase 7-backfill DB rows. New writes emit 'foundation'.
// See src/lib/products/normalize.ts for the boundary shim.
export type CourseId = 'aibi-p' | 'foundation' | 'aibi-s' | 'aibi-l' | (string & {});

export type CoursePhase =
  | 'understand'
  | 'safe-use'
  | 'daily-workflows'
  | 'role-application'
  | 'credential';

export type CourseActivityKind =
  | 'reflection'
  | 'form'
  | 'drill'
  | 'builder'
  | 'simulation'
  | 'artifact';

export type ArtifactStatus = 'available' | 'in-progress' | 'completed' | 'locked';
export type ArtifactFormat = 'pdf' | 'md' | 'doc' | 'worksheet' | 'prompt-card';
export type SafetyLevel = 'green' | 'yellow' | 'red';
export type PromptStrategyType =
  | 'structured'
  | 'transformation'
  | 'analysis'
  | 'thinking'
  | 'template'
  | 'sanitization'
  | 'multi-step';
export type PromptTaskType =
  | 'email'
  | 'summary'
  | 'policy'
  | 'board'
  | 'lending'
  | 'complaint'
  | 'meeting'
  | 'report'
  | 'verification'
  | 'sanitization'
  | 'workflow';

export interface CourseConfig {
  readonly id: CourseId;
  readonly title: string;
  readonly shortTitle: string;
  readonly promise: string;
  readonly audience: string;
  readonly estimatedMinutes: number;
  readonly modules: readonly CourseModule[];
  readonly practiceReps: readonly PracticeRep[];
  readonly artifacts: readonly Artifact[];
  readonly certificateRequirements: readonly CertificateRequirement[];
}

export interface CourseModule {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly phase: CoursePhase;
  readonly estimatedMinutes: number;
  readonly keyOutput: string;
  readonly learnerOutcome: string;
  readonly learn: readonly string[];
  readonly practice: PracticeRep | Simulation;
  readonly apply: CourseActivity;
}

export interface CourseActivity {
  readonly id: string;
  readonly kind: CourseActivityKind;
  readonly title: string;
  readonly description: string;
  readonly artifactId?: string;
  readonly countsTowardCertificate: boolean;
}

export interface PracticeRep {
  readonly id: string;
  readonly courseId: CourseId;
  readonly moduleNumber?: number;
  readonly title: string;
  readonly skill: string;
  readonly promptStrategy?: PromptStrategyType;
  readonly role: LearnerRole | 'all';
  readonly timeEstimateMinutes: number;
  readonly scenario: string;
  readonly task: string;
  readonly constraints: readonly string[];
  readonly starterPrompt: string;
  readonly modelAnswer: string;
  readonly feedback: readonly string[];
  readonly reflectionQuestion: string;
  readonly safetyLevel: SafetyLevel;
}

export interface Simulation extends PracticeRep {
  readonly simulationType: 'role-based';
}

export interface Artifact {
  readonly id: string;
  readonly courseId: CourseId;
  readonly moduleNumber?: number;
  readonly title: string;
  readonly description: string;
  readonly format: ArtifactFormat;
  readonly sourceActivityId: string;
  readonly status?: ArtifactStatus;
  readonly downloadHref?: string;
  readonly countsTowardCertificate: boolean;
}

export interface CertificateRequirement {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly requiredCount?: number;
}
