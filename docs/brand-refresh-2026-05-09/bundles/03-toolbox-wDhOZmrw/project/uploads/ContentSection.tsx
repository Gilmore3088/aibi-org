// ContentSection — renders a single content section with optional subsections
// Server Component

import type { Section } from '@content/courses/aibi-p';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ContentSectionProps {
  readonly section: Section;
  readonly level?: 2 | 3;
}

export function ContentSection({ section, level = 2 }: ContentSectionProps) {
  const HeadingTag = level === 2 ? 'h2' : 'h3';
  const headingClass =
    level === 2
      ? 'font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-4'
      : 'font-serif text-xl font-bold text-[color:var(--color-ink)] mb-3';

  return (
    <section id={section.id} className="mb-16 scroll-mt-8">
      <HeadingTag className={headingClass}>
        {section.title}
      </HeadingTag>

      <MarkdownRenderer content={section.content} />

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-8 pl-0 border-l-2 border-[color:var(--color-parch-dark)] space-y-8">
          {section.subsections.map((sub) => (
            <div key={sub.id} className="pl-6">
              <ContentSection section={sub} level={3} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
