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
    <article
      style={{
        border: '1px solid var(--ink-a10)',
        borderRadius: 16,
        background: 'var(--cream-2)',
        padding: 20,
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--gold-deep)',
          margin: '0 0 8px',
        }}
      >
        Completion status
      </p>
      <p
        style={{
          fontSize: '1rem',
          color: 'var(--slate-600)',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {formatStatus(status)}
      </p>
    </article>
  );
}

function formatStatus(status: ArtifactStatus): string {
  if (status === 'in-progress') return 'In progress';
  return status.charAt(0).toUpperCase() + status.slice(1);
}
