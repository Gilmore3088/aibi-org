// /courses/foundation — AiBI-Foundation v2 track overview
// Server Component. Lists all four tracks (Lite, Full, Manager, Board)
// with their canonical metadata read from content/courses/aibi-foundation.
//
// Phase 4 of the v2 migration. The interactive activity engines (Phase 5)
// are stubbed at the module level — see ActivityRenderer.

import type { Metadata } from 'next';
import Link from 'next/link';
import { tracks } from '@content/courses/aibi-foundation';

export const metadata: Metadata = {
  title: 'AiBI-Foundation — Four-Track Curriculum | The AI Banking Institute',
  description:
    'AiBI-Foundation is a four-track program for community banks: Lite for every employee, Full for practitioners, Manager Track for supervisors, and Board Briefing for directors.',
};

const TRACK_ORDER = ['lite', 'full', 'manager', 'board'] as const;

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

export default function FoundationOverviewPage() {
  const orderedTracks = TRACK_ORDER.map((id) => tracks.find((t) => t.id === id)!);

  return (
    <main className="min-h-screen bg-[color:var(--color-linen)]">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="mb-12 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-muted,#5b5346)] mb-3">
            AiBI-Foundation · v2 · 2026-Q2
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-[color:var(--color-ink)] mb-4">
            One credential, four tracks, every role at the bank.
          </h1>
          <p className="text-lg text-[color:var(--color-muted,#5b5346)] leading-relaxed">
            AiBI-Foundation is the literacy and skill-building floor for community banks
            and credit unions. Activity-driven, multi-model, and built around the AI
            patterns examiners are starting to ask about.
          </p>
        </header>

        <section aria-label="Tracks" className="grid gap-6 md:grid-cols-2">
          {orderedTracks.map((track) => (
            <article
              key={track.id}
              className="bg-[color:var(--color-parch)] p-7 border-l-4 transition-shadow hover:shadow-sm"
              style={{ borderLeftColor: track.pillarColor }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-2">
                {track.id === 'lite' && 'Mandatory bank-wide'}
                {track.id === 'full' && 'Practitioner course · certifying'}
                {track.id === 'manager' && 'Prerequisite: Foundation Full'}
                {track.id === 'board' && 'Director education · no prereq'}
              </p>
              <h2 className="font-display text-2xl text-[color:var(--color-ink)] mb-2">
                {track.label}
              </h2>
              <p className="text-[color:var(--color-muted,#5b5346)] mb-5 leading-relaxed">
                {track.tagline}
              </p>

              <dl className="grid grid-cols-3 gap-3 mb-6 font-mono text-[13px]">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-muted,#5b5346)]">
                    Modules
                  </dt>
                  <dd className="text-[color:var(--color-ink)] tabular-nums">
                    {track.totalModules}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-muted,#5b5346)]">
                    Time
                  </dt>
                  <dd className="text-[color:var(--color-ink)] tabular-nums">
                    {formatMinutes(track.totalMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-[color:var(--color-muted,#5b5346)]">
                    Per learner
                  </dt>
                  <dd className="text-[color:var(--color-ink)] tabular-nums">
                    {track.priceLabel.split(' ')[0]}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/courses/foundation/${track.id}`}
                className="inline-flex items-center font-mono text-xs uppercase tracking-[0.08em] text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] transition-colors"
              >
                Explore {track.label.replace('AiBI-', '')}
                <span aria-hidden="true" className="ml-1">&rarr;</span>
              </Link>
            </article>
          ))}
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] p-7 border-l-4 border-[color:var(--color-terra)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.10em] text-[color:var(--color-muted,#5b5346)] mb-2">
            About the credential
          </p>
          <p className="text-[color:var(--color-ink)] leading-relaxed">
            Every module produces a daily-use artifact — a card, a prompt, a checklist, a
            script the learner uses the next day at work. The Personal Prompt Library is
            the spine artifact, with a fixed 18-field schema that is forward-compatible
            with the AiBI-Specialist (departmental) and AiBI-Leader (bank-wide) tiers.
          </p>
        </aside>
      </div>
    </main>
  );
}
