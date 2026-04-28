// POST /api/capture-email
// Validates input, fires ConvertKit/HubSpot adapters, and persists the
// readiness result to Supabase user_profiles (when configured).

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { subscribeToAssessmentForm } from '@/lib/convertkit';
import { upsertContact } from '@/lib/hubspot';
import { upsertReadinessResult } from '@/lib/supabase/user-profiles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CapturePayload {
  email?: unknown;
  score?: unknown;
  tier?: unknown;
  tierLabel?: unknown;
  answers?: unknown;
  version?: unknown;
  maxScore?: unknown;
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

function isValidPayload(p: CapturePayload): p is {
  email: string;
  score: number;
  tier: string;
  tierLabel: string;
  answers: number[];
  version?: 'v1' | 'v2';
  maxScore?: number;
  dimensionBreakdown?: DimensionBreakdown;
} {
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return false;
  if (typeof p.score !== 'number' || p.score < 8 || p.score > 48) return false;
  if (typeof p.tier !== 'string' || p.tier.length === 0) return false;
  if (typeof p.tierLabel !== 'string' || p.tierLabel.length === 0) return false;
  if (!Array.isArray(p.answers)) return false;
  if (p.answers.length < 8 || p.answers.length > 12) return false;
  if (!p.answers.every((n: unknown) => typeof n === 'number' && n >= 1 && n <= 4)) return false;
  if (p.version !== undefined && p.version !== 'v1' && p.version !== 'v2') return false;
  if (p.maxScore !== undefined && (typeof p.maxScore !== 'number' || p.maxScore < 8 || p.maxScore > 48)) return false;
  if (p.dimensionBreakdown !== undefined && !isDimensionBreakdown(p.dimensionBreakdown)) return false;
  return true;
}

export async function POST(request: Request) {
  let body: CapturePayload;
  try {
    body = (await request.json()) as CapturePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const { email, score, tier, tierLabel, answers, version, maxScore, dimensionBreakdown } = body;

  const completedAt = new Date().toISOString();

  // Best-effort adapters — these are no-ops until keys are set.
  await subscribeToAssessmentForm({ email, tags: [`tier:${tier}`] }).catch((err) =>
    console.warn('[capture-email] convertkit skip', err)
  );
  await upsertContact({
    email,
    assessmentScore: score,
    scoreTier: tierLabel,
  }).catch((err) => console.warn('[capture-email] hubspot skip', err));

  // Persist to Supabase user_profiles when configured.
  // Best-effort: a Supabase failure must not block the response — the
  // localStorage write in EmailGate.tsx is the fallback.
  if (isSupabaseConfigured()) {
    await upsertReadinessResult(email, {
      score,
      tierId: tier,
      tierLabel,
      answers,
      completedAt,
      ...(version ? { version } : {}),
      ...(maxScore !== undefined ? { maxScore } : {}),
      ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
    }).catch((err) => console.warn('[capture-email] supabase skip', err));
  }

  return NextResponse.json({ ok: true });
}
