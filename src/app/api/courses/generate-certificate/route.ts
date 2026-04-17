// POST /api/courses/generate-certificate
// Internal endpoint triggered by the reviewer approval flow.
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
import { generateCertificateId } from '@/lib/certificates/generateId';
import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import { CertificateDocument } from '@/lib/pdf/CertificateDocument';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

interface EnrollmentRow {
  id: string;
  user_id: string | null;
  email: string;
}

interface CertificateRow {
  id: string;
  certificate_id: string;
  holder_name: string;
  designation: string;
  issued_at: string;
  enrollment_id: string;
}

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
      'Content-Disposition': `attachment; filename="AiBI-P-Certificate-${certificateId}.pdf"`,
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
  const cookieStore = cookies();

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

async function resolveHolderName(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  enrollment: EnrollmentRow,
): Promise<string> {
  if (enrollment.user_id) {
    const { data: userData, error: userError } =
      await serviceClient.auth.admin.getUserById(enrollment.user_id);

    if (!userError && userData?.user) {
      const meta = userData.user.user_metadata as Record<string, unknown> | null;
      const displayName =
        (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
        (typeof meta?.name === 'string' && meta.name.trim()) ||
        null;
      if (displayName) return displayName;
    }
  }

  // Fallback: title-case the email prefix
  const prefix = enrollment.email.split('@')[0] ?? enrollment.email;
  return prefix
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function buildPdfBuffer(cert: CertificateRow): Promise<Buffer> {
  const verificationUrl = `https://aibankinginstitute.com/verify/${cert.certificate_id}`;
  // Cast required: renderToBuffer expects ReactElement<DocumentProps> but our wrapper
  // component is typed as ReactElement<CertificateDocumentProps>. The component renders
  // a <Document> root so the cast is safe.
  const element = React.createElement(CertificateDocument, {
    holderName: cert.holder_name,
    designation: 'AiBI-P -- Banking AI Practitioner',
    issuingInstitution: 'The AI Banking Institute',
    issuedDate: formatDate(cert.issued_at),
    certificateId: cert.certificate_id,
    verificationUrl,
  }) as React.ReactElement<DocumentProps>;
  return renderToBuffer(element);
}

// ============================================================
// POST — Internal: triggered by review-submission on approval
// Body: { enrollmentId: string }
// ============================================================
export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return new Response(JSON.stringify({ dev: true, data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  // Idempotency: return existing certificate without creating a duplicate (CERT-01, T-08-06)
  const { data: existingCert, error: existingError } = await serviceClient
    .from('certificates')
    .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle();

  if (existingError) {
    return jsonError('Failed to check for existing certificate.', 500);
  }

  if (existingCert) {
    const cert = existingCert as CertificateRow;
    const pdfBuffer = await buildPdfBuffer(cert);
    return pdfResponse(pdfBuffer, cert.certificate_id, 200, true);
  }

  // Look up enrollment to resolve holder name
  const { data: enrollmentData, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, email')
    .eq('id', enrollmentId)
    .single();

  if (enrollmentError || !enrollmentData) {
    return jsonError('Enrollment not found.', 404);
  }

  const enrollment = enrollmentData as EnrollmentRow;
  const holderName = await resolveHolderName(serviceClient, enrollment);

  // Generate unique certificate ID
  const certificateId = generateCertificateId();
  const issuedAt = new Date().toISOString();

  // Insert certificate record
  const { data: insertedCert, error: insertError } = await serviceClient
    .from('certificates')
    .insert({
      enrollment_id: enrollmentId,
      certificate_id: certificateId,
      holder_name: holderName,
      designation: 'AiBI-P',
      issued_at: issuedAt,
    })
    .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
    .single();

  if (insertError) {
    // Handle race condition: unique constraint violation means cert was just created by another request
    if (
      insertError.code === '23505' ||
      (insertError.message && (insertError.message.includes('unique') || insertError.message.includes('duplicate')))
    ) {
      const { data: raceCert, error: raceError } = await serviceClient
        .from('certificates')
        .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
        .eq('enrollment_id', enrollmentId)
        .single();

      if (raceError || !raceCert) {
        return jsonError('Failed to retrieve certificate after conflict.', 500);
      }

      const cert = raceCert as CertificateRow;
      const pdfBuffer = await buildPdfBuffer(cert);
      return pdfResponse(pdfBuffer, cert.certificate_id, 200, true);
    }

    return jsonError('Failed to create certificate record.', 500);
  }

  const cert = insertedCert as CertificateRow;
  const pdfBuffer = await buildPdfBuffer(cert);
  return pdfResponse(pdfBuffer, cert.certificate_id, 201, false);
}

// ============================================================
// GET — Learner download: verifies enrollment ownership (T-08-04)
// Query: ?enrollmentId=...
// ============================================================
export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_DEV_BYPASS !== 'true') {
    return new Response(JSON.stringify({ dev: true, data: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
  const pdfBuffer = await buildPdfBuffer(cert);
  return pdfResponse(pdfBuffer, cert.certificate_id, 200, false);
}
