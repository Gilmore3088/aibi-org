import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient as ssrCreateServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { emailVariants } from '@/lib/email/canonicalize';
import { isDeviceTrusted, TRUSTED_DEVICE_COOKIE } from '@/lib/auth/trusted-device';
import {
  getCompletedTeamResponses,
  getTeamCohortById,
  type TeamAssessmentCohort,
} from '@/lib/team-assessment/db';
import type { CompletedTeamAssessmentResponse } from '@/lib/team-assessment/aggregate';

export interface TeamAdminData {
  readonly cohort: TeamAssessmentCohort;
  readonly responses: CompletedTeamAssessmentResponse[];
}

export async function loadTeamAdminData(
  cohortId: string,
  nextPath: string,
): Promise<TeamAdminData> {
  if (!isSupabaseConfigured()) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const supabase = ssrCreateServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  const trustedCookie = cookieStore.get(TRUSTED_DEVICE_COOKIE)?.value;
  if (!(await isDeviceTrusted({ userId: user.id, cookieToken: trustedCookie }))) {
    redirect(`/auth/confirm-device-pending?email=${encodeURIComponent(user.email)}`);
  }

  const cohort = await getTeamCohortById(cohortId);
  if (!cohort) notFound();

  const variants = emailVariants(user.email).map((email) => email.toLowerCase());
  const buyerMatches =
    cohort.buyer_user_id === user.id || variants.includes(cohort.buyer_email.toLowerCase());
  if (!buyerMatches) notFound();

  const responses = await getCompletedTeamResponses(cohort.id);
  return { cohort, responses };
}
