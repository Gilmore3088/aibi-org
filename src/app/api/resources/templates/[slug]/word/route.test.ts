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
    expect(body).toContain('SR 26-2 - Revised Guidance on Model Risk Management');
    expect(body).toContain('Financial Services AI Risk Management Framework');
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
    expect(body).toContain('Human review &amp; model-risk discipline');
  });

  it('renders the AI workflow SOP with current controls and model-risk framing', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/ai-workflow-sop/word'),
      contextFor('ai-workflow-sop'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('Ai-Workflow-Sop.doc');

    const body = await response.text();
    expect(body).toContain('The Bank AI Workflow SOP Template');
    expect(body).toContain('Part 1: blank AI workflow SOP template');
    expect(body).toContain('Workflow ID');
    expect(body).toContain('Human review, decision controls, and model-risk considerations');
    expect(body).toContain('OCC Bulletin 2026-13');
    expect(body).toContain('Generative AI workflows used for drafting, summarization, or workflow support');
    expect(body).toContain('commercial credit workflow; ECOA / Regulation B and fair-lending considerations still apply');
    expect(body).toContain('AI-generated adverse-action language may not be used');
    expect(body).toContain('Financial Services AI Risk Management Framework');
    expect(body).not.toContain('Human review &amp; model risk (SR 11-7)');
    expect(body).not.toContain('Commercial credit only; no consumer/ECOA-covered lending');
    expect(body).not.toContain('Adopt verbatim');
  });

  it('renders the AI use-case inventory as a fillable register template', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/ai-use-case-inventory/word'),
      contextFor('ai-use-case-inventory'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('Ai-Use-Case-Inventory.doc');

    const body = await response.text();
    expect(body).toContain('The Bank AI Use-Case Inventory Template');
    expect(body).toContain('<table>');
    expect(body).toContain('Use Case ID');
    expect(body).toContain('Vendor Review Link');
    expect(body).toContain('Planning rationale');
    expect(body).toContain('Red/Blocked');
    expect(body).toContain('SR 26-2 where applicable');
    expect(body).toContain('Financial Services AI Risk Management Framework');
  });

  it('renders the board briefing checklist with current model-risk framing', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/templates/board-briefing-checklist/word'),
      contextFor('board-briefing-checklist'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('Board-Briefing-Checklist.doc');

    const body = await response.text();
    expect(body).toContain('The AI Board Briefing Checklist');
    expect(body).toContain('Before the briefing: four facts');
    expect(body).toContain('[ ] Readiness baseline');
    expect(body).toContain('OCC Bulletin 2026-13');
    expect(body).toContain('not be used to make, explain, or rubber-stamp credit or adverse-action decisions');
    expect(body).toContain('Financial Services AI Risk Management Framework');
    expect(body).not.toContain('Most institutions our size still have no AI governance framework');
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
    expect(body).toContain('Fair-lending and access guardrails (ECOA / Regulation B)');
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
