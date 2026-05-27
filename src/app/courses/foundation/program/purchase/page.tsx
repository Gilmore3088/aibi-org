// /courses/foundation/program/purchase — Enrollment landing page.
//
// Server Component. Wrapped in <CourseShell> so the page renders with
// the LMS chrome (wordmark sidebar + pillar-grouped module list,
// shown locked for non-enrolled visitors). Already-enrolled users see
// a centered "you're in" confirmation instead.
//
// Redirect target for non-enrolled users attempting to access module
// pages (SHELL-12).
//
// 2026-05-27: Ported to the mockup design system. Hero H1 set to the
// canonical "AiBI-Foundation." credential token; the "credential your
// examiner respects" line is restored as the primary lede. Italics are
// removed (global `*{font-style:normal!important}` was masking them
// anyway); emphasis is carried by weight + color. Card surfaces use
// mockup radii (16/24/28) and the three approved shadow levels.

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EnrollButton } from './EnrollButton';
import { foundationCourseConfig, FOUNDATION_TOTAL_MINUTES } from '@content/courses/foundation-program';
import { CourseShell, LMSTopBar, PrimaryButton, toLMSModules, type LMSModule } from '@/components/lms';
import { CurriculumByPillar } from './_components/CurriculumByPillar';
import { PurchaseFAQ } from './_components/PurchaseFAQ';
import { FinalCTA } from './_components/FinalCTA';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation | The AI Banking Institute',
  description:
    'Enroll in the AiBI-Foundation course. Twelve modules, practical artifacts, and the AiBI-Foundation credential your examiner respects.',
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

const LIFETIME_INCLUDES = [
  'All twelve course modules — Learn, Practice, Apply',
  'Hands-on practice reps and reviewed-work submissions',
  'Artifact templates you keep and reuse at your desk',
  'Searchable prompt library and saved-prompts toolbox',
  'Learner dashboard, progress, and resume-anywhere',
  'AiBI-Foundation certificate on completion',
] as const;

