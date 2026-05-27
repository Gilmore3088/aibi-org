import type { Metadata } from 'next';
import AssessmentPage from './_client';

export const metadata: Metadata = {
  alternates: { canonical: '/assessment/take' },
  title: 'Take the AI Readiness Assessment',
  description:
    'Twelve questions, three minutes. Score, tier, top gap, and a starter artifact you can take to your team this week.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AssessmentPage />;
}
