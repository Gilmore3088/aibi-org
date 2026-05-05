// Course types matching supabase/migrations/00001_course_tables.sql
// Keep in sync — if you change a column, update the type.
// All properties are readonly to enforce immutability at the type level.

export type LearnerRole =
  | 'lending'
  | 'operations'
  | 'compliance'
  | 'finance'
  | 'marketing'
  | 'it'
  | 'retail'
  | 'executive'
  | 'other';

export type ReviewStatus = 'pending' | 'approved' | 'failed' | 'resubmitted';

export interface OnboardingAnswers {
  readonly uses_m365: 'yes' | 'no' | 'not_sure';
  readonly personal_ai_subscriptions: readonly string[];
  readonly primary_role: LearnerRole;
}

export interface ReviewScores {
  readonly accuracy: 1 | 2 | 3 | 4;
  readonly completeness: 1 | 2 | 3 | 4;
  readonly tone_and_voice: 1 | 2 | 3 | 4;
  readonly judgment: 1 | 2 | 3 | 4;
  readonly skill_quality: 1 | 2 | 3 | 4;
}

// Matches course_enrollments table (DB-01)
export interface CourseEnrollment {
  readonly id: string;
  readonly user_id: string;
  readonly email: string;
  readonly product: string;
  readonly stripe_session_id: string | null;
  /** @deprecated Kajabi dropped 2026-05-05 in favor of in-house LMS; column kept for back-compat, always null. */
  readonly kajabi_user_id: string | null;
  readonly onboarding_answers: OnboardingAnswers | null;
  readonly completed_modules: readonly number[];
  readonly current_module: number;
  readonly institution_enrollment_id: string | null;
  readonly enrolled_at: string;
  readonly created_at: string;
}

// Matches activity_responses table (DB-02, CONT-04)
export interface ActivityResponse {
  readonly id: string;
  readonly enrollment_id: string;
  readonly module_number: number;
  readonly activity_id: string;
  readonly response: Record<string, unknown>;
  readonly created_at: string;
}

// Matches work_submissions table (DB-03)
export interface WorkSubmission {
  readonly id: string;
  readonly enrollment_id: string;
  readonly skill_file_url: string;
  readonly input_text: string;
  readonly raw_output_text: string;
  readonly edited_output_text: string;
  readonly annotation_text: string;
  readonly submitted_at: string;
  readonly reviewer_id: string | null;
  readonly review_scores: ReviewScores | null;
  readonly review_feedback: string | null;
  readonly review_status: ReviewStatus;
  readonly reviewed_at: string | null;
}

// Matches certificates table (DB-04)
export interface Certificate {
  readonly id: string;
  readonly enrollment_id: string;
  readonly certificate_id: string;
  readonly holder_name: string;
  readonly designation: string;
  readonly issued_at: string;
}

// Matches institution_enrollments table (DB-05)
export interface InstitutionEnrollment {
  readonly id: string;
  readonly institution_name: string;
  readonly seats_purchased: number;
  readonly seats_used: number;
  readonly stripe_session_id: string | null;
  readonly discount_locked: boolean;
  readonly created_at: string;
}
