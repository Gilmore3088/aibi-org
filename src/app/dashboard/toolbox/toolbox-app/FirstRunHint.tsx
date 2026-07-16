'use client';

import { useEffect, useState } from 'react';
import type { ToolboxSkill, ToolboxSkillTemplate } from '@/lib/toolbox/types';
import { FIRST_RUN_DISMISSED_KEY, RECOMMENDED_STARTER_ID } from './constants';

export function FirstRunHint({
  skills,
  templates,
  onTry,
}: {
  readonly skills: readonly ToolboxSkill[];
  readonly templates: readonly ToolboxSkillTemplate[];
  readonly onTry: (template: ToolboxSkillTemplate) => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(window.localStorage.getItem(FIRST_RUN_DISMISSED_KEY) === 'true');
  }, []);

  // Only show for users who haven't saved any skills and haven't dismissed.
  if (dismissed || skills.length > 0) return null;

  const starter = templates.find((t) => t.id === RECOMMENDED_STARTER_ID) ?? templates[0];
  if (!starter) return null;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FIRST_RUN_DISMISSED_KEY, 'true');
    }
    setDismissed(true);
  };

  return (
    <div className="border border-[color:var(--gold-deep)]/30 bg-[color:var(--cream)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-[color:var(--gold-deep)]">
            New here? Start with this one.
          </p>
          <h3 className="mt-2 text-2xl text-[color:var(--ink)]">
            {starter.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--slate-500)]">
            {starter.desc} It runs in the AiBI Lab in under a minute against a
            fabricated scenario — no real data needed.
          </p>
          <button
            type="button"
            onClick={() => {
              onTry(starter);
              handleDismiss();
            }}
            className="mt-4 bg-[color:var(--gold-deep)] px-5 py-2.5 text-[0.625rem] uppercase tracking-widest text-[color:var(--cream)]"
          >
            Try it now
          </button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss tip"
          className="text-[0.625rem] uppercase tracking-widest text-[color:var(--slate-500)] hover:text-[color:var(--ink)]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
