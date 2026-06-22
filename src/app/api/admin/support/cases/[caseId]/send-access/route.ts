import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { sendAccessRescueForCase } from '@/lib/support/access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ caseId: string }> },
): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const { caseId } = await params;
  const { result } = await sendAccessRescueForCase({ caseId, actorEmail: session.user.email });
  return NextResponse.json({ ok: true, result });
}
