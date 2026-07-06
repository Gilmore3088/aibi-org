// Post-certificate transfer loop — 30/60/90-day reminders.
//
// Adult-learning transfer: the course ends with a credential, but the skill
// only sticks if it gets used at work. This monitor mirrors
// paid-reengagement.ts: it scans issued certificates, picks the highest due
// stage per enrollment, sends one role-specific transfer prompt per stage,
// and logs to paid_reengagement_events (same dedupe index).
//
// Stage content comes from the learner's role path:
//   30 days — quickWins: one small rep to put into weekly use
//   60 days — automationTargets: automate one recurring workflow
//   90 days — reuse the workflow kit and refer a peer

import { getRolePath } from '@content/courses/foundation-program/role-paths';
import { isNonDeliverableEmail } from '@/lib/email/deliverability';
import {
  sendCertificateTransferReminder,
  type ResendResult,
} from '@/lib/resend';
import type { CertificateTransferReminderVars } from '@/lib/resend/templates/certificate-transfer';
import { generateMagicLink, getCanonicalSiteUrl } from '@/lib/supabase/auth-admin';
import { createServiceRoleClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchExistingSentDedupeKeys } from './paid-reengagement';
import type { LearnerRole, OnboardingAnswers } from '@/types/course';

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export type CertificateTransferStage = 30 | 60 | 90;

export type CertificateTransferCampaign =
  | 'certificate_transfer_30'
  | 'certificate_transfer_60'
  | 'certificate_transfer_90';

export const CERTIFICATE_TRANSFER_STAGES: readonly CertificateTransferStage[] = [30, 60, 90];

export const DEFAULT_CERTIFICATE_TRANSFER_LOOKBACK_DAYS = 180;
export const DEFAULT_CERTIFICATE_TRANSFER_MAX_CHECKS = 100;

export interface CertificateTransferRow {
  readonly id: string;
  readonly enrollment_id: string;
  readonly issued_at: string | null;
  readonly course_enrollments: {
    readonly email: string | null;
    readonly user_id: string | null;
    readonly product: string | null;
    readonly onboarding_answers: OnboardingAnswers | null;
  } | null;
}

export interface CertificateTransferCandidate {
  readonly campaign: CertificateTransferCampaign;
  readonly stage: CertificateTransferStage;
  readonly certificate: CertificateTransferRow;
  readonly ageDays: number;
}

export interface CertificateTransferOptions {
  readonly now?: Date;
  readonly stageDays?: readonly CertificateTransferStage[];
  readonly lookbackDays?: number;
  readonly maxChecks?: number;
}

export interface CertificateTransferSentReminder {
  readonly enrollmentId: string;
  readonly email: string;
  readonly campaign: CertificateTransferCampaign;
}

export interface CertificateTransferFailedReminder extends CertificateTransferSentReminder {
  readonly reason: string;
}

export interface CertificateTransferResult {
  readonly status: 'ok' | 'skipped';
  readonly skipped?: string;
  readonly checkedCertificates: number;
  readonly eligibleCandidates: number;
  readonly sentReminders: readonly CertificateTransferSentReminder[];
  readonly failedReminders: readonly CertificateTransferFailedReminder[];
  readonly existingReminders: number;
  readonly skippedCandidates: number;
}

function parsePositiveInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function resolveCertificateTransferOptions(input: CertificateTransferOptions = {}) {
  return {
    stageDays: input.stageDays ?? CERTIFICATE_TRANSFER_STAGES,
    lookbackDays:
      input.lookbackDays ??
      parsePositiveInteger(
        process.env.CERTIFICATE_TRANSFER_LOOKBACK_DAYS,
        DEFAULT_CERTIFICATE_TRANSFER_LOOKBACK_DAYS,
        30,
        365,
      ),
    maxChecks:
      input.maxChecks ??
      parsePositiveInteger(
        process.env.CERTIFICATE_TRANSFER_MAX_CHECKS,
        DEFAULT_CERTIFICATE_TRANSFER_MAX_CHECKS,
        1,
        500,
      ),
  };
}

function daysBetween(startIso: string, now: Date): number {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, (now.getTime() - start) / 86_400_000);
}

/**
 * Pick the highest due stage for this certificate. One reminder per stage;
 * dedupe keys keep re-runs idempotent, and a learner certified 95 days ago
 * gets the 90-day prompt (not a backlog of all three).
 */
