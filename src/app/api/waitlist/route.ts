import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  checkEmailCaptureLimit,
  hashIp,
  logEmailCapture,
} from '@/lib/email-capture/rate-limit';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import { sendWaitlistConfirmation, sendAssessmentOptions } from '@/lib/resend';

// Human-readable label per interest slug — used as the email subject and
// body line. Keep in sync with VALID_INTERESTS below.
const INTEREST_LABELS: Record<string, string> = {
  assessment: 'the AI readiness assessment',
  course: 'AiBI Foundations',
  newsletter: 'the AI Banking Brief newsletter',
  institutional: 'institutional cohort enrollment',
  consulting: 'leadership advisory engagement',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_INTERESTS = new Set([
  'assessment',
  'course',
  'newsletter',
  'institutional',
  'consulting',
]);
// Bumped from 5 to 50 to unblock pre-launch testing. CLAUDE.md tracks
// the move to Upstash sliding-window rate limiting before public launch.
const RATE_LIMIT_PER_IP_PER_HOUR = 50;
const MAX_NAME_LEN = 120;

interface WaitlistBody {
  readonly email?: unknown;
  readonly interest?: unknown;
  readonly firstName?: unknown;
  readonly institutionName?: unknown;
  readonly marketingOptIn?: unknown;
}

function getRequestIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function trimToOptional(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().slice(0, MAX_NAME_LEN);
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: WaitlistBody;

  try {
    body = (await request.json()) as WaitlistBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  if (typeof body.interest !== 'string' || !VALID_INTERESTS.has(body.interest)) {
    return NextResponse.json(
      { error: 'interest must be assessment, course, newsletter, institutional, or consulting.' },
      { status: 400 },
    );
  }

  const ipHash = await hashIp(getRequestIp(request));
  const decision = await checkEmailCaptureLimit(ipHash, {
    perIpPerHour: RATE_LIMIT_PER_IP_PER_HOUR,
  });
  if (!decision.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in an hour.' },
      { status: 429, headers: { 'Retry-After': String(decision.retryAfterSeconds ?? 3600) } },
    );
  }

  const firstName = trimToOptional(body.firstName);
  const institutionName = trimToOptional(body.institutionName);
  const marketingOptIn = body.marketingOptIn === true;

  if (!isSupabaseConfigured()) {
    await logEmailCapture(ipHash);
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from('future_course_waitlist')
    .upsert(
      {
        email: body.email.toLowerCase(),
        interest: body.interest,
        source: 'coming-soon',
        first_name: firstName,
        institution_name: institutionName,
        marketing_opt_in: marketingOptIn,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email,interest' },
    );

  if (error) {
    console.error('[waitlist] insert failed:', error);
    return NextResponse.json({ error: 'Could not save waitlist entry.' }, { status: 500 });
  }

  // Provision a Supabase Auth account for this email. Idempotent,
  // non-blocking — waitlist signups become real users so they can log in
  // when the gated feature ships.
  ensureAuthUser(body.email.toLowerCase()).catch((err) =>
    console.warn('[waitlist] auth-admin skip', err),
  );

  // Confirmation email — fire-and-forget, never blocks the response.
  // Special case: interest=assessment redirects to the assessment-options
  // template because the assessment is already live (no waiting needed).
  if (body.interest === 'assessment') {
    sendAssessmentOptions({
      email: body.email.toLowerCase(),
      institution: institutionName ?? undefined,
    }).catch((err) => console.warn('[waitlist] resend skip (assessment-options)', err));
  } else {
    const interestLabel = INTEREST_LABELS[body.interest] ?? body.interest;
    sendWaitlistConfirmation({
      email: body.email.toLowerCase(),
      interestLabel,
      institution: institutionName ?? undefined,
    }).catch((err) => console.warn('[waitlist] resend skip', err));
  }

  await logEmailCapture(ipHash);
  return NextResponse.json({ ok: true, stored: true });
}
