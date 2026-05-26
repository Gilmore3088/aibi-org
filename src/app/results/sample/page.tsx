import type { Metadata } from 'next';
import ResultsPage from './_client';

export const metadata: Metadata = {
  alternates: { canonical: '/results/sample' },
  title: 'Sample AI Readiness Report',
  description:
    'See what a completed AI Readiness Assessment looks like — score, tier, top gap, and dimension breakdown — before you take it.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ResultsPage />;
}