export function evaluateCertificateTransferCandidate(
  certificate: CertificateTransferRow,
  now: Date,
  stageDays: readonly CertificateTransferStage[] = CERTIFICATE_TRANSFER_STAGES,
): CertificateTransferCandidate | null {
  if (!certificate.issued_at) return null;
  if (!certificate.course_enrollments?.email) return null;
  const ageDays = daysBetween(certificate.issued_at, now);

  const dueStages = stageDays.filter((stage) => ageDays >= stage);
  if (dueStages.length === 0) return null;
  const stage = dueStages[dueStages.length - 1];

  return {
    campaign: `certificate_transfer_${stage}` as CertificateTransferCampaign,
    stage,
    certificate,
    ageDays,
  };
}

export function certificateTransferDedupeKey(candidate: CertificateTransferCandidate): string {
  return `paid-reengagement:${candidate.campaign}:${candidate.certificate.enrollment_id}`;
}

export function buildCertificateTransferContent(
  stage: CertificateTransferStage,
  learnerRole: LearnerRole,
): Omit<CertificateTransferReminderVars, 'actionUrl'> & { readonly path: string } {
  const rolePath = getRolePath(learnerRole);

  if (stage === 30) {
    return {
      stage,
      headingText: 'One quick win from your Foundation work, this week',
      bodyText: rolePath
        ? `You earned the AiBI-Foundation credential a month ago. The skill sticks when it gets used — pick one of these ${rolePath.label.toLowerCase()} reps and run it on real work this week.`
        : 'You earned the AiBI-Foundation credential a month ago. The skill sticks when it gets used — pick one saved prompt from your Foundation Packet and run it on real work this week.',
      items: rolePath
        ? rolePath.quickWins.slice(0, 3)
        : [
            'Reopen your Foundation Packet and pick the artifact closest to your day job',
            'Run its prompt on one real, non-sensitive task this week',
            'Note what you edited before the work shipped — that is your review evidence',
          ],
      ctaLabel: 'Open your Toolbox',
      path: '/dashboard/toolbox',
    };
  }

  if (stage === 60) {
    return {
      stage,
      headingText: 'Turn one recurring workflow into a reviewed AI workflow',
      bodyText: rolePath
        ? `Two months in is the right time to move from single prompts to a repeatable workflow. These are the ${rolePath.label.toLowerCase()} targets your path was built around.`
        : 'Two months in is the right time to move from single prompts to a repeatable workflow. Pick one recurring task and give it inputs, review gates, and reuse rules.',
      items: rolePath
        ? rolePath.automationTargets.slice(0, 3)
        : [
            'Pick one task you repeat weekly',
            'Write down its inputs, the review gate, and who owns the final call',
            'Save it as a reusable skill in your Toolbox',
          ],
      ctaLabel: 'Open your Toolbox',
      path: '/dashboard/toolbox',
    };
  }

  return {
    stage,
    headingText: 'Your workflow kit is built — put it in front of your team',
    bodyText:
      'Three months after certification, the highest-leverage move is reuse: your Foundation Packet and workflow kit are evidence your institution can adopt, not just personal notes.',
    items: [
      'Walk your manager through one artifact from your Foundation Packet and its review rules',
      'Offer your workflow kit as the starting template for one teammate',
      'Know a peer starting out? Send them the free readiness assessment at aibankinginstitute.com/assessment',
    ],
    ctaLabel: 'Open your workflow kit',
    path: '/courses/foundation/program/toolkit',
  };
}

async function buildActionUrl(email: string, path: string): Promise<string> {
  const fallback = new URL(path, getCanonicalSiteUrl()).toString();
  try {
    return (await generateMagicLink(email, path)) ?? fallback;
  } catch (err) {
    console.warn('[certificate-transfer] magic link skipped:', err);
    return fallback;
  }
}

function resendFailureReason(result: ResendResult): string | null {
  if ('ok' in result) return result.ok ? null : result.error;
  return result.reason;
}

