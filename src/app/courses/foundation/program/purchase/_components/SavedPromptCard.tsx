// SavedPromptCard — the hero artifact for /purchase.
//
// Renders a realistic "saved prompt" card the buyer would build inside
// the course. Gold-bordered, title, prompt body, and a metadata strip.
// Static, server-renderable. Lives local to /purchase; promote later if
// another route needs it.

import type { CSSProperties } from 'react';
import { INTER_STACK_VAR as INTER_STACK } from '@/lib/ui/fonts';


interface SavedPromptCardProps {
  title?: string;
  prompt?: string;
  meta?: string;
  style?: CSSProperties;
}

const DEFAULT_PROMPT = `You are reviewing a credit memo draft. Summarize it for an internal committee in five bullet points. Lead with the credit decision and the reason. Flag any claim that is not supported by the underlying numbers in the memo. Do not invent figures, do not infer borrower intent, and call out any missing field that would normally appear in our standard template. Reply only in markdown bullets.`;

export function SavedPromptCard({
  title = 'Credit Memo Review · Internal Summary',
  prompt = DEFAULT_PROMPT,
  meta = 'Reviewed · Module 3 · Saved to your prompt library',
  style,
}: SavedPromptCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        color: 'var(--ink)',
        border: '2px solid var(--gold)',
        borderRadius: 24,
        padding: '24px 26px',
        boxShadow: 'var(--shadow-feature)',
        fontFamily: INTER_STACK,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
          }}
        >
          Saved Prompt
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            color: 'var(--slate-500)',
            letterSpacing: '0.04em',
          }}
        >
          v1 · edited today
        </span>
      </div>

      <h3
        style={{
          fontSize: '1.1875rem',
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          margin: '0 0 14px',
          color: 'var(--ink)',
        }}
      >
        {title}
      </h3>

      <div
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
          borderRadius: 16,
          padding: '16px 18px',
          fontSize: '0.875rem',
          lineHeight: 1.55,
          color: 'var(--ink)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {prompt}
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--ink-a10, rgba(7,26,47,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: '0.75rem',
          color: 'var(--slate-600)',
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: 'var(--emerald-700)',
            }}
          />
          {meta}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Copy · Run · Edit</span>
      </div>
    </div>
  );
}
