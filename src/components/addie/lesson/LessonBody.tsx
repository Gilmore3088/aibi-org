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

type Block =
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string };

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
    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2).trim());
        i++;
      }
      out.push({ kind: 'quote', text: buf.join(' ') });
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
    case 'h3':
      return (
        <h3
          key={key}
          className="font-serif text-[1.375rem] leading-tight text-[var(--ledger-ink)] mt-8 mb-3"
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
