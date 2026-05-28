import type { Metadata } from 'next';
import { ResourcesExperience } from './ResourcesExperience';

export const metadata: Metadata = {
  title: 'AI Resources for Community Banks & Credit Unions | The AI Banking Institute',
  description:
    'Playbooks, checklists, templates, and prompt cards for community banks and credit unions moving from AI curiosity to governed practice.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources' },
  openGraph: {
    title: 'AI Resources for Community Banks & Credit Unions',
    description:
      'Six role playbooks, four starter kits, board briefings, AI policy starters, and sample assessment outputs.',
    url: 'https://www.aibankinginstitute.com/resources',
    siteName: 'The AI Banking Institute',
    type: 'website',
  },
};

export default function ResourcesPage() {
  return <ResourcesExperience />;
}
