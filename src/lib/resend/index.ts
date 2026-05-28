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
  /** One-click magic-link login URL. When present, DASHBOARD_URL in the
      Resend template resolves to a signed-in landing; absent, it falls
      back to /auth/login with a return path. */
  readonly magicLinkUrl?: string;
}

export function sendAssessmentBreakdown(
  payload: AssessmentBreakdownEmailPayload,
): Promise<ResendResult> {
  // /results/{profileId} treats the UUID as a bearer token — no auth.
  // Falls back to /assessment only if profile creation failed upstream.
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
      DASHBOARD_URL:
        payload.magicLinkUrl ??
        'https://aibankinginstitute.com/auth/login?next=/dashboard',
    },
  });
}

// ── Email 2: Course purchase — individual ───────────────────────────────────

export interface CoursePurchaseIndividualPayload {
  readonly email: string;
  readonly courseName?: string;
  readonly courseUrl?: string;
  readonly amountPaid: string;
  /** One-click magic-link login URL — buyer clicks to land in an authed session. */
  readonly magicLinkUrl?: string;
}

export function sendCoursePurchaseIndividual(
  payload: CoursePurchaseIndividualPayload,
): Promise<ResendResult> {
  const courseName = payload.courseName ?? 'AiBI-Foundation';
  return sendTemplate({
    to: payload.email,
    templateAlias: 'course-purchase-individual',
    subject: `Welcome to the ${courseName} program`,
    variables: {
      COURSE_NAME: courseName,
      // COURSE_URL is what the email's primary CTA points at. When a magic
      // link is available, prefer it so guest buyers get a one-click login;
      // fall back to the public course page for returning users.
      COURSE_URL:
        payload.magicLinkUrl ??
        payload.courseUrl ??
        'https://aibankinginstitute.com/courses/foundation/program',
      AMOUNT_PAID: payload.amountPaid,
      RECEIPT_URL: 'https://aibankinginstitute.com/dashboard',
    },
  });
}

// ── Email 2.5: In-Depth Assessment purchase ────────────────────────────────

export interface IndepthAssessmentPurchasePayload {
  readonly email: string;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

/**
 * Sent after a successful $99 In-Depth Assessment purchase. Distinct from
 * `course-purchase-individual` because the buyer is signing up for a
 * 48-question diagnostic, not a 12-module course.
 *
 * Template alias must be published in the Resend dashboard before this
 * helper resolves to an actual email send. Until the template exists,
 * this helper logs the skip and returns silently — the purchase still
 * succeeds.
 */
export function sendIndepthAssessmentPurchase(
  payload: IndepthAssessmentPurchasePayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'in-depth-assessment-purchase',
    subject: 'Your In-Depth AI Readiness Assessment is unlocked',
    variables: {
      AMOUNT_PAID: payload.amountPaid,
      ASSESSMENT_URL:
        payload.magicLinkUrl ??
        'https://aibankinginstitute.com/assessment/in-depth/purchased',
    },
  });
}

// ── Email 3: Course purchase — institution bundle ───────────────────────────

export interface CoursePurchaseInstitutionPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendCoursePurchaseInstitution(
  payload: CoursePurchaseInstitutionPayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'course-purchase-institution',
    subject: `${payload.institutionName} — your AiBI-Foundation seats are ready`,
    variables: {
      INSTITUTION_NAME: payload.institutionName,
      SEATS_PURCHASED: payload.seatsPurchased,
      AMOUNT_PAID: payload.amountPaid,
      ADMIN_URL:
        payload.magicLinkUrl ?? 'https://aibankinginstitute.com/courses/foundation/program',
      COURSE_URL: 'https://aibankinginstitute.com/courses/foundation/program',
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
    subject: `Your AiBI-Foundation certificate is ready, ${payload.holderName}`,
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

// ── Email 6: Waitlist confirmation ──────────────────────────────────────────

export interface WaitlistConfirmationPayload {
  readonly email: string;
  readonly interestLabel: string;
  readonly institution?: string;
}

export function sendWaitlistConfirmation(
  payload: WaitlistConfirmationPayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'waitlist-confirmation',
    subject: `You're on the list — ${payload.interestLabel}`,
    variables: {
      INTEREST_LABEL: payload.interestLabel,
      INSTITUTION: payload.institution ?? 'your institution',
    },
  });
}

