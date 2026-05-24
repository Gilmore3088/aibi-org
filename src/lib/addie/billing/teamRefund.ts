// Team-side refund + cancellation helpers. These wrap the seat lifecycle
// in src/lib/addie/team/seats.ts with the Stripe refund + accounting
// concerns that don't belong in the access-control helpers.
//
// Stripe Refund creation: we look up the most recent successful Charge
// on the team's Stripe customer (located via the team's stripe checkout
// session, in turn looked up through the admin's entitlements) and
// refund a fixed cents amount against it. Multi-charge teams (e.g.
// admin bought more seats later) are not yet handled — we refund the
// most recent charge first. If the admin owes more than that charge
// covers, we refuse rather than guess.

import { stripe } from '@/lib/addie/stripe/client';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import { revokeSeat } from '@/lib/addie/team/seats';
import { emit } from '@/lib/addie/events/emit';
import { resolveStripeCustomerId } from './portal';
import {
  calcProratedSeatRefund,
  ACCESS_MONTHS,
  SEAT_UNIT_PRICE_CENTS,
} from './proration';

const SKIP_STRIPE = (): boolean => process.env.SKIP_STRIPE === 'true';

interface TeamRow {
  id: string;
  admin_user_id: string;
  seats_purchased: number;
  created_at: string;
  name: string;
}

interface SeatRow {
  id: string;
  team_id: string;
  status: string;
  invited_email: string;
  learner_user_id: string | null;
}

export interface RefundOutcome {
  readonly refunded: boolean;
  readonly amount_cents: number;
  readonly stripe_refund_id: string | null;
  readonly reason?: string;
}

async function loadTeam(team_id: string): Promise<TeamRow | null> {
  const supa = getAddieServiceClient();
  const { data, error } = await supa
    .from('teams')
    .select('id, admin_user_id, seats_purchased, created_at, name')
    .eq('id', team_id)
    .maybeSingle();
  if (error) {
    console.warn('[addie/billing/teamRefund] team load failed:', error.message);
    return null;
  }
  return (data as TeamRow | null) ?? null;
}

async function loadSeat(seat_id: string): Promise<SeatRow | null> {
  const supa = getAddieServiceClient();
  const { data, error } = await supa
    .from('seats')
    .select('id, team_id, status, invited_email, learner_user_id')
    .eq('id', seat_id)
    .maybeSingle();
  if (error) {
    console.warn('[addie/billing/teamRefund] seat load failed:', error.message);
    return null;
  }
  return (data as SeatRow | null) ?? null;
}

async function issueRefund(args: {
  admin_user_id: string;
  admin_email: string;
  amount_cents: number;
}): Promise<{ id: string | null; error?: string }> {
  if (SKIP_STRIPE()) {
    return { id: null };
  }
  const customer = await resolveStripeCustomerId({
    user_id: args.admin_user_id,
    email: args.admin_email,
  });
  if (!customer) return { id: null, error: 'no_stripe_customer' };

  const charges = await stripe.charges.list({ customer, limit: 10 });
  const refundable = charges.data.find(
    (c) => c.status === 'succeeded' && (c.amount_refunded ?? 0) < c.amount,
  );
  if (!refundable) return { id: null, error: 'no_refundable_charge' };

  const remaining = refundable.amount - (refundable.amount_refunded ?? 0);
  if (remaining < args.amount_cents) {
    return { id: null, error: 'refund_exceeds_charge_remaining' };
  }

  const refund = await stripe.refunds.create({
    charge: refundable.id,
    amount: args.amount_cents,
    reason: 'requested_by_customer',
  });
  return { id: refund.id };
}

async function lookupAdminEmail(admin_user_id: string): Promise<string | null> {
  const supa = getAddieServiceClient();
  const { data } = await supa
    .from('learner_profiles')
    .select('email')
    .eq('user_id', admin_user_id)
    .maybeSingle();
  const email = (data as { email: string | null } | null)?.email ?? null;
  return email;
}

export interface RevokeSeatWithRefundArgs {
  readonly seat_id: string;
  readonly admin_user_id: string;
}

export interface RevokeSeatWithRefundResult {
  readonly revoked: true;
  readonly refund: RefundOutcome;
}

/**
 * Revoke a seat and (if eligible) refund the unused portion of the seat's
 * 12-month access window. The seat is revoked even if the refund fails —
 * the admin's intent was to remove the seat, and we don't want a Stripe
 * outage to block that. The refund failure is surfaced in the response.
 */
