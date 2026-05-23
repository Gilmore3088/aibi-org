// Idempotent entitlement writes. Auth Spec §6.2.
//
// One row per (user_id, product, seat_id). Duplicate webhooks land in
// ON CONFLICT DO NOTHING — the UNIQUE constraint on the same triple
// (00043_addie_entitlements.sql) is the safety net.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export type AddieProduct =
  | 'foundation_individual'
  | 'foundation_team_seat'
  | 'assessment_in_depth';

export interface WriteEntitlementArgs {
  readonly user_id: string;
  readonly product: AddieProduct;
  readonly stripe_session_id?: string | null;
  readonly seat_id?: string | null;
  readonly expires_at?: string | null;
}

export interface WriteEntitlementResult {
  readonly id: string;
  readonly inserted: boolean;
}

export async function writeEntitlement(
  args: WriteEntitlementArgs,
): Promise<WriteEntitlementResult> {
  const supa = getAddieServiceClient();
  // upsert on the natural-key UNIQUE so retries are no-ops.
  const { data, error } = await supa
    .from('entitlements')
    .upsert(
      {
        user_id: args.user_id,
        product: args.product,
        seat_id: args.seat_id ?? null,
        stripe_session_id: args.stripe_session_id ?? null,
        expires_at: args.expires_at ?? null,
        status: 'active',
      },
      { onConflict: 'user_id,product,seat_id', ignoreDuplicates: false },
    )
    .select('id, created_at')
    .single();
  if (error || !data) {
    throw new Error(`entitlements upsert failed: ${error?.message ?? 'no row'}`);
  }
  return { id: data.id as string, inserted: true };
}
