/**
 * Entitlement check for paid Exercises. Free Exercises pass through.
 *
 * Paid Exercises require an authenticated learner with an active row in
 * addie.entitlements for one of the Foundation products. Anonymous traffic
 * is always denied for paid content.
 */

import { getServiceClient } from '../supabase';
import type { EntitlementTier, LearnerIdentity } from '../types';

export interface EntitlementDecision {
  allowed: boolean;
  reason?: string;
}

const PAID_PRODUCTS = ['foundation_individual', 'foundation_team_seat'] as const;

export async function checkEntitlement(
  identity: LearnerIdentity,
  tier: EntitlementTier,
): Promise<EntitlementDecision> {
  if (tier === 'free') return { allowed: true };

  if (!identity.learnerId) {
    return { allowed: false, reason: 'anonymous_cannot_access_paid' };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', identity.learnerId)
    .eq('status', 'active')
    .in('product', PAID_PRODUCTS as unknown as string[])
    .limit(1);

  if (error) {
    return { allowed: false, reason: `entitlement_query_failed:${error.message}` };
  }
  if (!data || data.length === 0) {
    return { allowed: false, reason: 'no_active_entitlement' };
  }
  return { allowed: true };
}
