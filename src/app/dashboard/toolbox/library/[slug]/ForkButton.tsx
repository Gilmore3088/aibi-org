// src/app/dashboard/toolbox/library/[slug]/ForkButton.tsx
//
// Plan F — client component that POSTs to /api/toolbox/save with
// origin='library' and routes the user to the dashboard with the new
// personal copy's id. Replaces the Plan C dedicated /fork route.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForkButtonProps {
  readonly librarySkillId: string;
  readonly versionId: string;
}

export function ForkButton({ librarySkillId, versionId }: ForkButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/toolbox/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: 'library',
          payload: { librarySkillId, versionId },
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Save failed (${res.status})`);
      }
      const body = (await res.json()) as { id: string };
      router.push(`/dashboard/toolbox?forked=${encodeURIComponent(body.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
      setPending(false);
    }
  }

  return (
    <div className="flex w-fit flex-col gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="inline-flex items-center bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-[color:var(--color-terra-light)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save to Toolbox'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
