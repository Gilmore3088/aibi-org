// SubmissionArtifactHero — leads the /submit page with a preview of the
// final-packet work product the learner is about to submit. Shows the
// four scored parts: prompt → raw output → edited output → annotation.
//
// Server component. Pure presentation. No props — the structure is fixed by
// the work-product spec.

import type { CSSProperties } from 'react';

const card: CSSProperties = {
  background: 'var(--cream)',
  border: '1px solid var(--ink-a10)',
  borderRadius: 16,
  padding: '18px 20px',
  boxShadow: 'var(--shadow-soft)',
};

const fieldLabel: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--slate-500)',
  margin: '0 0 6px',
};

const fieldBody: CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--ink)',
  margin: 0,
};

interface PackageItem {
  readonly label: string;
  readonly body: string;
}

const PACKAGE: readonly PackageItem[] = [
  {
    label: 'The prompt you used',
    body:
      'Summarize this draft credit memo into a one-page exception report. ' +
      'Strip names, account numbers, and addresses before drafting. Flag any ' +
      'figures that do not reconcile against the attached call-report extract.',
  },
  {
    label: 'Raw AI output',
    body:
      'Exception Report — Loan #[REDACTED]. Borrower category: small commercial. ' +
      'Three figures flagged for reconciliation: DSCR (1.08 vs 1.12 reported), ' +
      'LTV (78% vs 75% reported), occupancy (84% vs 88% reported)…',
  },
  {
    label: 'Your edited output',
    body:
      'Exception Report — Commercial Loan, Q3 review. Three figures require ' +
      'reconciliation before committee. (1) DSCR (1.08 vs 1.12). (2) LTV ' +
      '(78% vs 75%). (3) Occupancy (84% vs 88%). Recommend lender response by Friday.',
  },
  {
    label: 'Your annotation (why you edited what you edited)',
    body:
      'Removed loan number — internal id was still in raw draft. Tightened the ' +
      'committee framing because the original was too tentative. Kept the three ' +
      'flagged figures verbatim — those are the work product.',
  },
];

export function SubmissionArtifactHero() {
  return (
    <section
      aria-labelledby="submit-artifact-heading"
      style={{
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        borderRadius: 28,
        padding: '32px clamp(24px, 4vw, 40px)',
        boxShadow: 'var(--shadow-hero)',
        marginBottom: 40,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'var(--gold-a20)',
            color: 'var(--gold-soft)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          AiBI-Foundation · Final packet
        </span>
      </div>

      <h1
        id="submit-artifact-heading"
        style={{
          fontWeight: 700,
          fontSize: 'clamp(32px, 4.2vw, 48px)',
          lineHeight: 1.06,
          letterSpacing: '-0.025em',
          margin: '0 0 14px',
          color: 'var(--cream-2)',
        }}
      >
        Submit one final packet. We check four parts.
      </h1>

      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: 'var(--gold-soft)',
          margin: '0 0 24px',
          maxWidth: '62ch',
        }}
      >
        Your final submission should show the prompt, the raw output, your
        edited output, and a short annotation explaining why you changed it.
        The sample below uses synthetic banking data.
      </p>

      <div
        role="group"
        aria-label="Sample final packet work product"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {PACKAGE.map((item) => (
          <div key={item.label} style={card}>
            <p style={fieldLabel}>{item.label}</p>
            <p style={fieldBody}>{item.body}</p>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 13,
          color: 'var(--gold-soft)',
          margin: '20px 0 0',
          letterSpacing: '0.04em',
        }}
      >
        Sample only. Synthetic data — no real loan, no real borrower, no PII.
      </p>
    </section>
  );
}
