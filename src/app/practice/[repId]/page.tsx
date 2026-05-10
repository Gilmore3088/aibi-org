import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AIBI_P_PRACTICE_REPS, getPracticeRepById } from '@content/practice-reps/foundations';
import { PracticeRepClient } from './PracticeRepClient';

interface PracticeRepPageProps {
  readonly params: { repId: string };
}

export function generateStaticParams() {
  return AIBI_P_PRACTICE_REPS.map((rep) => ({ repId: rep.id }));
}

export function generateMetadata({ params }: PracticeRepPageProps): Metadata {
  const rep = getPracticeRepById(params.repId);
  return {
    title: rep ? `${rep.title} | Practice Rep` : 'Practice Rep',
  };
}

export default function PracticeRepPage({ params }: PracticeRepPageProps) {
  const rep = getPracticeRepById(params.repId);
  if (!rep) notFound();

  return <PracticeRepClient rep={rep} />;
}
