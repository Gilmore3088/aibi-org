'use client';

// Small client island for the canvas page's "Print" button. Server
// components cannot attach onClick handlers, so the print trigger
// lives here. Marked no-print so the button itself does not show up
// in the saved PDF.

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print"
      style={{
        background: 'var(--ledger-ink)',
        color: 'var(--ledger-bg)',
        border: 'none',
        padding: '10px 18px',
        borderRadius: 2,
        fontFamily: 'var(--ledger-mono)',
        fontSize: 10.5,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      Print this page · save as PDF
    </button>
  );
}
