// Resend transport core — the low-level send primitive and its config,
// extracted from the (large) index barrel so the per-email sender functions
// share one HTTP/config path. Best-effort, non-blocking, no-op when env vars
// are unset.

export const RESEND_API_URL = 'https://api.resend.com/emails';

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.aibankinginstitute.com').replace(/\/+$/, '');
}

export const DEFAULT_FROM = 'hello@aibankinginstitute.com';
export const DEFAULT_FROM_NAME = 'The AI Banking Institute';
export const REPLY_TO = 'hello@aibankinginstitute.com';

export type ResendResult =
  | { skipped: true; reason: string }
  | { ok: true; id: string }
  | { ok: false; error: string };

interface SendInlineInput {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
  readonly tag: string;
}

export async function sendInline(input: SendInlineInput): Promise<ResendResult> {
  if (process.env.SKIP_RESEND === 'true') {
    console.warn(`${input.tag} SKIPPED — SKIP_RESEND env flag set`);
    return { skipped: true, reason: 'SKIP_RESEND env flag' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`${input.tag} SKIPPED — RESEND_API_KEY not configured in this environment`);
    return { skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  console.log(`${input.tag} sending to=${input.to} subject="${input.subject}" key-prefix=${apiKey.slice(0, 8)}…`);

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [input.to],
        reply_to: REPLY_TO,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error = `Resend API ${response.status}: ${body.slice(0, 400)}`;
      console.error(`${input.tag} FAILED — ${error}`);
      return { ok: false, error };
    }

    const json = (await response.json().catch(() => ({}))) as { id?: string };
    console.log(`${input.tag} SENT — id=${json.id ?? 'unknown'}`);
    return { ok: true, id: json.id ?? 'unknown' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unexpected error';
    console.error(`${input.tag} EXCEPTION — ${error}`);
    return { ok: false, error };
  }
}

