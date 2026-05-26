import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'About — The AI Banking Institute',
  description: 'Why we built The AI Banking Institute — and what we believe about AI in regulated finance.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <MockupShell
      activePath="/about"
      eyebrow="About · The AI Banking Institute"
      title={<>Built by bankers, for bankers.</>}
      lede="We started The AI Banking Institute because the AI training community banks were being sold did not survive contact with an exam, a board meeting, or a teller line."
      heroActions={[
        { label: 'Take the Assessment', href: '/assessment', variant: 'gold' },
        { label: 'Book a Briefing', href: '/briefing-preview', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'What we believe',
          heading: <>AI is most valuable when it is reviewed.</>,
          lede: <>The fastest path to safe adoption is not a longer policy doc — it is documented, reviewed workflows that pass an exam on the merits.</>,
        },
        {
          kicker: 'How we work',
          heading: <>Education-first. Implementation as the optional second act.</>,
          lede: <>Most institutions do not need a fractional CAIO. They need a curriculum their staff can finish, a sandbox they can practice in, and a toolbox of artifacts they can ship. We sell that. The advisory layer is for cohorts that need it.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'The AI Banking Institute',
        heading: <>Start with the readiness assessment. Or book a briefing.</>,
        body: <>Three minutes, zero commitment. The institutions that win with AI are the ones whose staff can use it safely Monday.</>,
        actions: [
          { label: 'Start Free Assessment', href: '/assessment', variant: 'gold' },
          { label: 'Book Briefing', href: '/briefing-preview', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
