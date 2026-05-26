import type { Metadata } from 'next';

// /results/sample is an illustrative demo of the readiness report.
// Mark it noindex so it doesn't compete with /assessment in search,
// and so a banker landing on it from a sitemap doesn't mistake the
// demo numbers for real institutional data.

export const metadata: Metadata = {
  title: 'Sample AI Readiness Report — The AI Banking Institute',
  description:
    'A sample of the AI Readiness Report. Take the free 12-question assessment to receive your own report inline.',
  alternates: { canonical: '/results/sample' },
  robots: { index: false, follow: true },
};

export default function SampleResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
