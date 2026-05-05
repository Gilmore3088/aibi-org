import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let originalApiKey: string | undefined;
let originalSkip: string | undefined;

beforeEach(() => {
  originalApiKey = process.env.RESEND_API_KEY;
  originalSkip = process.env.SKIP_RESEND;
  process.env.RESEND_API_KEY = 'test_re_key_xxx';
  delete process.env.SKIP_RESEND;
});

afterEach(() => {
  process.env.RESEND_API_KEY = originalApiKey;
  if (originalSkip === undefined) {
    delete process.env.SKIP_RESEND;
  } else {
    process.env.SKIP_RESEND = originalSkip;
  }
  vi.restoreAllMocks();
});

describe('In-Depth Resend templates', () => {
  it('sendIndepthIndividualInvite skips when no API key', async () => {
    delete process.env.RESEND_API_KEY;
    const { sendIndepthIndividualInvite } = await import('.');
    const res = await sendIndepthIndividualInvite({
      email: 'buyer@bank.test',
      takeUrl: 'https://aibankinginstitute.com/assessment/in-depth/take?token=abc',
    });
    expect(res).toMatchObject({ skipped: true });
  });

  it('sendIndepthIndividualInvite POSTs the take URL in the body', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'em_test_1' }), { status: 200 })
    );
    const { sendIndepthIndividualInvite } = await import('.');
    await sendIndepthIndividualInvite({
      email: 'buyer@bank.test',
      takeUrl: 'https://example.test/take?token=xyz',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.html).toContain('https://example.test/take?token=xyz');
    expect(body.to).toContain('buyer@bank.test');
  });

  it('sendIndepthInstitutionInvite includes leader name + institution name in HTML', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'em_test_2' }), { status: 200 })
    );
    const { sendIndepthInstitutionInvite } = await import('.');
    await sendIndepthInstitutionInvite({
      inviteeEmail: 'staff@bank.test',
      leaderName: 'Jane Smith',
      institutionName: 'First Community Bank',
      takeUrl: 'https://example.test/take?token=xyz',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.html).toContain('Jane Smith');
    expect(body.html).toContain('First Community Bank');
    expect(body.html).toContain('https://example.test/take?token=xyz');
    expect(body.subject).toContain('Jane Smith');
  });

  it('sendIndepthIndividualResults includes results URL and tier label', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'em_test_3' }), { status: 200 })
    );
    const { sendIndepthIndividualResults } = await import('.');
    await sendIndepthIndividualResults({
      email: 'taker@bank.test',
      resultsUrl: 'https://example.test/results/in-depth/123',
      score: 36,
      tierLabel: 'Building Momentum',
    });
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.html).toContain('https://example.test/results/in-depth/123');
    expect(body.html).toContain('Building Momentum');
    expect(body.html).toContain('36');
  });
});
