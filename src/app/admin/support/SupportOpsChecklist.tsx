const DAILY_ROUTINE = [
  'Check the queue at start of day, midday, and end of business day Pacific time.',
  'Triage urgent paid-access, duplicate-purchase, refund, webhook, and failed-email cases first.',
  'Use buyer search for every paid case before replying so Stripe session, enrollment, entitlement, and refund state are visible.',
  'Record the first human response in the timeline before moving a case to waiting_customer or waiting_internal.',
] as const;

const SLA_RULES = [
  'Paid access failure or charged-without-access: first response within 4 business hours.',
  'Refund request: first response within 1 business day, decision after eligibility check.',
  'General purchase question: first response within 1 business day.',
  'Ops alert for provisioning, email, or webhook failure: treat as urgent until a case timeline explains the outcome.',
] as const;

const REFUND_FLOW = [
  'Verify eligibility in the buyer snapshot and Stripe before approving.',
  'Record approved or denied in the case timeline.',
  'Issue money movement manually in Stripe only after approval.',
  'Record manual refund issued in the case timeline and send the buyer a reply from the inbox.',
] as const;

const ACCESS_FLOW = [
  'Confirm the buyer email and Stripe Checkout Session id when available.',
  'Use Send access email for access rescue and confirm the timeline event appears.',
  'If delivery failed or the bank gateway blocks the message, reply with the fallback sign-in path.',
  'If access cannot be restored, move to refund eligibility review.',
] as const;

function OpsList({ title, items }: { readonly title: string; readonly items: readonly string[] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ol>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export function SupportOpsChecklist() {
  return (
    <section className="support-panel support-ops-checklist" aria-labelledby="support-ops-title">
      <div className="support-section-head">
        <div>
          <p className="support-kicker">Operator routine</p>
          <h2 id="support-ops-title">Support owner flow</h2>
        </div>
        <p className="support-muted">Owner: hello@aibankinginstitute.com</p>
      </div>
      <div className="support-ops-grid">
        <OpsList title="Daily queue" items={DAILY_ROUTINE} />
        <OpsList title="SLA" items={SLA_RULES} />
        <OpsList title="Access rescue" items={ACCESS_FLOW} />
        <OpsList title="Refund authority" items={REFUND_FLOW} />
      </div>
    </section>
  );
}

