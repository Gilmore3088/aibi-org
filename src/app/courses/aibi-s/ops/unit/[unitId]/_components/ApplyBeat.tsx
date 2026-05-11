'use client';

import type { ApplyBeatContent } from '@/lib/aibi-s/types';

export function ApplyBeat({
  beat,
  value,
  onChange,
  onAdvance,
  canAdvance,
}: {
  readonly beat: ApplyBeatContent;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly onAdvance: () => void;
  readonly canAdvance: boolean;
}) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <section className="space-y-6">
      <h2 className="font-serif text-3xl">Apply it to your department</h2>
      <div className="whitespace-pre-wrap">{beat.prompt}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="w-full p-4 border rounded font-sans"
        placeholder="Write 4-6 sentences..."
      />
      <p className="text-sm text-[color:var(--color-ink)]/60">
        {words} / {beat.minWords} words minimum
      </p>
      <p className="text-sm text-[color:var(--color-slate)]">{beat.guidance}</p>
      <button
        disabled={!canAdvance}
        onClick={onAdvance}
        className="px-6 py-3 bg-[color:var(--color-cobalt)] text-white rounded disabled:opacity-40 hover:opacity-90"
      >
        Continue to Defend →
      </button>
    </section>
  );
}
