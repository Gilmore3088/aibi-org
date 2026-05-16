// /courses/foundation/program/purchase — Enrollment landing page (LMS reskin)
//
// Server Component. Wrapped in <CourseShell> so the page renders with
// the new LMS chrome (wordmark sidebar + pillar-grouped module list,
// shown locked for non-enrolled visitors). Already-enrolled users see
// a centered "you're in" confirmation instead.
//
// Redirect target for non-enrolled users attempting to access module
// pages (SHELL-12).

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EnrollButton } from './EnrollButton';
import { foundationProgramCourseConfig } from '@content/courses/foundation-program';
import { CourseShell, LMSTopBar, PrimaryButton, toLMSModules, type LMSModule } from '@/components/lms';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation | The AI Banking Institute',
  description:
    'Enroll in the AiBI-Foundation course. Twelve modules, practical artifacts, and the AiBI-Foundation credential upon completion.',
};

const LEARNER_OUTCOMES = [
  'Choose the right prompt strategy for the job',
  'Write safer, clearer prompts for daily banking work',
  'Summarize banking documents responsibly',
  'Review AI outputs for errors and unsupported claims',
  'Avoid entering sensitive data into public tools',
  'Use AI for communication, meetings, policy review, and productivity',
] as const;

const REQUIRED_OUTPUTS = [
  {
    title: 'Acceptable Use card',
    description: 'A card you keep at your desk that draws your AI line.',
  },
  {
    title: 'Three saved prompts',
    description: 'Patterns you reuse weekly without re-typing context.',
  },
  {
    title: 'A reviewed work product',
    description: 'A real artifact — email, summary, script — reviewed by you.',
  },
  {
    title: 'Final practical assessment',
    description:
      'A reviewed work product package that demonstrates safe, practical AI use.',
  },
] as const;

