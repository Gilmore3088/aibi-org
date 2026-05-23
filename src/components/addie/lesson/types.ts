// Shared lesson types. Mirrors the addie.lessons row shape — the Wave 2b
// content scaffolding agents seed against this so they know the contract.

export type LessonModality =
  | 'video'
  | 'audio'
  | 'interactive'
  | 'sandbox'
  | 'worksheet'
  | 'reading';

export type Track =
  | 'risk_compliance'
  | 'customer_facing'
  | 'back_office'
  | 'technical'
  | 'leadership';

export type ArtifactType =
  | 'data_discipline_card'
  | 'ai_toolkit_map'
  | 'first_conversation'
  | 'starter_prompt_pack'
  | 'skill'
  | 'skill_template'
  | 'agent_blueprint'
  | 'prd'
  | 'prototype'
  | 'problem_backlog';

export interface LessonRow {
  readonly id: string;
  readonly module_id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly modality: LessonModality;
  readonly duration_min: number;
  readonly is_branched: boolean;
  readonly exercise_id: string | null;
  readonly takeaway_artifact_type: ArtifactType | null;
  readonly body_md: string | null;
  readonly published: boolean;
}

export interface ModuleRow {
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly tier: 'free' | 'paid';
  readonly summary: string | null;
}

export interface TrackVariant {
  readonly lesson_id: string;
  readonly track: Track;
  readonly body_md: string;
  readonly media_ref: string | null;
}

export interface KnowledgeCheckRow {
  readonly id: string;
  readonly lesson_id: string;
  readonly ordinal: number;
  readonly prompt: string;
  readonly options: ReadonlyArray<{
    id: string;
    label: string;
    correct?: boolean;
    explanation?: string;
  }>;
}

/**
 * The shape the LessonPlayer expects. Sandbox/interactive lessons may
 * additionally surface an exercise_id; the modality view dispatches on it.
 */
export interface LessonPayload {
  readonly lesson: LessonRow;
  readonly module: ModuleRow;
  /** Track-specific body if the lesson is branched and we have a learner track. */
  readonly variant?: TrackVariant | null;
  /** Learner's currently selected track (for the player header chip). */
  readonly activeTrack?: Track | null;
  readonly checks: ReadonlyArray<KnowledgeCheckRow>;
  /** Sibling lesson ids for next/prev nav. */
  readonly siblings?: {
    readonly prev: { id: string; title: string } | null;
    readonly next: { id: string; title: string } | null;
  };
}
