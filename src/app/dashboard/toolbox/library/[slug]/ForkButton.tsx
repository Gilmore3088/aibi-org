// src/app/dashboard/toolbox/library/[slug]/ForkButton.tsx
//
// Plan C — client component that POSTs to the Fork API and routes the user to
// the Skill Builder edit view for the new personal copy.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ForkButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFork() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/toolbox/library/${slug}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Fork failed (${res.status})`);
      }
      const body = (await res.json()) as { id: string };
      router.push(`/dashboard/toolbox?forked=${encodeURIComponent(body.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fork failed.');
      setPending(false);
    }
  }

  return (
    <div className="flex w-fit flex-col gap-2">
      <button
        type="button"
        onClick={onFork}
        disabled={pending}
        className="inline-flex items-center bg-[color:var(--color-terra)] px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-[color:var(--color-terra-light)] disabled:opacity-60"
      >
        {pending ? 'Forking…' : 'Fork to my Toolbox'}
      </button>
      {error && (
        <p role="alert" className="text-xs text-[color:var(--color-error)]">
          {error}
        </p>
      )}
    </div>
  );
}
