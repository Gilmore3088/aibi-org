/**
 * POST /sandbox/run — single-mode handler.
 *
 * Pure-ish: takes parsed inputs + identity, returns a RunResult.
 * Side effects (DB read, provider call, DB insert) live here / in shared.
 */

import { z } from 'zod';
import { loadExercise } from '../exercises/loader';
import { getRateLimiter } from '../rateLimit';
import { checkEntitlement } from '../auth/entitlement';
import {
  SandboxError,
  enforcePiiPolicy,
  executeOnce,
  logSession,
  validateProviderSwitch,
} from './shared';
import type {
  LearnerIdentity,
  ProviderName,
  RunInput,
  RunResult,
} from '../types';

export { SandboxError };

export const runInputSchema = z.object({
  exerciseId: z.string().min(1).max(128),
  leverSelections: z.record(z.string(), z.string()),
  dataSlotValues: z.record(z.string(), z.string()),
  presetIds: z.array(z.string()),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
});

export interface RunHandlerInput extends RunInput {
  identity: LearnerIdentity;
  ipAddress: string | null;
}

export async function runSandbox(input: RunHandlerInput): Promise<RunResult> {
  // 1. Load Exercise.
  const exercise = await loadExercise(input.exerciseId);
  if (!exercise) {
    throw new SandboxError(404, 'EXERCISE_NOT_FOUND', `Exercise not found: ${input.exerciseId}`);
  }

  // 2. Entitlement.
  const ent = await checkEntitlement(input.identity, exercise.entitlement);
  if (!ent.allowed) {
    throw new SandboxError(403, 'NOT_ENTITLED', ent.reason ?? 'not_entitled');
  }

  // 3. Provider selection / switch policy.
  const requestedProvider: ProviderName = input.provider ?? exercise.defaultProvider;
  validateProviderSwitch(exercise, requestedProvider);

  // 4. Rate limit.
  const decision = await getRateLimiter().check({
    identity: input.identity,
    exerciseId: input.exerciseId,
    lessonId: exercise.lessonId,
    provider: requestedProvider,
    ipAddress: input.ipAddress,
  });
  if (!decision.allowed) {
    throw new SandboxError(429, 'RATE_LIMITED', decision.reason ?? 'rate_limited');
  }

  // 5. PII pre-check.
  enforcePiiPolicy({
    exercise,
    identity: input.identity,
    leverSelections: input.leverSelections,
    dataSlotValues: input.dataSlotValues,
    presetIds: input.presetIds,
    requestedProvider,
  });

  // 6. Execute (assemble → dispatch → gate → cost).
  const exec = await executeOnce({
    exercise,
    identity: input.identity,
    leverSelections: input.leverSelections,
    dataSlotValues: input.dataSlotValues,
    presetIds: input.presetIds,
    requestedProvider,
  });

  // 7. Log.
  const sessionId = await logSession({
    identity: input.identity,
    exerciseId: exercise.id,
    lessonId: exercise.lessonId,
    mode: 'single',
    provider: exec.provider,
    leverSelections: input.leverSelections,
    presetIds: input.presetIds,
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
