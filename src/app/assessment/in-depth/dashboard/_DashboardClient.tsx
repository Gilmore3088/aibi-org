'use client';

// Client surface for the institution leader dashboard.
//
// Two main panels:
//   1. Roster + invite — initial roster comes from the server (page.tsx).
//      After sending invites, we call router.refresh() to re-render the
//      server component and pull a fresh roster.
//   2. Aggregate report — fetched on mount from /api/indepth/aggregate.
//      Renders a "locked until 3 responses" state or the full report.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type RosterStatus = 'pending' | 'in-progress' | 'complete';

export interface RosterEntry {
  readonly invite_email: string;
  readonly status: RosterStatus;
}

interface DimensionAggregate {
  dimension_id: string;
  dimension_label: string;
  average: number;
  range: { min: number; max: number };
  distribution: { low: number; mid: number; high: number };
  weakest_areas: boolean;
  strongest_areas: boolean;
}

interface ChampionEntry {
  email: string;
  overall_score: number;
  strongest_dimension: string;
}

interface AggregateOverall {
  average_score: number;
  distribution: Record<string, number>;
  tier_label: string;
}

interface AggregateResponse {
  unlocked: boolean;
  institutionName: string;
  seatsPurchased: number;
  responsesReceived: number;
  responsesInProgress: number;
  responsesPending: number;
  overall?: AggregateOverall;
  dimensions?: DimensionAggregate[];
  champions: ChampionEntry[];
}

interface InviteResult {
  created: number;
  errors: Array<{ email: string; reason: string }>;
}

interface DashboardClientProps {
  cohortId: string;
  institutionName: string;
  seatsPurchased: number;
  initialRoster: readonly RosterEntry[];
}

const STATUS_LABEL: Record<RosterStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  complete: 'Complete',
};

