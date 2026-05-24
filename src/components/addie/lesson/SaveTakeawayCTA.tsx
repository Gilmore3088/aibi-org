'use client';

// SaveTakeawayCTA — closing element on lessons that produce a takeaway
// artifact. Visually distinct (tape callout) and labeled by the artifact
// type so learners see what they're saving. Anon save returns 401 →
// gate-fork copy. Free-cap returns 402 → upgrade copy. Both handled by
// SaveAsArtifactButton.

import { SaveAsArtifactButton } from './SaveAsArtifactButton';
import type { ArtifactType } from './types';

interface SaveTakeawayCTAProps {
  readonly lessonId: string;
  readonly artifactType: ArtifactType | null;
  readonly moduleTier: 'free' | 'paid';
}

const ARTIFACT_LABELS: Record<ArtifactType, { title: string; sub: string }> = {
  data_discipline_card: {
    title: 'Data Discipline Card',
    sub: 'Your off-limits list, ready to print.',
  },
  ai_toolkit_map: {
    title: 'AI Toolkit Map',
    sub: 'Which tool to reach for, per task.',
  },
  first_conversation: {
    title: 'First Conversation transcript',
    sub: 'Your first successful run, saved.',
  },
  starter_prompt_pack: {
    title: 'Starter Prompt Pack',
    sub: 'Three role-fitted prompts you can use Monday.',
  },
  skill: {
    title: 'Skill (saved prompt)',
    sub: 'Locked choices + input slots, ready to re-run.',
  },
  skill_template: {
    title: 'Skill template',
    sub: 'Reusable scaffold for a class of work.',
  },
  agent_blueprint: {
    title: 'Agent blueprint',
    sub: 'The shape of an agent you could build next.',
  },
  prd: {
    title: 'Lightweight PRD',
    sub: 'What you would brief an engineer with.',
  },
  prototype: {
    title: 'Prototype link',
    sub: 'A live link to what you built.',
  },
  problem_backlog: {
    title: 'Problem Backlog entry',
    sub: 'A real problem worth solving, framed.',
  },
  where_ai_fits: {
    title: 'Where AI Fits This Week',
    sub: 'Your week, mapped to AI moves.',
  },
};

export function SaveTakeawayCTA({ lessonId, artifactType }: SaveTakeawayCTAProps) {
  if (!artifactType) return null;
  const meta = ARTIFACT_LABELS[artifactType];
  if (!meta) return null;

  // Lesson bodies should populate a real takeaway payload; until per-
  // lesson copy is wired in (Tier 4 operator work), we save a small
  // placeholder so the round-trip is provable end-to-end.
  const placeholderBody = `# ${meta.title}\n\nFrom lesson ${lessonId}.\n\n${meta.sub}\n`;

  return (
    <section
      aria-labelledby="save-takeaway-heading"
      className="my-10 rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-tape)] px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)] shrink-0 pt-1">
          Takeaway
        </div>
        <div className="min-w-0">
          <h3
            id="save-takeaway-heading"
            className="font-serif text-lg text-[var(--ledger-ink)] leading-snug"
          >
            {meta.title}
          </h3>
          <p className="mt-0.5 text-sm text-[var(--ledger-ink-2)]">{meta.sub}</p>
        </div>
      </div>
      <div className="shrink-0">
        <SaveAsArtifactButton
          type={artifactType}
          title={meta.title}
          body_md={placeholderBody}
          lesson_id={lessonId}
        />
      </div>
    </section>
  );
}
