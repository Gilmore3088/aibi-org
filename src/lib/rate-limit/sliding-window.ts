// Application-layer rate limiter backed by the rate_limit_events table.
//
// Usage:
//   const result = await checkRateLimit({
//     scope: 'capture-email',
//     key: clientIp,
//     max: 5,
//     windowSeconds: 60 * 60,
//   });
//   if (!result.ok) return Response.json({ error: '...' }, { status: 429 });
//
// Sliding window: counts events with occurred_at >= now - windowSeconds.
// If the count is at the limit, the request is denied; otherwise we insert
// a new event and allow.
//
// Failure mode: if the database lookup or insert errors (network, RLS,
// missing service role key), the limiter fails OPEN — the request is allowed
// through. Rate limiting is a safety net, not a security boundary; failing
// closed would turn a transient DB hiccup into a site-wide auth outage.
// Errors are logged so the issue is visible.
//
// To swap this for Upstash/Redis later, replace the body of checkRateLimit
// with an @upstash/ratelimit call. Call sites do not need to change.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface RateLimitArgs {
  readonly scope: string;
  readonly key: string;
  readonly max: number;
  readonly windowSeconds: number;
}

export type RateLimitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly retryAfterSeconds: number };

export async function checkRateLimit(args: RateLimitArgs): Promise<RateLimitResult> {
  const { scope, key, max, windowSeconds } = args;

  if (!isSupabaseConfigured()) return { ok: true };

  try {
    const supabase = createServiceRoleClient();
    const cutoff = new Date(Date.now() - windowSeconds * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from('rate_limit_events')
      .select('id', { count: 'exact', head: true })
      .eq('scope', scope)
      .eq('key', key)
      .gte('occurred_at', cutoff);

    if (countError) {
      console.warn('[rate-limit] count failed, failing open:', countError);
      return { ok: true };
    }

    if ((count ?? 0) >= max) {
      return { ok: false, retryAfterSeconds: windowSeconds };
    }

    const { error: insertError } = await supabase
      .from('rate_limit_events')
      .insert({ scope, key });

    if (insertError) {
      console.warn('[rate-limit] insert failed, failing open:', insertError);
    }

    return { ok: true };
  } catch (err) {
    console.warn('[rate-limit] unexpected error, failing open:', err);
    return { ok: true };
  }
}

// Extract a stable client identifier from the request. Prefers the
// x-forwarded-for first hop (Vercel sets this), falls back to x-real-ip,
// then a sentinel string. Header values are trimmed and lowercased so
// minor formatting differences don't bypass the limit.
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim().toLowerCase();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real) return real.trim().toLowerCase();
  return 'unknown';
}
