'use client';

// SaveAsArtifactButton — used by worksheet + sandbox views to persist the
// learner's output as a Toolbox artifact. Surfaces:
//   - 402 (free-tier cap) → cap-reached upsell line with link to /foundation/gate
//   - 401 (no identity)  → inline mini-gate-fork (Pay · Email · Decline)
// rendered directly under the button — no page redirect.
//
// body_md is optional. When omitted, the server hydrates the matching
// artifact template (see src/lib/addie/toolbox/templates.ts) so the
// canonical body cannot be tampered with by the client.

import { useState } from 'react';
import Link from 'next/link';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { InlineGateFork } from '@/components/addie/toolbox/InlineGateFork';
import type { ArtifactType } from './types';

interface SaveAsArtifactButtonProps {
  readonly type: ArtifactType;
  readonly title: string;
  /** Optional. When omitted, the server hydrates the artifact template. */
  readonly body_md?: string;
  readonly lesson_id?: string | null;
  /** Human-readable lesson title; passed through for template hydration. */
  readonly lesson_title?: string | null;
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
  lesson_title = null,
  track = null,
  disabled,
  disabledReason,
  onSaved,
}: SaveAsArtifactButtonProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function save() {
    setState({ kind: 'saving' });
    try {
      const payload: Record<string, unknown> = { type, title, lesson_id, lesson_title, track };
      if (body_md !== undefined) payload.body_md = body_md;
      const res = await fetch('/api/addie/toolbox/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
          <Link
            href={`/foundation/dashboard/toolbox/${state.id}`}
            className="underline underline-offset-4"
          >
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
          You have saved the free 4. To keep more,{' '}
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
      <InlineGateFork
        onRetry={() => {
          setState({ kind: 'idle' });
          void save();
        }}
        onDismiss={() => setState({ kind: 'idle' })}
      />
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
