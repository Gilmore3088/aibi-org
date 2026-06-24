import { describe, expect, it } from 'vitest';
import { GET } from './route';

function contextFor(slug: string) {
  return {
    params: Promise.resolve({ slug }),
  };
}

describe('/api/resources/[slug]/large-print', () => {
  it.each([
    'safe-ai-use-checklist',
    'artifact-data-handling-reference-card',
  ])('returns a large-print PDF for manifest-backed resource %s', async (slug) => {
    const response = await GET(
      new Request(`https://www.aibankinginstitute.com/api/resources/${slug}/large-print`),
      contextFor(slug),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/pdf');
    expect(response.headers.get('content-disposition')).toContain(`${slug}-large-print.pdf`);
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(10_000);
  });

  it('rejects source-backed resources that are not large-print variants', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/compliance-playbook/large-print'),
      contextFor('compliance-playbook'),
    );

    expect(response.status).toBe(404);
  });

  it('rejects unknown slugs', async () => {
    const response = await GET(
      new Request('https://www.aibankinginstitute.com/api/resources/nope/large-print'),
      contextFor('nope'),
    );

    expect(response.status).toBe(404);
  });
});
