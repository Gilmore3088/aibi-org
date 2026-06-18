import type { Metadata } from 'next';
import { DocumentPreview, MockupShell } from '@/components/mockup';
import { GuideRequestForm } from './_components/GuideRequestForm';

export const metadata: Metadata = {
  title: 'Security & Governance — AI built for regulated institutions',
  description:
    'Aligned with SR 11-7, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon. Free Safe AI Use Guide for community banks and credit unions.',
  alternates: { canonical: '/security' },
};

const GUIDE_CHAPTERS = [
  {
    title: 'The never-paste list',
    body:
      'The non-negotiable data types that must never touch a public LLM: PII, member records, non-public examination data, and the compliance reasoning behind each exclusion.',
  },
  {
    title: 'Private cloud vs. public model',
    body:
      'When private inference is required, when a public model is acceptable, and the decision tree every staff member should run before pasting anything into a tool.',
  },
  {
    title: 'Mapping to SR 11-7',
    body:
      'How model risk management guidance applies to generative AI, with specific language you can drop into your AI governance framework.',
  },
  {
    title: 'Vendor evaluation scoring',
    body:
      'The five-question framework for evaluating AI vendors against your risk posture, including concentration risk thresholds.',
  },
  {
    title: 'Shadow AI discovery',
    body:
      'A structured method for identifying the AI tools your staff are already using without your knowledge, and bringing them inside a governance perimeter without killing adoption.',
  },
  {
    title: 'Examiner readiness',
    body:
      'What to have on the table when an examiner walks in. Based on the AIEOG AI Lexicon vocabulary (US Treasury, FBIIC, FSSCC, February 2026).',
  },
] as const;

const REGULATORY_REFERENCES = [
  'SR 11-7 — Model Risk',
  'Interagency TPRM Guidance',
  'ECOA / Reg B',
  'AIEOG AI Lexicon',
] as const;

export default function SecurityPage() {
  return (
    <MockupShell
      activePath="/security"
      eyebrow="Security & Governance · Free guide"
      title={<>Set the AI boundary before staff use it.</>}
      lede={
        <>
          A practical guide to approved tools, restricted data, human review,
          and evidence your examiners can understand.
        </>
      }
      heroAside={
        <aside
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 28,
            color: '#fff',
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              margin: '0 0 12px',
            }}
          >
            Free download
          </p>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.15,
              margin: '0 0 12px',
              color: '#fff',
            }}
          >
            The Safe AI Use Guide.
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.82)',
              margin: '0 0 20px',
            }}
          >
            Six one-page decisions for community banks and credit unions.
          </p>
          <GuideRequestForm />
        </aside>
      }
      sections={[
        {
          kicker: '§01 · What is inside',
          heading: <>Preview the guide before you request it.</>,
          body: (
            <DocumentPreview
              eyebrow="Safe AI Use Guide"
              title="Six one-page decisions, not a governance textbook."
              dek="Each chapter gives a boundary, a banking example, and the artifact that proves the work."
              sections={GUIDE_CHAPTERS.map((chapter) => ({
                heading: chapter.title,
                lines: [chapter.body],
              }))}
              aside={
                <>
                  <p className="mk-proof-eyebrow">Companion takeaways</p>
                  <p>
                    The PDF pairs with printable desk cards and the Compliance Officer
                    Playbook, so staff have a short answer when the next AI question
                    appears.
                  </p>
                </>
              }
            />
          ),
        },
        {
          kicker: '§02 · Regulatory alignment',
          heading: <>The guide uses the vocabulary your reviewers expect.</>,
          body: (
            <div className="mk-reg-ref-grid">
              {REGULATORY_REFERENCES.map((reference) => (
                <div key={reference}>{reference}</div>
              ))}
            </div>
          ),
          surface: 'cream',
        },
        {
          kicker: '§03 · Not just a PDF',
          heading: (
            <>The guide is the starting point. The engagement is how it gets operationalized.</>
          ),
          lede: (
            <>
              A governance guide is not the same as a governance framework. An engagement with
              the Institute installs the framework inside your institution — with named owners, a
              review cadence, and documented alignment to every applicable regulatory reference.
              No software seats. No vendor lock-in.
            </>
          ),
          surface: 'white',
        },
      ]}
      ctaBand={{
        kicker: 'Security & Governance',
        heading: <>Teach the boundary. Document the verdict. Ship safely.</>,
        body: (
          <>
            The institutions that win with AI are the ones whose IT teams set clear verdicts and
            whose business teams follow them.
          </>
        ),
        actions: [
          { label: 'See how we work', href: '/for-institutions', variant: 'gold' },
          { label: 'Contact us', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
