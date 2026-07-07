import { body, ctaButton, emailShell, escapeHtml, heading, kicker, metaRow } from './base';

export interface TeamAssessmentPurchaseTemplateVars {
  readonly institutionName: string;
  readonly seatsPurchased: number;
  readonly amountPaid: string;
  readonly adminUrl: string;
  readonly participantUrl: string;
}

export function teamAssessmentPurchaseHtml(v: TeamAssessmentPurchaseTemplateVars): string {
  const institutionName = escapeHtml(v.institutionName);
  return emailShell({
    preheader: `${institutionName}'s Team AI Readiness Assessment is ready`,
    body: `
      ${kicker('Team AI readiness assessment')}
      ${heading('Your cohort is ready.')}
      ${body(`The Team AI Readiness Assessment for ${institutionName} has been created. Share the participant link with staff, then use the dashboard to monitor completion and review the aggregate report once 10 people complete it.`)}
      ${ctaButton('Open team dashboard', v.adminUrl)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${metaRow('Institution', institutionName)}
        ${metaRow('Seats', String(v.seatsPurchased))}
        ${metaRow('Paid', v.amountPaid)}
      </table>
      ${body(`Participant link:<br/><a href="${v.participantUrl}" style="color:#9A7A2F">${v.participantUrl}</a>`)}
    `,
  });
}

export function teamAssessmentPurchaseText(v: TeamAssessmentPurchaseTemplateVars): string {
  return `Your Team AI Readiness Assessment is ready — ${v.institutionName}

Seats: ${v.seatsPurchased}
Paid: ${v.amountPaid}

Open the team dashboard:
${v.adminUrl}

Share this participant link with staff:
${v.participantUrl}

The aggregate report unlocks after 10 completed responses.`;
}
