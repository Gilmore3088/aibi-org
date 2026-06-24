import type { Metadata } from 'next';
import PracticeSandboxPage from './_client';

const TITLE = 'Practice Sandbox';
const DESCRIPTION =
  'Practice AI on realistic synthetic banking scenarios — choose a role, run a capped public demo, and review the output before signing in to save.';

export const metadata: Metadata = {
  alternates: { canonical: '/practice' },
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PracticeSandboxPage />;
}
