import { describe, expect, it } from 'vitest';

import { parseDownloadAttribution } from '@/lib/resources/downloadAttribution';

describe('resource download attribution parsing', () => {
  it('extracts source and assessment context from the download URL', () => {
    expect(parseDownloadAttribution(
      'https://www.aibankinginstitute.com/api/resources/operations-playbook/download?source_surface=resources-role-playbook-card&assessment_role=operations&assessment_tier_id=early-stage&assessment_tier_label=Early+Stage&assessment_top_gap=workflow-readiness',
    )).toEqual({
      source_surface: 'resources-role-playbook-card',
      assessment_role: 'operations',
      assessment_tier_id: 'early-stage',
      assessment_tier_label: 'Early Stage',
      assessment_top_gap: 'workflow-readiness',
    });
  });

  it('drops blank/control-only values and trims safe values', () => {
    expect(parseDownloadAttribution(
      '/api/resources/safe-ai-use-checklist/download?source_surface=%00%0A&assessment_role=%20executive%20',
    )).toEqual({
      assessment_role: 'executive',
    });
  });

  it('truncates oversized values before logging', () => {
    const parsed = parseDownloadAttribution(
      `/api/resources/safe-ai-use-checklist/download?assessment_top_gap=${'x'.repeat(200)}`,
    );
    expect(parsed.assessment_top_gap).toHaveLength(128);
  });
});
