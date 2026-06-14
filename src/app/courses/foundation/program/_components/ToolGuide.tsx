'use client';

// ToolGuide — renders a single platform guide with collapsible accordion sections
// Displays: Getting Started, Free vs Paid, Banking Use Cases, Custom Instructions,
// Data Safety, and Pro Tips.
// Banking use case prompts appear in monospace copy-paste boxes (PromptCard pattern).
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold). The
// `colorVar` from guide data is preserved as a per-platform accent on the
// platform badge and accordion underlines.

import { useState, useCallback } from 'react';
import type { ToolGuide as ToolGuideData } from '@content/courses/foundation-program/tool-guides';

interface ToolGuideProps {
  readonly guide: ToolGuideData;
}

const COPY_RESET_MS = 2000;

const KICKER: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p style={{ ...KICKER, color: 'var(--slate-500)', margin: '0 0 4px' }}>
      {children}
    </p>
  );
}

function AccordionSection({
  title,
  accentVar,
  defaultOpen = false,
  children,
}: {
  readonly title: string;
  readonly accentVar: string;
  readonly defaultOpen?: boolean;
  readonly children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      <button
        type="button"
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: open ? 'var(--cream)' : '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          transition: 'background .12s',
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--ink)',
            borderBottom: open ? `2px solid ${accentVar}` : 'none',
            paddingBottom: open ? 1 : 0,
            textAlign: 'left',
          }}
        >
          {title}
        </span>
        <span
          style={{ ...KICKER, color: accentVar, marginLeft: 16, flexShrink: 0 }}
          aria-hidden="true"
        >
          {open ? 'Close' : 'Open'}
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: 20,
            background: 'var(--cream)',
            borderTop: '1px solid var(--ink-a10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function CopyablePrompt({ text }: { readonly text: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleCopy = useCallback(async () => {
    const reset = () => setTimeout(() => setStatus('idle'), COPY_RESET_MS);

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        reset();
        return;
      } catch {
        // fall through to execCommand fallback
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch {
      succeeded = false;
    }
    document.body.removeChild(textarea);
    setStatus(succeeded ? 'copied' : 'failed');
    reset();
  }, [text]);

  const copied = status === 'copied';
  const failed = status === 'failed';

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--ink-a10)',
          borderRadius: 'var(--r-md)',
          padding: '16px 80px 16px 16px',
        }}
      >
        <pre
          style={{
            fontFamily: MONO_STACK,
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--ink)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          {text}
        </pre>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderRadius: 'var(--r-sm)',
          border: 'none',
          cursor: 'pointer',
          background: failed
            ? '#B91C1C'
            : copied
              ? 'var(--emerald-700)'
              : 'var(--ink)',
          color: '#FFFFFF',
        }}
        aria-live="polite"
        aria-label={
          failed
            ? 'Copy failed — select the prompt manually'
            : copied
              ? 'Copied to clipboard'
              : 'Copy prompt to clipboard'
        }
      >
        {failed ? 'Failed' : copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

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
                style={{
                  ...KICKER,
                  color: 'var(--slate-500)',
                  textDecoration: 'none',
                }}
              >
                {guide.url.replace(/^https?:\/\//, '')} ↗
              </a>
            </div>
            <p
              style={{
                fontSize: 16,
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
      <AccordionSection
        title="Getting Started"
        accentVar={guide.colorVar}
        defaultOpen
      >
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {guide.gettingStarted.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 12 }}>
              <span
                style={{
                  fontFamily: MONO_STACK,
                  fontSize: 11,
                  flexShrink: 0,
                  marginTop: 2,
                  width: 20,
                  textAlign: 'right',
                  color: guide.colorVar,
                }}
                aria-hidden="true"
              >
                {i + 1}.
              </span>
              <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6 }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
        <div
          style={{
            marginTop: 8,
            padding: 16,
            borderLeft: `4px solid ${guide.colorVar}`,
            borderRadius: 'var(--r-md)',
            background: '#FFFFFF',
          }}
        >
          <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
            {guide.gettingStarted.firstSessionNote}
          </p>
        </div>
      </AccordionSection>

      {/* Free vs Paid */}
      <AccordionSection title="Free vs. Paid" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guide.pricing.map((tier) => (
            <div
              key={tier.tierName}
              style={{
                border: '1px solid var(--ink-a10)',
                borderRadius: 'var(--r-md)',
                padding: 16,
                background: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span
                  style={{
                    ...KICKER,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: guide.colorVar,
                    color: '#FFFFFF',
                  }}
                >
                  {tier.tierName}
                </span>
                <span style={{ fontFamily: MONO_STACK, fontSize: 16, color: 'var(--ink)' }}>
                  {tier.cost}
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {tier.keyLimits.map((limit, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span
                      style={{
                        marginTop: 7,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: guide.colorVar,
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6 }}>
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--ink-a10)' }}>
                <SectionLabel>Banking verdict</SectionLabel>
                <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                  {tier.bankingVerdict}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Banking Use Cases */}
      <AccordionSection title="5 Banking Use Cases" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {guide.bankingUseCases.map((useCase) => (
            <div
              key={useCase.number}
              style={{
                border: '1px solid var(--ink-a10)',
                borderRadius: 'var(--r-md)',
                padding: 16,
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span
                  style={{
                    fontFamily: MONO_STACK,
                    fontSize: 11,
                    flexShrink: 0,
                    marginTop: 2,
                    color: guide.colorVar,
                  }}
                  aria-hidden="true"
                >
                  {useCase.number}.
                </span>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {useCase.title}
                </h3>
              </div>
              <div>
                <SectionLabel>Prompt — copy and paste</SectionLabel>
                <CopyablePrompt text={useCase.prompt} />
              </div>
              <div>
                <SectionLabel>What you will get</SectionLabel>
                <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                  {useCase.expectedOutput}
                </p>
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
                <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                  {guide.customInstructions.howTo}
                </p>
              </div>
              {guide.customInstructions.bankingExample && (
                <div>
                  <SectionLabel>Banking example</SectionLabel>
                  <CopyablePrompt text={guide.customInstructions.bankingExample} />
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--slate-500)', margin: 0 }}>
              Custom instructions are not available on this platform.
            </p>
          )}
        </div>
      </AccordionSection>

      {/* Data Safety */}
      <AccordionSection title="Data Safety for Banking Use" accentVar={guide.colorVar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: 16,
              borderLeft: `4px solid ${guide.colorVar}`,
              borderRadius: 'var(--r-md)',
              background: '#FFFFFF',
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {guide.dataSafety.summary}
            </p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {guide.dataSafety.details.map((detail, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span
                  style={{
                    marginTop: 7,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: guide.colorVar,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6 }}>
                  {detail}
                </span>
              </li>
            ))}
          </ul>
          <div
            style={{
              border: '1px solid var(--ink-a10)',
              borderRadius: 'var(--r-md)',
              padding: 16,
              background: '#FFFFFF',
            }}
          >
            <SectionLabel>Banking verdict</SectionLabel>
            <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
              {guide.dataSafety.bankingVerdict}
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Pro Tips */}
      <AccordionSection title="5 Pro Tips" accentVar={guide.colorVar}>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {guide.proTips.map((tip) => (
            <li key={tip.number} style={{ display: 'flex', gap: 16 }}>
              <span
                style={{
                  fontFamily: MONO_STACK,
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                  lineHeight: 1.2,
                  color: guide.colorVar,
                }}
                aria-hidden="true"
              >
                {tip.number}
              </span>
              <p
                style={{
                  fontSize: 16,
                  color: 'var(--ink)',
                  lineHeight: 1.6,
                  paddingTop: 2,
                  margin: 0,
                }}
              >
                {tip.tip}
              </p>
            </li>
          ))}
        </ol>
      </AccordionSection>
    </article>
  );
}
