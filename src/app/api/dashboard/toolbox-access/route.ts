import { NextResponse } from 'next/server';
import { getPaidToolboxAccess } from '@/lib/toolbox/access';

export async function GET(): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  return NextResponse.json({ entitled: Boolean(access) });
}
