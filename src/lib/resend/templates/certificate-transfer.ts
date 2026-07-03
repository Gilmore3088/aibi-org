// Post-certificate transfer reminders (30/60/90 days).
//
// Learning transfer, not marketing: each stage prompts one concrete
// workplace rep drawn from the learner's role path. Copy must stay
// goal-framed — never claim measured peer outcomes (see copy-hygiene).

import { emailShell, kicker, heading, body, ctaButton, divider, metaRow } from './base';

export interface CertificateTransferReminderVars {
  readonly stage: 30 | 60 | 90;
  readonly headingText: string;
  readonly bodyText: string;
  readonly items: readonly string[];
  readonly ctaLabel: string;
  readonly actionUrl: string;
}

const STAGE_KICKER: Record<CertificateTransferReminderVars['stage'], string> = {
  30: 'Your credential, 30 days on',
  60: 'Your credential, 60 days on',
  90: 'Your credential, 90 days on',
};

export function certificateTransferReminderHtml(v: CertificateTransferReminderVars): string {
  const itemRows = v.items
    .map((item, index) => metaRow(`Rep ${index + 1}`, item))
    .join('\n');

  const bodyContent = `
    ${kicker(STAGE_KICKER[v.stage])}
    ${heading(v.headingText)}
    ${body(v.bodyText)}
    ${ctaButton(v.ctaLabel, v.actionUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${itemRows}
        ${metaRow('Support', 'Reply to this email if your sign-in link is blocked')}
      </tbody>
    </table>
  `;

  return emailShell({
    preheader: v.headingText,
    body: bodyContent,
  });
}

export function certificateTransferReminderText(v: CertificateTransferReminderVars): string {
  const items = v.items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  return `${STAGE_KICKER[v.stage]}

${v.headingText}

${v.bodyText}

${items}

${v.ctaLabel}:
${v.actionUrl}

If your bank blocks the sign-in link, reply to this email and we will help.

The AI Banking Institute
aibankinginstitute.com`;
}
