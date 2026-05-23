/**
 * Loads a full Exercise (incl. server-only fields) from addie.exercises by id.
 * Never expose the return value of this function in an API response.
 */

import { getServiceClient } from '../supabase';
import type {
  Exercise,
  ExerciseMode,
  ProviderName,
  EntitlementTier,
  PresetContextBlock,
} from '../types';

interface ExerciseRow {
  id: string;
  lesson_id: string | null;
  mode: ExerciseMode;
  track_variant: string | null;
  system_prompt: string;
  lever_directives: Record<string, Record<string, string>>;
  task_scaffold: string;
  levers: unknown;
  data_slots: unknown;
  preset_context_blocks: PresetContextBlock[];
  default_provider: ProviderName;
  allow_provider_switch: boolean;
  gating: { maxOutputTokens: number; maxOutputChars: number };
  entitlement: EntitlementTier;
}

export async function loadExercise(exerciseId: string): Promise<Exercise | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .eq('published', true)
    .maybeSingle<ExerciseRow>();

  if (error) {
    throw new Error(`sandbox-service: failed to load exercise ${exerciseId}: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    lessonId: data.lesson_id,
    mode: data.mode,
    trackVariant: data.track_variant,
    systemPrompt: data.system_prompt,
    leverDirectives: data.lever_directives,
    taskScaffold: data.task_scaffold,
    // levers/dataSlots are descriptors only — shape validated by the writer (DB authoring tool)
    levers: (data.levers as Exercise['levers']) ?? [],
    dataSlots: (data.data_slots as Exercise['dataSlots']) ?? [],
    presetContextBlocks: data.preset_context_blocks ?? [],
    defaultProvider: data.default_provider,
    allowProviderSwitch: data.allow_provider_switch,
    gating: data.gating,
    entitlement: data.entitlement,
  };
}
