import { afterEach, describe, expect, it, vi } from 'vitest';
import { isCronAuthorized, assertCronAuth } from './cron-auth';

function req(auth?: string): Request {
  return new Request('https://x/api/cron', {
    headers: auth ? { authorization: auth } : {},
  });
}

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.SKIP_CRON_AUTH;
  vi.unstubAllEnvs();
});

describe('cron auth', () => {
  it('authorizes a matching Bearer token', () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    expect(isCronAuthorized(req('Bearer s3cret'))).toBe(true);
    expect(assertCronAuth(req('Bearer s3cret'))).toBeNull();
  });
  it('fails closed when the secret is unset (empty Bearer must not pass)', () => {
    vi.stubEnv('CRON_SECRET', '');
    expect(isCronAuthorized(req('Bearer '))).toBe(false);
    expect(isCronAuthorized(req())).toBe(false);
    expect(assertCronAuth(req('Bearer '))?.status).toBe(401);
  });
  it('rejects a wrong token', () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    expect(isCronAuthorized(req('Bearer nope'))).toBe(false);
  });
  it('honors the dev SKIP bypass', () => {
    vi.stubEnv('SKIP_CRON_AUTH', 'true');
    expect(isCronAuthorized(req())).toBe(true);
  });
});
