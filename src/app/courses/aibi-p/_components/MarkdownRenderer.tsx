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
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
}

function renderBlock(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';

  // Heading: ### Heading Text
  if (trimmed.startsWith('### ')) {
    const text = parseInline(trimmed.slice(4));
    return `<h3 class="font-serif text-xl font-bold text-[color:var(--color-ink)] mb-3 mt-6">${text}</h3>`;
  }

  // Heading: ## Heading Text
  if (trimmed.startsWith('## ')) {
    const text = parseInline(trimmed.slice(3));
    return `<h2 class="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-3 mt-6">${text}</h2>`;
  }

  // List block: lines starting with "- "
  const lines = trimmed.split('\n');
  if (lines.every((l) => l.trim().startsWith('- '))) {
    const items = lines
      .map((l) => `<li class="mb-1">${parseInline(l.trim().slice(2))}</li>`)
      .join('');
    return `<ul class="list-disc pl-5 mb-4 text-[color:var(--color-ink)]">${items}</ul>`;
  }

  // Mixed block: some lines may be list items, some prose
  const hasList = lines.some((l) => l.trim().startsWith('- '));
  if (hasList) {
    const parts: string[] = [];
    let listItems: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('- ')) {
        listItems.push(`<li class="mb-1">${parseInline(line.trim().slice(2))}</li>`);
      } else {
        if (listItems.length > 0) {
          parts.push(`<ul class="list-disc pl-5 mb-4 text-[color:var(--color-ink)]">${listItems.join('')}</ul>`);
          listItems = [];
        }
        if (line.trim()) {
          parts.push(`<p class="mb-4 text-[color:var(--color-ink)] leading-relaxed text-sm">${parseInline(line.trim())}</p>`);
        }
      }
    }
    if (listItems.length > 0) {
      parts.push(`<ul class="list-disc pl-5 mb-4 text-[color:var(--color-ink)]">${listItems.join('')}</ul>`);
    }
    return parts.join('');
  }

  // Default: paragraph
  const singleLine = lines.map((l) => l.trim()).join(' ');
  return `<p class="mb-4 text-[color:var(--color-ink)] leading-relaxed text-sm">${parseInline(singleLine)}</p>`;
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
