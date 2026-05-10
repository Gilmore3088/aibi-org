// POST /api/courses/log-quick-win — insert a quick win row for the authenticated user
// GET  /api/courses/log-quick-win — list quick wins for the authenticated user
//
// Security:
//   - Requires valid Supabase auth session
//   - Verifies enrollment.user_id === authenticated user before any write/read
//   - Service role client used for writes; anon client for auth resolution only

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const VALID_TOOLS = ['chatgpt', 'claude', 'copilot', 'gemini', 'notebooklm', 'perplexity'] as const;
const VALID_FREQUENCIES = ['daily', '2-3x/week', 'weekly', 'monthly'] as const;
const VALID_MINUTES = [5, 10, 15, 30, 60, 120] as const;

type Tool = (typeof VALID_TOOLS)[number];
type Frequency = (typeof VALID_FREQUENCIES)[number];

interface QuickWinBody {
  description?: unknown;
  tool?: unknown;
  skillName?: unknown;
  frequency?: unknown;
  timeSavedMinutes?: unknown;
  department?: unknown;
}

function buildAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — session kept alive by middleware
      },
    },
  });
}

// --- GET ---
export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await buildAnonClient().auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const serviceClient = createServiceRoleClient();

  // Resolve enrollment IDs for this user first, then filter quick_wins
  const { data: enrollments, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .in('product', ['aibi-p', 'foundation']);

  if (enrollmentError) {
    return NextResponse.json({ error: 'Failed to load quick wins.' }, { status: 500 });
  }

  const enrollmentIds = (enrollments ?? []).map((e: { id: string }) => e.id);

  if (enrollmentIds.length === 0) {
    return NextResponse.json({ wins: [] });
  }

  const { data, error } = await serviceClient
    .from('quick_wins')
    .select('*')
    .in('enrollment_id', enrollmentIds)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to load quick wins.' }, { status: 500 });
  }

  return NextResponse.json({ wins: data ?? [] });
}

// --- POST ---
export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  let body: QuickWinBody;
  try {
    body = (await request.json()) as QuickWinBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { description, tool, skillName, frequency, timeSavedMinutes, department } = body;

  if (typeof description !== 'string' || description.trim().length === 0) {
    return NextResponse.json({ error: 'description is required.' }, { status: 400 });
  }

  if (!VALID_TOOLS.includes(tool as Tool)) {
    return NextResponse.json({ error: 'Invalid tool value.' }, { status: 400 });
  }

  if (typeof skillName !== 'string' || skillName.trim().length === 0) {
    return NextResponse.json({ error: 'skillName is required.' }, { status: 400 });
  }

  if (!VALID_FREQUENCIES.includes(frequency as Frequency)) {
    return NextResponse.json({ error: 'Invalid frequency value.' }, { status: 400 });
  }

  const minutes = Number(timeSavedMinutes);
  if (!VALID_MINUTES.includes(minutes as (typeof VALID_MINUTES)[number])) {
    return NextResponse.json({ error: 'Invalid timeSavedMinutes value.' }, { status: 400 });
  }

  if (typeof department !== 'string' || department.trim().length === 0) {
    return NextResponse.json({ error: 'department is required.' }, { status: 400 });
  }

  const {
    data: { user },
    error: authError,
  } = await buildAnonClient().auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  const serviceClient = createServiceRoleClient();

  // Look up the user's AiBI-Foundation enrollment (one per user, per RLS policy)
  const { data: enrollment, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .in('product', ['aibi-p', 'foundation'])
    .single();

  if (enrollmentError || !enrollment) {
    return NextResponse.json(
      { error: 'No AiBI-Foundation enrollment found for this account.' },
      { status: 403 },
    );
  }

  const { data: win, error: insertError } = await serviceClient
    .from('quick_wins')
    .insert({
      enrollment_id: enrollment.id,
      description: description.trim(),
      tool: tool as Tool,
      skill_name: skillName.trim(),
      frequency: frequency as Frequency,
      time_saved_minutes: minutes,
      department: department.trim(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to log quick win.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, win });
}
