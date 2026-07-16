'use client';

import { useState } from 'react';
import type { FoundationLabBrief } from '@content/courses/foundation-program/lab-first';
import { FONT_INTER, eyebrowStyle } from './shared';

export function QualityGatePanel({
  brief,
  keyTakeaways,
  moduleNumber,
}: {
  readonly brief: FoundationLabBrief;
  readonly keyTakeaways?: readonly string[];
  readonly moduleNumber: number;
}) {
  const tabs = [
    {
      id: 'review',
      label: 'Review',
      eyebrow: 'Before submit',
      heading: 'Check the artifact before it leaves the lab.',
      items: brief.reviewChecklist,
    },
    {
      id: 'signals',
      label: 'Signals',
      eyebrow: 'Manager-ready',
      heading: 'Make the proof visible to someone else.',
      items: brief.qualitySignals,
    },
    ...(keyTakeaways && keyTakeaways.length > 0
      ? [
          {
            id: 'takeaways',
            label: 'Takeaways',
            eyebrow: 'Keep',
            heading: 'Carry these points into the artifact.',
            items: keyTakeaways.slice(0, 3),
          },
        ]
      : []),
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('review');
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section
      aria-labelledby={`m${moduleNumber}-quality-gate-heading`}
      data-testid="foundation-quality-gate"
      className="foundation-quality-gate"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 0.34fr) minmax(0, 1fr)',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        background: '#fff',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        style={{
          background: 'var(--cream-2)',
          borderRight: '1px solid var(--ink-a10)',
          padding: 'clamp(18px, 2.4vw, 24px)',
        }}
      >
        <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Quality gate</p>
        <h3
          id={`m${moduleNumber}-quality-gate-heading`}
          style={{
            margin: 0,
            color: 'var(--ink)',
            fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
            lineHeight: 1.12,
            letterSpacing: '-0.01em',
            fontWeight: 850,
          }}
        >
          One rubric before you submit.
        </h3>
      </div>

      <div style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
        <div
          role="tablist"
          aria-label="Quality gate views"
          className="foundation-quality-gate__tabs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
            gap: 8,
            marginBottom: 16,
          }}
        >
          {tabs.map((tab) => {
            const isActive = active.id === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`m${moduleNumber}-quality-${tab.id}`}
                id={`m${moduleNumber}-quality-${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: '1px solid',
                  borderColor: isActive ? 'var(--ink)' : 'var(--ink-a10)',
                  borderRadius: 12,
                  background: isActive ? 'var(--ink)' : 'var(--cream)',
                  color: isActive ? '#fff' : 'var(--ink)',
                  padding: '11px 10px',
                  fontFamily: FONT_INTER,
                  fontSize: '0.8125rem',
                  lineHeight: 1.15,
                  fontWeight: 850,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`m${moduleNumber}-quality-${active.id}`}
          role="tabpanel"
          aria-labelledby={`m${moduleNumber}-quality-${active.id}-tab`}
          style={{
            border: '1px solid var(--ink-a10)',
            borderRadius: 14,
            background: 'var(--cream)',
            padding: '16px 18px',
          }}
        >
          <p style={{ ...eyebrowStyle, color: 'var(--slate-500)', marginBottom: 8 }}>
            {active.eyebrow}
          </p>
          <h4 style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: '1.0625rem', lineHeight: 1.2, fontWeight: 850 }}>
            {active.heading}
          </h4>
          <ul style={{ display: 'grid', gap: 9, margin: 0, padding: 0, listStyle: 'none' }}>
            {active.items.map((item) => (
              <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: active.id === 'signals' ? 'var(--ink)' : 'var(--gold)',
                    marginTop: 8,
                    flex: '0 0 auto',
                  }}
                />
                <span style={{ color: 'var(--ink)', fontSize: '0.9375rem', lineHeight: 1.45, fontWeight: 650 }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
