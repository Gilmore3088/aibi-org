// Team seat lifecycle: invite, accept, revoke. Auth Spec §7.
//
// Admin authorization is checked at the API route layer (the caller's
// auth.uid must equal teams.admin_user_id). These helpers operate with
// service_role and trust the route layer's enforcement.

import {
  getAddieServiceClient,
  normalizeEmail,
  isValidEmail,
} from '@/lib/addie/supabase/service';
import { subscribeToAssessmentForm } from '@/lib/mailerlite';
import { writeEntitlement } from '@/lib/addie/entitlements/write';
import { emit } from '@/lib/addie/events/emit';

export interface InviteSeatsArgs {
  readonly team_id: string;
  readonly admin_user_id: string;
  readonly emails: readonly string[];
}

export interface InviteSeatsResult {
  readonly invited: readonly { seat_id: string; email: string }[];
  readonly skipped: readonly { email: string; reason: string }[];
}

export async function inviteSeats(args: InviteSeatsArgs): Promise<InviteSeatsResult> {
  const supa = getAddieServiceClient();

  // Confirm team ownership and seat budget.
  const { data: team, error: tErr } = await supa
    .from('teams')
    .select('id, admin_user_id, seats_purchased')
    .eq('id', args.team_id)
    .single();
  if (tErr || !team) throw new Error('Team not found');
  if (team.admin_user_id !== args.admin_user_id) {
    throw new Error('Forbidden: not team admin');
  }

  const { count: usedCount, error: cErr } = await supa
    .from('seats')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', args.team_id)
    .in('status', ['invited', 'assigned']);
  if (cErr) throw new Error(`seat count failed: ${cErr.message}`);

  const remaining = (team.seats_purchased as number) - (usedCount ?? 0);
  const requested = args.emails.length;
  if (requested > remaining) {
    throw new Error(`Only ${remaining} seat(s) available; ${requested} requested`);
  }

  const invited: { seat_id: string; email: string }[] = [];
  const skipped: { email: string; reason: string }[] = [];

  for (const raw of args.emails) {
    if (!isValidEmail(raw)) {
      skipped.push({ email: raw, reason: 'invalid_email' });
      continue;
    }
    const email = normalizeEmail(raw);
    const { data: row, error } = await supa
      .from('seats')
      .insert({
        team_id: args.team_id,
        invited_email: email,
        status: 'invited',
      })
      .select('id')
      .single();
    if (error) {
      if (/duplicate key/i.test(error.message)) {
        skipped.push({ email, reason: 'already_invited' });
      } else {
        skipped.push({ email, reason: error.message });
      }
      continue;
    }
    invited.push({ seat_id: row.id as string, email });
    await sendInvitation(email, row.id as string, args.team_id);
    await emit({
      action: 'seat_invited',
      user_id: args.admin_user_id,
      object_type: 'seat',
      object_id: row.id as string,
      payload: { team_id: args.team_id, email },
    });
  }

  return { invited, skipped };
}

async function sendInvitation(email: string, seat_id: string, team_id: string): Promise<void> {
  if (process.env.SKIP_MAILERLITE === 'true') {
    console.info('[addie/team/seats] SKIP_MAILERLITE — would invite', { email, seat_id });
    return;
  }
  // TODO: replace with a dedicated Resend transactional template once the
  // template is added (Auth Spec §7.2 specifies an invite link with a
  // signed `?invite=<seat_id>` token). For v1 we drop the invitee into the
  // nurture group; the orchestrator will swap to Resend in Wave 2.
  await subscribeToAssessmentForm({
    email,
    fields: { invite_seat_id: seat_id, invite_team_id: team_id },
  });
}

export interface AcceptSeatArgs {
  readonly seat_id: string;
  readonly user_id: string;
  readonly user_email: string;
}

export interface AcceptSeatResult {
  readonly accepted: boolean;
  readonly reason?: string;
}

export async function acceptSeat(args: AcceptSeatArgs): Promise<AcceptSeatResult> {
  const supa = getAddieServiceClient();
  const userEmail = normalizeEmail(args.user_email);

  const { data: seat, error } = await supa
    .from('seats')
    .select('id, team_id, invited_email, status, learner_user_id')
    .eq('id', args.seat_id)
    .single();
  if (error || !seat) return { accepted: false, reason: 'seat_not_found' };
  if (seat.status === 'revoked') return { accepted: false, reason: 'revoked' };
  if (seat.status === 'assigned' && seat.learner_user_id === args.user_id) {
    return { accepted: true }; // idempotent
  }
  if (seat.status === 'assigned') return { accepted: false, reason: 'already_assigned' };
  if ((seat.invited_email as string).toLowerCase() !== userEmail) {
    return { accepted: false, reason: 'email_mismatch' };
  }

  const { error: updErr } = await supa
    .from('seats')
    .update({
      learner_user_id: args.user_id,
      status: 'assigned',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', args.seat_id);
  if (updErr) throw new Error(`seat accept failed: ${updErr.message}`);

  await writeEntitlement({
    user_id: args.user_id,
    product: 'foundation_team_seat',
    seat_id: args.seat_id,
  });

  await emit({
    action: 'seat_accepted',
    user_id: args.user_id,
    object_type: 'seat',
    object_id: args.seat_id,
    payload: { team_id: seat.team_id },
  });

  return { accepted: true };
}

export interface RevokeSeatArgs {
  readonly seat_id: string;
  readonly admin_user_id: string;
}

export async function revokeSeat(args: RevokeSeatArgs): Promise<void> {
  const supa = getAddieServiceClient();

  const { data: seat, error } = await supa
    .from('seats')
    .select('id, team_id, learner_user_id, teams!inner(admin_user_id)')
    .eq('id', args.seat_id)
    .single();
  if (error || !seat) throw new Error('Seat not found');
  const adminId = (seat.teams as { admin_user_id: string } | { admin_user_id: string }[] | null);
  const ownerId = Array.isArray(adminId) ? adminId[0]?.admin_user_id : adminId?.admin_user_id;
  if (ownerId !== args.admin_user_id) throw new Error('Forbidden: not team admin');

  const { error: sErr } = await supa
    .from('seats')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .eq('id', args.seat_id);
  if (sErr) throw new Error(`seat revoke failed: ${sErr.message}`);

  // Revoke the seat-linked entitlement.
  const { error: eErr } = await supa
    .from('entitlements')
    .update({ status: 'revoked' })
    .eq('seat_id', args.seat_id);
  if (eErr) console.warn('[addie/team/seats] entitlement revoke warn:', eErr.message);

  await emit({
    action: 'seat_revoked',
    user_id: args.admin_user_id,
    object_type: 'seat',
    object_id: args.seat_id,
    payload: { team_id: seat.team_id, learner_user_id: seat.learner_user_id },
  });
}
