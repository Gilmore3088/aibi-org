import { emailShell, kicker, heading, body, ctaButton, divider, metaRow } from './base';

export interface FoundationNotStartedReminderVars {
  actionUrl: string;
}

export interface FoundationStalledReminderVars {
  actionUrl: string;
  moduleNumber: number;
}

export interface InDepthWaitingReminderVars {
  actionUrl: string;
}

export function foundationNotStartedReminderHtml(v: FoundationNotStartedReminderVars): string {
  const bodyContent = `
    ${kicker('Your enrollment is active')}
    ${heading('Start AiBI-Foundation when you have a clear half hour.')}
    ${body('Your Foundation access is ready. The first module is built to get you oriented quickly, then the program saves progress as you move through the practical work.')}
    ${ctaButton('Open Module 1', v.actionUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${metaRow('Program', 'AiBI-Foundation')}
        ${metaRow('Next step', 'Open Module 1 and complete the first short activity')}
        ${metaRow('Support', 'Reply to this email if your bank blocks the sign-in link')}
      </tbody>
    </table>
  `;

  return emailShell({
    preheader: 'Your AiBI-Foundation enrollment is ready to start',
    body: bodyContent,
  });
}

export function foundationNotStartedReminderText(v: FoundationNotStartedReminderVars): string {
  return `Your AiBI-Foundation enrollment is active.

Your Foundation access is ready. The first module is built to get you oriented quickly, then the program saves progress as you move through the practical work.

Open Module 1:
${v.actionUrl}

If your bank blocks the sign-in link, reply to this email and we will help.

The AI Banking Institute
aibankinginstitute.com`;
}

export function foundationStalledReminderHtml(v: FoundationStalledReminderVars): string {
  const bodyContent = `
    ${kicker('Continue your program')}
    ${heading(`Module ${v.moduleNumber} is waiting for you.`)}
    ${body('You still have access to the Foundation program. Pick up where you left off, complete the next module, and keep building toward the verifiable certificate.')}
    ${ctaButton(`Continue Module ${v.moduleNumber}`, v.actionUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${metaRow('Program', 'AiBI-Foundation')}
        ${metaRow('Resume at', `Module ${v.moduleNumber}`)}
        ${metaRow('Support', 'Reply if you need the access link resent')}
      </tbody>
    </table>
  `;

  return emailShell({
    preheader: `Continue AiBI-Foundation at Module ${v.moduleNumber}`,
    body: bodyContent,
  });
}

export function foundationStalledReminderText(v: FoundationStalledReminderVars): string {
  return `Continue AiBI-Foundation at Module ${v.moduleNumber}.

You still have access to the Foundation program. Pick up where you left off, complete the next module, and keep building toward the verifiable certificate.

Continue Module ${v.moduleNumber}:
${v.actionUrl}

If you need the access link resent, reply to this email.

The AI Banking Institute
aibankinginstitute.com`;
}

export function inDepthWaitingReminderHtml(v: InDepthWaitingReminderVars): string {
  const bodyContent = `
    ${kicker('Your diagnostic is unlocked')}
    ${heading('Your In-Depth Assessment is still waiting.')}
    ${body('Your 48-question In-Depth AI Readiness Assessment is unlocked. Complete it when you have focused time, and the paid report will generate from your answers.')}
    ${ctaButton('Take the In-Depth Assessment', v.actionUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${metaRow('Product', 'In-Depth AI Readiness Assessment')}
        ${metaRow('Next step', 'Complete the 48-question diagnostic')}
        ${metaRow('Support', 'Reply if your sign-in link is blocked')}
      </tbody>
    </table>
  `;

  return emailShell({
    preheader: 'Your In-Depth AI Readiness Assessment is unlocked',
    body: bodyContent,
  });
}

export function inDepthWaitingReminderText(v: InDepthWaitingReminderVars): string {
  return `Your In-Depth Assessment is still waiting.

Your 48-question In-Depth AI Readiness Assessment is unlocked. Complete it when you have focused time, and the paid report will generate from your answers.

Take the In-Depth Assessment:
${v.actionUrl}

If your bank blocks the sign-in link, reply to this email and we will help.

The AI Banking Institute
aibankinginstitute.com`;
}
