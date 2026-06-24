// POST /api/capture-email
// Validates input, fires the MailerLite adapter, and persists the
// readiness result to Supabase user_profiles (when configured).

import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { subscribeToAssessmentForm } from '@/lib/mailerlite';
import {
  upsertReadinessResult,
  getReadinessTierByEmail,
  markConvertKitTagged,
} from '@/lib/supabase/user-profiles';
import {
  tagAssessmentTier,
  removeAssessmentTier,
  type TierId,
} from '@/lib/mailerlite/sequences';
import { sendAssessmentBreakdown } from '@/lib/resend';
import { ensureAuthUser, generateMagicLink } from '@/lib/supabase/auth-admin';
import {
  checkEmailCaptureLimit,
  hashIp,
  logEmailCapture,
} from '@/lib/email-capture/rate-limit';
import { getTierV2 } from '@content/assessments/v2/scoring';
import { getStarterArtifact } from '@content/assessments/v2/starter-artifacts';
import type { Dimension } from '@content/assessments/v2/types';
import {
  FREE_RESOURCE_CAPTURE_COOKIE,
  normalizeCaptureEmail,
} from '@/lib/resources/freeResourceCapture';

// Free-funnel role taxonomy (FREE_ROLES / parseFreeRole) lives in
// @content/assessments/v3/roles so EmailGate.tsx and this route share one
// source of truth.
import {
  type FreeRole,
  parseFreeRole,
} from '@content/assessments/v3/roles';

// Per-IP hourly backstop against scripted abuse. Deliberately NOT the
// launch-gate's literal "5/hr": the assessment is promoted at in-person
// conferences and bank offices where many legitimate takers share one egress
// IP (corporate NAT / event wifi), and 5/hr would 429 real prospects mid-funnel.
// 30/hr still hard-caps a runaway script while tolerating a shared room.
// Per-IP is the wrong dimension for shared-NAT crowds; the proper fix is a
// per-email cap + Upstash sliding window (tracked). See DECISIONS.md 2026-05-20.
const RATE_LIMIT_PER_IP_PER_HOUR = 30;

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
  role?: unknown;
  marketingOptIn?: unknown;
  // Research-library gate additions (optional on all calls, required on none).
  lead_source?: unknown;
  requested_artifact?: unknown;
}

const NAME_MAX_LEN = 80;
const INSTITUTION_MAX_LEN = 120;
const LEAD_SOURCE_MAX_LEN = 64;
const ARTIFACT_MAX_LEN = 128;
const FREE_RESOURCE_CAPTURE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

function captureResponse(body: Record<string, unknown>, email: string): NextResponse {
  const response = NextResponse.json(body);
  const normalizedEmail = normalizeCaptureEmail(email);
  if (normalizedEmail) {
    response.cookies.set(FREE_RESOURCE_CAPTURE_COOKIE, normalizedEmail, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: FREE_RESOURCE_CAPTURE_COOKIE_MAX_AGE_SECONDS,
    });
  }
  return response;
}

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

// ── Assessment payload (full) ────────────────────────────────────────────────

type AssessmentPayload = {
  kind: 'assessment';
  email: string;
  score: number;
  tier: string;
  tierLabel: string;
  answers: number[];
  version?: 'v1' | 'v2' | 'v3';
  maxScore?: number;
  dimensionBreakdown?: DimensionBreakdown;
  firstName?: string;
  institutionName?: string;
  role?: FreeRole;
  marketingOptIn?: boolean;
  lead_source?: string;
  requested_artifact?: string;
};

// ── Research-library payload (email-only) ─────────────────────────────────

type ResearchPayload = {
  kind: 'research';
  email: string;
  lead_source: string;
  requested_artifact?: string;
};

type ValidatedPayload = AssessmentPayload | ResearchPayload;

