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
  | 'problem_backlog'
  | 'where_ai_fits'
  // Phase 2 (2026-05-25) — M4's primary paid artifact. One composite
  // toolbox_items row holding source_packet, prompt_used,
  // first_output, review_tags, improved_output, questions_to_confirm,
  // final_work_product + governance metadata (version, approver,
  // use_boundary, validation_notes). See migration 00074 + recovery
  // plan §"Workbench Pack".
  | 'workbench_pack';

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
  // Audit A8 (2026-05-24): alignment-triangle apex + Gagné event 9.
  // objective_md states the verb-first observable behavior the lesson
  // builds toward; transfer_md is the Monday-morning action that
  // converts the lesson outcome into the learner's actual job.
  readonly objective_md: string | null;
  readonly transfer_md: string | null;
  readonly published: boolean;
  // Phase 1 Guided Lesson Shell migration (2026-05-25):
  // 'legacy' = LessonPlayer (long-scroll), 'step' = LessonStepShell
  // (focused step-by-step via LessonStepPlayer adapter). Default 'legacy'.
  // M01Experience / M02Experience routes branch on lesson_id and ignore
  // this column. See migration 00073.
  readonly shell_kind: 'step' | 'legacy';
}

export interface ModuleRow {
  readonly id: string;
  readonly ordinal: number;
  readonly title: string;
  readonly tier: 'free' | 'paid';
  readonly summary: string | null;
  // Optional photographic hero (migration 00058). When hero_image_url is
  // present, ModuleIllustration renders the photo inside the parchment
  // frame; otherwise it falls back to the bespoke SVG illustration.
  readonly hero_image_url?: string | null;
  readonly hero_image_alt?: string | null;
  readonly hero_image_credit?: string | null;
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
  // Audit A13 (2026-05-24): kind discriminates scored learning-objective
  // checks ('construct', default) from UI/policy/housekeeping checks
  // ('orientation'). KnowledgeCheck renders orientation items in a
  // separate group below the scored checks so the mastery signal stays
  // construct-valid.
  readonly kind: 'construct' | 'orientation';
}

/**
 * The interactive-exercise descriptor forwarded to non-LLM widgets
 * (OffLimitsSorter, ToolLandscapeMatrix, SpotTheViolation, WhereAIFitsWorksheet).
 *
 * NOTE: this includes preset_context_blocks bodies because non-LLM
 * interactives need them to render items/scenarios. system_prompt and
 * lever_directives are NEVER forwarded — those stay strictly inside the
 * sandbox-service for LLM-touching exercises. Sandbox lessons (mode=single/ab/skill)
 * do NOT receive this payload; they call /api/sandbox/run with the
 * exerciseId and the service-role server loads the full row server-side.
 */
export interface SandboxLeverOption {
  readonly id: string;
  readonly label: string;
}

export interface SandboxLeverDescriptor {
  readonly key: string;
  readonly label: string;
  readonly type: 'toggle' | 'select';
  readonly options: ReadonlyArray<SandboxLeverOption>;
}

export interface SandboxDataSlotDescriptor {
  readonly key: string;
  readonly label: string;
  readonly maxChars: number;
  readonly required: boolean;
  readonly piiCheck: true;
}

export interface InteractiveExercisePayload {
  readonly id: string; // alias of exercise_id for widget structural compat
  readonly exercise_id: string;
  readonly task_scaffold: string | null;
  readonly preset_context_blocks: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    /** JSON-encoded payload string; widgets parse with their own validators. */
    readonly body?: string;
  }>;
  /** Client-safe lever descriptors — option ids + labels only. NEVER carries lever_directives. */
  readonly levers?: ReadonlyArray<SandboxLeverDescriptor>;
  /** Client-safe data-slot descriptors. */
  readonly data_slots?: ReadonlyArray<SandboxDataSlotDescriptor>;
  /** Server-default provider hint for the sandbox view. */
  readonly default_provider?: 'anthropic' | 'openai' | 'google';
  /** Whether the learner may switch providers. */
  readonly allow_provider_switch?: boolean;
  /** Exercise mode — single | ab | skill. */
  readonly mode?: 'single' | 'ab' | 'skill';
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
  /** Sibling lesson ids for next/prev nav — may point into the next/prev module. */
  readonly siblings?: {
    readonly prev: { id: string; title: string; moduleId: string } | null;
    readonly next: { id: string; title: string; moduleId: string } | null;
  };
  /** Non-LLM interactive descriptor for modality='interactive' or 'worksheet'. */
  readonly interactiveExercise?: InteractiveExercisePayload | null;
  /** True when the next-CTA should route to the gate (post-m3.5). */
  readonly gateNext?: boolean;
}
