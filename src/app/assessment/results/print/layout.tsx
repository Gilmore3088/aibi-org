import type { Metadata } from 'next';

// Print-PDF view of a personal assessment result.
// Per-user content — never index in search engines.
export const metadata: Metadata = {
  title: 'AI Readiness Briefing — Print',
  robots: { index: false, follow: false },
};

export default function AssessmentPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
