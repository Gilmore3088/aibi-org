// /courses/foundation/program/purchased
// Stripe Checkout success_url for AiBI-Foundation.
//
// Intentionally chromeless (no LMS sidebar). The user has just paid but may
// not be signed in yet — showing them a sidebar of locked modules would
// confuse the "I just bought this, where's my course?" mental model. Once
// they sign in, the binding completes and /courses/foundation/program
// renders the full LMS shell.
//
// 2026-05-27 redesign (audit §4): the page no longer re-sells the course
// with a HIGHLIGHTS bullet list. The buyer already bought. Instead it
// answers "what happens now" in the first viewport with a three-step
// action ladder, and shows the artifact they're about to produce — a
// real saved-prompt preview card. Sign-in CTA is step 1 of the ladder,
// not a separate section. Receipt + access info is a quiet strip.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getValidatedPaidSession } from '@/lib/stripe/get-validated-paid-session';
import { PrimaryButton, GhostButton } from '@/components/lms';
import { SavedPromptPreview } from './_local/SavedPromptPreview';

export const metadata: Metadata = {
  title: 'Welcome to AiBI-Foundation | The AI Banking Institute',
  description:
    'Your AiBI-Foundation enrollment is confirmed. Sign in to begin Module 1.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

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

  const sp = (await searchParams) ?? {};

  // Validate the session against Stripe before rendering the success view.
  // Without this gate, /courses/foundation/program/purchased renders for
  // any visitor regardless of session_id — same leak documented for the
  // In-Depth surface in #321. Apply the same protection here per #326.
  //
  // Exception 1: signed-in user — legitimate return visit. Downstream
  // enrollment / onboarding checks will gate course access.
  // Exception 2: STRIPE_SECRET_KEY not configured — local / preview env;
  // page renders so QA can still walk the flow.
  const validSession = await getValidatedPaidSession(sp.session_id);
  if (process.env.STRIPE_SECRET_KEY && !validSession && !signedInEmail) {
    redirect('/courses/foundation/program/purchase');
  }

  // Recover the email from the Stripe Checkout Session so the auth links
  // pre-fill — buyer typed their email once at Stripe, never again.
  const stripeEmail = signedInEmail
    ? null
    : validSession?.customer_details?.email ??
      validSession?.customer_email ??
      null;
  const prefillEmail = signedInEmail ?? stripeEmail ?? null;
  const emailQs = prefillEmail
    ? `&email=${encodeURIComponent(prefillEmail)}`
    : '';

  const step1Done = Boolean(signedInEmail);

  return (
    <main
      style={{
        background: 'var(--cream)',
        minHeight: '70vh',
        padding: '56px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* Eyebrow strip */}
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
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
            }}
          >
            Enrollment confirmed
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--ink-a10)' }} />
        </div>

        {/* Hero — what happens in the first 30 minutes */}
        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          Welcome to AiBI-Foundation.
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            color: 'var(--slate-600)',
            margin: '0 0 40px',
            maxWidth: '60ch',
          }}
        >
          In your first thirty minutes you&rsquo;ll sign in, open Module 1, and
          save a banking prompt you can reuse the same day.
        </p>

        {/* Two-column: action ladder + saved-prompt preview */}
        <div
          style={{
            display: 'grid',
            gap: 32,
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            alignItems: 'start',
            marginBottom: 48,
          }}
          className="purchased-grid"
        >
          {/* Action ladder */}
          <section aria-label="Next steps">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                margin: '0 0 18px',
              }}
            >
              What happens now
            </p>

            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <ActionStep
                index={1}
                done={step1Done}
                title={
                  step1Done
                    ? `Signed in as ${signedInEmail}`
                    : 'Sign in to bind your enrollment'
                }
                body={
                  step1Done
                    ? 'Your purchase is bound to this account. You can begin Module 1 below.'
                    : prefillEmail
                      ? `We pre-filled ${prefillEmail} from your receipt. Takes about 30 seconds.`
                      : 'Create or sign into your account. Takes about 30 seconds.'
                }
                action={
                  step1Done ? null : (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginTop: 14,
                      }}
                    >
                      <PrimaryButton
                        as="a"
                        href={`/auth/signup?next=/courses/foundation/program${emailQs}`}
                      >
                        CREATE MY ACCOUNT
                      </PrimaryButton>
                      <GhostButton
                        as="a"
                        href={`/auth/login?next=/courses/foundation/program${emailQs}`}
                      >
                        I ALREADY HAVE ONE
                      </GhostButton>
                    </div>
                  )
                }
              />
              <ActionStep
                index={2}
                done={false}
                title="Open Module 1: Foundations"
                body="About 35 minutes. Read the takeaway, run one sandbox prompt, and submit your first work product."
                action={
                  step1Done ? (
                    <div style={{ marginTop: 14 }}>
                      <PrimaryButton
                        as="a"
                        href="/courses/foundation/program"
                      >
                        BEGIN MODULE 1 →
                      </PrimaryButton>
                    </div>
                  ) : null
                }
              />
              <ActionStep
                index={3}
                done={false}
                title="Save your first prompt"
                body="By the end of Module 3 you&rsquo;ll save your first reusable banker prompt to your Toolbox. The card on the right is the shape it takes."
                action={null}
              />
            </ol>
          </section>

          {/* Saved-prompt preview — the artifact */}
          <SavedPromptPreview />
        </div>

        {/* Quiet receipt + access strip */}
        <section
          aria-label="Receipt and access"
          style={{
            borderTop: '1px solid var(--ink-a10)',
            paddingTop: 22,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'baseline',
            justifyContent: 'space-between',
            fontSize: 13,
            color: 'var(--slate-500)',
            lineHeight: 1.6,
          }}
        >
          <span>
            A Stripe receipt and a welcome email are on their way
            {prefillEmail ? (
              <>
                {' '}to{' '}
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {prefillEmail}
                </span>
              </>
            ) : null}
            .
          </span>
          <span>Lifetime access · 12 modules · One credential</span>
          <span>
            Trouble?{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{
                color: 'var(--gold-deep)',
                textDecoration: 'underline',
              }}
            >
              hello@aibankinginstitute.com
            </a>
          </span>
        </section>
      </div>

      {/* dangerouslySetInnerHTML — see LMSTopBar pattern (#315). */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 760px) {
          .purchased-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `,
        }}
      />
    </main>
  );
}

// --- Local helpers ---------------------------------------------------------

interface ActionStepProps {
  readonly index: number;
  readonly done: boolean;
  readonly title: string;
  readonly body: string;
  readonly action: React.ReactNode | null;
}

function ActionStep({ index, done, title, body, action }: ActionStepProps) {
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 16,
        border: `1px solid ${done ? 'var(--emerald-700)' : 'var(--ink-a10)'}`,
        background: done ? 'var(--cream-2)' : '#FFFFFF',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: done ? 'var(--emerald-700)' : 'var(--ink)',
          color: 'var(--cream)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {done ? '✓' : index}
      </span>
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--slate-600)',
          }}
        >
          {body}
        </p>
        {action}
      </div>
    </li>
  );
}
