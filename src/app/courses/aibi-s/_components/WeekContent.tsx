// WeekContent — Renders week content with role-track-aware sections
// Server Component: receives the resolved CohortWeek + learner's track
// Role-track content is shown prominently for the learner's track; others collapsed

import type { CohortWeek, RoleTrack } from '@content/courses/aibi-s';
import { ROLE_TRACK_META } from '@content/courses/aibi-s';
import { LearnSection } from '@/components/courses/LearnSection';
import { RoleTrackBadge } from './RoleTrackBadge';

interface WeekContentProps {
  readonly week: CohortWeek;
  readonly roleTrack: RoleTrack | null;
}

export function WeekContent({ week, roleTrack }: WeekContentProps) {
  const trackMeta = roleTrack ? ROLE_TRACK_META[roleTrack] : null;
  const trackContent = roleTrack ? week.roleTrackContent[roleTrack] : null;

  return (
    <div>
      {/* Learning goals */}
      <section className="mb-12" aria-labelledby="learning-goals-heading">
        <h2
          id="learning-goals-heading"
          className="font-serif text-2xl font-bold text-[color:var(--color-ink)] mb-6"
        >
          Learning <span className="italic">Goals</span>
        </h2>
        <div className="w-10 h-px bg-[color:var(--color-cobalt)] mb-6" aria-hidden="true" />
        <ol className="space-y-3" role="list">
          {week.learningGoals.map((goal, i) => (
            <li key={i} className="flex items-start gap-4">
              <span
                className="shrink-0 font-mono text-[11px] tabular-nums text-[color:var(--color-cobalt)] mt-0.5 w-4"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
                {goal}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Role track spotlight */}
      {trackContent && trackMeta && roleTrack && (
        <div
          className="mb-12 rounded-sm p-6"
          style={{
            backgroundColor: 'var(--color-parch)',
            border: '1px solid rgba(45,74,122,0.15)',
            borderLeft: '3px solid var(--color-cobalt)',
          }}
          role="note"
          aria-label={`Role-track content for ${trackMeta.label}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <RoleTrackBadge track={roleTrack} size="sm" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-cobalt)]">
              Your Track This Week
            </span>
          </div>

          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-1">
              Platform Focus
            </p>
            <p className="font-sans text-sm text-[color:var(--color-ink)]">{trackContent.platformFocus}</p>
          </div>

          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-2">
              Deep Dive Topics
            </p>
            <ul className="space-y-1.5" role="list">
              {trackContent.deepDiveTopics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-[color:var(--color-cobalt)]"
                    aria-hidden="true"
                  />
                  <span className="font-sans text-sm text-[color:var(--color-slate)]">{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[color:var(--color-cobalt)]/10">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-slate)] mb-2">
              Assignment Variation
            </p>
            <p className="font-sans text-sm text-[color:var(--color-slate)] leading-relaxed">
              {trackContent.activityVariations}
            </p>
          </div>
        </div>
      )}

      {/* Core sections — collapsible accordion */}
      <LearnSection
        sections={week.sections}
        keyTakeaways={week.keyTakeaways}
        accentColor="var(--color-cobalt)"
        unitLabel="week"
      />
    </div>
  );
}
