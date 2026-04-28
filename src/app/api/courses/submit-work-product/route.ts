// POST /api/courses/submit-work-product
// Two modes based on `action` query parameter:
//
//   ?action=presign  — Generate a Supabase Storage presigned upload URL.
//                      Client uploads file directly to storage (avoids Vercel 4.5MB limit).
//   (default)        — Validate all four work product items and write to work_submissions.
//
// Security model (T-07-01 through T-07-06):
//   T-07-01: Auth session validated via getUser(); enrollment.user_id must match authenticated user.
//   T-07-02: skillFileUrl validated as a path starting with enrollmentId/ (bucket-scoped).
//   T-07-04: Returns generic 403 for ownership failures — does not reveal other users' data.
//   T-07-05: Presigned URL generated only for authenticated enrolled users with 12 modules complete.
//   T-07-06: Only 'failed' submissions may transition to 'resubmitted'; only once.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPresignedUploadUrl, isValidStoragePath } from '@/lib/supabase/storage';

const TOTAL_MODULES = 12;
const MIN_INPUT_TEXT = 50;
const MIN_RAW_OUTPUT_TEXT = 50;
const MIN_EDITED_OUTPUT_TEXT = 100;
const MIN_ANNOTATION_TEXT = 50;

interface EnrollmentRow {
  id: string;
  user_id: string;
  completed_modules: number[];
}

interface PresignBody {
  enrollmentId?: unknown;
  filename?: unknown;
}

interface SubmitBody {
  enrollmentId?: unknown;
  skillFileUrl?: unknown;
  inputText?: unknown;
  rawOutputText?: unknown;
  editedOutputText?: unknown;
  annotationText?: unknown;
  isResubmission?: unknown;
}

interface WorkSubmissionRow {
  id: string;
  review_status: string;
}

function allModulesComplete(completedModules: number[]): boolean {
  for (let i = 1; i <= TOTAL_MODULES; i++) {
    if (!completedModules.includes(i)) return false;
  }
  return true;
}

async function authenticateUser(cookieStore: ReturnType<typeof cookies>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const anonClient = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Route Handlers — middleware keeps session alive
      },
    },
  });

  const {
    data: { user },
    error,
  } = await anonClient.auth.getUser();

  return { user: error ? null : user };
}

