import { kickerStyle, sectionCardStyle } from './toolkitConstants';

export function SectionCard({
  title,
  label,
  children,
}: {
  readonly title: string;
  readonly label: string;
  readonly children: React.ReactNode;
}) {
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
