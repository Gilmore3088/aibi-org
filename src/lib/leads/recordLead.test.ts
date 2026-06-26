import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  subscribeToGroup: vi.fn(),
  createServiceRoleClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('@/lib/mailerlite', () => ({
  subscribeToGroup: mocks.subscribeToGroup,
}));

vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

import { recordLead } from './recordLead';

function lastUpsertRow(): Record<string, unknown> {
  return mocks.upsert.mock.calls.at(-1)?.[0] as Record<string, unknown>;
}

describe('recordLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.upsert.mockResolvedValue({ error: null });
    mocks.createServiceRoleClient.mockReturnValue({ from: () => ({ upsert: mocks.upsert }) });
    mocks.subscribeToGroup.mockResolvedValue({ status: 'subscribed', subscriberId: 'sub_123' });
    vi.stubEnv('MAILERLITE_GROUP_ID_RESOURCES', 'grp_res');
    vi.stubEnv('MAILERLITE_GROUP_ID_ASSESSMENT', 'grp_assess');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('syncs a resource-gate lead to the resources group with DEFINED fields and persists', async () => {
    const result = await recordLead({
      email: 'WKeels@SafeFed.org',
      source: 'resource-gate',
      requestedArtifact: 'AI Use Policy Starter',
      leadSource: 'resources-library',
    });

    // MailerLite: resources group, defined fields only, lowercased email.
    expect(mocks.subscribeToGroup).toHaveBeenCalledWith(
      {
        email: 'wkeels@safefed.org',
        fields: {
          lead_source_path: 'resource-gate',
          lead_source: 'resources-library',
          requested_artifact: 'AI Use Policy Starter',
        },
      },
      'grp_res',
    );
    // Supabase: canonical row written with sync recorded.
    const row = lastUpsertRow();
    expect(row).toMatchObject({
      email: 'wkeels@safefed.org',
      source: 'resource-gate',
      requested_artifact: 'AI Use Policy Starter',
      mailerlite_synced: true,
      mailerlite_subscriber_id: 'sub_123',
    });
    expect(result).toEqual({ persisted: true, mailerlite: 'subscribed', subscriberId: 'sub_123' });
  });

  it('routes assessment leads to the assessment group', async () => {
    await recordLead({ email: 'a@b.com', source: 'assessment' });
    expect(mocks.subscribeToGroup).toHaveBeenCalledWith(expect.anything(), 'grp_assess');
  });

  it('opt-out: records the lead but does NOT subscribe to nurture', async () => {
    const result = await recordLead({ email: 'a@b.com', source: 'resource-gate', marketingOptIn: false });
    expect(mocks.subscribeToGroup).not.toHaveBeenCalled();
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    expect(lastUpsertRow().mailerlite_synced).toBeUndefined();
    expect(result.persisted).toBe(true);
    expect(result.mailerlite).toBe('skipped');
  });

  it('still persists when MailerLite fails, and does not flag synced', async () => {
    mocks.subscribeToGroup.mockResolvedValue({ status: 'failed', reason: '500' });
    const result = await recordLead({ email: 'a@b.com', source: 'resource-gate' });
    expect(result).toEqual({ persisted: true, mailerlite: 'failed' });
    expect(lastUpsertRow().mailerlite_synced).toBeUndefined();
  });

  it('omits null/absent fields so a later capture cannot clobber existing data', async () => {
    await recordLead({ email: 'a@b.com', source: 'resource-gate', requestedArtifact: 'X' });
    const row = lastUpsertRow();
    expect(row).not.toHaveProperty('role');
    expect(row).not.toHaveProperty('institution');
    expect(row).not.toHaveProperty('lead_source');
    expect(row).toHaveProperty('requested_artifact', 'X');
  });
});
