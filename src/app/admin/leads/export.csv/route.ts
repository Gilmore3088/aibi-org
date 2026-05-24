// CSV export for the current leads page. Operator-gated.
// Returns 404 for non-operators (same posture as the admin layout).

import { getOperatorContext } from '@/lib/addie/auth/isOperator';
import { leadsToCSV, loadLeadsPage } from '@/lib/addie/analytics/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const ctx = await getOperatorContext();
  if (!ctx.isOperator) {
    return new Response('Not found', { status: 404 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const data = await loadLeadsPage(page, 25);
  if (data.error) {
    return new Response(`Error: ${data.error}`, { status: 500 });
  }

  const csv = leadsToCSV(data.rows);
  const filename = `addie-leads-page-${page}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
