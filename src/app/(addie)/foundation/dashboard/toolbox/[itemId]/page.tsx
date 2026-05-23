// /foundation/foundation/dashboard/toolbox/[itemId] — single artifact viewer.

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getItem } from '@/lib/addie/toolbox/items';
import { ToolboxItemView } from '@/components/addie/toolbox/ToolboxItemView';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadItem(id: string) {
  if (!UUID_RE.test(id)) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
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
  if (!userId) return null;
  return getItem(id, { user_id: userId, lead_id: null });
}

export default async function ToolboxItemPage({
  params,
}: {
  params: { itemId: string };
}) {
  const out = await loadItem(params.itemId);
  if (!out) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <ToolboxItemView item={out.item} versions={out.versions} />
    </main>
  );
}
