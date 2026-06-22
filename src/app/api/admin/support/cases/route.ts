import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { createSupportCase, listSupportCases } from '@/lib/support/cases';
import {
  isSupportCaseCategory,
  isSupportCasePriority,
  isValidSupportEmail,
  normalizeBuyerEmail,
  type SupportCaseCategory,
  type SupportCasePriority,
} from '@/lib/support/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const url = new URL(request.url);
  const cases = await listSupportCases({
    status: url.searchParams.get('status') ?? 'all',
    category: url.searchParams.get('category') ?? 'all',
    priority: url.searchParams.get('priority') ?? 'all',
    q: url.searchParams.get('q'),
    limit: 100,
  });
  return NextResponse.json({ ok: true, cases });
}

interface CreateCasePayload {
  readonly buyerEmail?: unknown;
  readonly subject?: unknown;
  readonly summary?: unknown;
  readonly category?: unknown;
  readonly priority?: unknown;
  readonly product?: unknown;
  readonly stripeSessionId?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  let body: CreateCasePayload;
  try {
    body = (await request.json()) as CreateCasePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.buyerEmail !== 'string' || !isValidSupportEmail(body.buyerEmail)) {
    return NextResponse.json({ ok: false, error: 'Valid buyerEmail is required.' }, { status: 400 });
  }
  if (typeof body.subject !== 'string' || body.subject.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'subject is required.' }, { status: 400 });
  }

  const category: SupportCaseCategory =
    typeof body.category === 'string' && isSupportCaseCategory(body.category)
      ? body.category
      : 'other';
  const priority: SupportCasePriority =
    typeof body.priority === 'string' && isSupportCasePriority(body.priority)
      ? body.priority
      : 'normal';

  const supportCase = await createSupportCase({
    buyerEmail: normalizeBuyerEmail(body.buyerEmail),
    subject: body.subject.trim(),
    summary: typeof body.summary === 'string' ? body.summary.trim() : '',
    category,
    priority,
    source: 'admin',
    product: typeof body.product === 'string' && body.product.trim() ? body.product.trim() : null,
    stripeSessionId:
      typeof body.stripeSessionId === 'string' && body.stripeSessionId.trim()
        ? body.stripeSessionId.trim()
        : null,
    actorType: 'admin',
    actorEmail: session.user.email,
  });

  return NextResponse.json({ ok: true, case: supportCase }, { status: 201 });
}
