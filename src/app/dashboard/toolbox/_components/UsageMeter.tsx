'use client';

import { useEffect, useState, useCallback } from 'react';

type State = 'neutral' | 'warning' | 'blocked';

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function UsageMeter({ todayCents, dailyCapCents }: { todayCents: number; dailyCapCents: number }) {
  const ratio = dailyCapCents === 0 ? 0 : todayCents / dailyCapCents;
  const state: State = ratio >= 1 ? 'blocked' : ratio >= 0.8 ? 'warning' : 'neutral';
  const fillPct = Math.min(100, Math.round(ratio * 100));

  const fillColor =
    state === 'blocked' ? 'bg-[var(--color-error)]' :
    state === 'warning' ? 'bg-[var(--color-terra)]' :
    'bg-[var(--color-sage)]';

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono tabular-nums">
          {formatDollars(todayCents)} / {formatDollars(dailyCapCents)} today
        </span>
        {state === 'warning' && <span className="text-[var(--color-terra)]">Approaching daily cap</span>}
        {state === 'blocked' && <span className="text-[var(--color-error)]">Daily cap reached. Resets at UTC midnight.</span>}
      </div>
      <div role="progressbar" data-state={state} aria-valuenow={fillPct} aria-valuemin={0} aria-valuemax={100}
           className="h-1 w-full bg-ink/10 rounded">
        <div className={`h-1 rounded ${fillColor}`} style={{ width: `${fillPct}%` }} />
      </div>
    </div>
  );
}

interface UsageData {
  todayCents: number;
  dailyCapCents: number;
  monthCents: number;
  monthlyCapCents: number;
}

export function useUsage(): { usage: UsageData | null; refresh: () => void } {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/toolbox/usage');
      if (!res.ok) return;
      setUsage(await res.json());
    } catch {
      /* swallow — meter is non-critical */
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { usage, refresh };
}
