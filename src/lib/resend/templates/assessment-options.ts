// Email 7: Assessment options (sent when a visitor signs up for "assessment" waitlist).
// The assessment is live — we don't make them wait; instead we give them both options.

import { emailShell, kicker, heading, body, ctaButton, divider } from './base';

export interface AssessmentOptionsVars {
  institution: string;
}

export function assessmentOptionsHtml(v: AssessmentOptionsVars): string {
  const bodyContent = `
    ${kicker('The assessment is ready')}
    ${heading('Two ways to measure your AI readiness.')}
    ${body(`You signed up for the AI readiness assessment — the good news is it's live now for ${v.institution}. Choose the version that fits your timeline:`)}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px">
      <tr>
        <td style="background:#F7F3EA;border:1px solid rgba(7,26,47,.10);border-radius:12px;padding:20px;vertical-align:top">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9A7A2F">Free</p>
          <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#071A2F">12-Question Readiness Check</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#475569">Quick baseline score across four dimensions. Results in under 5 minutes.</p>
          <a href="https://aibankinginstitute.com/assessment" style="display:inline-block;padding:10px 20px;background:#071A2F;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px">Take the free check →</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px">
      <tr>
        <td style="background:#F7F3EA;border:1px solid #C8A24A;border-radius:12px;padding:20px;vertical-align:top">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#9A7A2F">In-Depth — $99</p>
          <p style="margin:0 0 8px;font-size:17px;font-weight:700;color:#071A2F">48-Question Diagnostic</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#475569">All eight dimensions. Personalized action packet, 90-day roadmap, and reviewer packet for board presentations.</p>
          <a href="https://aibankinginstitute.com/assessment/in-depth" style="display:inline-block;padding:10px 20px;background:#C8A24A;color:#071A2F;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border-radius:8px">See the In-Depth →</a>
        </td>
      </tr>
    </table>

    ${divider()}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#637083">
      Questions? Reply to this email or write to
      <a href="mailto:hello@aibankinginstitute.com" style="color:#9A7A2F">hello@aibankinginstitute.com</a>.
    </p>
  `;

  return emailShell({
    preheader: 'The AI readiness assessment is ready — free 12-question check or full 48-question diagnostic',
    body: bodyContent,
  });
}

export function assessmentOptionsText(v: AssessmentOptionsVars): string {
  return `The AI readiness assessment is ready — ${v.institution}

Two ways to measure your AI readiness:

FREE — 12-Question Readiness Check
Quick baseline score across four dimensions. Results in under 5 minutes.
https://aibankinginstitute.com/assessment

IN-DEPTH — $99 — 48-Question Diagnostic
All eight dimensions. Personalized action packet, 90-day roadmap, and reviewer packet.
https://aibankinginstitute.com/assessment/in-depth

Questions? Reply to this email or write to hello@aibankinginstitute.com.

— The AI Banking Institute
aibankinginstitute.com`;
}
