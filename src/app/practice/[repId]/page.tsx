import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AIBI_P_PRACTICE_REPS, getPracticeRepById } from '@content/practice-reps/foundation-program';
import { PracticeRepClient } from './PracticeRepClient';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';

interface PracticeRepPageProps {
  readonly params: { repId: string };
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return AIBI_P_PRACTICE_REPS.map((rep) => ({ repId: rep.id }));
}

export function generateMetadata({ params }: PracticeRepPageProps): Metadata {
  const rep = getPracticeRepById(params.repId);
  return {
    title: rep ? `${rep.title} | Practice Rep` : 'Practice Rep',
  };
}

export default async function PracticeRepPage({ params }: PracticeRepPageProps) {
  const rep = getPracticeRepById(params.repId);
  if (!rep) notFound();

  // Practice reps are part of the AiBI-Foundation lifetime-access bundle.
  // Non-enrolled visitors must hit the purchase page.
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return <PracticeRepClient rep={rep} />;
}
