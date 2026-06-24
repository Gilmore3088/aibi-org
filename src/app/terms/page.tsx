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
      lede="You buy a seat, you get the course and toolbox. Digital purchases are refundable within 7 days if the assessment has not been submitted, fewer than two course modules have been completed, and no certificate has been issued. We do not use your data or our course content to train AiBI-owned models. You do not redistribute course content. That is most of it."
      sections={[
        {
          kicker: 'What you get',
          heading: <>Course access, sandbox access, toolbox artifacts.</>,
          lede: <>Current individual enrollment includes ongoing access to the version of the course you bought, plus reasonable updates under the current offer. Sandbox access lasts for the duration of your account. Downloadable Toolbox artifacts are yours to keep and modify internally.</>,
        },
        {
          kicker: 'Refunds',
          heading: <>Seven days, before the paid work is substantially used.</>,
          lede: <>Email hello@aibankinginstitute.com within 7 days of purchase. We refund duplicate purchases, failed-access purchases we cannot resolve, and unused digital seats where the assessment has not been submitted, fewer than two course modules have been completed, and no certificate has been issued.</>,
          surface: 'white',
        },
        {
          kicker: 'What we expect',
          heading: <>No redistribution. No model training on our content.</>,
          lede: <>You may not redistribute the course or Toolbox to non-purchasers. You may not use our content to train a model. When you run AI features, your prompt is handled under the selected provider path described in the LLM data-handling summary. These rules keep prices low and boundaries clear for individual bankers.</>,
        },
      ]}
      ctaBand={{
        heading: <>Questions about the terms?</>,
        body: <>Email hello@aibankinginstitute.com — short answers, no legalese.</>,
        actions: [
          { label: 'Email us', href: 'mailto:hello@aibankinginstitute.com', variant: 'gold' },
          { label: 'LLM data handling', href: '/security/data-handling', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
