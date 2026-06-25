import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { allDownloadResources, getDownloadResource } from './downloadCatalog';

describe('downloadCatalog', () => {
  it('contains the role playbooks surfaced by the resource library', () => {
    for (const slug of [
      'compliance-playbook',
      'retail-playbook',
      'lending-playbook',
      'marketing-playbook',
      'bsa-aml-playbook',
      'infosec-playbook',
      'executive-playbook',
      'operations-playbook',
      'training-hr-playbook',
    ]) {
      expect(getDownloadResource(slug), `${slug} should be cataloged`).not.toBeNull();
    }
  });

  it('contains the dashboard/resource download slugs', () => {
    for (const slug of [
      'safe-ai-use-checklist',
      'red-yellow-green-use-card',
      'prompt-strategy-cheat-sheet',
      'regulatory-cheatsheet',
      'platform-feature-reference-card',
      'artifact-ai-use-case-inventory',
      'artifact-data-handling-reference-card',
      'artifact-fair-lending-ai-review-checklist',
      'governance-starter-kit',
      'banker-builder-brief-kit',
      'frontline-enablement-kit',
      'marketing-review-kit',
      'lending-review-kit',
      'sample-readiness-report',
      'in-depth-playbook',
      'template-gtm-plan',
    ]) {
      expect(getDownloadResource(slug), `${slug} should be cataloged`).not.toBeNull();
    }
  });

  it('points every catalog row at an existing committed file', () => {
    for (const resource of allDownloadResources()) {
      const path = join(process.cwd(), 'public', 'downloads', resource.file_path);
      expect(existsSync(path), `${resource.slug} points at missing ${resource.file_path}`).toBe(true);
    }
  });
});
