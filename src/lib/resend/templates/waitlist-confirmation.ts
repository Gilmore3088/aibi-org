// Email 6: Waitlist confirmation.

import { emailShell, escapeHtml, kicker, heading, body, divider } from './base';

export interface WaitlistConfirmationVars {
  interestLabel: string;
  institution?: string;
}

export function waitlistConfirmationHtml(v: WaitlistConfirmationVars): string {
  const interestLabel = escapeHtml(v.interestLabel);
  const institution = escapeHtml(v.institution || 'your institution');
  const bodyContent = `
    ${kicker("You're on the list")}
    ${heading(`We've got you down for ${interestLabel}.`)}
    ${body(`We'll reach out to <strong>${institution}</strong> as soon as a spot opens up. No action needed on your end.`)}
    ${divider()}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#637083">
      While you wait, the free AI Readiness Assessment is available now — 12 questions, instant results, no payment required.
      <a href="https://aibankinginstitute.com/assessment" style="color:#9A7A2F;font-weight:600">Take the free assessment →</a>
    </p>
  `;

  return emailShell({
    preheader: `You're on the waitlist for ${interestLabel}`,
    body: bodyContent,
  });
}

export function waitlistConfirmationText(v: WaitlistConfirmationVars): string {
  const institution = v.institution || 'your institution';
  return `You're on the list — ${v.interestLabel}

We've got you down for ${v.interestLabel} at ${institution}. We'll reach out as soon as a spot opens up.

While you wait, the free AI Readiness Assessment is available now — 12 questions, instant results.
https://aibankinginstitute.com/assessment

— The AI Banking Institute
aibankinginstitute.com`;
}
