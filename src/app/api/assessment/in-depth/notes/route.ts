// PATCH /api/assessment/in-depth/notes
// Saves personal follow-up notes on the Action Packet. Access is bearer-
// token auth: the profileId in the body is the UUID that controls read
// access on /assessment/in-depth/results/[id] — same security model.
//
// Max 20 000 characters (~5 pages of text). Trims trailing whitespace.
// Idempotent: re-sending the same notes is a no-op.

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';
import { checkProfileWriteAccess } from '@/lib/assessment/profile-write-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CHARS = 20_000;
const UUID_RE = /^[0-9a-f-]{36}$/i;

interface NotesBody {
  profileId?: unknown;
  notes?: unknown;
}

export async function PATCH(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
  }

  const limited = await rateLimitOrFail({
    key: 'action-packet-notes',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 60,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: NotesBody;
  try {
    body = (await request.json()) as NotesBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { profileId, notes } = body;

  if (typeof profileId !== 'string' || !UUID_RE.test(profileId)) {
    return NextResponse.json({ error: 'Invalid profileId.' }, { status: 400 });
  }

  if (notes !== null && notes !== undefined && typeof notes !== 'string') {
    return NextResponse.json({ error: 'notes must be a string or null.' }, { status: 400 });
  }

  const notesValue = notes === null || notes === undefined
    ? null
    : (notes as string).trim().slice(0, MAX_CHARS);

  const client = createServiceRoleClient();

  // Verify the profile exists AND — if the caller is signed in — that they own
  // it, so an authenticated user can't write another user's profile by UUID.
  const access = await checkProfileWriteAccess(client, profileId);
  if (!access.ok) {
    const error = access.status === 404 ? 'Profile not found.' : 'Not authorized to edit this profile.';
    return NextResponse.json({ error }, { status: access.status });
  }

  const { error: writeError } = await client
    .from('user_profiles')
    .update({ action_packet_notes: notesValue })
    .eq('id', profileId);

  if (writeError) {
    console.error('[action-packet-notes] write error:', writeError.message);
    return NextResponse.json({ error: 'Failed to save notes.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
