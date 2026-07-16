export function StepNumber({ index }: { readonly index: number }) {
  return (
    <span
      className="foundation-step-number"
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        width: 28,
        height: 28,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        color: 'var(--cream)',
        fontSize: '0.75rem',
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        flex: '0 0 auto',
      }}
    >
      {index + 1}
    </span>
  );
}
