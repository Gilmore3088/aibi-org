// /aibi-s-preview/ops — Track overview page
// Mirrors AiBI-P's /courses/aibi-p/page.tsx structure byte-for-byte.
// Data adapted: 9 modules/4 pillars → 1 unit/3 phases. Terra → cobalt.

import type { Metadata } from 'next';
import Link from 'next/link';
import { opsUnit1_1 } from '../../../../content/courses/aibi-s/ops';

export const metadata: Metadata = {
  title: 'AiBI-S /Ops: Operations Specialist | The AI Banking Institute',
  description:
    'The /Ops role track of the Banking AI Specialist course teaches department managers to deploy AI to their team, measure the impact, and defend it under pressure.',
};

type PhaseKey = 'foundation' | 'first-build' | 'scale';

interface PhaseMeta {
  readonly key: PhaseKey;
  readonly label: string;
  readonly colorVar: string;
}

const PHASE_ORDER: readonly PhaseMeta[] = [
  { key: 'foundation', label: 'Phase I — Foundation', colorVar: 'var(--color-cobalt)' },
  { key: 'first-build', label: 'Phase II — First Build', colorVar: 'var(--color-cobalt)' },
  { key: 'scale', label: 'Phase III — Scale', colorVar: 'var(--color-cobalt)' },
];

interface UnitRow {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly estimatedMinutes: number;
  readonly phase: PhaseKey;
  readonly status: 'completed' | 'current' | 'locked' | 'coming-soon';
  readonly href: string;
}

const UNITS: readonly UnitRow[] = [
  {
    id: '1.1',
    number: '1.1',
    title: opsUnit1_1.title,
    estimatedMinutes: 45,
    phase: 'foundation',
    status: 'current',
    href: '/aibi-s-preview/ops/unit/1.1',
  },
  // Future units — stubbed as coming-soon rows so the overview shows the full shape
  { id: '1.2', number: '1.2', title: 'Work Decomposition for Banking Workflows', estimatedMinutes: 45, phase: 'foundation', status: 'coming-soon', href: '#' },
  { id: '2.1', number: '2.1', title: 'Build Your First Departmental Automation', estimatedMinutes: 60, phase: 'first-build', status: 'coming-soon', href: '#' },
  { id: '2.2', number: '2.2', title: 'Measure and Evaluate', estimatedMinutes: 45, phase: 'first-build', status: 'coming-soon', href: '#' },
  { id: '3.1', number: '3.1', title: 'Build Your Departmental Skill Library', estimatedMinutes: 60, phase: 'scale', status: 'coming-soon', href: '#' },
  { id: '3.2', number: '3.2', title: 'Capstone and Certification', estimatedMinutes: 60, phase: 'scale', status: 'coming-soon', href: '#' },
];

function StatusIndicator({ status }: { readonly status: UnitRow['status'] }) {
  switch (status) {
    case 'completed':
      return <span className="text-[color:var(--color-sage)] font-mono text-xs" aria-label="Complete">&#10003;</span>;
    case 'current':
      return <span className="text-[color:var(--color-cobalt)] font-mono text-xs" aria-label="Current">&#8594;</span>;
    case 'locked':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-xs" aria-label="Locked">&#128274;</span>;
    case 'coming-soon':
      return <span className="text-[color:var(--color-ink)]/30 font-mono text-[9px] uppercase tracking-wider" aria-label="Coming soon">Soon</span>;
  }
}

export default function OpsTrackOverviewPage() {
  const completedCount = UNITS.filter((u) => u.status === 'completed').length;
  const unitsForEnrollment = UNITS.filter((u) => u.status !== 'coming-soon').length;

  return (
    <div className="mx-auto px-8 lg:px-16 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/education" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-cobalt)] transition-colors">
          Education
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <Link href="/aibi-s-preview" className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-cobalt)] transition-colors">
          AiBI-S
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-cobalt)]">/Ops</span>
      </nav>

      {/* Hero — tight, one line pitch, CTA, stats inline */}
      <section className="mb-8">
        <h1 className="font-serif text-3xl font-bold leading-tight text-[color:var(--color-ink)] mb-2">
          Banking AI <span className="text-[color:var(--color-cobalt)] italic">Specialist</span> — Operations
        </h1>
        <p className="text-sm text-[color:var(--color-ink)]/75 mb-4 max-w-xl">
          Deploy AI to your department. Measure it. Defend it under pressure from your Department Head, Compliance Liaison, and peers.
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Link
            href="/aibi-s-preview/ops/unit/1.1"
            className="bg-[color:var(--color-cobalt)] hover:opacity-90 text-[color:var(--color-linen)] px-5 py-2.5 rounded-[2px] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors flex items-center gap-2"
          >
            {completedCount > 0 ? 'Resume' : 'Start Track'}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            {unitsForEnrollment} unit{unitsForEnrollment === 1 ? '' : 's'} available in prototype
          </span>
          <span className="font-mono text-[10px] text-[color:var(--color-slate)] uppercase tracking-wider">
            Persona-driven defense
          </span>
          {completedCount > 0 && (
            <span className="font-mono text-[10px] text-[color:var(--color-cobalt)] uppercase tracking-wider tabular-nums">
              {completedCount}/{UNITS.length} complete
            </span>
          )}
        </div>
      </section>

      {/* Track Structure — phase groups + units (same pattern as AiBI-P pillar groups) */}
      <section
        id="track-structure"
        className="bg-[color:var(--color-parch)] p-6 sm:p-8 border border-[color:var(--color-ink)]/10 rounded-[3px]"
      >
        <h2 className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6">
          Track Structure
        </h2>

        <div className="space-y-6">
          {PHASE_ORDER.map((phase, phaseIdx) => {
            const phaseUnits = UNITS.filter((u) => u.phase === phase.key);

            return (
              <div key={phase.key}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: phase.colorVar }} aria-hidden="true" />
                  <h3 className="font-serif-sc text-[10px] uppercase tracking-[0.18em]" style={{ color: phase.colorVar }}>
                    {phase.label}
                  </h3>
                </div>

                <div className="space-y-0.5" role="list">
                  {phaseUnits.map((unit) => {
                    const isAccessible = unit.status !== 'locked' && unit.status !== 'coming-soon';

                    const row = (
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-[2px] transition-colors ${
                          isAccessible ? 'hover:bg-[color:var(--color-linen)]' : 'opacity-40'
                        }`}
                        role="listitem"
                      >
                        <span className="w-4 shrink-0"><StatusIndicator status={unit.status} /></span>
                        <span className="font-mono text-[10px] text-[color:var(--color-slate)] shrink-0">{unit.number}.</span>
                        <span className={`font-serif text-sm ${unit.status === 'current' ? 'text-[color:var(--color-cobalt)] font-semibold' : 'text-[color:var(--color-ink)]'}`}>
                          {unit.title}
                        </span>
                        <span className="font-mono text-[9px] text-[color:var(--color-slate)] ml-auto hidden sm:block">{unit.estimatedMinutes} min</span>
                      </div>
                    );

                    return isAccessible ? (
                      <Link key={unit.id} href={unit.href} className="block rounded-[2px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-cobalt)]">
                        {row}
                      </Link>
                    ) : (
                      <div key={unit.id}>{row}</div>
                    );
                  })}
                </div>

                {phaseIdx < PHASE_ORDER.length - 1 && (
                  <div className="mt-6 border-b border-[color:var(--color-ink)]/5" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
