/**
 * POST /skill/run — skill mode (M4). Sandbox Spec §8, TDD §7.
 *
 * A "skill" is a learner-saved parameterized template. For v1 skills live in
 * `addie.toolbox_items` (type='skill') with body_md that JSON-encodes:
 *
 *   {
 *     "exerciseId": "m4-loan-summary",
 *     "fixedLeverSelections": { "tone": "formal", ... },
 *     "slotSchema": [{ "key": "loanText", "label": "Loan summary text" }, ...]
 *   }
 *
 * Execution = run that Exercise with the fixed levers + the learner's
 * inputs mapped onto the exercise's data slots. The fixed levers are
 * authoritative; the learner can supply data slot values only.
 *
 * Entitlement: skill mode requires foundation_individual or
 * foundation_team_seat (paid). Enforced at two layers — checkEntitlement
 * on the underlying Exercise (which should be 'paid'), and an explicit
 * gate here because a paid skill could conceivably point at a 'free'
 * Exercise.
 */

import { z } from 'zod';
import { loadExercise } from '../exercises/loader';
import { getRateLimiter } from '../rateLimit';
import { checkEntitlement } from '../auth/entitlement';
import { getServiceClient } from '../supabase';
import {
  SandboxError,
  enforcePiiPolicy,
  executeOnce,
  logSession,
  validateProviderSwitch,
} from './shared';
import type { LearnerIdentity, ProviderName } from '../types';

export const skillInputSchema = z.object({
  skillId: z.string().min(1).max(128),
  inputs: z.record(z.string(), z.string()),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
});

export type SkillInput = z.infer<typeof skillInputSchema>;

export interface SkillHandlerInput extends SkillInput {
  identity: LearnerIdentity;
  ipAddress: string | null;
}

export interface SkillResult {
  sessionId: string;
  provider: ProviderName;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
}

interface SkillBody {
  exerciseId: string;
  fixedLeverSelections: Record<string, string>;
  // slotSchema is descriptive only — execution uses the underlying exercise's
  // actual dataSlots. We keep it on the body for UI hints; it isn't trusted.
  slotSchema?: Array<{ key: string; label?: string }>;
  presetIds?: string[];
}

function parseSkillBody(raw: string): SkillBody {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SandboxError(400, 'INVALID_SKILL_BODY', 'Skill body is not valid JSON');
  }
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as SkillBody).exerciseId !== 'string'
  ) {
    throw new SandboxError(400, 'INVALID_SKILL_BODY', 'Skill body missing exerciseId');
  }
  const obj = parsed as SkillBody;
  return {
    exerciseId: obj.exerciseId,
    fixedLeverSelections: obj.fixedLeverSelections ?? {},
    slotSchema: obj.slotSchema ?? [],
    presetIds: obj.presetIds ?? [],
  };
}

interface SkillRow {
  id: string;
  user_id: string | null;
  type: string;
  latest_body_md: string | null;
}

async function loadSkill(
  skillId: string,
  identity: LearnerIdentity,
): Promise<SkillBody> {
  // The skill must belong to this learner (or be assignable — we'll only
  // allow owner-loaded skills for v1).
  if (!identity.learnerId) {
    throw new SandboxError(401, 'AUTH_REQUIRED', 'Sign in required to run skills');
  }
  const supabase = getServiceClient();
  const { data: item, error } = await supabase
    .from('toolbox_items')
    .select('id, user_id, type')
    .eq('id', skillId)
    .eq('type', 'skill')
    .eq('user_id', identity.learnerId)
    .maybeSingle<SkillRow>();
  if (error) {
    throw new SandboxError(500, 'SKILL_LOAD_FAILED', error.message);
  }
  if (!item) {
    throw new SandboxError(404, 'SKILL_NOT_FOUND', `Skill not found: ${skillId}`);
  }
  const { data: version, error: vErr } = await supabase
    .from('toolbox_item_versions')
    .select('body_md, version')
    .eq('item_id', skillId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle<{ body_md: string; version: number }>();
  if (vErr || !version) {
    throw new SandboxError(404, 'SKILL_HAS_NO_BODY', 'Skill has no saved body');
  }
  return parseSkillBody(version.body_md);
}

export async function runSkill(input: SkillHandlerInput): Promise<SkillResult> {
  // 1. Auth gate (skill mode is paid-only).
  if (!input.identity.learnerId) {
    throw new SandboxError(401, 'AUTH_REQUIRED', 'Sign in required to run skills');
  }
  const paidEnt = await checkEntitlement(input.identity, 'paid');
  if (!paidEnt.allowed) {
    throw new SandboxError(403, 'NOT_ENTITLED', paidEnt.reason ?? 'skill_requires_paid');
  }

  // 2. Load skill body.
  const skill = await loadSkill(input.skillId, input.identity);

  // 3. Load underlying exercise.
  const exercise = await loadExercise(skill.exerciseId);
  if (!exercise) {
    throw new SandboxError(
      404,
      'EXERCISE_NOT_FOUND',
      `Skill references missing exercise: ${skill.exerciseId}`,
    );
  }

  // 4. Map learner inputs onto the exercise's actual data slots. Any input
  // key not in the exercise dataSlots will be rejected by the assembler;
  // any required slot not supplied will also be rejected there.
  const dataSlotValues = { ...input.inputs };

  const requestedProvider: ProviderName = input.provider ?? exercise.defaultProvider;
  validateProviderSwitch(exercise, requestedProvider);

  // 5. Rate limit.
  const decision = await getRateLimiter().check({
    identity: input.identity,
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    provider: requestedProvider,
    ipAddress: input.ipAddress,
  });
  if (!decision.allowed) {
    throw new SandboxError(429, 'RATE_LIMITED', decision.reason ?? 'rate_limited');
  }

  // 6. PII pre-check on learner inputs.
  enforcePiiPolicy({
    exercise,
    identity: input.identity,
    leverSelections: skill.fixedLeverSelections,
    dataSlotValues,
    presetIds: skill.presetIds ?? [],
    requestedProvider,
  });

  // 7. Execute.
  const exec = await executeOnce({
    exercise,
    identity: input.identity,
    leverSelections: skill.fixedLeverSelections,
    dataSlotValues,
    presetIds: skill.presetIds ?? [],
    requestedProvider,
  });

  // 8. Log.
  const sessionId = await logSession({
    identity: input.identity,
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    mode: 'skill',
    provider: exec.provider,
    leverSelections: skill.fixedLeverSelections,
    presetIds: skill.presetIds ?? [],
    tokens: exec.tokensUsed,
    estCostUsd: exec.estCostUsd,
    flagged: exec.flagged,
    flagReasons: exec.flagReasons,
  });

  return {
    sessionId,
    provider: exec.provider,
    outputText: exec.outputText,
    tokensUsed: exec.tokensUsed,
    flagged: exec.flagged,
  };
}
