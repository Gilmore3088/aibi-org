import { describe, expect, it } from 'vitest';
import { GET } from './route';

function contextFor(slug: string) {
  return {
    params: Promise.resolve({ slug }),
  };
}

describe('/api/resources/templates/[slug]/word', () => {
  it('returns a branded editable template document with source basis', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/ai-use-policy-starter/word'),
      contextFor('ai-use-policy-starter'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/msword');
    expect(response.headers.get('content-disposition')).toContain('Ai-Use-Policy-Starter.doc');

    const body = await response.text();
    expect(body).toContain('[</span>A<span class="serif-i">i</span><span class="bracket">]</span> Banking Institute');
    expect(body).toContain('Editable starter template');
    expect(body).toContain('Document status:');
    expect(body).toContain('Source basis');
    expect(body).toContain('Interagency Guidance on Third-Party Relationships');
    expect(body).toContain('Adapt it to your institution');
  });

  it('renders structured template sections into editable document content', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/ai-use-policy-starter/word'),
      contextFor('ai-use-policy-starter'),
    );

    const body = await response.text();
    expect(body).toContain('<h2>Data classification &amp; permitted inputs</h2>');
    expect(body).toContain('Public (rate sheets, published marketing copy');
    expect(body).toContain('Human review &amp; model risk (SR 11-7)');
  });

  it('returns the CDFI Grant AI Evidence Checklist as a Word-compatible document', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/cdfi-grant-ai-evidence-checklist/word'),
      contextFor('cdfi-grant-ai-evidence-checklist'),
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/msword');
    expect(response.headers.get('content-disposition')).toContain(
      'Cdfi-Grant-Ai-Evidence-Checklist.doc',
    );
    expect(body).toContain('CDFI Grant AI Evidence Checklist');
    expect(body).toContain('CDFI, MDI, community development, grants, and impact teams');
    expect(body).toContain('Fairness and mission check');
  });

  it('returns 404 for unknown template slugs', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/missing/word'),
      contextFor('missing'),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Template not found.' });
  });
});
