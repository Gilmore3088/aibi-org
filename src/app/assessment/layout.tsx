import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Readiness Assessment',
  description:
    'Twelve questions. Under three minutes. Get your AI readiness score, maturity tier, top gap, starter artifact, and 30-day action path.',
  alternates: { canonical: '/assessment' },
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
