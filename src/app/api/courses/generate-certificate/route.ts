// POST /api/courses/generate-certificate
// Internal endpoint triggered after the Foundation completion gate approves a
// final packet.
// Creates a certificate record in Supabase (with idempotency guard) and
// returns the certificate PDF as application/pdf.
//
// GET /api/courses/generate-certificate?enrollmentId=...
// Learner-facing download endpoint. Verifies that the requesting user owns
// the enrollment before returning the PDF.
//
// Security model (T-08-01 through T-08-04):
//   T-08-01: Re-reads review_status = 'approved' from DB before issuing
//   T-08-02: Only service role client writes to certificates table
//   T-08-03: Certificate record includes enrollment_id and issued_at audit fields
//   T-08-04: GET handler verifies requesting user owns enrollment via cookie auth

import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  issueCertificateForEnrollment,
  type CertificateRow,
} from '@/lib/certificates/issue';
import { buildCertificatePdfBuffer } from '@/lib/certificates/pdf';
import { rateLimitOrFail } from '@/lib/api/rate-limit';

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function pdfResponse(buffer: Buffer, certificateId: string, status: number, alreadyExists: boolean): Response {
  const body = new Uint8Array(buffer);
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="AiBI-Foundation-Certificate-${certificateId}.pdf"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
      'X-Certificate-Id': certificateId,
      'X-Already-Exists': String(alreadyExists),
    },
  });
}

async function authenticate(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: Response }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  const anonClient = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
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
    return { error: jsonError('Not authenticated.', 401) };
  }

  return { userId: user.id };
}

// ============================================================
// POST — Internal: triggered by review-submission on approval
// Body: { enrollmentId: string }
// ============================================================
export async function POST(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return jsonError('Service not configured.', 503);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const rawEnrollmentId = body.enrollmentId;
  if (typeof rawEnrollmentId !== 'string' || rawEnrollmentId.trim().length === 0) {
    return jsonError('enrollmentId is required.', 400);
  }
  const enrollmentId = rawEnrollmentId.trim();

  const authResult = await authenticate();
  if (authResult.error) return authResult.error;

  const serviceClient = createServiceRoleClient();

  // T-08-01: Re-read review_status from DB — do not trust caller's claim of approval
  const { data: submissionData, error: submissionError } = await serviceClient
    .from('work_submissions')
    .select('id, review_status')
    .eq('enrollment_id', enrollmentId)
    .eq('review_status', 'approved')
    .maybeSingle();

  if (submissionError) {
    return jsonError('Failed to verify submission status.', 500);
  }

  if (!submissionData) {
    return jsonError('No approved submission found for this enrollment.', 409);
  }

  let issued;
  try {
    issued = await issueCertificateForEnrollment({ serviceClient, enrollmentId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to issue certificate.';
    const status = message === 'Enrollment not found.' ? 404 : 500;
    return jsonError(message, status);
  }

  const cert = issued.certificate;
  const pdfBuffer = await buildCertificatePdfBuffer(cert, new URL(request.url).origin);
  return pdfResponse(pdfBuffer, cert.certificate_id, issued.created ? 201 : 200, !issued.created);
}

// ============================================================
// GET — Learner download: verifies enrollment ownership (T-08-04)
// Query: ?enrollmentId=...
// ============================================================
export async function GET(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return jsonError('Service not configured.', 503);
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('enrollmentId');

  if (!enrollmentId || enrollmentId.trim().length === 0) {
    return jsonError('enrollmentId query param is required.', 400);
  }

  // T-08-04: Verify requesting user owns this enrollment
  const authResult = await authenticate();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  // Per-user rate limit on PDF download — 20/hour covers any legit
  // re-download cadence while capping PDF-render cost if a session leaks.
  const limited = await rateLimitOrFail({
    key: 'cert-download',
    scope: 'user',
    identifier: userId,
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  const serviceClient = createServiceRoleClient();

  // Verify enrollment belongs to requesting user
  const { data: enrollmentData, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id')
    .eq('id', enrollmentId.trim())
    .eq('user_id', userId)
    .maybeSingle();

  if (enrollmentError || !enrollmentData) {
    return jsonError('Enrollment not found.', 404);
  }

  // Look up certificate
  const { data: certData, error: certError } = await serviceClient
    .from('certificates')
    .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
    .eq('enrollment_id', enrollmentId.trim())
    .maybeSingle();

  if (certError) {
    return jsonError('Failed to retrieve certificate.', 500);
  }

  if (!certData) {
    return jsonError('Certificate not yet issued for this enrollment.', 404);
  }

  const cert = certData as CertificateRow;
  const pdfBuffer = await buildCertificatePdfBuffer(cert, new URL(request.url).origin);
  return pdfResponse(pdfBuffer, cert.certificate_id, 200, false);
}
