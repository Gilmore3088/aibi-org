'use client';

// SeatAllocationTree — Phase 3 F5 (2026-05-25). CEO Bill Hagedorn's
// 2026-05-24 finding: $295 × 18 = $5,310 is unjustified without a
// "who in your institution gets M4–M5" decision tree. Help the CEO
// choose 4–6 paid seats, not sell 18.
//
// Three short questions; each role-line resolves to a recommendation:
//   - All M0–M3 (free)        — universal floor
//   - + M4 (Pack-builder)     — staff who recurrently produce written
//                              artifacts members or regulators read
//   - + M4 + M5 (full paid)   — managers + executives who frame
//                              briefs and brief vendors / boards
//
// The output is a printable summary the CEO can take to a budget
// conversation. Lives at /foundation/for-community-banks/seats or
// embedded as a sidebar on M3.5's gate page (per CEO Bill).

import { useCallback, useMemo, useState } from 'react';

type Recommendation = 'free' | 'm4' | 'm4-m5';

interface RoleRow {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  /** Default recommendation per CEO Bill's "who actually needs M4–M5" judgement. */
  readonly defaultRec: Recommendation;
}

const ROLE_ROWS: ReadonlyArray<RoleRow> = [
  // Universal floor
  { id: 'teller', label: 'Tellers / MSRs', hint: 'Front-line conversations; ~30s per AI use.', defaultRec: 'free' },
  { id: 'jr-loan', label: 'Junior loan officers', hint: 'Adverse-action letters; deposit policy follow-ups.', defaultRec: 'free' },
  { id: 'ops-analyst', label: 'Ops analysts', hint: 'Process memos, hold-resolution scripts.', defaultRec: 'free' },
  { id: 'marketing-coord', label: 'Marketing coordinators', hint: 'Public copy; campaign briefs.', defaultRec: 'free' },
  { id: 'jr-it', label: 'Junior IT / helpdesk', hint: 'Internal tooling questions; vendor evaluation.', defaultRec: 'free' },

  // M4 Pack-builders — staff who recurrently produce written artifacts
  { id: 'sr-loan', label: 'Senior loan officers / CLO', hint: 'Recurring credit memos; vendor diligence.', defaultRec: 'm4' },
  { id: 'compliance-analyst', label: 'Compliance analysts / BSA', hint: 'Reg summaries; SAR narrative drafting (synthetic).', defaultRec: 'm4' },
  { id: 'retail-mgr', label: 'Retail manager / branch ops', hint: 'Member-comms templates; training material.', defaultRec: 'm4' },
  { id: 'controller', label: 'Controller / accounting lead', hint: 'Board memo prep; variance commentary.', defaultRec: 'm4' },

  // Full paid (M4 + M5) — frame briefs, brief vendors, brief boards
  { id: 'ceo', label: 'CEO / President', hint: 'Board materials; strategy memos; vendor evaluation.', defaultRec: 'm4-m5' },
  { id: 'cro', label: 'CRO / model risk lead', hint: 'Owns the governance overlay on every Pack.', defaultRec: 'm4-m5' },
  { id: 'cio', label: 'CIO / IT director', hint: 'Vendor TPRM; prototype evaluation.', defaultRec: 'm4-m5' },
  { id: 'cco', label: 'CCO / chief compliance', hint: 'Frames the AI risk appetite statement.', defaultRec: 'm4-m5' },
  { id: 'cfo', label: 'CFO', hint: 'Reads every board memo the Pack helps produce.', defaultRec: 'm4-m5' },
];

const REC_LABEL: Record<Recommendation, string> = {
  'free': 'Free M0–M3 only',
  'm4': '+ M4 (Pack builder · $295/seat)',
  'm4-m5': '+ M4 + M5 (full paid · $295/seat)',
};

interface SeatAllocationTreeProps {
  readonly seatMinimum?: number; // for the team SKU CTA
  readonly perSeatPriceUsd?: number;
}

