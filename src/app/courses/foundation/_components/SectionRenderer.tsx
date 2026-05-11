// SectionRenderer — renders a typed Section's markdown content + tryThis prompt.
// Phase 4 scaffolding. Intentionally minimal: light markdown rendering only
// (headings, paragraphs, bold, italics, lists, tables). No JS-side markdown
// engine to avoid bundle bloat for what is mostly typed prose.

import type { Section } from '@content/courses/aibi-foundation';
import { LightMarkdown } from './LightMarkdown';

interface SectionRendererProps {
  readonly section: Section;
  readonly index: number;
}

export function SectionRenderer({ section, index }: SectionRendererProps) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-heading`}
      className="mb-10"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-2">
        Section {String(index + 1).padStart(2, '0')}
      </p>
      <h2
        id={`${section.id}-heading`}
        className="font-display text-2xl text-[color:var(--color-ink)] mb-4"
      >
        {section.title}
      </h2>
      <div className="prose-banking">
        <LightMarkdown source={section.content} />
      </div>
      {section.tryThis && (
        <aside className="mt-5 bg-[color:var(--color-parch)] border-l-2 border-[color:var(--color-terra)] py-3 px-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-terra)] mb-1">
            Try this
          </p>
          <p className="text-[color:var(--color-ink)] leading-relaxed">
            {section.tryThis}
          </p>
        </aside>
      )}
    </section>
  );
}
