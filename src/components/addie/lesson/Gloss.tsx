// Gloss — inline first-appearance vocabulary aside. Renders the term
// with a subtle dotted underline + a native <details>/<summary>
// popover containing the plain-English definition.
//
// Server-renderable (no client JS — uses native HTML <details>).
// Accessible by default — <summary> is keyboard-focusable; toggling the
// gloss is the native disclosure semantic. Works on mobile tap.
//
// Source markup in lesson body_md:
//
//   A learner risks an [[Gloss:SR 11-7]] violation if they recurrently
//   run an LLM prompt against rule text without model-risk validation.
//
// LessonBody's renderInline expands the marker into <Gloss term="SR 11-7" />.

import { lookupGloss } from '@content/courses/foundation-program/glossary';

interface GlossProps {
  readonly term: string;
}

export function Gloss({ term }: GlossProps) {
  const definition = lookupGloss(term);

  // No entry → render the term plain (no crash, no extra UI).
  if (!definition) return <>{term}</>;

  return (
    <details className="inline group/gloss align-baseline">
      <summary
        className="
          inline cursor-help select-none list-none
          underline decoration-dotted decoration-[var(--ledger-accent)]
          underline-offset-4 decoration-from-font
          text-[var(--ledger-ink)] group-open/gloss:text-[var(--ledger-accent)]
          [&::-webkit-details-marker]:hidden
          focus-visible:outline focus-visible:outline-2
          focus-visible:outline-offset-2 focus-visible:outline-[var(--ledger-accent)]
        "
        aria-label={`Definition of ${term}`}
      >
        {term}
      </summary>
      <span
        role="note"
        className="
          mt-1 ml-0 block px-3 py-2 max-w-[52ch]
          font-sans text-[0.875rem] leading-[1.55]
          text-[var(--ledger-ink-2)] bg-[var(--ledger-tape)]
          border-l-2 border-[var(--ledger-accent)]
        "
      >
        <span className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] block mb-1">
          Plain English
        </span>
        {definition}
      </span>
    </details>
  );
}
