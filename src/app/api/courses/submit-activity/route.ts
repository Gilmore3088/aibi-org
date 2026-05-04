// POST /api/courses/submit-activity
// Writes activity responses to the activity_responses table.
//
// Security model (T-05-01 through T-05-06):
//   - T-05-01: Verifies auth session via Supabase getUser(); enrollment.user_id must match
//   - T-05-02: Server-side validation of moduleNumber, activityId format, field minLengths
//   - T-05-04: Returns generic 403 — does not leak whether enrollment exists for other users
//   - T-05-06: Service role used only after ownership verified; double-checked before write

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  V4_AIBIP_MODULE_BY_NUMBER,
  getModuleByNumber,
} from '@content/courses/aibi-p';
import { AIBI_P_ARTIFACTS } from '@content/practice-reps/aibi-p';
import type { Activity, ActivityField } from '@content/courses/aibi-p';

const LAST_MODULE = 12;

// Pattern: N.N (e.g. "1.1", "5.2")
const ACTIVITY_ID_PATTERN = /^\d+\.\d+$/;

interface RequestBody {
  enrollmentId?: unknown;
  moduleNumber?: unknown;
  activityId?: unknown;
  response?: unknown;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  completed_modules: number[];
  current_module: number;
}

function getV4Activity(moduleNumber: number): Activity | null {
  const expandedModule = V4_AIBIP_MODULE_BY_NUMBER.get(moduleNumber);
  if (!expandedModule) return null;

  const artifact = AIBI_P_ARTIFACTS.find((item) => item.moduleNumber === expandedModule.number);

  return {
    id: `${expandedModule.number}.1`,
    title: expandedModule.practice,
    description: `Complete the practice, capture the useful output, and save the artifact: ${expandedModule.artifact}`,
    type: 'free-text',
    fields: [
      {
        id: 'practice-response',
        label: 'Paste or write your practice response here.',
        type: 'textarea',
        minLength: 20,
        required: true,
        placeholder: expandedModule.practice,
      },
      {
        id: 'review-notes',
        label: 'What did you change, verify, or decide before using the output?',
        type: 'textarea',
        minLength: 20,
        required: true,
        placeholder: 'Note the human review step, safety boundary, or improvement you made.',
      },
    ],
    completionTrigger: 'save-response',
    artifactId: artifact?.id,
  };
}

function validateActivityFields(
  fields: readonly ActivityField[],
  response: Record<string, unknown>,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const field of fields) {
    const value = typeof response[field.id] === 'string'
      ? (response[field.id] as string)
      : '';

    if (field.required && value.trim().length === 0) {
      fieldErrors[field.id] = `${field.label} is required.`;
      continue;
    }

    if (field.minLength && value.length < field.minLength) {
      fieldErrors[field.id] =
        `${field.label} must be at least ${field.minLength} characters (currently ${value.length}).`;
    }
  }

  return fieldErrors;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { enrollmentId, moduleNumber: rawModuleNumber, activityId: rawActivityId, response: rawResponse } = body;

  // Validate enrollmentId
  if (typeof enrollmentId !== 'string' || enrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }

  // Validate moduleNumber
  const moduleNumber = typeof rawModuleNumber === 'number' ? rawModuleNumber : NaN;
  if (!Number.isInteger(moduleNumber) || moduleNumber < 1 || moduleNumber > LAST_MODULE) {
    return NextResponse.json(
      { error: `moduleNumber must be an integer between 1 and ${LAST_MODULE}.` },
      { status: 400 }
    );
  }

  // Validate activityId format
  if (
    typeof rawActivityId !== 'string' ||
    rawActivityId.trim().length === 0 ||
    !ACTIVITY_ID_PATTERN.test(rawActivityId.trim())
  ) {
    return NextResponse.json(
      { error: 'activityId must be a non-empty string matching the pattern N.N (e.g. "1.1").' },
      { status: 400 }
    );
  }
  const activityId = rawActivityId.trim();

  // Validate response object
  if (
    typeof rawResponse !== 'object' ||
    rawResponse === null ||
    Array.isArray(rawResponse) ||
    Object.keys(rawResponse as object).length === 0
  ) {
    return NextResponse.json(
      { error: 'response must be a non-empty object.' },
      { status: 400 }
    );
  }
  const response = rawResponse as Record<string, unknown>;

  // --- Authenticate user (T-05-01) ---
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

  // --- Read enrollment and verify ownership (T-05-01, T-05-06) ---
  const serviceClient = createServiceRoleClient();

  const { data: enrollment, error: lookupError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, completed_modules, current_module')
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .single();

  if (lookupError || !enrollment) {
    // T-05-04: Generic message — do not leak whether enrollment exists for other users
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 }
    );
  }

  const { current_module: rawCurrentModule } = enrollment as EnrollmentRow;
  // Normalize current_module=0 (DB default for "enrolled, not started") to 1
  // to match getEnrollment.ts:90 and save-progress/route.ts. See
  // feature/auth-audit findings (2026-05-01).
  const current_module = Math.max(1, rawCurrentModule ?? 1);

  // --- Forward-only enforcement (M1-06) ---
  // moduleNumber must equal current_module (cannot submit activities for past or future modules)
  if (moduleNumber !== current_module) {
    return NextResponse.json(
      { error: 'Module out of sequence. You may only submit activities for the current module.' },
      { status: 400 }
    );
  }

  // --- Duplicate prevention (CONT-04) ---
  const { data: existing } = await serviceClient
    .from('activity_responses')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('activity_id', activityId)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Activity already submitted.' }, { status: 409 });
  }

  // --- Server-side minLength validation (T-05-02, CONT-05) ---
  const v4Activity = getV4Activity(moduleNumber);
  const mod = getModuleByNumber(moduleNumber);
  let submittedActivity: Activity | undefined =
    v4Activity?.id === activityId ? v4Activity : undefined;

  if (mod) {
    const activity = submittedActivity ?? mod.activities.find((a) => a.id === activityId);
    if (activity) {
      submittedActivity = activity;
      const fieldErrors = validateActivityFields(activity.fields, response);

      if (Object.keys(fieldErrors).length > 0) {
        return NextResponse.json(
          { error: 'Validation failed.', fieldErrors },
          { status: 400 }
        );
      }
    }
  }

  // --- Write to activity_responses ---
  const { error: insertError } = await serviceClient
    .from('activity_responses')
    .insert({
      enrollment_id: enrollmentId,
      module_number: moduleNumber,
      activity_id: activityId,
      response,
    });

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to save activity response. Please try again.' },
      { status: 500 }
    );
  }

  if (submittedActivity?.artifactId) {
    const artifact = AIBI_P_ARTIFACTS.find((item) => item.id === submittedActivity?.artifactId);
    await serviceClient.from('user_artifacts').upsert(
      {
        user_id: user.id,
        course_id: 'aibi-p',
        artifact_id: submittedActivity.artifactId,
        status: 'completed',
        source_activity_id: activityId,
        metadata: {
          moduleNumber,
          activityId,
          title: artifact?.title ?? submittedActivity.title,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_id,artifact_id' },
    );
  }

  return NextResponse.json({ success: true, activityId }, { status: 201 });
}
