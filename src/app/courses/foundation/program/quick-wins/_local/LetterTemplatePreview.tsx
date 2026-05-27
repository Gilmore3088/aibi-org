'use client';

// LetterTemplatePreview — the recommendation-letter template is the artifact
// each set of three quick wins produces. This component renders the actual
// shape of the template so the learner sees what they are building toward.
// Before three wins: shown as a faded preview with bracketed placeholders.
// At three+ wins: bracketed placeholders fill from the logged wins and a
// "copy to clipboard" action becomes the primary CTA.

import { useState, useMemo, useCallback } from 'react';
import type { CSSProperties } from 'react';

interface WinSummary {
  readonly description: string;
  readonly toolLabel: string;
  readonly department: string;
  readonly quarterlyHours: number;
}

interface LetterTemplatePreviewProps {
  readonly wins: readonly WinSummary[];
  readonly winsForLetter: number;
  readonly totalQuarterlyHours: number;
}

const kicker: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-soft)',
  margin: 0,
};

const linedPaper: CSSProperties = {
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: '22px clamp(20px, 3vw, 28px)',
  fontSize: 14,
  lineHeight: 1.7,
  color: 'var(--ink)',
};

function placeholder(text: string): string {
  return `[${text}]`;
}

function buildLetter(
  wins: readonly WinSummary[],
  totalQuarterlyHours: number,
): string {
  const dept = wins[0]?.department ?? placeholder('department');
  const totalHrs = totalQuarterlyHours > 0
    ? totalQuarterlyHours.toFixed(1)
    : placeholder('quarterly hours saved');

  const bullets = wins.length === 0
    ? [
        `- ${placeholder('Win 1 — what you automated')} (${placeholder('tool')}, ${placeholder('hours / quarter')})`,
        `- ${placeholder('Win 2 — what you automated')} (${placeholder('tool')}, ${placeholder('hours / quarter')})`,
        `- ${placeholder('Win 3 — what you automated')} (${placeholder('tool')}, ${placeholder('hours / quarter')})`,
      ]
    : wins.slice(0, 3).map(
        (w) =>
          `- ${w.description} (${w.toolLabel}, ${w.quarterlyHours.toFixed(1)} hrs/quarter)`,
      );

  return [
    `To Whom It May Concern,`,
    '',
    `It is my pleasure to recommend ${placeholder('Your name')} for ` +
      `${placeholder('role / opportunity')}. Over the last quarter in our ${dept} ` +
      `team, ${placeholder('Your name')} built and deployed a set of small, ` +
      `repeatable AI-assisted workflows that have changed the throughput of our group.`,
    '',
    `Specifically:`,
    ...bullets,
    '',
    `Together, these workflows have returned roughly ${totalHrs} hours per quarter ` +
      `to the team — time that has been redirected to ${placeholder('higher-value work, e.g. examiner prep, member calls')}.`,
    '',
    `Each workflow was completed against AiBI-Foundation guardrails: ` +
      `identifiers stripped before any prompt left the bank, human review on every ` +
      `output before it was used, and a repeatable saved prompt that a colleague ` +
      `can run next week.`,
    '',
    `${placeholder('Your name')} earned the AiBI-Foundation credential from The AI ` +
      `Banking Institute and has applied that training carefully and consistently.`,
    '',
    `I recommend ${placeholder('Your name')} without reservation.`,
    '',
    placeholder("Manager's name"),
    placeholder('Title'),
    placeholder('Bank or credit union'),
  ].join('\n');
}

export function LetterTemplatePreview({
  wins,
  winsForLetter,
  totalQuarterlyHours,
}: LetterTemplatePreviewProps) {
  const winsToGo = Math.max(0, winsForLetter - wins.length);
  const ready = winsToGo === 0;

  const draft = useMemo(
    () => buildLetter(wins, totalQuarterlyHours),
    [wins, totalQuarterlyHours],
  );

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
      aria-labelledby="letter-template-heading"
      style={{
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        borderRadius: 28,
        padding: '28px clamp(22px, 4vw, 36px)',
        boxShadow: 'var(--shadow-hero)',
        marginBottom: 40,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 14,
        }}
      >
        <span style={kicker}>The artifact · Recommendation letter</span>
        <span
          aria-hidden="true"
          style={{ flex: 1, height: 1, background: 'rgba(230, 211, 155, 0.18)' }}
        />
      </div>

      <h1
        id="letter-template-heading"
        style={{
          fontWeight: 700,
          fontSize: 'clamp(28px, 3.8vw, 40px)',
          lineHeight: 1.08,
          letterSpacing: '-0.024em',
          margin: '0 0 12px',
          color: 'var(--cream-2)',
        }}
      >
        Three logged wins {'='} a recommendation-letter template you can show your manager.
      </h1>

      <p
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: 'var(--gold-soft)',
          margin: '0 0 22px',
          maxWidth: '64ch',
        }}
      >
        {ready
          ? `You have logged ${wins.length} wins. The template below is filled with your work — edit the bracketed pieces and pass it to your manager.`
          : `Log ${winsToGo} more ${winsToGo === 1 ? 'win' : 'wins'} and the template below fills with your work. Until then, this is the shape you are building toward.`}
      </p>

      <div
        style={{
          ...linedPaper,
          opacity: ready ? 1 : 0.78,
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: 'inherit',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontSize: 13.5,
            lineHeight: 1.65,
            color: 'var(--ink)',
          }}
        >
          {draft}
        </pre>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 20,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={copy}
          disabled={!ready}
          style={{
            padding: '12px 22px',
            background: ready ? 'var(--gold)' : 'transparent',
            color: ready ? 'var(--ink)' : 'var(--gold-soft)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            borderRadius: 12,
            border: ready ? 'none' : '1px solid var(--gold-soft)',
            cursor: ready ? 'pointer' : 'not-allowed',
            opacity: ready ? 1 : 0.6,
          }}
        >
          {ready
            ? copied
              ? 'COPIED'
              : 'COPY THE LETTER'
            : `${winsToGo} more ${winsToGo === 1 ? 'win' : 'wins'} to go`}
        </button>
        <span
          aria-live="polite"
          style={{
            fontSize: 12,
            color: 'var(--gold-soft)',
            letterSpacing: '0.04em',
          }}
        >
          {ready && copied
            ? 'Copied. Paste into your editor and edit the bracketed pieces.'
            : 'Bracketed placeholders are the parts you fill in yourself.'}
        </span>
      </div>
    </section>
  );
}
