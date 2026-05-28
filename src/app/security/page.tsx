import type { Metadata } from 'next';
import { MockupShell } from '@/components/mockup';
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

export default function SecurityPage() {
  return (
    <MockupShell
      activePath="/security"
      eyebrow="Security & Governance · Free guide"
      title={<>AI governance built for institutions that get examined.</>}
      lede={
        <>
          <span style={{ display: 'block', marginBottom: 16 }}>
            If your board has been asking whether AI is safe for a regulated institution,
            the answer is not a brochure. It is a framework.
          </span>
          <span
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--gold-soft)',
              marginBottom: 10,
            }}
          >
            Aligned with
          </span>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 8,
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            <li>SR 11-7 — Model Risk</li>
            <li>Interagency TPRM Guidance</li>
            <li>ECOA / Reg B</li>
            <li>AIEOG AI Lexicon (US Treasury, FBIIC, FSSCC · Feb 2026)</li>
          </ul>
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
            Six chapters. Written for community banks and credit unions. One page per chapter.
            Maps directly to SR 11-7 and the AIEOG AI Lexicon.
          </p>
          <GuideRequestForm />

          {/* Companion takeaways — direct download, no gate. Pair the full 48-page guide
              with two single-page artifacts a banker can print and tape to a wall. */}
          <div
            style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              Companion takeaways
            </div>
            <a
              href="/api/resources/safe-ai-use-checklist/download"
              download
              style={{
                display: 'block',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.10)',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Safe AI Use Checklist (PDF) →
            </a>
            <a
              href="/api/resources/red-yellow-green-use-card/download"
              download
              style={{
                display: 'block',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 0',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Red / Yellow / Green Use Card (PDF) →
            </a>
          </div>
        </aside>
      }
      sections={[
        {
          kicker: '§01 · What is inside',
          heading: <>Six chapters your compliance officer will actually read.</>,
          body: (
            <div
              style={{
                display: 'grid',
                gap: 32,
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                marginTop: 32,
              }}
            >
              {GUIDE_CHAPTERS.map((chapter, idx) => (
                <article
                  key={chapter.title}
                  style={{
                    borderTop: '1px solid var(--slate-200)',
                    paddingTop: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: 13,
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--gold-deep)',
                      margin: '0 0 12px',
                    }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </p>
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      color: 'var(--ink)',
                      margin: '0 0 12px',
                    }}
                  >
                    {chapter.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      color: 'var(--slate-600)',
                      margin: 0,
                    }}
                  >
                    {chapter.body}
                  </p>
                </article>
              ))}
            </div>
          ),
        },
        {
          kicker: '§02 · Not just a PDF',
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
          { label: 'Book a briefing', href: '/for-institutions/advisory', variant: 'ghost-dark' },
        ],
      }}
    />
  );
}
