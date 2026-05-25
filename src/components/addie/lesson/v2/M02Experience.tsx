'use client';

// M02Experience — the redesigned lesson 0.2 "data discipline" flow.
//
// This is the proof-of-concept for the v2 lesson shell. Every step is
// ONE focused screen instead of a dense scroll. The user's critique
// (2026-05-24) drove the shape:
//
//   01 · Rule    — The big rule, calm and clear
//   02 · Move    — strip→generalize→ask interactive
//   03 · Sort    — the OffLimitsSorter as the hero (existing widget)
//   04 · Check   — quick check (existing knowledge-check rows)
//   05 · Save    — the proper Data Discipline Card artifact
//   06 · Recap   — Monday move + next lesson
//
// Other lessons keep using the existing LessonPlayer until they migrate.

import { LessonStepShell, type Step } from './LessonStepShell';
import { RuleHeroCard } from './RuleHeroCard';
import { AnonymizationFlow } from './AnonymizationFlow';
import { DataDisciplineCardArtifact } from './DataDisciplineCardArtifact';
import { SacredRule } from './SacredRule';
import { KnowledgeCheck } from '@/components/addie/lesson/KnowledgeCheck';
import { ToolboxAccumulation } from '@/components/addie/lesson/ToolboxAccumulation';
import { OffLimitsSorter } from '@/components/addie/interactives/m0/OffLimitsSorter';
import type {
  InteractiveExercisePayload,
  KnowledgeCheckRow,
  Track,
} from '@/components/addie/lesson/types';
import { useEffect, useMemo, useState } from 'react';

interface M02ExperienceProps {
  readonly checks: ReadonlyArray<KnowledgeCheckRow>;
  readonly interactiveExercise: InteractiveExercisePayload | null;
  readonly track: Track | null;
  readonly nextHref: string | null;
  readonly nextLabel: string | null;
}

const TRACK_LABEL: Record<NonNullable<Track>, string> = {
  risk_compliance: 'Risk & Compliance',
  customer_facing: 'Customer-Facing',
  back_office: 'Back-Office Process',
  technical: 'Technical (IT)',
  leadership: 'Leadership',
};

const TRACK_OFF_LIMITS: Record<NonNullable<Track>, readonly string[]> = {
  risk_compliance: [
    'Exam findings and MRAs/MRIAs',
    'SAR/BSA filings, audit workpapers',
    'Complaint records with identifiers',
    'Anything marked confidential or privileged',
  ],
  customer_facing: [
    'Account/card numbers, SSNs',
    'Balances tied to a name',
    'Loan application details',
    'Income, employment, anything from a credit report',
  ],
  back_office: [
    'Customer lists, transaction files',
    'Non-public internal financials',
    'Employee PII',
    'Contact data for campaigns',
  ],
  technical: [
    'Credentials, passwords, API keys',
    'System logs containing customer data',
    'Network/security configs, source code with secrets',
    'PII in database exports',
  ],
  leadership: [
    'Board materials, M&A or strategic plans',
    'Earnings before release (MNPI)',
    'Personnel/HR matters',
    'Confidential financials',
  ],
};

const FALLBACK_OFF_LIMITS: readonly string[] = [
  'Customer names tied to accounts',
  'Account/card numbers, SSNs',
  'Customer financials, real loan files',
  'Material non-public information',
];

