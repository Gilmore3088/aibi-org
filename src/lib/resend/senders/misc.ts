// Miscellaneous transactional emails that don't fit a larger domain group.

import {
  waitlistConfirmationHtml,
  waitlistConfirmationText,
} from '../templates/waitlist-confirmation';
import { sendInline, type ResendResult } from '../_core';

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
