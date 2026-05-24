// LessonBody — dependency-free markdown renderer for the lesson body
// shape used in addie.lessons.body_md / addie.lesson_track_variants.body_md.
//
// Why not react-markdown? Two reasons: (1) keeps the dep tree narrow on
// the course surface, (2) the lesson body is a small, well-defined
// subset of markdown so a 100-LOC renderer beats pulling in the unified
// ecosystem for this surface. If the body shape grows, swap to
// react-markdown — the API of this component (just `body`) stays stable.
//
// Supported:
//   - ### Heading 3 (single-line)
//   - paragraphs (blank-line separated)
//   - **bold** inline
//   - *emphasis* inline → rendered as bold (italics retired site-wide)
//   - `inline code`
//   - - bullet · or 1. numbered lists (single-level)
//   - > blockquote (single paragraph)
//
// Out of scope: tables, nested lists, fenced code blocks, link auto-link.
// Markdown links [text](url) are rendered as anchors.

import type { ReactNode } from 'react';

interface LessonBodyProps {
  readonly body: string;
}

export function LessonBody({ body }: LessonBodyProps) {
  if (!body) return null;
  const blocks = splitBlocks(body.trim());
  return (
    <article className="prose-lesson max-w-prose font-serif text-[var(--ledger-ink)] text-[1.0625rem] leading-[1.7]">
      {blocks.map((b, i) => renderBlock(b, i))}
    </article>
  );
}

// --- Block split ----------------------------------------------------

type CalloutKind = 'tip' | 'warn' | 'save' | 'field';

type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'callout'; tone: CalloutKind; lines: string[] };

const CALLOUT_RE = /^>\s*\[(tip|warn|save|field)\]\s*(.*)$/i;
const CALLOUT_META: Record<CalloutKind, { label: string; border: string; bg: string }> = {
  tip:   { label: 'Try this',     border: 'border-[var(--ledger-accent)]',     bg: 'bg-[color-mix(in_srgb,var(--ledger-accent)_5%,var(--ledger-paper))]' },
  warn:  { label: 'Watch out',    border: 'border-[var(--ledger-weak)]',       bg: 'bg-[color-mix(in_srgb,var(--ledger-weak)_5%,var(--ledger-paper))]' },
  save:  { label: 'Save this',    border: 'border-[var(--ledger-ink)]',        bg: 'bg-[var(--ledger-tape)]' },
  field: { label: 'From the field', border: 'border-[var(--ledger-accent-2)]', bg: 'bg-[color-mix(in_srgb,var(--ledger-accent-2)_4%,var(--ledger-paper))]' },
};

function splitBlocks(src: string): Block[] {
  const lines = src.split(/\n/);
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      out.push({ kind: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      // Some seed bodies use `## SCRIPT (verbatim)` and similar production
      // markers. Strip the parenthetical noise but keep the heading.
      const raw = line.slice(3).trim();
      const cleaned = raw.replace(/\s*\(verbatim\)\s*$/i, '');
      out.push({ kind: 'h2', text: cleaned });
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      // h1 demoted to h2 in lesson body — H1 belongs to the lesson title.
      out.push({ kind: 'h2', text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('>')) {
      // Capture the full blockquote (every consecutive '>' line).
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        const stripped = lines[i].replace(/^>\s?/, '');
        buf.push(stripped);
        i++;
      }
      // Callout detection: first line matches '> [kind] body'.
      const m = CALLOUT_RE.exec(`> ${buf[0]}`);
      if (m) {
        const tone = m[1].toLowerCase() as CalloutKind;
        const firstBody = m[2];
        const lines2: string[] = firstBody ? [firstBody] : [];
        for (let k = 1; k < buf.length; k++) lines2.push(buf[k]);
        out.push({ kind: 'callout', tone, lines: lines2 });
      } else {
        out.push({ kind: 'quote', text: buf.join(' ').trim() });
      }
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'ul', items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, '').trim());
        i++;
      }
      out.push({ kind: 'ol', items });
      continue;
    }
    // Paragraph: gather until blank line or block marker
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('### ') &&
      !lines[i].startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push({ kind: 'p', text: buf.join(' ').trim() });
  }
  return out;
}

