import { NextResponse } from 'next/server';
import { verifyReviewer } from '@/lib/auth/reviewerAuth';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';

const FOUNDATION_PROGRAM_TOTAL_MODULES = 12;

export async function GET(): Promise<NextResponse> {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 503 });
  }

  const reviewer = await verifyReviewer();
  if (!reviewer.isReviewer) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  const supabase = createServiceRoleClient();

  const [
    enrollments,
    profiles,
    certificates,
    submissions,
  ] = await Promise.all([
    supabase.from('course_enrollments').select('id, email, product, completed_modules, current_module, enrolled_at'),
    supabase.from('user_profiles').select('email, readiness_score, readiness_tier_label, readiness_at'),
    supabase.from('certificates').select('id, enrollment_id, issued_at'),
    supabase.from('work_submissions').select('id, review_status, submitted_at'),
  ]);

  if (enrollments.error || profiles.error || certificates.error || submissions.error) {
    return NextResponse.json({ error: 'Failed to load admin summary.' }, { status: 500 });
  }

  const enrollmentRows = enrollments.data ?? [];
  const profileRows = profiles.data ?? [];
  const certificateRows = certificates.data ?? [];
  const readinessScores = profileRows
    .map((row) => row.readiness_score)
    .filter((score): score is number => typeof score === 'number');

  const averageReadinessScore =
    readinessScores.length > 0
      ? Math.round(readinessScores.reduce((total, score) => total + score, 0) / readinessScores.length)
      : null;

  return NextResponse.json({
    totalUsers: enrollmentRows.length,
    activeUsers: enrollmentRows.filter((row) => (row.completed_modules?.length ?? 0) > 0).length,
    completedUsers: enrollmentRows.filter((row) => (row.completed_modules?.length ?? 0) >= FOUNDATION_PROGRAM_TOTAL_MODULES).length,
    averageReadinessScore,
    certificatesIssued: certificateRows.length,
    pendingReviews: (submissions.data ?? []).filter((row) => row.review_status === 'pending').length,
    learners: enrollmentRows.map((row) => {
      const profile = profileRows.find((item) => item.email === row.email);
      return {
        email: row.email,
        product: row.product,
        assessmentTier: profile?.readiness_tier_label ?? null,
        courseProgress: row.completed_modules?.length ?? 0,
        currentModule: row.current_module,
        enrolledAt: row.enrolled_at,
        certificateStatus: certificateRows.some((cert) => cert.enrollment_id === row.id)
          ? 'issued'
          : 'not-issued',
      };
    }),
  });
}
