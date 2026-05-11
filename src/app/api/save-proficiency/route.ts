// POST /api/save-proficiency
// Persists a proficiency exam result to Supabase user_profiles.
//
// Auth model: requires an authenticated Supabase session AND the
// session email must match the payload email. The proficiency exam
// lives behind /certifications/exam/foundation which already requires
// auth, so this gate matches the surrounding flow and prevents anyone
// from overwriting another user's exam history by knowing their email.
//
// Best-effort write: returns 200 even on Supabase failure so the
// client-side localStorage write is always the source of truth for
// the current device.

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { upsertProficiencyResult } from '@/lib/supabase/user-profiles';
import { getAuthUser } from '@/lib/api/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SaveProficiencyPayload {
  email?: unknown;
  pctCorrect?: unknown;
  levelId?: unknown;
  levelLabel?: unknown;
  topicScores?: unknown;
  completedAt?: unknown;
}

function isValidPayload(p: SaveProficiencyPayload): p is {
  email: string;
  pctCorrect: number;
  levelId: string;
  levelLabel: string;
  topicScores: unknown[];
  completedAt: string;
} {
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return false;
  if (typeof p.pctCorrect !== 'number' || p.pctCorrect < 0 || p.pctCorrect > 100) return false;
  if (typeof p.levelId !== 'string' || p.levelId.length === 0) return false;
  if (typeof p.levelLabel !== 'string' || p.levelLabel.length === 0) return false;
  if (!Array.isArray(p.topicScores)) return false;
  if (typeof p.completedAt !== 'string' || p.completedAt.length === 0) return false;
  return true;
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let body: SaveProficiencyPayload;
  try {
    body = (await request.json()) as SaveProficiencyPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const { email, pctCorrect, levelId, levelLabel, topicScores, completedAt } = body;

  // Email in the payload must match the authenticated session. Without
  // this check a logged-in user could overwrite anyone else's exam
  // history by passing a different email.
  if (user.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Payload email does not match session.' },
      { status: 403 },
    );
  }

  if (isSupabaseConfigured()) {
    await upsertProficiencyResult(email, {
      pctCorrect,
      levelId,
      levelLabel,
      topicScores: topicScores as Parameters<typeof upsertProficiencyResult>[1]['topicScores'],
      completedAt,
    }).catch((err) => console.warn('[save-proficiency] supabase skip', err));
  }

  return NextResponse.json({ ok: true });
}
