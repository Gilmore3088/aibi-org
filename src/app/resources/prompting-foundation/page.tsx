import type { Metadata } from 'next';
import { PromptingFoundationBuilder } from './PromptingFoundationBuilder';

export const metadata: Metadata = {
  title: 'Prompt Like a Banker | The AI Banking Institute',
  description:
    'Preview the 5-line banker prompt method, safe data-line examples, and the email-gated Toolbox builder for review-ready AI prompts.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/prompting-foundation' },
  openGraph: {
    title: 'Prompt Like a Banker',
    description:
      'Preview the method, then open the Toolbox builder to write one safe, review-ready AI prompt.',
    url: 'https://www.aibankinginstitute.com/resources/prompting-foundation',
    type: 'website',
  },
};

export default function Page() {
  return <PromptingFoundationBuilder />;
}
