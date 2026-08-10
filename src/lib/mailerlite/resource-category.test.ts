import { describe, expect, it } from 'vitest';
import { resourceCategoryForSlug } from './resource-category';

describe('resourceCategoryForSlug', () => {
  it('maps governance-segment resources to governance', () => {
    expect(resourceCategoryForSlug('governance-starter-kit')).toBe('governance');
    expect(resourceCategoryForSlug('template-ai-use-policy-starter')).toBe('governance');
  });

  it('maps role playbooks to role, except the specialist overrides', () => {
    expect(resourceCategoryForSlug('retail-playbook')).toBe('role');
    expect(resourceCategoryForSlug('executive-playbook')).toBe('role');
    expect(resourceCategoryForSlug('compliance-playbook')).toBe('compliance');
    expect(resourceCategoryForSlug('infosec-playbook')).toBe('infosec');
    expect(resourceCategoryForSlug('lending-playbook')).toBe('lending');
    expect(resourceCategoryForSlug('bsa-aml-playbook')).toBe('lending');
  });

  it('maps data-handling to infosec and lending-review to lending', () => {
    expect(resourceCategoryForSlug('artifact-data-handling-reference-card')).toBe('infosec');
    expect(resourceCategoryForSlug('lending-review-kit')).toBe('lending');
  });

  it('returns null for resources outside the five nurture tracks', () => {
    expect(resourceCategoryForSlug('prompt-strategy-cheat-sheet')).toBeNull();
    expect(resourceCategoryForSlug('prompting-foundation-guide')).toBeNull();
  });

  it('returns null for unknown slugs and empty input', () => {
    expect(resourceCategoryForSlug('not-a-real-slug')).toBeNull();
    expect(resourceCategoryForSlug(null)).toBeNull();
    expect(resourceCategoryForSlug(undefined)).toBeNull();
  });
});
