import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { RoleV4 } from '@content/assessments/v4/roles';
import type { Dimension } from '@content/assessments/v4/types';
import type { CompletedTeamAssessmentResponse, StoredDimensionScore } from './aggregate';

export interface TeamAssessmentCohort {
  readonly id: string;
  readonly institution_name: string;
  readonly buyer_email: string;
  readonly buyer_user_id: string | null;
  readonly seats_purchased: number;
  readonly public_token: string;
  readonly stripe_session_id: string | null;
  readonly status: 'active' | 'closed' | 'refunded';
  readonly report_unlocked_at: string | null;
  readonly created_at: string;
}

export interface TeamAssessmentParticipantReport extends CompletedTeamAssessmentResponse {
  readonly cohort: Pick<TeamAssessmentCohort, 'id' | 'institution_name'>;
  readonly personal_report_token: string;
}

const COHORT_COLUMNS =
  'id, institution_name, buyer_email, buyer_user_id, seats_purchased, public_token, stripe_session_id, status, report_unlocked_at, created_at';

const RESPONSE_COLUMNS =
  'id, participant_email, department, department_other, role, score, maturity_band_id, maturity_band_label, dimension_breakdown, completed_at, personal_report_token';

function configured(): boolean {
  return isSupabaseConfigured();
}

export function getTeamAssessmentOrigin(request: Request): string {
  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  const host = request.headers.get('host') ?? 'aibankinginstitute.com';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export async function getTeamCohortByToken(
  token: string,
): Promise<TeamAssessmentCohort | null> {
  if (!configured()) return null;
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_cohorts')
    .select(COHORT_COLUMNS)
    .eq('public_token', token)
    .maybeSingle();
  if (error || !data) return null;
  return data as TeamAssessmentCohort;
}

export async function getTeamCohortById(id: string): Promise<TeamAssessmentCohort | null> {
  if (!configured()) return null;
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_cohorts')
    .select(COHORT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as TeamAssessmentCohort;
}

export async function getCompletedTeamResponses(
  cohortId: string,
): Promise<CompletedTeamAssessmentResponse[]> {
  if (!configured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_responses')
    .select(RESPONSE_COLUMNS)
    .eq('cohort_id', cohortId)
    .order('completed_at', { ascending: true });
  if (error || !data) return [];
  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      participant_email: r.participant_email as string,
      department: r.department as string,
      department_other: (r.department_other as string | null) ?? null,
      role: r.role as RoleV4,
      score: r.score as number,
      maturity_band_id: r.maturity_band_id as string,
      maturity_band_label: r.maturity_band_label as string,
      dimension_breakdown: r.dimension_breakdown as Record<Dimension, StoredDimensionScore>,
      completed_at: r.completed_at as string,
    };
  });
}

export async function getExistingTeamResponse(
  cohortId: string,
  participantEmail: string,
): Promise<{ personal_report_token: string } | null> {
  if (!configured()) return null;
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_responses')
    .select('personal_report_token')
    .eq('cohort_id', cohortId)
    .ilike('participant_email', participantEmail.trim().toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as { personal_report_token: string };
}

export async function getTeamParticipantReport(
  responseToken: string,
): Promise<TeamAssessmentParticipantReport | null> {
  if (!configured()) return null;
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_responses')
    .select(
      `${RESPONSE_COLUMNS}, team_assessment_cohorts!inner(id, institution_name)`,
    )
    .eq('personal_report_token', responseToken)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as Record<string, unknown>;
  const cohort = row.team_assessment_cohorts as { id: string; institution_name: string } | null;
  if (!cohort) return null;

  return {
    id: row.id as string,
    participant_email: row.participant_email as string,
    department: row.department as string,
    department_other: (row.department_other as string | null) ?? null,
    role: row.role as RoleV4,
    score: row.score as number,
    maturity_band_id: row.maturity_band_id as string,
    maturity_band_label: row.maturity_band_label as string,
    dimension_breakdown: row.dimension_breakdown as Record<Dimension, StoredDimensionScore>,
    completed_at: row.completed_at as string,
    personal_report_token: row.personal_report_token as string,
    cohort,
  };
}

export async function markCohortUnlocked(cohortId: string): Promise<void> {
  if (!configured()) return;
  const client = createServiceRoleClient();
  const { error } = await client
    .from('team_assessment_cohorts')
    .update({ report_unlocked_at: new Date().toISOString() })
    .eq('id', cohortId)
    .is('report_unlocked_at', null);
  if (error) {
    console.warn('[team-assessment] unlock stamp skipped:', error.message);
  }
}
