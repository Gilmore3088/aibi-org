import { createOrUpdateSupportCaseFromAlert } from '@/lib/support/cases';

interface OpsAlertInput {
  readonly title: string;
  readonly message: string;
  readonly severity?: 'info' | 'warning' | 'error';
  readonly context?: Record<string, unknown>;
}

export interface OpsAlertResult {
  readonly ok: boolean;
  readonly channel: 'webhook' | 'email' | 'console';
  readonly status?: number;
  readonly error?: string;
  readonly configured: {
    readonly webhook: boolean;
    readonly email: boolean;
    readonly resend: boolean;
    readonly skipResend: boolean;
  };
}

const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'hello@aibankinginstitute.com';
const DEFAULT_FROM_NAME = 'The AI Banking Institute';

function compactContext(context: Record<string, unknown> | undefined): string {
  if (!context) return '';
  try {
    return JSON.stringify(context, null, 2).slice(0, 4000);
  } catch {
    return '[unserializable context]';
  }
}

export async function notifyOpsAlert(input: OpsAlertInput): Promise<OpsAlertResult> {
  const severity = input.severity ?? 'error';
  if (process.env.NODE_ENV !== 'test') {
    void createOrUpdateSupportCaseFromAlert({
      title: input.title,
      message: input.message,
      severity,
      context: input.context,
    }).catch((err) => {
      console.warn('[ops-alert] support case creation skipped', err);
    });
  }

  const contextText = compactContext(input.context);
  const text = [
    `[${severity.toUpperCase()}] ${input.title}`,
    input.message,
    contextText ? `Context:\n${contextText}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL;
  const to = process.env.OPS_ALERT_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const skipResend = process.env.SKIP_RESEND === 'true';
  const configured = {
    webhook: !!webhookUrl,
    email: !!to,
    resend: !!apiKey,
    skipResend,
  };
  let lastError: string | undefined;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        return { ok: true, channel: 'webhook', status: response.status, configured };
      }
      lastError = `Webhook returned HTTP ${response.status}.`;
      console.error('[ops-alert] webhook failed', { status: response.status });
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error('[ops-alert] webhook exception', err);
    }
  }

  if (!to || !apiKey || skipResend) {
    const reason = !to
      ? 'No OPS_ALERT_EMAIL configured.'
      : !apiKey
        ? 'RESEND_API_KEY is missing.'
        : 'SKIP_RESEND is true.';
    lastError = lastError ? `${lastError} ${reason}` : reason;
    console.error('[ops-alert]', text);
    return { ok: false, channel: 'console', error: lastError, configured };
  }

  try {
    const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
    const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <${fromAddress}>`,
        to: [to],
        reply_to: DEFAULT_FROM,
        subject: `[AiBI ops] ${input.title}`,
        text,
        html: `<pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">${text
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')}</pre>`,
      }),
    });
    if (response.ok) {
      return { ok: true, channel: 'email', status: response.status, configured };
    }
    lastError = `Alert email returned HTTP ${response.status}.`;
    console.error('[ops-alert] email failed', { status: response.status });
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    console.error('[ops-alert] email exception', err);
  }

  return {
    ok: false,
    channel: 'email',
    error: lastError ?? 'Ops alert delivery failed.',
    configured,
  };
}
