import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/foundation-program';
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

export default function ArtifactDetailPage({ params }: ArtifactPageProps) {
  const artifact = AIBI_P_ARTIFACTS.find((item) => item.id === params.artifactId);

  if (!artifact) {
    notFound();
  }

  return (
    <main className="px-6 py-12 md:py-16">
      <section className="max-w-3xl mx-auto space-y-8">
        <nav aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-terra)] transition-colors"
          >
            Dashboard
          </Link>
          <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
          <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-terra)]">
            Artifact
          </span>
        </nav>

        <header className="border-b border-[color:var(--color-ink)]/10 pb-8">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            Module {artifact.moduleNumber} · {artifact.format}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            {artifact.title}
          </h1>
          <p className="text-base text-[color:var(--color-ink)]/75 mt-4 leading-relaxed">
            {artifact.description}
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          <ArtifactStatusPanel artifactId={artifact.id} />
          <DetailBlock title="Source activity" body={artifact.sourceActivityId} />
          <DetailBlock
            title="Certification evidence"
            body={artifact.countsTowardCertificate ? 'Counts toward AiBI-Foundation certification.' : 'Practice artifact only.'}
          />
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          {artifact.downloadHref ? (
            <a
              href={artifact.downloadHref}
              className="inline-block text-center px-7 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Download
            </a>
          ) : (
            <Link
              href={`/practice/${artifact.sourceActivityId}`}
              className="inline-block text-center px-7 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] transition-colors"
            >
              Open Source Activity
            </Link>
          )}
          <Link
            href="/dashboard"
            className="inline-block text-center px-7 py-3 border border-[color:var(--color-ink)]/25 text-[color:var(--color-ink)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:border-[color:var(--color-terra)] hover:text-[color:var(--color-terra)] transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
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
    <article className="border border-[color:var(--color-ink)]/10 rounded-[3px] bg-[color:var(--color-parch)] p-5">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
        {title}
      </p>
      <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
        {body}
      </p>
    </article>
  );
}
