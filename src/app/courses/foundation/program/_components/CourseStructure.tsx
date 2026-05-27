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

const FONT_INTER =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

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
        background: 'var(--cream-2)',
        padding: '36px 36px',
        border: '1px solid var(--ink-a10)',
        borderRadius: 28,
        fontFamily: FONT_INTER,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2
          style={{
            fontFamily: FONT_INTER,
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Course structure
        </h2>
        <span
          style={{
            fontFamily: FONT_INTER,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--slate-500)',
          }}
        >
          {totalModules} modules &middot; self-paced
        </span>
      </div>
      <p
        style={{
          fontFamily: FONT_INTER,
          color: 'var(--slate-600)',
          fontSize: 14,
          lineHeight: 1.55,
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
                paddingBottom: 10,
                borderBottom: '1px solid var(--ink-a10)',
                flexWrap: 'wrap',
              }}
            >
              <PillarTag pillarId={pillar.id} size="lg" />
              <span
                style={{
                  fontFamily: FONT_INTER,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--slate-500)',
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
