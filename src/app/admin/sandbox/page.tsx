// /admin/sandbox — operator dashboard for sandbox cost + abuse signals.
// Server component. Reads addie.sandbox_sessions + addie.sandbox_spend
// via service-role queries. Panels:
//   - Today's spend per provider against the daily cap
//   - 7-day spend trend
//   - 7-day session volume (mode split + anon/auth split)
//   - Flagged sessions list with reasons
//   - Top exercises by spend
//
// Daily cap is read from SANDBOX_DAILY_BUDGET_USD (default $20). Over-cap
// rows render in oxblood; >=80% in gold. The page never shows learner
// transcripts or raw outputs — aggregates and identifiers only.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import {
  loadSandboxSpend,
  loadSandboxVolume,
  loadFlaggedSessions,
  loadTopExercisesBySpend,
  type ProviderSpend,
  type SpendDay,
  type FlaggedSession,
  type ExerciseSpend,
} from '@/lib/addie/sandbox/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NUM_FMT = new Intl.NumberFormat('en-US');
const USD_FMT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function PanelHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <KickerLabel>{kicker}</KickerLabel>
      <h2 className="font-serif text-2xl mt-1 leading-tight">{title}</h2>
      {sub ? <p className="text-sm text-[var(--ledger-muted)] mt-1">{sub}</p> : null}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[var(--ledger-muted)] py-6 text-center">{children}</p>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <LedgerCard variant="tape" className="p-5">
      <KickerLabel tone="accent">Panel error</KickerLabel>
      <p className="text-sm text-[var(--ledger-ink-2)] mt-2">
        Could not load this panel. {message}
      </p>
    </LedgerCard>
  );
}

// Color rule shared by spend rows: oxblood when over cap, gold when at/over 80%.
function spendToneClass(pctOfCap: number): string {
  if (pctOfCap >= 100) return 'text-[var(--ledger-weak)]';
  if (pctOfCap >= 80) return 'text-[var(--ledger-accent)]';
  return 'text-[var(--ledger-ink)]';
}

