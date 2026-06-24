import { generateCertificateId } from './generateId';
import { sendCertificateIssued } from '@/lib/resend';
import type { createServiceRoleClient } from '@/lib/supabase/client';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface CertificateRow {
  readonly id: string;
  readonly certificate_id: string;
  readonly holder_name: string;
  readonly designation: string;
  readonly issued_at: string;
  readonly enrollment_id: string;
}

interface EnrollmentRow {
  readonly id: string;
  readonly user_id: string | null;
  readonly email: string;
}

interface IssueCertificateArgs {
  readonly serviceClient: ReturnType<typeof createServiceRoleClient>;
  readonly enrollmentId: string;
  readonly sendEmail?: boolean;
  readonly trackAnalytics?: boolean;
}

export function formatCertificateDate(isoString: string): string {
  const date = new Date(isoString);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
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

  const prefix = enrollment.email.split('@')[0] ?? enrollment.email;
  return prefix
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function notifyFirstIssuance(
  certificate: CertificateRow,
  enrollment: EnrollmentRow,
  args: Pick<IssueCertificateArgs, 'sendEmail' | 'trackAnalytics'>,
): Promise<void> {
  if (args.sendEmail !== false) {
    sendCertificateIssued({
      email: enrollment.email,
      holderName: certificate.holder_name,
      designation: 'AiBI-Foundation — The AI Banking Institute',
      certificateId: certificate.certificate_id,
      issuedDate: formatCertificateDate(certificate.issued_at),
      enrollmentId: certificate.enrollment_id,
    }).catch((err) => console.warn('[certificate] resend skip', err));
  }

  if (args.trackAnalytics !== false) {
    void import('@vercel/analytics/server')
      .then((mod) =>
        mod.track('certificate_issued', { certificateId: certificate.certificate_id }),
      )
      .catch((err) => console.warn('[certificate] analytics skip', err));
  }
}

export async function issueCertificateForEnrollment(
  args: IssueCertificateArgs,
): Promise<{ certificate: CertificateRow; created: boolean }> {
  const { serviceClient, enrollmentId } = args;

  const { data: existingCert, error: existingError } = await serviceClient
    .from('certificates')
    .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
    .eq('enrollment_id', enrollmentId)
    .maybeSingle();

  if (existingError) {
    throw new Error('Failed to check for existing certificate.');
  }

  if (existingCert) {
    return { certificate: existingCert as CertificateRow, created: false };
  }

  const { data: enrollmentData, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select('id, user_id, email')
    .eq('id', enrollmentId)
    .single();

  if (enrollmentError || !enrollmentData) {
    throw new Error('Enrollment not found.');
  }

  const enrollment = enrollmentData as EnrollmentRow;
  const certificateId = generateCertificateId();
  const issuedAt = new Date().toISOString();
  const holderName = await resolveHolderName(serviceClient, enrollment);

  const { data: insertedCert, error: insertError } = await serviceClient
    .from('certificates')
    .insert({
      enrollment_id: enrollmentId,
      certificate_id: certificateId,
      holder_name: holderName,
      designation: 'AiBI-Foundation',
      issued_at: issuedAt,
    })
    .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
    .single();

  if (insertError) {
    if (
      insertError.code === '23505' ||
      (insertError.message &&
        (insertError.message.includes('unique') ||
          insertError.message.includes('duplicate')))
    ) {
      const { data: raceCert, error: raceError } = await serviceClient
        .from('certificates')
        .select('id, certificate_id, holder_name, designation, issued_at, enrollment_id')
        .eq('enrollment_id', enrollmentId)
        .single();

      if (raceError || !raceCert) {
        throw new Error('Failed to retrieve certificate after conflict.');
      }

      return { certificate: raceCert as CertificateRow, created: false };
    }

    throw new Error('Failed to create certificate record.');
  }

  const certificate = insertedCert as CertificateRow;
  await notifyFirstIssuance(certificate, enrollment, args);

  return { certificate, created: true };
}
