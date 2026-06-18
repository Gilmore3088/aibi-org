import { NextResponse } from 'next/server';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { parseRoleV4 } from '@content/assessments/v4/roles';
import {
  TEAM_ASSESSMENT_UNLOCK_COMPLETIONS,
  parseTeamDepartment,
} from '@/lib/team-assessment/constants';
import {
  getCompletedTeamResponses,
  getExistingTeamResponse,
  getTeamAssessmentOrigin,
  getTeamCohortByToken,
  markCohortUnlocked,
} from '@/lib/team-assessment/db';
import { scoreTeamAssessmentResponse } from '@/lib/team-assessment/scoring';
import {
  sendTeamAssessmentParticipantReport,
  sendTeamAssessmentReportUnlocked,
} from '@/lib/resend';
import { generateMagicLink } from '@/lib/supabase/auth-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubmitPayload {
  email?: unknown;
  department?: unknown;
  departmentOther?: unknown;
  role?: unknown;
  answers?: unknown;
  questionIds?: unknown;
}

function jsonError(error: string, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return jsonError('Server not configured.', 503);
  }

  const { token } = await context.params;
  const cohort = await getTeamCohortByToken(token);
  if (!cohort || cohort.status !== 'active') {
    return jsonError('Team assessment link is not active.', 404);
  }

  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const department = parseTeamDepartment(body.department);
  const departmentOther =
    typeof body.departmentOther === 'string' ? body.departmentOther.trim() : '';
  const role = parseRoleV4(body.role);

  if (!EMAIL_RE.test(email)) return jsonError('A valid work email is required.', 400);
  if (!department) return jsonError('A valid department is required.', 400);
  if (department === 'other' && departmentOther.length < 2) {
    return jsonError('Please name the department when selecting Other.', 400);
  }
  if (!role) return jsonError('A valid role is required.', 400);

  const origin = getTeamAssessmentOrigin(request);
  const existing = await getExistingTeamResponse(cohort.id, email);
  if (existing) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      resultUrl: `${origin}/assessment/team/results/${existing.personal_report_token}`,
    });
  }

  const beforeResponses = await getCompletedTeamResponses(cohort.id);
  if (beforeResponses.length >= cohort.seats_purchased) {
    return jsonError('This team assessment has used all purchased seats.', 409);
  }

  let scored: ReturnType<typeof scoreTeamAssessmentResponse>;
  try {
    scored = scoreTeamAssessmentResponse(body.answers, body.questionIds);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Invalid assessment payload.', 400);
  }

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('team_assessment_responses')
    .insert({
      cohort_id: cohort.id,
      participant_email: email,
      department,
      department_other: department === 'other' ? departmentOther : null,
      role,
      answers: scored.answers,
      question_ids: scored.questionIds,
      score: scored.score,
      maturity_band_id: scored.band.id,
      maturity_band_label: scored.band.label,
      dimension_breakdown: scored.dimensionBreakdown,
    })
    .select('personal_report_token')
    .single();

  if (error) {
    if (error.code === '23505') {
      const duplicate = await getExistingTeamResponse(cohort.id, email);
      if (duplicate) {
        return NextResponse.json({
          ok: true,
          duplicate: true,
          resultUrl: `${origin}/assessment/team/results/${duplicate.personal_report_token}`,
        });
      }
    }
    console.error('[team-assessment/submit] insert error:', error);
    return jsonError('Could not save the team assessment response.', 500);
  }

  const responseToken = (data as { personal_report_token: string }).personal_report_token;
  const resultUrl = `${origin}/assessment/team/results/${responseToken}`;

  void sendTeamAssessmentParticipantReport({
    email,
    institutionName: cohort.institution_name,
    score: scored.score,
    bandLabel: scored.band.label,
    reportUrl: resultUrl,
  }).catch((err) => console.warn('[team-assessment/submit] participant email skipped:', err));

  const afterCount = beforeResponses.length + 1;
  if (
    afterCount >= TEAM_ASSESSMENT_UNLOCK_COMPLETIONS &&
    cohort.report_unlocked_at === null
  ) {
    await markCohortUnlocked(cohort.id);
    const adminPath = `/assessment/team/admin/${cohort.id}`;
    let adminUrl: string | null = null;
    try {
      adminUrl = await generateMagicLink(cohort.buyer_email, adminPath);
    } catch (err) {
      console.warn('[team-assessment/submit] admin magic link skipped:', err);
    }
    void sendTeamAssessmentReportUnlocked({
      email: cohort.buyer_email,
      institutionName: cohort.institution_name,
      completedCount: afterCount,
      adminUrl: adminUrl ?? `${origin}/auth/login?next=${encodeURIComponent(adminPath)}`,
    }).catch((err) => console.warn('[team-assessment/submit] unlock email skipped:', err));
  }

  return NextResponse.json({ ok: true, resultUrl });
}
