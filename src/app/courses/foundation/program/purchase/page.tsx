// /courses/foundation/program/purchase — Enrollment landing page.
//
// Server Component. Wrapped in <CourseShell> so the page renders with
// the LMS chrome (wordmark sidebar + pillar-grouped module list, shown
// locked for non-enrolled visitors). Already-enrolled users see a
// centered "you're in" confirmation instead.
//
// 2026-05-27: Restructured per docs/lms-layout-audit-2026-05-27.md §1.
// Narrative arc: see the artifact → see the proof → see the price.

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EnrollButton } from './EnrollButton';
import { hasLockedInstitutionDiscount } from '@/lib/stripe/institution-discount';
import { foundationCourseConfig } from '@content/courses/foundation-program';
import { CourseShell, LMSTopBar, toLMSModules, type LMSModule } from '@/components/lms';
import { PurchaseFAQ } from './_components/PurchaseFAQ';
import { SampleWeek } from './_components/SampleWeek';
import { ArtifactThumbnails } from './_components/ArtifactThumbnails';
import { PricingProof } from './_components/PricingProof';
import { CurriculumByArtifact } from './_components/CurriculumByArtifact';
import { PurchaseHero } from './_components/PurchaseHero';
import { PurchaseFeatures } from './_components/PurchaseFeatures';
import { PurchaseFinalCTA } from './_components/PurchaseFinalCTA';
import { INTER_STACK_VAR as INTER_STACK } from '@/lib/ui/fonts';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation',
  description:
    'Enroll in the AiBI-Foundation course. Eighteen bite-sized modules, practical artifacts, and a credential mapped to public references; not regulator-endorsed.',
};


const SECONDARY_DECISIONS = [
  {
    href: '/courses/foundation',
    label: 'Course overview',
    detail: 'Compare modules, artifacts, and outcomes before enrolling.',
  },
  {
    href: '/assessment/take',
    label: 'Free assessment',
    detail: 'Start with the 12-question readiness snapshot.',
  },
  {
    href: '/support/purchase-help',
    label: 'Purchase help',
    detail: 'Ask about access, payments, refunds, or duplicate purchases.',
  },
  {
    href: '/for-institutions',
    label: 'Institution inquiry',
    detail: 'Route team seats, briefings, or assisted rollouts.',
  },
] as const;

async function getUserEmail(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
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
    return user?.email ?? null;
  } catch {
    return null;
  }
}

// Role-aware framing for visitors arriving from /playbooks/<role>. The
// ?role= query is set by the playbook hero CTA (#327D). When present, we
// surface a small banner naming the playbook so the funnel feels
// continuous rather than dumping the visitor on a generic page.
const ROLE_BANNER: Record<string, { label: string; lede: string }> = {
  'bsa-aml': {
    label: 'BSA / AML',
    lede: 'Modules 2, 4, and 6 carry the BSA / AML weight — narrative discipline, alert triage, and the FinCEN typology vocabulary.',
  },
  compliance: {
    label: 'Compliance',
    lede: 'Modules 2, 4, 7, and 11 are the compliance spine — use-case intake, the human-review step, audit trails, and the AIEOG / SR 11-7 lens.',
  },
  infosec: {
    label: 'IT / InfoSec',
    lede: 'Modules 3, 5, and 9 anchor the IT view — data classification, tool verdicts, and the identity model around AI access.',
  },
  lending: {
    label: 'Lending',
    lede: 'Modules 6, 8, and 10 are the lending spine — adverse-action specificity, fair-lending phrasing review, and decision-memo discipline.',
  },
  marketing: {
    label: 'Marketing',
    lede: 'Modules 5, 8, and 12 are the marketing arc — campaign briefs, disclosure review, and plain-language translation that preserves the claim.',
  },
  retail: {
    label: 'Branch / Retail',
    lede: 'Modules 1, 4, and 9 are the branch arc — coaching kits, service recovery, and one-page procedure cleanup that survives the window.',
  },
};

