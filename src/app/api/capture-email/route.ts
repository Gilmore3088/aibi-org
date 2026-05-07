// POST /api/capture-email
// Validates input, fires ConvertKit/HubSpot adapters, and persists the
// readiness result to Supabase user_profiles (when configured).

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { subscribeToAssessmentForm } from '@/lib/convertkit';
import { upsertContact } from '@/lib/hubspot';
import {
  upsertReadinessResult,
  getReadinessTierByEmail,
  markConvertKitTagged,
} from '@/lib/supabase/user-profiles';
import {
  tagAssessmentTier,
  removeAssessmentTier,
  type TierId,
} from '@/lib/convertkit/sequences';
import { sendAssessmentBreakdown } from '@/lib/resend';
import {
  checkEmailCaptureLimit,
  hashIp,
  logEmailCapture,
} from '@/lib/email-capture/rate-limit';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import type { Dimension } from '@content/assessments/v2/types';

// 5 submissions per IP per hour matches the launch-gate spec in CLAUDE.md.
const RATE_LIMIT_PER_IP_PER_HOUR = 5;

function getRequestIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CapturePayload {
  email?: unknown;
  score?: unknown;
  tier?: unknown;
  tierLabel?: unknown;
  answers?: unknown;
  version?: unknown;
  maxScore?: unknown;
  dimensionBreakdown?: unknown;
  firstName?: unknown;
  institutionName?: unknown;
  marketingOptIn?: unknown;
}

const NAME_MAX_LEN = 80;
const INSTITUTION_MAX_LEN = 120;

interface DimensionEntry {
  score: number;
  maxScore: number;
  label: string;
}

type DimensionBreakdown = Record<string, DimensionEntry>;

function isDimensionBreakdown(value: unknown): value is DimensionBreakdown {
  if (typeof value !== 'object' || value === null) return false;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.score !== 'number') return false;
    if (typeof e.maxScore !== 'number') return false;
    if (typeof e.label !== 'string') return false;
  }
  return true;
}

function isValidPayload(p: CapturePayload): p is {
  email: string;
  score: number;
  tier: string;
  tierLabel: string;
  answers: number[];
  version?: 'v1' | 'v2';
  maxScore?: number;
  dimensionBreakdown?: DimensionBreakdown;
  firstName?: string;
  institutionName?: string;
  marketingOptIn?: boolean;
} {
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return false;
  if (typeof p.score !== 'number') return false;
  if (typeof p.tier !== 'string' || p.tier.length === 0) return false;
  if (typeof p.tierLabel !== 'string' || p.tierLabel.length === 0) return false;
  if (!Array.isArray(p.answers)) return false;
  // v1 has 8 questions, v2 has 12. Reject any other shape.
  if (p.answers.length !== 8 && p.answers.length !== 12) return false;
  if (!p.answers.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4)) return false;
  // Score must equal the sum of answers so an attacker can't persist an
  // inconsistent score that later crashes getTierV2() / getTier().
  const expectedSum = (p.answers as number[]).reduce((acc, n) => acc + n, 0);
  if (p.score !== expectedSum) return false;
  if (p.version !== undefined && p.version !== 'v1' && p.version !== 'v2') return false;
  if (p.maxScore !== undefined && (typeof p.maxScore !== 'number' || p.maxScore < 8 || p.maxScore > 48)) return false;
  if (p.dimensionBreakdown !== undefined && !isDimensionBreakdown(p.dimensionBreakdown)) return false;
  // Optional profile fields — bounded length so an attacker can't dump megabytes.
  if (p.firstName !== undefined && (typeof p.firstName !== 'string' || p.firstName.length > NAME_MAX_LEN)) return false;
  if (p.institutionName !== undefined && (typeof p.institutionName !== 'string' || p.institutionName.length > INSTITUTION_MAX_LEN)) return false;
  if (p.marketingOptIn !== undefined && typeof p.marketingOptIn !== 'boolean') return false;
  return true;
}