async function verifyEnrollmentOwnership(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  enrollmentId: string,
  userId: string,
): Promise<EnrollmentRow | null> {
  const { data, error } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, completed_modules')
    .eq('id', enrollmentId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as EnrollmentRow;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // --- Authenticate ---
  const cookieStore = cookies();
  const { user } = await authenticateUser(cookieStore);

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  }

  // =====================================================================
  // MODE 1: ?action=presign — Generate presigned upload URL
  // =====================================================================
  if (action === 'presign') {
    let body: PresignBody;
    try {
      body = (await request.json()) as PresignBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { enrollmentId: rawEnrollmentId, filename: rawFilename } = body;

    if (typeof rawEnrollmentId !== 'string' || rawEnrollmentId.trim().length === 0) {
      return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
    }
    const enrollmentId = rawEnrollmentId.trim();

    if (typeof rawFilename !== 'string' || rawFilename.trim().length === 0) {
      return NextResponse.json({ error: 'filename is required.' }, { status: 400 });
    }
    const filename = rawFilename.trim();

    // Validate allowed file extensions (T-07-05)
    const lowerFilename = filename.toLowerCase();
    if (!lowerFilename.endsWith('.md') && !lowerFilename.endsWith('.txt')) {
      return NextResponse.json({ error: 'Only .md and .txt files are accepted.' }, { status: 400 });
    }

    const serviceClient = createServiceRoleClient();

    // T-07-01: Verify enrollment ownership
    const enrollment = await verifyEnrollmentOwnership(serviceClient, enrollmentId, user.id);
    if (!enrollment) {
      // T-07-04: Generic message
      return NextResponse.json(
        { error: 'Enrollment not found or access denied.' },
        { status: 403 },
      );
    }

    // T-07-05: Only enrolled users who completed all 12 modules can generate upload URLs
    if (!allModulesComplete(enrollment.completed_modules)) {
      return NextResponse.json(
        { error: 'All 12 modules must be complete before uploading a work product.' },
        { status: 403 },
      );
    }

    try {
      const { signedUrl, path } = await getPresignedUploadUrl(enrollmentId, filename);
      return NextResponse.json({ signedUrl, path }, { status: 200 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate upload URL.';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // =====================================================================
  // MODE 2: Default — Submit work product
  // =====================================================================
  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    enrollmentId: rawEnrollmentId,
    skillFileUrl: rawSkillFileUrl,
    inputText: rawInputText,
    rawOutputText: rawRawOutputText,
    editedOutputText: rawEditedOutputText,
    annotationText: rawAnnotationText,
    isResubmission: rawIsResubmission,
  } = body;

  // Validate enrollmentId
  if (typeof rawEnrollmentId !== 'string' || rawEnrollmentId.trim().length === 0) {
    return NextResponse.json({ error: 'enrollmentId is required.' }, { status: 400 });
  }
  const enrollmentId = rawEnrollmentId.trim();

  const serviceClient = createServiceRoleClient();

  // T-07-01: Verify enrollment ownership
  const enrollment = await verifyEnrollmentOwnership(serviceClient, enrollmentId, user.id);
  if (!enrollment) {
    return NextResponse.json(
      { error: 'Enrollment not found or access denied.' },
      { status: 403 },
    );
  }

  // Module completion check
  if (!allModulesComplete(enrollment.completed_modules)) {
    return NextResponse.json(
      { error: 'All 12 modules must be complete before submitting a work product.' },
      { status: 403 },
    );
  }

  // --- Server-side field validation (WORK-04, T-07-02) ---
  const fieldErrors: Record<string, string> = {};

  // skillFileUrl must be a valid storage path scoped to this enrollment
  if (typeof rawSkillFileUrl !== 'string' || rawSkillFileUrl.trim().length === 0) {
    fieldErrors.skillFileUrl = 'Skill file URL is required.';
  } else if (!isValidStoragePath(rawSkillFileUrl.trim(), enrollmentId)) {
    // T-07-02: Reject paths that don't start with the enrollment's directory
    fieldErrors.skillFileUrl = 'Invalid skill file path.';
  }

  const skillFileUrl =
    typeof rawSkillFileUrl === 'string' ? rawSkillFileUrl.trim() : '';

  const inputText = typeof rawInputText === 'string' ? rawInputText.trim() : '';
  if (inputText.length === 0) {
    fieldErrors.inputText = 'Input text is required.';
  } else if (inputText.length < MIN_INPUT_TEXT) {
    fieldErrors.inputText = `Input text must be at least ${MIN_INPUT_TEXT} characters.`;
  }

  const rawOutputText = typeof rawRawOutputText === 'string' ? rawRawOutputText.trim() : '';
  if (rawOutputText.length === 0) {
    fieldErrors.rawOutputText = 'Raw AI output is required.';
  } else if (rawOutputText.length < MIN_RAW_OUTPUT_TEXT) {
    fieldErrors.rawOutputText = `Raw AI output must be at least ${MIN_RAW_OUTPUT_TEXT} characters.`;
  }

  const editedOutputText =
    typeof rawEditedOutputText === 'string' ? rawEditedOutputText.trim() : '';
  if (editedOutputText.length === 0) {
    fieldErrors.editedOutputText = 'Edited output and annotation is required.';
  } else if (editedOutputText.length < MIN_EDITED_OUTPUT_TEXT) {
    fieldErrors.editedOutputText = `Edited output must be at least ${MIN_EDITED_OUTPUT_TEXT} characters.`;
  }

  const annotationText = typeof rawAnnotationText === 'string' ? rawAnnotationText.trim() : '';
  if (annotationText.length === 0) {
    fieldErrors.annotationText = 'Annotation is required.';
  } else if (annotationText.length < MIN_ANNOTATION_TEXT) {
    fieldErrors.annotationText = `Annotation must be at least ${MIN_ANNOTATION_TEXT} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json(
      { error: 'Validation failed.', fieldErrors },
      { status: 400 },
    );
  }

  const isResubmission = rawIsResubmission === true;

  // --- Check existing submissions for this enrollment ---
  const { data: existingSubmissions, error: submissionLookupError } = await serviceClient
    .from('work_submissions')
    .select('id, review_status')
    .eq('enrollment_id', enrollmentId)
    .order('submitted_at', { ascending: false });

  if (submissionLookupError) {
    return NextResponse.json(
      { error: 'Failed to check existing submissions. Please try again.' },
      { status: 500 },
    );
  }

  const submissions = (existingSubmissions ?? []) as WorkSubmissionRow[];
  const latestSubmission = submissions[0] ?? null;

  // Block duplicate submissions (pending or already under re-review)
  if (
    latestSubmission &&
    (latestSubmission.review_status === 'pending' ||
      latestSubmission.review_status === 'resubmitted')
  ) {
    return NextResponse.json(
      { error: 'Submission already under review.' },
      { status: 409 },
    );
  }

  // Block further submissions after approval
  if (latestSubmission && latestSubmission.review_status === 'approved') {
    return NextResponse.json(
      { error: 'Work product already approved.' },
      { status: 409 },
    );
  }

  // T-07-06: Resubmission — only 'failed' can transition to 'resubmitted', only once
  if (isResubmission) {
    if (!latestSubmission || latestSubmission.review_status !== 'failed') {
      return NextResponse.json(
        { error: 'Resubmission is only allowed after a failed review.' },
        { status: 409 },
      );
    }

    // Update the existing failed row to 'resubmitted'
    const { error: updateError } = await serviceClient
      .from('work_submissions')
      .update({
        skill_file_url: skillFileUrl,
        input_text: inputText,
        raw_output_text: rawOutputText,
        edited_output_text: editedOutputText,
        annotation_text: annotationText,
        review_status: 'resubmitted',
        reviewer_id: null,
        review_scores: null,
        reviewed_at: null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', latestSubmission.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save resubmission. Please try again.' },
        { status: 500 },
      );
    }

    // TODO: send confirmation email when ConvertKit/Loops is wired (deferred per CLAUDE.md decisions)

    return NextResponse.json(
      { message: 'Work product resubmitted', submissionId: latestSubmission.id },
      { status: 201 },
    );
  }

  // --- Insert new submission with status 'pending' ---
  const { data: newSubmission, error: insertError } = await serviceClient
    .from('work_submissions')
    .insert({
      enrollment_id: enrollmentId,
      skill_file_url: skillFileUrl,
      input_text: inputText,
      raw_output_text: rawOutputText,
      edited_output_text: editedOutputText,
      annotation_text: annotationText,
      review_status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !newSubmission) {
    return NextResponse.json(
      { error: 'Failed to save submission. Please try again.' },
      { status: 500 },
    );
  }

  // TODO: send confirmation email when ConvertKit/Loops is wired (deferred per CLAUDE.md decisions)

  return NextResponse.json(
    { message: 'Work product submitted', submissionId: newSubmission.id },
    { status: 201 },
  );
}