export function M02Experience({
  checks,
  interactiveExercise,
  track,
  nextHref,
  nextLabel,
}: M02ExperienceProps) {
  const [stripAcked, setStripAcked] = useState(false);
  const [sortAcked, setSortAcked] = useState(false);
  // Sacred Rule gate. Shown on first arrival to m0.2; once the learner
  // acknowledges, sessionStorage remembers so back-and-forth navigation
  // within the same session doesn't re-trigger the immersion.
  const [sacredAcked, setSacredAcked] = useState(true); // SSR default
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const k = 'aibi-m02-sacred-acked';
    setSacredAcked(window.sessionStorage.getItem(k) === '1');
  }, []);
  const handleSacredContinue = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('aibi-m02-sacred-acked', '1');
    }
    setSacredAcked(true);
  };

  const trackLabel = track ? TRACK_LABEL[track] : 'your role';
  const trackOffLimits = track ? TRACK_OFF_LIMITS[track] : FALLBACK_OFF_LIMITS;

  const steps: Step[] = useMemo(() => {
    const learn: Step = {
      id: 'rule',
      label: 'Rule',
      title: 'The one rule that governs everything in this course',
      node: (
        <RuleHeroCard
          kicker="The rule"
          rule="Never put customer, member, account, or confidential bank data into a public AI tool."
          subtext="Get this right and the rest of the course is safe to explore. Get it wrong and it is the kind of mistake that ends up in an exam finding."
          elevator="If you would be uncomfortable reading it aloud in a crowded elevator, it does not go in."
        />
      ),
    };

    const move: Step = {
      id: 'move',
      label: 'Move',
      title: 'The move that keeps you working',
      node: (
        <div className="space-y-6">
          <p className="font-serif text-[1.0625rem] leading-[1.7] text-[var(--ledger-ink-2)] max-w-[55ch]">
            <strong className="text-[var(--ledger-ink)] font-semibold">Describe the situation, not the person.</strong>{' '}
            Strip the names, strip the numbers, generalise the case — and the help is almost always available from the anonymised version.
          </p>
          <div onClickCapture={() => setStripAcked(true)}>
            <AnonymizationFlow />
          </div>
          <p className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
            ↑ click each highlighted detail above to strip it
          </p>
        </div>
      ),
      nextDisabled: !stripAcked,
      nextLabel: stripAcked ? 'Try sorting examples' : 'Strip a detail first',
    };

    const sort: Step = {
      id: 'sort',
      label: 'Sort',
      title: 'Sort the examples for your role',
      node: (
        <div onClickCapture={() => setSortAcked(true)}>
          {interactiveExercise ? (
            <OffLimitsSorter exerciseDescriptor={interactiveExercise} track={track} />
          ) : (
            <p className="text-[var(--ledger-muted)]">Sorter exercise not configured for this lesson.</p>
          )}
        </div>
      ),
      nextDisabled: !sortAcked,
      nextLabel: sortAcked ? 'Quick check' : 'Sort an item first',
    };

    const check: Step = {
      id: 'check',
      label: 'Check',
      title: 'Quick check',
      node: <KnowledgeCheck checks={checks} />,
      nextLabel: 'Save my card',
    };

    const save: Step = {
      id: 'save',
      label: 'Save',
      title: 'Save your Data Discipline Card',
      node: (
        <div className="space-y-6">
          <DataDisciplineCardArtifact
            trackLabel={trackLabel}
            trackOffLimits={trackOffLimits}
          />
          <ToolboxAccumulation variant="inline" />
        </div>
      ),
      nextLabel: 'See your recap',
    };

    const recap: Step = {
      id: 'recap',
      label: 'Recap',
      title: 'Your Monday move',
      node: (
        <div className="space-y-6">
          <article className="rounded-[6px] border border-[var(--ledger-ink)] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] px-6 sm:px-8 py-6">
            <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-3">
              Your Monday move
            </div>
            <p className="font-serif text-[1.125rem] leading-[1.6] mb-4">
              Before you ask AI for help with any real situation this week:
            </p>
            <ol className="space-y-2 font-serif text-[1rem] leading-[1.6] text-[var(--ledger-paper)]/90">
              <li><span className="font-mono text-[var(--ledger-accent)]">1.</span> Pick one routine AI ask you'd otherwise type from your actual desk.</li>
              <li><span className="font-mono text-[var(--ledger-accent)]">2.</span> Remove every name, account number, balance, and identifier.</li>
              <li><span className="font-mono text-[var(--ledger-accent)]">3.</span> Rewrite as a situation, not a person.</li>
              <li><span className="font-mono text-[var(--ledger-accent)]">4.</span> Save the safe version to your Toolbox.</li>
            </ol>
          </article>

          <article className="rounded-[5px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5">
            <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-muted)] mb-2">
              What you learned
            </div>
            <ul className="space-y-1.5 font-serif text-[0.95rem] text-[var(--ledger-ink-2)]">
              <li>✓ Identify customer / member / account data</li>
              <li>✓ Strip identifying details from a prompt</li>
              <li>✓ Keep the situation while removing the person</li>
              <li>✓ Sort examples into Allowed / Needs Review / Off-Limits</li>
              <li>✓ Use the Data Discipline Card when unsure</li>
            </ul>
          </article>

          {nextHref ? (
            <div className="pt-2">
              <a
                href={nextHref}
                className="inline-block px-5 py-3 bg-[var(--ledger-ink)] text-[var(--ledger-paper)] font-mono uppercase tracking-[0.16em] text-[0.7rem] rounded-[2px] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[120ms]"
              >
                Next lesson → {nextLabel ?? 'Continue'}
              </a>
            </div>
          ) : null}
        </div>
      ),
      nextLabel: nextHref ? 'Continue to next lesson' : 'Finish lesson',
    };

    return [learn, move, sort, check, save, recap];
  }, [stripAcked, sortAcked, checks, interactiveExercise, track, trackLabel, trackOffLimits, nextHref, nextLabel]);

  return (
    <>
      {!sacredAcked ? (
        <SacredRule
          kicker="Bank-safe AI begins here"
          rule="Never put customer, member, account, or confidential bank data into a public AI tool."
          attribution="The one rule · Foundation Course · AiBI"
          continueLabel="I understand the rule"
          onContinue={handleSacredContinue}
        />
      ) : null}
      <LessonStepShell
        steps={steps}
        moduleLabel="Module 0 · Orientation"
        lessonOrdinalOfTotal="Lesson 2 of 2"
        lessonTitle="The one rule that matters — data discipline"
        onComplete={() => {
          if (nextHref) window.location.href = nextHref;
        }}
      />
    </>
  );
}
