// ContentSection — renders a single content section with optional subsections.
// Server Component. Mockup chrome: ink headings, slate subsection rule.

import type { Section } from '@content/courses/foundation-program';
import { MarkdownRenderer } from '@/components/lms/MarkdownRenderer';

interface ContentSectionProps {
  readonly section: Section;
  readonly level?: 2 | 3;
}

export function ContentSection({ section, level = 2 }: ContentSectionProps) {
  const HeadingTag = level === 2 ? 'h2' : 'h3';
  const headingStyle: React.CSSProperties =
    level === 2
      ? {
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 18px',
          lineHeight: 1.2,
        }
      : {
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          margin: '0 0 14px',
          lineHeight: 1.3,
        };

  return (
    <section id={section.id} style={{ marginBottom: 64, scrollMarginTop: 32 }}>
      <HeadingTag style={headingStyle}>{section.title}</HeadingTag>

      <MarkdownRenderer content={section.content} />

      {section.subsections && section.subsections.length > 0 && (
        <div
          style={{
            marginTop: 32,
            borderLeft: '2px solid var(--ink-a10)',
            display: 'grid',
            gap: 32,
          }}
        >
          {section.subsections.map((sub) => (
            <div key={sub.id} style={{ paddingLeft: 24 }}>
              <ContentSection section={sub} level={3} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
