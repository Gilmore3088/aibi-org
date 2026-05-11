// /courses/foundation/[track]/[module] — module detail page
// Renders module sections + activities. The activity engines are stubbed
// per Phase 5 scaffolding; the form fields are real.

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getTrack,
  getModule,
  PILLAR_META,
  type TrackId,
} from '@content/courses/aibi-foundation';
import { SectionRenderer } from '../../_components/SectionRenderer';
import { ActivityRenderer } from '../../_components/ActivityRenderer';

interface ModulePageProps {
  readonly params: { readonly track: string; readonly module: string };
}

const VALID_TRACKS: readonly TrackId[] = ['lite', 'full', 'manager', 'board'];

function isTrackId(s: string): s is TrackId {
  return (VALID_TRACKS as readonly string[]).includes(s);
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  if (!isTrackId(params.track)) return { title: 'Not found' };
  const m = getModule(params.track, params.module);
  if (!m) return { title: 'Not found' };
  return {
    title: `${m.title} | ${getTrack(params.track)?.label} | The AI Banking Institute`,
    description: m.dailyUseOutcomes[0],
  };
}

export default function ModulePage({ params }: ModulePageProps) {
  if (!isTrackId(params.track)) notFound();
  const track = getTrack(params.track);
  const m = getModule(params.track, params.module);
  if (!track || !m) notFound();

  // Find prev / next module by track position for navigation.
  const idx = track.modules.findIndex((x) => x.id === m.id);
  const prev = idx > 0 ? track.modules[idx - 1] : undefined;
  const next = idx < track.modules.length - 1 ? track.modules[idx + 1] : undefined;

  const pillarColor = m.pillar ? PILLAR_META[m.pillar].colorVar : track.pillarColor;

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)]">
          <Link href="/courses/foundation" className="hover:text-[color:var(--color-terra)] transition-colors">
            AiBI-Foundation
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href={`/courses/foundation/${track.id}`} className="hover:text-[color:var(--color-terra)] transition-colors">
            {track.label.replace('AiBI-Foundation ', '').replace('AiBI ', '')}
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-[color:var(--color-ink)]">Module {m.trackPosition}</span>
        </nav>

        <header className="mb-12 pb-6 border-b" style={{ borderColor: pillarColor }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-2">
            Module {m.trackPosition} · {m.estimatedMinutes} min
            {m.pillar && (
              <>
                {' · '}
                <span style={{ color: pillarColor }}>{PILLAR_META[m.pillar].label}</span>
              </>
            )}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-[color:var(--color-ink)] mb-4">
            {m.title}
          </h1>
          <p className="text-lg text-[color:var(--color-muted,#5b5346)] italic">
            {m.keyOutput}
          </p>
        </header>

        {m.whyThisExists && (
          <section aria-labelledby="why-heading" className="mb-12">
            <h2 id="why-heading" className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-3">
              Why this module exists
            </h2>
            <div className="text-[color:var(--color-ink)] leading-relaxed space-y-3">
              {m.whyThisExists.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        )}

        {m.learningObjectives && m.learningObjectives.length > 0 && (
          <section aria-labelledby="objectives-heading" className="mb-12 bg-[color:var(--color-parch)] p-6 border-l-2" style={{ borderColor: pillarColor }}>
            <h2 id="objectives-heading" className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-3">
              By the end of this module
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-[color:var(--color-ink)]">
              {m.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </section>
        )}

        {m.dailyUseOutcomes.length > 0 && (
          <section aria-labelledby="outcomes-heading" className="mb-12">
            <h2 id="outcomes-heading" className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-3">
              Daily-use outcomes
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-[color:var(--color-ink)]">
              {m.dailyUseOutcomes.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </section>
        )}

        {m.sections.length > 0 && (
          <div aria-label="Module content" className="mb-12">
            {m.sections.map((s, i) => (
              <SectionRenderer key={s.id} section={s} index={i} />
            ))}
          </div>
        )}

        {m.activities.length > 0 && (
          <section aria-labelledby="activities-heading" className="mb-12">
            <h2 id="activities-heading" className="font-display text-2xl text-[color:var(--color-ink)] mb-2">
              Activities
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-6">
              {m.activities.length} {m.activities.length === 1 ? 'activity' : 'activities'} · {m.activities.reduce((s, a) => s + a.estimatedMinutes, 0)} min total
            </p>
            {m.activities.map((a, i) => (
              <ActivityRenderer key={a.id} activity={a} index={i} />
            ))}
          </section>
        )}

        {m.specRef && (
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-muted,#5b5346)]">
            Canonical spec: {m.specRef}
          </p>
        )}

        <nav aria-label="Module navigation" className="mt-12 pt-6 border-t border-[color:var(--color-rule,#d8cfbe)] flex items-center justify-between">
          {prev ? (
            <Link
              href={`/courses/foundation/${track.id}/${prev.trackPosition}`}
              className="group"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-1">
                &larr; Previous
              </p>
              <p className="font-display text-sm text-[color:var(--color-ink)] group-hover:text-[color:var(--color-terra)] transition-colors">
                {prev.title}
              </p>
            </Link>
          ) : <span />}

          {next ? (
            <Link
              href={`/courses/foundation/${track.id}/${next.trackPosition}`}
              className="group text-right"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-1">
                Next &rarr;
              </p>
              <p className="font-display text-sm text-[color:var(--color-ink)] group-hover:text-[color:var(--color-terra)] transition-colors">
                {next.title}
              </p>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </main>
  );
}
