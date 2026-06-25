import { describe, expect, it } from 'vitest';
import { GET } from './route';

function contextFor(slug: string) {
  return {
    params: Promise.resolve({ slug }),
  };
}

describe('/api/resources/[slug]/word', () => {
  it('returns a self-contained Word-compatible document for a source-backed resource', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/safe-ai-use-checklist/word'),
      contextFor('safe-ai-use-checklist'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/msword');
    expect(response.headers.get('content-disposition')).toContain('Safe-Ai-Use-Checklist.doc');

    const body = await response.text();
    expect(body).toContain('The Safe AI Use Checklist');
    expect(body).toContain('The AI Banking Institute');
    expect(body).toContain('<style>');
    expect(body).not.toContain('href="_brand.css"');
  });

  it('returns a Word-compatible document for a markdown-backed artifact promoted to source HTML', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/artifact-data-handling-reference-card/word'),
      contextFor('artifact-data-handling-reference-card'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/msword');

    const body = await response.text();
    expect(body).toContain('Data Handling Reference Card');
    expect(body).toContain('Before you paste anything');
  });

  it('returns the compliance playbook with current governance controls', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/compliance-playbook/word'),
      contextFor('compliance-playbook'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('Compliance-Playbook.doc');

    const body = await response.text();
    expect(body).toContain("The Compliance Officer's AI Governance Playbook");
    expect(body).toContain('Current model-risk guidance, including SR 26-2 where applicable');
    expect(body).toContain('AI may not select, infer, or invent principal reasons');
    expect(body).toContain('No SAR, SAR draft, SAR existence');
    expect(body).toContain('Model-training restriction');
    expect(body).toContain("The Compliance Officer's AI Governance Starter Kit");
    expect(body).toContain('Financial Services AI Risk Management Framework');
    expect(body).not.toContain('The Compliance Officer&#39;s AI-Native Playbook');
    expect(body).not.toContain('SR 11-7');
  });

  it('returns the revised fair-lending checklist without stale legal framing', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/artifact-fair-lending-ai-review-checklist/word'),
      contextFor('artifact-fair-lending-ai-review-checklist'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/msword');

    const body = await response.text();
    expect(body).toContain('The Fair-Lending AI Review Checklist');
    expect(body).toContain('current CFPB rulemaking states that ECOA does not recognize disparate-impact liability');
    expect(body).toContain('Protected-basis variables identified for testing only');
    expect(body).toContain('CFPB Circular 2022-03');
    expect(body).toContain('SR 26-2');
    expect(body).not.toContain('Disparate-impact obligations attach');
    expect(body).not.toContain('SR 11-7 Guidance on Model Risk Management');
  });

  it('rejects public resources that do not have a manifest Word variant', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/artifact-ai-use-case-inventory/word'),
      contextFor('artifact-ai-use-case-inventory'),
    );

    expect(response.status).toBe(404);
  });

  it('returns a Word-compatible document for a newly promoted role playbook', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/executive-playbook/word'),
      contextFor('executive-playbook'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain('Executive-Playbook.doc');

    const body = await response.text();
    expect(body).toContain('The Executive / Leadership AI-Native Playbook');
    expect(body).toContain('The executive AI operating model');
  });

  it('rejects unknown slugs', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/nope/word'),
      contextFor('nope'),
    );

    expect(response.status).toBe(404);
  });
});
