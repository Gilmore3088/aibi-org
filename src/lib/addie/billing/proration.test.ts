import { describe, expect, it } from 'vitest';
import {
  ACCESS_MONTHS,
  SEAT_UNIT_PRICE_CENTS,
  calcProratedSeatRefund,
} from './proration';

const DAY = 24 * 60 * 60 * 1000;
const MONTH = 30 * DAY;

describe('calcProratedSeatRefund', () => {
  it('refunds the full per-month allocation for all 12 months when refunded same-day', () => {
    const purchased = new Date('2026-01-01T00:00:00Z');
    const now = new Date('2026-01-01T00:00:00Z');
    const r = calcProratedSeatRefund({ purchased_at: purchased, now });
    expect(r.eligible).toBe(true);
    expect(r.months_remaining).toBe(ACCESS_MONTHS);
    // 19900 / 12 = 1658.33 -> floor 1658, * 12 = 19896
    expect(r.amount_cents).toBe(Math.floor(SEAT_UNIT_PRICE_CENTS / ACCESS_MONTHS) * ACCESS_MONTHS);
  });

  it('refunds proportionally after partial use', () => {
    const purchased = new Date('2026-01-01T00:00:00Z');
    const now = new Date(purchased.getTime() + 3 * MONTH + DAY);
    const r = calcProratedSeatRefund({ purchased_at: purchased, now });
    expect(r.eligible).toBe(true);
    expect(r.months_elapsed).toBe(3);
    expect(r.months_remaining).toBe(9);
    expect(r.amount_cents).toBe(Math.floor(SEAT_UNIT_PRICE_CENTS / ACCESS_MONTHS) * 9);
  });

  it('refuses refund after the access window expires', () => {
    const purchased = new Date('2026-01-01T00:00:00Z');
    const now = new Date(purchased.getTime() + 13 * MONTH);
    const r = calcProratedSeatRefund({ purchased_at: purchased, now });
    expect(r.eligible).toBe(false);
    expect(r.amount_cents).toBe(0);
    expect(r.reason).toBe('access_window_expired');
  });

  it('refuses when purchase date is missing', () => {
    const r = calcProratedSeatRefund({ purchased_at: null });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('missing_purchase_date');
  });

  it('refuses when purchase date is in the future (clock skew)', () => {
    const purchased = new Date(Date.now() + 10 * DAY);
    const r = calcProratedSeatRefund({ purchased_at: purchased });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('future_purchase_date');
  });

  it('refuses when purchase date is an invalid string', () => {
    const r = calcProratedSeatRefund({ purchased_at: 'not-a-date' });
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('invalid_purchase_date');
  });

  it('accepts an ISO string', () => {
    const purchased = '2026-01-01T00:00:00Z';
    const now = new Date('2026-03-01T00:00:00Z');
    const r = calcProratedSeatRefund({ purchased_at: purchased, now });
    expect(r.eligible).toBe(true);
    expect(r.months_remaining).toBeGreaterThan(0);
  });
});
