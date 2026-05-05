// /assessment/in-depth/take
// Token-gated entry to the 48-question diagnostic. Validates ?token,
// looks up the taker, redirects completed takers to results, and best-
// effort marks the invite consumed before rendering the take UI.

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isValidInviteToken } from '@/lib/indepth/tokens';
import { createServiceRoleClient } from '@/lib/supabase/client';
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
      .from('indepth_assessment_takers')
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
    .from('indepth_assessment_takers')
    .select('id, invite_consumed_at, completed_at')
    .eq('invite_token', token)
    .maybeSingle();

  if (error || !taker) {
    return <InvalidInvite />;
  }

  if (taker.completed_at) {
    redirect(`/results/in-depth/${taker.id}`);
  }

  if (!taker.invite_consumed_at) {
    // Best-effort consumption marker — failures here must not block the take.
    await supabase
      .from('indepth_assessment_takers')
      .update({ invite_consumed_at: new Date().toISOString() })
      .eq('id', taker.id)
      .then(
        () => undefined,
        () => undefined,
      );
  }

  return <TakeClient takerId={taker.id} questions={[...questions]} />;
}
