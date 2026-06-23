import { NextResponse } from 'next/server';
import { dashboardSessionErrorResponse, getDashboardSession } from '@/lib/dashboard/session';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';

export async function GET(): Promise<NextResponse> {
  const session = await getDashboardSession();
  if (!session.ok) {
    return dashboardSessionErrorResponse(session);
  }

  const access = await getPaidToolboxAccess();
  return NextResponse.json({
    entitled: Boolean(access),
    tier: access?.tier ?? null,
  });
}
