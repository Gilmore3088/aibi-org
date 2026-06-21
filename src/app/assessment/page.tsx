import type { Metadata } from 'next';
import AssessmentLandingPage from './_client';

const TITLE = 'AI Readiness Assessment';
const DESCRIPTION =
  'Get your AI readiness score in three minutes, including your maturity tier, top gap, starter artifact, and 30-day action path.';

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
