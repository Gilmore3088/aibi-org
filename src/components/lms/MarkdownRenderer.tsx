// MarkdownRenderer — lightweight Markdown for course content.
// Server Component: no client JS needed.
// Handles: paragraphs, **bold**, *italic*, `code`, > blockquotes,
// ## / ### headings, and ordered/unordered (incl. mixed) lists.
//
// Renders to React elements (NOT an HTML string) so no untrusted markup can
// ever reach the DOM — this replaced an earlier dangerouslySetInnerHTML
// implementation. The tag/class output is intentionally identical to that
// version so course pages render unchanged.

import { Fragment, type ReactNode } from 'react';

interface MarkdownRendererProps {
  readonly content: string;
  readonly className?: string;
}

// Tokenize inline markup into React nodes: `code`, **bold**, *italic*.
// Earliest match wins; bold/italic content is parsed recursively so nested
// inline markup still renders. Code spans are literal.
const INLINE_RE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/;

function parseInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_RE.exec(rest)) !== null) {
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const key = `${keyPrefix}-${k++}`;
    if (m[1] !== undefined) {
      nodes.push(
        <code
          key={key}
          className="font-mono text-[0.85em] bg-[color:var(--cream-2)] px-1 py-0.5 rounded-sm"
        >
          {m[1]}
        </code>,
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {parseInline(m[2], key)}
        </strong>,
      );
    } else {
      nodes.push(
        <em key={key} className="font-serif italic">
          {parseInline(m[3] as string, key)}
        </em>,
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) nodes.push(rest);
  return nodes;
}

function renderBlock(block: string, key: string): ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // Blockquote: > text (styled as pull-quote card)
  if (trimmed.startsWith('> ')) {
    const quoteLines = trimmed.split('\n').map((l) => l.replace(/^>\s?/, '').trim());
    return (
      <blockquote
        key={key}
        className="my-6 border-l-[3px] border-[color:var(--gold)] bg-[color:#FFFFFF] px-6 py-5 rounded-r-[2px]"
      >
        <p className="font-serif italic text-base text-[color:var(--ink)] leading-relaxed">
          {quoteLines.flatMap((l, i) => [
            ...(i > 0 ? [<br key={`br-${i}`} />] : []),
            ...parseInline(l, `${key}-q${i}`),
          ])}
        </p>
      </blockquote>
    );
  }

  // Heading: ### Heading Text
  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={key} className="font-serif text-xl font-bold text-[color:var(--ink)] mb-3 mt-8">
        {parseInline(trimmed.slice(4), key)}
      </h3>
    );
  }

  // Heading: ## Heading Text
  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={key} className="font-serif text-2xl font-bold text-[color:var(--ink)] mb-3 mt-8">
        {parseInline(trimmed.slice(3), key)}
      </h2>
    );
  }

  const lines = trimmed.split('\n');

  // Numbered list: every line "1. ", "2. ", etc.
  if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
    return (
      <ol key={key} className="list-decimal pl-5 mb-5 text-[color:var(--ink)] space-y-1">
        {lines.map((l, i) => (
          <li key={`${key}-li${i}`} className="mb-2 pl-1">
            {parseInline(l.trim().replace(/^\d+\.\s/, ''), `${key}-li${i}`)}
          </li>
        ))}
      </ol>
    );
  }

  // Unordered list: every line "- "
  if (lines.every((l) => l.trim().startsWith('- '))) {
    return (
      <ul key={key} className="list-disc pl-5 mb-5 text-[color:var(--ink)] space-y-1">
        {lines.map((l, i) => (
          <li key={`${key}-li${i}`} className="mb-2 pl-1">
            {parseInline(l.trim().slice(2), `${key}-li${i}`)}
          </li>
        ))}
      </ul>
    );
  }

  // Mixed block: some lines list items, some prose.
  const hasList = lines.some((l) => l.trim().startsWith('- ') || /^\d+\.\s/.test(l.trim()));
  if (hasList) {
    const parts: ReactNode[] = [];
    let listItems: ReactNode[] = [];
    let listType: 'ul' | 'ol' = 'ul';
    let seg = 0;

    const flush = () => {
      if (listItems.length === 0) return;
      const ListTag = listType;
      const listClass = listType === 'ol' ? 'list-decimal' : 'list-disc';
      parts.push(
        <ListTag
          key={`${key}-l${seg++}`}
          className={`${listClass} pl-5 mb-5 text-[color:var(--ink)] space-y-1`}
        >
          {listItems}
        </ListTag>,
      );
      listItems = [];
    };

    lines.forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('- ') || /^\d+\.\s/.test(t)) {
        const isOrdered = /^\d+\.\s/.test(t);
        listType = isOrdered ? 'ol' : 'ul';
        const text = isOrdered ? t.replace(/^\d+\.\s/, '') : t.slice(2);
        listItems.push(
          <li key={`${key}-li${i}`} className="mb-2 pl-1">
            {parseInline(text, `${key}-li${i}`)}
          </li>,
        );
      } else {
        flush();
        if (t) {
          if (/^\*\*[^*]+\*\*:?$/.test(t)) {
            parts.push(
              <p key={`${key}-p${i}`} className="mb-2 mt-6 font-serif text-lg font-semibold text-[color:var(--ink)]">
                {parseInline(t, `${key}-p${i}`)}
              </p>,
            );
          } else {
            parts.push(
              <p key={`${key}-p${i}`} className="mb-4 text-[color:var(--ink)] leading-relaxed">
                {parseInline(t, `${key}-p${i}`)}
              </p>,
            );
          }
        }
      }
    });
    flush();
    return <Fragment key={key}>{parts}</Fragment>;
  }

  // Bold-only paragraph as visual subheader (e.g., "**Why this matters:**")
  const singleLine = lines.map((l) => l.trim()).join(' ');
  if (/^\*\*[^*]+\*\*:?$/.test(singleLine)) {
    return (
      <p key={key} className="mb-2 mt-6 font-serif text-lg font-semibold text-[color:var(--ink)]">
        {parseInline(singleLine, key)}
      </p>
    );
  }

  // Default: paragraph
  return (
    <p key={key} className="mb-4 text-[color:var(--ink)] leading-relaxed">
      {parseInline(singleLine, key)}
    </p>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = content.split(/\n\n+/);
  return (
    <div
      className={`prose-aibi text-base leading-relaxed text-[color:var(--ink)] ${className ?? ''}`}
      style={{ maxWidth: '72ch' }}
    >
      {blocks.map((block, i) => renderBlock(block, `b${i}`))}
    </div>
  );
}
