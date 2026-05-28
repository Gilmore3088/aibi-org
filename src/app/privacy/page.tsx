import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Privacy — The AI Banking Institute',
  description: 'How The AI Banking Institute collects, uses, and protects your data.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <MockupShell
      activePath="/about"
      eyebrow="Legal · Privacy"
      title={<>What we collect. What we do not.</>}
      lede="We collect the minimum needed to run the assessment, deliver the course, and send your results. We never sell data. Member or customer data from your institution never enters any model."
      sections={[
        {
          kicker: 'What we collect',
          heading: <>Email, assessment responses, course progress.</>,
          lede: <>When you complete an assessment, your email goes to MailerLite so we can send tier-routed follow-up notes about your result. Assessment responses live in Supabase. Course progress lives in Supabase. That is it.</>,
        },
        {
          kicker: 'What we do not',
          heading: <>No tracking pixels in emails. No third-party data brokers. No sale.</>,
          lede: <>Analytics is first-party (Vercel Analytics) and IP-aggregated. We do not enrich your data with third-party sources. Full text of the policy is available on request.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Questions about how your data is handled?</>,
        body: <>Email hello@aibankinginstitute.com — we answer privacy questions personally.</>,
        actions: [
          { label: 'Email us', href: 'mailto:hello@aibankinginstitute.com', variant: 'gold' },
        ],
      }}
    />
  );
}
