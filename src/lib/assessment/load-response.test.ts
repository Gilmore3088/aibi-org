import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client BEFORE importing the SUT so the SUT picks up the mock.
vi.mock('@/lib/supabase/client', () => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const client = { from };
  return {
    createServiceRoleClient: vi.fn(() => client),
    isSupabaseConfigured: vi.fn(() => true),
    __mock: { maybeSingle, eq, select, from },
  };
});

import { loadAssessmentResponse } from './load-response';
import * as supabaseClient from '@/lib/supabase/client';

const mock = (supabaseClient as unknown as {
  __mock: { maybeSingle: ReturnType<typeof vi.fn> };
}).__mock;

const VALID_UUID = '12345678-1234-1234-1234-123456789012';

const VALID_BREAKDOWN = {
  'current-ai-usage': { score: 6, maxScore: 8, label: 'Current AI Usage' },
  'experimentation-culture': { score: 5, maxScore: 8, label: 'Experimentation Culture' },
  'ai-literacy-level': { score: 4, maxScore: 8, label: 'AI Literacy Level' },
  'quick-win-potential': { score: 3, maxScore: 8, label: 'Quick Win Potential' },
  'leadership-buy-in': { score: 4, maxScore: 8, label: 'Leadership Buy-In' },
  'security-posture': { score: 5, maxScore: 8, label: 'Security Posture' },
  'training-infrastructure': { score: 3, maxScore: 8, label: 'Training Infrastructure' },
  'builder-potential': { score: 4, maxScore: 8, label: 'Builder Potential' },
};

function validRow(overrides: Record<string, unknown> = {}) {
  return {
    id: VALID_UUID,
    email: 'banker@example.com',
    readiness_score: 34,
    readiness_max_score: 48,
    readiness_tier_id: 'building-momentum',
    readiness_dimension_breakdown: VALID_BREAKDOWN,
    readiness_at: '2026-05-04T12:00:00.000Z',
    ...overrides,
  };
}

describe('loadAssessmentResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseClient.isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('returns null when Supabase is not configured', async () => {
    (supabaseClient.isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
    expect(mock.maybeSingle).not.toHaveBeenCalled();
  });

  it('returns null for non-UUID id (defense against route param injection)', async () => {
    const result = await loadAssessmentResponse('not-a-uuid');
    expect(result).toBeNull();
    expect(mock.maybeSingle).not.toHaveBeenCalled();
  });

  it('returns null when row does not exist', async () => {
    mock.maybeSingle.mockResolvedValue({ data: null, error: null });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
  });

  it('returns null when DB returns error', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'connection refused' },
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
  });

  it('returns null when readiness_tier_id is missing (incomplete assessment)', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: validRow({ readiness_tier_id: null }),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
  });

  it('returns null when readiness_score is missing', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: validRow({ readiness_score: null }),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
  });

  it('returns null when readiness_dimension_breakdown is missing', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: validRow({ readiness_dimension_breakdown: null }),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).toBeNull();
  });

  it('returns shaped object on a complete row', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: validRow(),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result).not.toBeNull();
    expect(result?.profileId).toBe(VALID_UUID);
    expect(result?.email).toBe('banker@example.com');
    expect(result?.score).toBe(34);
    expect(result?.maxScore).toBe(48);
    expect(result?.tierId).toBe('building-momentum');
    expect(result?.tier.id).toBe('building-momentum');
    expect(result?.dimensionBreakdown['current-ai-usage'].score).toBe(6);
    expect(result?.readinessAt).toBe('2026-05-04T12:00:00.000Z');
  });

  it('recomputes tier from score (not from stored tier_id)', async () => {
    // Score 34 is in 'building-momentum' (33-40), so getTierV2 should
    // produce that even though we stored a different tier_id (defensive).
    mock.maybeSingle.mockResolvedValue({
      data: validRow({ readiness_tier_id: 'building-momentum', readiness_score: 34 }),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result?.tier.id).toBe('building-momentum');
    expect(result?.tier.label).toBe('Building Momentum');
  });

  it('falls back to default maxScore when row has null', async () => {
    mock.maybeSingle.mockResolvedValue({
      data: validRow({ readiness_max_score: null }),
      error: null,
    });
    const result = await loadAssessmentResponse(VALID_UUID);
    expect(result?.maxScore).toBe(48);
  });
});
