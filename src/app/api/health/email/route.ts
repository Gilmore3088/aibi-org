// GET /api/health/email
//
// One-click config check for the assessment breakdown email (Resend). Reports
// whether the send path is wired in THIS environment — without ever exposing
// the API key. `willSend` is the at-a-glance answer; the rest explains why.
//
// Mirrors the gating in src/lib/resend/index.ts so it reflects exactly what
// the real send sees.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_FROM = 'hello@aibankinginstitute.com';
const DEFAULT_FROM_NAME = 'The AI Banking Institute';

export async function GET(): Promise<Response> {
  const resendKeyPresent = Boolean(process.env.RESEND_API_KEY);
  const skipResend = process.env.SKIP_RESEND === 'true';
  const fromAddress = process.env.RESEND_FROM ?? DEFAULT_FROM;
  const fromName = process.env.RESEND_FROM_NAME ?? DEFAULT_FROM_NAME;

  // The real send fires only when a key is present and SKIP_RESEND is off.
  const willSend = resendKeyPresent && !skipResend;

  const note = !resendKeyPresent
    ? 'RESEND_API_KEY is not set in this environment — no breakdown emails will send. Set it in the Vercel env.'
    : skipResend
      ? 'SKIP_RESEND=true — breakdown emails are intentionally disabled here. Unset it to enable.'
      : 'Resend is configured. If emails still do not arrive: verify the sending domain in Resend, check SPF/DKIM/DMARC DNS, and look in spam.';

  return NextResponse.json({
    service: 'assessment breakdown email (Resend)',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
    willSend,
    resendKeyPresent,
    skipResend,
    from: `${fromName} <${fromAddress}>`,
    fromOverride: Boolean(process.env.RESEND_FROM),
    note,
  });
}
