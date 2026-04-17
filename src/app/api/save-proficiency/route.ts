// POST /api/save-proficiency
// Persists a proficiency exam result to Supabase user_profiles.
// The email is read from the caller's existing localStorage profile
// (sent in the request body). No auth session required.
//
// Best-effort: returns 200 even on Supabase failure so the client-side
// localStorage write is always the source of truth for the current device.

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { upsertProficiencyResult } from '@/lib/supabase/user-profiles';

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
