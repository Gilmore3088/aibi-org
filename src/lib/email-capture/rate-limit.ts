// Per-IP rate limiting for /api/capture-email.
// Reuses the toolbox hashIp helper so a single salt rotation invalidates
// both surfaces.

import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';

export { hashIp };

export interface EmailCaptureLimits {
  readonly perIpPerHour: number;
}

export interface EmailCaptureDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

function oneHourAgoIso(): string {
  return new Date(Date.now() - ONE_HOUR_MS).toISOString();
}

/**
 * Check whether this IP can submit another email-capture request.
 *
 * Fails open when Supabase is unconfigured (local dev) or on transient DB
 * errors — never blocks a legitimate signup because of infra trouble.
 */
export async function checkEmailCaptureLimit(
  ipHash: string,
  limits: EmailCaptureLimits,
): Promise<EmailCaptureDecision> {
  // Bypass in non-production environments so local testing of the assessment
  // flow is not blocked after a handful of iterations. Production stays
  // protected.
  if (process.env.NODE_ENV !== 'production') return { allowed: true };
  if (!isSupabaseConfigured()) return { allowed: true };

  const client = createServiceRoleClient();
  const { count, error } = await client
    .from('email_capture_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', oneHourAgoIso());

  if (error) {
    console.warn('[email-capture/rate-limit] count query failed; failing open:', error.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= limits.perIpPerHour) {
    return { allowed: false, retryAfterSeconds: 60 * 60 };
  }

  return { allowed: true };
}

/** Insert a row recording this submission. Best-effort; never throws. */
export async function logEmailCapture(ipHash: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = createServiceRoleClient();
  const { error } = await client.from('email_capture_log').insert({ ip_hash: ipHash });
  if (error) {
    console.warn('[email-capture/rate-limit] insert failed:', error.message);
  }
}
