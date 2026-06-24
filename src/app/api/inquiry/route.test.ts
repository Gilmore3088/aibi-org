import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendInquiryAck: vi.fn(),
  sendInquiryNotification: vi.fn(),
  ensureAuthUser: vi.fn(),
  rateLimitOrFail: vi.fn(),
  getRequestIp: vi.fn(),
  subscribeToPlaybookForm: vi.fn(),
  createSupportCase: vi.fn(),
}));

vi.mock('@/lib/resend', () => ({
  sendInquiryAck: mocks.sendInquiryAck,
  sendInquiryNotification: mocks.sendInquiryNotification,
}));

vi.mock('@/lib/supabase/auth-admin', () => ({
  ensureAuthUser: mocks.ensureAuthUser,
}));

vi.mock('@/lib/api/rate-limit', () => ({
  rateLimitOrFail: mocks.rateLimitOrFail,
  getRequestIp: mocks.getRequestIp,
}));

vi.mock('@/lib/mailerlite', () => ({
  subscribeToPlaybookForm: mocks.subscribeToPlaybookForm,
}));

vi.mock('@/lib/support/cases', () => ({
  createSupportCase: mocks.createSupportCase,
}));

vi.mock('@/lib/support/admin', () => ({
  getSupportInboxEmail: () => 'hello@aibankinginstitute.com',
}));

import { POST } from './route';

