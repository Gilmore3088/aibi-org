// Resend transactional email adapter.
//
// All templates are now inline HTML (brand v1 palette — cream/ink/gold).
// Previously templates lived in the Resend dashboard (alias-based); converted
// to inline so branding and copy are in code, not a separate dashboard.
//
// Pattern: best-effort, non-blocking, no-op when env vars are unset.

import type { DimensionScoreSerialized } from '@/lib/user-data';
import {
  assessmentResultsBreakdownHtml,
  assessmentResultsBreakdownText,
} from './templates/assessment-results-breakdown';
import {
  coursePurchaseIndividualHtml,
  coursePurchaseIndividualText,
} from './templates/course-purchase-individual';
import {
  inDepthAssessmentPurchaseHtml,
  inDepthAssessmentPurchaseText,
} from './templates/in-depth-assessment-purchase';
import {
  coursePurchaseInstitutionHtml,
  coursePurchaseInstitutionText,
} from './templates/course-purchase-institution';
import {
  certificateIssuedHtml,
  certificateIssuedText,
} from './templates/certificate-issued';
import {
  waitlistConfirmationHtml,
  waitlistConfirmationText,
} from './templates/waitlist-confirmation';
import {
  assessmentOptionsHtml,
  assessmentOptionsText,
} from './templates/assessment-options';
import {
  inquiryAckHtml,
  inquiryAckText,
} from './templates/inquiry-ack';
import {
  resourceDeliveryHtml,
  resourceDeliveryText,
} from './templates/resource-delivery';
import {
  teamAssessmentPurchaseHtml,
  teamAssessmentPurchaseText,
} from './templates/team-assessment-purchase';
import {
  teamAssessmentParticipantReportHtml,
  teamAssessmentParticipantReportText,
} from './templates/team-assessment-participant-report';
import {
  teamAssessmentReportUnlockedHtml,
  teamAssessmentReportUnlockedText,
} from './templates/team-assessment-report-unlocked';
import {
  foundationNotStartedReminderHtml,
  foundationNotStartedReminderText,
  foundationStalledReminderHtml,
  foundationStalledReminderText,
  inDepthWaitingReminderHtml,
  inDepthWaitingReminderText,
} from './templates/paid-reengagement';

const RESEND_API_URL = 'https://api.resend.com/emails';

const DEFAULT_FROM = 'hello@aibankinginstitute.com';
const DEFAULT_FROM_NAME = 'The AI Banking Institute';
const REPLY_TO = 'hello@aibankinginstitute.com';

export type ResendResult =
  | { skipped: true; reason: string }
  | { ok: true; id: string }
  | { ok: false; error: string };

interface SendInlineInput {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly tag: string;
}

async function sendInline(input: SendInlineInput): Promise<ResendResult> {
  if (process.env.SKIP_RESEND === 'true') {
    console.warn(`${input.tag} SKIPPED — SKIP_RESEND env flag set`);
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`${input.tag} SKIPPED — RESEND_API_KEY not configured in this environment`);
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  console.log(`${input.tag} sending to=${input.to} subject="${input.subject}" key-prefix=${apiKey.slice(0, 8)}…`);

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
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error = `Resend API ${response.status}: ${body.slice(0, 400)}`;
      console.error(`${input.tag} FAILED — ${error}`);
      return { ok: false, error };
    }

    const json = (await response.json().catch(() => ({}))) as { id?: string };
    console.log(`${input.tag} SENT — id=${json.id ?? 'unknown'}`);
    return { ok: true, id: json.id ?? 'unknown' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unexpected error';
    console.error(`${input.tag} EXCEPTION — ${error}`);
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
  /** One-click magic-link login URL. */
  readonly magicLinkUrl?: string;
}

export function sendAssessmentBreakdown(
  payload: AssessmentBreakdownEmailPayload,
): Promise<ResendResult> {
  const resultsUrl = payload.profileId
    ? `https://aibankinginstitute.com/results/${payload.profileId}`
    : 'https://aibankinginstitute.com/assessment';

  const dashboardUrl =
    payload.magicLinkUrl ??
    'https://aibankinginstitute.com/auth/login?next=/dashboard';

  return sendInline({
    to: payload.email,
    subject: `Your AI readiness score — ${payload.tierLabel}`,
    html: assessmentResultsBreakdownHtml({
      tierLabel: payload.tierLabel,
      tierHeadline: payload.tierHeadline,
      tierSummary: payload.tierSummary,
      score: payload.score,
      maxScore: payload.maxScore,
      resultsUrl,
      dashboardUrl,
    }),
    text: assessmentResultsBreakdownText({
      tierLabel: payload.tierLabel,
      tierHeadline: payload.tierHeadline,
      tierSummary: payload.tierSummary,
      score: payload.score,
      maxScore: payload.maxScore,
      resultsUrl,
      dashboardUrl,
    }),
    tag: '[resend:assessment-results-breakdown]',
  });
}

