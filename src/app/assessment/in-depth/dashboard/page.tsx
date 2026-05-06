// /assessment/in-depth/dashboard — institution leader UI.
//
// Server component:
//   1. Auth-gates (redirects to /auth/login on miss)
//   2. Resolves the leader row from ?session= (Stripe checkout id) or
//      ?cohortId= (the leader row id; legacy alias: institutionId)
//   3. Binds leader_user_id on first visit when leader_email matches
//   4. Loads the roster server-side and hands it to the client component
//
// The aggregate panel is fetched client-side from /api/indepth/aggregate
// because that endpoint already enforces ownership and returns the
// locked/unlocked envelope.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
} from '@/lib/supabase/client';
import DashboardClient, {
  type RosterEntry,
} from './_DashboardClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    session?: string;
    cohortId?: string;
    institutionId?: string;
  };
}

function buildLoginNext(params: PageProps['searchParams']): string {
  const qs = new URLSearchParams();
  if (params.session) qs.set('session', params.session);
  if (params.cohortId) qs.set('cohortId', params.cohortId);
  else if (params.institutionId) qs.set('cohortId', params.institutionId);
  const tail = qs.toString();
  const path = `/assessment/in-depth/dashboard${tail ? `?${tail}` : ''}`;
  return `/auth/login?next=${encodeURIComponent(path)}`;
}

function NotFoundShell({ title, body }: { title: string; body: string }) {
  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-2xl mx-auto">
        <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
          In-Depth Assessment
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] leading-tight mb-4">
          {title}
        </h1>
        <p className="text-[color:var(--color-slate)] text-base leading-relaxed mb-6">
          {body}
        </p>
        <Link
          href="/assessment/in-depth"
          className="inline-block px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-all"
        >
          Back to In-Depth Assessment
        </Link>
      </div>
    </main>
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const auth = createServerClientWithCookies(cookies());
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) {
    redirect(buildLoginNext(searchParams));
  }

  const supabase = createServiceRoleClient();

  // Resolve cohort id (== leader row id). cohortId is canonical;
  // institutionId stays as an alias for older bookmarks.
  let cohortId = searchParams.cohortId ?? searchParams.institutionId ?? null;

  if (!cohortId && searchParams.session) {
    const { data: row } = await supabase
      .from('indepth_takes')
      .select('id, leader_user_id, leader_email')
      .eq('stripe_session_id', searchParams.session)
      .eq('is_leader', true)
      .maybeSingle();

    if (row) {
      cohortId = row.id;
      if (!row.leader_user_id && row.leader_email === user.email) {
        await supabase
          .from('indepth_takes')
          .update({ leader_user_id: user.id })
          .eq('cohort_id', row.id);
      }
    }
  }

  if (!cohortId) {
    return (
      <NotFoundShell
        title="No institution found"
        body="We couldn't locate an institution tied to this checkout session. If you just completed a purchase, refresh in a minute. If you were expecting to see a roster, please contact support."
      />
    );
  }

  const { data: leader } = await supabase
    .from('indepth_takes')
    .select('id, institution_name, leader_user_id, leader_email, seats_purchased')
    .eq('id', cohortId)
    .eq('is_leader', true)
    .maybeSingle();

  if (!leader) {
    return (
      <NotFoundShell
        title="Institution not found"
        body="The institution row we tried to load no longer exists."
      />
    );
  }

  if (!leader.leader_user_id && leader.leader_email === user.email) {
    await supabase
      .from('indepth_takes')
      .update({ leader_user_id: user.id })
      .eq('cohort_id', leader.id);
    leader.leader_user_id = user.id;
  }

  if (leader.leader_user_id !== user.id) {
    return (
      <NotFoundShell
        title="Not authorized"
        body="This institution dashboard is bound to a different account. Sign in with the leader email used at purchase."
      />
    );
  }

  // Load the roster — every member of the cohort except the leader's own
  // header row (we show the leader as a roster entry only if they took
  // the assessment from their row, which is implicit in the answers).
  const { data: takers } = await supabase
    .from('indepth_takes')
    .select('invite_email, invite_consumed_at, completed_at, invite_sent_at, is_leader')
    .eq('cohort_id', leader.id)
    .order('invite_sent_at', { ascending: true });

  const roster: RosterEntry[] = (takers ?? [])
    .filter((t) => !t.is_leader)
    .map((t) => ({
      invite_email: t.invite_email,
      status: t.completed_at
        ? 'complete'
        : t.invite_consumed_at
          ? 'in-progress'
          : 'pending',
    }));

  return (
    <DashboardClient
      cohortId={leader.id}
      institutionName={leader.institution_name ?? ''}
      seatsPurchased={leader.seats_purchased ?? 0}
      initialRoster={roster}
    />
  );
}
