'use client';

// Print/PDF button for assessment results. Uses window.print() — the user
// can select "Save as PDF" from their browser's print dialog. Zero external
// dependencies. The print stylesheet in globals.css handles the formatting.

export function PrintButton() {
  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      data-print-hide="true"
      className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--ink)]/70 hover:text-[color:var(--gold)] transition-colors border-b border-[color:var(--ink)]/30 hover:border-[color:var(--gold)] pb-1"
      aria-label="Download your results as a PDF"
    >
      Download as PDF
    </button>
  );
}
