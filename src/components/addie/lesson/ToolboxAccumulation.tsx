'use client';

// ToolboxAccumulation — visible accumulation of every saved artifact.
//
// Per the Transformation Vision: "The Toolbox is your strongest concept
// and currently your weakest visual execution... users need to FEEL
// progress, not just read about progress." This is the GitHub-graph /
// Duolingo-streak / Linear-completed-tasks treatment for saved artifacts.
//
// Render:
//   - Grid of cells, one per saved artifact, grouped by artifact type
//   - Empty cells for the slots a learner CAN still fill (free tier = 4)
//   - Each artifact is a filled square — color by type, hover to see title
//   - Above the grid: kicker + count + "Saved this week / This month"
//   - Below: small CTA to /foundation/dashboard/toolbox for the full view
//
// Fetched from /api/addie/toolbox/items via the existing route.

import { useEffect, useState } from 'react';

interface ToolboxItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly created_at: string;
}

const TYPE_LABEL: Record<string, { short: string; tone: string }> = {
  data_discipline_card: { short: 'Card', tone: 'bg-[var(--ledger-accent)]' },
  ai_toolkit_map:       { short: 'Map',  tone: 'bg-[var(--ledger-ink)]' },
  first_conversation:   { short: 'Run',  tone: 'bg-[var(--ledger-ink-2)]' },
  starter_prompt_pack:  { short: 'Pack', tone: 'bg-[var(--ledger-accent-2)]' },
  skill:                { short: 'Skill', tone: 'bg-[var(--ledger-ink)]' },
  skill_template:       { short: 'Tpl',  tone: 'bg-[var(--ledger-ink-2)]' },
  agent_blueprint:      { short: 'Agt',  tone: 'bg-[var(--ledger-accent-2)]' },
  prd:                  { short: 'PRD',  tone: 'bg-[var(--ledger-accent)]' },
  prototype:            { short: 'Proto', tone: 'bg-[var(--ledger-accent)]' },
  problem_backlog:      { short: 'Bklog', tone: 'bg-[var(--ledger-ink-2)]' },
  where_ai_fits:        { short: 'Wkly', tone: 'bg-[var(--ledger-ink-2)]' },
  tutor_conversation:   { short: 'Ask',  tone: 'bg-[var(--ledger-accent-2)]' },
};

interface ToolboxAccumulationProps {
  readonly variant?: 'inline' | 'full';
}

export function ToolboxAccumulation({ variant = 'inline' }: ToolboxAccumulationProps) {
  const [items, setItems] = useState<ToolboxItem[] | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/addie/toolbox/items', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setItems([]);
          return;
        }
        const data = (await res.json()) as { items?: ToolboxItem[] };
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }
    void load();

    // Listen for the "artifact saved" custom event so the count animates
    // immediately when a learner saves something on the current page.
    const onSaved = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      void load();
    };
    window.addEventListener('aibi:artifact-saved', onSaved);
    return () => {
      cancelled = true;
      window.removeEventListener('aibi:artifact-saved', onSaved);
    };
  }, []);

  if (items === null) {
    return <div className={variant === 'full' ? 'h-32' : 'h-20'} aria-hidden="true" />;
  }

  // Group by type for the grid. Each type gets a row of filled cells +
  // a small empty cell allowance to suggest "more to come."
  const byType = new Map<string, ToolboxItem[]>();
  for (const item of items) {
    const arr = byType.get(item.type) ?? [];
    arr.push(item);
    byType.set(item.type, arr);
  }

  const total = items.length;
  const thisWeek = items.filter((i) => {
    const created = new Date(i.created_at).getTime();
    return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const containerClass = variant === 'full'
    ? 'rounded-[5px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-5'
    : 'rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-4 py-3';

  return (
    <section className={containerClass} aria-label="Your Toolbox">
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-0.5">
            Your Toolbox
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={
                'font-serif tabular-nums text-[var(--ledger-ink)] transition-transform duration-[300ms] ' +
                (variant === 'full' ? 'text-3xl' : 'text-2xl') +
                (pulse ? ' scale-110 text-[var(--ledger-accent)]' : '')
              }
            >
              {total}
            </span>
            <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-muted)]">
              {total === 1 ? 'saved artifact' : 'saved artifacts'}
            </span>
            {thisWeek > 0 ? (
              <span className="font-mono uppercase tracking-[0.14em] text-[0.6rem] text-[var(--ledger-accent)] tabular-nums">
                +{thisWeek} this week
              </span>
            ) : null}
          </div>
        </div>
        <a
          href="/foundation/dashboard/toolbox"
          className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          Open Toolbox →
        </a>
      </header>

      {total === 0 ? (
        <p className="font-serif text-[0.9rem] text-[var(--ledger-muted)] py-3">
          Empty. Save your first artifact and watch the kit fill up.
        </p>
      ) : (
        <div className="space-y-2">
          {Array.from(byType.entries()).map(([type, list]) => {
            const meta = TYPE_LABEL[type] ?? { short: type.slice(0, 4), tone: 'bg-[var(--ledger-rule-strong)]' };
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="w-20 shrink-0 font-mono uppercase tracking-[0.14em] text-[0.55rem] text-[var(--ledger-muted)]">
                  {meta.short}
                </span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {list.map((item) => (
                    <span
                      key={item.id}
                      title={`${item.title} · saved ${new Date(item.created_at).toLocaleDateString()}`}
                      className={`block w-3.5 h-3.5 ${meta.tone} rounded-[1px]`}
                    />
                  ))}
                  {/* Hint at "more slots available" with faint placeholders */}
                  {[0, 1, 2].map((i) => (
                    <span
                      key={`empty-${type}-${i}`}
                      aria-hidden="true"
                      className="block w-3.5 h-3.5 border border-[var(--ledger-rule)] rounded-[1px]"
                    />
                  ))}
                </div>
                <span className="font-mono tabular-nums text-[0.65rem] text-[var(--ledger-muted)] shrink-0 w-6 text-right">
                  {list.length}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
