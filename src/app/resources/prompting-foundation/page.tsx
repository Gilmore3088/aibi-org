import type { Metadata } from 'next';
import { PromptingFoundationBuilder } from './PromptingFoundationBuilder';

export const metadata: Metadata = {
  title: 'AI Prompting Foundation Kit | The AI Banking Institute',
  description:
    'A banker-specific prompt builder for safe placeholders, prompt types, output formats, review rules, and escalation triggers.',
  alternates: { canonical: 'https://www.aibankinginstitute.com/resources/prompting-foundation' },
  openGraph: {
    title: 'AI Prompting Foundation Kit',
    description:
      'Turn vague AI requests into safe, structured, reviewable banker prompts without exposing sensitive data.',
    url: 'https://www.aibankinginstitute.com/resources/prompting-foundation',
    type: 'website',
  },
};

export default function Page() {
  return <PromptingFoundationBuilder />;
}