// ── Email 2: Course purchase — individual ───────────────────────────────────

export interface CoursePurchaseIndividualPayload {
  readonly email: string;
  readonly courseName?: string;
  readonly courseUrl?: string;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendCoursePurchaseIndividual(
  payload: CoursePurchaseIndividualPayload,
): Promise<ResendResult> {
  const courseName = payload.courseName ?? 'AiBI-Foundation';
  const courseUrl =
    payload.magicLinkUrl ??
    payload.courseUrl ??
    'https://aibankinginstitute.com/courses/foundation/program';

  return sendInline({
    to: payload.email,
    subject: `Welcome to the ${courseName} program`,
    html: coursePurchaseIndividualHtml({ courseName, courseUrl, amountPaid: payload.amountPaid }),
    text: coursePurchaseIndividualText({ courseName, courseUrl, amountPaid: payload.amountPaid }),
    tag: '[resend:course-purchase-individual]',
  });
}

// ── Email 2.5: In-Depth Assessment purchase ────────────────────────────────

export interface IndepthAssessmentPurchasePayload {
  readonly email: string;
  readonly amountPaid: string;
  readonly magicLinkUrl?: string;
}

export function sendIndepthAssessmentPurchase(
  payload: IndepthAssessmentPurchasePayload,
): Promise<ResendResult> {
  const assessmentUrl =
    payload.magicLinkUrl ??
    'https://aibankinginstitute.com/assessment/in-depth/purchased';

  return sendInline({
    to: payload.email,
    subject: 'Your In-Depth AI Readiness Assessment is unlocked',
    html: inDepthAssessmentPurchaseHtml({ amountPaid: payload.amountPaid, assessmentUrl }),
    text: inDepthAssessmentPurchaseText({ amountPaid: payload.amountPaid, assessmentUrl }),
    tag: '[resend:in-depth-assessment-purchase]',
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
  const adminUrl =
    payload.magicLinkUrl ?? 'https://aibankinginstitute.com/courses/foundation/program';

  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your AiBI-Foundation seats are ready`,
    html: coursePurchaseInstitutionHtml({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl,
      courseUrl: 'https://aibankinginstitute.com/courses/foundation/program',
    }),
    text: coursePurchaseInstitutionText({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl,
      courseUrl: 'https://aibankinginstitute.com/courses/foundation/program',
    }),
    tag: '[resend:course-purchase-institution]',
  });
}

// ── Email 3.5: Team Assessment purchase ────────────────────────────────────

export interface TeamAssessmentPurchasePayload {
  readonly email: string;
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
  readonly adminUrl: string;
  readonly participantUrl: string;
}

export function sendTeamAssessmentPurchase(
  payload: TeamAssessmentPurchasePayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your Team Assessment is ready`,
    html: teamAssessmentPurchaseHtml({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl: payload.adminUrl,
      participantUrl: payload.participantUrl,
    }),
    text: teamAssessmentPurchaseText({
      institutionName: payload.institutionName,
      seatsPurchased: payload.seatsPurchased,
      amountPaid: payload.amountPaid,
      adminUrl: payload.adminUrl,
      participantUrl: payload.participantUrl,
    }),
    tag: '[resend:team-assessment-purchase]',
  });
}

// ── Email 3.6: Team Assessment participant personal report ────────────────

export interface TeamAssessmentParticipantReportPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly score: number;
  readonly bandLabel: string;
  readonly reportUrl: string;
}