// Shared mockup-token style tokens used throughout this page.
const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

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
    foundationCourseConfig.modules,
  );
  const totalModules = lmsModules.length;
  const totalMinutes = FOUNDATION_TOTAL_MINUTES;

  // Already-enrolled — keep the dedicated "you're in" surface,
  // rendered inside the LMS shell so the wordmark + sidebar are
  // present and clicking a module navigates correctly.
  if (enrollment) {
    const completedModules = enrollment.completed_modules ?? [];
    const currentModule = enrollment.current_module ?? 1;
    return (
      <CourseShell
        modules={lmsModules}
        completed={completedModules}
        current={currentModule}
      >
        <LMSTopBar crumbs={['Education', 'AiBI-Foundation', 'Enroll']} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 36px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid var(--gold-a40)',
              background: 'var(--gold-a10)',
              color: 'var(--gold-deep)',
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 20,
            }}
          >
            Already enrolled
          </span>
          <h1
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: 'clamp(36px, 4.5vw, 52px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: '0 0 16px',
              color: 'var(--ink)',
            }}
          >
            You&rsquo;re in the{' '}
            <span style={{ color: 'var(--gold-deep)', fontWeight: 700 }}>
              AiBI-Foundation
            </span>{' '}
            program.
          </h1>
          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--slate-600)',
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
                color: 'var(--ink)',
                border: '1px solid var(--ink-a10)',
                padding: '12px 22px',
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: INTER_STACK,
                fontSize: 13,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
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

  // Non-enrolled — full marketing/enroll surface in the mockup pattern.
  // Sidebar shows all 12 modules locked (current=0, completed=[]); the
  // visual effect is "here's what you get when you enroll".
  return (
    <CourseShell modules={lmsModules} completed={[]} current={0}>
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation', 'Enroll']}
        right={
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: 'var(--slate-500)',
              fontWeight: 500,
            }}
          >
            Not yet enrolled
          </span>
        }
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 36px 80px' }}>
        {/* Hero — dark navy card with pill eyebrow, large headline, and
            the restored "credential your examiner respects" lede. */}
        <section
          style={{
            marginBottom: 40,
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            padding: '56px 48px',
            borderRadius: 32,
            boxShadow: 'var(--shadow-hero)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid var(--gold-a40)',
              background: 'var(--gold-a10)',
              color: 'var(--gold-soft)',
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginBottom: 24,
            }}
          >
            Enroll · AiBI-Foundation
          </span>

          <h1
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: 'clamp(48px, 6.2vw, 80px)',
              lineHeight: 0.98,
              letterSpacing: '-0.035em',
              margin: '0 0 20px',
              color: '#fff',
            }}
          >
            AiBI-
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
              Foundation.
            </span>
          </h1>

          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 22,
              lineHeight: 1.35,
              color: 'var(--gold-soft)',
              margin: '0 0 16px',
              maxWidth: '38ch',
              fontWeight: 600,
            }}
          >
            Earn the credential your examiner respects.
          </p>

          <p
            style={{
              fontFamily: INTER_STACK,
              fontSize: 19,
              lineHeight: 1.55,
              color: 'rgba(247, 243, 234, 0.82)',
              margin: 0,
              maxWidth: '60ch',
            }}
          >
            {foundationCourseConfig.promise}
          </p>
        </section>

        {/* Enroll strip — separate cream card. Price + EnrollButton.
            Anchored for the FinalCTA link. */}
        <section
          id="enroll"
          style={{
            marginBottom: 40,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 32,
            alignItems: 'center',
            background: '#fff',
            color: 'var(--ink)',
            padding: '28px 32px',
            borderRadius: 24,
            border: '1px solid var(--ink-a10)',
            boxShadow: 'var(--shadow-feature)',
            scrollMarginTop: 80,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: INTER_STACK,
                  fontWeight: 700,
                  fontSize: 40,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: 'var(--ink)',
                }}
              >
                $295
              </span>
              <span
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--gold-deep)',
                  letterSpacing: '0.04em',
                }}
              >
                $199 per seat at 10+
              </span>
            </div>
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: 'var(--slate-600)',
                lineHeight: 1.5,
                maxWidth: '52ch',
              }}
            >
              One-time payment. Lifetime access. Stripe checkout — no account
              required to enroll.
            </p>
          </div>
          <EnrollButton userEmail={userEmail ?? undefined} />
        </section>

        {/* Stats row — four KPI cells on a cream surface. */}
        <section
          style={{
            marginBottom: 56,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            background: 'var(--cream-2)',
            border: '1px solid var(--ink-a10)',
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          {[
            { k: 'Modules', v: String(totalModules), sub: 'foundation curriculum' },
            { k: 'Time committed', v: `${totalMinutes}m`, sub: 'across all modules' },
            { k: 'Format', v: 'Self-paced', sub: 'on your schedule' },
            { k: 'Credential', v: 'Certificate', sub: 'on completion' },
          ].map((r, i) => (
            <div
              key={r.k}
              style={{
                padding: '22px 24px',
                borderRight: i < 3 ? '1px solid var(--ink-a10)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
                  fontWeight: 600,
                }}
              >
                {r.k}
              </div>
              <div
                style={{
                  fontFamily: INTER_STACK,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  marginTop: 8,
                  color: 'var(--ink)',
                }}
              >
                {r.v}
              </div>
              <div
                style={{
                  fontFamily: INTER_STACK,
                  fontSize: 13,
                  color: 'var(--slate-600)',
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                {r.sub}
              </div>
            </div>
          ))}
        </section>

        {/* What you'll be able to do + Required outputs */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.85fr',
            gap: 24,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              border: '1px solid var(--ink-a10)',
              padding: '28px 30px',
              background: '#fff',
              borderRadius: 24,
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontFamily: INTER_STACK,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              What you will be able to do
            </span>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'grid',
                gap: 12,
              }}
            >
              {LEARNER_OUTCOMES.map((outcome) => (
                <li
                  key={outcome}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '10px 1fr',
                    gap: 12,
                    fontFamily: INTER_STACK,
                    fontSize: 15,
                    color: 'var(--ink)',
                    lineHeight: 1.5,
                    alignItems: 'start',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      marginTop: 8,
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--gold)',
                    }}
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              border: '1px solid var(--ink-a10)',
              padding: '28px 30px',
              background: 'var(--cream-2)',
              borderRadius: 24,
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontFamily: INTER_STACK,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              Required outputs
            </span>
            <div style={{ display: 'grid', gap: 16 }}>
              {REQUIRED_OUTPUTS.map((r) => (
                <div key={r.title}>
                  <div
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontFamily: INTER_STACK,
                      fontSize: 13.5,
                      color: 'var(--slate-600)',
                      lineHeight: 1.5,
                      marginTop: 4,
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
            background: '#fff',
            padding: '32px 36px',
            border: '1px solid var(--ink-a10)',
            borderRadius: 24,
            boxShadow: 'var(--shadow-soft)',
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            gap: 32,
            marginBottom: 24,
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontFamily: INTER_STACK,
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Lifetime access
            </span>
            <h2
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: '-0.02em',
                margin: 0,
                color: 'var(--ink)',
                lineHeight: 1.15,
              }}
            >
              Pay once. Keep everything.
            </h2>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 14,
                color: 'var(--slate-600)',
                lineHeight: 1.6,
                margin: '12px 0 0',
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
              gap: 14,
            }}
          >
            {LIFETIME_INCLUDES.map((item) => (
              <li
                key={item}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr',
                  gap: 12,
                  fontFamily: INTER_STACK,
                  fontSize: 14,
                  color: 'var(--ink)',
                  lineHeight: 1.5,
                  alignItems: 'start',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    marginTop: 8,
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--gold)',
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Curriculum — pillar-grouped module list */}
        <CurriculumByPillar />

        {/* FAQ accordion */}
        <PurchaseFAQ />

        {/* Final CTA — closes with one anchor back to the enroll strip */}
        <FinalCTA />
      </div>
    </CourseShell>
  );
}
