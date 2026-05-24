// /admin/analytics — operator dashboard.
// Server component. Reads addie.* via service-role queries. Four panels:
// funnel, gate conversion, toolbox reuse, lead pipeline.

import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerCard } from '@/components/addie/shared/LedgerCard';
import {
  loadFunnel,
  loadGateConversion,
  loadToolboxReuse,
  loadPipeline,
  type GateConversionDay,
  type FunnelStep,
  type PipelineCard,
} from '@/lib/addie/analytics/queries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NUM_FMT = new Intl.NumberFormat('en-US');
const PCT_FMT = (n: number) => `${n.toFixed(1)}%`;

function PanelHeader({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <KickerLabel>{kicker}</KickerLabel>
      <h2 className="font-serif text-2xl mt-1 leading-tight">{title}</h2>
      {sub ? (
        <p className="text-sm text-[var(--ledger-muted)] mt-1">{sub}</p>
      ) : null}
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

function FunnelPanel({ data }: { data: Awaited<ReturnType<typeof loadFunnel>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  const total = data.steps[0]?.count ?? 0;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Funnel"
        title="Anonymous session to gate decision"
        sub={`Last ${data.windowDays} days · counts use distinct anonymous sessions`}
      />
      {total === 0 ? (
        <EmptyNote>No anonymous sessions in the last {data.windowDays} days yet.</EmptyNote>
      ) : (
        <ol className="space-y-3">
          {data.steps.map((step: FunnelStep) => (
            <li key={step.label} className="grid grid-cols-[1fr_auto_4rem] items-baseline gap-4">
              <span className="text-sm text-[var(--ledger-ink-2)]">{step.label}</span>
              <span className="font-mono tabular-nums text-base">
                {NUM_FMT.format(step.count)}
              </span>
              <span className="font-mono tabular-nums text-xs text-[var(--ledger-muted)] text-right">
                {step.pctOfStart.toFixed(0)}%
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6 border-t border-[var(--ledger-rule)] pt-4 grid grid-cols-3 gap-4 text-center">
        <ForkCell label="Paid" count={data.gateForks.paid} />
        <ForkCell label="Email" count={data.gateForks.email} />
        <ForkCell label="Decline" count={data.gateForks.decline} />
      </div>
    </LedgerCard>
  );
}

function ForkCell({ label, count }: { label: string; count: number }) {
  return (
    <div>
      <KickerLabel>{label}</KickerLabel>
      <div className="font-serif text-2xl tabular-nums mt-1">{NUM_FMT.format(count)}</div>
    </div>
  );
}

function GateConversionPanel({ data }: { data: Awaited<ReturnType<typeof loadGateConversion>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  const total = data.total.paid + data.total.email + data.total.decline;
  const maxDay = Math.max(
    1,
    ...data.days.map((d: GateConversionDay) => d.paid + d.email + d.decline),
  );
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Gate conversion"
        title="Where visitors land at the gate"
        sub={`Last ${data.windowDays} days`}
      />
      {total === 0 ? (
        <EmptyNote>No gate decisions in the last {data.windowDays} days yet.</EmptyNote>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <ForkPctCell label="Paid" count={data.total.paid} pct={data.pct.paid} />
            <ForkPctCell label="Email" count={data.total.email} pct={data.pct.email} />
            <ForkPctCell label="Decline" count={data.total.decline} pct={data.pct.decline} />
          </div>
          <div>
            <KickerLabel>7-day trend</KickerLabel>
            <div className="mt-2 flex items-end gap-2 h-24" role="img" aria-label="7-day gate decision trend">
              {data.days.map((d: GateConversionDay) => {
                const sum = d.paid + d.email + d.decline;
                const h = Math.round((sum / maxDay) * 100);
                const day = new Date(d.day + 'T00:00:00Z').toLocaleDateString('en-US', {
                  weekday: 'short',
                  timeZone: 'UTC',
                });
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[var(--ledger-ink)] border-t-2 border-[var(--ledger-accent)]"
                      style={{ height: `${h}%`, minHeight: sum > 0 ? '2px' : '0' }}
                      title={`${d.day}: ${sum} decisions`}
                    />
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--ledger-muted)]">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </LedgerCard>
  );
}

function ForkPctCell({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <div className="border-l-2 border-[var(--ledger-rule-strong)] pl-3">
      <KickerLabel>{label}</KickerLabel>
      <div className="font-serif text-2xl tabular-nums mt-1">{PCT_FMT(pct)}</div>
      <div className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums">
        {NUM_FMT.format(count)} {count === 1 ? 'decision' : 'decisions'}
      </div>
    </div>
  );
}

function ToolboxReusePanel({ data }: { data: Awaited<ReturnType<typeof loadToolboxReuse>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Toolbox reuse"
        title="Saved artifacts re-opened seven days later"
        sub={data.windowLabel}
      />
      {data.savedCount === 0 ? (
        <EmptyNote>No artifacts old enough to measure reuse yet.</EmptyNote>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <KickerLabel>Reuse rate</KickerLabel>
            <div className="font-serif text-4xl tabular-nums mt-1">{PCT_FMT(data.reusePct)}</div>
            <div className="font-mono text-xs text-[var(--ledger-muted)] tabular-nums mt-1">
              {NUM_FMT.format(data.reusedCount)} of {NUM_FMT.format(data.savedCount)} items
            </div>
          </div>
          <div>
            <KickerLabel>Median time to reuse</KickerLabel>
            <div className="font-serif text-4xl tabular-nums mt-1">
              {data.medianTimeToReuseHours === null
                ? '—'
                : data.medianTimeToReuseHours >= 24
                  ? `${(data.medianTimeToReuseHours / 24).toFixed(1)}d`
                  : `${data.medianTimeToReuseHours.toFixed(1)}h`}
            </div>
          </div>
        </div>
      )}
    </LedgerCard>
  );
}

function PipelinePanel({ data }: { data: Awaited<ReturnType<typeof loadPipeline>> }) {
  if (data.error) return <ErrorPanel message={data.error} />;
  if (data.cards.length === 0) {
    return (
      <LedgerCard variant="standard" className="p-6">
        <PanelHeader kicker="Lead pipeline" title="Pipeline at a glance" />
        <EmptyNote>No pipeline data yet.</EmptyNote>
      </LedgerCard>
    );
  }
  return (
    <LedgerCard variant="standard" className="p-6">
      <PanelHeader
        kicker="Lead pipeline"
        title="Pipeline at a glance"
        sub="Deltas compare the last 7 days against the prior 7"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.cards.map((card: PipelineCard) => {
          const positive = card.delta7d >= 0;
          return (
            <div
              key={card.label}
              className="border-l-2 border-[var(--ledger-rule-strong)] pl-4 py-1"
            >
              <KickerLabel>{card.label}</KickerLabel>
              <div className="font-serif text-3xl tabular-nums mt-1">
                {NUM_FMT.format(card.count)}
              </div>
              <div
                className={`font-mono text-xs tabular-nums mt-1 ${
                  positive ? 'text-[var(--ledger-ink-2)]' : 'text-[var(--ledger-weak)]'
                }`}
              >
                {positive ? '+' : ''}
                {NUM_FMT.format(card.delta7d)} vs prior 7d
              </div>
            </div>
          );
        })}
      </div>
    </LedgerCard>
  );
}

export default async function AdminAnalyticsPage() {
  const [funnel, gate, reuse, pipeline] = await Promise.all([
    loadFunnel(30),
    loadGateConversion(7),
    loadToolboxReuse(),
    loadPipeline(),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <KickerLabel>Operator analytics</KickerLabel>
        <h1 className="font-serif text-4xl mt-1 leading-tight">Foundation Course read surface</h1>
        <p className="text-sm text-[var(--ledger-muted)] mt-2 max-w-2xl">
          The two headline KPIs (gate conversion and Toolbox reuse) plus the
          funnel that feeds them. Counts are computed at request time from the
          events spine. Aggregates only — no artifact bodies or transcripts.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <FunnelPanel data={funnel} />
        <GateConversionPanel data={gate} />
        <ToolboxReusePanel data={reuse} />
        <PipelinePanel data={pipeline} />
      </section>
    </div>
  );
}
