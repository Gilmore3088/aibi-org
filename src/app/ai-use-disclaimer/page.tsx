import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'AI Use Disclaimer — The AI Banking Institute',
  description: 'How we use AI in our own work, what we expect from learners, and where AI ends and human review begins.',
  alternates: { canonical: '/ai-use-disclaimer' },
};

export default function AiUseDisclaimerPage() {
  return (
    <MockupShell
      activePath="/"
      eyebrow="AI Use · Our standards"
      title={<>How we use AI. How you should.</>}
      lede="We use AI to draft, edit, and structure parts of the course material. Every output ships only after a human review. We expect the same standard from our learners — and we teach it."
      sections={[
        {
          kicker: 'What we use AI for',
          heading: <>Drafting, editing, structuring. Never deciding.</>,
          lede: <>Course outlines, draft prose, formatting passes — yes. Curriculum decisions, scenario judgment, examiner-facing claims — never without human review. Every Toolbox artifact passes a named reviewer.</>,
        },
        {
          kicker: 'What we ask of learners',
          heading: <>Apply the same standard.</>,
          lede: <>If an output gets used at work, a named human reviewed it. If it touches member data, you sanitized first. If it touches a regulator, the file shows the review trail. Those three are the discipline the whole course teaches.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Disciplined AI use is the whole curriculum.</>,
        body: <>The course turns the discipline into reusable artifacts.</>,
        actions: [
          { label: 'Start the Course', href: '/courses/foundation', variant: 'gold' },
        ],
      }}
    />
  );
}
