import type { Metadata } from 'next';
import { PromptLikeBankerToolboxEntry } from '@/app/resources/prompting-foundation/PromptingFoundationBuilder';

export const metadata: Metadata = {
  title: 'Prompt Like a Banker Builder | My Toolbox',
  description:
    'A Toolbox prompt builder for writing one safe, review-ready banker prompt with placeholders, data-line checks, review checks, and copy/download exports.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/my-toolbox/prompt-like-a-banker' },
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PromptLikeBankerToolboxEntry />;
}
