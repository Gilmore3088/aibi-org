// PIIWarning — surfaces the structural-enforcement message when a learner
// pastes something that matches a PII pattern in a sandbox slot.
// Design System §5.2 — copy is fixed; tone is informational, not punitive.

interface PIIWarningProps {
  readonly visible: boolean;
}

export function PIIWarning({ visible }: PIIWarningProps) {
  if (!visible) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className="mt-2 border-l-[2px] border-l-[var(--ledger-weak)] bg-[var(--ledger-paper)] px-3 py-2 text-sm text-[var(--ledger-ink)]"
    >
      Don&apos;t paste customer data — anonymize first (see your Data Discipline Card).
    </div>
  );
}

// Cheap client-side patterns. Match the canonical set used by the sandbox
// service (server-side check is authoritative — this is just early UX).
const SSN_RE = /\b\d{3}-?\d{2}-?\d{4}\b/;
const ACCOUNT_RE = /\b\d{8,17}\b/; // account / routing / card span
const CARD_RE = /\b(?:\d[ -]?){13,19}\b/;

export function detectPII(text: string): boolean {
  return SSN_RE.test(text) || ACCOUNT_RE.test(text) || CARD_RE.test(text);
}
