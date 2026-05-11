'use client';

import { useState, type CSSProperties } from 'react';

export type LMSModelId = 'claude' | 'openai' | 'gemini';

export interface LMSModelOption {
  readonly id: LMSModelId;
  readonly name: string;
  readonly mark: string;
}

export const LMS_MODELS: readonly LMSModelOption[] = [
  { id: 'claude', name: 'Claude', mark: 'C' },
  { id: 'openai', name: 'ChatGPT', mark: 'G' },
  { id: 'gemini', name: 'Gemini', mark: 'g' },
];

interface Props {
  readonly value: LMSModelId;
  readonly onChange: (id: LMSModelId) => void;
  readonly compact?: boolean;
}

/**
 * Ledger-styled model picker. Currently a display-only selector — it does
 * not actually route prompts to different model providers. Wiring lives in
 * a separate plumbing task.
 */
export function ModelPicker({ value, onChange, compact = false }: Props) {
  const [hovered, setHovered] = useState<LMSModelId | null>(null);

  return (
    <div
      role="radiogroup"
      aria-label="Model"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 3,
        background: 'var(--ledger-paper)',
        border: '1px solid var(--ledger-rule)',
        borderRadius: 3,
      }}
    >
      {LMS_MODELS.map((m) => {
        const active = m.id === value;
        const hot = hovered === m.id;
        const baseStyle: CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '4px 10px' : '6px 12px',
          background: active ? 'var(--ledger-ink)' : 'transparent',
          color: active
            ? 'var(--ledger-paper)'
            : hot
              ? 'var(--ledger-accent)'
              : 'var(--ledger-ink-2)',
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
          fontFamily: 'var(--ledger-mono)',
          fontSize: compact ? 10 : 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontWeight: 600,
        };
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(m.id)}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            style={baseStyle}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-grid',
                placeItems: 'center',
                width: compact ? 14 : 16,
                height: compact ? 14 : 16,
                borderRadius: '50%',
                border: '1px solid currentColor',
                fontFamily: 'var(--ledger-serif)',
                fontStyle: 'italic',
                fontSize: compact ? 9 : 10,
                lineHeight: 1,
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              {m.mark}
            </span>
            {m.name}
          </button>
        );
      })}
    </div>
  );
}
