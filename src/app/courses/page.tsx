import type { Metadata } from 'next';
import CoursesIndexPage from './_client';

const TITLE = 'Courses';
const DESCRIPTION =
  'AiBI-Foundation helps bankers build reusable prompt cards, workflow SOPs, and review checklists through banker-vetted scenarios.';

export const metadata: Metadata = {
  alternates: { canonical: '/courses' },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/courses',
    type: 'website',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function Page() {
  return <CoursesIndexPage />;
}
