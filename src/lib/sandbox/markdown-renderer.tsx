/**
 * Lightweight inline markdown renderer for the AI Practice Sandbox.
 *
 * Handles: headings, bold, italic, inline code, fenced code blocks,
 * unordered/ordered lists, and pipe tables. Numeric table cells get
 * font-mono tabular-nums styling per the design system.
 *
 * No external dependencies. React-only.
 */

import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Inline text processing (bold, italic, code)
// ---------------------------------------------------------------------------

export function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)|(\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={parts.length} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[4]) {
      parts.push(
        <code
          key={parts.length}
          className="rounded-[2px] bg-[color:var(--color-parch)] px-1 py-0.5 font-mono text-xs"
        >
          {match[4]}
        </code>,
      );
    } else if (match[6]) {
      parts.push(
        <em key={parts.length} className="font-serif italic">
          {match[6]}
        </em>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// ---------------------------------------------------------------------------
// Block-level markdown rendering
// ---------------------------------------------------------------------------

export function renderMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(
        <pre
          key={nodes.length}
          className="my-2 overflow-x-auto rounded-[2px] bg-[color:var(--color-parch)] p-3 text-xs font-mono"
        >
          {lang && (
            <span className="mb-1 block text-[9px] uppercase tracking-[1.2px] text-[color:var(--color-slate)]">
              {lang}
            </span>
          )}
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    // Table detection
    if (line.includes('|') && i + 1 < lines.length && /^\|[\s-:|]+\|$/.test(lines[i + 1].trim())) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const headerCells = tableLines[0]
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      const bodyRows = tableLines.slice(2).map((r) =>
        r
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean),
      );
      nodes.push(
        <div key={nodes.length} className="my-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headerCells.map((cell, ci) => (
                  <th
                    key={ci}
                    className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-2 py-1 text-left font-sans text-xs font-semibold"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const isNumeric = /^\d[\d.,]*%?$/.test(cell.trim());
                    return (
                      <td
                        key={ci}
                        className={`border border-[color:var(--color-ink)]/10 px-2 py-1 text-xs ${
                          isNumeric ? 'font-mono tabular-nums' : 'font-sans'
                        }`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const sizes = ['text-lg', 'text-base', 'text-sm', 'text-sm'] as const;
      nodes.push(
        <p
          key={nodes.length}
          className={`${sizes[level - 1]} font-serif font-semibold text-[color:var(--color-ink)] mt-3 mb-1`}
        >
          {renderInline(content)}
        </p>,
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      nodes.push(
        <ul key={nodes.length} className="my-1 ml-4 list-disc space-y-0.5 text-sm font-sans">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      nodes.push(
        <ol key={nodes.length} className="my-1 ml-4 list-decimal space-y-0.5 text-sm font-sans">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    nodes.push(
      <p key={nodes.length} className="my-1 text-sm font-sans leading-relaxed">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return nodes;
}
