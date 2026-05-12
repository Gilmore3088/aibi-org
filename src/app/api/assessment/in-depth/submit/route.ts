// POST /api/assessment/in-depth/submit
// Persists a completed paid In-Depth Assessment (48 questions) for the
// currently-authenticated user. Requires:
//   1. A valid Supabase auth session (user must be logged in)
//   2. A course_enrollments row with product='in-depth-assessment' for the
//      user (purchased via /api/checkout/in-depth)
//
// Differs from /api/capture-email which is the public 12-question free path
// — this route does NOT have an email gate, does NOT subscribe to ConvertKit
// marketing forms, and does NOT enforce the 8/12 answer-length cap.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { upsertReadinessResult } from '@/lib/supabase/user-profiles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitPayload {
  answers?: unknown;
  score?: unknown;
  maxScore?: unknown;
  tier?: unknown;
  tierLabel?: unknown;
  dimensionBreakdown?: unknown;
}

interface DimensionEntry {
  score: number;
  maxScore: number;
  label: string;
}

type DimensionBreakdown = Record<string, DimensionEntry>;

function isDimensionBreakdown(value: unknown): value is DimensionBreakdown {
  if (typeof value !== 'object' || value === null) return false;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.score !== 'number') return false;
    if (typeof e.maxScore !== 'number') return false;
    if (typeof e.label !== 'string') return false;
  }
  return true;
}

const EXPECTED_QUESTION_COUNT = 48;

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Server not configured.' },
      { status: 503 },
    );
  }

  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { answers, score, maxScore, tier, tierLabel, dimensionBreakdown } = body;

  if (!Array.isArray(answers) || answers.length !== EXPECTED_QUESTION_COUNT) {
    return NextResponse.json(
      { error: `answers must be an array of ${EXPECTED_QUESTION_COUNT} integers (1-4).` },
      { status: 400 },
    );
  }
  if (!answers.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4)) {
    return NextResponse.json(
      { error: 'answers entries must be integers 1-4.' },
      { status: 400 },
    );
  }
  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'score must be a number.' }, { status: 400 });
  }
  // Defensive default: older clients pre-2026-05-12 may omit maxScore.
  // The submit route now expects the raw 48–192 range; fall back to the
  // 4 × question count derivation if a client somehow forgets to send it.
  const persistedMaxScore =
    typeof maxScore === 'number' && Number.isFinite(maxScore) && maxScore > 0
      ? maxScore
      : EXPECTED_QUESTION_COUNT * 4;
  if (typeof tier !== 'string' || tier.length === 0) {
    return NextResponse.json({ error: 'tier required.' }, { status: 400 });
  }
  if (typeof tierLabel !== 'string' || tierLabel.length === 0) {
    return NextResponse.json({ error: 'tierLabel required.' }, { status: 400 });
  }
  if (dimensionBreakdown !== undefined && !isDimensionBreakdown(dimensionBreakdown)) {
    return NextResponse.json({ error: 'dimensionBreakdown malformed.' }, { status: 400 });
  }

  // ── Auth + entitlement gate ───────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: enrollment, error: enrollErr } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('product', 'in-depth-assessment')
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .limit(1)
    .maybeSingle();

  if (enrollErr) {
    console.error('[in-depth/submit] enrollment lookup error:', enrollErr);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
  if (!enrollment) {
    return NextResponse.json(
      { error: 'No In-Depth Assessment purchase found for this account.' },
      { status: 403 },
    );
  }

  // ── Persist the result ───────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  let profileId: string | null = null;

  try {
    const result = await upsertReadinessResult(user.email, {
      score,
      tierId: tier,
      tierLabel,
      answers: answers as number[],
      completedAt,
      version: 'v2',
      maxScore: persistedMaxScore,
      ...(dimensionBreakdown ? { dimensionBreakdown: dimensionBreakdown as DimensionBreakdown } : {}),
    });
    profileId = result.id;
  } catch (err) {
    console.error('[in-depth/submit] user_profiles upsert error:', err);
    return NextResponse.json({ error: 'Could not save result.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profileId });
}
