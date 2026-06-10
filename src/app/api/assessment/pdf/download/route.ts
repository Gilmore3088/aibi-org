// GET /api/assessment/pdf/download?profileId=...
// Returns a 24h signed Storage URL for the assessment briefing PDF.
//
// Access model: the profileId UUID is the credential (bearer pattern), the
// same model as the /results/[id] page that renders this exact data and the
// /api/assessment/pdf/warm endpoint that generates the file. The free
// email-capture flow deliberately never creates a browser session, so a
// session gate here forced email-captured users into password setup to
// download a PDF of numbers already visible on their screen (journey audit
// 2026-06-10, F1). 122 bits of UUID entropy + the row-existence check below
// provide the same protection as the results page itself.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getSignedDownloadUrl } from '@/lib/pdf/storage';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

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

  // Mitigates UUID-guessing sweeps now that there is no session gate.
  const limited = await rateLimitOrFail({
    key: 'pdf-download',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const client = createServiceRoleClient();
  const { data: profile } = await client
    .from('user_profiles')
    .select('id, readiness_tier_id')
    .eq('id', profileId)
    .maybeSingle();
  if (!profile || !profile.readiness_tier_id) {
    return NextResponse.json({ error: 'profile-not-found' }, { status: 404 });
  }

  const signedUrl = await getSignedDownloadUrl(profileId);
  if (!signedUrl) {
    return NextResponse.json({ error: 'pdf-not-ready' }, { status: 404 });
  }

  return NextResponse.json({ url: signedUrl }, { status: 200 });
}
