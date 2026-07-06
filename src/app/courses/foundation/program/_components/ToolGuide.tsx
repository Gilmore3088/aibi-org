'use client';

// ToolGuide — renders a single platform guide with collapsible accordion sections.
// AccordionSection and CopyablePrompt are in their own files (#247).

import type { ToolGuide as ToolGuideData } from '@content/courses/foundation-program/tool-guides';
import { AccordionSection } from './AccordionSection';
import { CopyablePrompt } from './CopyablePrompt';

const KICKER: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
      {children}
    </p>
  );
}

interface ToolGuideProps {
  readonly guide: ToolGuideData;
}

export function ToolGuide({ guide }: ToolGuideProps) {
  return (
    <article
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      aria-label={`${guide.platformLabel} guide`}
    >
      {/* Platform header */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  ...KICKER,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: guide.colorVar,
                  color: '#FFFFFF',
                }}
              >
                {guide.platformLabel}
              </span>
              <a
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...KICKER, color: 'var(--slate-500)', textDecoration: 'none' }}
              >
                {guide.url.replace(/^https?:\/\//, '')} ↗
              </a>
            </div>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--ink)',
                fontWeight: 500,
                lineHeight: 1.4,
                maxWidth: '60ch',
                margin: 0,
              }}
            >
              {guide.tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <AccordionSection title="Getting Started" accentVar={guide.colorVar} defaultOpen>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {guide.gettingStarted.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 12 }}>
              <span
                style={{ fontFamily: MONO_STACK, fontSize: '0.6875rem', flexShrink: 0, marginTop: 2, width: 20, textAlign: 'right', color: guide.colorVar }}
                aria-hidden="true"
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6 }}>{step}</span>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: 8, padding: 16, borderLeft: `4px solid ${guide.colorVar}`, borderRadius: 'var(--r-md)', background: '#FFFFFF' }}>
          <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {guide.gettingStarted.firstSessionNote}
          </p>
        </div>
      </AccordionSection>

      {/* Free vs Paid */}
      <AccordionSection title="Free vs. Paid" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guide.pricing.map((tier) => (
            <div key={tier.tierName} style={{ border: '1px solid var(--ink-a10)', borderRadius: 'var(--r-md)', padding: 16, background: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ ...KICKER, padding: '2px 8px', borderRadius: 999, background: guide.colorVar, color: '#FFFFFF' }}>
                  {tier.tierName}
                </span>
                <span style={{ fontFamily: MONO_STACK, fontSize: '1rem', color: 'var(--ink)' }}>{tier.cost}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tier.keyLimits.map((limit, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: guide.colorVar, flexShrink: 0 }} aria-hidden="true" />
                    <span style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6 }}>{limit}</span>
                  </li>
                ))}
              </ul>
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--ink-a10)' }}>
                <SectionLabel>Banking verdict</SectionLabel>
                <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{tier.bankingVerdict}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Banking Use Cases */}
      <AccordionSection title="5 Banking Use Cases" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {guide.bankingUseCases.map((useCase) => (
            <div key={useCase.number} style={{ border: '1px solid var(--ink-a10)', borderRadius: 'var(--r-md)', padding: 16, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontFamily: MONO_STACK, fontSize: '0.6875rem', flexShrink: 0, marginTop: 2, color: guide.colorVar }} aria-hidden="true">
                  {useCase.number}.
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4, margin: 0 }}>
                  {useCase.title}
                </h3>
              </div>
              <div>
                <SectionLabel>Prompt — copy and paste</SectionLabel>
                <CopyablePrompt text={useCase.prompt} />
              </div>
              <div>
                <SectionLabel>What you will get</SectionLabel>
                <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{useCase.expectedOutput}</p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Custom Instructions */}
      <AccordionSection title="Custom Instructions" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guide.customInstructions.available ? (
            <>
              <div>
                <SectionLabel>How to configure</SectionLabel>
                <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{guide.customInstructions.howTo}</p>
              </div>
              {guide.customInstructions.bankingExample && (
                <div>
                  <SectionLabel>Banking example</SectionLabel>
                  <CopyablePrompt text={guide.customInstructions.bankingExample} />
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--slate-500)', margin: 0 }}>
              Custom instructions are not available on this platform.
            </p>
          )}
        </div>
      </AccordionSection>

      {/* Data Safety */}
      <AccordionSection title="Data Safety for Banking Use" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, borderLeft: `4px solid ${guide.colorVar}`, borderRadius: 'var(--r-md)', background: '#FFFFFF' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{guide.dataSafety.summary}</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {guide.dataSafety.details.map((detail, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ marginTop: 7, width: 4, height: 4, borderRadius: '50%', background: guide.colorVar, flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6 }}>{detail}</span>
              </li>
            ))}
          </ul>
          <div style={{ border: '1px solid var(--ink-a10)', borderRadius: 'var(--r-md)', padding: 16, background: '#FFFFFF' }}>
            <SectionLabel>Banking verdict</SectionLabel>
            <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>{guide.dataSafety.bankingVerdict}</p>
          </div>
        </div>
      </AccordionSection>

      {/* Pro Tips */}
      <AccordionSection title="5 Pro Tips" accentVar={guide.colorVar}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guide.proTips.map((tip) => (
            <li key={tip.number} style={{ display: 'flex', gap: 16 }}>
              <span
                style={{ fontFamily: MONO_STACK, fontSize: '1.125rem', fontWeight: 700, flexShrink: 0, lineHeight: 1.2, color: guide.colorVar }}
                aria-hidden="true"
              >
                {tip.number}
              </span>
              <p style={{ fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.6, paddingTop: 2, margin: 0 }}>{tip.tip}</p>
            </li>
          ))}
        </ol>
      </AccordionSection>
    </article>
  );
}
