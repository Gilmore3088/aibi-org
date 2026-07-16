import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EMAIL_RE } from '@/lib/email/validate';
import {
  getCompletedTeamResponses,
  getExistingTeamResponse,
  getTeamAssessmentOrigin,
  getTeamCohortByToken,
} from '@/lib/team-assessment/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


interface StartPayload {
  email?: unknown;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
  }

  const { token } = await context.params;
  const cohort = await getTeamCohortByToken(token);
  if (!cohort || cohort.status !== 'active') {
    return NextResponse.json({ error: 'Team assessment link is not active.' }, { status: 404 });
  }

  let body: StartPayload;
  try {
    body = (await request.json()) as StartPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid work email is required.' }, { status: 400 });
  }

  const origin = getTeamAssessmentOrigin(request);
  const existing = await getExistingTeamResponse(cohort.id, email);
  if (existing) {
    return NextResponse.json({
      status: 'existing',
      resultUrl: `${origin}/assessment/team/results/${existing.personal_report_token}`,
    });
  }

  const completed = await getCompletedTeamResponses(cohort.id);
  if (completed.length >= cohort.seats_purchased) {
    return NextResponse.json(
      { error: 'This team assessment has used all purchased seats.' },
      { status: 409 },
    );
  }

  return NextResponse.json({
    status: 'ready',
    cohort: {
      institutionName: cohort.institution_name,
      seatsPurchased: cohort.seats_purchased,
      completedCount: completed.length,
    },
  });
}
