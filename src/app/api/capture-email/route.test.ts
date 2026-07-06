// Focused coverage for the optional asset-band field: a valid band merges
// into institution_context, an invalid band is silently dropped (never a
// 400 — a stale client must not block capture), and the score validation
// is untouched by the band either way.

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  subscribeToAssessmentForm: vi.fn(),
  recordLead: vi.fn(),
  upsertReadinessResult: vi.fn(),
  getReadinessTierByEmail: vi.fn(),
  markConvertKitTagged: vi.fn(),
  tagAssessmentTier: vi.fn(),
  removeAssessmentTier: vi.fn(),
  sendAssessmentBreakdown: vi.fn(),
  sendResourceDelivery: vi.fn(),
  ensureAuthUser: vi.fn(),
  generateMagicLink: vi.fn(),
  checkEmailCaptureLimit: vi.fn(),
  logEmailCapture: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));
vi.mock('@/lib/mailerlite', () => ({
  subscribeToAssessmentForm: mocks.subscribeToAssessmentForm,
}));
vi.mock('@/lib/leads/recordLead', () => ({
  recordLead: mocks.recordLead,
}));
vi.mock('@/lib/supabase/user-profiles', () => ({
  upsertReadinessResult: mocks.upsertReadinessResult,
  getReadinessTierByEmail: mocks.getReadinessTierByEmail,
  markConvertKitTagged: mocks.markConvertKitTagged,
}));
vi.mock('@/lib/mailerlite/sequences', () => ({
  tagAssessmentTier: mocks.tagAssessmentTier,
  removeAssessmentTier: mocks.removeAssessmentTier,
}));
vi.mock('@/lib/resend', () => ({
  sendAssessmentBreakdown: mocks.sendAssessmentBreakdown,
  sendResourceDelivery: mocks.sendResourceDelivery,
}));
vi.mock('@/lib/supabase/auth-admin', () => ({
  ensureAuthUser: mocks.ensureAuthUser,
  generateMagicLink: mocks.generateMagicLink,
}));
vi.mock('@/lib/email-capture/rate-limit', () => ({
  checkEmailCaptureLimit: mocks.checkEmailCaptureLimit,
  hashIp: () => 'hashed-ip',
  logEmailCapture: mocks.logEmailCapture,
}));

const ANSWERS = Array.from({ length: 12 }, () => 3);
const SCORE = ANSWERS.reduce((acc, n) => acc + n, 0);

function assessmentBody(overrides: Record<string, unknown> = {}) {
  return {
    email: 'ops@communitybank.com',
    score: SCORE,
    tier: 'building-momentum',
    tierLabel: 'Building Momentum',
    answers: ANSWERS,
    version: 'v3',
    maxScore: 48,
    ...overrides,
  };
}

function postRequest(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/capture-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function callRoute(body: unknown) {
  const { POST } = await import('./route');
  return POST(postRequest(body));
}

describe('POST /api/capture-email — asset band', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.checkEmailCaptureLimit.mockResolvedValue({ allowed: true });
    mocks.logEmailCapture.mockResolvedValue(undefined);
    mocks.getReadinessTierByEmail.mockResolvedValue(null);
    mocks.upsertReadinessResult.mockResolvedValue({ id: 'profile-1', paidPrimary: false });
    mocks.recordLead.mockResolvedValue(undefined);
    mocks.ensureAuthUser.mockResolvedValue({ userId: 'user-1' });
    mocks.generateMagicLink.mockResolvedValue(null);
    mocks.tagAssessmentTier.mockResolvedValue({ status: 'skipped' });
  });

  it('merges a valid asset band into institution_context', async () => {
    const response = await callRoute(assessmentBody({ assetBand: 'under-150m' }));

    expect(response.status).toBe(200);
    expect(mocks.upsertReadinessResult).toHaveBeenCalledWith(
      'ops@communitybank.com',
      expect.objectContaining({ score: SCORE }),
      expect.objectContaining({
        institutionContextPatch: { asset_band_free: 'under-150m' },
      }),
    );
  });

  it('drops an unknown asset band without failing the capture', async () => {
    const response = await callRoute(assessmentBody({ assetBand: 'trillion-club' }));

    expect(response.status).toBe(200);
    const options = mocks.upsertReadinessResult.mock.calls[0]?.[2] ?? {};
    expect(options).not.toHaveProperty('institutionContextPatch');
  });

  it('accepts an omitted asset band and never lets the band affect scoring', async () => {
    const withBand = await callRoute(assessmentBody({ assetBand: '150m-500m' }));
    expect(withBand.status).toBe(200);
    const resultWithBand = mocks.upsertReadinessResult.mock.calls[0]?.[1];

    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.checkEmailCaptureLimit.mockResolvedValue({ allowed: true });
    mocks.getReadinessTierByEmail.mockResolvedValue(null);
    mocks.upsertReadinessResult.mockResolvedValue({ id: 'profile-1', paidPrimary: false });
    mocks.ensureAuthUser.mockResolvedValue({ userId: 'user-1' });
    mocks.generateMagicLink.mockResolvedValue(null);

    const withoutBand = await callRoute(assessmentBody());
    expect(withoutBand.status).toBe(200);
    const resultWithoutBand = mocks.upsertReadinessResult.mock.calls[0]?.[1];

    // Identical persisted score/tier/answers regardless of the band
    // (completedAt is a wall-clock timestamp, so compare everything else).
    const { completedAt: _a, ...persistedWithBand } = resultWithBand as Record<string, unknown>;
    const { completedAt: _b, ...persistedWithoutBand } = resultWithoutBand as Record<string, unknown>;
    expect(persistedWithBand).toEqual(persistedWithoutBand);
  });
});
