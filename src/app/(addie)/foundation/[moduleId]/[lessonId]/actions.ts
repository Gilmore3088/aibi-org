'use server';

// Server action — set the learner's track on addie.learner_profiles.
// Only callable when the user is authenticated.

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { getAddieServiceClient } from '@/lib/addie/supabase/service';
import type { Track } from '@/components/addie/lesson/types';

const VALID_TRACKS: ReadonlySet<Track> = new Set<Track>([
  'risk_compliance',
  'customer_facing',
  'back_office',
  'technical',
  'leadership',
]);

export async function setTrack(track: Track): Promise<{ ok: boolean; error?: string }> {
  if (!VALID_TRACKS.has(track)) return { ok: false, error: 'invalid_track' };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return { ok: false, error: 'supabase_not_configured' };

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
    if (!data.user) return { ok: false, error: 'no_session' };

    const svc = getAddieServiceClient();
    const { error } = await svc
      .from('learner_profiles')
      .update({ track })
      .eq('user_id', data.user.id);
    if (error) return { ok: false, error: error.message };

    revalidatePath('/foundation', 'layout');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' };
  }
}