async function fetchCandidateCertificates(
  client: ServiceClient,
  now: Date,
  options: ReturnType<typeof resolveCertificateTransferOptions>,
): Promise<CertificateTransferRow[]> {
  const earliestIso = new Date(now.getTime() - options.lookbackDays * 86_400_000).toISOString();
  const minStage = Math.min(...options.stageDays);
  const latestIso = new Date(now.getTime() - minStage * 86_400_000).toISOString();

  const { data, error } = await client
    .from('certificates')
    .select(
      'id, enrollment_id, issued_at, course_enrollments (email, user_id, product, onboarding_answers)',
    )
    .gte('issued_at', earliestIso)
    .lte('issued_at', latestIso)
    .order('issued_at', { ascending: false })
    .limit(options.maxChecks);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as CertificateTransferRow[];
}

async function insertTransferEvent(
  client: ServiceClient,
  candidate: CertificateTransferCandidate,
  status: 'sent' | 'failed',
  dedupeKey: string,
  now: Date,
  failureReason?: string,
): Promise<void> {
  const enrollment = candidate.certificate.course_enrollments;
  const { error } = await client.from('paid_reengagement_events').insert({
    campaign: candidate.campaign,
    enrollment_id: candidate.certificate.enrollment_id,
    user_id: enrollment?.user_id ?? null,
    email: enrollment?.email ?? '',
    product: enrollment?.product ?? 'foundation',
    status,
    dedupe_key: dedupeKey,
    failure_reason: failureReason ?? null,
    sent_at: status === 'sent' ? now.toISOString() : null,
    metadata: {
      certificateId: candidate.certificate.id,
      issuedAt: candidate.certificate.issued_at,
      stage: candidate.stage,
      ageDays: Number(candidate.ageDays.toFixed(2)),
    },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function runCertificateTransferMonitor(
  input: CertificateTransferOptions = {},
  providedClient?: ServiceClient,
): Promise<CertificateTransferResult> {
  const options = resolveCertificateTransferOptions(input);
  if (!isSupabaseConfigured()) {
    return {
      status: 'skipped',
      skipped: 'supabase-not-configured',
      checkedCertificates: 0,
      eligibleCandidates: 0,
      sentReminders: [],
      failedReminders: [],
      existingReminders: 0,
      skippedCandidates: 0,
    };
  }

  const client = providedClient ?? createServiceRoleClient();
  const now = input.now ?? new Date();
  const certificates = await fetchCandidateCertificates(client, now, options);

  const candidates = certificates
    .map((certificate) => evaluateCertificateTransferCandidate(certificate, now, options.stageDays))
    .filter((candidate): candidate is CertificateTransferCandidate => candidate !== null)
    .filter(
      (candidate) => !isNonDeliverableEmail(candidate.certificate.course_enrollments?.email ?? ''),
    );

  const dedupeKeys = candidates.map(certificateTransferDedupeKey);
  const existingKeys = await fetchExistingSentDedupeKeys(client, dedupeKeys);
  const sentReminders: CertificateTransferSentReminder[] = [];
  const failedReminders: CertificateTransferFailedReminder[] = [];
  let skippedCandidates = 0;

  for (const candidate of candidates) {
    const dedupeKey = certificateTransferDedupeKey(candidate);
    if (existingKeys.has(dedupeKey)) {
      skippedCandidates += 1;
      continue;
    }

    const email = candidate.certificate.course_enrollments?.email?.trim() ?? '';
    const base = {
      enrollmentId: candidate.certificate.enrollment_id,
      email,
      campaign: candidate.campaign,
    };

    const learnerRole: LearnerRole =
      candidate.certificate.course_enrollments?.onboarding_answers?.primary_role ?? 'other';
    const content = buildCertificateTransferContent(candidate.stage, learnerRole);
    const actionUrl = await buildActionUrl(email, content.path);

    const result = await sendCertificateTransferReminder({
      email,
      vars: {
        stage: content.stage,
        headingText: content.headingText,
        bodyText: content.bodyText,
        items: content.items,
        ctaLabel: content.ctaLabel,
        actionUrl,
      },
    });

    const failure = resendFailureReason(result);
    if (failure) {
      failedReminders.push({ ...base, reason: failure });
      await insertTransferEvent(client, candidate, 'failed', dedupeKey, now, failure);
      continue;
    }

    await insertTransferEvent(client, candidate, 'sent', dedupeKey, now);
    sentReminders.push(base);
  }

  return {
    status: 'ok',
    checkedCertificates: certificates.length,
    eligibleCandidates: candidates.length,
    sentReminders,
    failedReminders,
    existingReminders: existingKeys.size,
    skippedCandidates,
  };
}
