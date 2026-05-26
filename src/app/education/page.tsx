import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Education — The AI Banking Institute',
  description: 'All the ways to learn at The AI Banking Institute — assessment, course, sandbox, toolbox, certifications.',
  alternates: { canonical: '/education' },
};

export default function EducationPage() {
  return (
    <MockupShell
      activePath="/courses"
      eyebrow="Education · Self-paced · No cohorts"
      title={<>One place to learn AI safely.</>}
      lede="Five ways to learn. Each one stands alone or stacks. Start with the free assessment, finish with the Foundation Certificate, or pick any module in any order."
      heroActions={[
        { label: 'Start Free Assessment', href: '/assessment', variant: 'gold' },
        { label: 'Browse Toolbox', href: '/my-toolbox', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Five ways to learn',
          heading: <>Assessment · Course · Sandbox · Toolbox · Certifications.</>,
          lede: <>Each is a fully formed product. None requires the others. Most learners start with the assessment because it surfaces the gap before the spend.</>,
        },
        {
          kicker: 'How institutions roll out',
          heading: <>Assess. Train. Document. Govern. Consult.</>,
          lede: <>The five-step institutional model is explained on the Teams page. The education products on this page are the building blocks.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'Education',
        heading: <>Pick a starting point. Build from there.</>,
        body: <>The fastest learners do the free assessment first, see where they sit, then choose their next move.</>,
        actions: [
          { label: 'Take the Assessment', href: '/assessment', variant: 'gold' },
          { label: 'Enroll in the Course', href: '/courses/foundation', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
