// Resource delivery email.
// Sent when a visitor requests a free resource (Safe AI Use Guide, a role
// playbook, a desk card, etc.) via an email-capture form. Carries the actual
// download link so the file lands in the inbox — not only as a browser
// download that is easy to lose.

import { emailShell, kicker, heading, body, ctaButton, divider } from './base';

export interface ResourceDeliveryVars {
  /** Human title of the resource, e.g. "IT / InfoSec Playbook". */
  title: string;
  /** Absolute https download URL. */
  downloadUrl: string;
  /** Optional first name for a personalized greeting. */
  firstName?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function resourceDeliveryHtml(v: ResourceDeliveryVars): string {
  const safeTitle = escapeHtml(v.title);
  const safeUrl = escapeHtml(v.downloadUrl);
  const greeting = v.firstName
    ? `Here's your copy, ${escapeHtml(v.firstName)}.`
    : "Here's your copy.";

  const bodyContent = `
    ${kicker('Your download is ready')}
    ${heading(greeting)}
    ${body(`You requested the <strong>${safeTitle}</strong>. Download the full PDF below — it's yours to keep, print, and share with your team.`)}
    ${ctaButton('Download the PDF', v.downloadUrl)}
    ${body(`If the button doesn't work, paste this link into your browser:<br/><a href="${v.downloadUrl}" style="color:#9A7A2F;font-weight:600;word-break:break-all">${safeUrl}</a>`)}
    ${divider()}
    <p style="margin:0;font-size:14px;line-height:1.6;color:#637083">
      Want a tailored baseline first? The free AI Readiness Assessment scores your institution across four dimensions in minutes.
      <a href="https://aibankinginstitute.com/assessment" style="color:#9A7A2F;font-weight:600">Take the free assessment &rarr;</a>
    </p>
  `;

  return emailShell({
    preheader: `Your ${safeTitle} download is ready`,
    body: bodyContent,
  });
}

export function resourceDeliveryText(v: ResourceDeliveryVars): string {
  const greeting = v.firstName ? `Here's your copy, ${v.firstName}.` : "Here's your copy.";
  return `${greeting}

You requested the ${v.title}. Download the full PDF here:
${v.downloadUrl}

It's yours to keep, print, and share with your team.

Want a tailored baseline first? The free AI Readiness Assessment scores your
institution across four dimensions in minutes.
https://aibankinginstitute.com/assessment

— The AI Banking Institute
aibankinginstitute.com`;
}
