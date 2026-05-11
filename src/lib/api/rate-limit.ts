// Rate limiting backed by the Supabase rate_limits table + check_rate_limit RPC.
//
// Use rateLimitOrFail() from a Route Handler:
//
//   const limited = await rateLimitOrFail(request, {
//     key: 'capture-email',
//     scope: 'ip',          // or 'user'
//     identifier: ip,       // or user.id
//     max: 5,
//     windowSeconds: 3600,  // 1 hour
//   });
//   if (limited) return limited;
//
// The check is atomic (DB-side INSERT ... ON CONFLICT increment) and
// shared across all serverless instances, so it works correctly under
// concurrent invocations. Fails open if Supabase is unreachable —
// availability matters more than perfect rate limiting on
// pre-launch traffic. Logs every failure so it's noticed.
//
// Migration: supabase/migrations/00031_rate_limits.sql

import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly count: number;
  readonly resetAt: Date;
}

export interface RateLimitConfig {
  /** Logical route name, e.g. 'capture-email'. Used as the key prefix. */
  readonly key: string;
  /** Scope identifier, e.g. 'ip' or 'user'. */
  readonly scope: 'ip' | 'user' | 'email';
  /** The concrete value being counted, e.g. the IP or user UUID. */
  readonly identifier: string;
  /** Max requests permitted per window. */
  readonly max: number;
  /** Window length in seconds (e.g. 3600 for 1 hour). */
  readonly windowSeconds: number;
}

interface RpcRow {
  allowed: boolean;
  current_count: number;
  reset_at: string;
}

async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const fallback: RateLimitResult = {
    allowed: true,
    count: 0,
    resetAt: new Date(Date.now() + config.windowSeconds * 1000),
  };

  if (!isSupabaseConfigured()) {
    console.warn('[rate-limit] Supabase not configured; allowing request');
    return fallback;
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (err) {
    console.warn('[rate-limit] Service role client unavailable; allowing request', err);
    return fallback;
  }

  const fullKey = `${config.key}:${config.scope}:${config.identifier}`;
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: fullKey,
    p_max: config.max,
    p_window_seconds: config.windowSeconds,
  });

  if (error || !data) {
    console.warn('[rate-limit] RPC failed; allowing request', error);
    return fallback;
  }

  const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
  if (!row) {
    console.warn('[rate-limit] RPC returned no rows; allowing request');
    return fallback;
  }

  return {
    allowed: row.allowed,
    count: row.current_count,
    resetAt: new Date(row.reset_at),
  };
}

/**
 * Convenience wrapper: returns a 429 NextResponse if rate-limited,
 * or null if the caller should proceed.
 */
export async function rateLimitOrFail(
  config: RateLimitConfig,
): Promise<NextResponse | null> {
  const result = await checkRateLimit(config);
  if (result.allowed) return null;
  const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
      },
    },
  );
}

/**
 * Best-effort IP extraction from x-forwarded-for. Vercel always sets this.
 * Falls back to 'unknown' which collapses all unknown-IP callers into a
 * single bucket — intentional, since an attacker stripping the header
 * gets aggregated with everyone else doing the same.
 */
export function getRequestIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return 'unknown';
}
