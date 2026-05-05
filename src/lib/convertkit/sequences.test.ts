import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tagAssessmentTier, removeAssessmentTier } from './sequences';

describe('convertkit/sequences', () => {
  const ORIGINAL_ENV = { ...process.env };
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SKIP_CONVERTKIT;
    process.env.CONVERTKIT_API_KEY = 'test-key';
    process.env.CONVERTKIT_API_SECRET = 'test-secret';
    process.env.CONVERTKIT_TAG_ID_STARTING_POINT = '1001';
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscription: {} }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('skips when SKIP_CONVERTKIT=true', async () => {
    process.env.SKIP_CONVERTKIT = 'true';
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('staging-suppression');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when api key is missing', async () => {
    delete process.env.CONVERTKIT_API_KEY;
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-api-key');
  });

  it('skips when the tier tag id env var is missing', async () => {
    delete process.env.CONVERTKIT_TAG_ID_STARTING_POINT;
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-tag-id-for-starting-point');
  });

  it('posts to /tags/:id/subscribe with the api_key body', async () => {
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
      firstName: 'Sam',
    });
    expect(result.status).toBe('tagged');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/tags/1001/subscribe');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string);
    expect(body.api_key).toBe('test-key');
    expect(body.email).toBe('a@example.com');
    expect(body.first_name).toBe('Sam');
  });

  it('returns failed (not throws) on non-2xx response', async () => {
    fetchSpy.mockResolvedValue(new Response('rate limited', { status: 429 }));
    const result = await tagAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('failed');
    expect(result.reason).toBe('429');
  });

  it('removeAssessmentTier hits /tags/:id/unsubscribe', async () => {
    const result = await removeAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('tagged');
    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/tags/1001/unsubscribe');
  });

  it('removeAssessmentTier sends api_secret in body', async () => {
    await removeAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.api_secret).toBe('test-secret');
    expect(body.email).toBe('a@example.com');
  });

  it('removeAssessmentTier skips when api_secret is missing', async () => {
    delete process.env.CONVERTKIT_API_SECRET;
    const result = await removeAssessmentTier({
      email: 'a@example.com',
      tierId: 'starting-point',
    });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-api-secret');
  });
});