export async function POST(request: Request) {
  let body: CapturePayload;
  try {
    body = (await request.json()) as CapturePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  // Per-IP rate limit. Hashed IP only — never store raw.
  const ipHash = hashIp(getRequestIp(request));
  const decision = await checkEmailCaptureLimit(ipHash, {
    perIpPerHour: RATE_LIMIT_PER_IP_PER_HOUR,
  });
  if (!decision.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in an hour.' },
      {
        status: 429,
        headers: decision.retryAfterSeconds
          ? { 'Retry-After': String(decision.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  // Log the attempt before doing any side-effect work so the rate limit
  // counts even if downstream adapters fail.
  await logEmailCapture(ipHash);

  const {
    email,
    score,
    tier,
    tierLabel,
    answers,
    version,
    maxScore,
    dimensionBreakdown,
    firstName,
    institutionName,
    marketingOptIn,
  } = body;

  const completedAt = new Date().toISOString();
  const trimmedFirstName = firstName?.trim() || undefined;
  const trimmedInstitution = institutionName?.trim() || undefined;

  // ConvertKit fires only when the user explicitly opted in to marketing.
  // Without consent the email is treated as transactional only — assessment
  // results, no nurture sequence.
  if (marketingOptIn === true) {
    await subscribeToAssessmentForm({
      email,
      tags: [`tier:${tier}`],
      ...(trimmedFirstName ? { firstName: trimmedFirstName } : {}),
    }).catch((err) => console.warn('[capture-email] convertkit skip', err));
  }

  // HubSpot always fires (CRM contact tracking is operational, not marketing).
  await upsertContact({
    email,
    assessmentScore: score,
    scoreTier: tierLabel,
    ...(trimmedInstitution ? { institutionName: trimmedInstitution } : {}),
  }).catch((err) => console.warn('[capture-email] hubspot skip', err));

  // Persist to Supabase user_profiles when configured.
  // Best-effort: a Supabase failure must not block the response — the
  // localStorage write in EmailGate.tsx is the fallback.
  // Read the prior tier BEFORE the upsert so we know whether to remove
  // a stale CK tag on retake. Captured here even if upsert fails — we
  // still want to fix CK state if it drifted.
  const priorTierId = isSupabaseConfigured()
    ? await getReadinessTierByEmail(email)
    : null;

  let profileId: string | null = null;
  if (isSupabaseConfigured()) {
    const result = await upsertReadinessResult(email, {
      score,
      tierId: tier,
      tierLabel,
      answers,
      completedAt,
      ...(version ? { version } : {}),
      ...(maxScore !== undefined ? { maxScore } : {}),
      ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
    }).catch((err) => {
      console.warn('[capture-email] supabase skip', err);
      return { id: null as string | null };
    });
    profileId = result.id;
  }

  // ConvertKit tier-sequence routing. Honors marketing_opt_in only.
  // Retake re-route: if the prior tier differs, remove its tag first so
  // the user lands cleanly in the new tier's sequence.
  const VALID_TIERS: ReadonlySet<string> = new Set([
    'starting-point',
    'early-stage',
    'building-momentum',
    'ready-to-scale',
  ]);
  let convertkitTagged = false;
  if (marketingOptIn === true && VALID_TIERS.has(tier)) {
    const newTier = tier as TierId;

    if (priorTierId && priorTierId !== newTier && VALID_TIERS.has(priorTierId)) {
      const removed = await removeAssessmentTier({
        email,
        tierId: priorTierId as TierId,
      });
      if (removed.status === 'failed') {
        console.warn(
          '[capture-email] CK retake unsubscribe failed:',
          removed.reason,
        );
      }
    }

    const added = await tagAssessmentTier({
      email,
      tierId: newTier,
      ...(trimmedFirstName ? { firstName: trimmedFirstName } : {}),
    });

    if (added.status === 'tagged') {
      convertkitTagged = true;
      if (profileId) {
        await markConvertKitTagged(profileId);
      }
    } else if (added.status === 'failed') {
      console.warn('[capture-email] CK tier tag failed:', added.reason);
    }
  }

  // Send the breakdown email via Resend (best-effort, non-blocking).
  // Only fires for v2 assessments with a dimension breakdown — v1 doesn't
  // produce the per-dimension data the email's substance depends on.
  if (version === 'v2' && dimensionBreakdown) {
    const tierData = getTierV2(score);
    // Pick the lowest-scoring dimension for the starter artifact pointer.
    const lowest = Object.entries(dimensionBreakdown)
      .map(([id, d]) => ({ id, pct: d.maxScore > 0 ? d.score / d.maxScore : 0 }))
      .sort((a, b) => a.pct - b.pct)[0];
    const artifact = lowest ? getStarterArtifact(lowest.id as Dimension) : null;

    // The email's "Open my full results" URL goes to /results/{profileId}.
    // The UUID is a bearer token — the page loads results without an
    // auth check. No magic link, no callback round-trip.
    sendAssessmentBreakdown({
      email,
      score,
      maxScore: maxScore ?? 48,
      tierId: tier,
      tierLabel,
      tierHeadline: tierData.headline,
      tierSummary: tierData.summary,
      dimensionBreakdown,
      starterArtifactTitle: artifact?.title,
      starterArtifactBody: artifact?.body,
      profileId,
    }).catch((err) => console.warn('[capture-email] resend skip', err));
  }

  return NextResponse.json({
    ok: true,
    profileId,
    convertkitTagAdded: convertkitTagged,
  });
}
