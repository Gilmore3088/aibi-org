'use client';

// SaveAsArtifactButton — used by worksheet + sandbox views to persist the
// learner's output as a Toolbox artifact. Surfaces the free-tier cap (402)
// inline with gate-fork copy when the cap is hit.

import { useState } from 'react';
import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import type { ArtifactType } from './types';

interface SaveAsArtifactButtonProps {
  readonly type: ArtifactType;
  readonly title: string;
  readonly body_md: string;
  readonly lesson_id?: string | null;
  readonly track?: string | null;
  readonly disabled?: boolean;
  readonly disabledReason?: string;
  readonly onSaved?: (id: string) => void;
}

type State =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; id: string }
  | { kind: 'capped' }
  | { kind: 'no_identity' }
  | { kind: 'error'; message: string };

export function SaveAsArtifactButton({
  type,
  title,
  body_md,
  lesson_id = null,
  track = null,
  disabled,
  disabledReason,
  onSaved,
}: SaveAsArtifactButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function save() {
    setState({ kind: 'saving' });
    try {
      const res = await fetch('/api/addie/toolbox/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, body_md, lesson_id, track }),
      });
      if (res.status === 401) return setState({ kind: 'no_identity' });
      if (res.status === 402) return setState({ kind: 'capped' });
      if (!res.ok) return setState({ kind: 'error', message: `HTTP ${res.status}` });
      const data = (await res.json()) as { id: string };
      setState({ kind: 'saved', id: data.id });
      onSaved?.(data.id);
    } catch (e) {
      setState({ kind: 'error', message: e instanceof Error ? e.message : 'unknown' });
    }
  }

  if (state.kind === 'saved') {
    return (
      <div className="border-l-[2px] border-l-[var(--ledger-ink)] bg-[var(--ledger-paper)] px-3 py-2">
        <p className="text-sm text-[var(--ledger-ink)]">
          Saved to your Toolbox.{' '}
          <Link href={`/foundation/dashboard/toolbox/${state.id}`} className="underline underline-offset-4">
            Open
          </Link>
        </p>
      </div>
    );
  }
  if (state.kind === 'capped') {
    return (
      <div className="border-l-[2px] border-l-[var(--ledger-accent)] bg-[var(--ledger-paper)] px-3 py-2">
        <p className="text-sm text-[var(--ledger-ink)]">
          You&apos;ve saved the free 4. To keep more,{' '}
          <Link href="/foundation/gate" className="underline underline-offset-4">
            choose a path
          </Link>
          .
        </p>
      </div>
    );
  }
  if (state.kind === 'no_identity') {
    return (
      <div className="border-l-[2px] border-l-[var(--ledger-accent-2)] bg-[var(--ledger-paper)] px-3 py-2">
        <p className="text-sm text-[var(--ledger-ink)]">
          Saving requires an email.{' '}
          <Link href="/foundation/gate" className="underline underline-offset-4">
            Add yours to keep this
          </Link>
          .
        </p>
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div className="border-l-[2px] border-l-[var(--ledger-weak)] bg-[var(--ledger-paper)] px-3 py-2">
        <p className="text-sm text-[var(--ledger-weak)]">Save failed ({state.message}). Try again.</p>
      </div>
    );
  }
  return (
    <LedgerButton
      variant="secondary"
      size="sm"
      onClick={save}
      disabled={disabled || state.kind === 'saving'}
      loading={state.kind === 'saving'}
      title={disabled ? disabledReason : undefined}
    >
      Save to Toolbox
    </LedgerButton>
  );
}
