/**
 * Rate limiter interface + an in-memory no-op stub for Wave 1b.
 *
 * Wave 1e replaces the stub with a real per-learner / per-IP / global-budget
 * limiter (likely Upstash). The dispatch path already calls through this
 * interface so the swap is mechanical.
 */

import type { LearnerIdentity, ProviderName } from '../types';

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

export interface RateLimitContext {
  identity: LearnerIdentity;
  exerciseId: string;
  provider: ProviderName;
  ipAddress: string | null;
}

export interface RateLimiter {
  check(ctx: RateLimitContext): Promise<RateLimitDecision>;
}

/** Stub: allows everything. Wired in so production wiring is identical. */
export const noopRateLimiter: RateLimiter = {
  async check(): Promise<RateLimitDecision> {
    return { allowed: true };
  },
};

let active: RateLimiter = noopRateLimiter;
export function getRateLimiter(): RateLimiter {
  return active;
}
export function setRateLimiter(impl: RateLimiter): void {
  active = impl;
}
