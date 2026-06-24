import type { Metadata } from 'next';
import PlaygroundPage from './_client';

const TITLE = 'Playground';
const DESCRIPTION =
  'Try real AI on banker-shaped scenarios with capped public runs, synthetic sample data, and a sign-in path for saving useful work.';

export const metadata: Metadata = {
  alternates: { canonical: '/playground' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/playground',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <PlaygroundPage />;
}
