import { NextResponse } from 'next/server';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';
import {
  DAILY_CAP_CENTS,
  MONTHLY_CAP_CENTS,
  getUsageForUser,
} from '@/lib/toolbox/playground-budget';

export async function GET(_request: Request): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (!access) {
    return NextResponse.json({ error: 'Paid access required.' }, { status: 403 });
  }

  const { todayCents, monthCents } = await getUsageForUser(access.userId);
  return NextResponse.json({
    todayCents,
    dailyCapCents: DAILY_CAP_CENTS,
    monthCents,
    monthlyCapCents: MONTHLY_CAP_CENTS,
  });
}
