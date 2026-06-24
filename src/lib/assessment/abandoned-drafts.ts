import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  ASSESSMENT_DRAFT_TTL_DAYS,
  buildAssessmentResumeUrl,
  createAssessmentResumeToken,
  hashAssessmentResumeToken,
} from '@/lib/assessment/drafts';
import { sendAssessmentResumeLink, type ResendResult } from '@/lib/resend';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export const DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS = 24;
export const DEFAULT_ABANDONED_ASSESSMENT_LOOKBACK_DAYS = 14;
export const DEFAULT_ABANDONED_ASSESSMENT_MAX_REMINDERS = 50;

export interface AssessmentDraftReminderRow {
  readonly id: string;
  readonly email: string;
  readonly selected_question_ids: string[] | null;
  readonly answers: unknown;
  readonly current_question: number;
  readonly phase: string;
  readonly updated_at: string;
  readonly expires_at: string;
  readonly last_resumed_at: string | null;
  readonly reminder_sent_at: string | null;
  readonly reminder_count: number | null;
}

export interface AbandonedAssessmentOptions {
  readonly now?: Date;
  readonly reminderAfterHours?: number;
  readonly lookbackDays?: number;
  readonly maxReminders?: number;
}

export interface AbandonedAssessmentReminder {
  readonly draftId: string;
  readonly email: string;
  readonly currentQuestion: number;
  readonly totalQuestions: number;
}

export interface AbandonedAssessmentResult {
  readonly status: 'ok' | 'skipped';
  readonly skipped?: string;
  readonly checkedDrafts: number;
  readonly sentReminders: readonly AbandonedAssessmentReminder[];
  readonly failedReminders: readonly { readonly draftId: string; readonly email: string; readonly reason: string }[];
  readonly options: {
    readonly reminderAfterHours: number;
    readonly lookbackDays: number;
    readonly maxReminders: number;
  };
}

function parsePositiveInteger(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function resolveAbandonedAssessmentOptions(
  input: AbandonedAssessmentOptions = {},
): Required<Pick<AbandonedAssessmentOptions, 'reminderAfterHours' | 'lookbackDays' | 'maxReminders'>> {
  return {
    reminderAfterHours:
      input.reminderAfterHours ??
      parsePositiveInteger(
        process.env.ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
        DEFAULT_ABANDONED_ASSESSMENT_REMINDER_AFTER_HOURS,
        1,
        168,
      ),
    lookbackDays:
      input.lookbackDays ??
      parsePositiveInteger(
        process.env.ABANDONED_ASSESSMENT_LOOKBACK_DAYS,
        DEFAULT_ABANDONED_ASSESSMENT_LOOKBACK_DAYS,
        1,
        30,
      ),
    maxReminders:
      input.maxReminders ??
      parsePositiveInteger(
        process.env.ABANDONED_ASSESSMENT_MAX_REMINDERS,
        DEFAULT_ABANDONED_ASSESSMENT_MAX_REMINDERS,
        1,
        250,
      ),
  };
}

function timestampMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAnswers(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is number => typeof entry === 'number')
    : [];
}

export function isAbandonedAssessmentDraftCandidate(
  draft: AssessmentDraftReminderRow,
  now: Date,
  reminderAfterHours: number,
): boolean {
  if (draft.phase !== 'questions') return false;
  if (draft.reminder_sent_at || draft.last_resumed_at) return false;
  if (!draft.email || !draft.selected_question_ids?.length) return false;
  if (timestampMs(draft.expires_at) !== null && timestampMs(draft.expires_at)! <= now.getTime()) {
    return false;
  }

  const updatedAt = timestampMs(draft.updated_at);
  if (updatedAt === null) return false;

  return now.getTime() - updatedAt >= reminderAfterHours * 3_600_000;
}