function SpendPanel({ data }: { data: Awaited<ReturnType<typeof loadSandboxSpend>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  const maxTrend = Math.max(0.001, ...data.trend.map((d: SpendDay) => d.totalUsd));
  const totalPctOfCap = data.capUsd > 0 ? (data.totalTodayUsd / data.capUsd) * 100 : 0;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Daily spend"
        title="Today against the daily cap"
        sub={`Cap ${USD_FMT.format(data.capUsd)}/day per provider · UTC day ${data.today}`}
      />
      <div className="grid grid-cols-[2fr_1fr] gap-6 items-end mb-6">
        <div>
          <KickerLabel>Total today</KickerLabel>
          <div className={`font-serif text-4xl tabular-nums mt-1 ${spendToneClass(totalPctOfCap)}`}>
            {USD_FMT.format(data.totalTodayUsd)}
          </div>
          <div className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums mt-1">
            {totalPctOfCap.toFixed(1)}% of single-provider cap · MTD {USD_FMT.format(data.monthToDateUsd)}
          </div>
        </div>
        <div className="text-right">
          <KickerLabel>Daily cap</KickerLabel>
          <div className="font-serif text-2xl tabular-nums mt-1">
            {USD_FMT.format(data.capUsd)}
          </div>
        </div>
      </div>

      <KickerLabel>Per provider, today</KickerLabel>
      <ul className="mt-2 space-y-2">
        {data.perProvider.map((p: ProviderSpend) => {
          const tone = spendToneClass(p.pctOfCap);
          const barPct = Math.min(100, p.pctOfCap);
          return (
            <li key={p.provider} className="grid grid-cols-[7rem_1fr_4rem] gap-3 items-center">
              <span className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)]">
                {p.provider}
              </span>
              <div className="relative h-2 bg-[var(--ledger-parch)] rounded-[2px] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--ledger-ink)]"
                  style={{ width: `${barPct}%` }}
                />
                {p.pctOfCap >= 100 ? (
                  <div className="absolute inset-y-0 right-0 w-1 bg-[var(--ledger-weak)]" />
                ) : null}
              </div>
              <span className={`font-mono tabular-nums text-sm text-right ${tone}`}>
                {USD_FMT.format(p.todayUsd)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 border-t border-[var(--ledger-rule)] pt-4">
        <KickerLabel>{data.trend.length}-day total trend</KickerLabel>
        <div
          className="mt-2 flex items-end gap-2 h-20"
          role="img"
          aria-label={`${data.trend.length}-day total sandbox spend trend`}
        >
          {data.trend.map((d: SpendDay) => {
            const h = Math.round((d.totalUsd / maxTrend) * 100);
            const day = new Date(d.day + 'T00:00:00Z').toLocaleDateString('en-US', {
              weekday: 'short',
              timeZone: 'UTC',
            });
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[var(--ledger-ink)] border-t-2 border-[var(--ledger-accent)]"
                  style={{ height: `${h}%`, minHeight: d.totalUsd > 0 ? '2px' : '0' }}
                  title={`${d.day}: ${USD_FMT.format(d.totalUsd)}`}
                />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--ledger-muted)]">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </LedgerCard>
  );
}

function VolumePanel({ data }: { data: Awaited<ReturnType<typeof loadSandboxVolume>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Session volume"
        title="Sandbox runs in the last 7 days"
        sub="Counts include single, A/B compare, and skill-run modes"
      />
      {data.total === 0 ? (
        <EmptyNote>No sandbox sessions in the last {data.windowDays} days yet.</EmptyNote>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 mb-5">
            <div>
              <KickerLabel>Total sessions</KickerLabel>
              <div className="font-serif text-3xl tabular-nums mt-1">
                {NUM_FMT.format(data.total)}
              </div>
            </div>
            <div>
              <KickerLabel>Est. cost</KickerLabel>
              <div className="font-serif text-3xl tabular-nums mt-1">
                {USD_FMT.format(data.totalEstCostUsd)}
              </div>
              <div className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums mt-1">
                {NUM_FMT.format(data.totalTokens)} tokens
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-[var(--ledger-rule)] pt-4">
            <div>
              <KickerLabel>By mode</KickerLabel>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between"><span>Single run</span><span className="font-mono tabular-nums">{NUM_FMT.format(data.byMode.single)}</span></li>
                <li className="flex justify-between"><span>A/B compare</span><span className="font-mono tabular-nums">{NUM_FMT.format(data.byMode.ab)}</span></li>
                <li className="flex justify-between"><span>Skill run</span><span className="font-mono tabular-nums">{NUM_FMT.format(data.byMode.skill)}</span></li>
              </ul>
            </div>
            <div>
              <KickerLabel>By identity</KickerLabel>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between"><span>Authenticated</span><span className="font-mono tabular-nums">{NUM_FMT.format(data.authCount)}</span></li>
                <li className="flex justify-between"><span>Anonymous</span><span className="font-mono tabular-nums">{NUM_FMT.format(data.anonCount)}</span></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </LedgerCard>
  );
}

function FlaggedPanel({ data }: { data: Awaited<ReturnType<typeof loadFlaggedSessions>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Flagged sessions"
        title={`${NUM_FMT.format(data.totalFlagged)} flagged in last ${data.windowDays} days`}
        sub="Most recent first · reasons set by sandbox-service guardrails"
      />
      {data.recent.length === 0 ? (
        <EmptyNote>No flagged sessions in the last {data.windowDays} days.</EmptyNote>
      ) : (
        <ol className="divide-y divide-[var(--ledger-rule)]">
          {data.recent.map((s: FlaggedSession) => (
            <li key={s.id} className="py-3 grid grid-cols-[8rem_1fr_5rem] gap-3 items-baseline text-sm">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ledger-muted)] tabular-nums">
                {new Date(s.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <span className="text-[var(--ledger-ink-2)]">
                <span className="font-mono uppercase tracking-[0.14em] text-[0.7rem] text-[var(--ledger-ink)] mr-2">
                  {s.exercise_id}
                </span>
                <span className="text-[var(--ledger-muted)]">·</span>
                <span className="ml-2">{s.reasons.length > 0 ? s.reasons.join(', ') : '—'}</span>
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-right">
                <span className="text-[var(--ledger-muted)]">{s.provider}</span>
                <span className="text-[var(--ledger-muted)]"> · </span>
                <span className={s.identity === 'anon' ? 'text-[var(--ledger-accent)]' : 'text-[var(--ledger-ink-2)]'}>
                  {s.identity}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </LedgerCard>
  );
}

function TopExercisesPanel({ data }: { data: Awaited<ReturnType<typeof loadTopExercisesBySpend>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Top exercises"
        title="Cost per exercise, last 7 days"
        sub="Spot the lessons that are eating budget · click through in sandbox-service logs to investigate"
      />
      {data.rows.length === 0 ? (
        <EmptyNote>No exercise spend in the last {data.windowDays} days.</EmptyNote>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--ledger-rule)] text-left">
              <th className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] py-2">Exercise</th>
              <th className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] py-2 text-right">Sessions</th>
              <th className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] py-2 text-right">Avg</th>
              <th className="font-mono uppercase tracking-[0.14em] text-[0.65rem] text-[var(--ledger-muted)] py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: ExerciseSpend) => (
              <tr key={r.exercise_id} className="border-b border-[var(--ledger-rule)] last:border-b-0">
                <td className="py-2 font-mono text-[0.75rem] text-[var(--ledger-ink)]">{r.exercise_id}</td>
                <td className="py-2 font-mono tabular-nums text-right">{NUM_FMT.format(r.sessions)}</td>
                <td className="py-2 font-mono tabular-nums text-right text-[var(--ledger-muted)]">
                  {r.avgUsd < 0.01 ? '<$0.01' : USD_FMT.format(r.avgUsd)}
                </td>
                <td className="py-2 font-mono tabular-nums text-right">{USD_FMT.format(r.totalUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </LedgerCard>
  );
}

export default async function AdminSandboxPage() {
  const [spend, volume, flagged, top] = await Promise.all([
    loadSandboxSpend(7),
    loadSandboxVolume(7),
    loadFlaggedSessions(7, 20),
    loadTopExercisesBySpend(7, 10),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <KickerLabel>Operator sandbox</KickerLabel>
        <h1 className="font-serif text-4xl mt-1 leading-tight">Cost &amp; abuse signals</h1>
        <p className="text-sm text-[var(--ledger-muted)] mt-2 max-w-2xl">
          Where the LLM budget is going and where guardrails are firing. The daily-cap
          circuit breaker is enforced by sandbox-service — this page is the read
          surface that tells you whether to lower the cap, ban an exercise, or page
          someone. No transcripts; aggregates only.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <SpendPanel data={spend} />
        <VolumePanel data={volume} />
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <FlaggedPanel data={flagged} />
        <TopExercisesPanel data={top} />
      </section>
    </div>
  );
}
