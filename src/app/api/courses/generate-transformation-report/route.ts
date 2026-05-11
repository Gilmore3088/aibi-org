// GET /api/courses/generate-transformation-report?enrollmentId=<id>
//
// Generates the AiBI-Foundation Transformation Report PDF for a completed learner.
// The report summarises pre/post assessment comparison, skills built,
// cumulative impact, quick wins, and course completion status.
//
// Security model:
//   - Auth session required — unauthenticated requests return 401.
//   - Enrollment ownership verified — enrollment.user_id must match authenticated user.
//   - User text rendered via @react-pdf/renderer Text components — no HTML injection.

import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import {
  TransformationReportDocument,
  type TransformationReportProps,
  type SkillEntry,
  type QuickWinEntry,
  type DimensionEntry,
} from '@/lib/pdf/TransformationReportDocument';

const PDF_FILENAME = 'AiBI-Foundation-Transformation-Report.pdf';

// Annual hours saved by module — mirrors _PostAssessmentClient.tsx constant
const ANNUAL_HOURS_BY_MODULE: Record<number, number> = {
  1: 6, 2: 0, 3: 43, 4: 52, 5: 0, 6: 0, 7: 87, 8: 0, 9: 0,
};
const TOTAL_ANNUAL_HOURS = Object.values(ANNUAL_HOURS_BY_MODULE).reduce((a, b) => a + b, 0);

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnrollmentRow {
  id: string;
  user_id: string;
  email: string;
  completed_modules: number[];
  onboarding_answers: {
    primary_role?: string;
  } | null;
  post_assessment_score?: number | null;
  post_assessment_tier_label?: string | null;
  post_assessment_dimension_scores?: Record<string, { score: number; maxScore: number; label: string }> | null;
}

interface ActivityResponseRow {
  activity_id: string;
  response: Record<string, unknown>;
}

interface WorkSubmissionRow {
  review_status: string;
}

interface QuickWinRow {
  description: string;
  tool: string;
  time_saved_minutes: number;
  skill_name: string;
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function authenticate(): Promise<
  | { userId: string; error?: never }
  | { userId?: never; error: Response }
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = cookies();

  const anonClient = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser();