function request(body: unknown): Request {
  return new Request('https://www.aibankinginstitute.com/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': '203.0.113.20' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/inquiry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimitOrFail.mockResolvedValue(null);
    mocks.getRequestIp.mockReturnValue('203.0.113.20');
    mocks.ensureAuthUser.mockResolvedValue({ userId: 'user-123', created: false });
    mocks.sendInquiryAck.mockResolvedValue({ skipped: true, reason: 'test' });
    mocks.sendInquiryNotification.mockResolvedValue({ skipped: true, reason: 'test' });
    mocks.subscribeToPlaybookForm.mockResolvedValue(undefined);
    mocks.createSupportCase.mockResolvedValue({ id: 'case-123' });
  });

  it('captures team assessment inquiries into support cases and inbox notification', async () => {
    const response = await POST(request({
      name: 'Alex Rivera',
      email: 'alex@communitybank.test',
      institution: 'Community Bank',
      track: 'Team assessment',
      notes: 'We need 25 seats across compliance and operations.',
      type: 'team-assessment-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(mocks.rateLimitOrFail).toHaveBeenCalledWith({
      key: 'inquiry',
      scope: 'ip',
      identifier: '203.0.113.20',
      max: 5,
      windowSeconds: 3600,
    });
    expect(mocks.ensureAuthUser).toHaveBeenCalledWith('alex@communitybank.test');
    expect(mocks.sendInquiryAck).toHaveBeenCalledWith({
      email: 'alex@communitybank.test',
      name: 'Alex',
      institution: 'Community Bank',
      track: 'Team assessment',
    });
    expect(mocks.sendInquiryNotification).toHaveBeenCalledWith({
      to: 'hello@aibankinginstitute.com',
      name: 'Alex Rivera',
      email: 'alex@communitybank.test',
      institution: 'Community Bank',
      track: 'Team assessment',
      type: 'team-assessment-request',
      notes: 'We need 25 seats across compliance and operations.',
    });
    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'alex@communitybank.test',
      subject: 'Institution inquiry: Team assessment',
      category: 'team_seats',
      priority: 'high',
      source: 'buyer_form',
      product: 'team-assessment',
      actorType: 'customer',
      actorEmail: 'alex@communitybank.test',
      metadata: {
        inquiryType: 'team-assessment-request',
        track: 'Team assessment',
      },
    }));
    expect(mocks.subscribeToPlaybookForm).not.toHaveBeenCalled();
  });

  it('preserves commercial lending team context in the support case summary', async () => {
    const response = await POST(request({
      name: 'Casey Morgan',
      email: 'casey@creditunion.test',
      institution: 'Metro Credit Union',
      track: 'Team assessment',
      notes: 'Commercial lending team: 12 lenders, target Q3 rollout, manager wants cohort reporting.',
      type: 'team-assessment-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'casey@creditunion.test',
      subject: 'Institution inquiry: Team assessment',
      category: 'team_seats',
      priority: 'high',
      product: 'team-assessment',
      summary: expect.stringContaining(
        'Commercial lending team: 12 lenders, target Q3 rollout, manager wants cohort reporting.',
      ),
    }));
  });

  it('captures partner rollout inquiries for bankers banks and associations', async () => {
    const response = await POST(request({
      name: 'Morgan Patel',
      email: 'morgan@bankersbank.test',
      institution: 'Regional Bankers Bank',
      track: "Bankers' bank / association partner",
      notes: 'We want to offer readiness checks to 12 client banks.',
      type: 'partner-rollout-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(mocks.sendInquiryNotification).toHaveBeenCalledWith(expect.objectContaining({
      to: 'hello@aibankinginstitute.com',
      institution: 'Regional Bankers Bank',
      track: "Bankers' bank / association partner",
      type: 'partner-rollout-request',
      notes: 'We want to offer readiness checks to 12 client banks.',
    }));
    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'morgan@bankersbank.test',
      subject: "Institution inquiry: Bankers' bank / association partner",
      category: 'team_seats',
      priority: 'high',
      product: 'partner-rollout',
      metadata: {
        inquiryType: 'partner-rollout-request',
        track: "Bankers' bank / association partner",
      },
    }));
  });

  it('sets the free-resource capture cookie for Safe AI Guide requests', async () => {
    const response = await POST(request({
      name: 'Jordan Lee',
      email: 'Jordan@CommunityBank.test',
      institution: 'Community Bank',
      track: 'Safe AI Use Guide',
      notes: 'Requested via /security guide download.',
      type: 'guide-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.headers.get('set-cookie')).toContain(
      'aibi_free_resource_email=jordan%40communitybank.test',
    );
    expect(mocks.createSupportCase).not.toHaveBeenCalled();
  });

  it('captures L&D cohort pilot inquiries as high-priority team support cases', async () => {
    const response = await POST(request({
      name: 'Taylor Chen',
      email: 'taylor@creditunion.test',
      institution: 'Neighborhood Credit Union',
      track: 'Cohort pilot / L&D rollout',
      notes: 'We need a launch packet and manager handoff for 40 learners.',
      type: 'cohort-pilot-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(mocks.sendInquiryNotification).toHaveBeenCalledWith(expect.objectContaining({
      to: 'hello@aibankinginstitute.com',
      institution: 'Neighborhood Credit Union',
      track: 'Cohort pilot / L&D rollout',
      type: 'cohort-pilot-request',
      notes: 'We need a launch packet and manager handoff for 40 learners.',
    }));
    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'taylor@creditunion.test',
      subject: 'Institution inquiry: Cohort pilot / L&D rollout',
      category: 'team_seats',
      priority: 'high',
      product: 'cohort-pilot',
      metadata: {
        inquiryType: 'cohort-pilot-request',
        track: 'Cohort pilot / L&D rollout',
      },
    }));
  });

  it('captures PMO project plan inquiries with project-plan product metadata', async () => {
    const response = await POST(request({
      name: 'Jordan Miles',
      email: 'jordan@creditunion.test',
      institution: 'Metro Credit Union',
      track: 'PMO project plan',
      notes: 'We need a 90-day project plan, owners, milestones, and SLA.',
      type: 'project-plan-request',
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(mocks.sendInquiryNotification).toHaveBeenCalledWith(expect.objectContaining({
      to: 'hello@aibankinginstitute.com',
      institution: 'Metro Credit Union',
      track: 'PMO project plan',
      type: 'project-plan-request',
      notes: 'We need a 90-day project plan, owners, milestones, and SLA.',
    }));
    expect(mocks.createSupportCase).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'jordan@creditunion.test',
      subject: 'Institution inquiry: PMO project plan',
      category: 'team_seats',
      priority: 'high',
      product: 'project-plan',
      metadata: {
        inquiryType: 'project-plan-request',
        track: 'PMO project plan',
      },
    }));
  });

  it('rejects unknown inquiry types before sending or creating a case', async () => {
    const response = await POST(request({
      name: 'Alex Rivera',
      email: 'alex@communitybank.test',
      institution: 'Community Bank',
      track: 'Unknown',
      notes: '',
      type: 'unknown-type',
    }));

    expect(response.status).toBe(400);
    expect(mocks.sendInquiryAck).not.toHaveBeenCalled();
    expect(mocks.sendInquiryNotification).not.toHaveBeenCalled();
    expect(mocks.createSupportCase).not.toHaveBeenCalled();
  });
});
