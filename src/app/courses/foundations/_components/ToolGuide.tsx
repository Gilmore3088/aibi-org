'use client';

// ToolGuide — renders a single platform guide with collapsible accordion sections
// Displays: Getting Started, Free vs Paid, Banking Use Cases, Custom Instructions,
// Data Safety, and Pro Tips.
// Banking use case prompts appear in monospace copy-paste boxes (PromptCard pattern).

import { useState, useCallback } from 'react';
import type { ToolGuide as ToolGuideData } from '@content/courses/foundations/tool-guides-notebooklm-perplexity';

interface ToolGuideProps {
  readonly guide: ToolGuideData;
}

const COPY_RESET_MS = 2000;

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] mb-1">
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
    <div className="border border-[color:var(--color-parch-dark)] rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-[color:var(--color-parch)] hover:bg-[color:var(--color-parch-dark)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--color-terra)]"
        aria-expanded={open}
      >
        <span
          className="font-serif text-base font-bold text-[color:var(--color-ink)]"
          style={{ borderBottom: open ? `2px solid ${accentVar}` : 'none', paddingBottom: open ? '1px' : '0' }}
        >
          {title}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest shrink-0 ml-4"
          style={{ color: accentVar }}
          aria-hidden="true"
        >
          {open ? 'Close' : 'Open'}
        </span>
      </button>

      {open && (
        <div className="px-5 py-5 bg-[color:var(--color-linen)] space-y-4 border-t border-[color:var(--color-parch-dark)]">
          {children}
        </div>
      )}
    </div>
  );
}

function CopyablePrompt({ text }: { readonly text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    }
  }, [text]);

  return (
    <div className="relative">
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-4 pr-16">
        <pre className="font-mono text-[13px] leading-relaxed text-[color:var(--color-ink)] whitespace-pre-wrap break-words">
          {text}
        </pre>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1"
        style={{
          backgroundColor: copied ? 'var(--color-terra-light)' : 'var(--color-terra)',
          color: 'var(--color-linen)',
        }}
        aria-label={copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ToolGuide({ guide }: ToolGuideProps) {
  return (
    <article className="space-y-3" aria-label={`${guide.platformLabel} guide`}>

      {/* Platform header */}
      <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-parch-dark)] rounded-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm text-[color:var(--color-linen)]"
                style={{ backgroundColor: guide.colorVar }}
              >
                {guide.platformLabel}
              </span>
              <a
                href={guide.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-slate)] hover:text-[color:var(--color-terra)] transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-terra)] focus:ring-offset-1 rounded-sm"
              >
                {guide.url.replace('https://', '')} ↗
              </a>
            </div>
            <p className="font-serif text-base italic text-[color:var(--color-ink)] leading-snug max-w-2xl">
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
        <ol className="space-y-2 list-none">
          {guide.gettingStarted.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="font-mono text-[11px] shrink-0 mt-0.5 w-5 text-right"
                style={{ color: guide.colorVar }}
                aria-hidden="true"
              >
                {i + 1}.
              </span>
              <span className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                {step}
              </span>
            </li>
          ))}
        </ol>
        <div
          className="mt-4 p-4 border-l-4 rounded-sm bg-[color:var(--color-parch)]"
          style={{ borderColor: guide.colorVar }}
        >
          <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
            {guide.gettingStarted.firstSessionNote}
          </p>
        </div>
      </AccordionSection>

      {/* Free vs Paid */}
      <AccordionSection title="Free vs. Paid" accentVar={guide.colorVar}>
        <div className="space-y-4">
          {guide.pricing.map((tier) => (
            <div
              key={tier.tierName}
              className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-[color:var(--color-parch)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm text-[color:var(--color-linen)]"
                  style={{ backgroundColor: guide.colorVar }}
                >
                  {tier.tierName}
                </span>
                <span className="font-mono text-sm text-[color:var(--color-ink)]">
                  {tier.cost}
                </span>
              </div>
              <ul className="space-y-1 mb-3">
                {tier.keyLimits.map((limit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: guide.colorVar }}
                      aria-hidden="true"
                    />
                    <span className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-[color:var(--color-parch-dark)]">
                <SectionLabel>Banking verdict</SectionLabel>
                <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  {tier.bankingVerdict}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Banking Use Cases */}
      <AccordionSection title="5 Banking Use Cases" accentVar={guide.colorVar}>
        <div className="space-y-5">
          {guide.bankingUseCases.map((useCase) => (
            <div
              key={useCase.number}
              className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-[color:var(--color-parch)] space-y-3"
            >
              <div className="flex items-start gap-3">
                <span
                  className="font-mono text-[11px] shrink-0 mt-0.5"
                  style={{ color: guide.colorVar }}
                  aria-hidden="true"
                >
                  {useCase.number}.
                </span>
                <h3 className="font-serif text-base font-bold text-[color:var(--color-ink)] leading-snug">
                  {useCase.title}
                </h3>
              </div>
              <div className="space-y-1">
                <SectionLabel>Prompt — copy and paste</SectionLabel>
                <CopyablePrompt text={useCase.prompt} />
              </div>
              <div className="space-y-1">
                <SectionLabel>What you will get</SectionLabel>
                <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  {useCase.expectedOutput}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* Custom Instructions */}
      <AccordionSection title="Custom Instructions" accentVar={guide.colorVar}>
        <div className="space-y-4">
          {guide.customInstructions.available ? (
            <>
              <div>
                <SectionLabel>How to configure</SectionLabel>
                <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  {guide.customInstructions.howTo}
                </p>
              </div>
              {guide.customInstructions.bankingExample && (
                <div className="space-y-1">
                  <SectionLabel>Banking example</SectionLabel>
                  <CopyablePrompt text={guide.customInstructions.bankingExample} />
                </div>
              )}
            </>
          ) : (
            <p className="font-sans text-sm text-[color:var(--color-slate)]">
              Custom instructions are not available on this platform.
            </p>
          )}
        </div>
      </AccordionSection>

      {/* Data Safety */}
      <AccordionSection title="Data Safety for Banking Use" accentVar={guide.colorVar}>
        <div className="space-y-4">
          <div
            className="p-4 border-l-4 rounded-sm bg-[color:var(--color-parch)]"
            style={{ borderColor: guide.colorVar }}
          >
            <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)] leading-relaxed">
              {guide.dataSafety.summary}
            </p>
          </div>
          <ul className="space-y-2">
            {guide.dataSafety.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                  style={{ backgroundColor: guide.colorVar }}
                  aria-hidden="true"
                />
                <span className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
                  {detail}
                </span>
              </li>
            ))}
          </ul>
          <div className="border border-[color:var(--color-parch-dark)] rounded-sm p-4 bg-[color:var(--color-parch)]">
            <SectionLabel>Banking verdict</SectionLabel>
            <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed">
              {guide.dataSafety.bankingVerdict}
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* Pro Tips */}
      <AccordionSection title="5 Pro Tips" accentVar={guide.colorVar}>
        <ol className="space-y-4 list-none">
          {guide.proTips.map((tip) => (
            <li key={tip.number} className="flex gap-4">
              <span
                className="font-mono text-lg font-bold shrink-0 leading-tight"
                style={{ color: guide.colorVar }}
                aria-hidden="true"
              >
                {tip.number}
              </span>
              <p className="font-sans text-sm text-[color:var(--color-ink)] leading-relaxed pt-0.5">
                {tip.tip}
              </p>
            </li>
          ))}
        </ol>
      </AccordionSection>

    </article>
  );
}
