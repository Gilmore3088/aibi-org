'use client';

import { useEffect, useState } from 'react';
import type { ArtifactStatus } from '@/types/lms';

interface ArtifactStatusPanelProps {
  readonly artifactId: string;
}

interface DashboardArtifact {
  readonly id: string;
  readonly status: ArtifactStatus;
}

export function ArtifactStatusPanel({ artifactId }: ArtifactStatusPanelProps) {
  const [status, setStatus] = useState<ArtifactStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadArtifactStatus() {
      try {
        const response = await fetch('/api/dashboard/learner', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as {
          artifacts?: readonly DashboardArtifact[];
        };
        const artifact = data.artifacts?.find((item) => item.id === artifactId);
        if (!cancelled && artifact) setStatus(artifact.status);
      } catch {
        // Anonymous users can still view static artifact detail.
      }
    }

    loadArtifactStatus();

    return () => {
      cancelled = true;
    };
  }, [artifactId]);

  if (!status) return null;

  return (
    <article className="border border-[color:var(--color-ink)]/10 rounded-[3px] bg-[color:var(--color-parch)] p-5">
      <p className="font-serif-sc text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-2">
        Completion status
      </p>
      <p className="text-sm text-[color:var(--color-slate)] leading-relaxed">
        {formatStatus(status)}
      </p>
    </article>
  );
}

function formatStatus(status: ArtifactStatus): string {
  if (status === 'in-progress') return 'In progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
}
