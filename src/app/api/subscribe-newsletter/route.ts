// POST /api/subscribe-newsletter
//
// Subscribes a visitor to The AI Banking Brief. Three-step write:
//   1. Supabase `newsletter_subscribers` (owned-data backup — survives a
//      vendor swap, an outage, or a billing dispute)
//   2. Supabase Auth account provision (so the subscriber has an identity
//      if they later take the assessment or buy a course)
//   3. MailerLite (the marketing-email provider; primary list)
//
// Honeypot: if `company_url` is non-empty, return ok silently — bots fill
// every field, humans don't see hidden inputs. No subscriber written.
//
// Rate-limited: 10 submissions per IP per hour.
//
// See #190 + supabase/migrations/00034_newsletter_subscribers.sql.

import { NextResponse } from 'next/server';
import { subscribeToNewsletterForm } from '@/lib/mailerlite';
import { ensureAuthUser } from '@/lib/supabase/auth-admin';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribePayload {
  email?: unknown;
  source?: unknown;
  institutionName?: unknown;
  /** Honeypot — bots fill every field, humans don't see it. */
  companyUrl?: unknown;
}

export async function POST(request: Request) {
  const limited = await rateLimitOrFail({
    key: 'subscribe-newsletter',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 10,
    windowSeconds: 3600,
  });
  if (limited) return limited;

  let body: SubscribePayload;
  try {
    body = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json(
      { error: 'Could not read your submission. Please try again.' },
      { status: 400 },
    );
  }

  // Honeypot — silently accept bot submissions without writing anything.
  // Bots fill every visible field; this hidden field never gets a value
  // from a real user (it's aria-hidden + visually offscreen on the form).
  if (typeof body.companyUrl === 'string' && body.companyUrl.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const email = body.email.toLowerCase().trim();
  const source = typeof body.source === 'string' ? body.source : 'unknown';
  const institutionName =
    typeof body.institutionName === 'string' && body.institutionName.length > 0
      ? body.institutionName
      : null;

  console.info('[subscribe-newsletter]', {
    email,
    source,
    at: new Date().toISOString(),
  });

  // 1. Supabase — owned-data backup. Idempotent via unique index on email.
  //    A duplicate subscribe is not an error: refresh `subscribed_at` and
  //    clear any prior `unsubscribed_at` so the subscriber re-activates.
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServiceRoleClient();
      await supabase
        .from('newsletter_subscribers')
        .upsert(
          {
            email,
            source,
            institution_name: institutionName,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          },
          { onConflict: 'email' },
        );
    } catch (err) {
      // Non-fatal — fall through to MailerLite. The marketing list is the
      // user-visible promise; the Supabase row is internal redundancy.
      console.warn('[subscribe-newsletter] supabase upsert skip', err);
    }
  }

  // 2. Supabase Auth — provision an identity for future assessment / course
  //    purchases. Non-blocking and idempotent.
  ensureAuthUser(email).catch((err) =>
    console.warn('[subscribe-newsletter] auth-admin skip', err),
  );

  // 3. MailerLite — primary marketing list. Non-fatal if it fails; the
  //    Supabase row above lets us reconcile later.
  await subscribeToNewsletterForm({ email, fields: { source } }).catch(
    (err) => console.warn('[subscribe-newsletter] mailerlite skip', err),
  );

  return NextResponse.json({ ok: true });
}
