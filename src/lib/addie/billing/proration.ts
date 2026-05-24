// Prorated-refund math for one-time seat purchases.
//
// The Foundation team SKU is a one-time charge ($199/seat) that grants
// 12 months of access. There is no recurring subscription to cancel mid
// cycle, so a "refund" means: if the buyer is still inside the 12-month
// access window, return the unused portion.
//
// Formula:
//   monthsElapsed = floor((now - purchased_at) / 30 days)
//   monthsRemaining = max(0, ACCESS_MONTHS - monthsElapsed)
//   refund = (seat_unit_price_cents / ACCESS_MONTHS) * monthsRemaining
//
// Notes:
//   - Months are 30-day buckets, not calendar months — Stripe doesn't
//     care which definition we pick, but the comparison must match the
//     UI so the user sees the same number they'll be refunded.
//   - If purchased_at is unknown (legacy seat without a timestamp), we
//     refuse the refund rather than guess.
//   - Result is rounded DOWN to whole cents to avoid over-refunding.

export const ACCESS_MONTHS = 12 as const;
export const SEAT_UNIT_PRICE_CENTS = 19900 as const; // $199.00 per seat
const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

export interface ProratedRefundArgs {
  readonly purchased_at: Date | string | null;
  readonly now?: Date;
  readonly seat_unit_price_cents?: number;
}

export interface ProratedRefundResult {
  readonly eligible: boolean;
  readonly amount_cents: number;
  readonly months_remaining: number;
  readonly months_elapsed: number;
  readonly reason?: string;
}

export function calcProratedSeatRefund(args: ProratedRefundArgs): ProratedRefundResult {
  const unitPrice = args.seat_unit_price_cents ?? SEAT_UNIT_PRICE_CENTS;
  if (args.purchased_at === null || args.purchased_at === undefined) {
    return {
      eligible: false,
      amount_cents: 0,
      months_remaining: 0,
      months_elapsed: 0,
      reason: 'missing_purchase_date',
    };
  }
  const purchased = args.purchased_at instanceof Date
    ? args.purchased_at
    : new Date(args.purchased_at);
  if (Number.isNaN(purchased.getTime())) {
    return {
      eligible: false,
      amount_cents: 0,
      months_remaining: 0,
      months_elapsed: 0,
      reason: 'invalid_purchase_date',
    };
  }
  const now = args.now ?? new Date();
  const elapsedMs = now.getTime() - purchased.getTime();
  if (elapsedMs < 0) {
    return {
      eligible: false,
      amount_cents: 0,
      months_remaining: 0,
      months_elapsed: 0,
      reason: 'future_purchase_date',
    };
  }
  const monthsElapsed = Math.floor(elapsedMs / MS_PER_MONTH);
  const monthsRemaining = Math.max(0, ACCESS_MONTHS - monthsElapsed);
  if (monthsRemaining === 0) {
    return {
      eligible: false,
      amount_cents: 0,
      months_remaining: 0,
      months_elapsed: monthsElapsed,
      reason: 'access_window_expired',
    };
  }
  const perMonth = Math.floor(unitPrice / ACCESS_MONTHS);
  const amount = perMonth * monthsRemaining;
  return {
    eligible: amount > 0,
    amount_cents: amount,
    months_remaining: monthsRemaining,
    months_elapsed: monthsElapsed,
  };
}
