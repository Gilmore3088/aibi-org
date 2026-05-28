// Per-accordion-body content for the larger ToolGuide sections.
// Each panel renders the *body* the AccordionSection wraps (orchestrator
// owns the AccordionSection chrome itself).

import type { ToolGuide as ToolGuideData } from '@content/courses/foundation-program/tool-guides';
import { CopyablePrompt } from './CopyablePrompt';
import { Bullet, KICKER, MONO_STACK, SectionLabel } from './toolGuideTokens';

export function GettingStartedPanel({
  steps,
  firstSessionNote,
  accent,
}: {
  readonly steps: readonly string[];
  readonly firstSessionNote: string;
  readonly accent: string;
}) {
  return (
    <>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {steps.map((step, i) => (
          <li key={i} style={{ display: 'flex', gap: 12 }}>
            <span
              style={{
                fontFamily: MONO_STACK,
                fontSize: 11,
                flexShrink: 0,
                marginTop: 2,
                width: 20,
                textAlign: 'right',
                color: accent,
              }}
              aria-hidden="true"
            >
              {i + 1}.
            </span>
            <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{step}</span>
          </li>
        ))}
      </ol>
      <div
        style={{
          marginTop: 8,
          padding: 16,
          borderLeft: `4px solid ${accent}`,
          borderRadius: 'var(--r-md)',
          background: '#FFFFFF',
        }}
      >
        <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          {firstSessionNote}
        </p>
      </div>
    </>
  );
}

export function PricingPanel({
  pricing,
  accent,
}: {
  readonly pricing: ToolGuideData['pricing'];
  readonly accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {pricing.map((tier) => (
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
                background: accent,
                color: '#FFFFFF',
              }}
            >
              {tier.tierName}
            </span>
            <span style={{ fontFamily: MONO_STACK, fontSize: 14, color: 'var(--ink)' }}>
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
                <Bullet colorVar={accent} />
                <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>
                  {limit}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--ink-a10)' }}>
            <SectionLabel>Banking verdict</SectionLabel>
            <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
              {tier.bankingVerdict}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BankingUseCasesPanel({
  useCases,
  accent,
}: {
  readonly useCases: ToolGuideData['bankingUseCases'];
  readonly accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {useCases.map((useCase) => (
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
                color: accent,
              }}
              aria-hidden="true"
            >
              {useCase.number}.
            </span>
            <h3
              style={{
                fontSize: 15,
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
            <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
              {useCase.expectedOutput}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomInstructionsPanel({
  customInstructions,
}: {
  readonly customInstructions: ToolGuideData['customInstructions'];
}) {
  if (!customInstructions.available) {
    return (
      <p style={{ fontSize: 14, color: 'var(--slate-500)', margin: 0 }}>
        Custom instructions are not available on this platform.
      </p>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <SectionLabel>How to configure</SectionLabel>
        <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          {customInstructions.howTo}
        </p>
      </div>
      {customInstructions.bankingExample && (
        <div>
          <SectionLabel>Banking example</SectionLabel>
          <CopyablePrompt text={customInstructions.bankingExample} />
        </div>
      )}
    </div>
  );
}

export function DataSafetyPanel({
  dataSafety,
  accent,
}: {
  readonly dataSafety: ToolGuideData['dataSafety'];
  readonly accent: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          padding: 16,
          borderLeft: `4px solid ${accent}`,
          borderRadius: 'var(--r-md)',
          background: '#FFFFFF',
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--ink)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {dataSafety.summary}
        </p>
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {dataSafety.details.map((detail, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Bullet colorVar={accent} />
            <span style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{detail}</span>
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
        <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
          {dataSafety.bankingVerdict}
        </p>
      </div>
    </div>
  );
}

export function ProTipsPanel({
  proTips,
  accent,
}: {
  readonly proTips: ToolGuideData['proTips'];
  readonly accent: string;
}) {
  return (
    <ol
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {proTips.map((tip) => (
        <li key={tip.number} style={{ display: 'flex', gap: 16 }}>
          <span
            style={{
              fontFamily: MONO_STACK,
              fontSize: 18,
              fontWeight: 700,
              flexShrink: 0,
              lineHeight: 1.2,
              color: accent,
            }}
            aria-hidden="true"
          >
            {tip.number}
          </span>
          <p
            style={{
              fontSize: 14,
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
  );
}
