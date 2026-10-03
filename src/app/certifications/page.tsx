import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
import { AxWindow } from '@/components/ax';
import { getFoundationTrainingRecord } from '@content/courses/foundation-program/course-config';

export const metadata: Metadata = {
  title: 'Certifications — The AI Banking Institute',
  description: 'AiBI-Foundation — the credential for bankers building safely with AI. Earned by completing the Foundation course and final packet.',
  alternates: { canonical: '/certifications' },
};

export default function CertificationsPage() {
  const trainingRecord = getFoundationTrainingRecord();
  const hoursLabel = Number.isInteger(trainingRecord.hours)
    ? String(trainingRecord.hours)
    : trainingRecord.hours.toFixed(1);

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
      heroAside={
        <AxWindow title="certificate.pdf" meta="example">
          <div className="cert-sample">
            <p className="ax-k ax-gold">The AI Banking Institute</p>
            <p className="cert-sample-title">AiBI-Foundation</p>
            <p className="cert-sample-to">Awarded to <span>Your name</span></p>
            <dl className="cert-sample-meta">
              <div>
                <dt>Seat time</dt>
                <dd>~{hoursLabel} hours</dd>
              </div>
              <div>
                <dt>Modules</dt>
                <dd>{trainingRecord.moduleCount}</dd>
              </div>
              <div>
                <dt>Certificate ID</dt>
                <dd>AIBIP-2026-ABC234</dd>
              </div>
            </dl>
            <p className="cert-sample-verify">Verify at /verify/AIBIP-2026-ABC234</p>
          </div>
        </AxWindow>
      }
      sections={[
        {
          kicker: 'How it works',
          heading: <>Earned by doing the work.</>,
          lede: <>Submit your Workbench Pack at the end of the course. Once all modules are complete and the packet is submitted, the certificate issues with a verification link.</>,
          body: (
            <ol className="ax-pipeline" style={{ ['--ax-steps' as string]: 3 }} aria-label="How the credential is earned">
              {[
                { title: 'Complete', body: `All ${trainingRecord.moduleCount} self-paced modules.` },
                { title: 'Submit', body: 'The final packet: prompt, raw output, edited output, safety annotation.' },
                { title: 'Verify', body: 'The certificate issues with a public verification URL.' },
              ].map((step, index) => (
                <li key={step.title} className={index === 0 ? 'is-first' : undefined}>
                  <span className="ax-pipeline-node" aria-hidden="true" />
                  <span className="ax-k">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          ),
        },
        {
          kicker: 'What you get',
          heading: <>Authenticity that can be checked.</>,
          lede: <>Every credential ships with a public verification URL and a downloadable evidence summary. Verification means the Institute can confirm the certificate is real, who earned it, and when it was issued.</>,
          surface: 'white',
        },
        {
          kicker: 'Training record',
          heading: <>Documented seat time for your training log.</>,
          lede: (
            <>
              The credential documents ~{hoursLabel} hours of seat time across{' '}
              {trainingRecord.moduleCount} self-paced modules covering{' '}
              {trainingRecord.topics.join(', ')}. The verification URL lets your
              institution confirm the record for its internal training log.
              Documented seat time is not CPE credit, accreditation, or
              regulator-endorsed training.
            </>
          ),
        },
        {
          kicker: 'Claim boundary',
          heading: <>Aligned to public references. Not regulator-endorsed.</>,
          lede: <>No federal or state regulator issues, approves, recognizes, or endorses the AiBI-Foundation credential. The curriculum maps to SR 26-2, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon as public references for bank review.</>,
          surface: 'white',
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
