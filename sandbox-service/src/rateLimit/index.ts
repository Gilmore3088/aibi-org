/**
 * Rate limiter — real implementation for Wave 1e.
 *
 * Backend: Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are present; otherwise an in-process sliding-window Map with TTL sweep.
 * The fallback is acceptable for v1 (single Vercel function instance,
 * effectively zero traffic). Upstash takes over the moment env vars exist
 * — no code changes required.
 *
 * Tiers (Sandbox Spec §11):
 *   - Authenticated paid:   200 runs/hour total per learner.
 *   - Authenticated free:   100 runs/hour total per learner
 *                         + 30 runs/hour per (learner, lesson).
 *   - Anonymous:            5 runs/hour per anon_session_id
 *                         + 20 runs/hour per IP address.
 *
 * Anonymous traffic is additionally pinned to the cheaper anonModel by the
 * gateway (separate concern).
 */

import { getServiceClient } from '../supabase';
import type { LearnerIdentity, ProviderName } from '../types';

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

export interface RateLimitContext {
  identity: LearnerIdentity;
  exerciseId: string;
  lessonId?: string | null;
  provider: ProviderName;
  ipAddress: string | null;
}

export interface RateLimiter {
  check(ctx: RateLimitContext): Promise<RateLimitDecision>;
}

interface BucketRule {
  key: string;
  limit: number;
  windowMs: number;
  reason: string;
}

const HOUR_MS = 60 * 60 * 1000;

// --- In-process sliding-window store --------------------------------------

interface Window {
  timestamps: number[];
}

const memStore = new Map<string, Window>();
let lastSweep = 0;

function sweep(now: number): void {
  if (now - lastSweep < HOUR_MS) return;
  lastSweep = now;
  for (const [k, w] of Array.from(memStore.entries())) {
    if (w.timestamps.length === 0 || w.timestamps[w.timestamps.length - 1] < now - HOUR_MS) {
      memStore.delete(k);
    }
  }
}

function memCheckAndIncrement(rule: BucketRule, now: number): RateLimitDecision {
  sweep(now);
  const w = memStore.get(rule.key) ?? { timestamps: [] };
  // drop expired
  const cutoff = now - rule.windowMs;
  while (w.timestamps.length > 0 && w.timestamps[0] < cutoff) {
    w.timestamps.shift();
  }
  if (w.timestamps.length >= rule.limit) {
    const retryMs = w.timestamps[0] + rule.windowMs - now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
      reason: rule.reason,
    };
  }
  w.timestamps.push(now);
  memStore.set(rule.key, w);
  return { allowed: true };
}

// --- Upstash backend (lazy, optional) -------------------------------------

interface UpstashHandle {
  // sliding-window pipeline using ZSET
  check(rule: BucketRule, now: number): Promise<RateLimitDecision>;
}

let upstashCache: UpstashHandle | null | undefined;

async function getUpstash(): Promise<UpstashHandle | null> {
  if (upstashCache !== undefined) return upstashCache;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashCache = null;
    return null;
  }
  try {
    // Dynamic import keeps the package optional. If it isn't installed,
    // we silently fall back to the in-process store.
    // Optional dependency: only used when Upstash env vars are present.
    // The /* @vite-ignore */ stops the bundler/test runner from trying to
    // resolve it statically when the package isn't installed.
    const moduleName = '@upstash/redis';
    const mod = (await import(/* @vite-ignore */ moduleName)) as {
      Redis: new (init: { url: string; token: string }) => UpstashRedisClient;
    };
    const redis = new mod.Redis({ url, token });
    upstashCache = {
      async check(rule, now) {
        const cutoff = now - rule.windowMs;
        const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;
        // Atomic-ish: remove expired, count, add, expire.
        await redis.zremrangebyscore(rule.key, 0, cutoff);
        const count = await redis.zcard(rule.key);
        if (count >= rule.limit) {
          const oldest = (await redis.zrange(rule.key, 0, 0, { withScores: true })) as Array<
            string | number
          >;
          const oldestScore = typeof oldest[1] === 'number' ? oldest[1] : Number(oldest[1] ?? now);
          const retryMs = oldestScore + rule.windowMs - now;
          return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
            reason: rule.reason,
          };
        }
        await redis.zadd(rule.key, { score: now, member });
        await redis.expire(rule.key, Math.ceil(rule.windowMs / 1000));
        return { allowed: true };
      },
    };
    return upstashCache;
  } catch {
    upstashCache = null;
    return null;
  }
}

interface UpstashRedisClient {
  zremrangebyscore(key: string, min: number, max: number): Promise<number>;
  zcard(key: string): Promise<number>;
  zrange(
    key: string,
    start: number,
    stop: number,
    opts?: { withScores?: boolean },
  ): Promise<unknown>;
  zadd(key: string, entry: { score: number; member: string }): Promise<unknown>;
  expire(key: string, seconds: number): Promise<unknown>;
}

// --- Public entry ---------------------------------------------------------

