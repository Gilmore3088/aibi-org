import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FOUNDATION_ARTIFACTS } from '@content/practice-reps/foundation-program';
import { PrimaryButton, GhostButton } from '@/components/lms';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { ArtifactStatusPanel } from './ArtifactStatusPanel';
import { getEnrollment } from '../../_lib/getEnrollment';

interface ArtifactPageProps {
  readonly params: { artifactId: string };
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return FOUNDATION_ARTIFACTS.map((artifact) => ({ artifactId: artifact.id }));
}

export function generateMetadata({ params }: ArtifactPageProps) {
  const artifact = FOUNDATION_ARTIFACTS.find((item) => item.id === params.artifactId);
  return {
    title: artifact
      ? `${artifact.title} | AiBI-Foundation Artifact`
      : 'Artifact Not Found | AiBI-Foundation',
  };
}

export default async function ArtifactDetailPage({ params }: ArtifactPageProps) {
  const artifact = FOUNDATION_ARTIFACTS.find((item) => item.id === params.artifactId);

  if (!artifact) {
    notFound();
  }

  // Artifact templates are part of the AiBI-Foundation lifetime-access bundle.
  // Non-enrolled visitors must hit the purchase page, not preview the asset.
  const enrollment = await getEnrollment();
  if (!enrollment) {
    redirect('/courses/foundation/program/purchase');
  }

  return (
    <CourseShellWrapper
      crumbs={['Education', 'AiBI-Foundation', `Module ${artifact.moduleNumber}`, 'Artifact']}
      contentMaxWidth={760}
    >
      <header
        style={{
          borderBottom: '1px solid var(--ink-a10)',
          paddingBottom: 28,
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--gold-deep)',
            margin: '0 0 12px',
          }}
        >
          Module {artifact.moduleNumber} · {artifact.format}
        </p>
        <h1
          style={{
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 46px)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ink)',
          }}
        >
          {artifact.title}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          {artifact.description}
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        <ArtifactStatusPanel artifactId={artifact.id} />
        <DetailBlock title="Source activity" body={artifact.sourceActivityId} />
        <DetailBlock
          title="Certification evidence"
          body={
            artifact.countsTowardCertificate
              ? 'Counts toward AiBI-Foundation certification.'
              : 'Practice artifact only.'
          }
        />
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {artifact.downloadHref ? (
          <PrimaryButton as="a" href={artifact.downloadHref}>
            DOWNLOAD
          </PrimaryButton>
        ) : (
          <PrimaryButton as="a" href={`/practice/${artifact.sourceActivityId}`}>
            OPEN SOURCE ACTIVITY
          </PrimaryButton>
        )}
        <GhostButton as="a" href="/courses/foundation/program/gallery">
          BROWSE GALLERY
        </GhostButton>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 18px',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
            textDecoration: 'none',
          }}
        >
          DASHBOARD ↗
        </Link>
      </div>
    </CourseShellWrapper>
  );
}

function DetailBlock({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}) {
  return (
    <article
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: 'var(--cream-2)',
        padding: 18,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 13,
          color: 'var(--slate-600)',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {body}
      </p>
    </article>
  );
}
