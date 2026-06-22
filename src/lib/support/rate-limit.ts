import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { hashIp } from '@/lib/ai-harness/rate-limit';

export { hashIp };

export interface SupportIntakeDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

function oneHourAgoIso(): string {
  return new Date(Date.now() - ONE_HOUR_MS).toISOString();
}

export async function checkSupportIntakeLimit(
  ipHash: string,
  perIpPerHour: number,
): Promise<SupportIntakeDecision> {
  if (process.env.NODE_ENV !== 'production') return { allowed: true };
  if (!isSupabaseConfigured()) return { allowed: true };

  const client = createServiceRoleClient();
  const { count, error } = await client
    .from('support_intake_log')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', oneHourAgoIso());

  if (error) {
    console.warn('[support/rate-limit] count query failed; failing open:', error.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= perIpPerHour) {
    return { allowed: false, retryAfterSeconds: 60 * 60 };
  }

  return { allowed: true };
}

export async function logSupportIntake(ipHash: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = createServiceRoleClient();
  const { error } = await client.from('support_intake_log').insert({ ip_hash: ipHash });
  if (error) {
    console.warn('[support/rate-limit] insert failed:', error.message);
  }
}