function buildRules(ctx: RateLimitContext): BucketRule[] {
  const rules: BucketRule[] = [];
  const tierEnv = process.env.SANDBOX_TIER_PAID === 'true'; // operator override for tests
  const { identity } = ctx;
  if (identity.learnerId) {
    // We don't have entitlement here without an extra query; the handler does
    // that check. For limits we default to "free" caps and trust the caller
    // to flip SANDBOX_TIER_PAID where appropriate. Real distinction will be
    // wired when /api/sandbox/run threads the entitlement decision through.
    rules.push({
      key: `rl:learner:hour:${identity.learnerId}`,
      limit: tierEnv ? 200 : 100,
      windowMs: HOUR_MS,
      reason: 'learner_hourly_cap',
    });
    if (!tierEnv && ctx.lessonId) {
      rules.push({
        key: `rl:learner_lesson:hour:${identity.learnerId}:${ctx.lessonId}`,
        limit: 30,
        windowMs: HOUR_MS,
        reason: 'learner_lesson_hourly_cap',
      });
    }
  } else if (identity.anonSessionId) {
    rules.push({
      key: `rl:anon:hour:${identity.anonSessionId}`,
      limit: 5,
      windowMs: HOUR_MS,
      reason: 'anon_hourly_cap',
    });
    if (ctx.ipAddress) {
      rules.push({
        key: `rl:anon_ip:hour:${ctx.ipAddress}`,
        limit: 20,
        windowMs: HOUR_MS,
        reason: 'anon_ip_hourly_cap',
      });
    }
  }
  return rules;
}

class DefaultRateLimiter implements RateLimiter {
  async check(ctx: RateLimitContext): Promise<RateLimitDecision> {
    const now = Date.now();
    const rules = buildRules(ctx);
    if (rules.length === 0) return { allowed: true };
    const upstash = await getUpstash();
    for (const rule of rules) {
      const decision = upstash
        ? await upstash.check(rule, now)
        : memCheckAndIncrement(rule, now);
      if (!decision.allowed) return decision;
    }
    return { allowed: true };
  }
}

let active: RateLimiter = new DefaultRateLimiter();
export function getRateLimiter(): RateLimiter {
  return active;
}
export function setRateLimiter(impl: RateLimiter): void {
  active = impl;
}

/** Test hook — clears in-process state so tests don't bleed into each other. */
export function _resetRateLimiterForTests(): void {
  memStore.clear();
  lastSweep = 0;
  upstashCache = undefined;
  active = new DefaultRateLimiter();
}

// --- Circuit breaker / daily LLM spend budget -----------------------------

export interface DailyBudgetState {
  totalUsd: number;
  perProvider: Record<ProviderName, number>;
}

export interface BudgetDecision {
  allowed: boolean;
  reason?: string;
}

const DEFAULT_DAILY_BUDGET_USD = 25;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Read today's spend per provider. Memoized for a few seconds to avoid hot-loop. */
let spendCache: { date: string; readAt: number; perProvider: Record<string, number> } | null = null;
const SPEND_CACHE_TTL_MS = 30_000;

export async function getDailySpendUsd(provider: ProviderName): Promise<number> {
  const date = todayUtc();
  const now = Date.now();
  if (!spendCache || spendCache.date !== date || now - spendCache.readAt > SPEND_CACHE_TTL_MS) {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('sandbox_spend')
      .select('provider, spend_usd')
      .eq('spend_date', date);
    const perProvider: Record<string, number> = {};
    for (const row of data ?? []) {
      perProvider[(row as { provider: string }).provider] = Number(
        (row as { spend_usd: number }).spend_usd ?? 0,
      );
    }
    spendCache = { date, readAt: now, perProvider };
  }
  return spendCache.perProvider[provider] ?? 0;
}

export function getDailyBudgetUsd(): number {
  const raw = process.env.SANDBOX_DAILY_BUDGET_USD_TOTAL;
  if (!raw) return DEFAULT_DAILY_BUDGET_USD;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_BUDGET_USD;
}

/** Returns the providers currently OPEN (over budget) — caller skips them on dispatch. */
export async function getOpenCircuits(
  candidates: ProviderName[],
): Promise<Set<ProviderName>> {
  const limit = getDailyBudgetUsd();
  const open = new Set<ProviderName>();
  for (const p of candidates) {
    if ((await getDailySpendUsd(p)) >= limit) open.add(p);
  }
  return open;
}

export async function recordSpend(provider: ProviderName, addUsd: number): Promise<void> {
  if (!Number.isFinite(addUsd) || addUsd <= 0) return;
  const date = todayUtc();
  const supabase = getServiceClient();
  // Read-modify-write is acceptable here (one row per provider/day,
  // contention is negligible; correctness need only be approximate).
  const { data } = await supabase
    .from('sandbox_spend')
    .select('spend_usd')
    .eq('spend_date', date)
    .eq('provider', provider)
    .maybeSingle<{ spend_usd: number }>();
  const next = Number(data?.spend_usd ?? 0) + addUsd;
  await supabase.from('sandbox_spend').upsert(
    {
      spend_date: date,
      provider,
      spend_usd: next,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'spend_date,provider' },
  );
  // Invalidate cache so the breaker sees the new value immediately.
  spendCache = null;
}

/** Test hook — clears the spend cache. */
export function _resetSpendCacheForTests(): void {
  spendCache = null;
}
