import type { Metadata } from 'next';
import { PromptCardsExperience } from './PromptCardsExperience';

export const metadata: Metadata = {
  alternates: { canonical: '/prompt-cards' },
  title: 'AI Prompt Cards for Banking Professionals',
  description:
    'Twenty structured AI workflow cards for banking professionals who want better prompts, clearer outputs, and stronger review habits.',
};

export default function PromptCardsPage() {
  return <PromptCardsExperience />;
}

