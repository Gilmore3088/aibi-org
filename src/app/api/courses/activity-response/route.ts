// GET /api/courses/activity-response?enrollmentId=...&activityId=...
// Returns a single activity response for the authenticated learner.
//
// Security model (T-06-05):
//   - Verifies auth session via Supabase getUser()
//   - enrollment.user_id must match authenticated user (ownership check)
//   - Returns 403 with generic message on failure (no enrollment existence leak)
//   - RLS on activity_responses table provides defense in depth

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

// Pattern: N.N (e.g. "7.1")
const ACTIVITY_ID_PATTERN = /^\d+\.\d+$/;

export async function GET(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('enrollmentId');
  const activityId = searchParams.get('activityId');

  // Validate query params
  if (!enrollmentId || enrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }

  if (
    !activityId ||
    activityId.trim().length === 0 ||
    !ACTIVITY_ID_PATTERN.test(activityId.trim())
  ) {
    return NextResponse.json(
      { error: 'activityId must match the pattern N.N (e.g. "7.1").' },
      { status: 400 },
    );
  }

  // --- Authenticate user ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // --- Verify enrollment ownership ---
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id')
    .eq('id', enrollmentId.trim())
    .eq('user_id', user.id)
    .single();

  if (lookupError || !enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 },
    );
  }

  // --- Fetch the activity response ---
  const { data: activityResponse, error: fetchError } = await serviceClient
    .from('activity_responses')
    .select('response')
    .eq('enrollment_id', enrollmentId.trim())
    .eq('activity_id', activityId.trim())
    .single();

  if (fetchError || !activityResponse) {
    // Not found is a normal state (activity not yet submitted)
    return NextResponse.json({ response: null }, { status: 200 });
  }

  return NextResponse.json(
    { response: activityResponse.response as Record<string, string> },
    { status: 200 },
  );
}
