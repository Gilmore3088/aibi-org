// Resend transactional email adapter — barrel.
//
// The transport core lives in ./_core and each per-domain group of sender
// functions lives under ./senders/*. This file re-exports the identical public
// surface previously defined inline, so every symbol importable from
// '@/lib/resend' keeps its name and shape.
//
// All templates are inline HTML (brand v1 palette — cream/ink/gold).
// Pattern: best-effort, non-blocking, no-op when env vars are unset.

export type { ResendResult } from './_core';

// ── Assessment ──────────────────────────────────────────────────────────────
export {
  sendAssessmentBreakdown,
  sendAssessmentOptions,
  sendAssessmentResumeLink,
} from './senders/assessment';
export type {
  AssessmentBreakdownEmailPayload,
  AssessmentOptionsPayload,
  AssessmentResumeLinkPayload,
} from './senders/assessment';

// ── Course ──────────────────────────────────────────────────────────────────
export {
  sendCoursePurchaseIndividual,
  sendCoursePurchaseInstitution,
  sendIndepthAssessmentPurchase,
} from './senders/course';
export type {
  CoursePurchaseIndividualPayload,
  CoursePurchaseInstitutionPayload,
  IndepthAssessmentPurchasePayload,
} from './senders/course';

// ── Team assessment ─────────────────────────────────────────────────────────
export {
  sendTeamAssessmentPurchase,
  sendTeamAssessmentParticipantReport,
  sendTeamAssessmentReportUnlocked,
} from './senders/team';
export type {
  TeamAssessmentPurchasePayload,
  TeamAssessmentParticipantReportPayload,
  TeamAssessmentReportUnlockedPayload,
} from './senders/team';

// ── Certificate ─────────────────────────────────────────────────────────────
export {
  sendCertificateIssued,
  sendCertificateTransferReminder,
} from './senders/certificate';
export type {
  CertificateIssuedPayload,
  CertificateTransferReminderPayload,
} from './senders/certificate';

// ── Support ops ─────────────────────────────────────────────────────────────
export {
  sendInquiryAck,
  sendResourceDelivery,
  sendInquiryNotification,
  sendSupportCaseNotification,
  sendSupportCaseAcknowledgement,
  sendSupportAccessRescue,
} from './senders/support';
export type {
  InquiryAckPayload,
  ResourceDeliveryPayload,
  InquiryNotificationPayload,
  SupportCaseNotificationPayload,
  SupportCaseAcknowledgementPayload,
  SupportAccessRescuePayload,
} from './senders/support';

// ── Auth ────────────────────────────────────────────────────────────────────
export {
  sendAuthSignInLink,
  sendDeviceConfirmation,
} from './senders/auth';
export type { DeviceConfirmationPayload } from './senders/auth';

// ── Paid-product retention reminders ────────────────────────────────────────
export {
  sendFoundationNotStartedReminder,
  sendFoundationStalledReminder,
  sendInDepthWaitingReminder,
} from './senders/reminders';
export type {
  FoundationNotStartedReminderPayload,
  FoundationStalledReminderPayload,
  InDepthWaitingReminderPayload,
} from './senders/reminders';

// ── Misc ────────────────────────────────────────────────────────────────────
export { sendWaitlistConfirmation } from './senders/misc';
export type { WaitlistConfirmationPayload } from './senders/misc';
