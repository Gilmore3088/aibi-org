import { NextResponse } from 'next/server';
import { getCanonicalSiteUrl } from '@/lib/supabase/auth-admin';
import { createSupportCase } from '@/lib/support/cases';
import { checkSupportIntakeLimit, hashIp, logSupportIntake } from '@/lib/support/rate-limit';
import { getSupportInboxEmail } from '@/lib/support/admin';
import {
  isSupportCaseCategory,
  isValidSupportEmail,
  normalizeBuyerEmail,
  type SupportCaseCategory,
} from '@/lib/support/types';
import {
  sendSupportCaseAcknowledgement,
  sendSupportCaseNotification,
} from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_PER_IP_PER_HOUR = 8;
const MESSAGE_MAX = 3000;
const SUBJECT_MAX = 180;

interface PurchaseHelpPayload {
  readonly email?: unknown;
  readonly category?: unknown;
  readonly subject?: unknown;
  readonly message?: unknown;
  readonly stripeSessionId?: unknown;
  readonly product?: unknown;
}

function getRequestIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

function parsePayload(body: PurchaseHelpPayload):
  | {
      email: string;
      category: SupportCaseCategory;
      subject: string;
      message: string;
      stripeSessionId: string | null;
      product: string | null;
    }
  | null {
  if (typeof body.email !== 'string' || !isValidSupportEmail(body.email)) return null;
  if (typeof body.message !== 'string' || body.message.trim().length < 8) return null;
  if (body.message.length > MESSAGE_MAX) return null;

  const category =
    typeof body.category === 'string' && isSupportCaseCategory(body.category)
      ? body.category
      : 'other';
  const subject =
    typeof body.subject === 'string' && body.subject.trim()
      ? body.subject.trim().slice(0, SUBJECT_MAX)
      : `Purchase support: ${category.replaceAll('_', ' ')}`;
  const stripeSessionId =
    typeof body.stripeSessionId === 'string' && body.stripeSessionId.trim()
      ? body.stripeSessionId.trim().slice(0, 120)
      : null;
  const product =
    typeof body.product === 'string' && body.product.trim()
      ? body.product.trim().slice(0, 80)
      : null;

  return {
    email: normalizeBuyerEmail(body.email),
    category,
    subject,
    message: body.message.trim(),
    stripeSessionId,
    product,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: PurchaseHelpPayload;
  try {
    body = (await request.json()) as PurchaseHelpPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = parsePayload(body);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: 'Invalid support request.' }, { status: 400 });
  }

  const ipHash = hashIp(getRequestIp(request));
  const decision = await checkSupportIntakeLimit(ipHash, RATE_LIMIT_PER_IP_PER_HOUR);
  if (!decision.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: decision.retryAfterSeconds
          ? { 'Retry-After': String(decision.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  try {
    const supportCase = await createSupportCase({
      buyerEmail: parsed.email,
      subject: parsed.subject,
      summary: parsed.message,
      category: parsed.category,
      priority: parsed.category === 'refund_request' ? 'high' : 'normal',
      source: 'buyer_form',
      product: parsed.product,
      stripeSessionId: parsed.stripeSessionId,
      actorType: 'customer',
      actorEmail: parsed.email,
      metadata: {
        userAgent: request.headers.get('user-agent')?.slice(0, 240) ?? null,
      },
    });
    await logSupportIntake(ipHash);

    const adminUrl = `${getCanonicalSiteUrl()}/admin/support/cases/${supportCase.id}`;
    void sendSupportCaseNotification({
      to: getSupportInboxEmail(),
      caseId: supportCase.id,
      buyerEmail: parsed.email,
      category: parsed.category,
      subject: parsed.subject,
      summary: parsed.message,
      adminUrl,
    });
    void sendSupportCaseAcknowledgement({ email: parsed.email });
  } catch (err) {
    console.error('[support/purchase-help] failed to create case:', err);
    return NextResponse.json(
      { ok: false, error: 'Support intake is temporarily unavailable.' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    message:
      'We received your request. A human will review it from hello@aibankinginstitute.com.',
  });
}
