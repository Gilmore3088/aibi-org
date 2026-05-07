// /assessment/in-depth/take
// Token-gated entry to the 48-question diagnostic. Validates ?token,
// looks up the taker, redirects completed takers to results, and best-
// effort marks the invite consumed before rendering the take UI.
//
// Authorization: token-only. No pre-quiz auth gate. The token in the URL
// IS the access credential — for individuals (post-Stripe redirect),
// for institution invitees (magic-link email), and for institution
// leaders (their leader-row token). Account claim happens AFTER the
// quiz: the completion email embeds a Supabase magic link that signs
// the buyer in and lands them on the results page authed.
//
// Post-checkout race: Stripe redirects with ?session=cs_xxx the instant
// payment confirms, but the webhook that creates the indepth_takes row
// is asynchronous. We poll the lookup-by-session for up to MAX_POLL_MS
// before giving up.

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

const MAX_POLL_MS = 8_000;
const POLL_INTERVAL_MS = 500;

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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function findTokenByStripeSession(sessionId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();
  const deadline = Date.now() + MAX_POLL_MS;
  while (Date.now() < deadline) {
    const { data: row } = await supabase
      .from('indepth_takes')
      .select('invite_token')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();
    if (row?.invite_token) return row.invite_token;
    await sleep(POLL_INTERVAL_MS);
  }
  return null;
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

function CheckoutProcessing({ email }: { email?: string }) {
  return (
    <main className="min-h-screen bg-[color:var(--color-linen)] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-terra)] mb-4">
          Payment received
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
          Your assessment is being prepared.
        </h1>
        <p className="font-sans text-base text-[color:var(--color-ink)]/80 mb-6">
          This usually takes a few seconds. {email ? `We also sent a take-link to ${email} as a backup.` : 'Check your inbox for a backup take-link.'}
        </p>
        <p className="font-sans text-sm text-[color:var(--color-slate)]">
          If this page does not advance in 30 seconds, refresh — or contact
          support if the problem persists.
        </p>
        <meta httpEquiv="refresh" content="5" />
      </section>
    </main>
  );
}

export default async function TakeAssessmentPage({ searchParams }: PageProps) {
  let token = pickOne(searchParams?.token);
  const sessionId = pickOne(searchParams?.session);

  // Post-checkout entry: Stripe redirects buyers here with
  // ?session={CHECKOUT_SESSION_ID}. The webhook creates the row out-of-
  // band; poll for it (up to 8s) before falling back to the friendly
  // "still processing" page.
  if (!token && sessionId) {
    const resolved = await findTokenByStripeSession(sessionId);
    if (resolved) {
      redirect(`/assessment/in-depth/take?token=${encodeURIComponent(resolved)}`);
    }
    return <CheckoutProcessing />;
  }

  if (!token || !isValidInviteToken(token)) {
    return <InvalidInvite />;
  }

  const supabase = createServiceRoleClient();
  const { data: taker, error } = await supabase
    .from('indepth_takes')
    .select('id, invite_email, invite_consumed_at, completed_at')
    .eq('invite_token', token)
    .maybeSingle();

  if (error || !taker) {
    return <InvalidInvite />;
  }

  if (taker.completed_at) {
    redirect(`/results/in-depth/${taker.id}?t=${encodeURIComponent(token)}`);
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
