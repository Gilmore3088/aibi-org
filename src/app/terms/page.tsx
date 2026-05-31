import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Terms — The AI Banking Institute',
  description: 'Terms of service for The AI Banking Institute.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <MockupShell
      activePath="/"
      eyebrow="Legal · Terms of Service"
      title={<>The shortest possible terms.</>}
      lede="You buy a seat, you get the course and toolbox. Refund terms are being finalized ahead of public launch — email hello@aibankinginstitute.com for current terms before purchase. We do not use your data to train models. You do not redistribute course content. That is most of it."
      sections={[
        {
          kicker: 'What you get',
          heading: <>Course access, sandbox access, toolbox artifacts.</>,
          lede: <>Lifetime access to the version of the course you bought, plus reasonable updates. Sandbox access for the duration of your account. Downloadable Toolbox artifacts are yours to keep and modify internally.</>,
        },
        {
          kicker: 'What we expect',
          heading: <>No redistribution. No model training on our content.</>,
          lede: <>You may not redistribute the course or Toolbox to non-purchasers. You may not use our content to train a model. Both rules exist to keep prices low for individual bankers.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Questions about the terms?</>,
        body: <>Email hello@aibankinginstitute.com — short answers, no legalese.</>,
        actions: [
          { label: 'Email us', href: 'mailto:hello@aibankinginstitute.com', variant: 'gold' },
        ],
      }}
    />
  );
}
