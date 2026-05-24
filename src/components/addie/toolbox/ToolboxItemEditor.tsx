'use client';

// ToolboxItemEditor — simple edit form (title + body_md textarea). PATCH
// appends a new version; we never destroy history.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import { LedgerInput } from '@/components/addie/shared/LedgerInput';
import type { ArtifactType } from '@/lib/addie/toolbox/items';

interface ToolboxItemEditorProps {
  readonly itemId: string;
  readonly initialTitle: string;
  readonly initialBody: string;
  readonly version: number;
  readonly type: ArtifactType;
}

export function ToolboxItemEditor({
  itemId,
  initialTitle,
  initialBody,
  version,
  type,
}: ToolboxItemEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const viewerHref = `/foundation/dashboard/toolbox/${itemId}`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (body.trim().length === 0) {
      setError('Body cannot be empty.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/addie/toolbox/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body_md: body, title }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      router.push(viewerHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save}>
      <nav aria-label="Breadcrumb" className="mb-3">
        <Link
          href={viewerHref}
          className="font-mono uppercase tracking-[0.16em] text-[0.7rem] text-[var(--ledger-muted)] hover:text-[var(--ledger-ink)]"
        >
          &larr; Cancel
        </Link>
      </nav>
      <header className="border-b border-[var(--ledger-rule)] pb-4 mb-6">
        <KickerLabel tone="muted">Edit {type.replace(/_/g, ' ')}</KickerLabel>
        <p className="mt-2 font-mono text-[0.7rem] text-[var(--ledger-muted)]">
          Saving creates v{version + 1}. Earlier versions stay in the history.
        </p>
      </header>

      <div className="space-y-5">
        <LedgerInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
        <div>
          <label
            htmlFor="body_md"
            className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[var(--ledger-ink-2)] mb-2"
          >
            Body (markdown)
          </label>
          <textarea
            id="body_md"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={24}
            className="block w-full font-mono text-sm bg-[var(--ledger-paper)] border border-[var(--ledger-rule-strong)] rounded-[2px] p-3 text-[var(--ledger-ink)] focus:outline-none focus:border-[var(--ledger-ink)] focus:border-l-[2px] focus:border-l-[var(--ledger-accent)]"
            required
            maxLength={50000}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-[var(--ledger-weak)]">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <LedgerButton
            type="submit"
            variant="primary"
            size="md"
            loading={pending}
            disabled={pending}
          >
            Save changes
          </LedgerButton>
          <Link href={viewerHref}>
            <LedgerButton type="button" variant="tertiary" size="md">
              Cancel
            </LedgerButton>
          </Link>
        </div>
      </div>
    </form>
  );
}
