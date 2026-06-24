import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  downloadableFreeResources,
  freeResources,
  getFreeResource,
  largePrintFilePath,
  largePrintFreeResources,
} from './freeResources';

describe('freeResources manifest', () => {
  it('has unique slugs', () => {
    const slugs = freeResources.map((resource) => resource.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('surfaces every role playbook as a downloadable public resource', () => {
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
      expect(getFreeResource(slug)?.status, `${slug} should be public`).toBe('public');
      expect(
        downloadableFreeResources.some((resource) => resource.slug === slug),
        `${slug} should be downloadable`,
      ).toBe(true);
    }
  });

  it('points every downloadable public resource at a committed file', () => {
    for (const resource of downloadableFreeResources) {
      const path = join(process.cwd(), 'public', 'downloads', resource.download.filePath);
      expect(existsSync(path), `${resource.slug} missing ${resource.download.filePath}`).toBe(true);
    }
  });

  it('catalogs every committed public PDF or ZIP download', () => {
    const manifestFiles = new Set(
      downloadableFreeResources.map((resource) => resource.download.filePath),
    );
    const committedDownloads = readdirSync(join(process.cwd(), 'public', 'downloads'))
      .filter((filename) => filename.endsWith('.pdf') || filename.endsWith('.zip'));

    for (const filename of committedDownloads) {
      expect(manifestFiles.has(filename), `${filename} should be in the manifest`).toBe(true);
    }
  });

  it('exposes a Word route for every branded source-HTML PDF resource', () => {
    const sourceSlugs = readdirSync(join(process.cwd(), 'public', 'downloads', 'source'))
      .filter((filename) => filename.endsWith('.html') && !filename.startsWith('_'))
      .map((filename) => filename.replace(/\.html$/, ''));

    for (const slug of sourceSlugs) {
      const resource = getFreeResource(slug);

      expect(resource, `${slug} source HTML should have a manifest row`).toBeDefined();
      expect(resource?.status, `${slug} should be public`).toBe('public');
      expect(resource?.download?.fileType, `${slug} should be a PDF download`).toBe('pdf');
      expect(resource?.variants.word, `${slug} should have a source-backed Word route`).toBe(
        `/api/resources/${slug}/word`,
      );
    }
  });

  it('exposes committed large-print PDFs for desk cards and selected source-backed artifacts', () => {
    const sourceSlugs = new Set(
      readdirSync(join(process.cwd(), 'public', 'downloads', 'source'))
        .filter((filename) => filename.endsWith('.html') && !filename.startsWith('_'))
        .map((filename) => filename.replace(/\.html$/, '')),
    );
    const requiredArtifactSlugs = new Set([
      'artifact-data-handling-reference-card',
      'artifact-fair-lending-ai-review-checklist',
    ]);
    const expectedLargePrintResources = downloadableFreeResources.filter(
      (resource) =>
        sourceSlugs.has(resource.slug) &&
        (resource.category === 'desk-card' || requiredArtifactSlugs.has(resource.slug)),
    );

    expect(largePrintFreeResources.map((resource) => resource.slug)).toEqual(
      expectedLargePrintResources.map((resource) => resource.slug),
    );

    for (const resource of expectedLargePrintResources) {
      expect(resource.variants.largePrintPdf).toBe(`/api/resources/${resource.slug}/large-print`);
      expect(
        existsSync(join(process.cwd(), 'public', 'downloads', largePrintFilePath(resource.slug))),
        `${resource.slug} missing large-print PDF`,
      ).toBe(true);
    }
  });
});
