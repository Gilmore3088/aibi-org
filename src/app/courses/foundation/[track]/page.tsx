// /courses/foundation/[track] — track detail page
// Lists modules within a track. Reads from content/courses/aibi-foundation.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTrack, PILLAR_META, type TrackId } from '@content/courses/aibi-foundation';

interface TrackPageProps {
  readonly params: { readonly track: string };
}

const VALID_TRACKS: readonly TrackId[] = ['lite', 'full', 'manager', 'board'];

function isTrackId(s: string): s is TrackId {
  return (VALID_TRACKS as readonly string[]).includes(s);
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  if (!isTrackId(params.track)) return { title: 'Not found' };
  const track = getTrack(params.track);
  if (!track) return { title: 'Not found' };
  return {
    title: `${track.label} | The AI Banking Institute`,
    description: track.tagline,
  };
}

export default function TrackPage({ params }: TrackPageProps) {
  if (!isTrackId(params.track)) notFound();
  const track = getTrack(params.track);
  if (!track) notFound();

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)]">
          <Link href="/courses/foundation" className="hover:text-[color:var(--color-terra)] transition-colors">
            AiBI-Foundation
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[color:var(--color-ink)]">{track.label.replace('AiBI-Foundation ', '').replace('AiBI ', '')}</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-[color:var(--color-ink)] mb-3">
            {track.label}
          </h1>
          <p className="text-lg text-[color:var(--color-muted,#5b5346)] leading-relaxed mb-4">
            {track.tagline}
          </p>
          <p className="text-[color:var(--color-ink)] leading-relaxed">
            {track.audience}
          </p>
          {track.prerequisite && (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-[color:var(--color-muted,#5b5346)]">
              Prerequisite: {track.prerequisite}
            </p>
          )}
        </header>

        <section aria-label="Modules" className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-4">
            {track.totalModules} modules · {track.totalMinutes} minutes total
          </p>
          {track.modules.map((m) => {
            const pillarColor = m.pillar ? PILLAR_META[m.pillar].colorVar : track.pillarColor;
            return (
              <Link
                key={m.id}
                href={`/courses/foundation/${track.id}/${m.trackPosition}`}
                className="group flex items-stretch gap-0 bg-[color:var(--color-parch)] hover:bg-[color:var(--color-linen)] transition-colors border-l-4"
                style={{ borderLeftColor: pillarColor }}
              >
                <div className="flex-shrink-0 w-16 flex items-center justify-center font-mono text-sm tabular-nums text-[color:var(--color-muted,#5b5346)]">
                  {m.trackPosition}
                </div>
                <div className="flex-1 py-4 pr-5">
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <h2 className="font-display text-lg text-[color:var(--color-ink)] group-hover:text-[color:var(--color-terra)] transition-colors">
                      {m.title}
                    </h2>
                    <span className="font-mono text-[11px] tabular-nums text-[color:var(--color-muted,#5b5346)] flex-shrink-0">
                      {m.estimatedMinutes} min
                    </span>
                  </div>
                  <p className="text-sm text-[color:var(--color-muted,#5b5346)] italic">
                    {m.keyOutput}
                  </p>
                  {m.pillar && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.10em]" style={{ color: pillarColor }}>
                      {PILLAR_META[m.pillar].label}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
