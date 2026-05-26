import type { Metadata } from 'next';
import ToolboxPage from './_client';

export const metadata: Metadata = {
  alternates: { canonical: '/my-toolbox' },
  title: 'Toolbox preview',
  description:
    'Banker-vetted prompts, saved skills, and reusable workflows. A preview of what AiBI-Foundation graduates take with them.',
  openGraph: {
    title: 'Toolbox preview',
    description: 'Banker-vetted prompts, saved skills, and reusable workflows.',
    url: '/my-toolbox',
    type: 'website',
  },
};

export default function Page() {
  return <ToolboxPage />;
}
