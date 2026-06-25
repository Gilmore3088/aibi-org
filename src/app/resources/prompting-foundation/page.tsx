import type { Metadata } from 'next';
import { PromptingFoundationBuilder } from './PromptingFoundationBuilder';

export const metadata: Metadata = {
  title: 'Prompt Like a Banker | The AI Banking Institute',
  description:
    'A banker-specific prompt builder and foundation kit for safe placeholders, output formats, review rules, and escalation triggers.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/prompting-foundation' },
  openGraph: {
    title: 'Prompt Like a Banker',
    description:
      'Build safe, structured, review-ready banker prompts without exposing sensitive data.',
    url: 'https://www.aibankinginstitute.com/resources/prompting-foundation',
    type: 'website',
  },
};

export default function Page() {
  return <PromptingFoundationBuilder />;
}