function parsePayload(p: CapturePayload): ValidatedPayload | null {
  if (typeof p.email !== 'string' || !EMAIL_RE.test(p.email)) return null;

  // Shared optional-field validation for both paths.
  if (p.lead_source !== undefined && (typeof p.lead_source !== 'string' || p.lead_source.length > LEAD_SOURCE_MAX_LEN)) return null;
  if (p.requested_artifact !== undefined && (typeof p.requested_artifact !== 'string' || p.requested_artifact.length > ARTIFACT_MAX_LEN)) return null;

  // If score is absent this is a research-library call — much lighter shape.
  if (p.score === undefined) {
    // lead_source is required for the research path so the route can log intent.
    if (typeof p.lead_source !== 'string' || p.lead_source.length === 0) return null;
    return {
      kind: 'research',
      email: p.email,
      lead_source: p.lead_source,
      ...(typeof p.requested_artifact === 'string' && p.requested_artifact.length > 0
        ? { requested_artifact: p.requested_artifact }
        : {}),
    };
  }

  // Assessment path — full validation unchanged from the original.
  if (typeof p.score !== 'number') return null;
  if (typeof p.tier !== 'string' || p.tier.length === 0) return null;
  if (typeof p.tierLabel !== 'string' || p.tierLabel.length === 0) return null;
  if (!Array.isArray(p.answers)) return null;
  // v1 has 8 questions, v2 has 12. Reject any other shape.
  if (p.answers.length !== 8 && p.answers.length !== 12) return null;
  if (!p.answers.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 4)) return null;
  // Score must equal the sum of answers so an attacker can't persist an
  // inconsistent score that later crashes getTierV2() / getTier().
  const expectedSum = (p.answers as number[]).reduce((acc, n) => acc + n, 0);
  if (p.score !== expectedSum) return null;
  if (p.version !== undefined && p.version !== 'v1' && p.version !== 'v2' && p.version !== 'v3') return null;
  if (p.maxScore !== undefined && (typeof p.maxScore !== 'number' || p.maxScore < 8 || p.maxScore > 48)) return null;
  if (p.dimensionBreakdown !== undefined && !isDimensionBreakdown(p.dimensionBreakdown)) return null;
  // Optional profile fields — bounded length so an attacker can't dump megabytes.
  if (p.firstName !== undefined && (typeof p.firstName !== 'string' || p.firstName.length > NAME_MAX_LEN)) return null;
  if (p.institutionName !== undefined && (typeof p.institutionName !== 'string' || p.institutionName.length > INSTITUTION_MAX_LEN)) return null;
  if (p.marketingOptIn !== undefined && typeof p.marketingOptIn !== 'boolean') return null;
  // Role is optional; reject when present but not in the free-funnel taxonomy
  // so silently-bad clients show up as 400s rather than dropping the value.
  const parsedRole = p.role === undefined ? undefined : parseFreeRole(p.role);
  if (p.role !== undefined && parsedRole === null) return null;

  return {
    kind: 'assessment',
    email: p.email,
    score: p.score,
    tier: p.tier,
    tierLabel: p.tierLabel,
    answers: p.answers as number[],
    ...(p.version !== undefined ? { version: p.version as 'v1' | 'v2' | 'v3' } : {}),
    ...(p.maxScore !== undefined ? { maxScore: p.maxScore as number } : {}),
    ...(p.dimensionBreakdown !== undefined ? { dimensionBreakdown: p.dimensionBreakdown as DimensionBreakdown } : {}),
    ...(typeof p.firstName === 'string' ? { firstName: p.firstName } : {}),
    ...(typeof p.institutionName === 'string' ? { institutionName: p.institutionName } : {}),
    ...(parsedRole ? { role: parsedRole } : {}),
    ...(typeof p.marketingOptIn === 'boolean' ? { marketingOptIn: p.marketingOptIn } : {}),
    ...(typeof p.lead_source === 'string' ? { lead_source: p.lead_source } : {}),
    ...(typeof p.requested_artifact === 'string' ? { requested_artifact: p.requested_artifact } : {}),
  };
}

