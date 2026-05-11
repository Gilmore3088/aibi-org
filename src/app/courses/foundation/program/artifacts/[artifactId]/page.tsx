import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/foundation-program';
import { PrimaryButton, GhostButton } from '@/components/lms';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { ArtifactStatusPanel } from './ArtifactStatusPanel';

interface ArtifactPageProps {
  readonly params: { artifactId: string };
}

export function generateStaticParams() {
  return AIBI_P_ARTIFACTS.map((artifact) => ({ artifactId: artifact.id }));
}

export function generateMetadata({ params }: ArtifactPageProps) {
  const artifact = AIBI_P_ARTIFACTS.find((item) => item.id === params.artifactId);
  return {
    title: artifact
      ? `${artifact.title} | AiBI-Foundation Artifact`
      : 'Artifact Not Found | AiBI-Foundation',
  };
}

export default async function ArtifactDetailPage({ params }: ArtifactPageProps) {
  const artifact = AIBI_P_ARTIFACTS.find((item) => item.id === params.artifactId);

  if (!artifact) {
    notFound();
  }

  return (
    <CourseShellWrapper
      crumbs={['Education', 'AiBI-Foundation', `Module ${artifact.moduleNumber}`, 'Artifact']}
      contentMaxWidth={760}
    >
      <header
        style={{
          borderBottom: '1px solid var(--ledger-rule)',
          paddingBottom: 28,
          marginBottom: 32,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--ledger-accent)',
            margin: '0 0 12px',
          }}
        >
          Module {artifact.moduleNumber} · {artifact.format}
        </p>
        <h1
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 'clamp(34px, 4vw, 48px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
            color: 'var(--ledger-ink)',
          }}
        >
          {artifact.title}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--ledger-ink-2)',
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
            Download
          </PrimaryButton>
        ) : (
          <PrimaryButton as="a" href={`/practice/${artifact.sourceActivityId}`}>
            Open source activity
          </PrimaryButton>
        )}
        <GhostButton as="a" href="/courses/foundation/program/gallery">
          Browse gallery
        </GhostButton>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 18px',
            fontFamily: 'var(--ledger-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ledger-muted)',
            textDecoration: 'none',
          }}
        >
          Dashboard ↗
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
        border: '1px solid var(--ledger-rule)',
        borderRadius: 3,
        background: 'var(--ledger-parch)',
        padding: 18,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--ledger-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ledger-accent)',
          margin: '0 0 8px',
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 13,
          color: 'var(--ledger-slate)',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {body}
      </p>
    </article>
  );
}
