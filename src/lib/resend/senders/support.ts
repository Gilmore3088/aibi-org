// Support-ops and lead-response transactional emails, plus the shared
// support-email HTML shell used by several plain-body senders.

import { escapeHtml as escapeInlineHtml } from '@/lib/html/escape';
import {
  inquiryAckHtml,
  inquiryAckText,
} from '../templates/inquiry-ack';
import {
  resourceDeliveryHtml,
  resourceDeliveryText,
} from '../templates/resource-delivery';
import { sendInline, REPLY_TO, type ResendResult } from '../_core';

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

export function supportShell(title: string, body: string): string {
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
