import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { getBuyerSnapshot } from '@/lib/support/buyer';
import { getSupportCaseWithEvents, updateSupportCase } from '@/lib/support/cases';
import {
  isSupportCaseCategory,
  isSupportCasePriority,
  isSupportCaseStatus,
  type SupportCaseCategory,
  type SupportCasePriority,
  type SupportCaseStatus,
} from '@/lib/support/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const { caseId } = await params;
  const supportCase = await getSupportCaseWithEvents(caseId);
  if (!supportCase) return NextResponse.json({ ok: false, error: 'Case not found.' }, { status: 404 });

  const buyer = await getBuyerSnapshot(
    supportCase.case.buyerEmail,
    supportCase.case.stripeSessionId,
  ).catch((err) => ({
    email: supportCase.case.buyerEmail,
    errors: [err instanceof Error ? err.message : String(err)],
  }));

  return NextResponse.json({ ok: true, ...supportCase, buyer });
}

interface PatchCasePayload {
  readonly status?: unknown;
  readonly priority?: unknown;
  readonly category?: unknown;
  readonly assignedToEmail?: unknown;
  readonly subject?: unknown;
  readonly summary?: unknown;
  readonly product?: unknown;
  readonly stripeSessionId?: unknown;
  readonly message?: unknown;
  readonly metadata?: unknown;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  let body: PatchCasePayload;
  try {
    body = (await request.json()) as PatchCasePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const status: SupportCaseStatus | undefined =
    typeof body.status === 'string' && isSupportCaseStatus(body.status) ? body.status : undefined;
  const priority: SupportCasePriority | undefined =
    typeof body.priority === 'string' && isSupportCasePriority(body.priority)
      ? body.priority
      : undefined;
  const category: SupportCaseCategory | undefined =
    typeof body.category === 'string' && isSupportCaseCategory(body.category)
      ? body.category
      : undefined;

  const { caseId } = await params;
  const updated = await updateSupportCase(caseId, {
    status,
    priority,
    category,
    assignedToEmail: typeof body.assignedToEmail === 'string' ? body.assignedToEmail : undefined,
    subject: typeof body.subject === 'string' ? body.subject : undefined,
    summary: typeof body.summary === 'string' ? body.summary : undefined,
    product: typeof body.product === 'string' ? body.product : undefined,
    stripeSessionId: typeof body.stripeSessionId === 'string' ? body.stripeSessionId : undefined,
    metadata:
      typeof body.metadata === 'object' && body.metadata !== null && !Array.isArray(body.metadata)
        ? (body.metadata as Record<string, unknown>)
        : undefined,
    actorEmail: session.user.email,
    message: typeof body.message === 'string' ? body.message : undefined,
  });

  return NextResponse.json({ ok: true, case: updated });
}
