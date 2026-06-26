// POST /api/webhooks/resend
//
// Records email delivery outcomes from Resend onto the lead so a bounce is
// never silent again (the wkeels@safefed.org resource email bounced and we
// only learned by reading Resend logs by hand). Resend signs webhooks with
// Svix; we verify the signature manually (no extra dependency) before trusting
// the payload, then update leads.delivery_status by recipient email.
//
// Setup (operator): add a webhook in the Resend dashboard pointing at
// https://www.aibankinginstitute.com/api/webhooks/resend for the
// email.sent / email.delivered / email.bounced / email.complained events, and
// set RESEND_WEBHOOK_SECRET (whsec_...) in Vercel.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const STATUS_BY_EVENT: Readonly<Record<string, string>> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
};

// Svix signature scheme: base64( HMAC-SHA256( secretBytes, `${id}.${ts}.${body}` ) ).
// The secret is `whsec_<base64>`; the svix-signature header is a space-separated
// list of `v1,<sig>` entries (supports key rotation).
function verifySvixSignature(
  secret: string,
  svixId: string | null,
  svixTs: string | null,
  svixSignature: string | null,
  rawBody: string,
): boolean {
  if (!svixId || !svixTs || !svixSignature) return false;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const signedContent = `${svixId}.${svixTs}.${rawBody}`;
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
  const expectedBuf = Buffer.from(expected);
  return svixSignature.split(' ').some((part) => {
    const provided = part.split(',')[1] ?? part;
    const providedBuf = Buffer.from(provided);
    return providedBuf.length === expectedBuf.length && timingSafeEqual(providedBuf, expectedBuf);
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await request.text();
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET not set — ignoring event');
    return NextResponse.json({ ok: false, reason: 'unconfigured' }, { status: 503 });
  }
  const verified = verifySvixSignature(
    secret,
    request.headers.get('svix-id'),
    request.headers.get('svix-timestamp'),
    request.headers.get('svix-signature'),
    raw,
  );
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: { type?: string; data?: { to?: unknown } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const status = event.type ? STATUS_BY_EVENT[event.type] : undefined;
  const to = Array.isArray(event.data?.to) ? event.data?.to[0] : event.data?.to;
  if (status && typeof to === 'string' && isSupabaseConfigured()) {
    const email = to.trim().toLowerCase();
    const client = createServiceRoleClient();
    const { error } = await client
      .from('leads')
      .update({ delivery_status: status, updated_at: new Date().toISOString() })
      .eq('email', email);
    if (error) {
      console.error('[resend-webhook] leads delivery_status update failed:', error.message);
    }
  }

  return NextResponse.json({ ok: true });
}
