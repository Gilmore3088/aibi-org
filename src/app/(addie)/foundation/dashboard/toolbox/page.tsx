// /foundation/dashboard/toolbox — full Toolbox list.

import { cookies } from 'next/headers';
import { headers as nextHeaders } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { listItemsFor, isOverFreeCap } from '@/lib/addie/toolbox/items';
import { ToolboxItemCard } from '@/components/addie/toolbox/ToolboxItemCard';
import { KickerLabel } from '@/components/addie/shared/KickerLabel';
import { LedgerButton } from '@/components/addie/shared/LedgerButton';
import Link from 'next/link';
import { FREE_TIER_ARTIFACT_CAP } from '@/lib/addie/toolbox/items';

export const dynamic = 'force-dynamic';

interface ViewData {
  signedIn: boolean;
  unlimited: boolean;
  items: Awaited<ReturnType<typeof listItemsFor>>;
  count: number;
}

async function loadView(): Promise<ViewData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const empty: ViewData = { signedIn: false, unlimited: false, items: [], count: 0 };
  if (!supabaseUrl || !supabaseAnonKey) return empty;
  try {
    const cookieStore = await cookies();
    const supa = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          /* no-op */
        },
      },
    });
    const { data } = await supa.auth.getUser();
    const userId = data.user?.id ?? null;
    if (!userId) return empty;
    const items = await listItemsFor({ user_id: userId, lead_id: null });
    const cap = await isOverFreeCap({ user_id: userId, lead_id: null });
    return { signedIn: true, unlimited: cap.unlimited, items, count: items.length };
  } catch (err) {
    console.warn('[dashboard/toolbox] load failed:', err);
    return empty;
  }
}

export default async function ToolboxPage() {
  void (await nextHeaders());
  const d = await loadView();

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <header className="border-b border-[var(--ledger-rule)] pb-5 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <KickerLabel tone="muted">Toolbox</KickerLabel>
          <h1 className="mt-2 font-serif text-3xl text-[var(--ledger-ink)]">Your artifacts</h1>
          <p className="mt-1 text-sm text-[var(--ledger-muted)]">
            {d.unlimited
              ? 'Unlimited (paid)'
              : `${d.count} of ${FREE_TIER_ARTIFACT_CAP} free saves used`}
          </p>
        </div>
        <Link href="/foundation">
          <LedgerButton variant="secondary" size="sm">Back to course</LedgerButton>
        </Link>
      </header>
      {!d.signedIn ? (
        <p className="text-[var(--ledger-muted)]">
          Sign in to see your Toolbox. Anonymous saves require an email — visit the gate to add one.
        </p>
      ) : d.items.length === 0 ? (
        <p className="text-[var(--ledger-muted)]">
          You haven&apos;t saved anything yet. Every lesson produces something — that&apos;s the
          Toolbox.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {d.items.map((it) => (
            <li key={it.id}>
              <ToolboxItemCard item={it} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
