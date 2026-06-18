// GET /api/health/supabase
//
// Reports Supabase config + schema readiness WITHOUT exposing secrets.
// Built after the 2026-06-18 incident where every assessment result 404'd in
// prod because migrations 00044 (action_packet_notes) / 00045
// (institution_context) were not applied, but the deployed code selected
// those columns. This endpoint lets the operator confirm — in one request —
// that the service-role key works and that the columns the results pages read
// actually exist.
//
// Example healthy response:
//   { "ok": true,
//     "env": { "url": true, "anonKey": true, "serviceRoleKey": true, "skipProfiles": false },
//     "db": { "connected": true, "columns": { "institution_context": true, "action_packet_notes": true, "previous_id": true } },
//     "error": null }

import { NextResponse } from 'next/server';
import {
  isSupabaseConfigured,
  createServiceRoleClient,
} from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Columns added by recent migrations. If a results page reads one of these and
// it's missing, the whole query errors and the page 404s — so verify each.
const PROBE_COLUMNS = [
  'institution_context', // 00045
  'action_packet_notes', // 00044
  'previous_id', // 00042
] as const;

export async function GET(): Promise<Response> {
  const env = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    skipProfiles: process.env.SKIP_SUPABASE_PROFILES === 'true',
  };

  if (!isSupabaseConfigured() || !env.serviceRoleKey) {
    return NextResponse.json({
      ok: false,
      env,
      db: { connected: false, columns: {} },
      error: !env.serviceRoleKey
        ? 'SUPABASE_SERVICE_ROLE_KEY missing — results pages cannot read profiles.'
        : 'Supabase URL/anon key missing.',
    });
  }

  let client;
  try {
    client = createServiceRoleClient();
  } catch (err) {
    return NextResponse.json({
      ok: false,
      env,
      db: { connected: false, columns: {} },
      error: err instanceof Error ? err.message : 'Service role client init failed.',
    });
  }

  // Base connectivity: a trivial select that needs no recent migration.
  const base = await client.from('user_profiles').select('id').limit(1);
  if (base.error) {
    return NextResponse.json({
      ok: false,
      env,
      db: { connected: false, columns: {} },
      error: `user_profiles read failed: ${base.error.message}`,
    });
  }

  // Per-column existence probe. A missing column surfaces as a query error
  // naming the column — that's the migration that still needs applying.
  const columns: Record<string, boolean> = {};
  for (const col of PROBE_COLUMNS) {
    const probe = await client.from('user_profiles').select(col).limit(1);
    columns[col] = !probe.error;
  }

  const allColumnsPresent = Object.values(columns).every(Boolean);

  return NextResponse.json({
    ok: allColumnsPresent,
    env,
    db: { connected: true, columns },
    error: allColumnsPresent
      ? null
      : 'One or more migrations are not applied to this database — results pages will 404 until they are.',
  });
}
