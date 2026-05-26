import type { Metadata } from 'next';
import PlaygroundPage from './_client';

const TITLE = 'Playground';
const DESCRIPTION =
  'Try AI on banker-shaped scenarios — no signup. Compare model outputs, save prompts, and see what banker-vetted AI looks like before you enroll.';

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
