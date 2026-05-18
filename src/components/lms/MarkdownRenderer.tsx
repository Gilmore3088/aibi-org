// MarkdownRenderer — lightweight Markdown-to-HTML for course content
// Server Component: no client JS needed
// Handles: paragraphs, **bold**, *italic*, - lists, ### headings, `code`

interface MarkdownRendererProps {
  readonly content: string;
  readonly className?: string;
}

function parseInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.85em] bg-[color:var(--color-parch-dark)] px-1 py-0.5 rounded-sm">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="font-serif italic">$1</em>');
}

function renderBlock(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';

  // Blockquote: > text (styled as pull-quote card)
  if (trimmed.startsWith('> ')) {
    const quoteLines = trimmed.split('\n').map((l) => l.replace(/^>\s?/, '').trim());
    const quoteHtml = quoteLines.map((l) => parseInline(l)).join('<br/>');
    return `<blockquote class="my-6 border-l-[3px] border-[color:var(--color-terra)] bg-[color:var(--color-parch)] px-6 py-5 rounded-r-[2px]"><p class="font-serif italic text-base text-[color:var(--color-ink)] leading-relaxed">${quoteHtml}</p></blockquote>`;
  }

  // Heading: ### Heading Text
  if (trimmed.startsWith('### ')) {
    const text = parseInline(trimmed.slice(4));
    return `<h3 class="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-3 mt-8">${text}</h3>`;
  }

  // Heading: ## Heading Text
  if (trimmed.startsWith('## ')) {
    const text = parseInline(trimmed.slice(3));
    return `<h2 class="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-3 mt-8">${text}</h2>`;
  }

  const lines = trimmed.split('\n');

  // Numbered list: lines starting with "1. ", "2. ", etc.
  if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
    const items = lines
      .map((l) => `<li class="mb-2 pl-1">${parseInline(l.trim().replace(/^\d+\.\s/, ''))}</li>`)
      .join('');
    return `<ol class="list-decimal pl-5 mb-5 text-[color:var(--color-ink)] space-y-1">${items}</ol>`;
  }

  // Unordered list block: lines starting with "- "
  if (lines.every((l) => l.trim().startsWith('- '))) {
    const items = lines
      .map((l) => `<li class="mb-2 pl-1">${parseInline(l.trim().slice(2))}</li>`)
      .join('');
    return `<ul class="list-disc pl-5 mb-5 text-[color:var(--color-ink)] space-y-1">${items}</ul>`;
  }

  // Mixed block: some lines may be list items, some prose
  const hasList = lines.some((l) => l.trim().startsWith('- ') || /^\d+\.\s/.test(l.trim()));
  if (hasList) {
    const parts: string[] = [];
    let listItems: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';

    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('- ') || /^\d+\.\s/.test(t)) {
        const isOrdered = /^\d+\.\s/.test(t);
        listType = isOrdered ? 'ol' : 'ul';
        const text = isOrdered ? t.replace(/^\d+\.\s/, '') : t.slice(2);
        listItems.push(`<li class="mb-2 pl-1">${parseInline(text)}</li>`);
      } else {
        if (listItems.length > 0) {
          const listClass = listType === 'ol' ? 'list-decimal' : 'list-disc';
          parts.push(`<${listType} class="${listClass} pl-5 mb-5 text-[color:var(--color-ink)] space-y-1">${listItems.join('')}</${listType}>`);
          listItems = [];
        }
        if (t) {
          // Bold-only line as a visual subheader
          if (/^\*\*[^*]+\*\*:?$/.test(t)) {
            parts.push(`<p class="mb-2 mt-6 font-serif text-lg font-semibold text-[color:var(--color-ink)]">${parseInline(t)}</p>`);
          } else {
            parts.push(`<p class="mb-4 text-[color:var(--color-ink)] leading-relaxed">${parseInline(t)}</p>`);
          }
        }
      }
    }
    if (listItems.length > 0) {
      const listClass = listType === 'ol' ? 'list-decimal' : 'list-disc';
      parts.push(`<${listType} class="${listClass} pl-5 mb-5 text-[color:var(--color-ink)] space-y-1">${listItems.join('')}</${listType}>`);
    }
    return parts.join('');
  }

  // Bold-only paragraph as visual subheader (e.g., "**Why this matters:**")
  const singleLine = lines.map((l) => l.trim()).join(' ');
  if (/^\*\*[^*]+\*\*:?$/.test(singleLine)) {
    return `<p class="mb-2 mt-6 font-serif text-lg font-semibold text-[color:var(--color-ink)]">${parseInline(singleLine)}</p>`;
  }

  // Default: paragraph
  return `<p class="mb-4 text-[color:var(--color-ink)] leading-relaxed">${parseInline(singleLine)}</p>`;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = content.split(/\n\n+/);
  const html = blocks.map(renderBlock).join('');

  return (
    <div
      className={`prose-aibi text-sm leading-relaxed text-[color:var(--color-ink)] ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