export function sendTeamAssessmentParticipantReport(
  payload: TeamAssessmentParticipantReportPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `Your ${payload.institutionName} AI readiness report`,
    html: teamAssessmentParticipantReportHtml({
      institutionName: payload.institutionName,
      score: payload.score,
      bandLabel: payload.bandLabel,
      reportUrl: payload.reportUrl,
    }),
    text: teamAssessmentParticipantReportText({
      institutionName: payload.institutionName,
      score: payload.score,
      bandLabel: payload.bandLabel,
      reportUrl: payload.reportUrl,
    }),
    tag: '[resend:team-assessment-participant-report]',
  });
}

// ── Email 3.7: Team Assessment aggregate unlocked ──────────────────────────

export interface TeamAssessmentReportUnlockedPayload {
  readonly email: string;
  readonly institutionName: string;
  readonly completedCount: number;
  readonly adminUrl: string;
}

export function sendTeamAssessmentReportUnlocked(
  payload: TeamAssessmentReportUnlockedPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `${payload.institutionName} — your Team Assessment report is ready`,
    html: teamAssessmentReportUnlockedHtml({
      institutionName: payload.institutionName,
      completedCount: payload.completedCount,
      adminUrl: payload.adminUrl,
    }),
    text: teamAssessmentReportUnlockedText({
      institutionName: payload.institutionName,
      completedCount: payload.completedCount,
      adminUrl: payload.adminUrl,
    }),
    tag: '[resend:team-assessment-report-unlocked]',
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
  return sendInline({
    to: payload.email,
    subject: `Your AiBI-Foundation certificate is ready, ${payload.holderName}`,
    html: certificateIssuedHtml({
      holderName: payload.holderName,
      designation: payload.designation,
      certificateId: payload.certificateId,
      issuedDate: payload.issuedDate,
      verifyUrl: `https://aibankinginstitute.com/verify/${payload.certificateId}`,
      downloadUrl: `https://aibankinginstitute.com/api/courses/generate-certificate?enrollmentId=${payload.enrollmentId}`,
    }),
    text: certificateIssuedText({
      holderName: payload.holderName,
      designation: payload.designation,
      certificateId: payload.certificateId,
      issuedDate: payload.issuedDate,
      verifyUrl: `https://aibankinginstitute.com/verify/${payload.certificateId}`,
      downloadUrl: `https://aibankinginstitute.com/api/courses/generate-certificate?enrollmentId=${payload.enrollmentId}`,
    }),
    tag: '[resend:certificate-issued]',
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
  return sendInline({
    to: payload.email,
    subject: `You're on the list — ${payload.interestLabel}`,
    html: waitlistConfirmationHtml({
      interestLabel: payload.interestLabel,
      institution: payload.institution ?? 'your institution',
    }),
    text: waitlistConfirmationText({
      interestLabel: payload.interestLabel,
      institution: payload.institution ?? 'your institution',
    }),
    tag: '[resend:waitlist-confirmation]',
  });
}

// ── Email 7: Assessment options ──────────────────────────────────────────────

export interface AssessmentOptionsPayload {
  readonly email: string;
  readonly institution?: string;
}

export function sendAssessmentOptions(
  payload: AssessmentOptionsPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'The AI readiness assessment is ready when you are',
    html: assessmentOptionsHtml({ institution: payload.institution ?? 'your institution' }),
    text: assessmentOptionsText({ institution: payload.institution ?? 'your institution' }),
    tag: '[resend:assessment-options]',
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
  return sendInline({
    to: payload.email,
    subject: `We received your inquiry — ${payload.track}`,
    html: inquiryAckHtml({
      name: payload.name,
      institution: payload.institution,
      track: payload.track,
    }),
    text: inquiryAckText({
      name: payload.name,
      institution: payload.institution,
      track: payload.track,
    }),
    tag: '[resend:inquiry-ack]',
  });
}

// ── Email 6: Free resource delivery ─────────────────────────────────────────

export interface ResourceDeliveryPayload {
  readonly email: string;
  readonly title: string;
  readonly downloadUrl: string;
  readonly firstName?: string;
}

export function sendResourceDelivery(
  payload: ResourceDeliveryPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `Your download: ${payload.title}`,
    html: resourceDeliveryHtml({
      title: payload.title,
      downloadUrl: payload.downloadUrl,
      ...(payload.firstName ? { firstName: payload.firstName } : {}),
    }),
    text: resourceDeliveryText({
      title: payload.title,
      downloadUrl: payload.downloadUrl,
      ...(payload.firstName ? { firstName: payload.firstName } : {}),
    }),
    tag: '[resend:resource-delivery]',
  });
}

