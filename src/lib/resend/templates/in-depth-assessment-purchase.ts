// Email 2.5: In-Depth Assessment purchase confirmation.

import { emailShell, kicker, heading, body, ctaButton, divider } from './base';

export interface InDepthAssessmentPurchaseVars {
  amountPaid: string;
  assessmentUrl: string;
}

export function inDepthAssessmentPurchaseHtml(v: InDepthAssessmentPurchaseVars): string {
  const bodyContent = `
    ${kicker('Purchase confirmed')}
    ${heading('Your In-Depth Assessment is unlocked.')}
    ${body('48 questions across all eight AI readiness dimensions. Your personalized diagnostic — scoring, dimension deep-dives, 90-day action register, and reviewer packet — is ready when you are.')}
    ${ctaButton('Begin the assessment →', v.assessmentUrl)}
    ${divider()}
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#637083">
      <strong style="color:#071A2F">What you get:</strong>
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#475569">
      <li>48 questions across all eight readiness dimensions</li>
      <li>Personalized Action Packet with peer-band comparison</li>
      <li>90-day action register keyed to your lowest-scoring areas</li>
      <li>Reviewer packet for board and executive presentations</li>
      <li>One free retake within 12 months</li>
    </ul>
    ${divider()}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#637083">
      Amount paid: <strong style="color:#071A2F">${v.amountPaid}</strong>. A Stripe receipt is on its way separately.
      Questions? Reply to this email or write to
      <a href="mailto:hello@aibankinginstitute.com" style="color:#9A7A2F">hello@aibankinginstitute.com</a>.
    </p>
  `;

  return emailShell({
    preheader: 'Your In-Depth AI Readiness Assessment is ready — 48 questions, personalized action plan',
    body: bodyContent,
  });
}

export function inDepthAssessmentPurchaseText(v: InDepthAssessmentPurchaseVars): string {
  return `Your In-Depth Assessment is unlocked.

48 questions across all eight AI readiness dimensions. Your personalized diagnostic is ready when you are.

Begin the assessment:
${v.assessmentUrl}

What you get:
- 48 questions across all eight readiness dimensions
- Personalized Action Packet with peer-band comparison
- 90-day action register keyed to your lowest-scoring areas
- Reviewer packet for board and executive presentations
- One free retake within 12 months

Amount paid: ${v.amountPaid}. A Stripe receipt is on its way separately.
Questions? Reply to this email or write to hello@aibankinginstitute.com.

— The AI Banking Institute
aibankinginstitute.com`;
}
