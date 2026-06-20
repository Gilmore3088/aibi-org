import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Readiness Assessment',
  description:
    'Twelve questions. Under three minutes. Get your AI readiness score, maturity tier, top gap, and a starter artifact you can use immediately.',
  alternates: { canonical: '/assessment' },
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
