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
      activePath="/"
      eyebrow="Legal · Privacy"
      title={<>What we collect. What we do not.</>}
      lede="We collect the minimum needed to run the assessment, deliver the course, support buyers, and send results. We never sell data. The product is designed so customer or member records are not needed for training."
      sections={[
        {
          kicker: 'What we collect',
          heading: <>Email, assessment responses, course progress, saved work, and support records.</>,
          lede: <>When you complete an assessment, your email may go to MailerLite so we can send tier-routed follow-up notes about your result. Assessment responses, course progress, saved artifacts, support cases, and operating metadata live in Supabase and related service providers needed to operate the product.</>,
        },
        {
          kicker: 'What we do not',
          heading: <>No third-party data brokers. No enrichment. No sale.</>,
          lede: <>Analytics is first-party (Vercel Analytics) and IP-aggregated. We do not enrich your data with third-party sources or sell it. Learners should not enter customer PII, account numbers, confidential files, secrets, or non-public examination material into AI prompts; the LLM data-handling summary explains the provider path.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        heading: <>Questions about how your data is handled?</>,
        body: <>Email hello@aibankinginstitute.com — we answer privacy questions personally.</>,
        actions: [
          { label: 'LLM data handling', href: '/security/data-handling', variant: 'gold' },
          { label: 'IT review packet', href: '/security/it-approval', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
