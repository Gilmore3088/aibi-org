import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribeToAssessmentForm, subscribeToNewsletterForm } from './index';

describe('convertkit/forms (real adapter)', () => {
  const ORIGINAL_ENV = { ...process.env };
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SKIP_CONVERTKIT;
    process.env.CONVERTKIT_API_KEY = 'test-key';
    process.env.CONVERTKIT_ASSESSMENT_FORM_ID = '111';
    process.env.CONVERTKIT_NEWSLETTER_FORM_ID = '222';
    fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscription: {} }), { status: 200 }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    process.env = ORIGINAL_ENV;
  });

  it('subscribeToAssessmentForm posts to /forms/{id}/subscribe with tags', async () => {
    const result = await subscribeToAssessmentForm({
      email: 'a@example.com',
      firstName: 'Sam',
      tags: ['tier:building-momentum'],
    });
    expect(result.status).toBe('subscribed');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/forms/111/subscribe');
    const body = JSON.parse(init.body as string);
    expect(body.api_key).toBe('test-key');
    expect(body.email).toBe('a@example.com');
    expect(body.first_name).toBe('Sam');
    expect(body.tags).toEqual(['tier:building-momentum']);
  });

  it('subscribeToNewsletterForm posts to a different form id', async () => {
    await subscribeToNewsletterForm({ email: 'b@example.com' });
    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.convertkit.com/v3/forms/222/subscribe');
  });

  it('skips when SKIP_CONVERTKIT=true', async () => {
    process.env.SKIP_CONVERTKIT = 'true';
    const result = await subscribeToAssessmentForm({ email: 'a@example.com' });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('staging-suppression');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when api key is missing', async () => {
    delete process.env.CONVERTKIT_API_KEY;
    const result = await subscribeToAssessmentForm({ email: 'a@example.com' });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-api-key');
  });

  it('skips when form id is missing (assessment)', async () => {
    delete process.env.CONVERTKIT_ASSESSMENT_FORM_ID;
    const result = await subscribeToAssessmentForm({ email: 'a@example.com' });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-form-id');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skips when form id is missing (newsletter)', async () => {
    delete process.env.CONVERTKIT_NEWSLETTER_FORM_ID;
    const result = await subscribeToNewsletterForm({ email: 'b@example.com' });
    expect(result.status).toBe('skipped');
    expect(result.reason).toBe('no-form-id');
  });

  it('returns failed (not throws) on non-2xx', async () => {
    fetchSpy.mockResolvedValue(new Response('invalid email', { status: 422 }));
    const result = await subscribeToAssessmentForm({ email: 'bad' });
    expect(result.status).toBe('failed');
    expect(result.reason).toBe('422');
  });

  it('omits first_name and tags from body when not provided', async () => {
    await subscribeToAssessmentForm({ email: 'minimal@example.com' });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.first_name).toBeUndefined();
    expect(body.tags).toBeUndefined();
  });
});
