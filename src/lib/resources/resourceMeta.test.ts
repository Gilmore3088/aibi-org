import { describe, it, expect } from 'vitest';
import { resourceMeta, RESOURCE_CATEGORY_ORDER } from './resourceMeta';

describe('resourceMeta', () => {
  it('maps role playbooks', () => {
    expect(resourceMeta('compliance-playbook')).toEqual({
      label: "The Compliance Officer's AI Governance Playbook",
      category: 'Role playbooks',
    });
    expect(resourceMeta('executive-playbook')).toEqual({
      label: 'Executive AI Board Packet',
      category: 'Role playbooks',
    });
  });

  it('maps starter kits', () => {
    expect(resourceMeta('governance-starter-kit').category).toBe('Starter kits');
    expect(resourceMeta('governance-starter-kit').label).toBe('AI Governance Starter Kit');
  });

  it('maps desk cards', () => {
    expect(resourceMeta('safe-ai-use-checklist').category).toBe('Desk cards');
  });

  it('treats in-depth-playbook as a Paid preview, NOT a Role playbook (edge case)', () => {
    // It ends in "-playbook" but is a paid-preview asset — the explicit table
    // must win over the "-playbook -> Role playbooks" fallback rule.
    expect(resourceMeta('in-depth-playbook').category).toBe('Paid previews');
  });

  it('maps templates and artifacts', () => {
    expect(resourceMeta('template-ai-workflow-sop').category).toBe('Templates');
    expect(resourceMeta('template-gtm-plan').label).toBe('AI GTM Plan');
    expect(resourceMeta('artifact-ai-use-case-inventory').category).toBe('Artifacts');
  });

  it('falls back by rule for course/auto-generated slugs', () => {
    expect(resourceMeta('starter-governance').category).toBe('Course artifacts');
    expect(resourceMeta('skill-template-exception-report').category).toBe('Course artifacts');
    expect(resourceMeta('card-core').category).toBe('Course artifacts');
  });

  it('falls back by suffix for unknown catalog-shaped slugs', () => {
    expect(resourceMeta('brand-new-playbook').category).toBe('Role playbooks');
    expect(resourceMeta('brand-new-kit').category).toBe('Starter kits');
  });

  it('humanizes a totally unknown slug into the Other category', () => {
    const m = resourceMeta('some_random-thing');
    expect(m.category).toBe('Other');
    expect(m.label).toBe('Some Random Thing');
  });

  it('every explicit/fallback category is present in RESOURCE_CATEGORY_ORDER', () => {
    const seen = [
      'compliance-playbook',
      'governance-starter-kit',
      'safe-ai-use-checklist',
      'in-depth-playbook',
      'template-ai-workflow-sop',
      'artifact-ai-use-case-inventory',
      'starter-governance',
      'some_random-thing',
    ].map((s) => resourceMeta(s).category);
    for (const c of seen) expect(RESOURCE_CATEGORY_ORDER).toContain(c);
  });
});
