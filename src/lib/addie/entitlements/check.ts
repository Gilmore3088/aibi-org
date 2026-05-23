// Entitlement check — Auth Spec §6.3. Service-role; for use in server
// flows (RLS-bound reads from a user-scoped client work too, but this
// function is also called from webhook + admin paths).

import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import type { AddieProduct } from './write';

export async function hasEntitlement(
  user_id: string,
  product: AddieProduct,
): Promise<boolean> {
  const supa = getAddieServiceClient();
  const { count, error } = await supa
    .from('entitlements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .eq('product', product)
    .eq('status', 'active');
  if (error) {
    console.warn('[addie/entitlements/check] error:', error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

export async function hasAnyFoundationEntitlement(user_id: string): Promise<boolean> {
  const supa = getAddieServiceClient();
  const { count, error } = await supa
    .from('entitlements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .eq('status', 'active')
    .in('product', ['foundation_individual', 'foundation_team_seat']);
  if (error) {
    console.warn('[addie/entitlements/check] error:', error.message);
    return false;
  }
  return (count ?? 0) > 0;
}