async function getUserEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = cookies();
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
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function PurchasePage() {
  const enrollment = await getEnrollment();
  const userEmail = await getUserEmail();
  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationProgramCourseConfig.modules,
  );
  const totalModules = lmsModules.length;
  const totalMinutes = foundationProgramCourseConfig.estimatedMinutes;

  // Already-enrolled state — keep the dedicated "you're in" surface,
  // but render it inside the new LMS shell so the wordmark + sidebar
  // are present and clicking a module navigates correctly.
  if (enrollment) {
    const completedModules = enrollment.completed_modules ?? [];
    const currentModule = enrollment.current_module ?? 1;
    return (
      <CourseShell
        modules={lmsModules}
        completed={completedModules}
        current={currentModule}
      >
        <LMSTopBar
          crumbs={['Education', 'AiBI-Foundation', 'Enroll']}
        />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 36px' }}>
          <div
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ledger-accent)',
              marginBottom: 14,
            }}
          >
            Already enrolled
          </div>
          <h1
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 500,
              fontSize: 'clamp(36px, 4.5vw, 52px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
              color: 'var(--ledger-ink)',
            }}
          >
            You&rsquo;re in the{' '}
            <em style={{ color: 'var(--ledger-accent)', fontStyle: 'normal' }}>
              AiBI-Foundation
            </em>{' '}
            program.
          </h1>
          <p
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.5,
              color: 'var(--ledger-ink-2)',
              margin: '0 0 32px',
              maxWidth: '60ch',
            }}
          >
            Your enrollment is active and your access is permanent. Pick up
            where you left off, or jump back to the course overview.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <PrimaryButton
              as="a"
              href={`/courses/foundation/program/${currentModule}`}
            >
              Continue the course →
            </PrimaryButton>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                color: 'var(--ledger-ink)',
                border: '1px solid var(--ledger-rule-strong)',
                padding: '12px 18px',
                borderRadius: 2,
                cursor: 'pointer',
                fontFamily: 'var(--ledger-mono)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </CourseShell>
    );
  }

  // Non-enrolled — full marketing/enroll surface in the Ledger pattern.
  // Sidebar shows all 12 modules locked (current=0, completed=[]); the
  // visual effect is "here's what you get when you enroll".
  return (
    <CourseShell modules={lmsModules} completed={[]} current={0}>
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation', 'Enroll']}
        right={
          <span
            style={{
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--ledger-muted)',
            }}
          >
            Not yet enrolled
          </span>
        }
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 36px 80px' }}>
        {/* Hero */}
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
              }}
            >
              Enroll · AiBI-Foundation
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--ledger-rule)' }} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontWeight: 500,
              fontSize: 'clamp(46px, 6vw, 76px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '0 0 18px',
              color: 'var(--ledger-ink)',
            }}
          >
            Banking AI{' '}
            <em style={{ color: 'var(--ledger-accent)', fontStyle: 'normal', fontWeight: 500 }}>
              Foundation.
            </em>
          </h1>
          <p
            style={{
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.4,
              color: 'var(--ledger-ink-2)',
              margin: '0 0 12px',
              maxWidth: '60ch',
            }}
          >
            {foundationProgramCourseConfig.promise}
          </p>
          <p
            style={{
              color: 'var(--ledger-slate)',
              fontSize: 15,
              lineHeight: 1.6,
              maxWidth: '62ch',
              margin: 0,
            }}
          >
            In less than two weeks, write better, summarize faster, think
            clearer, and avoid risky AI mistakes — using the model your
            institution already trusts.
          </p>

          {/* Enroll strip — ink card with price + EnrollButton */}
          <div
            style={{
              marginTop: 32,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 24,
              alignItems: 'center',
              background: 'var(--ledger-ink)',
              color: 'var(--ledger-paper)',
              padding: '22px 26px',
              borderRadius: 2,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(244, 241, 231, 0.6)',
                }}
              >
                Per seat
              </span>
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  color: 'var(--ledger-accent)',
                }}
              >
                $199 at 10+ seats
              </span>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--ledger-serif)',
                  fontWeight: 500,
                  fontSize: 32,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                $295
              </h3>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 13,
                  color: 'rgba(244, 241, 231, 0.72)',
                  lineHeight: 1.5,
                  maxWidth: '52ch',
                }}
              >
                One-time payment. Lifetime access. Stripe checkout.
              </p>
            </div>
            <EnrollButton userEmail={userEmail ?? undefined} />
          </div>

          {/* Stats row */}
          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              borderTop: '1px solid var(--ledger-rule-strong)',
              borderBottom: '1px solid var(--ledger-rule)',
            }}
          >
            {[
              { k: 'Modules', v: String(totalModules), sub: 'foundation curriculum' },
              { k: 'Time committed', v: `${totalMinutes}m`, sub: 'across all modules' },
              {
                k: 'Format',
                v: 'Self-paced',
                sub: 'on your schedule',
              },
              {
                k: 'Credential',
                v: 'Certificate',
                sub: 'on completion',
              },
            ].map((r, i) => (
              <div
                key={r.k}
                style={{
                  padding: '18px 22px',
                  borderRight: i < 3 ? '1px solid var(--ledger-rule)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--ledger-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--ledger-muted)',
                  }}
                >
                  {r.k}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--ledger-serif)',
                    fontWeight: 500,
                    fontSize: 28,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    marginTop: 6,
                    color: 'var(--ledger-ink)',
                  }}
                >
                  {r.v}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ledger-slate)', marginTop: 4 }}>
                  {r.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What you'll do + Required outputs — same pattern as overview */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.85fr',
            gap: 28,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              border: '1px solid var(--ledger-rule)',
              padding: 26,
              background: 'var(--ledger-paper)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                marginBottom: 14,
              }}
            >
              What you will be able to do
            </div>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gap: 10,
              }}
            >
              {LEARNER_OUTCOMES.map((outcome) => (
                <li
                  key={outcome}
                  style={{
                    display: 'flex',
                    gap: 10,
                    fontSize: 14,
                    color: 'var(--ledger-ink-2)',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      marginTop: 7,
                      width: 6,
                      height: 6,
                      background: 'var(--ledger-accent)',
                      flex: 'none',
                    }}
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              border: '1px solid var(--ledger-rule)',
              padding: 26,
              background: 'var(--ledger-parch)',
              borderRadius: 3,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                marginBottom: 14,
              }}
            >
              Required outputs
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              {REQUIRED_OUTPUTS.map((r) => (
                <div key={r.title}>
                  <div
                    style={{
                      fontFamily: 'var(--ledger-serif)',
                      fontSize: 16,
                      fontWeight: 500,
                      color: 'var(--ledger-ink)',
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ledger-slate)',
                      lineHeight: 1.5,
                    }}
                  >
                    {r.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lifetime access — what is included */}
        <section
          style={{
            background: 'var(--ledger-parch)',
            padding: '28px 32px',
            border: '1px solid var(--ledger-rule)',
            borderRadius: 3,
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--ledger-mono)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--ledger-accent)',
                marginBottom: 10,
              }}
            >
              Lifetime access
            </div>
            <h2
              style={{
                fontFamily: 'var(--ledger-serif)',
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: '-0.02em',
                margin: 0,
                color: 'var(--ledger-ink)',
                lineHeight: 1.15,
              }}
            >
              Pay once. Keep everything.
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--ledger-slate)',
                lineHeight: 1.6,
                margin: '10px 0 0',
              }}
            >
              Future updates to modules, artifacts, and the prompt library are
              included for the life of the program at no additional cost.
            </p>
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              'All twelve course modules — Learn, Practice, Apply',
              'Hands-on practice reps and reviewed-work submissions',
              'Artifact templates you keep and reuse at your desk',
              'Searchable prompt library and saved-prompts toolbox',
              'Learner dashboard, progress, and resume-anywhere',
              'AiBI-Foundation certificate on completion',
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr',
                  gap: 10,
                  fontSize: 13.5,
                  color: 'var(--ledger-ink-2)',
                  lineHeight: 1.5,
                  alignItems: 'start',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    marginTop: 7,
                    width: 6,
                    height: 6,
                    background: 'var(--ledger-accent)',
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Enrollment notes — institution / advanced tracks */}
        <section
          style={{
            background: 'var(--ledger-paper)',
            padding: '20px 24px',
            border: '1px solid var(--ledger-rule)',
            borderRadius: 3,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: 'var(--ledger-slate)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Team purchases use a single checkout with manual onboarding
            follow-up. Advanced <strong style={{ color: 'var(--ledger-ink)' }}>AiBI-S</strong> and{' '}
            <strong style={{ color: 'var(--ledger-ink)' }}>AiBI-L</strong> tracks are coming later;
            this checkout only enrolls learners in AiBI-Foundation.
          </p>
        </section>
      </div>
    </CourseShell>
  );
}
