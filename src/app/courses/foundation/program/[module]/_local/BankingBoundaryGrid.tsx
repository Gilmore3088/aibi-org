// Per-module "Do not paste / Human review / Escalate" guardrail grid
// shown inside the Takeaway section.

import { MOCKUP_FONT } from './moduleStyles';

const BANKING_BOUNDARIES: Record<string | number, readonly (readonly [string, string])[]> = {
  1: [
    ['Do not paste', 'Customer data, account details, or confidential internal reports.'],
    ['Human review', 'Any customer-facing draft, numbers, policy claims, or procedural instruction.'],
    ['Escalate', 'Credit, legal, compliance, privacy, or complaint decisions.'],
  ],
  2: [
    ['Do not assume', 'AI confidence is not evidence. Treat unsupported claims as review items.'],
    ['Human review', 'Citations, dates, policy interpretations, and regulatory statements.'],
    ['Escalate', 'Anything that could change customer treatment or institutional risk.'],
  ],
  4: [
    ['Do not paste', 'PII, NPI, customer records, account numbers, or transaction-level detail.'],
    ['Human review', 'All yellow-zone drafts before they leave an approved internal workflow.'],
    ['Escalate', 'Red-zone use cases or any use requiring approved systems and controls.'],
  ],
  8: [
    ['Do not include', 'Customer data, private employee information, passwords, or confidential records.'],
    ['Human review', 'Voice profiles, examples, reusable prompts, and do-not-do boundaries.'],
    ['Escalate', 'Any system file that would affect customer treatment, credit, legal, or compliance decisions.'],
  ],
  default: [
    ['Do not paste', 'Sensitive customer, employee, financial, or confidential bank data.'],
    ['Human review', 'Facts, numbers, policy language, recommendations, and external-facing outputs.'],
    ['Escalate', 'Legal, compliance, credit, privacy, or high-impact operational decisions.'],
  ],
};

export function BankingBoundaryGrid({ moduleNumber }: { readonly moduleNumber: number }) {
  const boundary = BANKING_BOUNDARIES[moduleNumber] ?? BANKING_BOUNDARIES.default;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 22,
        fontFamily: MOCKUP_FONT,
      }}
    >
      {boundary.map(([title, body]) => (
        <div key={title}>
          <h3
            style={{
              fontFamily: MOCKUP_FONT,
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--ink)',
              margin: '0 0 6px',
              letterSpacing: '-0.005em',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: 'var(--slate-600)',
              lineHeight: 1.55,
              margin: 0,
              fontWeight: 400,
            }}
          >
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}
