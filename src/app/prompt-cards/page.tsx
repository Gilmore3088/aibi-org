import type { Metadata } from 'next';
import { PromptCardsExperience } from './PromptCardsExperience';

export const metadata: Metadata = {
  title: 'AiBI Prompt Cards',
  description:
    'Twenty structured AI workflow cards for banking professionals who want better prompts, clearer outputs, and stronger review habits.',
};

export default function PromptCardsPage() {
  return <PromptCardsExperience />;
}
