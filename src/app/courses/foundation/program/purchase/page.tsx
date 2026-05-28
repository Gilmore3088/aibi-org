// /courses/foundation/program/purchase — Enrollment landing page.
//
// Server Component. Wrapped in <CourseShell> so the page renders with
// the LMS chrome. Already-enrolled users see a centered "you're in"
// confirmation; non-enrolled visitors see the audit-§1 marketing arc:
// see the artifact → see the proof → see the price.
//
// Narrative arc sections (in order): HERO (with real saved-prompt card),
// SAMPLE WEEK, ARTIFACT THUMBNAILS, PRICING + PROOF, CURRICULUM, FAQ,
// FINAL CTA. CurriculumByPillar.tsx and the legacy FinalCTA.tsx are
// retained on disk but no longer wired.

import type { Metadata } from 'next';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';
import { EnrollButton } from './EnrollButton';
import { foundationCourseConfig } from '@content/courses/foundation-program';
import { CourseShell, LMSTopBar, toLMSModules, type LMSModule } from '@/components/lms';
import { PurchaseFAQ } from './_components/PurchaseFAQ';
import { SampleWeek } from './_components/SampleWeek';
import { ArtifactThumbnails } from './_components/ArtifactThumbnails';
import { PricingProof } from './_components/PricingProof';
import { CurriculumByArtifact } from './_components/CurriculumByArtifact';
import { EnrolledHero } from './_components/EnrolledHero';
import { RoleBanner } from './_components/RoleBanner';
import { PurchaseHero } from './_components/PurchaseHero';
import { PurchaseFinalCTA } from './_components/PurchaseFinalCTA';
import { getUserEmail } from './_components/getUserEmail';
import { INTER_STACK, ROLE_BANNER } from './_components/purchaseConstants';

export const metadata: Metadata = {
  title: 'Enroll in AiBI-Foundation | The AI Banking Institute',
  description:
    'Enroll in the AiBI-Foundation course. Twelve modules, practical artifacts, and a credential aligned with SR 11-7, Interagency TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.',
};

export default async function PurchasePage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const role = searchParams?.role;
  const roleBanner = role ? ROLE_BANNER[role] ?? null : null;
  const enrollment = await getEnrollment();
  const userEmail = await getUserEmail();
  const lmsModules: readonly LMSModule[] = toLMSModules(foundationCourseConfig.modules);

  if (enrollment) {
    const completedModules = enrollment.completed_modules ?? [];
    const currentModule = enrollment.current_module ?? 1;
    return (
      <CourseShell modules={lmsModules} completed={completedModules} current={currentModule}>
        <LMSTopBar crumbs={['Education', 'AiBI-Foundation', 'Enroll']} />
        <EnrolledHero currentModule={currentModule} />
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
        {roleBanner && <RoleBanner banner={roleBanner} />}
        <PurchaseHero />
        <SampleWeek />
        <ArtifactThumbnails />
        <PricingProof enrollButton={<EnrollButton userEmail={userEmail ?? undefined} />} />
        <CurriculumByArtifact />
        <PurchaseFAQ />
        <PurchaseFinalCTA />
      </div>
    </CourseShell>
  );
}
