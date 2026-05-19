// CourseStructure — pillar-grouped module list. Wraps each pillar with a
// header (PillarTag + module count) and renders modules through
// <ProgramModuleCard>.

import {
  LMS_PILLARS,
  PillarTag,
  type LMSModule,
} from '@/components/lms';
import {
  V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER,
} from '@content/courses/foundation-program';
import { ProgramModuleCard } from './ProgramModuleCard';

interface CourseStructureProps {
  readonly lmsModules: readonly LMSModule[];
  readonly completedModules: readonly number[];
  readonly currentModule: number;
  readonly totalModules: number;
}

export function CourseStructure({
  lmsModules,
  completedModules,
  currentModule,
  totalModules,
}: CourseStructureProps) {
  return (
    <section
      style={{
        background: 'var(--ledger-parch)',
        padding: '34px 36px',
        border: '1px solid var(--ledger-rule)',
        borderRadius: 3,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--ledger-serif)',
            fontWeight: 500,
            fontSize: 32,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ledger-ink)',
          }}
        >
          Course structure
        </h2>
        <span
          style={{
            fontFamily: 'var(--ledger-mono)',
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ledger-muted)',
          }}
        >
          4 pillars &middot; {totalModules} modules
        </span>
      </div>
      <p
        style={{
          color: 'var(--ledger-slate)',
          fontSize: 14,
          maxWidth: '58ch',
          margin: '0 0 28px',
        }}
      >
        Each module is roughly 20–40 minutes of learning, practice, and a
        single banking artifact you walk away with.
      </p>

      {LMS_PILLARS.map((pillar) => {
        const pillarMods = lmsModules.filter((m) => m.pillar === pillar.id);
        if (pillarMods.length === 0) return null;
        const totalPillarMin = pillarMods.reduce((s, m) => s + m.mins, 0);

        return (
          <div key={pillar.id} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1px solid var(--ledger-rule)',
                flexWrap: 'wrap',
              }}
            >
              <PillarTag pillarId={pillar.id} size="lg" />
              <span
                style={{
                  fontFamily: 'var(--ledger-mono)',
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ledger-muted)',
                }}
              >
                {pillarMods.length} modules &middot; {totalPillarMin} min
              </span>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {pillarMods.map((mod) => (
                <ProgramModuleCard
                  key={mod.num}
                  module={mod}
                  expanded={V4_FOUNDATION_PROGRAM_MODULE_BY_NUMBER.get(mod.num)}
                  completedModules={completedModules}
                  currentModule={currentModule}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
