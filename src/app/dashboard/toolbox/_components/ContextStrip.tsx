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
    <div className="border-t border-[color:var(--ink-a10)] bg-[color:var(--cream)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-10">
        <p className="text-sm text-[color:var(--slate-600)]">
          Welcome back. You have{' '}
          <span className="tabular-nums font-semibold text-[color:var(--ink)]">{skills.length}</span>{' '}
          saved prompt{skills.length === 1 ? '' : 's'}. Most recent:{' '}
          <span className="font-semibold text-[color:var(--ink)]">{lastUsed.name}</span>.
        </p>
        <Link
          href="/dashboard/toolbox?tab=toolbox"
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--gold-deep)] hover:text-[color:var(--ink)]"
        >
          Continue →
        </Link>
      </div>
    </div>
  );
}
