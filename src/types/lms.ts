// Foundation content types.
//
// Historical note: this file used to hold a competing CourseConfig and
// CourseModule interface that drove Foundation's pre-harness rendering.
// Those interfaces were retired in Phase B4 when Foundation migrated to
// the canonical CourseConfig in src/lib/lms/types.ts. The remaining
// exports here are Foundation-specific *content* types (practice reps,
// artifacts, certificate requirements) that don't generalize to other
// courses and don't belong in the harness.
//
// AiBI-S has its own type files in content/courses/aibi-s/ and does not
// import from this file.

import type { LearnerRole } from '@/types/course';

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

export type ArtifactStatus = 'available' | 'in-progress' | 'completed' | 'locked';
export type ArtifactFormat = 'pdf' | 'md' | 'doc' | 'worksheet' | 'prompt-card';

// Foundation course identifier — accepts the legacy 'aibi-p' DB write key,
// the modern 'foundation' slug, and other-course slugs as escape hatch.
// Used by content type fields that record which course a piece of content
// belongs to.
export type CourseId = 'aibi-p' | 'foundation' | 'aibi-s' | 'aibi-l' | (string & {});

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
