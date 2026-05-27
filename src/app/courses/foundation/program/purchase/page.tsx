// /courses/foundation/program/purchase — Enrollment landing page.
//
// Server Component. Wrapped in <CourseShell> so the page renders with
// the LMS chrome (wordmark sidebar + pillar-grouped module list, shown
// locked for non-enrolled visitors). Already-enrolled users see a
// centered "you're in" confirmation instead.
//
// 2026-05-27: Restructured per docs/lms-layout-audit-2026-05-27.md §1.
// Narrative arc: see the artifact → see the proof → see the price.
// Sections in order: HERO (with real saved-prompt card), SAMPLE WEEK
// (three columns from Module 1), ARTIFACT THUMBNAILS (four required
// outputs as visible cards), PRICING + PROOF (one quote + one stat +
// EnrollButton), CURRICULUM (flat ordered list keyed by artifact), FAQ,
// FINAL CTA. Dropped: CurriculumByPillar, the 4-cell stats row, the
// "Lifetime access" full-width section, and the side-by-side outcomes
// /required-outputs block — their information now lives in the new
// sections in a denser, artifact-led form. CurriculumByPillar.tsx and
// FinalCTA.tsx source files are retained on disk (not deleted) per the
// commit body. PurchaseFAQ.tsx is still used as-is.

import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EnrollButton } from './EnrollButton';
import { foundationCourseConfig } from '@content/courses/foundation-program';
import { CourseShell, LMSTopBar, PrimaryButton, toLMSModules, type LMSModule } from '@/components/lms';
import { PurchaseFAQ } from './_components/PurchaseFAQ';
import { SavedPromptCard } from './_components/SavedPromptCard';
import { SampleWeek } from './_components/SampleWeek';
import { ArtifactThumbnails } from './_components/ArtifactThumbnails';
import { PricingProof } from './_components/PricingProof';
import { CurriculumByArtifact } from './_components/CurriculumByArtifact';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation | The AI Banking Institute',
  description:
    'Enroll in the AiBI-Foundation course. Twelve modules, practical artifacts, and the AiBI-Foundation credential your examiner respects.',
};

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

  // Already-enrolled — keep the dedicated "you're in" surface, rendered
  // inside the LMS shell so the wordmark + sidebar are present and
  // clicking a module navigates correctly.
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

  // Non-enrolled — full marketing/enroll surface, audit-§1 structure.
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
        {/* 1. HERO — dark navy. Real artifact on the right. */}
        <section
          style={{
            marginBottom: 48,
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            padding: '48px 44px',
            borderRadius: 32,
            boxShadow: 'var(--shadow-hero)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 36,
            alignItems: 'center',
          }}
        >
          <div>
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
                marginBottom: 22,
              }}
            >
              AiBI-Foundation · 12 modules · $295 · Lifetime
            </span>

            <h1
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 700,
                fontSize: 'clamp(36px, 4.2vw, 56px)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                margin: '0 0 20px',
                color: '#fff',
              }}
            >
              Walk away with a saved-prompt library and a credential your{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
                examiner respects
              </span>
              .
            </h1>

            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 17,
                lineHeight: 1.55,
                color: 'rgba(247, 243, 234, 0.84)',
                margin: '0 0 24px',
                maxWidth: '46ch',
              }}
            >
              Twelve self-paced modules turn the AI conversation into a set
              of reviewed work products you actually use. By the time you
              finish, your prompt library, your Acceptable Use card, and
              your reviewed work product are on your desk.
            </p>

            <Link
              href="#enroll"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--gold)',
                color: 'var(--ink)',
                padding: '14px 26px',
                borderRadius: 12,
                fontFamily: INTER_STACK,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Enroll for $295 →
            </Link>
          </div>

          <div>
            <SavedPromptCard />
          </div>
        </section>

        {/* 2. SAMPLE WEEK — three columns, real Module 1 content */}
        <SampleWeek />

        {/* 3. WHAT YOU LEAVE WITH — four artifact thumbnails */}
        <ArtifactThumbnails />

        {/* 4. PRICING + PROOF — quote + stat + EnrollButton */}
        <PricingProof
          enrollButton={<EnrollButton userEmail={userEmail ?? undefined} />}
        />

        {/* 5. CURRICULUM — flat ordered list keyed by artifact */}
        <CurriculumByArtifact />

        {/* 6. FAQ */}
        <PurchaseFAQ />

        {/* 7. FINAL CTA — dark navy, one paragraph + anchor back to #enroll */}
        <section
          style={{
            marginTop: 56,
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            padding: '40px 44px',
            borderRadius: 28,
            boxShadow: 'var(--shadow-hero)',
            display: 'grid',
            gridTemplateColumns: '1.4fr auto',
            gap: 28,
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 700,
                fontSize: 'clamp(24px, 2.6vw, 32px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: '0 0 10px',
                color: '#fff',
              }}
            >
              Earn the credential your examiner respects.
            </h2>
            <p
              style={{
                fontFamily: INTER_STACK,
                fontSize: 15,
                color: 'rgba(247, 243, 234, 0.82)',
                lineHeight: 1.55,
                margin: 0,
                maxWidth: '52ch',
              }}
            >
              $295 one-time. Lifetime access. Twelve modules, four required
              artifacts, one reviewed final assessment.
            </p>
          </div>
          <Link
            href="#enroll"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--gold)',
              color: 'var(--ink)',
              padding: '14px 26px',
              borderRadius: 12,
              fontFamily: INTER_STACK,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Enroll now →
          </Link>
        </section>
      </div>
    </CourseShell>
  );
}
