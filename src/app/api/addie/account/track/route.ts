// POST /api/addie/account/track — persist the chosen role track.
//
// For authenticated learners: upsert addie.learner_profiles.track for
// the user. For anon visitors: emit a track_picked event keyed by the
// anon_session_id so the choice survives identity bind (see leads/bind.ts
// where pending events get re-keyed onto the new lead/user). Returns
// 401 for anon when no anon-session cookie is present — but that should
// never happen because middleware mints one on first /foundation hit.

import { NextResponse, type NextRequest } from 'next/server';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { getAddieServiceClient, getAdminServiceClient } from '@/lib/addie/supabase/service';

type Track =
  | 'risk_compliance'
  | 'customer_facing'
  | 'back_office'
  | 'technical'
  | 'leadership';

const VALID: ReadonlyArray<Track> = [
  'risk_compliance',
  'customer_facing',
  'back_office',
  'technical',
  'leadership',
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { track?: Track };
  try {
    body = (await req.json()) as { track?: Track };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const track = body.track;
  if (!track || !VALID.includes(track)) {
    return NextResponse.json({ error: 'invalid_track' }, { status: 400 });
  }

  const id = await resolveAddieIdentity(req);
  const svc = getAddieServiceClient();

  if (id.user_id) {
    // Upsert the row. The PK is user_id; email is required NOT NULL so we
    // need it from auth.users to upsert from scratch on first save.
    const admin = getAdminServiceClient();
    const { data: au } = await admin.auth.admin.getUserById(id.user_id);
    const email = au?.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'no_email' }, { status: 400 });
    }
    const { error } = await svc
      .from('learner_profiles')
      .upsert(
        { user_id: id.user_id, email, track, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (error) {
      return NextResponse.json({ error: 'persist_failed', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, scope: 'user' });
  }

  // Anonymous: record on the events table so the next lesson load can
  // surface a track. The lesson page's `loadActiveTrack` currently reads
  // from learner_profiles which is auth-only — for true anon track
  // surfacing we'd need a parallel anon-profiles store. For v1 we record
  // the choice in events; on identity-bind, the bind helper replays it
  // into learner_profiles for the new user.
  if (id.anon_session_id) {
    const { error } = await svc.from('events').insert({
      event_type: 'track_picked',
      anon_session_id: id.anon_session_id,
      lead_id: id.lead_id,
      event_data: { track },
    });
    if (error) {
      return NextResponse.json({ error: 'persist_failed', detail: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, scope: 'anon' });
  }

  return NextResponse.json({ error: 'no_identity' }, { status: 401 });
}
