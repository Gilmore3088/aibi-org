// GET /api/addie/toolbox/state — returns the learner's Toolbox quota state.
// Used by ToolboxDrawer to render the empty / approaching-cap / cap-reached
// / paid-unlimited variants without round-tripping items just to count them.

import { NextResponse, type NextRequest } from 'next/server';
import { resolveAddieIdentity } from '@/lib/addie/auth/resolveIdentity';
import { isOverFreeCap, FREE_TIER_ARTIFACT_CAP } from '@/lib/addie/toolbox/items';

export const runtime = 'nodejs';

export interface ToolboxState {
  readonly count: number;
  readonly cap: number;
  readonly isPaid: boolean;
  readonly hasIdentity: boolean;
}

export async function GET(req: NextRequest): Promise<NextResponse<ToolboxState>> {
  const identity = await resolveAddieIdentity(req);
  const hasIdentity = Boolean(identity.user_id || identity.lead_id);
  if (!hasIdentity) {
    return NextResponse.json({
      count: 0,
      cap: FREE_TIER_ARTIFACT_CAP,
      isPaid: false,
      hasIdentity: false,
    });
  }
  try {
    const cap = await isOverFreeCap({
      user_id: identity.user_id,
      lead_id: identity.lead_id,
    });
    if (cap.unlimited) {
      // count is -1 when unlimited (see isOverFreeCap); resolve a real
      // count for display by treating it as 0 — the unlimited branch
      // doesn't bother counting and the drawer doesn't need the number.
      return NextResponse.json({
        count: 0,
        cap: FREE_TIER_ARTIFACT_CAP,
        isPaid: true,
        hasIdentity: true,
      });
    }
    return NextResponse.json({
      count: cap.count,
      cap: FREE_TIER_ARTIFACT_CAP,
      isPaid: false,
      hasIdentity: true,
    });
  } catch (err) {
    console.error('[api/addie/toolbox/state GET] failed:', err);
    return NextResponse.json(
      { count: 0, cap: FREE_TIER_ARTIFACT_CAP, isPaid: false, hasIdentity: true },
      { status: 500 },
    );
  }
}
