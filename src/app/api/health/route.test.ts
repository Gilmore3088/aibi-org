import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

// Env keys this report reads — cleared before each test so cases are isolated.
const KEYS = [
  'RESEND_API_KEY', 'SKIP_RESEND', 'RESEND_FROM',
  'MAILERLITE_API_KEY', 'MAILERLITE_GROUP_ID_ASSESSMENT', 'MAILERLITE_GROUP_ID_PLAYBOOK', 'SKIP_MAILERLITE',
  'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SKIP_SUPABASE_PROFILES',
  'STRIPE_SECRET_KEY', 'NEXT_PUBLIC_SITE_URL', 'VERCEL_ENV',
] as const;

async function readReport() {
  const res = await GET();
  return res.json();
}

describe('GET /api/health', () => {
  beforeEach(() => {
    for (const k of KEYS) vi.stubEnv(k, '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports every feature down and lists the missing env vars when nothing is configured', async () => {
    const body = await readReport();
    expect(body.ok).toBe(false);
    expect(body.features.emailDelivery).toBe(false);
    expect(body.features.leadCapture).toBe(false);
    expect(body.features.practiceDemo).toBe(false);
    expect(body.missing).toEqual(
      expect.arrayContaining([
        'RESEND_API_KEY',
        'MAILERLITE_API_KEY',
        'MAILERLITE_GROUP_ID_ASSESSMENT',
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_SITE_URL',
      ]),
    );
  });

  it('marks emailDelivery ready only when Resend is present AND not skipped', async () => {
    vi.stubEnv('RESEND_API_KEY', 'stub-present');
    expect((await readReport()).features.emailDelivery).toBe(true);

    vi.stubEnv('SKIP_RESEND', 'true');
    expect((await readReport()).features.emailDelivery).toBe(false);
  });

  it('marks practiceDemo ready only when the OpenAI key and Supabase client env are present', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'stub-present');
    expect((await readReport()).features.practiceDemo).toBe(false); // supabase still missing

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    expect((await readReport()).features.practiceDemo).toBe(true);
  });

  it('flags SKIP_* footguns as warnings in production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('SKIP_MAILERLITE', 'true');
    const body = await readReport();
    expect(body.warnings.join(' ')).toMatch(/SKIP_MAILERLITE/);
    expect(body.ok).toBe(false);
  });

  it('never leaks secret values — only booleans and non-secret identifiers', async () => {
    // Sentinel deliberately NOT shaped like a real key, so the repo secret
    // scanner doesn't flag the fixture; it still proves no env value is echoed.
    const CANARY = 'leak-canary-value';
    vi.stubEnv('RESEND_API_KEY', `resend-${CANARY}`);
    vi.stubEnv('OPENAI_API_KEY', `openai-${CANARY}`);
    vi.stubEnv('STRIPE_SECRET_KEY', `stripe-${CANARY}`);
    const text = JSON.stringify(await readReport());
    expect(text).not.toContain(CANARY);
  });
});