export function SeatAllocationTree({
  seatMinimum = 10,
  perSeatPriceUsd = 295,
}: SeatAllocationTreeProps) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(ROLE_ROWS.map((r) => [r.id, 0])),
  );

  const setCount = useCallback((id: string, n: number) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, Math.floor(n) || 0) }));
  }, []);

  const totals = useMemo(() => {
    let free = 0;
    let m4 = 0;
    let m4m5 = 0;
    for (const row of ROLE_ROWS) {
      const n = counts[row.id] ?? 0;
      if (row.defaultRec === 'free') free += n;
      if (row.defaultRec === 'm4') m4 += n;
      if (row.defaultRec === 'm4-m5') m4m5 += n;
    }
    const paid = m4 + m4m5;
    const totalFte = free + paid;
    const paidCost = paid * perSeatPriceUsd;
    return { free, m4, m4m5, paid, totalFte, paidCost };
  }, [counts, perSeatPriceUsd]);

  const meetsTeamMin = totals.paid >= seatMinimum;

  return (
    <section
      className="border border-[var(--ledger-rule-strong)] bg-[var(--ledger-paper)] rounded-[3px] p-5 sm:p-6"
      aria-labelledby="seat-allocation-heading"
    >
      <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
        Seat allocation · CEO calculator
      </div>
      <h2 id="seat-allocation-heading" className="font-serif text-[1.5rem] text-[var(--ledger-ink)] leading-tight">
        Who in your institution actually needs M4–M5?
      </h2>
      <p className="mt-2 font-sans text-[0.95rem] text-[var(--ledger-ink-2)] max-w-[60ch]">
        Enter your headcount per role. Defaults reflect the 2026-05-24
        CEO review: most staff get the free M0–M3 floor; M4 is for
        people who recurrently produce written artifacts; M4 + M5 is
        for leadership who frame briefs and brief vendors / boards.
      </p>

      <div className="mt-6 grid gap-1.5">
        {ROLE_ROWS.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_64px_180px] gap-3 items-center py-2 border-b border-[var(--ledger-rule)]"
          >
            <div>
              <label htmlFor={`seat-${row.id}`} className="font-sans text-[0.95rem] text-[var(--ledger-ink)]">
                {row.label}
              </label>
              <div className="font-sans text-[0.8rem] text-[var(--ledger-muted)]">{row.hint}</div>
            </div>
            <input
              id={`seat-${row.id}`}
              type="number"
              min={0}
              value={counts[row.id] ?? 0}
              onChange={(e) => setCount(row.id, parseInt(e.target.value, 10))}
              className="w-16 px-2 py-1 text-right bg-[var(--ledger-bg)] border border-[var(--ledger-rule-strong)] rounded-[2px] font-mono text-[0.9rem] tabular-nums"
              aria-label={`Headcount for ${row.label}`}
            />
            <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
              {REC_LABEL[row.defaultRec]}
            </div>
          </div>
        ))}
      </div>

      {/* Totals + cost */}
      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <Stat label="Total FTE" value={totals.totalFte} />
        <Stat label="Free seats" value={totals.free} />
        <Stat label="Paid seats" value={totals.paid} />
        <Stat label="Paid cost" value={`$${totals.paidCost.toLocaleString()}`} />
      </dl>

      <div className="mt-6 pt-5 border-t border-[var(--ledger-rule)] font-sans text-[0.9rem] text-[var(--ledger-ink-2)]">
        {totals.paid === 0 ? (
          <p>
            Enter your headcount above. The free M0–M3 floor is the right
            deployment for most staff; paid seats are for the 4–6 people
            who will recurrently use M4–M5 outputs in real work.
          </p>
        ) : meetsTeamMin ? (
          <p>
            <strong>{totals.paid}</strong> paid seats clears the team-SKU
            minimum of {seatMinimum}. At ${perSeatPriceUsd}/seat that is{' '}
            <strong>${totals.paidCost.toLocaleString()}</strong> — about
            a quarterly board-packet print run for most banks your size.
            See <a href="/foundation/pricing" className="underline text-[var(--ledger-accent)]">pricing</a> to
            checkout the team SKU.
          </p>
        ) : (
          <p>
            <strong>{totals.paid}</strong> paid seats below the team-SKU
            minimum of {seatMinimum}. Either bump the count to {seatMinimum}+
            for team pricing, or run individual {perSeatPriceUsd}/seat
            purchases — both work; the team SKU adds the admin dashboard
            and seat re-assignment.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: number | string }) {
  return (
    <div>
      <dt className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-[1.5rem] text-[var(--ledger-ink)] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
