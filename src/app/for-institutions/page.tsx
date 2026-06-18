import type { Metadata } from 'next';
import ForInstitutionsPage from './_client';

const TITLE = 'For Institutions';
const DESCRIPTION =
  'A coached AI training engagement for community banks and credit unions with role-based staff artifacts, readiness scores, and leadership visibility.';

export const metadata: Metadata = {
  alternates: { canonical: '/for-institutions' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/for-institutions',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <ForInstitutionsPage />;
}
