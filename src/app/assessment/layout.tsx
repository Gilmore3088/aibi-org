import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Readiness Assessment',
  description:
    'Eight questions. Under three minutes. See where your community bank stands on AI readiness across eight dimensions, with a tier classification and next-step recommendations.',
};

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
