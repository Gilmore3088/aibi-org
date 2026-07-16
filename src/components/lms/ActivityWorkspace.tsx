'use client';

import { useState, type ReactNode } from 'react';
import { ModelPicker, type LMSModelId } from './ModelPicker';
import { INTER_STACK_VAR_INNER as INTER_STACK } from '@/lib/ui/fonts';

const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';

interface Props {
  /** "7.1" style identifier shown in the artifact-step kicker. */
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
 * Artifact workspace shell for the Submit step. The selected model is local
 * state for legacy practice contexts. Artifact submissions normally hide it
 * because the real model work happens in AiBI Lab.
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
  const headingId = `activity-workspace-${activityId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  return (
    <section
      aria-labelledby={headingId}
      className="activity-workspace"
      style={{
        background: '#fff',
        border: '1px solid var(--ink-a10)',
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 28,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        className="activity-workspace__header"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 18,
          alignItems: 'start',
          padding: 'clamp(18px, 2.4vw, 24px)',
          borderBottom: '1px solid var(--ink-a10)',
          background: 'var(--cream-2)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 8px',
              fontFamily: MONO_STACK,
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
            }}
          >
            Artifact step {activityId}
          </p>
          <h3
            id={headingId}
            style={{
              margin: 0,
              fontFamily: INTER_STACK,
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              color: 'var(--ink)',
              fontWeight: 850,
            }}
          >
            {title}
          </h3>
          {lead && (
            <p
              className="activity-workspace__lead"
              style={{
                margin: '10px 0 0',
                maxWidth: 760,
                fontFamily: INTER_STACK,
                fontSize: '0.9375rem',
                color: 'var(--slate-600)',
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              {lead}
            </p>
          )}
        </div>

        <div
          className="activity-workspace__status"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {submitted && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 10px',
                borderRadius: 999,
                border: '1px solid var(--gold-a40)',
                background: 'var(--gold-a20)',
                color: 'var(--ink)',
                fontFamily: MONO_STACK,
                fontSize: '0.6875rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              Saved
            </span>
          )}
          {!hideModelPicker && <ModelPicker value={model} onChange={setModel} compact />}
        </div>
      </div>

      <div className="activity-workspace__body" style={{ padding: 'clamp(18px, 2.4vw, 24px)' }}>
        {children}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 700px) {
              .activity-workspace {
                border-radius: 16px !important;
                box-shadow: none !important;
              }
              .activity-workspace__header {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
                padding: 16px !important;
              }
              .activity-workspace__lead {
                display: -webkit-box !important;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
                font-size: 14px !important;
                line-height: 1.42 !important;
              }
              .activity-workspace__status {
                justify-content: flex-start !important;
              }
              .activity-workspace__body {
                padding: 16px !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}
