import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Certifications — The AI Banking Institute',
  description: 'AiBI-Foundation — the credential for bankers building safely with AI. Earned by completing reviewed work products.',
  alternates: { canonical: '/certifications' },
};

export default function CertificationsPage() {
  return (
    <MockupShell
      activePath="/certifications"
      eyebrow="Credentials · For bankers"
      title={<>The AiBI-Foundation credential.</>}
      lede="AiBI-Foundation is earned by completing reviewed work products — not by clicking through a video. Your Workbench Pack is reviewed by the Institute, and the certificate ships with a public verification URL."
      heroActions={[
        { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
        { label: 'See the curriculum', href: '/courses', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'How it works',
          heading: <>Earned by doing the work.</>,
          lede: <>Submit your Workbench Pack at the end of the course. Pack is reviewed by the Institute; certificate issued with verification link.</>,
        },
        {
          kicker: 'What you get',
          heading: <>Verifiable. Portable. Public.</>,
          lede: <>Every credential ships with a public verification URL and a downloadable evidence summary. Display it on LinkedIn, share it with your examiner, attach it to a board memo.</>,
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'Certifications',
        heading: <>A credential banks and credit unions can verify.</>,
        body: <>No bottomless training catalog — earn the credential by doing the work. Aligned with SR 11-7, TPRM, ECOA / Reg B, and the AIEOG AI Lexicon.</>,
        actions: [
          { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
          { label: 'View the curriculum', href: '/courses', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
