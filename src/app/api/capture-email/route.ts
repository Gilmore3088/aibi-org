// POST /api/capture-email
// MVP implementation: validate input, log on server, return ok.
// ConvertKit/HubSpot/Supabase wiring added when accounts are provisioned.

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { subscribeToAssessmentForm } from '@/lib/convertkit';
import { upsertContact } from '@/lib/hubspot';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CapturePayload {
  email?: unknown;
  score?: unknown;
  tier?: unknown;
  tierLabel?: unknown;
  answers?: unknown;
}

function isValidPayload(p: CapturePayload): p is {
  email: string;
  score: number;
  tier: string;
  tierLabel: string;
  answers: number[];
} {
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return false;
  if (typeof p.score !== 'number' || p.score < 8 || p.score > 48) return false;
  if (typeof p.tier !== 'string' || p.tier.length === 0) return false;
  if (typeof p.tierLabel !== 'string' || p.tierLabel.length === 0) return false;
  if (!Array.isArray(p.answers)) return false;
  if (p.answers.length < 8 || p.answers.length > 12) return false;
  if (!p.answers.every((n: unknown) => typeof n === 'number' && n >= 1 && n <= 4)) return false;
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

  const { email, score, tier, tierLabel, answers } = body;

  // Structured log — Vercel + local console pick this up.
  // Replace with Supabase insert once account is provisioned.
  console.info('[capture-email]', {
    email,
    score,
    tier,
    tierLabel,
    answers,
    supabaseConfigured: isSupabaseConfigured(),
    at: new Date().toISOString(),
  });

  // Best-effort adapters — these are no-ops until keys are set.
  await subscribeToAssessmentForm({ email, tags: [`tier:${tier}`] }).catch((err) =>
    console.warn('[capture-email] convertkit skip', err)
  );
  await upsertContact({
    email,
    assessmentScore: score,
    scoreTier: tierLabel,
  }).catch((err) => console.warn('[capture-email] hubspot skip', err));

  return NextResponse.json({ ok: true });
}
