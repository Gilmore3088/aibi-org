// CourseCompletionCard — the course home's path to the credential.
//
// The persona wave found every learner who finished all 18 modules had to
// type /certificate: the course home linked nowhere past module 18, and the
// only completion CTA appears once, at the end of module 18. Returning
// completers land here, so the finish line lives here too.

import Link from 'next/link';

export interface CourseCompletionCardProps {
  readonly completedCount: number;
  readonly totalModules: number;
}

const INTER = 'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const linkBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 18px',
  borderRadius: 12,
  fontFamily: INTER,
  fontSize: '0.875rem',
  fontWeight: 700,
  textDecoration: 'none',
};

export function CourseCompletionCard({ completedCount, totalModules }: CourseCompletionCardProps) {
  if (totalModules === 0 || completedCount < totalModules) return null;

  return (
    <section
      aria-labelledby="course-complete-h"
      style={{
        margin: '0 0 28px',
        padding: '22px 24px',
        borderRadius: 20,
        background: 'var(--ink)',
        color: 'var(--cream)',
        display: 'grid',
        gap: 14,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: INTER,
          fontSize: '0.6875rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}
      >
        Course complete · {completedCount}/{totalModules} modules
      </p>
      <h2 id="course-complete-h" style={{ margin: 0, fontFamily: INTER, fontSize: '1.375rem', lineHeight: 1.25 }}>
        Turn your 18 artifacts into the AiBI-Foundation credential.
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <Link href="/courses/foundation/program/submit" style={{ ...linkBase, background: 'var(--gold)', color: 'var(--ink)' }}>
          Submit final packet
        </Link>
        <Link
          href="/courses/foundation/program/certificate"
          style={{ ...linkBase, color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.28)' }}
        >
          View certificate status
        </Link>
        <Link
          href="/courses/foundation/program/post-assessment"
          style={{ ...linkBase, color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.28)' }}
        >
          Measure your growth
        </Link>
      </div>
    </section>
  );
}
