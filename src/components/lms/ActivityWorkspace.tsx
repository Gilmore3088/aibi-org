'use client';

import { useState, type ReactNode } from 'react';
import { ModelPicker, type LMSModelId } from './ModelPicker';

interface Props {
  /** "Activity 7.1" style identifier shown in the kicker. */
  readonly activityId: string;
  readonly title: string;
  /** Optional italic lede paragraph rendered above the body. */
  readonly lead?: string;
  /** When true, a "Submitted" pill is shown in the header. */
  readonly submitted?: boolean;
  /** Hide the model picker (e.g., for non-model activities like inventories). */
  readonly hideModelPicker?: boolean;
  readonly children: ReactNode;
}

/**
 * Ledger-styled activity workspace shell — matches the prototype's
 * ActivityWorkspace pattern. The shell renders:
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │ ACTIVITY 7.1   Title                       [Model picker]  │
 *   ├────────────────────────────────────────────────────────────┤
 *   │ <italic lede>                                              │
 *   │ <children — form fields, results, action row, etc.>        │
 *   └────────────────────────────────────────────────────────────┘
 *
 * The selected model is local state — it does not yet drive the actual
 * submission API. Wiring a real provider switch is a separate task.
 */
export function ActivityWorkspace({
  activityId,
  title,
  lead,
  submitted,
  hideModelPicker,
  children,
}: Props) {
  const [model, setModel] = useState<LMSModelId>('claude');

  return (
    <div
      style={{
        background: 'var(--ledger-paper)',
        border: '1px solid var(--ledger-rule)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 28,
      }}
    >
      {/* Workspace header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          borderBottom: '1px solid var(--ledger-rule)',
          background: 'var(--ledger-parch)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
          }}
        >
          Activity {activityId}
        </span>
        <span
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontSize: 16,
            color: 'var(--ledger-ink)',
            fontWeight: 500,
          }}
        >
          {title}
        </span>
        {submitted && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              borderRadius: 2,
              border: '1px solid var(--ledger-accent-2)',
              background: 'rgba(30,58,95,0.08)',
              color: 'var(--ledger-accent-2)',
              fontFamily: 'var(--ledger-mono)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Submitted
          </span>
        )}
        <span style={{ flex: 1 }} />
        {!hideModelPicker && (
          <ModelPicker value={model} onChange={setModel} compact />
        )}
      </div>

      {/* Workspace body */}
      <div style={{ padding: '22px 22px 20px' }}>
        {lead && (
          <p
            style={{
              margin: '0 0 18px',
              fontFamily: 'var(--ledger-serif)',
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--ledger-ink-2)',
              lineHeight: 1.55,
            }}
          >
            {lead}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
