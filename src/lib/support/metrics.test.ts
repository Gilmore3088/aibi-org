import { describe, expect, it } from 'vitest';
import { calculateSupportMetrics, median } from './metrics';

describe('support metrics', () => {
  it('calculates medians', () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([10, 2])).toBe(6);
  });

  it('aggregates queue, refund, ops, and launch metrics', () => {
    const metrics = calculateSupportMetrics({
      range: '30d',
      startIso: '2026-05-23T00:00:00.000Z',
      nowIso: '2026-06-22T12:00:00.000Z',
      cases: [
        {
          id: 'case-1',
          buyer_email: 'buyer@example.com',
          category: 'refund_request',
          status: 'new',
          priority: 'high',
          created_at: '2026-06-21T12:00:00.000Z',
          first_response_at: null,
          resolved_at: null,
        },
        {
          id: 'case-2',
          buyer_email: 'buyer@example.com',
          category: 'email_failure',
          status: 'resolved',
          priority: 'normal',
          created_at: '2026-06-20T12:00:00.000Z',
          first_response_at: '2026-06-20T14:00:00.000Z',
          resolved_at: '2026-06-20T18:00:00.000Z',
        },
      ],
      events: [
        { case_id: 'case-1', event_type: 'access_rescue_sent', created_at: '2026-06-20T15:00:00.000Z' },
        { case_id: 'case-1', event_type: 'refund_approved', created_at: '2026-06-21T15:00:00.000Z' },
      ],
      paidEnrollments: 8,
      paidEnrollmentsInRange: 8,
      activeEntitlements: 7,
      certificatesIssued: 2,
      teamCohortsCreated: 2,
      activeTeamCohorts: 2,
    });

    expect(metrics.queue.openCases).toBe(1);
    expect(metrics.queue.medianFirstResponseHours).toBe(2);
    expect(metrics.refundRequests).toMatchObject({ total: 1, pending: 1, approved: 1 });
    expect(metrics.opsHealth.emailFailures).toBe(1);
    expect(metrics.opsHealth.accessRescuesSent).toBe(1);
    expect(metrics.launchHealth.supportCasesPer10PaidPurchases).toBe(2);
  });
});
