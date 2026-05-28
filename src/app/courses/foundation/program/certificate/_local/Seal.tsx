// Seal — navy square with gold landmark glyph. Matches the CLAUDE.md
// wordmark spec (40×40, 12px radius, gold landmark on ink). Used here
// standalone (centered on the credential) rather than paired with the
// two-line wordmark text; the credential body already names the
// Institute, so a symbol-only seal reads cleanly without duplication.

export function Seal() {
  return (
    <div
      aria-hidden
      style={{
        width: 56,
        height: 56,
        background: 'var(--ink)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: 28, height: 28 }}
      >
        <path d="M3 10 L12 4 L21 10" />
        <path d="M5 10 V19" />
        <path d="M9 10 V19" />
        <path d="M15 10 V19" />
        <path d="M19 10 V19" />
        <path d="M3 20 H21" />
      </svg>
    </div>
  );
}