// ── Support ops ─────────────────────────────────────────────────────────────

function escapeInlineHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function supportShell(title: string, body: string): string {
  return `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;color:#071A2F;background:#F7F3EA;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid rgba(7,26,47,.10);border-radius:12px;padding:28px">
    <p style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9A7A2F;margin:0 0 8px">AI Banking Institute</p>
    <h1 style="font-size:22px;line-height:1.2;margin:0 0 16px;font-weight:700">${escapeInlineHtml(title)}</h1>
    ${body}
  </div>
</body></html>`;
}

export interface InquiryNotificationPayload {
  readonly to?: string;
  readonly name: string;
  readonly email: string;
  readonly institution: string;
  readonly track: string;
  readonly type: string;
  readonly notes: string;
}

export function sendInquiryNotification(
  payload: InquiryNotificationPayload,
): Promise<ResendResult> {
  const body = `
    <p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 16px">
      A new institution inquiry was submitted from the website.
    </p>
    <dl style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 20px">
      <dt style="font-weight:700;color:#071A2F">Name</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.name)}</dd>
      <dt style="font-weight:700;color:#071A2F">Email</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.email)}</dd>
      <dt style="font-weight:700;color:#071A2F">Institution</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.institution)}</dd>
      <dt style="font-weight:700;color:#071A2F">Track</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.track)}</dd>
      <dt style="font-weight:700;color:#071A2F">Type</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.type)}</dd>
      <dt style="font-weight:700;color:#071A2F">Notes</dt><dd style="margin:0">${escapeInlineHtml(payload.notes || 'No notes provided.')}</dd>
    </dl>`;

  return sendInline({
    to: payload.to ?? process.env.SUPPORT_INBOX_EMAIL ?? REPLY_TO,
    subject: `[AiBI inquiry] ${payload.track}`,
    html: supportShell('New institution inquiry', body),
    text: [
      'AI Banking Institute inquiry',
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Institution: ${payload.institution}`,
      `Track: ${payload.track}`,
      `Type: ${payload.type}`,
      '',
      payload.notes || 'No notes provided.',
    ].join('\n'),
    tag: '[resend:inquiry-notification]',
  });
}

export interface SupportCaseNotificationPayload {
  readonly to?: string;
  readonly caseId: string;
  readonly buyerEmail: string;
  readonly category: string;
  readonly subject: string;
  readonly summary: string;
  readonly adminUrl: string;
}

export function sendSupportCaseNotification(
  payload: SupportCaseNotificationPayload,
): Promise<ResendResult> {
  const body = `
    <p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 16px">
      A support case needs review.
    </p>
    <dl style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 20px">
      <dt style="font-weight:700;color:#071A2F">Buyer</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.buyerEmail)}</dd>
      <dt style="font-weight:700;color:#071A2F">Category</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.category)}</dd>
      <dt style="font-weight:700;color:#071A2F">Case</dt><dd style="margin:0 0 8px">${escapeInlineHtml(payload.caseId)}</dd>
      <dt style="font-weight:700;color:#071A2F">Summary</dt><dd style="margin:0">${escapeInlineHtml(payload.summary)}</dd>
    </dl>
    <p style="margin:24px 0 0">
      <a href="${payload.adminUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Open support case</a>
    </p>`;

  return sendInline({
    to: payload.to ?? process.env.SUPPORT_INBOX_EMAIL ?? REPLY_TO,
    subject: `[AiBI support] ${payload.subject}`,
    html: supportShell('New support case', body),
    text: [
      'AI Banking Institute support case',
      `Case: ${payload.caseId}`,
      `Buyer: ${payload.buyerEmail}`,
      `Category: ${payload.category}`,
      `Subject: ${payload.subject}`,
      '',
      payload.summary,
      '',
      payload.adminUrl,
    ].join('\n'),
    tag: '[resend:support-case-notification]',
  });
}

export interface SupportCaseAcknowledgementPayload {
  readonly email: string;
}

export function sendSupportCaseAcknowledgement(
  payload: SupportCaseAcknowledgementPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'We received your AI Banking Institute support request',
    html: supportShell(
      'We received your support request',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0">
        We received your message. A human will review it from hello@aibankinginstitute.com.
      </p>`,
    ),
    text:
      'AI Banking Institute\n\nWe received your support request. A human will review it from hello@aibankinginstitute.com.',
    tag: '[resend:support-case-ack]',
  });
}

