import { FOUNDATION_MICRO_MODULES, PILLAR_META, type Pillar } from '@content/courses/foundation-program';

// The Foundation course's four pillars as a left-to-right path, built from
// the module list itself so it can never drift from the course: Awareness →
// Understanding → Creation → Application, each with its real modules.

const PILLAR_ORDER: readonly Pillar[] = ['awareness', 'understanding', 'creation', 'application'];

export const PILLAR_LINE: Record<Pillar, string> = {
  awareness: 'What AI is for, and what stays yours.',
  understanding: 'Prompts that give you usable, checkable output.',
  creation: 'Reusable prompts, skills and safe boundaries.',
  application: 'Review gates, proof, and the finished packet.',
};

export function pillarModules(pillar: Pillar) {
  return FOUNDATION_MICRO_MODULES.filter((m) => m.pillar === pillar).sort((a, b) => a.number - b.number);
}

interface PillarMapProps {
  /** Highlight this module (e.g. the free preview's Module 1). */
  readonly current?: number;
  /** Show every module title under its pillar (default) or just the range. */
  readonly compact?: boolean;
}

export function PillarMap({ current, compact = false }: PillarMapProps) {
  return (
    <ol className={`ax-pillars${compact ? ' is-compact' : ''}`} aria-label="Foundation course pillars">
      {PILLAR_ORDER.map((pillar, i) => {
        const mods = pillarModules(pillar);
        const first = mods[0]?.number;
        const last = mods[mods.length - 1]?.number;
        const isCurrent = current !== undefined && mods.some((m) => m.number === current);
        return (
          <li key={pillar} className={`ax-pillar${isCurrent ? ' is-current' : ''}`}>
            <span className="ax-pillar-bar" aria-hidden="true" />
            <p className="ax-pillar-k">
              {String(i + 1).padStart(2, '0')} · Modules {first}–{last}
            </p>
            <h3>{PILLAR_META[pillar].label}</h3>
            <p className="ax-pillar-line">{PILLAR_LINE[pillar]}</p>
            {!compact && (
              <ol className="ax-pillar-mods">
                {mods.map((m) => (
                  <li key={m.id} className={m.number === current ? 'is-current' : undefined}>
                    <span>{String(m.number).padStart(2, '0')}</span>
                    {m.title}
                  </li>
                ))}
              </ol>
            )}
            {compact && isCurrent && <p className="ax-pillar-here">You are here · Module {current}</p>}
          </li>
        );
      })}
    </ol>
  );
}
