// POST /api/courses/save-progress
// Writes module completion to course_enrollments with forward-only enforcement.
//
// Security model (T-04-04, T-04-05):
//   - T-04-05: Requires valid Supabase auth session; verifies enrollment.user_id === user
//   - T-04-04: Server-side forward-only enforcement — moduleNumber must equal current_module
//             and all prior modules must already be completed
//   - Service role client used for the write after manual ownership verification

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const LAST_MODULE = 9;

interface RequestBody {
  enrollmentId?: unknown;
  moduleNumber?: unknown;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  completed_modules: number[];
  current_module: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, dev: true });
    }
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { enrollmentId, moduleNumber: rawModuleNumber } = body;

  if (typeof enrollmentId !== 'string' || enrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }

  const moduleNumber = typeof rawModuleNumber === 'number' ? rawModuleNumber : NaN;
  if (!Number.isInteger(moduleNumber) || moduleNumber < 1 || moduleNumber > LAST_MODULE) {
    return NextResponse.json(
      { error: `moduleNumber must be an integer between 1 and ${LAST_MODULE}.` },
      { status: 400 }
    );
  }

  // --- Authenticate user (T-04-05) ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — session kept alive by middleware
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

  // --- Read enrollment and verify ownership (T-04-05) ---
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, completed_modules, current_module')
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .single();

  if (lookupError || !enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 }
    );
  }

  const { completed_modules, current_module } = enrollment as EnrollmentRow;

  // --- Forward-only enforcement (T-04-04) ---
  // Rule 1: moduleNumber must equal current_module (cannot skip ahead or re-submit past modules)
  if (moduleNumber !== current_module) {
    return NextResponse.json(
      { error: 'Module out of sequence. You may only complete the current module.' },
      { status: 400 }
    );
  }

  // Rule 2: All prior modules must already be in completed_modules
  for (let prior = 1; prior < moduleNumber; prior++) {
    if (!completed_modules.includes(prior)) {
      return NextResponse.json(
        { error: `Module ${prior} must be completed before completing module ${moduleNumber}.` },
        { status: 400 }
      );
    }
  }

  // --- Write completion ---
  // Append moduleNumber to completed_modules and advance current_module.
  // If this is the last module, hold current_module at LAST_MODULE (do not set to 10).
  const nextModule = moduleNumber === LAST_MODULE ? LAST_MODULE : moduleNumber + 1;
  const updatedCompleted = Array.from(new Set([...completed_modules, moduleNumber]));

  const { error: updateError } = await serviceClient
    .from('course_enrollments')
    .update({
      completed_modules: updatedCompleted,
      current_module: nextModule,
    })
    .eq('id', enrollmentId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to save progress. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, nextModule });
}