export async function revokeSeatWithRefund(
  args: RevokeSeatWithRefundArgs,
): Promise<RevokeSeatWithRefundResult> {
  const seat = await loadSeat(args.seat_id);
  if (!seat) throw new Error('seat_not_found');
  const team = await loadTeam(seat.team_id);
  if (!team) throw new Error('team_not_found');
  if (team.admin_user_id !== args.admin_user_id) {
    throw new Error('forbidden_not_team_admin');
  }

  // Step 1: revoke seat + entitlement via the existing helper (which
  // also performs the admin authorization check; double-check is OK).
  await revokeSeat({ seat_id: args.seat_id, admin_user_id: args.admin_user_id });

  // Step 2: compute prorated refund based on team purchase date.
  const prorated = calcProratedSeatRefund({
    purchased_at: team.created_at,
    seat_unit_price_cents: SEAT_UNIT_PRICE_CENTS,
  });
  if (!prorated.eligible || prorated.amount_cents <= 0) {
    return {
      revoked: true,
      refund: {
        refunded: false,
        amount_cents: 0,
        stripe_refund_id: null,
        reason: prorated.reason ?? 'not_eligible',
      },
    };
  }

  const adminEmail = await lookupAdminEmail(args.admin_user_id);
  if (!adminEmail) {
    return {
      revoked: true,
      refund: {
        refunded: false,
        amount_cents: prorated.amount_cents,
        stripe_refund_id: null,
        reason: 'no_admin_email',
      },
    };
  }

  try {
    const result = await issueRefund({
      admin_user_id: args.admin_user_id,
      admin_email: adminEmail,
      amount_cents: prorated.amount_cents,
    });
    return {
      revoked: true,
      refund: {
        refunded: Boolean(result.id) || SKIP_STRIPE(),
        amount_cents: prorated.amount_cents,
        stripe_refund_id: result.id,
        reason: result.error,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    return {
      revoked: true,
      refund: {
        refunded: false,
        amount_cents: prorated.amount_cents,
        stripe_refund_id: null,
        reason: message,
      },
    };
  }
}

export interface CancelTeamArgs {
  readonly team_id: string;
  readonly admin_user_id: string;
}

export interface CancelTeamResult {
  readonly cancelled: true;
  readonly seats_revoked: number;
  readonly refund: RefundOutcome;
  readonly notified_emails: string[];
}

/**
 * Revoke every active seat in the team and refund the prorated unused
 * portion of the per-seat allocation, capped at the access window.
 *
 * Email notifications are best-effort: failures don't roll back the
 * cancel. We collect the addresses we *would* email and let the caller
 * fan out via Resend.
 */
export async function cancelTeam(args: CancelTeamArgs): Promise<CancelTeamResult> {
  const team = await loadTeam(args.team_id);
  if (!team) throw new Error('team_not_found');
  if (team.admin_user_id !== args.admin_user_id) {
    throw new Error('forbidden_not_team_admin');
  }

  const supa = getAddieServiceClient();
  const { data: seatsData, error: seatsErr } = await supa
    .from('seats')
    .select('id, invited_email, status, learner_user_id')
    .eq('team_id', args.team_id)
    .in('status', ['invited', 'assigned']);
  if (seatsErr) throw new Error(`seat fetch failed: ${seatsErr.message}`);

  const activeSeats = (seatsData ?? []) as SeatRow[];

  // Revoke seats + entitlements in bulk.
  if (activeSeats.length > 0) {
    const { error: updErr } = await supa
      .from('seats')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .in(
        'id',
        activeSeats.map((s) => s.id),
      );
    if (updErr) throw new Error(`seat revoke failed: ${updErr.message}`);

    const { error: entErr } = await supa
      .from('entitlements')
      .update({ status: 'revoked' })
      .in(
        'seat_id',
        activeSeats.map((s) => s.id),
      );
    if (entErr) {
      console.warn('[addie/billing/teamRefund] entitlement bulk revoke warn:', entErr.message);
    }
  }

  // Refund: prorate per ACCESS_MONTHS bucket × number of seats actually
  // paid for (team.seats_purchased — refunding the whole order, not just
  // the active ones, because the buyer paid for the full seat block).
  const proratedSeat = calcProratedSeatRefund({
    purchased_at: team.created_at,
    seat_unit_price_cents: SEAT_UNIT_PRICE_CENTS,
  });
  const totalRefund = proratedSeat.eligible
    ? proratedSeat.amount_cents * team.seats_purchased
    : 0;

  let refund: RefundOutcome = {
    refunded: false,
    amount_cents: totalRefund,
    stripe_refund_id: null,
    reason: proratedSeat.eligible ? undefined : (proratedSeat.reason ?? 'not_eligible'),
  };

  if (totalRefund > 0) {
    const adminEmail = await lookupAdminEmail(args.admin_user_id);
    if (!adminEmail) {
      refund = { ...refund, reason: 'no_admin_email' };
    } else {
      try {
        const result = await issueRefund({
          admin_user_id: args.admin_user_id,
          admin_email: adminEmail,
          amount_cents: totalRefund,
        });
        refund = {
          refunded: Boolean(result.id) || SKIP_STRIPE(),
          amount_cents: totalRefund,
          stripe_refund_id: result.id,
          reason: result.error,
        };
      } catch (err) {
        refund = {
          ...refund,
          reason: err instanceof Error ? err.message : 'unknown',
        };
      }
    }
  }

  await emit({
    action: 'team_cancelled',
    user_id: args.admin_user_id,
    object_type: 'team',
    object_id: args.team_id,
    payload: {
      seats_revoked: activeSeats.length,
      refund_cents: refund.amount_cents,
      refunded: refund.refunded,
    },
  });

  return {
    cancelled: true,
    seats_revoked: activeSeats.length,
    refund,
    notified_emails: activeSeats.map((s) => s.invited_email),
  };
}

export { ACCESS_MONTHS, SEAT_UNIT_PRICE_CENTS };
