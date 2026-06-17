// Email 5: Inquiry acknowledgement.
// Sent after a contact/inquiry form submission.

import { emailShell, kicker, heading, body, divider } from './base';

export interface InquiryAckVars {
  name: string;
  institution: string;
  track: string;
}

export function inquiryAckHtml(v: InquiryAckVars): string {
  const bodyContent = `
    ${kicker('Inquiry received')}
    ${heading(`Thanks, ${v.name}.`)}
    ${body(`We received your inquiry about <strong>${v.track}</strong> from ${v.institution}. We'll follow up within one business day.`)}
    ${divider()}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#637083">
      While you wait, the free AI Readiness Assessment gives you an instant baseline across four dimensions — no payment required.
      <a href="https://aibankinginstitute.com/assessment" style="color:#9A7A2F;font-weight:600">Take the free assessment →</a>
    </p>
  `;

  return emailShell({
    preheader: `We received your ${v.track} inquiry — we'll follow up within one business day`,
    body: bodyContent,
  });
}

export function inquiryAckText(v: InquiryAckVars): string {
  return `Thanks, ${v.name}.

We received your inquiry about ${v.track} from ${v.institution}. We'll follow up within one business day.

While you wait, the free AI Readiness Assessment gives you an instant baseline across four dimensions.
https://aibankinginstitute.com/assessment

— The AI Banking Institute
aibankinginstitute.com`;
}
