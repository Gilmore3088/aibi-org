import type { Metadata } from 'next';
import CoursesIndexPage from './_client';

const TITLE = 'Courses';
const DESCRIPTION =
  "AiBI-Foundation — the Institute's AI proficiency credential for community bankers. Twelve modules, banker-vetted scenarios, certificate on completion.";

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
