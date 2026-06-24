import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';

export const metadata: Metadata = {
  title: 'Certifications — The AI Banking Institute',
  description: 'AiBI-Foundation — the credential for bankers building safely with AI. Earned by completing the Foundation course and final packet.',
  alternates: { canonical: '/certifications' },
};

export default function CertificationsPage() {
  return (
    <MockupShell
      activePath="/certifications"
      eyebrow="Credentials · For bankers"
      title={<>The AiBI-Foundation credential.</>}
      lede="AiBI-Foundation is earned by completing the course and submitting a final packet that shows the prompt, raw output, edited output, and safety annotation. The certificate ships with a public URL that confirms authenticity."
      heroActions={[
        { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
        { label: 'See the curriculum', href: '/courses', variant: 'ghost-dark' },
      ]}
      sections={[
        {
          kicker: 'How it works',
          heading: <>Earned by doing the work.</>,
          lede: <>Submit your Workbench Pack at the end of the course. Once all modules are complete and the packet is submitted, the certificate issues with a verification link.</>,
        },
        {
          kicker: 'What you get',
          heading: <>Authenticity that can be checked.</>,
          lede: <>Every credential ships with a public verification URL and a downloadable evidence summary. Verification means the Institute can confirm the certificate is real, who earned it, and when it was issued.</>,
          surface: 'white',
        },
        {
          kicker: 'Claim boundary',
          heading: <>Aligned to public references. Not regulator-endorsed.</>,
          lede: <>No federal or state regulator issues, approves, recognizes, or endorses the AiBI-Foundation credential. The curriculum maps to SR 11-7, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon as public references for bank review.</>,
        },
      ]}
      ctaBand={{
        kicker: 'Certifications',
        heading: <>A credential with an authenticity check.</>,
        body: <>No bottomless training catalog — earn the credential by completing the course and final packet. Verification confirms the certificate record; it is not third-party or regulator validation.</>,
        actions: [
          { label: 'Enroll in Foundation', href: '/courses/foundation', variant: 'gold' },
          { label: 'View the curriculum', href: '/courses', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