export async function POST(request: Request) {
  let body: CapturePayload;
  try {
    body = (await request.json()) as CapturePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = parsePayload(body);
  if (!parsed) {
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

  // ── Research-library path: email-only capture, no assessment data ──────────
  // Subscribes to the assessment MailerLite group for nurture, then returns.
  // No Supabase profile upsert, no Resend breakdown — just list membership.
  if (parsed.kind === 'research') {
    const { email: researchEmail, lead_source, requested_artifact } = parsed;
    console.log(
      `[capture-email] research-library gate email=${researchEmail} artifact=${requested_artifact ?? 'none'}`,
    );
    if (process.env.SKIP_MAILERLITE !== 'true') {
      await subscribeToAssessmentForm({
        email: researchEmail,
        fields: { lead_source, ...(requested_artifact ? { requested_artifact } : {}) },
      }).catch((err) => console.warn('[capture-email] mailerlite research skip', err));
    }
    return captureResponse({ ok: true }, researchEmail);
  }

  // ── Assessment path (existing logic below, unchanged) ─────────────────────

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
    role,
    marketingOptIn,
  } = parsed;

  const completedAt = new Date().toISOString();
  const trimmedFirstName = firstName?.trim() || undefined;
  const trimmedInstitution = institutionName?.trim() || undefined;

  // MailerLite fires only when the user explicitly opted in to marketing.
  // Without consent the email is treated as transactional only — assessment
  // results, no nurture sequence.
  if (marketingOptIn === true) {
    await subscribeToAssessmentForm({
      email,
      fields: {
        tier,
        ...(role ? { role } : {}),
        ...(trimmedInstitution ? { institution: trimmedInstitution } : {}),
      },
      ...(trimmedFirstName ? { firstName: trimmedFirstName } : {}),
    }).catch((err) => console.warn('[capture-email] mailerlite skip', err));
  }

  // Provision a Supabase Auth account for this email (idempotent), then
  // generate a one-click magic link so the inline report + Resend email
  // can surface a "View your dashboard" CTA. #303 — previously fire-and-
  // forget; now awaited so the URL can be plumbed downstream. Best-effort:
  // a Supabase failure must not block the response — the report still
  // renders, and the email template falls back to /auth/login.
  let magicLinkUrl: string | null = null;
  try {
    const authResult = await ensureAuthUser(email);
    if (authResult.userId) {
      magicLinkUrl = await generateMagicLink(email, '/dashboard');
    }
  } catch (err) {
    console.warn('[capture-email] auth-admin skip', err);
  }

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
  // The id used for the email link + tagging (always the real row, even when
  // the client should render inline instead of routing to it).
  let emailLinkId: string | null = null;
  if (isSupabaseConfigured()) {
    const result = await upsertReadinessResult(
      email,
      {
        score,
        tierId: tier,
        tierLabel,
        answers,
        completedAt,
        ...(version ? { version } : {}),
        ...(maxScore !== undefined ? { maxScore } : {}),
        ...(dimensionBreakdown ? { dimensionBreakdown } : {}),
      },
      // Persist the un-collapsed free role directly (migration 00040 widened
      // the role CHECK to accept the full union), so the results view can
      // resolve the exact role → playbook without a lossy v2 collapse.
      role ? { role } : {},
    ).catch((err) => {
      console.warn('[capture-email] supabase skip', err);
      return { id: null as string | null, paidPrimary: false };
    });
    emailLinkId = result.id;
    // A free (v3) retake on an email that already has a paid (v4) report keeps
    // the paid report as the canonical row (paidPrimary). Don't hand the client
    // that row id — so the take flow renders the fresh free result inline
    // instead of redirecting to the paid /100 report. The email + tag still use
    // the real row id above.
    profileId = result.paidPrimary ? null : result.id;
  }

  // MailerLite tier-routing. Honors the marketingOptIn flag from the client
  // (always true post-newsletter-retirement; field kept for back-compat).
  // Retake re-route: if the prior tier differs, remove its group first so
  // the user lands cleanly in the new tier's automation.
  const VALID_TIERS: ReadonlySet<string> = new Set([
    'starting-point',
    'early-stage',
    'building-momentum',
    'ready-to-scale',
  ]);
  let mailerliteTagged = false;
  if (marketingOptIn === true && VALID_TIERS.has(tier)) {
    const newTier = tier as TierId;

    if (priorTierId && priorTierId !== newTier && VALID_TIERS.has(priorTierId)) {
      const removed = await removeAssessmentTier({
        email,
        tierId: priorTierId as TierId,
      });
      if (removed.status === 'failed') {
        console.warn(
          '[capture-email] mailerlite retake un-group failed:',
          removed.reason,
        );
      }
    }

    // Compute lowest-scoring dimension once — used both as a MailerLite
    // field (for tier-email merge tags) and downstream by Resend.
    const lowestDimensionId = dimensionBreakdown
      ? Object.entries(dimensionBreakdown)
          .map(([id, d]) => ({ id, pct: d.maxScore > 0 ? d.score / d.maxScore : 0 }))
          .sort((a, b) => a.pct - b.pct)[0]?.id
      : undefined;

    const added = await tagAssessmentTier({
      email,
      tierId: newTier,
      ...(trimmedFirstName ? { firstName: trimmedFirstName } : {}),
      ...(profileId ? { profileId } : {}),
      score,
      tierLabel,
      ...(lowestDimensionId ? { lowestDimension: lowestDimensionId } : {}),
    });

    if (added.status === 'tagged') {
      mailerliteTagged = true;
      if (emailLinkId) {
        await markConvertKitTagged(emailLinkId);
      }
    } else if (added.status === 'failed') {
      console.warn('[capture-email] mailerlite tier add failed:', added.reason);
    }
  }

  // Send the breakdown email via Resend (best-effort, non-blocking).
  // Wrapped in try/catch so any synchronous throw before the call cannot
  // kill the route. Logs are loud so any failure shows up in Vercel logs.
  console.log(
    `[capture-email] reached email gate version=${version ?? 'unset'} hasBreakdown=${Boolean(dimensionBreakdown)}`,
  );
  if ((version === 'v2' || version === 'v3') && dimensionBreakdown) {
    try {
      const tierData = getTierV2(score);
      const lowest = Object.entries(dimensionBreakdown)
        .map(([id, d]) => ({ id, pct: d.maxScore > 0 ? d.score / d.maxScore : 0 }))
        .sort((a, b) => a.pct - b.pct)[0];
      const artifact = lowest ? getStarterArtifact(lowest.id as Dimension) : null;

      console.log(`[capture-email] firing sendAssessmentBreakdown to=${email} profileId=${profileId ?? 'null'}`);
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
        profileId: emailLinkId,
        ...(magicLinkUrl ? { magicLinkUrl } : {}),
      }).catch((err) => console.warn('[capture-email] resend skip', err));
    } catch (err) {
      console.error('[capture-email] email-prep threw:', err);
    }
  } else {
    console.log('[capture-email] email-send guard rejected — not sending');
  }

  return captureResponse({
    ok: true,
    profileId,
    mailerliteTagAdded: mailerliteTagged,
    magicLinkUrl,
  }, email);
}
