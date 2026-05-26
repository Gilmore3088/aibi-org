import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Security — The AI Banking Institute',
  description: 'How we approach data, tools, NPI, and review boundaries — and how we teach institutions to do the same.',
  alternates: { canonical: '/security' },
};

export default function SecurityPage() {
  return (
    <MockupShell
      activePath="/security"
      eyebrow="Security · Data · Boundaries"
      title={<>No member data ever touches a model.</>}
      lede="The Institute teaches the boundary as a discipline, not a slide. The sandbox is built around fictional scenarios, the toolbox artifacts never store customer data, and the verdict cycle is what we want you to teach your team."
      heroActions={[
        { label: 'Take the Assessment', href: '/assessment', variant: 'gold' },
        { label: 'See the InfoSec Playbook', href: '/playbooks/infosec', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'How we handle data',
          heading: <>What stays out of the model.</>,
          lede: <>Real customer identifiers, account numbers, SSNs, application files, member transactions, and SAR specifics never enter any model — in our sandbox or in your tools. The same boundary applies to every Toolbox artifact.</>,
        },
        {
          kicker: 'How we teach the boundary',
          heading: <>Sanitization is a step, not a policy.</>,
          lede: <>The course covers what to strip, when to redact, when to swap with synthetics, and when the answer is just &quot;do not use AI for this.&quot; The IT/InfoSec Playbook documents the verdict cycle.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'Security',
        heading: <>Teach the boundary. Document the verdict. Ship safely.</>,
        body: <>The institutions that win with AI are the ones whose IT teams set clear verdicts and whose business teams follow them.</>,
        actions: [
          { label: 'Open InfoSec Playbook', href: '/playbooks/infosec', variant: 'gold' },
          { label: 'Book Briefing', href: '/briefing-preview', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
