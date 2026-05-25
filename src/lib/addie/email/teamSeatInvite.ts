// Resend transactional template for team-seat invites.
//
// Replaces the MailerLite stub in /api/addie/team/seats/[seatId]/resend.
// Auth Spec §7.2: signed-token link, 7-day expiry, single use.
//
// Renders HTML + plain-text (text fallback for mail clients that strip
// HTML or for accessibility). The template is plain HTML, no React-Email
// dependency — adds zero bundle weight and the output is fully inspectable.
//
// Honors SKIP_RESEND so preview/local never sends. Uses raw fetch to
// match the rest of the @/lib/resend module — no Resend SDK dep.

const RESEND_API_URL = 'https://api.resend.com/emails';

interface TeamSeatInviteParams {
  readonly to: string;
  readonly inviterName: string;
  readonly institutionName: string;
  readonly inviteUrl: string;          // signed-token URL, 7-day expiry
  readonly expiresAt: Date;
}

const FROM = process.env.RESEND_FROM ?? 'hello@aibankinginstitute.com';
const FROM_NAME = process.env.RESEND_FROM_NAME ?? 'The AI Banking Institute';

function renderHtml(p: TeamSeatInviteParams): string {
  const expires = p.expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  // Inline styles only — most email clients strip <style> blocks.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>You're invited to the AiBI Foundation Course</title>
  </head>
  <body style="margin:0;padding:0;background:#ECE9DF;font-family:Georgia,'Times New Roman',serif;color:#0E1B2D;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ECE9DF;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#F4F1E7;border:1px solid #D5D1C2;border-radius:4px;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;color:#7C5814;font-weight:600;">
                  Foundation Course · Seat invite
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 8px 32px;">
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0E1B2D;font-weight:500;">
                  ${escapeHtml(p.inviterName)} has added you to ${escapeHtml(p.institutionName)}'s team
                  at the AI Banking Institute.
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;font-size:16px;line-height:1.6;color:#1F2A3F;">
                <p style="margin:0 0 14px 0;">
                  You have a seat in the AiBI Foundation Course — six modules, twenty-four lessons,
                  every lesson under fifteen minutes, designed to do between meetings.
                </p>
                <p style="margin:0 0 14px 0;">
                  Accept the invite below to set up your account. Your progress, prompts,
                  and saved Toolbox items are private to you; your institution's admin sees
                  aggregate counts only.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 32px 8px 32px;">
                <a href="${escapeAttr(p.inviteUrl)}"
                   style="display:inline-block;padding:14px 28px;background:#0E1B2D;color:#F4F1E7;text-decoration:none;border-radius:2px;font-family:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;font-size:12px;text-transform:uppercase;letter-spacing:0.18em;font-weight:600;">
                  Accept your seat &nbsp;&rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 32px 24px 32px;">
                <p style="margin:0;font-family:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#4F5C6E;text-align:center;">
                  Link expires ${expires}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;border-top:1px solid #D5D1C2;">
                <p style="margin:16px 0 0 0;font-size:13px;line-height:1.55;color:#4F5C6E;">
                  Trouble with the button? Paste this link into your browser:<br>
                  <a href="${escapeAttr(p.inviteUrl)}" style="color:#1E3A5F;word-break:break-all;">${escapeHtml(p.inviteUrl)}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <p style="margin:0;font-size:12px;color:#4F5C6E;line-height:1.55;">
                  If you weren't expecting this invite, you can ignore the message — the
                  link expires automatically and grants nothing until accepted.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px auto 0 auto;max-width:560px;font-family:'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;color:#8C95A8;text-align:center;">
            The AI Banking Institute · aibankinginstitute.com
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText(p: TeamSeatInviteParams): string {
  const expires = p.expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `You're invited — AiBI Foundation Course

${p.inviterName} has added you to ${p.institutionName}'s team at the AI
Banking Institute. You have a seat in the AiBI Foundation Course — six
modules, twenty-four lessons, every lesson under fifteen minutes.

Accept your seat: ${p.inviteUrl}
Link expires ${expires}.

Your progress and Toolbox items are private to you; your institution's
admin sees aggregate counts only.

If you weren't expecting this invite, ignore the message — the link
expires and grants nothing until accepted.

The AI Banking Institute · aibankinginstitute.com`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

export type TeamSeatInviteResult =
  | { skipped: true; reason: string }
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function sendTeamSeatInvite(
  params: TeamSeatInviteParams,
): Promise<TeamSeatInviteResult> {
  const tag = '[resend:team-seat-invite]';
  if (process.env.SKIP_RESEND === 'true') {
    console.warn(`${tag} SKIPPED — SKIP_RESEND env flag set`);
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`${tag} SKIPPED — RESEND_API_KEY not configured`);
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }
  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM}>`,
        to: [params.to],
        subject: `You're invited to ${params.institutionName}'s AiBI Foundation team`,
        html: renderHtml(params),
        text: renderText(params),
      }),
    });
    if (!res.ok) {
      const error = await res.text();
      console.error(`${tag} send failed status=${res.status} body=${error}`);
      return { ok: false, error: `Resend HTTP ${res.status}: ${error}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id ?? '' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    console.error(`${tag} send threw: ${msg}`);
    return { ok: false, error: msg };
  }
}
