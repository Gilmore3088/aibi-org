import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/playbooks/[role]/[asset]/word', () => {
  it('returns the BSA/AML SAR Narrative Scaffold as a Word-compatible document', async () => {
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
    expect(body).toContain('The BSA/AML SAR Narrative Scaffold');
    expect(body).toContain('BSA/AML analysts and officers');
    expect(body).toContain('Do not enter real SAR narratives');
    expect(body).toContain('who, what, when, where, why, and how');
    expect(body).toContain('6. How the activity operated');
    expect(body).toContain('Source evidence used');
    expect(body).toContain('Reviewer sign-off');
    expect(body).toContain('FinCEN SAR Narrative Guidance Package');
    expect(body).toContain('FFIEC BSA/AML Manual - SAR Quality Guidance');
    expect(body).toContain('31 CFR 1020.320');
    expect(body).not.toContain('directionally accurate');
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
