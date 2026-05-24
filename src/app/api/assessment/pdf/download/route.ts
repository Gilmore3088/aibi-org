// GET /api/assessment/pdf/download?profileId=...
// Returns a 24h signed Storage URL for the briefing PDF associated with
// a user_profiles row.
//
// AUTHORIZATION MODEL (revised 2026-05-23):
// The /results/[id] URL is a bearer-token URL — the UUID is unguessable
// (122 bits of entropy) and possession of it IS the credential, same
// model as a Calendly link or a Notion share. The PDF download follows
// the same rule: anyone holding the profileId can download the
// briefing it identifies. We do NOT require a Supabase auth session,
// and we do NOT cross-check user.id === profileId — that check was
// always wrong because user_profiles.id (a fresh upsert-generated UUID
// keyed on email) is NOT the same UUID as auth.users.id, so the test
// always failed and returned "forbidden" even to legitimate owners.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getSignedDownloadUrl } from '@/lib/pdf/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'supabase-not-configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const profileId = url.searchParams.get('profileId')?.trim();
  if (!profileId || !/^[0-9a-f-]{36}$/i.test(profileId)) {
    return NextResponse.json({ error: 'invalid-profile-id' }, { status: 400 });
  }

  const signedUrl = await getSignedDownloadUrl(profileId);
  if (!signedUrl) {
    return NextResponse.json({ error: 'pdf-not-ready' }, { status: 404 });
  }

  return NextResponse.json({ url: signedUrl }, { status: 200 });
}