async function fetchAbandonedDrafts(
  client: ServiceClient,
  now: Date,
  options: ReturnType<typeof resolveAbandonedAssessmentOptions>,
): Promise<AssessmentDraftReminderRow[]> {
  const latestIso = new Date(now.getTime() - options.reminderAfterHours * 3_600_000).toISOString();
  const earliestIso = new Date(now.getTime() - options.lookbackDays * 86_400_000).toISOString();
  const { data, error } = await client
    .from('assessment_drafts')
    .select(
      [
        'id',
        'email',
        'selected_question_ids',
        'answers',
        'current_question',
        'phase',
        'updated_at',
        'expires_at',
        'last_resumed_at',
        'reminder_sent_at',
        'reminder_count',
      ].join(', '),
    )
    .eq('phase', 'questions')
    .is('reminder_sent_at', null)
    .is('last_resumed_at', null)
    .gte('updated_at', earliestIso)
    .lte('updated_at', latestIso)
    .gt('expires_at', now.toISOString())
    .order('updated_at', { ascending: true })
    .limit(options.maxReminders);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as AssessmentDraftReminderRow[];
}

function resendFailureReason(result: ResendResult): string | null {
  if ('ok' in result) return result.ok ? null : result.error;
  return result.reason;
}

export async function runAbandonedAssessmentMonitor(
  input: AbandonedAssessmentOptions = {},
  providedClient?: ServiceClient,
): Promise<AbandonedAssessmentResult> {
  const options = resolveAbandonedAssessmentOptions(input);
  if (!isSupabaseConfigured()) {
    return {
      status: 'skipped',
      skipped: 'supabase-not-configured',
      checkedDrafts: 0,
      sentReminders: [],
      failedReminders: [],
      options,
    };
  }

  const client = providedClient ?? createServiceRoleClient();
  const now = input.now ?? new Date();
  const rows = await fetchAbandonedDrafts(client, now, options);
  const candidates = rows.filter((row) =>
    isAbandonedAssessmentDraftCandidate(row, now, options.reminderAfterHours),
  );
  const sentReminders: AbandonedAssessmentReminder[] = [];
  const failedReminders: Array<{ readonly draftId: string; readonly email: string; readonly reason: string }> = [];

  for (const draft of candidates) {
    const token = createAssessmentResumeToken();
    const resumeUrl = buildAssessmentResumeUrl(token);
    const tokenHash = hashAssessmentResumeToken(token);
    const currentQuestion = Math.min(
      Math.max(draft.current_question + 1, parseAnswers(draft.answers).length + 1, 1),
      draft.selected_question_ids?.length ?? 12,
    );
    const nowIso = now.toISOString();

    const { error: tokenError } = await client
      .from('assessment_drafts')
      .update({ token_hash: tokenHash, last_sent_at: nowIso })
      .eq('id', draft.id);
    if (tokenError) {
      failedReminders.push({ draftId: draft.id, email: draft.email, reason: tokenError.message });
      continue;
    }

    const emailResult = await sendAssessmentResumeLink({
      email: draft.email,
      resumeUrl,
      currentQuestion,
      totalQuestions: draft.selected_question_ids?.length ?? 12,
      expiresInDays: ASSESSMENT_DRAFT_TTL_DAYS,
    });
    const failure = resendFailureReason(emailResult);
    if (failure) {
      failedReminders.push({ draftId: draft.id, email: draft.email, reason: failure });
      continue;
    }

    const { error: updateError } = await client
      .from('assessment_drafts')
      .update({
        reminder_sent_at: nowIso,
        reminder_count: (draft.reminder_count ?? 0) + 1,
      })
      .eq('id', draft.id);
    if (updateError) {
      failedReminders.push({ draftId: draft.id, email: draft.email, reason: updateError.message });
      continue;
    }

    sentReminders.push({
      draftId: draft.id,
      email: draft.email,
      currentQuestion,
      totalQuestions: draft.selected_question_ids?.length ?? 12,
    });
  }

  return {
    status: 'ok',
    checkedDrafts: rows.length,
    sentReminders,
    failedReminders,
    options,
  };
}
