// POST /api/assessment/pdf/warm
// Triggered from PdfDownloadButton on results-page mount. Generates the
// PDF and stores it in the assessment-pdfs bucket. Idempotent — repeat
// calls within 5 minutes for the same profileId short-circuit.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { generateAssessmentPdf } from '@/lib/pdf/generate';
import { uploadAssessmentPdf } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RECENT_GENERATION_WINDOW_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }
  if (process.env.SKIP_PDF_GENERATION === 'true') {
    return NextResponse.json(
      { status: 'skipped', reason: 'staging-suppression' },
      { status: 200 },
    );
  }

  let body: { profileId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const profileId = body.profileId?.trim();
  if (!profileId || !/^[0-9a-f-]{36}$/i.test(profileId)) {
    return NextResponse.json({ error: 'invalid-profile-id' }, { status: 400 });
  }

  const client = createServiceRoleClient();
  const { data: profile, error: fetchError } = await client
    .from('user_profiles')
    .select('id, readiness_tier_id, pdf_generated_at')
    .eq('id', profileId)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'profile-not-found' }, { status: 404 });
  }
  if (!profile.readiness_tier_id) {
    return NextResponse.json({ error: 'no-assessment-completed' }, { status: 409 });
  }

  if (profile.pdf_generated_at) {
    const ageMs = Date.now() - new Date(profile.pdf_generated_at).getTime();
    if (ageMs < RECENT_GENERATION_WINDOW_MS) {
      return NextResponse.json({ status: 'ready', cached: true }, { status: 200 });
    }
  }

  try {
    const origin = request.headers.get('origin') ?? new URL(request.url).origin;
    const buffer = await generateAssessmentPdf({ profileId, origin });
    const result = await uploadAssessmentPdf(profileId, buffer);
    return NextResponse.json({ status: 'ready', bytes: result.bytes }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[pdf/warm] generation failed:', message);
    return NextResponse.json(
      { error: 'generation-failed', detail: message },
      { status: 500 },
    );
  }
}
