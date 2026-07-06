'use client';

// ShareDelta — caps the post-assessment results with a banker-appropriate
// LinkedIn draft built from the learner's score delta. Copy-to-clipboard is
// the primary action; the text is editable in-place if they want to tweak.

import { useState, useMemo, useCallback } from 'react';
import type { CSSProperties } from 'react';

interface ShareDeltaProps {
  readonly preScore: number | null;
  readonly postScore: number;
  readonly preTierLabel: string | null;
  readonly postTierLabel: string;
}

function buildDraft(args: {
  delta: number | null;
  postScore: number;
  preTierLabel: string | null;
  postTierLabel: string;
}): string {
  const { delta, postScore, preTierLabel, postTierLabel } = args;

  const deltaLine =
    delta !== null && delta > 0
      ? `Twelve weeks ago I scored on the AiBI-Foundation readiness assessment. I retook it today. My score moved ${delta} points — from ${preTierLabel} to ${postTierLabel}.`
      : `I just completed the AiBI-Foundation course at The AI Banking Institute. My current readiness tier is ${postTierLabel} — score ${postScore} of 48.`;

  return [
    deltaLine,
    '',
    'What actually changed: I now have a small library of saved prompts I run on Monday-morning work — exception report drafting, deposit-trend summaries, examiner-prep questions. Each one strips identifiers before it leaves the bank, and each one gets reviewed before it leaves my desk.',
    '',
    'For my peers in community banking — the course was built for our shape of work. SR 11-7 thinking, Reg B awareness, no vendor lock-in.',
    '',
    '#CommunityBanking #AIGovernance #AiBI',
  ].join('\n');
}

const kicker: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

export function ShareDelta({
  preScore,
  postScore,
  preTierLabel,
  postTierLabel,
}: ShareDeltaProps) {
  const delta = preScore !== null ? postScore - preScore : null;
  const initial = useMemo(
    () => buildDraft({ delta, postScore, preTierLabel, postTierLabel }),
    [delta, postScore, preTierLabel, postTierLabel],
  );

  const [draft, setDraft] = useState<string>(initial);
  const [copied, setCopied] = useState<boolean>(false);

  const copy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    });
  }, [draft]);

  return (
    <section
      aria-labelledby="share-delta-heading"
      style={{
        marginTop: 32,
        border: '1px solid var(--ink-a10)',
        borderRadius: 24,
        background: 'var(--cream-2)',
        padding: '22px clamp(20px, 3vw, 28px)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p style={{ ...kicker, marginBottom: 8 }}>Share what changed</p>
      <h2
        id="share-delta-heading"
        style={{
          fontWeight: 700,
          fontSize: '1.375rem',
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 8px',
        }}
      >
        A draft LinkedIn post, written from your delta
      </h2>
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--slate-600)',
          lineHeight: 1.6,
          margin: '0 0 16px',
        }}
      >
        Edit anything you want. Copy when it sounds like you.
      </p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="Draft LinkedIn post"
        rows={12}
        style={{
          width: '100%',
          minHeight: 260,
          background: 'var(--cream)',
          border: '1px solid var(--ink-a10)',
          borderRadius: 16,
          padding: '16px 18px',
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'var(--ink)',
          resize: 'vertical',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 14,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={copy}
          style={{
            padding: '12px 22px',
            background: 'var(--ink)',
            color: 'var(--cream-2)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? 'COPIED' : 'COPY TO CLIPBOARD'}
        </button>
        <span
          aria-live="polite"
          style={{
            fontSize: '0.8125rem',
            color: copied ? 'var(--emerald-700)' : 'var(--slate-500)',
          }}
        >
          {copied
            ? 'Draft copied. Paste it into LinkedIn.'
            : 'Banker-appropriate by default — no exclamation points, no hype.'}
        </span>
      </div>
    </section>
  );
}
