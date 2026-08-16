// Authentication / device-confirmation transactional emails.

import {
  sendInline,
  type ResendResult,
} from '../_core';
import { supportShell, type SupportAccessRescuePayload } from './support';

export function sendAuthSignInLink(
  payload: SupportAccessRescuePayload,
): Promise<ResendResult> {
  return sendInline({
    to: payload.email,
    subject: 'Your AI Banking Institute sign-in link',
    html: supportShell(
      'Your sign-in link',
      `<p style="font-size:15px;line-height:1.55;color:#334155;margin:0 0 18px">
        Use this one-time link to sign in and continue. If you did not request it, you can ignore this email.
      </p>
      <p style="margin:0">
        <a href="${payload.accessUrl}" style="display:inline-block;padding:12px 18px;background:#071A2F;color:#fff;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px">Sign in</a>
      </p>`,
    ),
    text: `AI Banking Institute\n\nUse this one-time link to sign in and continue:\n${payload.accessUrl}\n\nIf you did not request it, you can ignore this email.`,
    tag: '[resend:auth-sign-in-link]',
  });
}

// ── Device confirmation (already inline HTML — unchanged) ───────────────────

export interface DeviceConfirmationPayload {
  readonly email: string;
  readonly confirmUrl: string;
  readonly expiresInMinutes: number;
  readonly ipApprox?: string | null;
  readonly userAgent?: string | null;
  readonly atDisplay: string;
}

export async function sendDeviceConfirmation(
  payload: DeviceConfirmationPayload,
): Promise<ResendResult> {
  const tag = '[resend:device-confirmation]';

  const safeAgent = (payload.userAgent ?? 'an unknown browser').slice(0, 200);
  const safeIp = payload.ipApprox ?? 'unknown';

  const html = `<!doctype html>
<html><body style="font-family:system-ui,-apple-system,sans-serif;color:#071A2F;background:#F7F3EA;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid rgba(7,26,47,.10);border-radius:16px;padding:32px">
    <p style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#9A7A2F;margin:0 0 8px">Confirm sign-in</p>
    <h1 style="font-size:24px;line-height:1.2;margin:0 0 16px;font-weight:700">Confirm your sign-in to The AI Banking Institute.</h1>
    <p style="font-size:15px;line-height:1.55;color:#475569;margin:0 0 20px">
      Someone just signed in to your account from a device or browser we haven&rsquo;t seen before. If this was you, confirm to finish signing in.
    </p>
    <p style="text-align:center;margin:24px 0">
      <a href="${payload.confirmUrl}" style="display:inline-block;padding:14px 28px;background:#C8A24A;color:#071A2F;font-weight:700;font-size:13px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border-radius:12px">Confirm sign-in</a>
    </p>
    <p style="font-size:13px;line-height:1.5;color:#64748B;margin:24px 0 0">
      Sign-in details:<br/>
      <strong>Time:</strong> ${payload.atDisplay}<br/>
      <strong>Browser:</strong> ${safeAgent}<br/>
      <strong>IP fingerprint:</strong> ${safeIp}
    </p>
    <p style="font-size:13px;line-height:1.5;color:#64748B;margin:16px 0 0">
      This link expires in ${payload.expiresInMinutes} minutes. If this wasn&rsquo;t you, ignore the email and consider resetting your password.
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#94A3B8;margin-top:16px">The AI Banking Institute &middot; aibankinginstitute.com</p>
</body></html>`;

  const text = `Confirm your sign-in to The AI Banking Institute.

Someone just signed in to your account from a device or browser we haven't seen before.

Confirm the sign-in:
${payload.confirmUrl}

Time: ${payload.atDisplay}
Browser: ${safeAgent}
IP fingerprint: ${safeIp}

This link expires in ${payload.expiresInMinutes} minutes. If this wasn't you, ignore this email and consider resetting your password.

— The AI Banking Institute`;

  return sendInline({
    to: payload.email,
    subject: 'Confirm your sign-in — The AI Banking Institute',
    html,
    text,
    tag,
  });
}
