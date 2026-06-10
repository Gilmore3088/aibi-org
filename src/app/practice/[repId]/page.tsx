import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { FOUNDATION_PRACTICE_REPS, getPracticeRepById } from '@content/practice-reps/foundation-program';
import { PracticeRepClient } from './PracticeRepClient';
import { getEnrollment } from '@/app/courses/foundation/program/_lib/getEnrollment';

interface PracticeRepPageProps {
  readonly params: Promise<{ repId: string }>;
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return FOUNDATION_PRACTICE_REPS.map((rep) => ({ repId: rep.id }));
}

export async function generateMetadata(props: PracticeRepPageProps): Promise<Metadata> {
  const params = await props.params;
  const rep = getPracticeRepById(params.repId);
  return {
    title: rep ? `${rep.title} | Practice Rep` : 'Practice Rep',
  };
}

export default async function PracticeRepPage(props: PracticeRepPageProps) {
  const params = await props.params;
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
