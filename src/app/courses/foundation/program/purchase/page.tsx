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

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation | The AI Banking Institute',
  description:
    'Enroll in the AiBI-Foundation course. Twelve modules, practical artifacts, and a credential aligned with SR 11-7, Interagency TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.',
};

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

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
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gold-deep)',
              }}
            >
              From the {roleBanner.label} playbook
            </p>
            <p style={{ margin: '4px 0 0', color: 'var(--ink)', fontSize: 14, lineHeight: 1.55 }}>
              {roleBanner.lede}
            </p>
          </aside>
        )}

        {/* 1. HERO — dark navy. Real artifact on the right. */}
        <PurchaseHero />

        {/* 2. SAMPLE WEEK — three columns, real Module 1 content */}
        <SampleWeek />

        {/* 3. WHAT YOU LEAVE WITH — four artifact thumbnails */}
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

        {/* 7. FINAL CTA — dark navy, one paragraph + anchor back to #enroll */}
        <PurchaseFinalCTA />
      </div>
    </CourseShell>
  );
}
