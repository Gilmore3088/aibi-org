// POST /api/webhooks/mailerlite
//
// Closes the deliverability loop for the nurture funnel: MailerLite outcomes
// (bounce / unsubscribe / spam complaint) land on the canonical Supabase
// `leads` row, mirroring what /api/webhooks/resend does for transactional
// email. Without this, a nurture address could bounce or complain and the
// funnel dashboard would keep counting it as a healthy lead.
//
// MailerLite signs webhook requests with the per-webhook secret in a
// `Signature` header: HMAC-SHA256 of the raw body. Encodings vary across
// their webhook versions, so both hex and base64 digests are accepted.
//
// Setup (operator): the webhook is registered in MailerLite (disabled until
// this route is deployed) for subscriber.unsubscribed / subscriber.bounced /
// subscriber.spam_reported. Set MAILERLITE_WEBHOOK_SECRET in Vercel to the
// webhook's secret, deploy, then enable the webhook.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface EventEffect {
  readonly deliveryStatus?: 'bounced' | 'complained';
  /** Consent events also flip marketing_opt_in off. */
  readonly revokeOptIn?: boolean;
}

const EFFECT_BY_EVENT: Readonly<Record<string, EventEffect>> = {
  'subscriber.bounced': { deliveryStatus: 'bounced' },
  'subscriber.spam_reported': { deliveryStatus: 'complained', revokeOptIn: true },
  'subscriber.unsubscribed': { revokeOptIn: true },
};

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  return aBuf.length === bBuf.length && timingSafeEqual(aBuf, bBuf);
}

function verifySignature(secret: string, signature: string | null, rawBody: string): boolean {
  if (!signature) return false;
  const mac = createHmac('sha256', secret).update(rawBody);
  const macCopy = createHmac('sha256', secret).update(rawBody);
  return safeEqual(signature, mac.digest('hex')) || safeEqual(signature, macCopy.digest('base64'));
}

/** Defensive extraction — MailerLite payload shapes differ across versions. */
function extractEmail(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  const candidates: unknown[] = [
    (p.data as Record<string, unknown> | undefined)?.subscriber,
    p.subscriber,
    p.data,
    p,
  ];
  for (const c of candidates) {
    if (typeof c === 'object' && c !== null) {
      const email = (c as Record<string, unknown>).email;
      if (typeof email === 'string' && email.includes('@')) return email.trim().toLowerCase();
    }
  }
  return null;
}

function extractType(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  const t = p.type ?? p.event;
  return typeof t === 'string' ? t : null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await request.text();
  const secret = process.env.MAILERLITE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[mailerlite-webhook] MAILERLITE_WEBHOOK_SECRET not set — ignoring event');
    return NextResponse.json({ ok: false, reason: 'unconfigured' }, { status: 503 });
  }
  const signature = request.headers.get('signature') ?? request.headers.get('x-mailerlite-signature');
  if (!verifySignature(secret, signature, raw)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const type = extractType(payload);
  const effect = type ? EFFECT_BY_EVENT[type] : undefined;
  const email = extractEmail(payload);

  if (effect && email && isSupabaseConfigured()) {
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (effect.deliveryStatus) update.delivery_status = effect.deliveryStatus;
    if (effect.revokeOptIn) update.marketing_opt_in = false;
    const client = createServiceRoleClient();
    const { error } = await client.from('leads').update(update).eq('email', email);
    if (error) {
      console.warn(`[mailerlite-webhook] leads update failed for ${type}:`, error.message);
    }
  } else if (type && !effect) {
    console.warn(`[mailerlite-webhook] ignoring unhandled event type: ${type}`);
  }

  // Always 200 on verified payloads so MailerLite doesn't retry or disable
  // the webhook over rows we don't track.
  return NextResponse.json({ ok: true });
}
