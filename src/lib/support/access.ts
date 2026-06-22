import { sendSupportAccessRescue, type ResendResult } from '@/lib/resend';
import { ensureAuthUser, generateMagicLink, getCanonicalSiteUrl } from '@/lib/supabase/auth-admin';
import { appendSupportCaseEvent, getSupportCaseWithEvents } from './cases';

function nextPathForSupportAccess(product: string | null, teamCohortId: string | null): string {
  if (product === 'team-assessment') {
    return teamCohortId ? `/assessment/team/admin/${teamCohortId}` : '/assessment/team';
  }
  if (product === 'in-depth-assessment') return '/assessment/in-depth/take';
  return '/courses/foundation/program';
}

export async function sendAccessRescueForCase(args: {
  readonly caseId: string;
  readonly actorEmail: string;
}): Promise<{ result: ResendResult; accessUrl: string }> {
  const supportCase = await getSupportCaseWithEvents(args.caseId);
  if (!supportCase) throw new Error('Case not found.');

  const nextPath = nextPathForSupportAccess(
    supportCase.case.product,
    supportCase.case.teamCohortId,
  );
  await ensureAuthUser(supportCase.case.buyerEmail);
  let accessUrl = await generateMagicLink(supportCase.case.buyerEmail, nextPath);
  if (!accessUrl) {
    accessUrl = `${getCanonicalSiteUrl()}/auth/signup?next=${encodeURIComponent(
      nextPath,
    )}&email=${encodeURIComponent(supportCase.case.buyerEmail)}`;
  }

  const result = await sendSupportAccessRescue({
    email: supportCase.case.buyerEmail,
    accessUrl,
  });

  await appendSupportCaseEvent({
    caseId: args.caseId,
    eventType: 'access_rescue_sent',
    actorType: 'admin',
    actorEmail: args.actorEmail,
    message: `Access rescue email sent to ${supportCase.case.buyerEmail}.`,
    metadata: {
      nextPath,
      resendResult: result,
    },
  });

  return { result, accessUrl };
}
