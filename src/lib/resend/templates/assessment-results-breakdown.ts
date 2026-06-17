// Email 1: Free assessment results breakdown.
// Sent after a v2/v3 free assessment capture.

import { emailShell, kicker, heading, body, ctaButton, divider } from './base';

export interface AssessmentBreakdownVars {
  tierLabel: string;
  tierHeadline: string;
  tierSummary: string;
  score: number;
  maxScore: number;
  resultsUrl: string;
  dashboardUrl: string;
}

export function assessmentResultsBreakdownHtml(v: AssessmentBreakdownVars): string {
  const bodyContent = `
    ${kicker('Your AI Readiness Score')}
    ${heading(`${v.tierLabel} — ${v.score}/${v.maxScore}`)}
    ${body(`<strong>${v.tierHeadline}</strong><br/><br/>${v.tierSummary}`)}
    ${ctaButton('View your full results →', v.resultsUrl)}
    ${divider()}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#637083">
      Ready to go deeper? The In-Depth diagnostic covers all eight dimensions with a 90-day action plan and reviewer packet built around your score.
      <a href="https://aibankinginstitute.com/assessment/in-depth" style="color:#9A7A2F;font-weight:600">Learn about In-Depth →</a>
    </p>
  `;

  return emailShell({
    preheader: `Your AI readiness score — ${v.tierLabel} (${v.score}/${v.maxScore})`,
    body: bodyContent,
  });
}

export function assessmentResultsBreakdownText(v: AssessmentBreakdownVars): string {
  return `Your AI Readiness Score — ${v.tierLabel}

Score: ${v.score}/${v.maxScore}

${v.tierHeadline}

${v.tierSummary}

View your full results:
${v.resultsUrl}

Ready to go deeper? The In-Depth diagnostic covers all eight dimensions with a 90-day action plan.
https://aibankinginstitute.com/assessment/in-depth

— The AI Banking Institute
aibankinginstitute.com`;
}
