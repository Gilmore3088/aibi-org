'use client';

// TrackPickerInline — wraps the existing shell/TrackPicker for use inside
// M0.1. Persists the chosen track to the learner profile via the existing
// /api/account endpoint; for anonymous visitors it stores in the addie
// anon-session profile cookie + writes a learner-profile row on first
// identity bind. Either way, downstream branched lessons (M1.3, M2.4,
// M3.5, M4.3) immediately pick up the choice.

import { useState } from 'react';
import { TrackPicker, type Track } from '@/components/addie/shell/TrackPicker';

interface TrackPickerInlineProps {
  readonly initial: Track | null;
}

export function TrackPickerInline({ initial }: TrackPickerInlineProps) {
  const [error, setError] = useState<string | null>(null);

  async function persist(track: Track) {
    setError(null);
    try {
      const res = await fetch('/api/addie/account/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track }),
      });
      // 401 is fine — for anon visitors the cookie holds the choice and
      // it'll bind on identity creation. Anything else is a real error.
      if (!res.ok && res.status !== 401) {
        setError(`HTTP ${res.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown');
    }
  }

  return (
    <section
      aria-labelledby="track-picker-heading"
      className="my-10 border border-[var(--ledger-accent)] rounded-[4px] bg-[color-mix(in_srgb,var(--ledger-accent)_4%,var(--ledger-paper))] p-5"
    >
      <header className="mb-4">
        <span className="addie-chip" data-tone="accent">
          Pick one · drives every applied lesson
        </span>
        <h2
          id="track-picker-heading"
          className="mt-3 font-serif text-2xl text-[var(--ledger-ink)]"
        >
          Which role best describes your seat?
        </h2>
        <p className="mt-1 text-sm text-[var(--ledger-ink-2)]">
          Branched lessons (M1.3, M2.4, M3.5, M4.3) will show the example
          for the role you pick. You can change it later from your Account.
        </p>
      </header>
      <TrackPicker initial={initial} onSelect={persist} />
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[var(--ledger-weak)]">
          Saving the track failed ({error}). You can still continue — pick again later from Account.
        </p>
      ) : null}
    </section>
  );
}
