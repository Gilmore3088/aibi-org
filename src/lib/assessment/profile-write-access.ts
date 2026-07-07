// Ownership guard for the bare-profileId write endpoints
// (in-depth institution-context and action-packet notes).
//
// These endpoints identify the target row by a profile UUID carried in the
// shareable /results/{id} bearer link. Reads are intentionally
// anyone-with-the-link; WRITES must not let one *authenticated* user pivot to
// a different user's profile by supplying that user's UUID. When a Supabase
// session is present we therefore require it to own the target profile. The
// logged-out post-purchase path (no session) is preserved: institution-context
// uses the Stripe-session branch instead, and the results page keeps working
// for a logged-out owner editing their own notes.

import { getAuthUser } from '@/lib/api/auth';
import type { createServiceRoleClient } from '@/lib/supabase/client';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export type ProfileWriteAccess =
  | { ok: true }
  | { ok: false; status: 403 | 404 };

export async function checkProfileWriteAccess(
  client: ServiceClient,
  profileId: string,
): Promise<ProfileWriteAccess> {
  const { data, error } = await client
    .from('user_profiles')
    .select('id, user_id')
    .eq('id', profileId)
    .maybeSingle<{ id: string; user_id: string | null }>();

  if (error) throw new Error(error.message);
  if (!data) return { ok: false, status: 404 };

  const authUser = await getAuthUser();
  // Block a signed-in caller from writing a profile that belongs to someone
  // else. A profile with no linked user_id (assessment taken before signup)
  // can't be proven to belong to anyone, so it falls back to the bearer model.
  if (authUser && data.user_id && data.user_id !== authUser.id) {
    return { ok: false, status: 403 };
  }
  return { ok: true };
}
