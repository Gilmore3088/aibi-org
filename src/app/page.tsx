import type { Metadata } from 'next';
import HomePage from './_client';

// Keyword-led title (60 chars). The tagline stays in on-page copy and the brand
// is carried by og:site_name and the logo.
const TITLE = 'AI Banking Institute: AI Readiness for Banks & Credit Unions';
const DESCRIPTION =
  'Free individual AI readiness assessment for people working in community banks and credit unions. Score, tier, and starter artifact in three minutes.';

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
