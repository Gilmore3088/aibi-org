'use client';

// M01Experience — the redesigned m0.1 entry. Per the 2026-05-24 critique:
// m0.1 was still LMS-shaped (course outline + "video in production"
// placeholder + lesson chrome). This component replaces that with a true
// onboarding screen: welcome → value bullets → capability ladder →
// Toolbox preview → role-track pick → primary CTA.
//
// Two ground rules:
//   1. The first screen sells "why I'm here," not "what lesson am I in."
//   2. The Toolbox is shown filling over time, not just named.

import { useState } from 'react';
import Link from 'next/link';
import { TrackPickerInline } from '@/components/addie/lesson/TrackPickerInline';
import type { Track } from '@/components/addie/lesson/types';

interface M01ExperienceProps {
  readonly initialTrack: Track | null;
  readonly nextHref: string; // /foundation/m0/m0.2
}

const VALUE_BULLETS: ReadonlyArray<{ kicker: string; line: string }> = [
  {
    kicker: 'Safe by habit',
    line: 'Use AI without exposing customer, member, or confidential bank data.',
  },
  {
    kicker: 'Useful by Monday',
    line: 'Turn messy work into usable drafts, checklists, and summaries.',
  },
  {
    kicker: 'Trust but verify',
    line: 'Review AI output before you sign your name to it.',
  },
  {
    kicker: 'Toolbox',
    line: 'Save reusable cards, prompts, and packs you can re-open any time.',
  },
  {
    kicker: 'Safe practice',
    line: 'Drill on realistic banking scenarios in a controlled sandbox.',
  },
];

const CAPABILITY_LADDER: ReadonlyArray<{
  step: string;
  label: string;
  body: string;
}> = [
  { step: '01', label: 'Learn', body: 'See the move and the rule it rides on.' },
  { step: '02', label: 'Try', body: 'Practice on a realistic banking shape.' },
  { step: '03', label: 'Review', body: 'Compare what AI produced against your bar.' },
  { step: '04', label: 'Save', body: 'Drop the keeper into your Toolbox.' },
];

const PATH: ReadonlyArray<{
  id: string;
  ordinal: number;
  title: string;
  summary: string;
  tier: 'free' | 'paid';
}> = [
  { id: 'm0', ordinal: 0, title: 'Orientation', summary: 'How the course works · the one rule of data discipline.', tier: 'free' },
  { id: 'm1', ordinal: 1, title: 'What generative AI is (and is not)', summary: 'Plain-English mental model · what to expect from a chat tool.', tier: 'free' },
  { id: 'm2', ordinal: 2, title: 'Access & workflow', summary: 'Where AI fits into a banker’s actual day · approved tools.', tier: 'free' },
  { id: 'm3', ordinal: 3, title: 'Prompting that holds up', summary: 'The four-part brief · A/B drill · starter prompt pack.', tier: 'free' },
  { id: 'm4', ordinal: 4, title: 'Skills you can reuse', summary: 'Turn one good ask into a saved Skill your team can lean on.', tier: 'paid' },
  { id: 'm5', ordinal: 5, title: 'From idea to prototype', summary: 'Frame a small banking problem and build a working draft.', tier: 'paid' },
];

