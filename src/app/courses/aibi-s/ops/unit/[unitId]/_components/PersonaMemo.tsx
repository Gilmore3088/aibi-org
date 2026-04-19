'use client';

import type { DefendBeatPersona } from '../../../../../../../../lib/aibi-s/types';

export function PersonaMemo({ persona }: { readonly persona: DefendBeatPersona }) {
  return (
    <article className="p-6 border-l-4 border-[color:var(--color-cobalt)] bg-[color:var(--color-parch)] font-serif">
      <header className="text-xs font-sans uppercase tracking-wide text-[color:var(--color-ink)]/60 mb-2">
        Challenge Memo · {persona.displayName}
      </header>
      <div className="whitespace-pre-wrap text-[color:var(--color-ink)]">
        {persona.memoMarkdown}
      </div>
    </article>
  );
}