const STATUS_COLOR: Record<RosterStatus, string> = {
  pending: 'var(--color-slate)',
  'in-progress': 'var(--color-terra)',
  complete: 'var(--color-sage)',
};

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function DashboardClient({
  cohortId,
  institutionName,
  seatsPurchased,
  initialRoster,
}: DashboardClientProps) {
  const router = useRouter();
  // Read roster directly from props so router.refresh() server-rerenders
  // pull through to the client without needing a setter.
  const roster = initialRoster;
  const [emailsText, setEmailsText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<InviteResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [aggregate, setAggregate] = useState<AggregateResponse | null>(null);
  const [aggregateLoading, setAggregateLoading] = useState(true);
  const [aggregateError, setAggregateError] = useState<string | null>(null);

  const invitedCount = roster.length;
  const remainingSeats = Math.max(0, seatsPurchased - invitedCount);
  const pastedCount = useMemo(() => parseEmails(emailsText).length, [emailsText]);
  const overCap = pastedCount > remainingSeats;
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  async function handleResend(email: string) {
    setResendError(null);
    setResendSuccess(null);
    setResendingEmail(email);
    try {
      const res = await fetch('/api/indepth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId, email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Resend failed (${res.status})`);
      }
      setResendSuccess(email);
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Resend failed');
    } finally {
      setResendingEmail(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setAggregateLoading(true);
      setAggregateError(null);
      try {
        const res = await fetch(
          `/api/indepth/aggregate?cohortId=${encodeURIComponent(cohortId)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          throw new Error(`Aggregate request failed (${res.status})`);
        }
        const data = (await res.json()) as AggregateResponse;
        if (!cancelled) setAggregate(data);
      } catch (err) {
        if (!cancelled) {
          setAggregateError(
            err instanceof Error ? err.message : 'Failed to load aggregate',
          );
        }
      } finally {
        if (!cancelled) setAggregateLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cohortId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const emails = parseEmails(emailsText);
    if (emails.length === 0) {
      setSendError('Add at least one email.');
      return;
    }
    if (emails.length > remainingSeats) {
      setSendError(
        `You pasted ${emails.length} emails but only have ${remainingSeats} seats remaining.`,
      );
      return;
    }
    if (
      typeof window !== 'undefined' &&
      !window.confirm(
        `Send ${emails.length} invite${emails.length === 1 ? '' : 's'}?`,
      )
    ) {
      return;
    }
    setSending(true);
    setSendError(null);
    setLastResult(null);
    try {
      const res = await fetch('/api/indepth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId, emails }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Invite request failed (${res.status})`);
      }
      const data = (await res.json()) as InviteResult;
      setLastResult(data);
      setEmailsText('');
      router.refresh();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            In-Depth Assessment
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            {institutionName}
          </h1>
          <p className="text-[color:var(--color-slate)] mt-2 text-base leading-relaxed max-w-2xl">
            Invite your team, track who has finished, and read the
            anonymized aggregate report once you have at least three
            completed responses.
          </p>
        </header>

        {/* Roster + Invite Panel */}
        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-6">
            <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60">
              Roster
            </p>
            <p className="font-mono text-sm tabular-nums text-[color:var(--color-slate)]">
              <span className="text-[color:var(--color-ink)]">{invitedCount}</span>
              {' / '}
              {seatsPurchased} seats invited
            </p>
          </div>

          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6 md:p-8 mb-6">
            <form onSubmit={handleSend}>
              <label
                htmlFor="invite-emails"
                className="block font-serif text-lg text-[color:var(--color-ink)] mb-2"
              >
                Invite team members
              </label>
              <p className="text-sm text-[color:var(--color-slate)] mb-4 leading-relaxed">
                One email per line (commas and semicolons also work). You
                have <span className="font-mono tabular-nums">{remainingSeats}</span>{' '}
                seats remaining.
              </p>
              <textarea
                id="invite-emails"
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                rows={5}
                disabled={sending || remainingSeats === 0}
                placeholder="alex@bank.com&#10;jordan@bank.com"
                aria-invalid={overCap}
                className={`w-full font-mono text-sm bg-[color:var(--color-linen)] border rounded-[2px] p-3 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  overCap
                    ? 'border-[color:var(--color-error)] focus:border-[color:var(--color-error)] focus:ring-[color:var(--color-error)]/30'
                    : 'border-[color:var(--color-ink)]/20 focus:border-[color:var(--color-terra)] focus:ring-[color:var(--color-terra)]/30'
                }`}
              />
              <p
                className={`mt-2 font-mono text-xs tabular-nums ${
                  overCap ? 'text-[color:var(--color-error)]' : 'text-[color:var(--color-slate)]'
                }`}
                aria-live="polite"
              >
                {pastedCount} pasted · {remainingSeats} seat{remainingSeats === 1 ? '' : 's'} remaining
              </p>
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={sending || remainingSeats === 0}
                  className="px-6 py-3 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending…' : 'Send invites'}
                </button>
                {sendError && (
                  <span
                    role="alert"
                    className="font-sans text-sm text-[color:var(--color-error)]"
                  >
                    {sendError}
                  </span>
                )}
              </div>

              <div className="mt-3 min-h-6" aria-live="polite">
                {lastResult && (
                  <p className="font-sans text-sm text-[color:var(--color-slate)]">
                    Invited{' '}
                    <span className="font-mono tabular-nums text-[color:var(--color-ink)]">
                      {lastResult.created}
                    </span>
                    {lastResult.errors.length > 0 && (
                      <>
                        {', '}
                        <span className="font-mono tabular-nums">
                          {lastResult.errors.length}
                        </span>{' '}
                        skipped (
                        {lastResult.errors
                          .map((e) => `${e.email}: ${e.reason}`)
                          .join('; ')}
                        )
                      </>
                    )}
                    .
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Roster table */}
          {roster.length > 0 ? (
            <div className="border border-[color:var(--color-ink)]/10 rounded-[3px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[color:var(--color-linen)]">
                    <th className="text-left font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 px-4 py-3">
                      Email
                    </th>
                    <th className="text-right font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 px-4 py-3">
                      Status
                    </th>
                    <th className="text-right font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r, idx) => (
                    <tr
                      key={r.invite_email}
                      className={
                        idx % 2 === 0
                          ? 'bg-[color:var(--color-parch)]'
                          : 'bg-[color:var(--color-linen)]'
                      }
                    >
                      <td className="font-mono text-sm text-[color:var(--color-ink)] px-4 py-3 break-all">
                        {r.invite_email}
                      </td>
                      <td
                        className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-right px-4 py-3"
                        style={{ color: STATUS_COLOR[r.status] }}
                      >
                        {STATUS_LABEL[r.status]}
                      </td>
                      <td className="text-right px-4 py-3">
                        {r.status !== 'complete' && (
                          <button
                            type="button"
                            onClick={() => handleResend(r.invite_email)}
                            disabled={resendingEmail === r.invite_email}
                            className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] hover:text-[color:var(--color-terra-light)] disabled:opacity-50"
                          >
                            {resendingEmail === r.invite_email
                              ? 'Sending…'
                              : resendSuccess === r.invite_email
                                ? 'Sent ✓'
                                : 'Resend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {resendError && (
                <p
                  role="alert"
                  className="font-sans text-sm text-[color:var(--color-error)] px-4 py-2 bg-[color:var(--color-linen)]"
                >
                  {resendError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--color-slate)] italic">
              No invites sent yet. Add emails above to get started.
            </p>
          )}
        </section>

        {/* Aggregate Panel */}
        <section className="mb-12">
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-6">
            Aggregate report
          </p>

          {aggregateLoading && (
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8">
              <p className="text-sm text-[color:var(--color-slate)]">
                Loading aggregate…
              </p>
            </div>
          )}

          {!aggregateLoading && aggregateError && (
            <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-error)]/30 rounded-[3px] p-8">
              <p className="font-sans text-sm text-[color:var(--color-error)]">
                {aggregateError}
              </p>
            </div>
          )}

          {!aggregateLoading && aggregate && !aggregate.unlocked && (
            <LockedAggregate aggregate={aggregate} />
          )}

          {!aggregateLoading && aggregate && aggregate.unlocked && (
            <UnlockedAggregate aggregate={aggregate} />
          )}
        </section>
      </div>
    </main>
  );
}

function LockedAggregate({ aggregate }: { aggregate: AggregateResponse }) {
  return (
    <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
        Locked
      </p>
      <h3 className="font-serif text-2xl text-[color:var(--color-ink)] mb-3 leading-snug">
        Aggregate report unlocks at 3 completed responses.
      </h3>
      <p className="text-sm text-[color:var(--color-slate)] mb-6 leading-relaxed max-w-xl">
        Anonymized scoring requires a minimum sample size to protect
        individual respondents. Your team will see the full breakdown as
        soon as the third response is in.
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-md">
        <ProgressTile
          label="Complete"
          value={aggregate.responsesReceived}
        />
        <ProgressTile
          label="In progress"
          value={aggregate.responsesInProgress}
        />
        <ProgressTile
          label="Pending"
          value={aggregate.responsesPending}
        />
      </div>
    </div>
  );
}

function ProgressTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-4 text-center">
      <p className="font-mono text-2xl tabular-nums text-[color:var(--color-ink)] leading-none mb-2">
        {value}
      </p>
      <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-slate)]">
        {label}
      </p>
    </div>
  );
}

