// Renders a small "Built with input from" strip naming advisors / SMEs
// who have publicly endorsed reviewing the Institute's curriculum.
//
// Returns null when content/advisors.ts is empty. That keeps the strip
// out of the DOM entirely until the founder has real, named,
// public-attribution-approved people to list — no placeholder shells,
// no fabricated quotes.
//
// Filed under #356.

import { ADVISORS, type Advisor } from '@content/advisors';

export interface AdvisorsStripProps {
  /** Optional kicker copy. Defaults to "Built with input from". */
  readonly kicker?: string;
}

export function AdvisorsStrip({ kicker = 'Built with input from' }: AdvisorsStripProps) {
  if (ADVISORS.length === 0) return null;
  return (
    <section className="mk-advisors-strip" aria-label="Named advisors">
      <p className="mk-advisors-kicker">{kicker}</p>
      <ul className="mk-advisors-list">
        {ADVISORS.map((a) => (
          <AdvisorEntry key={a.id} advisor={a} />
        ))}
      </ul>
    </section>
  );
}

function AdvisorEntry({ advisor }: { readonly advisor: Advisor }) {
  return (
    <li className="mk-advisors-entry">
      <p className="mk-advisors-name">{advisor.name}</p>
      <p className="mk-advisors-role">
        {advisor.role} &middot; {advisor.institution}
      </p>
      {advisor.quote && (
        <p className="mk-advisors-quote">&ldquo;{advisor.quote}&rdquo;</p>
      )}
    </li>
  );
}
