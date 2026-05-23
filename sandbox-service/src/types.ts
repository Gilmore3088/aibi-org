/**
 * Sandbox Service — public types.
 *
 * CRITICAL: Exercise (server) and ClientExerciseDescriptor (client-safe) are
 * deliberately different types. `Exercise.systemPrompt` and
 * `Exercise.leverDirectives` MUST NEVER reach the browser. The route that
 * serves `/api/exercise/:id` (not this file's concern) must return only the
 * client-safe descriptor.
 */

export type ProviderName = 'anthropic' | 'openai' | 'google';
export type ExerciseMode = 'single' | 'ab' | 'skill';
export type EntitlementTier = 'free' | 'paid';

export interface LeverOption {
  id: string;
  label: string;
}

export interface LeverDescriptor {
  key: string;
  label: string;
  type: 'toggle' | 'select';
  options: LeverOption[];
}

export interface DataSlotDescriptor {
  key: string;
  label: string;
  maxChars: number;
  required: boolean;
  piiCheck: true;
}

export interface PresetContextBlockDescriptor {
  id: string;
  label: string;
}

export interface PresetContextBlock extends PresetContextBlockDescriptor {
  body: string; // server-only material
}

export interface GatingConfig {
  maxOutputTokens: number;
  maxOutputChars: number;
}

/**
 * CLIENT-SAFE descriptor returned by GET /api/exercise/:id.
 * Contains no system prompt, no lever directive strings, no preset bodies.
 */
export interface ClientExerciseDescriptor {
  id: string;
  lessonId: string | null;
  mode: ExerciseMode;
  trackVariant: string | null;
  taskScaffold: string;
  levers: LeverDescriptor[];
  dataSlots: DataSlotDescriptor[];
  presetContextBlocks: PresetContextBlockDescriptor[];
  defaultProvider: ProviderName;
  allowProviderSwitch: boolean;
  gating: GatingConfig;
  entitlement: EntitlementTier;
}

/**
 * SERVER-ONLY full Exercise record. Loaded by sandbox-service from
 * addie.exercises via the service-role Supabase client. Never serialized
 * to a response body.
 */
export interface Exercise extends ClientExerciseDescriptor {
  systemPrompt: string;
  leverDirectives: Record<string, Record<string, string>>;
  presetContextBlocks: PresetContextBlock[];
}

export interface NormalizedRequest {
  system: string;
  userContent: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ProviderResult {
  outputText: string;
  tokensUsed: number;
}

export interface RunInput {
  exerciseId: string;
  leverSelections: Record<string, string>;
  dataSlotValues: Record<string, string>;
  presetIds: string[];
  provider?: ProviderName;
}

export interface LearnerIdentity {
  learnerId: string | null; // Supabase auth.users.id
  anonSessionId: string | null; // UUID, when no auth
}

export interface RunResult {
  sessionId: string;
  provider: ProviderName;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
}

export interface OutputGateResult {
  outputText: string;
  flagged: boolean;
  flagReasons: string[];
}