function renderBlock(b: Block, key: number): ReactNode {
  switch (b.kind) {
    case 'h2':
      return (
        <h2
          key={key}
          className="font-serif text-[1.625rem] leading-tight text-[var(--ledger-ink)] mt-12 mb-4 pb-2 border-b border-[var(--ledger-rule-strong)]"
        >
          {renderInline(b.text)}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={key}
          className="font-serif text-[1.375rem] leading-tight text-[var(--ledger-ink)] mt-10 mb-3 flex items-center gap-3 before:content-[''] before:h-px before:w-6 before:bg-[var(--ledger-accent)] before:shrink-0"
        >
          {renderInline(b.text)}
        </h3>
      );
    case 'p':
      return (
        <p key={key} className="mb-4">
          {renderInline(b.text)}
        </p>
      );
    case 'ul':
      return (
        <ul key={key} className="mb-4 pl-5 list-disc marker:text-[var(--ledger-accent)]">
          {b.items.map((it, j) => (
            <li key={j} className="mb-1.5">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="mb-4 pl-5 list-decimal marker:text-[var(--ledger-accent)] marker:font-mono">
          {b.items.map((it, j) => (
            <li key={j} className="mb-1.5">
              {renderInline(it)}
            </li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote
          key={key}
          className="my-6 border-l-2 border-[var(--ledger-accent)] pl-4 text-[var(--ledger-ink-2)]"
        >
          {renderInline(b.text)}
        </blockquote>
      );
    case 'callout': {
      const m = CALLOUT_META[b.tone];
      return (
        <aside
          key={key}
          className={`my-6 rounded-[4px] border-l-[3px] ${m.border} ${m.bg} px-4 py-3`}
        >
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)] mb-1.5">
            {m.label}
          </div>
          {b.lines.map((ln, j) => (
            <p key={j} className="text-[var(--ledger-ink)] mb-1.5 last:mb-0">
              {renderInline(ln)}
            </p>
          ))}
        </aside>
      );
    }
  }
}

// --- Inline ---------------------------------------------------------
// Tokeniser order: links, then bold, then emphasis-as-bold (italics
// retired), then inline code. Falls through to plain text.

function renderInline(src: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < src.length) {
    // Markdown link [text](url)
    const lm = src.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (lm) {
      tokens.push(
        <a
          key={key++}
          href={lm[2]}
          className="text-[var(--ledger-accent)] underline underline-offset-2 hover:text-[var(--ledger-ink)]"
          target={lm[2].startsWith('http') ? '_blank' : undefined}
          rel={lm[2].startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {lm[1]}
        </a>,
      );
      i += lm[0].length;
      continue;
    }
    // **bold**
    if (src[i] === '*' && src[i + 1] === '*') {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2) {
        tokens.push(
          <strong key={key++} className="font-semibold text-[var(--ledger-ink)]">
            {src.slice(i + 2, end)}
          </strong>,
        );
        i = end + 2;
        continue;
      }
    }
    // *emphasis* → rendered as bold (italics retired)
    if (src[i] === '*' && src[i + 1] !== '*' && src[i + 1] !== ' ') {
      const end = src.indexOf('*', i + 1);
      if (end > i + 1) {
        tokens.push(
          <strong key={key++} className="font-semibold text-[var(--ledger-ink)]">
            {src.slice(i + 1, end)}
          </strong>,
        );
        i = end + 1;
        continue;
      }
    }
    // `inline code`
    if (src[i] === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i + 1) {
        tokens.push(
          <code
            key={key++}
            className="font-mono text-[0.9em] bg-[var(--ledger-parch)] px-1.5 py-0.5 rounded-[2px] border border-[var(--ledger-rule)]"
          >
            {src.slice(i + 1, end)}
          </code>,
        );
        i = end + 1;
        continue;
      }
    }
    // Plain text up to next marker
    const next = src.slice(i).search(/[*`\[]/);
    if (next === -1) {
      tokens.push(src.slice(i));
      break;
    }
    if (next === 0) {
      tokens.push(src[i]);
      i++;
    } else {
      tokens.push(src.slice(i, i + next));
      i += next;
    }
  }
  return tokens;
}
