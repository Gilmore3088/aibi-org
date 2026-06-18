import type { Metadata } from 'next';
import { ResourcesExperience } from './ResourcesExperience';

export const metadata: Metadata = {
  title: 'AI Resources for Community Banks & Credit Unions | The AI Banking Institute',
  description:
    'Policy starters, workflow SOPs, review checklists, prompt cards, and role playbooks built for banking teams.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources' },
  openGraph: {
    title: 'AI Resources for Community Banks & Credit Unions',
    description:
      'Nine role playbooks, four starter kits, board briefings, AI policy starters, and sample assessment outputs.',
    url: 'https://www.aibankinginstitute.com/resources',
    siteName: 'The AI Banking Institute',
    type: 'website',
  },
};

export default function ResourcesPage() {
  return <ResourcesExperience />;
}
