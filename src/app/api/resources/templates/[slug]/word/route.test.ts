import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/resources/templates/[slug]/word', () => {
  it('returns the AI Use Policy Starter as a Word-compatible document', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/ai-use-policy-starter/word'),
      { params: Promise.resolve({ slug: 'ai-use-policy-starter' }) },
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/msword');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Ai-Use-Policy-Starter.doc"',
    );
    expect(body).toContain('AI Use Policy Starter');
    expect(body).toContain('Compliance, risk, and senior management');
    expect(body).toContain('Allowed tools');
    expect(body).toContain('Adapt before adoption');
  });

  it('returns the CDFI Grant AI Evidence Checklist as a Word-compatible document', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/cdfi-grant-ai-evidence-checklist/word'),
      { params: Promise.resolve({ slug: 'cdfi-grant-ai-evidence-checklist' }) },
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/msword');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Cdfi-Grant-Ai-Evidence-Checklist.doc"',
    );
    expect(body).toContain('CDFI Grant AI Evidence Checklist');
    expect(body).toContain('CDFI, MDI, community development, grants, and impact teams');
    expect(body).toContain('Fairness and mission check');
  });

  it('returns 404 for an unknown template', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/unknown/word'),
      { params: Promise.resolve({ slug: 'unknown' }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Template not found.' });
  });
});
