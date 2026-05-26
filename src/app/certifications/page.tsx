import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Certifications — The AI Banking Institute',
  description: 'AiBI-Foundation, AiBI-S (Specialist), and AiBI-L (Leader) — credentials for bankers building safely with AI.',
  alternates: { canonical: '/certifications' },
};

export default function CertificationsPage() {
  return (
    <MockupShell
      activePath="/certifications"
      eyebrow="Credentials · For bankers"
      title={<>Three credentials. Real work behind each.</>}
      lede="Every credential is earned by completing reviewed work products — not by clicking through a video. The Foundation Certificate ships with the course. Specialist (AiBI-S) and Leader (AiBI-L) tracks open after that."
      heroActions={[
        { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
        { label: 'Inquire about AiBI-S/L', href: '/for-institutions/advisory', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'Foundation',
          heading: <>AiBI-Foundation · Earned by completing the course.</>,
          lede: <>Submit your Workbench Pack at the end of the course. Pack is reviewed by the Institute; certificate issued with verification link.</>,
        },
        {
          kicker: 'Specialist',
          heading: <>AiBI-S · Role-specific specialist.</>,
          lede: <>Build a role-specific evidence pack: AiBI-S/Compliance, AiBI-S/Lending, AiBI-S/Marketing, AiBI-S/Ops. Inquiry-only during the pilot phase.</>,
          surface: 'white',
        },
        {
          kicker: 'Leader',
          heading: <>AiBI-L · For the person leading institution-wide adoption.</>,
          lede: <>Demonstrate a cohort rollout, a documented verdict cycle, and reviewer-ready evidence across two business lines. Inquiry-only during pilot.</>,
        },
      ]}
      ctaBand={{
        kicker: 'Certifications',
        heading: <>Credentials banks and credit unions can verify.</>,
        body: <>Every credential ships with a public verification URL and a downloadable evidence summary. No bottomless training catalog — earn the credential by doing the work.</>,
        actions: [
          { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
          { label: 'Inquire (Specialist / Leader)', href: '/for-institutions/advisory', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
