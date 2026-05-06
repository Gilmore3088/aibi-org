// /assessment/in-depth/take
// Token-gated entry to the 48-question diagnostic. Validates ?token,
// looks up the taker, redirects completed takers to results, and best-
// effort marks the invite consumed before rendering the take UI.

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { isValidInviteToken } from '@/lib/indepth/tokens';
import {
  createServerClientWithCookies,
  createServiceRoleClient,
} from '@/lib/supabase/client';
import { questions } from '@content/assessments/v2/questions';
import TakeClient from './_TakeClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'In-Depth Assessment | The AI Banking Institute',
  robots: { index: false, follow: false },
};

interface PageProps {
  readonly searchParams: {
    token?: string | string[];
    session?: string | string[];
    from?: string | string[];
  };
}

function pickOne(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function InvalidInvite() {
  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-4">
          Invite link
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
          This invite link is invalid or has expired.
        </h1>
        <p className="font-sans text-base text-[color:var(--color-ink)]/80">
          If you believe this is an error, reply to your invite email and we will
          re-issue your link.
        </p>
      </section>
    </main>
  );
}

export default async function TakeAssessmentPage({ searchParams }: PageProps) {
  let token = pickOne(searchParams?.token);
  const sessionId = pickOne(searchParams?.session);

  // Post-checkout entry: Stripe redirects individual buyers here with
  // ?session={CHECKOUT_SESSION_ID} (no token, since the webhook generates it
  // out-of-band). Look up the row by stripe_session_id and 302 to ?token=...
  // so the buyer can start their assessment immediately without waiting for
  // the invite email to arrive.
  if (!token && sessionId) {
    const supabase = createServiceRoleClient();
    const { data: row } = await supabase
      .from('indepth_takes')
      .select('invite_token')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    if (row?.invite_token) {
      redirect(`/assessment/in-depth/take?token=${encodeURIComponent(row.invite_token)}`);
    }
  }

  if (!token || !isValidInviteToken(token)) {
    return <InvalidInvite />;
  }

  const supabase = createServiceRoleClient();
  const { data: taker, error } = await supabase
    .from('indepth_takes')
    .select('id, invite_email, invite_consumed_at, completed_at, user_id, cohort_id, is_leader')
    .eq('invite_token', token)
    .maybeSingle();

  if (error || !taker) {
    return <InvalidInvite />;
  }

  if (taker.completed_at) {
    redirect(`/results/in-depth/${taker.id}?t=${encodeURIComponent(token)}`);
  }

  // Auth gate: individual buyers (cohort_id = null) and institution
  // leaders (is_leader = true) must be signed in so their result is tied
  // to their account / their cohort dashboard. Institution invitees
  // (is_leader = false AND cohort_id IS NOT NULL) stay token-only — the
  // leader paid and not every staffer has an account yet; their results
  // are visible to them via the magic-link in their email.
  const isInvitee = taker.cohort_id !== null && taker.is_leader === false;

  let authedUser: { id: string; email: string | null } | null = null;
  try {
    const supabaseAuth = createServerClientWithCookies(cookies());
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    authedUser = user
      ? { id: user.id, email: user.email ?? null }
      : null;
  } catch {
    // Auth lookup failure: treat as unauthenticated.
  }

  if (!isInvitee && !authedUser) {
    const next = encodeURIComponent(
      `/assessment/in-depth/take?token=${encodeURIComponent(token)}`,
    );
    const emailHint = encodeURIComponent(taker.invite_email);
    redirect(`/auth/login?next=${next}&email=${emailHint}`);
  }

  // First-authed-visit binding: attach auth user.id, grant starter
  // toolkit (individuals only), and bind leader_user_id (leaders only).
  if (
    authedUser &&
    !taker.user_id &&
    authedUser.email === taker.invite_email
  ) {
    await supabase
      .from('indepth_takes')
      .update({ user_id: authedUser.id })
      .eq('id', taker.id)
      .then(
        () => undefined,
        () => undefined,
      );

    if (taker.cohort_id === null) {
      // Individual buyer — grant starter toolkit entitlement.
      await supabase
        .from('entitlements')
        .upsert(
          {
            user_id: authedUser.id,
            product: 'indepth-starter-toolkit',
            source: 'subscription',
            source_ref: taker.id,
            active: true,
          },
          { onConflict: 'user_id,product,source,source_ref' },
        )
        .then(
          () => undefined,
          () => undefined,
        );
    } else if (taker.is_leader) {
      // Cohort leader — bind leader_user_id across the entire cohort
      // (denormalized on every member row) and grant starter toolkit.
      await supabase
        .from('indepth_takes')
        .update({ leader_user_id: authedUser.id })
        .eq('cohort_id', taker.cohort_id)
        .then(
          () => undefined,
          () => undefined,
        );
      await supabase
        .from('entitlements')
        .upsert(
          {
            user_id: authedUser.id,
            product: 'indepth-starter-toolkit',
            source: 'subscription',
            source_ref: taker.id,
            active: true,
          },
          { onConflict: 'user_id,product,source,source_ref' },
        )
        .then(
          () => undefined,
          () => undefined,
        );
    }
  }

  if (!taker.invite_consumed_at) {
    // Best-effort consumption marker — failures here must not block the take.
    await supabase
      .from('indepth_takes')
      .update({ invite_consumed_at: new Date().toISOString() })
      .eq('id', taker.id)
      .then(
        () => undefined,
        () => undefined,
      );
  }

  return (
    <TakeClient
      takerId={taker.id}
      questions={[...questions]}
      inviteToken={token}
    />
  );
}
