import type { CSSProperties, ReactNode } from 'react';

const kickerStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gold-deep)',
  margin: 0,
};

const sectionCardStyle: CSSProperties = {
  background: 'var(--cream-2)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 24,
  padding: 28,
  marginBottom: 24,
  boxShadow: 'var(--shadow-soft)',
};

interface ToolkitSectionCardProps {
  readonly title: string;
  readonly label: string;
  readonly children: ReactNode;
}

export function ToolkitSectionCard({ title, label, children }: ToolkitSectionCardProps) {
  const slug = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <section style={sectionCardStyle} aria-labelledby={`section-${slug}`}>
      <p style={{ ...kickerStyle, marginBottom: 4 }}>{label}</p>
      <h2
        id={`section-${slug}`}
        style={{
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 20px',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
