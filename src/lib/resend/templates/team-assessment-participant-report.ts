import { body, ctaButton, emailShell, escapeHtml, heading, kicker, metaRow } from './base';

export interface TeamAssessmentParticipantReportTemplateVars {
  readonly institutionName: string;
  readonly score: number;
  readonly bandLabel: string;
  readonly reportUrl: string;
}

export function teamAssessmentParticipantReportHtml(
  v: TeamAssessmentParticipantReportTemplateVars,
): string {
  const institutionName = escapeHtml(v.institutionName);
  return emailShell({
    preheader: `Your AI readiness report for ${institutionName}`,
    body: `
      ${kicker('Team AI readiness assessment')}
      ${heading('Your personal report is ready.')}
      ${body(`You completed the Team AI Readiness Assessment for ${institutionName}. Your personal report is separate from the aggregate admin dashboard and is available at the link below.`)}
      ${ctaButton('Open personal report', v.reportUrl)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${metaRow('Score', `${v.score}/100`)}
        ${metaRow('Band', v.bandLabel)}
      </table>
    `,
  });
}

export function teamAssessmentParticipantReportText(
  v: TeamAssessmentParticipantReportTemplateVars,
): string {
  return `Your personal AI readiness report is ready.

Institution: ${v.institutionName}
Score: ${v.score}/100
Band: ${v.bandLabel}

Open your report:
${v.reportUrl}`;
}
