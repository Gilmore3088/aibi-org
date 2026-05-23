'use client';

// TrackPicker — 5-track selection. Posts to a server action provided by
// the caller (kept generic so it can be used from any lesson route).

import { useState, useTransition } from 'react';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';

export type Track =
  | 'risk_compliance'
  | 'customer_facing'
  | 'back_office'
  | 'technical'
  | 'leadership';

export const TRACKS: ReadonlyArray<{ id: Track; label: string; tagline: string }> = [
  { id: 'risk_compliance', label: 'Risk & Compliance', tagline: 'Examiners, BSA/AML, audit, controls.' },
  { id: 'customer_facing', label: 'Customer-Facing', tagline: 'Branch, contact center, relationship banking.' },
  { id: 'back_office', label: 'Back-Office Process', tagline: 'Operations, loan ops, treasury services.' },
  { id: 'technical', label: 'Technical', tagline: 'IT, security, data, engineering.' },
  { id: 'leadership', label: 'Leadership', tagline: 'Executives, strategy, board reporting.' },
];

interface TrackPickerProps {
  readonly initial?: Track | null;
  readonly onSelect: (track: Track) => Promise<void> | void;
}

export function TrackPicker({ initial = null, onSelect }: TrackPickerProps) {
  const [selected, setSelected] = useState<Track | null>(initial);
  const [pending, startTransition] = useTransition();

  function pick(id: Track) {
    setSelected(id);
    startTransition(async () => {
      await onSelect(id);
    });
  }

  return (
    <div role="radiogroup" aria-label="Choose your track" className="grid gap-3 md:grid-cols-2">
      {TRACKS.map((t) => {
        const isSel = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isSel}
            disabled={pending}
            onClick={() => pick(t.id)}
            className="text-left disabled:opacity-60"
          >
            <LedgerCard selected={isSel} className="p-5 hover:cursor-pointer">
              <KickerLabel tone={isSel ? 'accent' : 'muted'}>{isSel ? 'Selected' : 'Track'}</KickerLabel>
              <h3 className="mt-2 font-serif text-xl text-[var(--ledger-ink)]">{t.label}</h3>
              <p className="mt-1 text-sm text-[var(--ledger-muted)]">{t.tagline}</p>
            </LedgerCard>
          </button>
        );
      })}
    </div>
  );
}
