import { NextResponse } from 'next/server';
import {
  getPaidToolboxAccess,
  hasFullToolboxAccess,
  hasStarterToolkitAccess,
} from '@/lib/toolbox/access';

export async function GET(): Promise<NextResponse> {
  const access = await getPaidToolboxAccess();
  if (hasFullToolboxAccess(access)) {
    return NextResponse.json({ entitled: true, tier: 'full' });
  }
  if (hasStarterToolkitAccess(access)) {
    return NextResponse.json({ entitled: true, tier: 'starter' });
  }
  return NextResponse.json({ entitled: false, tier: null });
}
