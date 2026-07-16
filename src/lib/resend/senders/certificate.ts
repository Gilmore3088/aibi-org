// Certificate transactional emails.

import {
  certificateIssuedHtml,
  certificateIssuedText,
} from '../templates/certificate-issued';
import {
  certificateTransferReminderHtml,
  certificateTransferReminderText,
  type CertificateTransferReminderVars,
} from '../templates/certificate-transfer';
import { sendInline, siteUrl, type ResendResult } from '../_core';

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
      verifyUrl: `${siteUrl()}/verify/${payload.certificateId}`,
      downloadUrl: `${siteUrl()}/api/courses/generate-certificate?enrollmentId=${payload.enrollmentId}`,
    }),
    text: certificateIssuedText({
      holderName: payload.holderName,
      designation: payload.designation,
      certificateId: payload.certificateId,
      issuedDate: payload.issuedDate,
      verifyUrl: `${siteUrl()}/verify/${payload.certificateId}`,
      downloadUrl: `${siteUrl()}/api/courses/generate-certificate?enrollmentId=${payload.enrollmentId}`,
    }),
    tag: '[resend:certificate-issued]',
  });
}

export interface CertificateTransferReminderPayload {
  readonly email: string;
  readonly vars: CertificateTransferReminderVars;
}

export function sendCertificateTransferReminder(
  payload: CertificateTransferReminderPayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: payload.vars.headingText,
    html: certificateTransferReminderHtml(payload.vars),
    text: certificateTransferReminderText(payload.vars),
    tag: `[resend:certificate-transfer-${payload.vars.stage}]`,
  });
}
