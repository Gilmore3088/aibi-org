'use client';

// M01Experience — the redesigned m0.1 onboarding screen.
// 2026-05-24 round 2 per learner-feedback review:
//   - Add a visible proof moment (the strip-it move) above the value bullets
//   - Convert the Learn → Try → Review → Save loop into a horizontal hero
//   - Add a one-line value statement under each Toolbox slot
//   - Make role selection consequential: show a per-role preview panel
//   - Stronger selected state on track cards
//
// The first screen must make the learner think "I already practiced the
// first habit," not just "this seems organized."

import { useState } from 'react';
import Link from 'next/link';
import { AnonymizationFlow } from './AnonymizationFlow';
import { TRACKS, type Track } from '@/components/addie/shell/TrackPicker';
import { AiToolAnatomy } from '@/components/addie/illustrations/AiToolAnatomy';

interface M01ExperienceProps {
  readonly initialTrack: Track | null;
  readonly nextHref: string; // /foundation/m0/m0.2
}

const VALUE_BULLETS: ReadonlyArray<{ kicker: string; line: string }> = [
  { kicker: 'Safe by habit', line: 'Use AI without exposing customer, member, or confidential bank data.' },
  { kicker: 'Useful by Monday', line: 'Turn messy work into usable drafts, checklists, and summaries.' },
  { kicker: 'Trust but verify', line: 'Review AI output before you sign your name to it.' },
  { kicker: 'Toolbox', line: 'Save reusable cards, prompts, and packs you can re-open any time.' },
  { kicker: 'Safe practice', line: 'Drill on realistic banking scenarios in a controlled sandbox.' },
];

const CAPABILITY_LADDER: ReadonlyArray<{ step: string; label: string; body: string }> = [
  { step: '01', label: 'Learn', body: 'See the move and the rule it rides on.' },
  { step: '02', label: 'Try', body: 'Practice on a realistic banking shape.' },
  { step: '03', label: 'Review', body: 'Compare what AI produced against your bar.' },
  { step: '04', label: 'Save', body: 'Drop the keeper into your Toolbox.' },
];

interface ToolboxSlot {
  readonly src: string;
  readonly label: string;
  readonly value: string;
  readonly filled: boolean;
}

const TOOLBOX_SLOTS: ReadonlyArray<ToolboxSlot> = [
  {
    src: 'M0',
    label: 'Data Discipline Card',
    value: 'Know what never goes into public AI.',
    filled: true,
  },
  {
    src: 'M1',
    label: 'AI Toolkit Map',
    value: 'Match the right AI tool to each kind of banking work.',
    filled: false,
  },
  {
    src: 'M3',
    label: 'Starter Prompt Pack',
    value: 'Tested prompts for summaries, rewrites, and action lists.',
    filled: false,
  },
  {
    src: 'M4',
    label: 'Workbench Pack',
    value: 'Save source, prompt, output, review notes, and final version.',
    filled: false,
  },
];

