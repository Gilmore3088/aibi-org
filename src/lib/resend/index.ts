// Resend transactional email adapter.
//
// All transactional emails route through Resend Templates so non-developers
// can edit copy in the dashboard without a code deploy. Each helper in this
// file maps one user event to one published template alias.
//
// Pattern: best-effort, non-blocking, no-op when env vars are unset. Failure
// is logged and swallowed so request flows are never blocked by an outbound
// email problem.

import type { DimensionScoreSerialized } from '@/lib/user-data';

const RESEND_API_URL = 'https://api.resend.com/emails';

const DEFAULT_FROM = 'hello@aibankinginstitute.com';
const DEFAULT_FROM_NAME = 'The AI Banking Institute';
const REPLY_TO = 'hello@aibankinginstitute.com';

export type ResendResult =
  | { skipped: true; reason: string }
  | { ok: true; id: string }
  | { ok: false; error: string };

interface SendTemplateInput {
  readonly to: string;
  readonly templateAlias: string;
  readonly subject: string;
  readonly variables: Record<string, string | number>;
}

async function sendTemplate(input: SendTemplateInput): Promise<ResendResult> {
  const tag = `[resend:${input.templateAlias}]`;

  if (process.env.SKIP_RESEND === 'true') {
    console.warn(`${tag} SKIPPED — SKIP_RESEND env flag set`);
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`${tag} SKIPPED — RESEND_API_KEY not configured in this environment`);
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  console.log(
    `${tag} sending to=${input.to} subject="${input.subject}" key-prefix=${apiKey.slice(0, 8)}…`,
  );

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [input.to],
        reply_to: REPLY_TO,
        subject: input.subject,
        template: {
          id: input.templateAlias,
          variables: input.variables,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error = `Resend API ${response.status}: ${body.slice(0, 400)}`;
      console.error(`${tag} FAILED — ${error}`);
      return { ok: false, error };
    }

    const json = (await response.json().catch(() => ({}))) as { id?: string };
    console.log(`${tag} SENT — id=${json.id ?? 'unknown'}`);
    return { ok: true, id: json.id ?? 'unknown' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unexpected error';
    console.error(`${tag} EXCEPTION — ${error}`);
    return { ok: false, error };
  }
}

// ── Email 1: Assessment results breakdown ───────────────────────────────────

export interface AssessmentBreakdownEmailPayload {
  readonly email: string;
  readonly score: number;
  readonly maxScore: number;
  readonly tierId: string;
  readonly tierLabel: string;
  readonly tierHeadline: string;
  readonly tierSummary: string;
  readonly dimensionBreakdown?: Record<string, DimensionScoreSerialized>;
  readonly starterArtifactTitle?: string;
  readonly starterArtifactBody?: string;
  readonly profileId?: string | null;
}

export function sendAssessmentBreakdown(
  payload: AssessmentBreakdownEmailPayload,
): Promise<ResendResult> {
  // Prefer the owner-bound /results/{id} URL so the recipient lands on
  // their own results, not a fresh assessment. Falls back to /assessment
  // only when profile creation failed upstream.
  const resultsUrl = payload.profileId
    ? `https://aibankinginstitute.com/results/${payload.profileId}`
    : 'https://aibankinginstitute.com/assessment';

  return sendTemplate({
    to: payload.email,
    templateAlias: 'assessment-results-breakdown',
    subject: `Your AI readiness score — ${payload.tierLabel}`,
    variables: {
      SCORE: payload.score,
      MAX_SCORE: payload.maxScore,
      TIER_LABEL: payload.tierLabel,
      TIER_HEADLINE: payload.tierHeadline,
      TIER_SUMMARY: payload.tierSummary,
      RESULTS_URL: resultsUrl,
    },
  });
}

// ── Email 2: Course purchase — individual ───────────────────────────────────

export interface CoursePurchaseIndividualPayload {
  readonly email: string;
  readonly courseName?: string;
  readonly courseUrl?: string;
  readonly amountPaid: string;
}

export function sendCoursePurchaseIndividual(
  payload: CoursePurchaseIndividualPayload,
): Promise<ResendResult> {
  const courseName = payload.courseName ?? 'AiBI-Practitioner';
  return sendTemplate({
    to: payload.email,
    templateAlias: 'course-purchase-individual',
    subject: `Welcome to the ${courseName} program`,
    variables: {
      COURSE_NAME: courseName,
      COURSE_URL: payload.courseUrl ?? 'https://aibankinginstitute.com/courses/aibi-p',
      AMOUNT_PAID: payload.amountPaid,
      RECEIPT_URL: 'https://aibankinginstitute.com/dashboard',
    },
  });
}

// ── Email 3: Course purchase — institution bundle ───────────────────────────

export interface CoursePurchaseInstitutionPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
}

export function sendCoursePurchaseInstitution(
  payload: CoursePurchaseInstitutionPayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'course-purchase-institution',
    subject: `${payload.institutionName} — your AiBI-Practitioner seats are ready`,
    variables: {
      INSTITUTION_NAME: payload.institutionName,
      SEATS_PURCHASED: payload.seatsPurchased,
      AMOUNT_PAID: payload.amountPaid,
      ADMIN_URL: 'https://aibankinginstitute.com/admin',
      COURSE_URL: 'https://aibankinginstitute.com/courses/aibi-p',
    },
  });
}

// ── Email 4: Certificate issued ─────────────────────────────────────────────

export interface CertificateIssuedPayload {
  readonly email: string;
  readonly holderName: string;
  readonly designation: string;
  readonly certificateId: string;
  readonly issuedDate: string;
  readonly enrollmentId: string;
}

export function sendCertificateIssued(
  payload: CertificateIssuedPayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'certificate-issued',
    subject: `Your AiBI-Practitioner certificate is ready, ${payload.holderName}`,
    variables: {
      HOLDER_NAME: payload.holderName,
      DESIGNATION: payload.designation,
      CERTIFICATE_ID: payload.certificateId,
      ISSUED_DATE: payload.issuedDate,
      VERIFY_URL: `https://aibankinginstitute.com/verify/${payload.certificateId}`,
      DOWNLOAD_URL: `https://aibankinginstitute.com/api/courses/generate-certificate?enrollmentId=${payload.enrollmentId}`,
    },
  });
}

// ── Email 5: Inquiry acknowledgement ────────────────────────────────────────

export interface InquiryAckPayload {
  readonly email: string;
  readonly name: string;
  readonly institution: string;
  readonly track: string;
}

export function sendInquiryAck(payload: InquiryAckPayload): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'inquiry-ack',
    subject: `We received your inquiry — ${payload.track}`,
    variables: {
      NAME: payload.name,
      INSTITUTION: payload.institution,
      TRACK: payload.track,
    },
  });
}
