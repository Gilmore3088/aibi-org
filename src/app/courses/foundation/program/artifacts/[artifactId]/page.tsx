import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  FOUNDATION_ARTIFACTS,
  getPracticeRepById,
} from '@content/practice-reps/foundation-program';
import { PrimaryButton, GhostButton } from '@/components/lms';
import { CourseShellWrapper } from '@/components/lms/CourseShellWrapper';
import { ArtifactStatusPanel } from './ArtifactStatusPanel';
import { ArtifactBody } from './_local/ArtifactBody';
import { ArtifactActions } from './_local/ArtifactActions';
import { getEnrollment } from '../../_lib/getEnrollment';

interface ArtifactPageProps {
  readonly params: Promise<{ artifactId: string }>;
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return FOUNDATION_ARTIFACTS.map((artifact) => ({ artifactId: artifact.id }));
}

export async function generateMetadata(props: ArtifactPageProps) {
  const params = await props.params;
  const artifact = FOUNDATION_ARTIFACTS.find((item) => item.id === params.artifactId);
  return {
    title: artifact
      ? `${artifact.title} | AiBI-Foundation Artifact`
      : 'Artifact Not Found | AiBI-Foundation',
  };
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com';

export default async function ArtifactDetailPage(props: ArtifactPageProps) {
  const params = await props.params;
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

  const source = getPracticeRepById(artifact.sourceActivityId);
  const shareUrl = `${SITE_URL}/courses/foundation/program/artifacts/${artifact.id}`;
  const copyText = source
    ? `${artifact.title}\n\nScenario: ${source.scenario}\n\nPrompt:\n${source.starterPrompt}\n\nModel output:\n${source.modelAnswer}`
    : `${artifact.title}\n\n${artifact.description}`;

  return (
    <CourseShellWrapper
      crumbs={['Education', 'AiBI-Foundation', `Module ${artifact.moduleNumber}`, 'Artifact']}
      contentMaxWidth={1040}
    >
      <header style={{ marginBottom: 28 }}>
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
            fontSize: 'clamp(30px, 4vw, 44px)',
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
            color: 'var(--ink)',
          }}
        >
          {artifact.title}
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--slate-600)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '64ch',
          }}
        >
          {artifact.description}
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(240px, 300px)',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* Hero IS the artifact — large white card */}
        <ArtifactBody artifact={artifact} source={source} />

        {/* Compact sidebar — status + metadata */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            position: 'sticky',
            top: 24,
          }}
        >
          <ArtifactStatusPanel artifactId={artifact.id} />

          <MetaPanel
            items={[
              { label: 'Module', value: `Module ${artifact.moduleNumber}` },
              { label: 'Format', value: artifact.format },
              { label: 'Source activity', value: artifact.sourceActivityId },
              {
                label: 'Certification',
                value: artifact.countsTowardCertificate
                  ? 'Counts toward AiBI-Foundation'
                  : 'Practice artifact only',
              },
            ]}
          />

          <ArtifactActions copyText={copyText} shareUrl={shareUrl} />
        </aside>
      </div>

      {/* Action row — primary moves at the foot of the artifact */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {artifact.downloadHref ? (
          <PrimaryButton as="a" href={artifact.downloadHref}>
            DOWNLOAD
          </PrimaryButton>
        ) : (
          <PrimaryButton as="a" href={`/practice/${artifact.sourceActivityId}`}>
            OPEN SOURCE ACTIVITY
          </PrimaryButton>
        )}
        <GhostButton as="a" href="/dashboard/toolbox/library">
          EDIT IN TOOLBOX
        </GhostButton>
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

function MetaPanel({
  items,
}: {
  readonly items: ReadonlyArray<{ readonly label: string; readonly value: string }>;
}) {
  return (
    <article
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: 'var(--cream-2)',
        padding: 18,
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {items.map((item) => (
        <div key={item.label}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--gold-deep)',
              margin: '0 0 4px',
            }}
          >
            {item.label}
          </p>
          <p
            style={{
              fontSize: 13.5,
              color: 'var(--ink)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </article>
  );
}
