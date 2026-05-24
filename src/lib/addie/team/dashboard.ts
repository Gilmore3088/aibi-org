// Team admin dashboard snapshot loader. PRD §6.7, FR-D4.
//
// Reads addie.teams + addie.team_progress_v via service_role and returns
// a plain snapshot suitable for passing to client components. Per FR-D4
// the snapshot is COUNTS ONLY — never artifact bodies, sandbox transcripts,
// or email-engagement signals. Do not extend this query with per-learner
// content columns.

import { getAddieServiceClient } from '@/lib/addie/supabase/service';

export type SeatStatus = 'invited' | 'assigned' | 'revoked';

export interface TeamRow {
  readonly id: string;
  readonly name: string;
  readonly seats_purchased: number;
  readonly admin_user_id: string;
  readonly stripe_subscription_id: string | null;
}

export interface SeatProgressRow {
  readonly seat_id: string;
  readonly invited_email: string;
  readonly seat_status: SeatStatus;
  readonly user_id: string | null;
  readonly track: string | null;
  readonly lessons_completed: number;
  readonly sandbox_runs: number;
  readonly artifacts_saved: number;
  readonly artifacts_reused: number;
  readonly last_activity_at: string | null;
}

export interface SeatBudget {
  readonly purchased: number;
  readonly used: number; // invited + assigned (revoked frees the slot)
  readonly remaining: number;
}

export interface TeamDashboardSnapshot {
  readonly team: TeamRow;
  readonly seats: ReadonlyArray<SeatProgressRow>;
  readonly budget: SeatBudget;
}

interface TeamQueryRow {
  id: string;
  name: string;
  seats_purchased: number;
  admin_user_id: string;
  stripe_subscription_id: string | null;
}

interface RawSeatRow {
  id: string;
  invited_email: string;
  status: SeatStatus;
  learner_user_id: string | null;
}

interface RawProgressRow {
  seat_id: string;
  invited_email: string;
  seat_status: SeatStatus;
  user_id: string | null;
  track: string | null;
  lessons_completed: number | null;
  sandbox_runs: number | null;
  artifacts_saved: number | null;
  artifacts_reused: number | null;
  last_activity_at: string | null;
}

function toInt(n: number | null | undefined): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

export async function loadTeamDashboard(
  admin_user_id: string,
): Promise<TeamDashboardSnapshot | null> {
  if (typeof admin_user_id !== 'string' || admin_user_id.length === 0) {
    return null;
  }

  const supa = getAddieServiceClient();

  // 1. Resolve the team owned by this admin. Most admins manage one team;
  //    we take the first if there are several (rare — typically a
  //    re-purchase). Defer multi-team support to a later wave.
  const { data: teamRows, error: teamErr } = await supa
    .from('teams')
    .select('id, name, seats_purchased, admin_user_id, stripe_subscription_id')
    .eq('admin_user_id', admin_user_id)
    .order('created_at', { ascending: true })
    .limit(1);

  if (teamErr) {
    throw new Error(`team lookup failed: ${teamErr.message}`);
  }
  const teamRow = (teamRows ?? [])[0] as TeamQueryRow | undefined;
  if (!teamRow) return null;

  const team: TeamRow = {
    id: teamRow.id,
    name: teamRow.name,
    seats_purchased: teamRow.seats_purchased,
    admin_user_id: teamRow.admin_user_id,
    stripe_subscription_id: teamRow.stripe_subscription_id ?? null,
  };

  // 2. Pull the seats roster directly. The team_progress_v view filters out
  //    status='invited' rows (because there is no learner_user_id yet, so
  //    no progress to roll up); we union those in from addie.seats so the
  //    admin still sees pending invitations on the dashboard.
  const [seatsRes, progressRes] = await Promise.all([
    supa
      .from('seats')
      .select('id, invited_email, status, learner_user_id')
      .eq('team_id', team.id),
    supa
      .from('team_progress_v')
      .select(
        'seat_id, invited_email, seat_status, user_id, track, ' +
          'lessons_completed, sandbox_runs, artifacts_saved, artifacts_reused, last_activity_at',
      )
      .eq('team_id', team.id),
  ]);

  if (seatsRes.error) {
    throw new Error(`seat roster failed: ${seatsRes.error.message}`);
  }
  if (progressRes.error) {
    throw new Error(`progress rollup failed: ${progressRes.error.message}`);
  }

  const progressBySeat = new Map<string, RawProgressRow>();
  for (const r of (progressRes.data ?? []) as unknown as RawProgressRow[]) {
    progressBySeat.set(r.seat_id, r);
  }

  const seats: SeatProgressRow[] = ((seatsRes.data ?? []) as unknown as RawSeatRow[]).map((s) => {
    const p = progressBySeat.get(s.id);
    return {
      seat_id: s.id,
      invited_email: s.invited_email,
      seat_status: s.status,
      user_id: s.learner_user_id ?? p?.user_id ?? null,
      track: p?.track ?? null,
      lessons_completed: toInt(p?.lessons_completed),
      sandbox_runs: toInt(p?.sandbox_runs),
      artifacts_saved: toInt(p?.artifacts_saved),
      artifacts_reused: toInt(p?.artifacts_reused),
      last_activity_at: p?.last_activity_at ?? null,
    };
  });

  // 3. Budget. inviteSeats() counts invited+assigned; mirror that exactly so
  //    the dashboard's "remaining" matches what the API will accept.
  const used = seats.filter((s) => s.seat_status !== 'revoked').length;
  const purchased = team.seats_purchased;
  const remaining = Math.max(0, purchased - used);

  return {
    team,
    seats,
    budget: { purchased, used, remaining },
  };
}
