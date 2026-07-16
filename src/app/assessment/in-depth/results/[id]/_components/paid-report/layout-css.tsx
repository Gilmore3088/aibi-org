import { LINE } from './constants';

export function PrintCSS(): JSX.Element {
  // Browser-native print path. The user clicks "Download PDF" → window.print()
  // → standard OS print dialog with "Save as PDF" option. No Puppeteer round-
  // trip needed for v1. Hides the sticky sidebar, removes shadows, forces
  // black-on-white text, and lets each section break on its own page.
  return (
    <style>{`
      @media print {
        body { background: white !important; }
        .mk-pr-sidebar { display: none !important; }
        .mk-pr-shell { grid-template-columns: 1fr !important; }
        .mk-pr-wrap { padding: 0 !important; max-width: 100% !important; }
        [style*="position: sticky"] { position: static !important; }
        section[id="summary"],
        section[id="rootcause"],
        section[id="actionplan"],
        section[id="artifact"],
        section[id="workproducts"],
        section[id="timeline"],
        section[id="packet"],
        section[id="learning"],
        section[id="score"] {
          page-break-inside: avoid;
          page-break-after: always;
          border-radius: 0 !important;
          box-shadow: none !important;
          border: 0 !important;
          margin-bottom: 0 !important;
        }
        a { color: inherit !important; text-decoration: none !important; }
        button { display: none !important; }
        .mk-pr-stack { display: none !important; }
      }
    `}</style>
  );
}

// Responsive grid + sticky behavior — kept in one place so the inline-style
// approach above stays portable. Inline <style> is intentional: this file
// ships as a single client component, no global CSS coupling needed.
export function ResponsiveCSS(): JSX.Element {
  return (
    <style>{`
      .mk-pr-shell {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 22px;
        align-items: start;
      }
      @media (min-width: 1001px) {
        .mk-pr-sidebar { position: sticky; top: 28px; }
      }
      .mk-pr-actionStrip {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        border-top: 1px solid ${LINE};
        background: white;
      }
      .mk-pr-action:last-child { border-right: 0 !important; }
      .mk-pr-artHead {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 18px;
        align-items: center;
      }
      .mk-pr-grid2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .mk-pr-packet {
        display: grid;
        grid-template-columns: .45fr .55fr;
        gap: 22px;
        align-items: start;
      }
      .mk-pr-phase {
        display: grid;
        grid-template-columns: 160px 1fr;
        gap: 20px;
      }
      .mk-pr-playbooks {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 1000px) {
        .mk-pr-wrap { padding: 16px !important; }
        .mk-pr-shell { grid-template-columns: 1fr; }
        .mk-pr-sidebar { position: static !important; }
        .mk-pr-actionStrip,
        .mk-pr-playbooks,
        .mk-pr-artHead,
        .mk-pr-grid2,
        .mk-pr-packet,
        .mk-pr-phase {
          grid-template-columns: 1fr !important;
        }
        .mk-pr-action {
          border-right: 0 !important;
          border-bottom: 1px solid ${LINE};
        }
        .mk-pr-stack { display: none !important; }
        .mk-pr-table { overflow-x: auto; }
        .mk-pr-thead, .mk-pr-tr {
          grid-template-columns: repeat(5, minmax(120px, 1fr)) !important;
        }
      }
    `}</style>
  );
}
