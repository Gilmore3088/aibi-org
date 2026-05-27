import type { Metadata } from 'next';
import { BRAND } from '@content/copy';
import HomePage from './_client';

const TITLE = `${BRAND.name} — ${BRAND.tagline}`;
const DESCRIPTION =
  'Free AI readiness assessment for community banks and credit unions. Score, tier, and starter artifact in three minutes.';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <HomePage />;
}
