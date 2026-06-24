import { describe, expect, it } from 'vitest';

import { resolveDeliverableResource } from './resourceDelivery';

describe('resolveDeliverableResource', () => {
  it('resolves a role playbook to its by-slug download URL', () => {
    expect(resolveDeliverableResource('infosec-playbook')).toEqual({
      slug: 'infosec-playbook',
      title: 'IT / InfoSec Playbook',
      downloadUrl: 'https://aibankinginstitute.com/api/resources/infosec-playbook/download',
    });
  });

  it('uses the canonical API route when the resource defines one', () => {
    expect(resolveDeliverableResource('aibi-safe-ai-use-guide')).toEqual({
      slug: 'aibi-safe-ai-use-guide',
      title: 'Safe AI Use Guide',
      downloadUrl: 'https://aibankinginstitute.com/api/guides/safe-ai-use',
    });
  });

  it('falls back to the by-slug endpoint for page-canonical templates', () => {
    expect(resolveDeliverableResource('template-ai-use-policy-starter')).toEqual({
      slug: 'template-ai-use-policy-starter',
      title: 'AI Use Policy Starter',
      downloadUrl:
        'https://aibankinginstitute.com/api/resources/template-ai-use-policy-starter/download',
    });
  });

  it('refuses to link-deliver gated (non-free) resources', () => {
    // aibi-skill-template-library is foundation-tier (paid entitlement).
    expect(resolveDeliverableResource('aibi-skill-template-library')).toBeNull();
  });

  it('returns null for unknown or empty slugs', () => {
    expect(resolveDeliverableResource('not-a-real-resource')).toBeNull();
    expect(resolveDeliverableResource('')).toBeNull();
    expect(resolveDeliverableResource(null)).toBeNull();
    expect(resolveDeliverableResource(undefined)).toBeNull();
  });
});
