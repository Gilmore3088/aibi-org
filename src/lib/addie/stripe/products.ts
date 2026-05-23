// Stripe price-id resolution with legacy-env-var fallbacks.
//
// CLAUDE.md mandates accepting `STRIPE_FOUNDATIONS_PRICE_ID` /
// `STRIPE_AIBIP_PRICE_ID` as fallbacks for the individual price. The
// $199/seat team SKU is new — operator must add the price to Stripe
// (test mode first) and set STRIPE_FOUNDATION_TEAM_SEAT_PRICE_ID.

import type { AddieProduct } from '@/lib/addie/entitlements/write';

function firstSet(...names: readonly string[]): string | null {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.length > 0) return v;
  }
  return null;
}

export function getIndividualPriceId(): string {
  const id = firstSet(
    'STRIPE_FOUNDATION_PRICE_ID',
    'STRIPE_FOUNDATIONS_PRICE_ID',
    'STRIPE_AIBIP_PRICE_ID',
  );
  if (!id) throw new Error('No Foundation individual Stripe price id configured.');
  return id;
}

export function getTeamSeatPriceId(): string {
  const id = firstSet(
    'STRIPE_FOUNDATION_TEAM_SEAT_PRICE_ID',
    'STRIPE_FOUNDATION_INSTITUTION_PRICE_ID',
    'STRIPE_FOUNDATIONS_INSTITUTION_PRICE_ID',
  );
  if (!id) throw new Error('No Foundation team-seat Stripe price id configured.');
  return id;
}

export function getAssessmentPriceId(): string {
  const id = firstSet('STRIPE_INDEPTH_PRICE_ID');
  if (!id) throw new Error('No In-Depth assessment Stripe price id configured.');
  return id;
}

/** Map a Stripe line-item price id back to the ADDIE product code. */
export function productFromPriceId(price_id: string): AddieProduct | null {
  if (price_id === getIndividualPriceIdSafe()) return 'foundation_individual';
  if (price_id === getTeamSeatPriceIdSafe()) return 'foundation_team_seat';
  if (price_id === getAssessmentPriceIdSafe()) return 'assessment_in_depth';
  return null;
}

function getIndividualPriceIdSafe(): string | null {
  try { return getIndividualPriceId(); } catch { return null; }
}
function getTeamSeatPriceIdSafe(): string | null {
  try { return getTeamSeatPriceId(); } catch { return null; }
}
function getAssessmentPriceIdSafe(): string | null {
  try { return getAssessmentPriceId(); } catch { return null; }
}
