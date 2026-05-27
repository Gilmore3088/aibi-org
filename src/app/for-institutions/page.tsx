import type { Metadata } from 'next';
import ForInstitutionsPage from './_client';

const TITLE = 'For Institutions';
const DESCRIPTION =
  'Bring AI proficiency to your community bank or credit union — cohort enrollment, leader dashboard, and aggregate readiness across the eight dimensions.';

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
