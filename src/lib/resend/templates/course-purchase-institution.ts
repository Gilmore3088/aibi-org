// Email 3: AiBI-Foundation institution/team purchase confirmation.
// Sent to the purchaser (admin) when a multi-seat order completes.

import { emailShell, kicker, heading, body, ctaButton, divider, metaRow } from './base';

export interface CoursePurchaseInstitutionVars {
  institutionName: string;
  seatsPurchased: number;
  amountPaid: string;
  adminUrl: string;
  courseUrl: string;
}

export function coursePurchaseInstitutionHtml(v: CoursePurchaseInstitutionVars): string {
  const bodyContent = `
    ${kicker('Purchase confirmed')}
    ${heading(`${v.institutionName} — your AiBI-Foundation seats are ready.`)}
    ${body(`${v.seatsPurchased} seat${v.seatsPurchased === 1 ? '' : 's'} are active. Use the admin link below to view and manage enrollments.`)}
    ${ctaButton('Open admin dashboard →', v.adminUrl)}
    ${divider()}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tbody>
        ${metaRow('Institution', v.institutionName)}
        ${metaRow('Seats', String(v.seatsPurchased))}
        ${metaRow('Amount', v.amountPaid)}
        ${metaRow('Access', 'Lifetime per seat')}
      </tbody>
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#637083">
      Share the program link with your team:
      <a href="${v.courseUrl}" style="color:#9A7A2F">${v.courseUrl}</a><br/>
      Questions? Reply to this email or write to
      <a href="mailto:hello@aibankinginstitute.com" style="color:#9A7A2F">hello@aibankinginstitute.com</a>.
    </p>
  `;

  return emailShell({
    preheader: `${v.institutionName} — ${v.seatsPurchased} AiBI-Foundation seat${v.seatsPurchased === 1 ? '' : 's'} confirmed`,
    body: bodyContent,
  });
}

export function coursePurchaseInstitutionText(v: CoursePurchaseInstitutionVars): string {
  return `Purchase confirmed — ${v.institutionName}

${v.seatsPurchased} seat${v.seatsPurchased === 1 ? '' : 's'} are active.

Open admin dashboard:
${v.adminUrl}

Institution: ${v.institutionName}
Seats: ${v.seatsPurchased}
Amount: ${v.amountPaid}
Access: Lifetime per seat

Share the program link with your team:
${v.courseUrl}

Questions? Reply to this email or write to hello@aibankinginstitute.com.

— The AI Banking Institute
aibankinginstitute.com`;
}
