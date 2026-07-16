export { escapeHtml } from '@/lib/html/escape';
// Shared HTML email shell for all transactional templates.
// Brand v1 palette: cream background, ink primary, gold accent.
// "The AI Banking Institute" — correct canonical name.

/**
 * Escape user-controlled strings before interpolating them into email HTML.
 * The shell helpers (heading/body/…) accept trusted markup by design, so
 * escaping is applied at the call site to each attacker-influenced value
 * (institution name, holder name, interest label) — not inside the helpers.
 */
export function emailShell({
  preheader,
  body,
}: {
  preheader: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>The AI Banking Institute</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F7F3EA;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#071A2F">
  <!-- Preheader (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F3EA">
    <tr>
      <td align="center" style="padding:32px 16px 48px">

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
          <!-- Wordmark header -->
          <tr>
            <td style="padding-bottom:24px">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9A7A2F">The AI Banking Institute</p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#ffffff;border:1px solid rgba(7,26,47,.10);border-radius:16px;padding:36px 40px">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center">
              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6">
                The AI Banking Institute &middot; <a href="https://aibankinginstitute.com" style="color:#9A7A2F;text-decoration:none">aibankinginstitute.com</a><br/>
                Questions? Reply to this email or write to <a href="mailto:hello@aibankinginstitute.com" style="color:#9A7A2F;text-decoration:none">hello@aibankinginstitute.com</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function kicker(text: string): string {
  return `<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9A7A2F">${text}</p>`;
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:26px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:#071A2F">${text}</h1>`;
}

export function body(text: string): string {
  return `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569">${text}</p>`;
}

export function divider(): string {
  return `<hr style="border:none;border-top:1px solid rgba(7,26,47,.10);margin:24px 0" />`;
}

export function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
    <tr>
      <td style="background:#C8A24A;border-radius:10px">
        <a href="${href}" style="display:inline-block;padding:13px 28px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#071A2F;text-decoration:none">${text}</a>
      </td>
    </tr>
  </table>`;
}

export function metaRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid rgba(7,26,47,.08);font-size:13px;color:#637083;width:120px;vertical-align:top">${label}</td>
    <td style="padding:8px 0 8px 16px;border-bottom:1px solid rgba(7,26,47,.08);font-size:13px;color:#071A2F;font-weight:600;vertical-align:top">${value}</td>
  </tr>`;
}

