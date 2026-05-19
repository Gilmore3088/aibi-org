'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ToolboxSkill } from '@/lib/toolbox/types';

export function ContextStrip() {
  const [skills, setSkills] = useState<ToolboxSkill[] | null>(null);

  useEffect(() => {
    fetch('/api/toolbox/skills', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { skills: ToolboxSkill[] }) => setSkills(data.skills ?? []))
      .catch(() => setSkills([]));
  }, []);

  if (!skills || skills.length === 0) return null;

  const lastUsed = skills[0];

  return (
    <div className="border-t border-[color:var(--ledger-ink)]/10 bg-[color:var(--ledger-paper)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-10">
        <p className="text-sm text-[color:var(--ledger-muted)]">
          Welcome back. You have{' '}
          <span className="font-mono tabular-nums text-[color:var(--ledger-ink)]">{skills.length}</span>{' '}
          saved playbook{skills.length === 1 ? '' : 's'}. Most recent:{' '}
          <span className="text-[color:var(--ledger-ink)]">{lastUsed.name}</span>.
        </p>
        <Link
          href="/dashboard/toolbox?tab=toolbox"
          className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--ledger-accent)] hover:text-[color:var(--ledger-ink)]"
        >
          Continue →
        </Link>
      </div>
    </div>
  );
}