export function M01Experience({ initialTrack, nextHref }: M01ExperienceProps) {
  const [pathOpen, setPathOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Hero — welcome, not lesson chrome */}
      <header className="mb-12">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-3">
          Module 0 · Orientation · Lesson 1 of 2
        </div>
        <h1 className="font-serif text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.015em] text-[var(--ledger-ink)] max-w-[20ch]">
          Welcome to AiBI Foundations.
        </h1>
        <p className="mt-5 font-serif text-[1.125rem] leading-[1.55] text-[var(--ledger-ink-2)] max-w-[58ch]">
          A practical course for using AI safely in everyday community-banking
          work. Short lessons, real practice, and a Toolbox you actually open
          on Monday.
        </p>
      </header>

      {/* Value bullets — what the learner can do after */}
      <section className="mb-14 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div>
          <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-4">
            You will leave able to
          </div>
          <ul className="space-y-3">
            {VALUE_BULLETS.map((v) => (
              <li key={v.kicker} className="flex gap-4">
                <span
                  aria-hidden
                  className="shrink-0 mt-[6px] inline-block w-2 h-2 rounded-[1px] bg-[var(--ledger-accent)]"
                />
                <div>
                  <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)]">
                    {v.kicker}
                  </div>
                  <p className="font-serif text-[1.0625rem] leading-snug text-[var(--ledger-ink)]">
                    {v.line}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Capability ladder */}
        <aside className="rounded-[4px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] p-5 shadow-[var(--ledger-shadow)]">
          <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-muted)] mb-3">
            The loop you will run
          </div>
          <ol className="space-y-3">
            {CAPABILITY_LADDER.map((s, i) => (
              <li key={s.label} className="flex gap-3">
                <span className="font-mono tabular-nums text-[0.7rem] text-[var(--ledger-accent)] pt-0.5">
                  {s.step}
                </span>
                <div className="flex-1">
                  <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-ink)] font-semibold">
                    {s.label}
                  </div>
                  <p className="text-[0.85rem] leading-snug text-[var(--ledger-ink-2)] mt-0.5">
                    {s.body}
                  </p>
                </div>
                {i < CAPABILITY_LADDER.length - 1 ? (
                  <span aria-hidden className="font-mono text-[var(--ledger-muted)] pt-0.5">
                    ↓
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </aside>
      </section>

      {/* Toolbox preview — visual, not nominal */}
      <section className="mb-14">
        <div className="grid gap-4 lg:grid-cols-[5fr_3fr] items-end mb-5">
          <div>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
              Your Toolbox starts empty
            </div>
            <p className="font-serif text-[1.0625rem] leading-snug text-[var(--ledger-ink)] max-w-[55ch]">
              As you move through the course, it fills with cards, briefs,
              checklists, workbench packs, and role plans you can reuse.
            </p>
          </div>
          <p className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] sm:text-right">
            Saved automatically when you sign in or hand over an email at the gate.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Data Discipline Card', src: 'M0', filled: true },
            { label: 'AI Toolkit Map', src: 'M1', filled: false },
            { label: 'Starter Prompt Pack', src: 'M3', filled: false },
            { label: 'Workbench Pack', src: 'M4', filled: false },
          ].map((slot) => (
            <article
              key={slot.label}
              className={
                'rounded-[3px] border px-4 py-4 transition-colors duration-[120ms] ' +
                (slot.filled
                  ? 'border-[var(--ledger-ink)] bg-[var(--ledger-paper)]'
                  : 'border-[var(--ledger-rule)] bg-[color-mix(in_srgb,var(--ledger-paper)_60%,var(--ledger-bg))]')
              }
              aria-label={`${slot.label} — ${slot.filled ? 'first save' : 'unlocks in ' + slot.src}`}
            >
              <div className="font-mono uppercase tracking-[0.16em] text-[0.55rem] text-[var(--ledger-muted)] mb-1">
                {slot.src}
              </div>
              <div
                className={
                  'font-serif text-[0.95rem] leading-tight ' +
                  (slot.filled
                    ? 'text-[var(--ledger-ink)]'
                    : 'text-[var(--ledger-muted)]')
                }
              >
                {slot.label}
              </div>
              <div
                className={
                  'mt-3 font-mono uppercase tracking-[0.14em] text-[0.55rem] ' +
                  (slot.filled ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]')
                }
              >
                {slot.filled ? 'First save' : 'Empty'}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Role-track pick — the one thing the learner actually does on this screen */}
      <section className="mb-14">
        <TrackPickerInline initial={initialTrack} />
        <p className="mt-3 text-[0.85rem] text-[var(--ledger-muted)]">
          If you came from the Readiness Assessment, your track may already be
          pre-selected. You can change it later from your Account.
        </p>
      </section>

      {/* CTAs — the only "lesson nav" on this screen */}
      <section className="border-t border-[var(--ledger-rule)] pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link
            href={nextHref}
            className="inline-flex items-center gap-3 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-6 py-4 rounded-[4px] bg-[var(--ledger-ink)] text-[var(--ledger-paper)] hover:bg-[var(--ledger-ink-2)] transition-colors duration-[160ms]"
          >
            Start orientation
            <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            onClick={() => setPathOpen((v) => !v)}
            aria-expanded={pathOpen}
            aria-controls="path-preview"
            className="inline-flex items-center gap-2 font-mono font-semibold uppercase tracking-[0.14em] text-xs px-5 py-4 rounded-[4px] border border-[var(--ledger-ink)] text-[var(--ledger-ink)] hover:bg-[var(--ledger-paper)] transition-colors duration-[120ms]"
          >
            {pathOpen ? 'Hide the path' : 'Preview the path'}
            <span aria-hidden>{pathOpen ? '↑' : '↓'}</span>
          </button>
        </div>

        {pathOpen ? (
          <div
            id="path-preview"
            className="mt-6 border border-[var(--ledger-rule)] rounded-[3px] bg-[var(--ledger-paper)] divide-y divide-[var(--ledger-rule)]"
          >
            {PATH.map((m) => (
              <div key={m.id} className="px-5 py-4 flex items-baseline gap-4">
                <span className="shrink-0 font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] w-10 tabular-nums">
                  M{m.ordinal}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[1rem] text-[var(--ledger-ink)] leading-snug">
                    {m.title}
                  </div>
                  <p className="text-[0.85rem] text-[var(--ledger-ink-2)] mt-0.5">
                    {m.summary}
                  </p>
                </div>
                <span
                  className={
                    'shrink-0 font-mono uppercase tracking-[0.16em] text-[0.55rem] px-2 py-0.5 rounded-[2px] ' +
                    (m.tier === 'paid'
                      ? 'bg-[color-mix(in_srgb,var(--ledger-accent)_18%,var(--ledger-paper))] text-[var(--ledger-accent)]'
                      : 'text-[var(--ledger-muted)]')
                  }
                >
                  {m.tier}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