  if (authError || !user) {
    return {
      error: new Response(JSON.stringify({ error: 'Not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { userId: user.id };
}

// ── Resolve holder name from auth metadata or email prefix ───────────────────

async function resolveHolderName(
  serviceClient: ReturnType<typeof createServiceRoleClient>,
  enrollment: EnrollmentRow,
): Promise<string> {
  if (enrollment.user_id) {
    const { data: userData } = await serviceClient.auth.admin.getUserById(enrollment.user_id);
    if (userData?.user) {
      const meta = userData.user.user_metadata as Record<string, unknown> | null;
      const displayName =
        (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
        (typeof meta?.name === 'string' && meta.name.trim()) ||
        null;
      if (displayName) return displayName;
    }
  }

  const prefix = enrollment.email.split('@')[0] ?? enrollment.email;
  return prefix
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

// ── Resolve institution from onboarding answers or email domain ───────────────

function resolveInstitution(enrollment: EnrollmentRow): string {
  const domain = enrollment.email.split('@')[1];
  if (!domain) return 'Community Bank';
  const parts = domain.split('.');
  const name = parts[0] ?? domain;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// ── Format date ───────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── Build PDF props from DB data ──────────────────────────────────────────────

function buildDimensions(
  dimensionScores: Record<string, { score: number; maxScore: number; label: string }> | null | undefined,
  preAssessmentDimensions?: Record<string, { score: number; maxScore: number }> | null,
): DimensionEntry[] {
  if (!dimensionScores) return [];
  return Object.entries(dimensionScores).map(([key, dim]) => ({
    label: dim.label ?? key,
    postScore: dim.score,
    maxScore: dim.maxScore,
    preScore: preAssessmentDimensions?.[key]?.score ?? null,
  }));
}

function buildSkills(activityResponses: ActivityResponseRow[]): SkillEntry[] {
  const skills: SkillEntry[] = [];

  // Module 7 — first skill
  const m7 = activityResponses.find((r) => r.activity_id === '7.1');
  if (m7) {
    const resp = m7.response;
    const mdContent = typeof resp['skill-md-content'] === 'string' ? resp['skill-md-content'] : '';
    const roleContext = typeof resp['skill-role'] === 'string' ? resp['skill-role'] : '';
    const nameMatch = /^# (.+?) - v1/m.exec(mdContent);
    const name = nameMatch ? nameMatch[1].trim() : 'Banking AI Skill v1.0';
    skills.push({ name, role: roleContext.slice(0, 200), annualHoursSaved: 87 });
  }

  // Module 9 capstone
  const m9 = activityResponses.find((r) => r.activity_id === '9.capstone');
  if (m9) {
    const resp = m9.response;
    const what = typeof resp['automation-what'] === 'string' ? resp['automation-what'] : '';
    if (what) {
      skills.push({ name: what.slice(0, 120), role: 'Capstone workflow — deployed at institution', annualHoursSaved: 0 });
    }
  }

  return skills;
}

// ── Generate PDF buffer ───────────────────────────────────────────────────────

async function generatePdf(props: TransformationReportProps): Promise<Buffer> {
  const element = React.createElement(
    TransformationReportDocument,
    props,
  ) as React.ReactElement<DocumentProps>;
  return renderToBuffer(element);
}

// ── PDF Response ──────────────────────────────────────────────────────────────

function pdfResponse(buffer: Buffer): Response {
  const body = new Uint8Array(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'no-store',
    },
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<Response> {
  if (!isSupabaseConfigured()) {
    return new Response(JSON.stringify({ error: 'Service not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(request.url);
  const enrollmentId = searchParams.get('enrollmentId');

  if (!enrollmentId || enrollmentId.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'enrollmentId query parameter is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Auth
  const authResult = await authenticate();
  if (authResult.error) return authResult.error;
  const { userId } = authResult;

  const serviceClient = createServiceRoleClient();

  // Verify enrollment ownership
  const { data: enrollmentData, error: enrollmentError } = await serviceClient
    .from('course_enrollments')
    .select(
      'id, user_id, email, completed_modules, onboarding_answers, ' +
      'post_assessment_score, post_assessment_tier_label, post_assessment_dimension_scores'
    )
    .eq('id', enrollmentId.trim())
    .eq('user_id', userId)
    .maybeSingle();

  if (enrollmentError || !enrollmentData) {
    return new Response(
      JSON.stringify({ error: 'Enrollment not found or access denied.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const enrollment = enrollmentData as unknown as EnrollmentRow;

  // Resolve learner name + institution
  const [holderName, institution] = await Promise.all([
    resolveHolderName(serviceClient, enrollment),
    Promise.resolve(resolveInstitution(enrollment)),
  ]);

  // Fetch activity responses
  const { data: activityRows } = await serviceClient
    .from('activity_responses')
    .select('activity_id, response')
    .eq('enrollment_id', enrollmentId.trim());

  const activityResponses: ActivityResponseRow[] =
    (activityRows as ActivityResponseRow[] | null) ?? [];

  // Fetch quick wins
  const { data: quickWinRows } = await serviceClient
    .from('quick_wins')
    .select('description, tool, time_saved_minutes, skill_name')
    .eq('enrollment_id', enrollmentId.trim())
    .order('created_at', { ascending: false });

  const quickWins: QuickWinEntry[] = ((quickWinRows as QuickWinRow[] | null) ?? []).map((w) => ({
    description: w.description,
    tool: w.tool,
    timeSavedMinutes: w.time_saved_minutes,
  }));

  // Fetch work submission status
  const { data: submissionRow } = await serviceClient
    .from('work_submissions')
    .select('review_status')
    .eq('enrollment_id', enrollmentId.trim())
    .maybeSingle();

  const submission = submissionRow as WorkSubmissionRow | null;
  const workProductSubmitted = submission !== null;
  const workProductReviewed = submission?.review_status === 'approved';

  // Fetch pre-assessment score from assessment_responses (if captured)
  const { data: preAssessmentRow } = await serviceClient
    .from('assessment_responses')
    .select('score, tier')
    .eq('email', enrollment.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const preScore = (preAssessmentRow as { score: number } | null)?.score ?? null;
  const preTierLabel = (preAssessmentRow as { tier: string } | null)?.tier ?? null;

  // Build PDF props
  const postScore = enrollment.post_assessment_score ?? 0;
  const postTierLabel = enrollment.post_assessment_tier_label ?? 'Not assessed';
  const dimensions = buildDimensions(enrollment.post_assessment_dimension_scores ?? null);
  const skills = buildSkills(activityResponses);
  const completedModules = enrollment.completed_modules?.length ?? 0;

  const props: TransformationReportProps = {
    learnerName: holderName,
    institution,
    reportDate: formatDate(new Date()),
    preScore,
    postScore,
    preTierLabel,
    postTierLabel,
    dimensions,
    skills,
    totalAnnualHoursSaved: TOTAL_ANNUAL_HOURS,
    workflowsAutomated: skills.length,
    quickWins,
    modulesCompleted: completedModules,
    totalModules: 9,
    workProductSubmitted,
    workProductReviewed,
    verificationUrl: `https://aibankinginstitute.com/verify/${enrollmentId.trim()}`,
    enrollmentId: enrollmentId.trim(),
  };

  try {
    const buffer = await generatePdf(props);
    return pdfResponse(buffer);
  } catch (err) {
    console.error('[generate-transformation-report] PDF generation error:', err);
    return new Response(
      JSON.stringify({ error: 'PDF generation failed. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
