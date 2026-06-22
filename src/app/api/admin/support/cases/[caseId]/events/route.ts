import { NextResponse } from 'next/server';
import { appendSupportCaseEvent } from '@/lib/support/cases';
import { getSupportAdminSession } from '@/lib/support/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

interface EventPayload {
  readonly eventType?: unknown;
  readonly message?: unknown;
  readonly metadata?: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> },
): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  let body: EventPayload;
  try {
    body = (await request.json()) as EventPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.eventType !== 'string' || body.eventType.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'eventType is required.' }, { status: 400 });
  }
  if (typeof body.message !== 'string' || body.message.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'message is required.' }, { status: 400 });
  }

  const { caseId } = await params;
  const event = await appendSupportCaseEvent({
    caseId,
    eventType: body.eventType.trim().slice(0, 80),
    actorType: 'admin',
    actorEmail: session.user.email,
    message: body.message.trim().slice(0, 4000),
    metadata:
      typeof body.metadata === 'object' && body.metadata !== null && !Array.isArray(body.metadata)
        ? (body.metadata as Record<string, unknown>)
        : {},
  });

  return NextResponse.json({ ok: true, event }, { status: 201 });
}
