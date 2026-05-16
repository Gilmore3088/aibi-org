// /courses/foundation/program/purchased
// Stripe Checkout success_url for AiBI-Foundation.
//
// Intentionally chromeless (no LMS sidebar). The user has just paid but may
// not be signed in yet — showing them a sidebar of locked modules would
// confuse the "I just bought this, where's my course?" mental model. Once
// they sign in, the binding completes and /courses/foundation/program
// renders the full LMS shell.

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { PrimaryButton, GhostButton } from '@/components/lms';

export const metadata: Metadata = {
  title: 'Welcome to AiBI-Foundation | The AI Banking Institute',
  description:
    'Your AiBI-Foundation enrollment is confirmed. Sign in to begin Module 1.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const HIGHLIGHTS = [
  '12 self-paced modules built around AI Use Cards',
  'Banking-specific practice reps you keep and reuse',
  'Work-product assessment + the AiBI-Foundation credential',
  'Lifetime access to course materials',
] as const;

interface AiBIPurchasedPageProps {
  readonly searchParams?: Promise<{ readonly session_id?: string }>;
}

export default async function AiBIPurchasedPage({
  searchParams,
}: AiBIPurchasedPageProps) {
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

  // Recover the email from the Stripe Checkout Session so the auth links
  // pre-fill — buyer typed their email once at Stripe, never again.
  const sp = (await searchParams) ?? {};
  const { getSessionEmail } = await import('@/lib/stripe/get-session-email');
  const stripeEmail = signedInEmail
    ? null
    : await getSessionEmail(sp.session_id);
  const prefillEmail = signedInEmail ?? stripeEmail ?? null;
  const emailQs = prefillEmail
    ? `&email=${encodeURIComponent(prefillEmail)}`
    : '';

  return (
    <main
      style={{
        background: 'var(--ledger-bg)',
        minHeight: '70vh',
        padding: '56px 24px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
            }}
          >
            Enrollment confirmed
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 'clamp(40px, 5.2vw, 60px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            color: 'var(--ledger-ink)',
          }}
        >
          Welcome to{' '}
          <em style={{ color: 'var(--ledger-accent)', fontStyle: 'normal', fontWeight: 500 }}>
            AiBI-Foundation.
          </em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontStyle: 'italic',
            fontSize: 20,
            lineHeight: 1.45,
            color: 'var(--ledger-ink-2)',
            margin: '0 0 32px',
            maxWidth: '60ch',
          }}
        >
          Thanks for your purchase. A receipt is on its way from Stripe, and a
          welcome email with the course link will follow within minutes.
        </p>

        <section
          style={{
            border: '1px solid var(--ledger-rule)',
            background: 'var(--ledger-parch)',
            borderRadius: 3,
            padding: '24px 26px',
            marginBottom: 40,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
              margin: '0 0 14px',
            }}
          >
            What you get
          </p>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gap: 10,
            }}
          >
            {HIGHLIGHTS.map((line) => (
              <li
                key={line}
                style={{
                  display: 'flex',
                  gap: 10,
                  fontSize: 14.5,
                  color: 'var(--ledger-ink-2)',
                  lineHeight: 1.55,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    marginTop: 7,
                    width: 6,
                    height: 6,
                    background: 'var(--ledger-accent)',
                    flex: 'none',
                  }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ borderTop: '1px solid var(--ledger-rule)', paddingTop: 28 }}>
          {signedInEmail ? (
            <>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ledger-ink-2)',
                  margin: '0 0 18px',
                  lineHeight: 1.6,
                }}
              >
                You&rsquo;re signed in as{' '}
                <span
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    color: 'var(--ledger-ink)',
                  }}
                >
                  {signedInEmail}
                </span>
                . Module 1 takes about 35 minutes.
              </p>
              <PrimaryButton as="a" href="/courses/foundation/program">
                Begin Module 1 →
              </PrimaryButton>
            </>
          ) : (
            <>
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--ledger-ink-2)',
                  margin: '0 0 18px',
                  lineHeight: 1.6,
                }}
              >
                One last step: {prefillEmail ? 'finish creating' : 'create or sign into'} your
                account{prefillEmail ? (
                  <>
                    {' '}for{' '}
                    <span style={{ fontFamily: 'var(--ledger-mono)', color: 'var(--ledger-ink)' }}>
                      {prefillEmail}
                    </span>
                  </>
                ) : null} to bind your enrollment. Takes 30 seconds.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <PrimaryButton
                  as="a"
                  href={`/auth/signup?next=/courses/foundation/program${emailQs}`}
                >
                  Create my account
                </PrimaryButton>
                <GhostButton
                  as="a"
                  href={`/auth/login?next=/courses/foundation/program${emailQs}`}
                >
                  I already have one
                </GhostButton>
              </div>
            </>
          )}
          <p
            style={{
              fontSize: 12.5,
              color: 'var(--ledger-muted)',
              margin: '24px 0 0',
              lineHeight: 1.55,
            }}
          >
            Trouble? Reply to your receipt email or write to{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{
                color: 'var(--ledger-accent)',
                textDecoration: 'underline',
              }}
            >
              hello@aibankinginstitute.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
