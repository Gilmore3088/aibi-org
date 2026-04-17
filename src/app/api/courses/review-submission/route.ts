// POST /api/courses/review-submission
// Accepts a reviewer's scores + feedback for a work submission.
// Enforces Accuracy hard gate (score=1 auto-fails regardless of total).
// Passing: total >= 14 AND Accuracy >= 3 → sets status to 'approved'.
// Failing: requires written feedback >= 100 chars → sets status to 'failed'.
//
// Security model (T-07-07 through T-07-12):
//   T-07-07: verifyReviewer() checks authenticated email against REVIEWER_EMAILS allowlist
//   T-07-08: Each score validated as integer 1-4; Accuracy hard gate checked server-side
//   T-07-09: reviewer_id and reviewed_at recorded on every review (audit trail)
//   T-07-10: Only verified reviewers reach this handler
//   T-07-12: Only 'pending' and 'resubmitted' submissions can be reviewed

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { verifyReviewer } from '@/lib/auth/reviewerAuth';
import type { ReviewScores } from '@/types/course';

const MIN_FEEDBACK_LENGTH = 100;
const PASS_THRESHOLD = 14;
const ACCURACY_PASS_MIN = 3;

interface RequestBody {
  submissionId?: unknown;
  scores?: unknown;
  feedback?: unknown;
}

interface ScoresInput {
  accuracy?: unknown;
  completeness?: unknown;
  tone_and_voice?: unknown;
  judgment?: unknown;
  skill_quality?: unknown;
}

interface WorkSubmissionRow {
  id: string;
  enrollment_id: string;
  review_status: string;
  review_feedback: string | null;
}

function isValidScore(value: unknown): value is 1 | 2 | 3 | 4 {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function parseScores(raw: unknown): ReviewScores | null {
  if (typeof raw !== 'object' || raw === null) return null;

  const s = raw as ScoresInput;
  const accuracy = typeof s.accuracy === 'number' ? s.accuracy : parseInt(String(s.accuracy), 10);
  const completeness =
    typeof s.completeness === 'number' ? s.completeness : parseInt(String(s.completeness), 10);
  const tone_and_voice =
    typeof s.tone_and_voice === 'number'
      ? s.tone_and_voice
      : parseInt(String(s.tone_and_voice), 10);
  const judgment =
    typeof s.judgment === 'number' ? s.judgment : parseInt(String(s.judgment), 10);
  const skill_quality =
    typeof s.skill_quality === 'number' ? s.skill_quality : parseInt(String(s.skill_quality), 10);

  if (
    !isValidScore(accuracy) ||
    !isValidScore(completeness) ||
    !isValidScore(tone_and_voice) ||
    !isValidScore(judgment) ||
    !isValidScore(skill_quality)
  ) {
    return null;
  }

  return { accuracy, completeness, tone_and_voice, judgment, skill_quality };
}

export async function POST(request: Request): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return NextResponse.json({ success: true, dev: true });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  // --- Reviewer auth (T-07-07) ---
  // We use verifyReviewer() which internally creates an anon client from cookies.
  // Also get the authenticated user's ID for reviewer_id audit field (T-07-09).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
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

  const { isReviewer } = await verifyReviewer();
  if (!isReviewer) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // --- Parse body ---
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { submissionId: rawSubmissionId, scores: rawScores, feedback: rawFeedback } = body;

  // Validate submissionId
  if (typeof rawSubmissionId !== 'string' || rawSubmissionId.trim().length === 0) {
    return NextResponse.json({ error: 'submissionId is required.' }, { status: 400 });
  }
  const submissionId = rawSubmissionId.trim();

  // Validate scores (T-07-08: each must be integer 1-4)
  const scores = parseScores(rawScores);
  if (!scores) {
    return NextResponse.json(
      {
        error:
          'scores must be an object with accuracy, completeness, tone_and_voice, judgment, and skill_quality — each an integer from 1 to 4.',
      },
      { status: 400 },
    );
  }

  const feedback = typeof rawFeedback === 'string' ? rawFeedback.trim() : '';

  // --- Load submission (T-07-12: must be pending or resubmitted) ---
  const serviceClient = createServiceRoleClient();

  const { data: submissionData, error: fetchError } = await serviceClient
    .from('work_submissions')
    .select('id, enrollment_id, review_status, review_feedback')
    .eq('id', submissionId)
    .single();

  if (fetchError || !submissionData) {
    // T-07-10: Generic 404 — do not leak submission IDs
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  const submission = submissionData as WorkSubmissionRow;

  // T-07-12: Prevent double-review
  if (submission.review_status !== 'pending' && submission.review_status !== 'resubmitted') {
    return NextResponse.json({ error: 'Submission already reviewed.' }, { status: 409 });
  }

  const wasResubmission = submission.review_status === 'resubmitted';

  // --- Scoring logic (REVW-03, REVW-04) ---

  // Calculate total
  const total =
    scores.accuracy +
    scores.completeness +
    scores.tone_and_voice +
    scores.judgment +
    scores.skill_quality;

  // Accuracy hard gate (REVW-03): score of 1 = auto-fail regardless of total
  const accuracyGateFailed = scores.accuracy === 1;

  // Pass threshold (REVW-04): total >= 14 AND accuracy >= 3
  const isPassing = !accuracyGateFailed && total >= PASS_THRESHOLD && scores.accuracy >= ACCURACY_PASS_MIN;
  const reviewResult: 'approved' | 'failed' = isPassing ? 'approved' : 'failed';

  // Require feedback for failing reviews (>= 100 chars)
  if (reviewResult === 'failed' && feedback.length < MIN_FEEDBACK_LENGTH) {
    return NextResponse.json(
      {
        error: `Written feedback required for failing submissions (minimum ${MIN_FEEDBACK_LENGTH} characters).`,
      },
      { status: 400 },
    );
  }

  // REVW-06: Track whether this is the learner's second attempt (resubmission exhausted on fail)
  const resubmissionExhausted = reviewResult === 'failed' && wasResubmission;

  // --- Write review (T-07-09: reviewer_id and reviewed_at for audit trail) ---
  const { error: updateError } = await serviceClient
    .from('work_submissions')
    .update({
      review_scores: scores,
      review_feedback: reviewResult === 'failed' ? feedback : null,
      review_status: reviewResult,
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    return NextResponse.json(
      { error: 'Failed to save review. Please try again.' },
      { status: 500 },
    );
  }

  // REVW-08 / CERT-01: If approved, trigger certificate generation (best-effort).
  // Certificate API re-reads review_status before issuing — no premature issuance risk.
  // Reviewer response is already saved; certificate failure does not fail this response.
  let certificateGenerated = false;
  if (reviewResult === 'approved') {
    try {
      const certUrl = new URL('/api/courses/generate-certificate', request.url);
      const certResponse = await fetch(certUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId: submission.enrollment_id }),
      });
      certificateGenerated = certResponse.ok || certResponse.status === 200 || certResponse.status === 201;
    } catch {
      // Best-effort: log failure but do not surface to reviewer
      certificateGenerated = false;
    }
  }

  return NextResponse.json(
    {
      result: reviewResult,
      total,
      accuracyGateFailed,
      triggerCertificate: reviewResult === 'approved',
      certificateGenerated,
      resubmissionExhausted,
    },
    { status: 200 },
  );
}
