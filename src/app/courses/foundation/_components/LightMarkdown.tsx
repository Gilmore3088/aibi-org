// LightMarkdown — minimal Markdown renderer for module section content.
// Supports: paragraphs, **bold**, *italic*, `code`, > blockquotes,
// numbered + bulleted lists, simple pipe tables. Deliberately small —
// the typed module content is authored, not user-generated, so the
// surface area can stay minimal. No external dependency.
//
// If module content ever grows beyond this set (links, footnotes, code
// blocks), swap this for `react-markdown` + `remark-gfm` here only.

import { Fragment } from 'react';

interface LightMarkdownProps {
  readonly source: string;
}

const INLINE_BOLD = /\*\*([^*]+)\*\*/g;
const INLINE_ITALIC = /\*([^*]+)\*/g;
const INLINE_CODE = /`([^`]+)`/g;

function renderInline(text: string): React.ReactNode {
  // Apply bold first, then italic, then inline code. Returned as React fragments.
  // Implementation uses a two-pass split-and-map for clarity over performance.
  const tokens: Array<{ type: 'text' | 'b' | 'i' | 'code'; value: string }> = [
    { type: 'text', value: text },
  ];

  function expand(re: RegExp, kind: 'b' | 'i' | 'code') {
    const out: typeof tokens = [];
    for (const t of tokens) {
      if (t.type !== 'text') {
        out.push(t);
        continue;
      }
      let last = 0;
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(t.value)) !== null) {
        if (m.index > last) out.push({ type: 'text', value: t.value.slice(last, m.index) });
        out.push({ type: kind, value: m[1] });
        last = m.index + m[0].length;
      }
      if (last < t.value.length) out.push({ type: 'text', value: t.value.slice(last) });
    }
    tokens.length = 0;
    tokens.push(...out);
  }

  expand(INLINE_BOLD, 'b');
  expand(INLINE_ITALIC, 'i');
  expand(INLINE_CODE, 'code');

  return tokens.map((t, i) => {
    if (t.type === 'text') return <Fragment key={i}>{t.value}</Fragment>;
    if (t.type === 'b') return <strong key={i}>{t.value}</strong>;
    if (t.type === 'i') return <em key={i}>{t.value}</em>;
    return <code key={i} className="font-mono text-[0.9em]">{t.value}</code>;
  });
}

interface Block {
  readonly type:
    | 'paragraph'
    | 'blockquote'
    | 'ul'
    | 'ol'
    | 'table'
    | 'spacer';
  readonly lines: readonly string[];
}

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        buf.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'blockquote', lines: buf });
      continue;
    }
    if (/^[-*] /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        buf.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      blocks.push({ type: 'ul', lines: buf });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        buf.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      blocks.push({ type: 'ol', lines: buf });
      continue;
    }
    if (line.startsWith('|') && i + 1 < lines.length && /^\|[\s|:-]+\|/.test(lines[i + 1])) {
      const buf: string[] = [line];
      i++;
      // skip alignment row
      i++;
      while (i < lines.length && lines[i].startsWith('|')) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'table', lines: buf });
      continue;
    }
    // Paragraph: collect adjacent non-empty lines
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('> ') && !/^[-*] /.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !lines[i].startsWith('|')) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', lines: buf });
  }
  return blocks;
}

function splitRow(row: string): string[] {
  return row.split('|').slice(1, -1).map((c) => c.trim());
}

export function LightMarkdown({ source }: LightMarkdownProps) {
  const blocks = parse(source);
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'paragraph') {
          return (
            <p key={i} className="text-[color:var(--color-ink)] leading-relaxed">
              {renderInline(b.lines.join(' '))}
            </p>
          );
        }
        if (b.type === 'blockquote') {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-[color:var(--color-terra)] pl-4 italic text-[color:var(--color-muted,#5b5346)]"
            >
              {renderInline(b.lines.join(' '))}
            </blockquote>
          );
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc pl-6 space-y-1 text-[color:var(--color-ink)]">
              {b.lines.map((l, j) => <li key={j}>{renderInline(l)}</li>)}
            </ul>
          );
        }
        if (b.type === 'ol') {
          return (
            <ol key={i} className="list-decimal pl-6 space-y-1 text-[color:var(--color-ink)]">
              {b.lines.map((l, j) => <li key={j}>{renderInline(l)}</li>)}
            </ol>
          );
        }
        if (b.type === 'table') {
          const headerCells = splitRow(b.lines[0]);
          const bodyRows = b.lines.slice(1).map(splitRow);
          return (
            <div key={i} className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {headerCells.map((h, j) => (
                      <th
                        key={j}
                        className="text-left font-display font-medium text-[13px] tracking-wide bg-[color:var(--color-parch)] border-b border-[color:var(--color-rule,#d8cfbe)] py-2 px-3"
                      >
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((r, j) => (
                    <tr key={j} className="border-b border-[color:var(--color-rule,#d8cfbe)]">
                      {r.map((c, k) => (
                        <td key={k} className="py-2 px-3 align-top text-[color:var(--color-ink)]">
                          {renderInline(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
