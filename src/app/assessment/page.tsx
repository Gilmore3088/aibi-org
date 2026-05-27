import type { Metadata } from 'next';
import AssessmentLandingPage from './_client';

const TITLE = 'AI Readiness Assessment';
const DESCRIPTION =
  'Get your AI readiness score in three minutes. Score, maturity tier, top gap, and recommended next step — no sales call required.';

export const metadata: Metadata = {
  alternates: { canonical: '/assessment' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/assessment',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <AssessmentLandingPage />;
}
