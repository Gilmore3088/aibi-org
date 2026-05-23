/**
 * Per-IP sliding-window rate limiter for the public Next.js routes that sit
 * in front of the sandbox-service (capture-email, checkout, etc.).
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * are present, otherwise an in-process Map with TTL sweep. The in-process
 * fallback is acceptable for v1 (single Vercel function instance, near-zero
 * traffic at launch). Upstash takes over when env is configured — no code
 * change required.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { NextResponse as NR } from 'next/server';

export interface EdgeRateLimitOptions {
  /** Stable identifier for the bucket (e.g. 'capture-email'). */
  bucket: string;
  /** Allowed requests per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

export interface EdgeRateLimitDecision {
  allowed: boolean;
  retryAfterSeconds?: number;
}

const memStore = new Map<string, number[]>();
let lastSweep = 0;

function ipOf(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'anonymous';
}

function sweep(now: number, oneHourMs: number): void {
  if (now - lastSweep < oneHourMs) return;
  lastSweep = now;
  for (const [k, arr] of Array.from(memStore.entries())) {
    if (arr.length === 0 || arr[arr.length - 1] < now - oneHourMs) {
      memStore.delete(k);
    }
  }
}

function memDecide(key: string, limit: number, windowMs: number, now: number): EdgeRateLimitDecision {
  sweep(now, Math.max(windowMs, 60 * 60 * 1000));
  const arr = memStore.get(key) ?? [];
  const cutoff = now - windowMs;
  while (arr.length > 0 && arr[0] < cutoff) arr.shift();
  if (arr.length >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((arr[0] + windowMs - now) / 1000)),
    };
  }
  arr.push(now);
  memStore.set(key, arr);
  return { allowed: true };
}

interface UpstashRedis {
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

let upstashCache: { redis: UpstashRedis } | null | undefined;

async function getUpstash(): Promise<UpstashRedis | null> {
  if (upstashCache !== undefined) return upstashCache?.redis ?? null;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    upstashCache = null;
    return null;
  }
  try {
    const moduleName = '@upstash/redis';
    const mod = (await import(/* @vite-ignore */ moduleName)) as {
      Redis: new (init: { url: string; token: string }) => UpstashRedis;
    };
    const redis = new mod.Redis({ url, token });
    upstashCache = { redis };
    return redis;
  } catch {
    upstashCache = null;
    return null;
  }
}

export async function edgeRateLimit(
  req: NextRequest,
  opts: EdgeRateLimitOptions,
): Promise<EdgeRateLimitDecision> {
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;
  const key = `edgerl:${opts.bucket}:${ipOf(req)}`;
  const upstash = await getUpstash();
  if (!upstash) return memDecide(key, opts.limit, windowMs, now);

  const cutoff = now - windowMs;
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;
  await upstash.zremrangebyscore(key, 0, cutoff);
  const count = await upstash.zcard(key);
  if (count >= opts.limit) {
    const oldest = (await upstash.zrange(key, 0, 0, { withScores: true })) as Array<
      string | number
    >;
    const oldestScore =
      typeof oldest[1] === 'number' ? oldest[1] : Number(oldest[1] ?? now);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldestScore + windowMs - now) / 1000)),
    };
  }
  await upstash.zadd(key, { score: now, member });
  await upstash.expire(key, Math.ceil(windowMs / 1000));
  return { allowed: true };
}

/** Convenience: return a 429 response if blocked, otherwise null. */
export async function enforceEdgeRateLimit(
  req: NextRequest,
  opts: EdgeRateLimitOptions,
): Promise<NextResponse | null> {
  const decision = await edgeRateLimit(req, opts);
  if (decision.allowed) return null;
  return NR.json(
    { error: 'rate_limited', retry_after_seconds: decision.retryAfterSeconds },
    { status: 429, headers: { 'Retry-After': String(decision.retryAfterSeconds ?? 60) } },
  );
}

/** Test hook. */
export function _resetEdgeRateLimitForTests(): void {
  memStore.clear();
  lastSweep = 0;
  upstashCache = undefined;
}
