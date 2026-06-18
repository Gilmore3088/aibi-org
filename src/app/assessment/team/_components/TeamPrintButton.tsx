'use client';

export function TeamPrintButton(): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="team-print-button"
    >
      Download PDF
      <style jsx>{`
        .team-print-button {
          border: 0;
          border-radius: 12px;
          background: var(--gold);
          color: var(--ink);
          min-height: 46px;
          padding: 0 20px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        @media print {
          .team-print-button {
            display: none;
          }
        }
      `}</style>
    </button>
  );
}
