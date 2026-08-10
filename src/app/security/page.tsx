import type { Metadata } from 'next';
import Link from 'next/link';
import { DocumentPreview, MockupShell } from '@/components/mockup';
import { GuideRequestForm } from './_components/GuideRequestForm';

export const metadata: Metadata = {
  title: 'Security & Governance — AI built for regulated institutions',
  description:
    'Aligned with SR 26-2, Interagency TPRM Guidance, ECOA / Reg B, and the AIEOG AI Lexicon. Free Safe AI Use Guide for community banks and credit unions.',
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
    title: 'Mapping to SR 26-2',
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
    title: 'Review packet readiness',
    body:
      'What to keep in the packet before an audit, risk review, or exam conversation. Based on the AIEOG AI Lexicon vocabulary (US Treasury, FBIIC, FSSCC, February 2026).',
  },
] as const;

const DATA_HANDLING_RULES = [
  'Practice scenarios use synthetic or sanitized banking examples. They are designed to teach the workflow without requiring customer records.',
  'Learners are told not to paste customer PII, account numbers, confidential member data, or non-public examination material into prompts.',
  'AI output is a draft. A banker owns fact-checking, policy fit, escalation, and any customer-facing or regulated decision.',
] as const;

const REGULATORY_REFERENCES = [
  'SR 26-2 — Model Risk',
  'Interagency TPRM Guidance',
  'ECOA / Reg B',
  'AIEOG AI Lexicon',
] as const;

export default function SecurityPage() {
  return (
    <MockupShell
      activePath="/security"
      cta={{ label: 'Get In-Depth report', href: '/assessment/in-depth' }}
      eyebrow="Security & Governance"
      title={<>Set the AI boundary before staff use it.</>}
      lede={
        <>
          A practical guide to approved tools, restricted data, human review,
          and evidence your compliance, risk, and IT teams can inspect.
        </>
      }
      heroAside={
        <aside
          data-testid="security-posture-card"
          aria-label="Security posture at a glance"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24,
            padding: 28,
            color: '#fff',
            display: 'grid',
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              margin: 0,
            }}
          >
            Posture at a glance
          </p>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: 'grid',
              gap: 10,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            <li>
              Practice runs on synthetic or sanitized banking examples — no
              customer records needed.
            </li>
            <li>
              Learner AI calls use paid API paths; usage logs store metadata,
              never raw prompt text.
            </li>
            <li>
              Written to hold up in SR 26-2, Interagency TPRM, and ECOA / Reg B
              conversations.
            </li>
          </ul>
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 18px',
            }}
          >
            <Link href="/security/data-handling" style={{ color: 'var(--gold-soft)' }}>
              LLM data-handling summary →
            </Link>
            <Link href="/security/it-approval" style={{ color: 'var(--gold-soft)' }}>
              IT review packet →
            </Link>
          </p>
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
          kicker: '§02 · Get the guide',
          heading: <>Request the Safe AI Use Guide.</>,
          lede: (
            <>
              Six one-page decisions for community banks and credit unions. The
              PDF downloads immediately and a copy is emailed to you.
            </>
          ),
          body: (
            <div
              data-testid="security-guide-form-section"
              style={{
                background: 'var(--ink)',
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 40px)',
                maxWidth: 720,
              }}
            >
              <p
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--gold-soft)',
                  margin: '0 0 16px',
                }}
              >
                Free download
              </p>
              <GuideRequestForm />
            </div>
          ),
          surface: 'white',
        },
        {
          kicker: '§03 · Regulatory alignment',
          heading: <>The guide maps staff practice to public source vocabulary.</>,
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
          kicker: '§04 · Data handling',
          heading: <>Practice with synthetic data. Keep customer data out of prompts.</>,
          lede: (
            <>
              IT and security reviewers can also read the public{' '}
              <Link href="/security/data-handling" style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
                LLM data-handling summary
              </Link>
              , including what is sent to providers when a learner runs AiBI Lab or Toolbox.
              The{' '}
              <Link href="/security/it-approval" style={{ color: 'var(--gold-deep)', fontWeight: 800 }}>
                IT review packet
              </Link>{' '}
              gives internal reviewers the product scope, support path, and claim boundaries in one place.
            </>
          ),
          body: (
            <div className="mk-reg-ref-grid">
              {DATA_HANDLING_RULES.map((rule) => (
                <div key={rule}>{rule}</div>
              ))}
            </div>
          ),
          surface: 'white',
        },
        {
          kicker: '§05 · Not just a PDF',
          heading: (
            <>The guide is the starting point. The engagement is how it gets operationalized.</>
          ),
          lede: (
            <>
              A governance guide is not the same as a governance framework. An engagement with
              the Institute installs the framework inside your institution — with named owners, a
              review cadence, and documented mapping to applicable regulatory references.
              No software seats. No vendor lock-in.
            </>
          ),
          surface: 'cream',
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
          { label: 'IT review packet', href: '/security/it-approval', variant: 'gold' },
          { label: 'Get In-Depth report', href: '/assessment/in-depth', variant: 'ghost-dark' },
          { label: 'For institutions', href: '/for-institutions', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
