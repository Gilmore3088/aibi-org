// Paid-product retention reminder emails.

import {
  foundationNotStartedReminderHtml,
  foundationNotStartedReminderText,
  foundationStalledReminderHtml,
  foundationStalledReminderText,
  inDepthWaitingReminderHtml,
  inDepthWaitingReminderText,
} from '../templates/paid-reengagement';
import { sendInline, type ResendResult } from '../_core';

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