const TRACK_PREVIEW: Record<Track, string> = {
  risk_compliance:
    'Your examples will emphasize policy reviews, marketing claim checks, audit notes, exam-finding language, and escalation judgment.',
  customer_facing:
    'Your examples will emphasize customer conversations, complaint triage, branch notes, and clear empathetic service responses.',
  back_office:
    'Your examples will emphasize operational memos, exception summaries, loan-ops handoffs, and procedure clean-ups.',
  technical:
    'Your examples will emphasize log reviews, config sanity-checks, vendor-AI evaluation, and PII safety in engineering work.',
  leadership:
    'Your examples will emphasize board-level framing, exec summaries, strategy memos, and the line between MNPI and shareable thinking.',
};

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
  const [track, setTrack] = useState<Track | null>(initialTrack);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackSaving, setTrackSaving] = useState(false);

  async function persistTrack(t: Track) {
    setTrack(t);
    setTrackError(null);
    setTrackSaving(true);
    try {
      const res = await fetch('/api/addie/account/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: t }),
      });
      if (!res.ok && res.status !== 401) {
        setTrackError(`HTTP ${res.status}`);
      }
    } catch (e) {
      setTrackError(e instanceof Error ? e.message : 'unknown');
    } finally {
      setTrackSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Hero */}
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

      {/* AiToolAnatomy (Branch Mgr Devon finding #9, 2026-05-25): never-
          touched-an-AI-tool anchor before the proof moment. A learner can
          orient on the four basic regions (history / answer / input /
          send) before the course starts asking them to interact. */}
      <section className="mb-14" aria-labelledby="tool-anatomy-heading">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
          Before we start · what an AI tool looks like
        </div>
        <h2 id="tool-anatomy-heading" className="sr-only">
          What an AI tool looks like
        </h2>
        <AiToolAnatomy />
      </section>

      {/* Proof moment — practice the move BEFORE the value bullets */}
      <section className="mb-14" aria-labelledby="proof-heading">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr] items-end mb-5">
          <div>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
              Try it now · the move you will run
            </div>
            <h2
              id="proof-heading"
              className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight max-w-[28ch]"
            >
              Tap the sensitive details. Watch the safe prompt build itself.
            </h2>
          </div>
          <p className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] sm:text-right">
            Synthetic example · no real customer data
          </p>
        </div>
        <AnonymizationFlow />
        <p className="mt-3 text-[0.85rem] text-[var(--ledger-muted)] max-w-[55ch]">
          This is the core habit. In Lesson 2 you drill it on more shapes, sort
          banking examples into Allowed / Needs Review / Off-Limits, and save
          the Data Discipline Card to your Toolbox.
        </p>
      </section>

      {/* The Loop you will run — visual horizontal flow, the course's operating model */}
      <section className="mb-14" aria-labelledby="loop-heading">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-3">
          The loop you will run
        </div>
        <h2
          id="loop-heading"
          className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight mb-6 max-w-[36ch]"
        >
          Learn the move. Try it safely. Review the output. Save what worked.
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
          {CAPABILITY_LADDER.map((s, i) => (
            <article
              key={s.label}
              className="relative rounded-[3px] border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] px-4 py-4 shadow-[var(--ledger-shadow)]"
            >
              <div className="font-mono tabular-nums text-[0.65rem] text-[var(--ledger-accent)] mb-1">
                {s.step}
              </div>
              <div className="font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-ink)] font-semibold mb-2">
                {s.label}
              </div>
              <p className="text-[0.85rem] leading-snug text-[var(--ledger-ink-2)]">
                {s.body}
              </p>
              {i < CAPABILITY_LADDER.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden md:block absolute top-1/2 -right-2 -translate-y-1/2 font-mono text-[var(--ledger-muted)] bg-[var(--ledger-bg)] px-1"
                >
                  →
                </span>
              ) : null}
            </article>
          ))}
        </div>
        <p className="mt-4 font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-muted)]">
          You will repeat this loop in every applied module.
        </p>
      </section>

      {/* You will leave able to — anchor section, still useful */}
      <section className="mb-14" aria-labelledby="able-to-heading">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-4">
          You will leave able to
        </div>
        <ul id="able-to-heading" className="grid gap-3 sm:grid-cols-2">
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
      </section>

      {/* Toolbox preview with per-slot value lines */}
      <section className="mb-14" aria-labelledby="toolbox-heading">
        <div className="grid gap-4 lg:grid-cols-[5fr_3fr] items-end mb-5">
          <div>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
              Your Toolbox starts empty
            </div>
            <h2
              id="toolbox-heading"
              className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight max-w-[40ch]"
            >
              It fills with real, reusable work as you go.
            </h2>
          </div>
          <p className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] sm:text-right">
            Saved automatically when you sign in or hand over an email at the gate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TOOLBOX_SLOTS.map((slot) => (
            <article
              key={slot.label}
              className={
                'rounded-[3px] border px-4 py-4 transition-colors duration-[120ms] flex flex-col gap-2 ' +
                (slot.filled
                  ? 'border-[var(--ledger-ink)] bg-[var(--ledger-paper)]'
                  : 'border-[var(--ledger-rule)] bg-[color-mix(in_srgb,var(--ledger-paper)_60%,var(--ledger-bg))]')
              }
              aria-label={`${slot.label} — ${slot.filled ? 'first save in M0' : 'unlocks in ' + slot.src}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono uppercase tracking-[0.16em] text-[0.55rem] text-[var(--ledger-muted)]">
                  {slot.src}
                </span>
                <span
                  className={
                    'font-mono uppercase tracking-[0.14em] text-[0.55rem] ' +
                    (slot.filled ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-muted)]')
                  }
                >
                  {slot.filled ? 'First save' : 'Empty'}
                </span>
              </div>
              <div
                className={
                  'font-serif text-[0.95rem] leading-tight ' +
                  (slot.filled ? 'text-[var(--ledger-ink)]' : 'text-[var(--ledger-ink-2)]')
                }
              >
                {slot.label}
              </div>
              <p className="text-[0.8rem] leading-snug text-[var(--ledger-muted)] mt-auto">
                {slot.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Role-track pick — now with consequential preview */}
      <section className="mb-14" aria-labelledby="role-heading">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-[var(--ledger-accent)] mb-2">
          Pick one · drives every applied lesson
        </div>
        <h2
          id="role-heading"
          className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight mb-2"
        >
          Which role best describes your seat?
        </h2>
        <p className="text-[0.95rem] text-[var(--ledger-ink-2)] mb-4 max-w-[58ch]">
          Branched lessons (M1.3, M2.4, M3.5, M4.3) will show the example for
          the role you pick. You can change it later from your Account.
        </p>

        <div role="radiogroup" aria-label="Choose your track" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => {
            const isSel = track === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                onClick={() => void persistTrack(t.id)}
                disabled={trackSaving}
                className={
                  'group text-left rounded-[3px] border px-4 py-4 transition-colors duration-[120ms] focus:outline-none focus:ring-2 focus:ring-[var(--ledger-accent)] focus:ring-offset-2 disabled:opacity-70 ' +
                  (isSel
                    ? 'border-[var(--ledger-ink)] bg-[var(--ledger-paper)] shadow-[var(--ledger-shadow)]'
                    : 'border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] hover:border-[var(--ledger-ink)]')
                }
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={
                      'font-mono uppercase tracking-[0.16em] text-[0.55rem] ' +
                      (isSel ? 'text-[var(--ledger-accent)] font-semibold' : 'text-[var(--ledger-muted)]')
                    }
                  >
                    {isSel ? 'Selected' : 'Track'}
                  </span>
                  {isSel ? (
                    <span aria-hidden className="font-mono text-[0.7rem] text-[var(--ledger-accent)]">
                      ✓
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-serif text-[1.0625rem] text-[var(--ledger-ink)] leading-tight">
                  {t.label}
                </h3>
                <p className="mt-1 text-[0.8rem] text-[var(--ledger-muted)]">
                  {t.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {track ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 rounded-[3px] border-l-2 border-[var(--ledger-accent)] bg-[color-mix(in_srgb,var(--ledger-accent)_6%,var(--ledger-paper))] px-5 py-4"
          >
            <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)] mb-1">
              {TRACKS.find((t) => t.id === track)?.label} · what changes for you
            </div>
            <p className="font-serif text-[1rem] leading-[1.55] text-[var(--ledger-ink)]">
              {TRACK_PREVIEW[track]}
            </p>
          </div>
        ) : null}

        {trackError ? (
          <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">
            Saving the track failed ({trackError}). You can still continue — pick again later from Account.
          </p>
        ) : null}
      </section>

      {/* CTAs */}
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
