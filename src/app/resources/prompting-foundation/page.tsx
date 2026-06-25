import type { Metadata } from 'next';
import { PromptingFoundationBuilder } from './PromptingFoundationBuilder';

export const metadata: Metadata = {
  title: 'Prompt Like a Banker | The AI Banking Institute',
  description:
    'Build one safe AI prompt by choosing the work, protecting the data, setting the format, and naming the reviewer before anything gets copied.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/prompting-foundation' },
  openGraph: {
    title: 'Prompt Like a Banker',
    description:
      'Write one safe, review-ready AI prompt without crossing the data line.',
    url: 'https://www.aibankinginstitute.com/resources/prompting-foundation',
    type: 'website',
  },
};

export default function Page() {
  return <PromptingFoundationBuilder />;
}
