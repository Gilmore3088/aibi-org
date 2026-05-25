'use client';

// MaturityCelebration — a restrained moment when the learner crosses a
// stage threshold on the Aware → Governing arc.
//
// Per the Transformation Vision: "celebratory but restrained when the
// learner moves from one stage to the next." No confetti, no animation
// loop, no audio. A single full-bleed dark moment for ~3 seconds with a
// gold kicker, a single sentence, and a dismiss-by-click. Auto-fades.
//
// Trigger model: client-side polling of /api/addie/maturity on mount
// and after every `aibi:artifact-saved` custom event. The currently-
// achieved stage is compared against the per-identity last-seen stage
// in localStorage. If the stage advanced, fire the celebration once.
//
// Storage key: `aibi:maturity-last-seen` — a single stage string.

import { useCallback, useEffect, useState } from 'react';

type Stage = 'aware' | 'experimenting' | 'operationalizing' | 'leading' | 'governing';

const STAGES: ReadonlyArray<Stage> = [
  'aware',
  'experimenting',
  'operationalizing',
  'leading',
  'governing',
];

const STAGE_LABEL: Record<Stage, string> = {
  aware: 'Aware',
  experimenting: 'Experimenting',
  operationalizing: 'Operationalizing',
  leading: 'Leading',
  governing: 'Governing',
};

const STAGE_LINE: Record<Stage, string> = {
  aware: 'You can name what AI is — and what the line is.',
  experimenting: 'You can use AI safely, every day, on real work.',
  operationalizing: 'You built reusable skills your team can rely on.',
  leading: 'You ship prototypes that change how your team works.',
  governing: 'You own AI governance for your institution.',
};

const STORAGE_KEY = 'aibi:maturity-last-seen';

function deriveStage(lessonsCompleted: number, artifactsSaved: number): Stage {
  if (lessonsCompleted >= 22 && artifactsSaved >= 6) return 'leading';
  if (lessonsCompleted >= 14 && artifactsSaved >= 4) return 'operationalizing';
  if (lessonsCompleted >= 2 && artifactsSaved >= 1) return 'experimenting';
  return 'aware';
}

export function MaturityCelebration() {
  const [crossed, setCrossed] = useState<Stage | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/addie/maturity', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { lessonsCompleted?: number; artifactsSaved?: number };
      const current = deriveStage(data.lessonsCompleted ?? 0, data.artifactsSaved ?? 0);
      const lastSeen = (window.localStorage.getItem(STORAGE_KEY) ?? 'aware') as Stage;
      const currentIdx = STAGES.indexOf(current);
      const lastIdx = STAGES.indexOf(lastSeen);
      if (currentIdx > lastIdx) {
        setCrossed(current);
        window.localStorage.setItem(STORAGE_KEY, current);
        // Auto-dismiss after 3.5 seconds — restrained.
        setTimeout(() => setCrossed(null), 3500);
      } else if (currentIdx >= 0 && lastIdx === -1) {
        // First visit — seed lastSeen without firing.
        window.localStorage.setItem(STORAGE_KEY, current);
      }
    } catch {
      // Silent — celebration is decorative; never block on failure.
    }
  }, []);

  useEffect(() => {
    void check();
    const onSaved = () => {
      void check();
    };
    window.addEventListener('aibi:artifact-saved', onSaved);
    return () => window.removeEventListener('aibi:artifact-saved', onSaved);
  }, [check]);

  if (!crossed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[55] flex items-center justify-center px-6 bg-[color-mix(in_srgb,var(--ledger-ink)_92%,transparent)] backdrop-blur-sm"
      onClick={() => setCrossed(null)}
    >
      <div className="max-w-[36ch] text-center animate-[mat-fade_400ms_ease-out]">
        <div className="font-mono uppercase tracking-[0.28em] text-[0.7rem] text-[var(--ledger-accent)] mb-6">
          Stage advanced
        </div>
        <p className="font-serif text-[1.85rem] sm:text-[2.5rem] leading-[1.2] text-[var(--ledger-paper)]">
          You are now <span className="text-[var(--ledger-accent)]">{STAGE_LABEL[crossed]}</span> with AI.
        </p>
        <div className="mt-6 mx-auto w-24 h-px bg-[var(--ledger-accent)]" aria-hidden="true" />
        <p className="mt-6 font-serif text-[0.95rem] text-[var(--ledger-soft)]">
          {STAGE_LINE[crossed]}
        </p>
        <p className="mt-10 font-mono uppercase tracking-[0.18em] text-[0.55rem] text-[var(--ledger-soft)] opacity-70">
          Click anywhere to continue
        </p>
      </div>
      <style jsx>{`
        @keyframes mat-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}
