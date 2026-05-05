// GET /api/assessment/pdf/download?profileId=...
// Validates Supabase Auth session, confirms ownership via auth.uid() =
// user_profiles.id, returns a 24h signed Storage URL.
//
// Refs: docs/superpowers/specs/2026-05-04-assessment-results-spec-2-pdf.md

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createServerClientWithCookies,
  isSupabaseConfigured,
} from '@/lib/supabase/client';
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

  const cookieStore = cookies();
  const client = createServerClientWithCookies(cookieStore);
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (user.id !== profileId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 404 });
  }

  const signedUrl = await getSignedDownloadUrl(profileId);
  if (!signedUrl) {
    return NextResponse.json({ error: 'pdf-not-ready' }, { status: 404 });
  }

  return NextResponse.json({ url: signedUrl }, { status: 200 });
}
