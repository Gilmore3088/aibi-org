import { NextResponse } from 'next/server';
import { getSupportAdminSession } from '@/lib/support/auth';
import { listSupportCases } from '@/lib/support/cases';
import { parseSupportMetricsRange } from '@/lib/support/metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authError(status: number, reason: string): NextResponse {
  return NextResponse.json({ ok: false, error: reason }, { status });
}

function rangeStartIso(range: '7d' | '30d' | '90d'): string {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getSupportAdminSession();
  if (!session.ok) return authError(session.status, session.reason);

  const url = new URL(request.url);
  const range = parseSupportMetricsRange(url.searchParams.get('range'));
  const startIso = rangeStartIso(range);
  const cases = (await listSupportCases({ limit: 500 })).filter(
    (supportCase) => supportCase.createdAt >= startIso,
  );
  const rows = [
    [
      'id',
      'created_at',
      'updated_at',
      'status',
      'priority',
      'category',
      'source',
      'buyer_email',
      'product',
      'stripe_session_id',
      'subject',
      'first_response_at',
      'resolved_at',
    ],
    ...cases.map((supportCase) => [
      supportCase.id,
      supportCase.createdAt,
      supportCase.updatedAt,
      supportCase.status,
      supportCase.priority,
      supportCase.category,
      supportCase.source,
      supportCase.buyerEmail,
      supportCase.product ?? '',
      supportCase.stripeSessionId ?? '',
      supportCase.subject,
      supportCase.firstResponseAt ?? '',
      supportCase.resolvedAt ?? '',
    ]),
  ];

  return new NextResponse(rows.map((row) => row.map(csvCell).join(',')).join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="aibi-support-${range}.csv"`,
    },
  });
}