export interface SupportAccessRescuePayload {
  readonly email: string;
  readonly accessUrl: string;
}

export function sendAuthSignInLink(
  payload: SupportAccessRescuePayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Your AI Banking Institute sign-in link',
    html: supportShell(
      'Your sign-in link',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 18px">
        Use this one-time link to sign in and continue. If you did not request it, you can ignore this email.
      </p>
      <p style="margin:0">
        <a href="${payload.accessUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Sign in</a>
      </p>`,
    ),
    text: `AI Banking Institute\n\nUse this one-time link to sign in and continue:\n${payload.accessUrl}\n\nIf you did not request it, you can ignore this email.`,
    tag: '[resend:auth-sign-in-link]',
  });
}

export interface AssessmentResumeLinkPayload {
  readonly email: string;
  readonly resumeUrl: string;
  readonly currentQuestion: number;
  readonly totalQuestions: number;
  readonly expiresInDays: number;
}

export function sendAssessmentResumeLink(
  payload: AssessmentResumeLinkPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Resume your AI readiness assessment',
    html: supportShell(
      'Resume your assessment',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 18px">
        Continue from question ${payload.currentQuestion} of ${payload.totalQuestions}. This link keeps your current question set and saved answers.
      </p>
      <p style="margin:0 0 14px">
        <a href="${payload.resumeUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Resume assessment</a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:#64748B;margin:0">
        The link expires in ${payload.expiresInDays} days. If you did not request it, you can ignore this email.
      </p>`,
    ),
    text:
      `AI Banking Institute\n\n` +
      `Resume your AI readiness assessment from question ${payload.currentQuestion} of ${payload.totalQuestions}:\n` +
      `${payload.resumeUrl}\n\n` +
      `This link expires in ${payload.expiresInDays} days. If you did not request it, you can ignore this email.`,
    tag: '[resend:assessment-resume-link]',
  });
}

// ── Paid-product retention reminders ───────────────────────────────────────

export interface FoundationNotStartedReminderPayload {
  readonly email: string;
  readonly actionUrl: string;
}

export function sendFoundationNotStartedReminder(
  payload: FoundationNotStartedReminderPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Your AiBI-Foundation enrollment is ready',
    html: foundationNotStartedReminderHtml({ actionUrl: payload.actionUrl }),
    text: foundationNotStartedReminderText({ actionUrl: payload.actionUrl }),
    tag: '[resend:foundation-not-started-reminder]',
  });
}

export interface FoundationStalledReminderPayload {
  readonly email: string;
  readonly actionUrl: string;
  readonly moduleNumber: number;
}

export function sendFoundationStalledReminder(
  payload: FoundationStalledReminderPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: `Continue AiBI-Foundation Module ${payload.moduleNumber}`,
    html: foundationStalledReminderHtml({
      actionUrl: payload.actionUrl,
      moduleNumber: payload.moduleNumber,
    }),
    text: foundationStalledReminderText({
      actionUrl: payload.actionUrl,
      moduleNumber: payload.moduleNumber,
    }),
    tag: '[resend:foundation-stalled-reminder]',
  });
}

export interface InDepthWaitingReminderPayload {
  readonly email: string;
  readonly actionUrl: string;
}

export function sendInDepthWaitingReminder(
  payload: InDepthWaitingReminderPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Your In-Depth Assessment is waiting',
    html: inDepthWaitingReminderHtml({ actionUrl: payload.actionUrl }),
    text: inDepthWaitingReminderText({ actionUrl: payload.actionUrl }),
    tag: '[resend:in-depth-waiting-reminder]',
  });
}

export function sendSupportAccessRescue(
  payload: SupportAccessRescuePayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Your AI Banking Institute access link',
    html: supportShell(
      'Your access link',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 18px">
        Use this one-time link to sign in and continue.
      </p>
      <p style="margin:0">
        <a href="${payload.accessUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Open my access</a>
      </p>`,
    ),
    text: `AI Banking Institute\n\nUse this one-time link to sign in and continue:\n${payload.accessUrl}`,
    tag: '[resend:support-access-rescue]',
  });
}

// ── Device confirmation (already inline HTML — unchanged) ───────────────────

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
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid rgba(7,26,47,.10);border-radius:16px;padding:32px">
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
