import { body, ctaButton, emailShell, heading, kicker, metaRow } from './base';

export interface TeamAssessmentReportUnlockedTemplateVars {
  readonly institutionName: string;
  readonly completedCount: number;
  readonly adminUrl: string;
}

export function teamAssessmentReportUnlockedHtml(
  v: TeamAssessmentReportUnlockedTemplateVars,
): string {
  return emailShell({
    preheader: `${v.institutionName}'s Team AI Readiness Assessment report is unlocked`,
    body: `
      ${kicker('Report unlocked')}
      ${heading('Your aggregate team report is ready.')}
      ${body(`${v.institutionName} has reached the 10-response threshold. The aggregate dashboard now shows overall readiness, department and role slices that meet the privacy threshold, and the printable executive report.`)}
      ${ctaButton('Open team report', v.adminUrl)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${metaRow('Completed', String(v.completedCount))}
        ${metaRow('Unlock threshold', '10')}
      </table>
    `,
  });
}

export function teamAssessmentReportUnlockedText(
  v: TeamAssessmentReportUnlockedTemplateVars,
): string {
  return `Your aggregate Team Assessment report is ready.

Institution: ${v.institutionName}
Completed responses: ${v.completedCount}

Open the team report:
${v.adminUrl}`;
}