function UnlockedAggregate({ aggregate }: { aggregate: AggregateResponse }) {
  const overall = aggregate.overall;
  const dimensions = aggregate.dimensions ?? [];

  const dimensionRows = useMemo(() => {
    return [...dimensions].sort((a, b) => b.average - a.average);
  }, [dimensions]);

  return (
    <div className="space-y-8">
      {/* Overall */}
      {overall && (
        <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 mb-6">
            <div>
              <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
                Institutional readiness
              </p>
              <h3 className="font-serif text-3xl text-[color:var(--color-ink)] leading-snug">
                {overall.tier_label}
              </h3>
            </div>
            <p className="font-mono text-4xl tabular-nums text-[color:var(--color-terra)]">
              {overall.average_score.toFixed(1)}
              <span className="text-base text-[color:var(--color-slate)] ml-1">
                / 192
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(overall.distribution).map(([tierId, count]) => (
              <ProgressTile
                key={tierId}
                label={tierId.replace(/-/g, ' ')}
                value={count}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dimensions */}
      <div>
        <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
          Dimensions
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {dimensionRows.map((d) => (
            <DimensionCard key={d.dimension_id} dim={d} />
          ))}
        </div>
      </div>

      {/* Champions */}
      {aggregate.champions.length > 0 && (
        <div>
          <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink)]/60 mb-4">
            Champions
          </p>
          <div className="bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-6">
            <ul className="space-y-3">
              {aggregate.champions.map((c) => (
                <li
                  key={c.email}
                  className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 pb-3 border-b border-[color:var(--color-ink)]/10 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-mono text-sm text-[color:var(--color-ink)] break-all">
                      {c.email}
                    </p>
                    <p className="font-serif-sc text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-slate)] mt-1">
                      Strongest: {c.strongest_dimension}
                    </p>
                  </div>
                  <p className="font-mono text-lg tabular-nums text-[color:var(--color-terra)] shrink-0">
                    {c.overall_score}
                    <span className="text-xs text-[color:var(--color-slate)] ml-1">
                      / 192
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function DimensionCard({ dim }: { dim: DimensionAggregate }) {
  const accent = dim.weakest_areas
    ? 'var(--color-error)'
    : dim.strongest_areas
      ? 'var(--color-terra)'
      : 'var(--color-ink)';

  const tag = dim.weakest_areas
    ? 'Weakest'
    : dim.strongest_areas
      ? 'Strongest'
      : null;

  const total = dim.distribution.low + dim.distribution.mid + dim.distribution.high;

  return (
    <div
      className={`bg-[color:var(--color-parch)] border rounded-[3px] p-5 ${
        dim.weakest_areas || dim.strongest_areas
          ? ''
          : 'border-[color:var(--color-ink)]/10'
      }`}
      style={
        dim.weakest_areas || dim.strongest_areas
          ? { borderColor: `color-mix(in srgb, ${accent} 25%, transparent)` }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-serif text-base text-[color:var(--color-ink)] leading-snug pr-2">
          {dim.dimension_label}
        </h4>
        {tag && (
          <span
            className="font-serif-sc text-[10px] uppercase tracking-[0.2em] shrink-0"
            style={{ color: accent }}
          >
            {tag}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <p className="font-mono text-2xl tabular-nums" style={{ color: accent }}>
          {dim.average.toFixed(1)}
          <span className="text-xs text-[color:var(--color-slate)] ml-1">/ 24</span>
        </p>
        <p className="font-mono text-[11px] tabular-nums text-[color:var(--color-slate)]">
          range {dim.range.min}–{dim.range.max}
        </p>
      </div>

      {/* Distribution bar */}
      {total > 0 && (
        <div className="flex h-1.5 rounded-full overflow-hidden bg-[color:var(--color-ink)]/10 mb-2">
          <div
            className="bg-[color:var(--color-error)]/60"
            style={{ width: `${(dim.distribution.low / total) * 100}%` }}
            aria-label={`${dim.distribution.low} low`}
          />
          <div
            className="bg-[color:var(--color-ink)]/30"
            style={{ width: `${(dim.distribution.mid / total) * 100}%` }}
            aria-label={`${dim.distribution.mid} mid`}
          />
          <div
            className="bg-[color:var(--color-terra)]"
            style={{ width: `${(dim.distribution.high / total) * 100}%` }}
            aria-label={`${dim.distribution.high} high`}
          />
        </div>
      )}
      <p className="font-mono text-[11px] tabular-nums text-[color:var(--color-slate)]">
        {dim.distribution.low} low · {dim.distribution.mid} mid · {dim.distribution.high} high
      </p>
    </div>
  );
}
