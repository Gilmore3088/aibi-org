/**
 * POST /sandbox/ab — A/B mode. Sandbox Spec §8, TDD §7.
 *
 * Runs the SAME exercise under 2–3 lever configurations and returns the
 * per-config outputs side by side. One sandbox_sessions row is logged per
 * config (so analytics + budgets stay consistent with single mode); the
 * `sandbox_ab` audit-event semantics live one layer up (events emitter
 * is out of this handler's scope — emit from the route shim if needed).
 *
 * Rate limit is checked ONCE for the call (not per config) — A/B is one
 * learner action that costs N runs. We do, however, fan out N spend
 * records (one per dispatched provider call) inside executeOnce.
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
import type { LearnerIdentity, ProviderName } from '../types';

export const abInputSchema = z.object({
  exerciseId: z.string().min(1).max(128),
  configs: z
    .array(
      z.object({
        leverSelections: z.record(z.string(), z.string()),
        dataSlotValues: z.record(z.string(), z.string()),
        presetIds: z.array(z.string()),
      }),
    )
    .min(2)
    .max(3),
  provider: z.enum(['anthropic', 'openai', 'google']).optional(),
});

export type AbInput = z.infer<typeof abInputSchema>;

export interface AbHandlerInput extends AbInput {
  identity: LearnerIdentity;
  ipAddress: string | null;
}

export interface AbConfigResult {
  config: AbInput['configs'][number];
  sessionId: string;
  outputText: string;
  tokensUsed: number;
  flagged: boolean;
  provider: ProviderName;
}

export interface AbResult {
  sessionId: string;          // first config's session id, for caller convenience
  results: AbConfigResult[];
}

export async function runSandboxAb(input: AbHandlerInput): Promise<AbResult> {
  const exercise = await loadExercise(input.exerciseId);
  if (!exercise) {
    throw new SandboxError(404, 'EXERCISE_NOT_FOUND', `Exercise not found: ${input.exerciseId}`);
  }

  const ent = await checkEntitlement(input.identity, exercise.entitlement);
  if (!ent.allowed) {
    throw new SandboxError(403, 'NOT_ENTITLED', ent.reason ?? 'not_entitled');
  }

  const requestedProvider: ProviderName = input.provider ?? exercise.defaultProvider;
  validateProviderSwitch(exercise, requestedProvider);

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

  // PII check applies to every config.
  for (const cfg of input.configs) {
    enforcePiiPolicy({
      exercise,
      identity: input.identity,
      leverSelections: cfg.leverSelections,
      dataSlotValues: cfg.dataSlotValues,
      presetIds: cfg.presetIds,
      requestedProvider,
    });
  }

  const results: AbConfigResult[] = [];
  for (const cfg of input.configs) {
    const exec = await executeOnce({
      exercise,
      identity: input.identity,
      leverSelections: cfg.leverSelections,
      dataSlotValues: cfg.dataSlotValues,
      presetIds: cfg.presetIds,
      requestedProvider,
    });
    const sessionId = await logSession({
      identity: input.identity,
      exerciseId: exercise.id,
      lessonId: exercise.lessonId,
      mode: 'ab',
      provider: exec.provider,
      leverSelections: cfg.leverSelections,
      presetIds: cfg.presetIds,
      tokens: exec.tokensUsed,
      estCostUsd: exec.estCostUsd,
      flagged: exec.flagged,
      flagReasons: exec.flagReasons,
    });
    results.push({
      config: cfg,
      sessionId,
      outputText: exec.outputText,
      tokensUsed: exec.tokensUsed,
      flagged: exec.flagged,
      provider: exec.provider,
    });
  }

  return {
    sessionId: results[0]?.sessionId ?? 'unlogged',
    results,
  };
}