// ── Email 7: Assessment options (waitlist signed up for "assessment") ──────

export interface AssessmentOptionsPayload {
  readonly email: string;
  readonly institution?: string;
}

/**
 * When a visitor signs up for the "assessment" waitlist, the assessment is
 * already live — we don't make them wait. This email gives them the free
 * 12-question version and the paid 48-question In-Depth version side by
 * side, both with direct links.
 */
export function sendAssessmentOptions(
  payload: AssessmentOptionsPayload,
): Promise<ResendResult> {
  return sendTemplate({
    to: payload.email,
    templateAlias: 'assessment-options',
    subject: 'The AI readiness assessment is ready when you are',
    variables: {
      INSTITUTION: payload.institution ?? 'your institution',
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

// ── Email: New-device sign-in confirmation (#187 PR 2) ──────────────────
//
// Sent after a password sign-in from an unrecognized device. Inline HTML
// (no Resend template alias needed) so this works out of the box without
// any operator setup beyond RESEND_API_KEY.

export interface DeviceConfirmationPayload {
  readonly email: string;
  readonly confirmUrl: string;
  readonly expiresInMinutes: number;
  readonly ipApprox?: string | null;
  readonly userAgent?: string | null;
  readonly atDisplay: string;
}

export async function sendDeviceConfirmation(
  payload: DeviceConfirmationPayload,
): Promise<ResendResult> {
  const tag = '[resend:device-confirmation]';

  if (process.env.SKIP_RESEND === 'true') {
    console.warn(`${tag} SKIPPED — SKIP_RESEND env flag set`);
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`${tag} SKIPPED — RESEND_API_KEY not configured`);
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  const safeAgent = (payload.userAgent ?? 'an unknown browser').slice(0, 200);
  const safeIp = payload.ipApprox ?? 'unknown';

  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;color:#071A2F;background:#F7F3EA;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:32px">
    <p style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9A7A2F;margin:0 0 8px">Confirm sign-in</p>
    <h1 style="font-size:24px;line-height:1.2;margin:0 0 16px;font-weight:700">Confirm your sign-in to The AI Banking Institute.</h1>
    <p style="font-size:15px;line-height:1.55;color:#475569;margin:0 0 20px">
      Someone just signed in to your account from a device or browser we haven&rsquo;t seen before. If this was you, confirm to finish signing in.
    </p>
    <p style="text-align:center;margin:24px 0">
      <a href="${payload.confirmUrl}" style="display:inline-block;padding:14px 28px;background:#C8A24A;color:#071A2F;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-radius:12px">Confirm sign-in</a>
    </p>
    <p style="font-size:13px;line-height:1.5;color:#64748B;margin:24px 0 0">
      Sign-in details:<br/>
      <strong>Time:</strong> ${payload.atDisplay}<br/>
      <strong>Browser:</strong> ${safeAgent}<br/>
      <strong>IP fingerprint:</strong> ${safeIp}
    </p>
    <p style="font-size:13px;line-height:1.5;color:#64748B;margin:16px 0 0">
      This link expires in ${payload.expiresInMinutes} minutes. If this wasn&rsquo;t you, ignore the email and consider resetting your password.
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#94A3B8;margin-top:16px">The AI Banking Institute &middot; aibankinginstitute.com</p>
</body></html>`;

  const text = `Confirm your sign-in to The AI Banking Institute.

Someone just signed in to your account from a device or browser we haven't seen before.

Confirm the sign-in:
${payload.confirmUrl}

Time: ${payload.atDisplay}
Browser: ${safeAgent}
IP fingerprint: ${safeIp}

This link expires in ${payload.expiresInMinutes} minutes. If this wasn't you, ignore this email and consider resetting your password.

— The AI Banking Institute`;

  console.log(`${tag} sending to=${payload.email} key-prefix=${apiKey.slice(0, 8)}…`);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [payload.email],
        reply_to: REPLY_TO,
        subject: 'Confirm your sign-in — The AI Banking Institute',
        html,
        text,
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
