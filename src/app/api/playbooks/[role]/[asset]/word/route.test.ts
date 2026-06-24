import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/playbooks/[role]/[asset]/word', () => {
  it('returns the SAR Narrative Template as a Word-compatible document', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/playbooks/bsa-aml/sar-narrative-template/word'),
      { params: Promise.resolve({ role: 'bsa-aml', asset: 'sar-narrative-template' }) },
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/msword');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="Bsa-Aml-Sar-Narrative-Template.doc"',
    );
    expect(body).toContain('SAR Narrative Template');
    expect(body).toContain('BSA / AML analysts and officers');
    expect(body).toContain('FinCEN five-element structure');
    expect(body).toContain('Adapt before adoption');
  });

  it('returns 404 when the asset does not belong to the requested role', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/playbooks/compliance/sar-narrative-template/word'),
      { params: Promise.resolve({ role: 'compliance', asset: 'sar-narrative-template' }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Playbook asset not found.' });
  });
});
