// Email 2: AiBI-Foundation individual purchase confirmation.

import { emailShell, kicker, heading, body, ctaButton, divider, metaRow } from './base';

export interface CoursePurchaseIndividualVars {
  courseName: string;
  courseUrl: string;
  amountPaid: string;
}

export function coursePurchaseIndividualHtml(v: CoursePurchaseIndividualVars): string {
  const bodyContent = `
    ${kicker('Purchase confirmed')}
    ${heading(`Welcome to ${v.courseName}.`)}
    ${body('Your enrollment is active. The program is self-paced - work through the bite-sized modules whenever it fits your schedule.')}
    ${ctaButton('Open the program →', v.courseUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${metaRow('Program', v.courseName)}
        ${metaRow('Amount', v.amountPaid)}
        ${metaRow('Access', 'Lifetime')}
      </tbody>
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#637083">
      A Stripe receipt is on its way separately. Questions? Reply to this email or write to
      <a href="mailto:hello@aibankinginstitute.com" style="color:#9A7A2F">hello@aibankinginstitute.com</a>.
    </p>
  `;

  return emailShell({
    preheader: `You're enrolled in ${v.courseName} — get started now`,
    body: bodyContent,
  });
}

export function coursePurchaseIndividualText(v: CoursePurchaseIndividualVars): string {
  return `Purchase confirmed — ${v.courseName}

Welcome. Your enrollment is active. The program is self-paced - work through the bite-sized modules whenever it fits your schedule.

Open the program:
${v.courseUrl}

Program: ${v.courseName}
Amount: ${v.amountPaid}
Access: Lifetime

A Stripe receipt is on its way separately. Questions? Reply to this email or write to hello@aibankinginstitute.com.

— The AI Banking Institute
aibankinginstitute.com`;
}
