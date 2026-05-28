// /assessment/in-depth/purchased
// Stripe Checkout success_url for the In-Depth Assessment.
// Branches on auth state:
//   - logged in → "Begin assessment" CTA → /assessment/in-depth/take
//   - not logged in → "Log in to start" CTA → /auth/login?next=/assessment/in-depth/take
// Either way, shows the receipt confirmation block so the buyer knows the
// payment landed.

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getValidatedPaidSession } from '@/lib/stripe/get-validated-paid-session';

export const metadata: Metadata = {
  title: 'Purchase confirmed | The AI Banking Institute',
  description:
    'Your In-Depth AI Readiness Assessment is ready. Sign in to start the 48-question diagnostic.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const HIGHLIGHTS = [
  '48 questions across all eight readiness dimensions',
  'Personalized Briefing with peer-band comparison and dimension deep-dives',
  '90-day action register keyed to your lowest-scoring dimensions',
  'One free retake within 12 months',
] as const;

interface InDepthPurchasedPageProps {
  readonly searchParams?: Promise<{ readonly session_id?: string }>;
}

export default async function InDepthPurchasedPage({
  searchParams,
}: InDepthPurchasedPageProps) {
  let signedInEmail: string | null = null;

  if (isSupabaseConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = await cookies();
    const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedInEmail = user?.email ?? null;
  }

  const sp = (await searchParams) ?? {};

  // Validate the session against Stripe before rendering the success view.
  // Without this gate, /assessment/in-depth/purchased renders for any
  // visitor regardless of session_id — including bogus values — leaking
  // the "INCLUDED WITH YOUR PURCHASE" toolkit framing to people who
  // never paid (issue #321).
  //
  // Exception 1: signed-in user — legitimate bookmark / return visit.
  // Exception 2: STRIPE_SECRET_KEY not configured — local/preview env
  // without keys; let the page render so QA can still walk the flow.
  const validSession = await getValidatedPaidSession(sp.session_id);
  if (
    process.env.STRIPE_SECRET_KEY &&
    !validSession &&
    !signedInEmail
  ) {
    redirect('/assessment/in-depth');
  }

  // Recover the email from the Stripe session so the auth links are
  // pre-filled — buyer typed it once at Stripe Checkout, never again.
  const stripeEmail = signedInEmail
    ? null
    : validSession?.customer_details?.email ??
      validSession?.customer_email ??
      null;
  const prefillEmail = signedInEmail ?? stripeEmail ?? null;
  const emailQs = prefillEmail
    ? `&email=${encodeURIComponent(prefillEmail)}`
    : '';

  return (
    <main
      className="px-6 py-14 md:py-20"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        background: 'var(--cream)',
        minHeight: '100vh',
      }}
    >
      <div className="mx-auto max-w-3xl">
        <p
          className="uppercase mb-3"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: 'var(--gold-deep)',
          }}
        >
          Purchase confirmed
        </p>
        <h1
          className="mb-5"
          style={{
            fontSize: 'clamp(36px, 4.5vw, 52px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}
        >
          Your In-Depth Assessment is ready.
        </h1>
        <p
          className="mb-8 max-w-2xl"
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: 'var(--slate-600)',
          }}
        >
          Thanks for your purchase. A receipt is on its way from Stripe, and
          a welcome email with the assessment link will follow within minutes.
        </p>

        <section
          className="mb-10"
          style={{
            border: '1px solid var(--ink-a10)',
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <p
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--gold-deep)',
              marginBottom: 16,
            }}
          >
            What you get
          </p>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((line) => (
              <li
                key={line}
                className="flex gap-3"
                style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.55 }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    marginTop: 9,
                    height: 6,
                    width: 6,
                    borderRadius: 999,
                    background: 'var(--gold)',
                    flexShrink: 0,
                  }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="pt-8"
          style={{ borderTop: '1px solid var(--ink-a10)' }}
        >
          {signedInEmail ? (
            <>
              <p className="mb-5" style={{ fontSize: 14, color: 'var(--slate-600)' }}>
                You&rsquo;re signed in as{' '}
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {signedInEmail}
                </span>
                . Begin the 48-question diagnostic — about 20 minutes.
              </p>
              <Link
                href="/assessment/in-depth/take"
                className="inline-block uppercase transition-colors"
                style={{
                  background: 'var(--gold)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                }}
              >
                TAKE THE ASSESSMENT
              </Link>
            </>
          ) : (
            <>
              <p className="mb-5" style={{ fontSize: 14, color: 'var(--slate-600)' }}>
                One last step: {prefillEmail ? 'finish creating' : 'create or sign into'} your
                account{prefillEmail ? (
                  <>
                    {' '}for{' '}
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {prefillEmail}
                    </span>
                  </>
                ) : null}{' '}
                to open the assessment. Takes 30 seconds.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/auth/signup?next=/assessment/in-depth/take${emailQs}`}
                  className="inline-block uppercase transition-colors"
                  style={{
                    background: 'var(--gold)',
                    color: '#fff',
                    padding: '14px 28px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                  }}
                >
                  CREATE MY ACCOUNT
                </Link>
                <Link
                  href={`/auth/login?next=/assessment/in-depth/take${emailQs}`}
                  className="inline-block uppercase transition-colors"
                  style={{
                    border: '1px solid var(--ink-a15)',
                    color: 'var(--ink)',
                    padding: '14px 28px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                  }}
                >
                  I ALREADY HAVE ONE
                </Link>
              </div>
            </>
          )}
          <p style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 24 }}>
            Trouble? Reply to your receipt email or write to{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{
                color: 'var(--gold-deep)',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              hello@aibankinginstitute.com
            </a>
            .
          </p>
        </section>

        <section
          className="mt-10"
          style={{
            border: '1px solid var(--ink-a10)',
            borderLeft: '4px solid var(--gold)',
            background: '#fff',
            padding: 32,
            borderRadius: 24,
          }}
        >
          <p
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--gold-deep)',
              marginBottom: 10,
            }}
          >
            Included with your purchase
          </p>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            Your AI Starter Toolkit
          </h2>
          <p
            className="mb-5"
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--slate-600)',
              maxWidth: '60ch',
            }}
          >
            Read-only access to the Library and Cookbook — banker-vetted
            prompts you can copy into Claude, ChatGPT, or Gemini. Build and
            Playground access with the AiBI-Foundation course.
          </p>
          <div className="flex flex-wrap gap-4">
            {/* Was /dashboard/toolbox/library — auth-walled, so a just-paid
                unauthenticated buyer hit a login wall when clicking the
                toolkit framed as "INCLUDED WITH YOUR PURCHASE". Send them
                to the public /research hub which surfaces the same library
                artifacts as free downloads. Issue #323. */}
            <Link
              href="/research"
              className="inline-block uppercase transition-colors"
              style={{
                background: 'var(--gold)',
                color: '#fff',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
              }}
            >
              BROWSE THE LIBRARY →
            </Link>
            {/* Was /courses/foundation/program — auth-walled. Send unauth
                buyers to the public purchase landing so the upsell actually
                works. Issue #322. */}
            <Link
              href="/courses/foundation/program/purchase"
              className="inline-block uppercase transition-colors"
              style={{
                border: '1px solid var(--ink-a15)',
                color: 'var(--ink)',
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
              }}
            >
              SEE THE FOUNDATION UPGRADE
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
