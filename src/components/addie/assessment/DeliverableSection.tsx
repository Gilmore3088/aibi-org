// DeliverableSection — generic markdown deliverable section for the
// In-Depth Readiness Briefing. Uses the same lightweight inline renderer
// the sandbox uses, scoped to the four assessment deliverables.

import type { ReactNode } from 'react';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

interface DeliverableSectionProps {
  readonly kicker: string;
  readonly title: string;
  readonly markdown: string | null | undefined;
  readonly emptyState?: ReactNode;
  readonly headingId?: string;
}

// Block-level markdown render. Intentionally limited: headings, paragraphs,
// unordered + ordered lists, blockquotes, and code fences. No tables or
// images — the four assessment deliverables don't need them.
function renderBlocks(md: string): ReactNode[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    // Fenced code blocks
    if (line.startsWith('```')) {
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1;
      out.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-[2px] border border-[var(--ledger-rule)] bg-[var(--ledger-parch)] p-3 font-mono text-xs text-[var(--ledger-ink)]"
        >
          <code>{buf.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Headings
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const sizes: Record<number, string> = {
        1: 'font-serif text-2xl text-[var(--ledger-ink)] mt-6',
        2: 'font-serif text-xl text-[var(--ledger-ink)] mt-6',
        3: 'font-serif text-lg text-[var(--ledger-ink)] mt-4',
        4: 'font-mono uppercase tracking-[0.16em] text-xs text-[var(--ledger-muted)] mt-4',
      };
      const cls = sizes[level] ?? sizes[3];
      if (level === 1) out.push(<h3 key={key++} className={cls}>{text}</h3>);
      else if (level === 2) out.push(<h4 key={key++} className={cls}>{text}</h4>);
      else if (level === 3) out.push(<h5 key={key++} className={cls}>{text}</h5>);
      else out.push(<h6 key={key++} className={cls}>{text}</h6>);
      i += 1;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2));
        i += 1;
      }
      out.push(
        <blockquote
          key={key++}
          className="border-l-2 border-[var(--ledger-accent)] pl-4 text-[var(--ledger-ink-2)]"
        >
          {buf.join(' ')}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^[-*]\s+/, ''));
        i += 1;
      }
      out.push(
        <ul key={key++} className="list-disc space-y-1 pl-6 text-[var(--ledger-ink)]">
          {buf.map((b, j) => <li key={j}>{renderInline(b)}</li>)}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      out.push(
        <ol key={key++} className="list-decimal space-y-1 pl-6 text-[var(--ledger-ink)]">
          {buf.map((b, j) => <li key={j}>{renderInline(b)}</li>)}
        </ol>,
      );
      continue;
    }

    // Paragraph — accumulate consecutive non-blank, non-special lines.
    const buf: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4}\s|>\s|[-*]\s|\d+\.\s|```)/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    out.push(
      <p key={key++} className="text-[var(--ledger-ink)] leading-relaxed">
        {renderInline(buf.join(' '))}
      </p>,
    );
  }

  return out;
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[4]) {
      parts.push(
        <code
          key={key++}
          className="rounded-[2px] bg-[var(--ledger-parch)] px-1 py-0.5 font-mono text-xs"
        >
          {match[4]}
        </code>,
      );
    } else if (match[5] && match[6]) {
      parts.push(
        <a
          key={key++}
          href={match[6]}
          className="text-[var(--ledger-accent)] underline underline-offset-2"
        >
          {match[5]}
        </a>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export function DeliverableSection({
  kicker,
  title,
  markdown,
  emptyState,
  headingId,
}: DeliverableSectionProps) {
  const trimmed = (markdown ?? '').trim();
  const computedHeadingId =
    headingId ?? `deliverable-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <section aria-labelledby={computedHeadingId} className="space-y-4">
      <header className="space-y-1">
        <KickerLabel tone="muted">{kicker}</KickerLabel>
        <h2
          id={computedHeadingId}
          className="font-serif text-2xl text-[var(--ledger-ink)]"
        >
          {title}
        </h2>
      </header>
      <div className="space-y-3">
        {trimmed.length > 0 ? renderBlocks(trimmed) : (
          <div className="rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-parch)] p-4 text-sm text-[var(--ledger-muted)]">
            {emptyState ?? 'This section was not generated for this attempt.'}
          </div>
        )}
      </div>
    </section>
  );
}
