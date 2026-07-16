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
import { defineRoute } from '@/lib/api/handler';
import { EMAIL_RE } from '@/lib/email/validate';

interface SaveProficiencyPayload {
  email: string;
  pctCorrect: number;
  levelId: string;
  levelLabel: string;
  topicScores: unknown[];
  completedAt: string;
}

function isValidPayload(p: unknown): p is SaveProficiencyPayload {
  if (typeof p !== 'object' || p === null) return false;
  const b = p as Record<string, unknown>;
  if (typeof b.email !== 'string' || !EMAIL_RE.test(b.email)) return false;
  if (typeof b.pctCorrect !== 'number' || b.pctCorrect < 0 || b.pctCorrect > 100) return false;
  if (typeof b.levelId !== 'string' || b.levelId.length === 0) return false;
  if (typeof b.levelLabel !== 'string' || b.levelLabel.length === 0) return false;
  if (!Array.isArray(b.topicScores)) return false;
  if (typeof b.completedAt !== 'string' || b.completedAt.length === 0) return false;
  return true;
}

export const POST = defineRoute(
  { requireAuth: true, unauthorizedMessage: 'Authentication required.', validate: isValidPayload },
  async ({ body, user }) => {
    const { email, pctCorrect, levelId, levelLabel, topicScores, completedAt } = body;

    // Email in the payload must match the authenticated session. Without
    // this check a logged-in user could overwrite anyone else's exam
    // history by passing a different email.
    if (user!.email?.toLowerCase() !== email.toLowerCase()) {
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
  },
);