export default async function PurchasePage(
  props: {
    searchParams?: Promise<{ role?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const role = searchParams?.role;
  const roleBanner = role ? ROLE_BANNER[role] ?? null : null;
  const enrollment = await getEnrollment();
  const userEmail = await getUserEmail();
  const institutionRateApplies = userEmail
    ? await hasLockedInstitutionDiscount(userEmail)
    : false;
  const lmsModules: readonly LMSModule[] = toLMSModules(
    foundationCourseConfig.modules,
  );

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
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 36px 80px' }}>
          <PurchaseFeatures currentModule={currentModule} />
        </div>
      </CourseShell>
    );
  }

  return (
    <CourseShell modules={lmsModules} completed={[]} current={0}>
      <LMSTopBar
        crumbs={['Education', 'AiBI-Foundation', 'Enroll']}
        right={
          <span
            style={{
              fontFamily: INTER_STACK,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              color: 'var(--slate-500)',
              fontWeight: 500,
            }}
          >
            Not yet enrolled
          </span>
        }
      />

      <div
        className="foundation-purchase-content"
        style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 36px 80px' }}
      >
        {/* #327D — role-aware banner */}
        {roleBanner && (
          <aside
            aria-label={`Coming from the ${roleBanner.label} playbook`}
            style={{
              marginBottom: 24,
              background: 'var(--cream-2)',
              borderLeft: '3px solid var(--gold)',
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              From the {roleBanner.label} playbook
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--ink)', fontSize: '0.875rem', lineHeight: 1.55 }}>
              {roleBanner.lede}
            </p>
          </aside>
        )}

        {/* 1. HERO — dark navy. Real artifact on the right. The hero CTA now
            starts Stripe checkout directly (one click), instead of scrolling
            down to a second Enroll button. */}
        <PurchaseHero
          enrollButton={
            <EnrollButton userEmail={userEmail ?? undefined} showNote={false} />
          }
        />

        <PurchaseDecisionLinks />

        <PurchaseDataHandlingNote />

        {/* 2. SAMPLE WEEK — three columns, real Module 1 content */}
        <SampleWeek />

        {/* 3. WHAT YOU LEAVE WITH — representative packet previews */}
        <ArtifactThumbnails />

        {/* 4. PRICING + PROOF — quote + stat + EnrollButton */}
        <PricingProof
          enrollButton={<EnrollButton userEmail={userEmail ?? undefined} />}
          institutionRateApplies={institutionRateApplies}
        />

        {/* 5. CURRICULUM — flat ordered list keyed by artifact */}
        <CurriculumByArtifact />

        {/* 6. FAQ */}
        <PurchaseFAQ />

        {/* 7. FINAL CTA — dark navy. CTA starts checkout directly. */}
        <PurchaseFinalCTA
          enrollButton={
            <EnrollButton userEmail={userEmail ?? undefined} showNote={false} />
          }
        />

        <PurchaseDecisionLinks compact />
      </div>
      <div className="foundation-mobile-purchase-bar" aria-label="Enroll in AiBI-Foundation">
        <div>
          <p>AiBI-Foundation</p>
          <strong>$295 · 7-day refund if unused</strong>
        </div>
        <EnrollButton userEmail={userEmail ?? undefined} showNote={false} />
      </div>
      <style
        // dangerouslySetInnerHTML avoids the React #418 hydration mismatch that
        // a `<style>{template}</style>` expression child triggers in a Server
        // Component (same safe pattern as ModuleTabs / CourseShell / LMSTopBar).
        dangerouslySetInnerHTML={{
          __html: `
        .foundation-mobile-purchase-bar {
          display: none;
        }
        @media (max-width: 760px) {
          .foundation-purchase-content {
            padding-bottom: 168px !important;
          }
          .foundation-mobile-purchase-bar {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 50;
            display: grid;
            grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
            gap: 12px;
            align-items: center;
            padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
            background: rgba(255, 253, 246, 0.96);
            border-top: 1px solid rgba(7, 26, 47, 0.14);
            box-shadow: 0 -16px 40px rgba(7, 26, 47, 0.12);
            backdrop-filter: blur(14px);
          }
          .foundation-mobile-purchase-bar p,
          .foundation-mobile-purchase-bar strong {
            display: block;
            margin: 0;
            color: var(--ink);
            font-family: ${INTER_STACK};
            letter-spacing: 0;
          }
          .foundation-mobile-purchase-bar p {
            font-size: 12px;
            font-weight: 700;
          }
          .foundation-mobile-purchase-bar strong {
            margin-top: 2px;
            font-size: 13px;
            font-weight: 800;
          }
          .foundation-mobile-purchase-bar button {
            min-height: 48px;
            padding: 0 14px;
          }
          .foundation-mobile-purchase-bar button + p {
            display: none;
          }
        }
      `,
        }}
      />
    </CourseShell>
  );
}

function PurchaseDecisionLinks({ compact = false }: { compact?: boolean }) {
  return (
    <nav
      aria-label={compact ? 'Other Foundation purchase options' : 'Foundation purchase decision help'}
      style={{
        margin: compact ? '24px 0 0' : '-20px 0 48px',
        padding: compact ? '18px 0 0' : '22px 0',
        borderTop: '1px solid var(--ink-a10)',
        borderBottom: compact ? 0 : '1px solid var(--ink-a10)',
      }}
    >
      <p
        style={{
          margin: compact ? '0 0 12px' : '0 0 16px',
          fontFamily: INTER_STACK,
          color: 'var(--slate-600)',
          fontSize: compact ? 13 : 14,
          lineHeight: 1.5,
        }}
      >
        Not ready to enroll yet? Choose the next best step without starting checkout.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: compact ? 10 : 12,
        }}
      >
        {SECONDARY_DECISIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              minHeight: compact ? 86 : 104,
              padding: compact ? '14px 0' : '16px 0',
              color: 'var(--ink)',
              textDecoration: 'none',
              borderTop: compact ? '1px solid var(--ink-a10)' : 0,
            }}
          >
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.9375rem',
                fontWeight: 800,
                letterSpacing: 0,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: INTER_STACK,
                fontSize: '0.8125rem',
                lineHeight: 1.45,
                color: 'var(--slate-600)',
                letterSpacing: 0,
              }}
            >
              {item.detail}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function PurchaseDataHandlingNote() {
  return (
    <aside
      aria-label="Foundation data handling"
      style={{
        margin: '-24px 0 44px',
        padding: '18px 20px',
        background: 'var(--cream-2)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 14,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: INTER_STACK,
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
        }}
      >
        Data handling
      </p>
      <p
        style={{
          margin: '8px 0 0',
          fontFamily: INTER_STACK,
          color: 'var(--ink)',
          fontSize: '0.875rem',
          lineHeight: 1.55,
        }}
      >
        The course is built around synthetic or sanitized examples. Authenticated
        lab and Toolbox runs send prompts to selected AI providers only when a
        learner asks for an AI response, with PII and injection checks in front
        of the call.{' '}
        <Link
          href="/security/data-handling"
          style={{ color: 'var(--gold-deep)', fontWeight: 800 }}
        >
          Read the LLM data-handling summary.
        </Link>
      </p>
    </aside>
  );
}
