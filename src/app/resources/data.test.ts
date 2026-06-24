import { describe, expect, it } from 'vitest';

import { PLAYBOOK_INDEX } from '@/app/playbooks/data';
import { TEMPLATE_INDEX } from '@/app/resources/templates/templateIndex';
import {
  downloadableFreeResources,
  publicFreeResources,
  largePrintResourceHref,
  readableFreeResources,
  readableResourceHref,
} from '@/lib/resources/freeResources';
import {
  allDownloadHrefs,
  deskCards,
  paidPreviews,
  problemPaths,
  rolePlaybooks,
  starterKits,
  templates,
} from './data';

describe('resources data model', () => {
  it('derives starter kits from public manifest rows', () => {
    const manifestKits = downloadableFreeResources.filter(
      (resource) => resource.category === 'starter-kit' && resource.visibleSurfaces.includes('resources'),
    );

    expect(starterKits.map((kit) => kit.slug)).toEqual(
      manifestKits.map((resource) => resource.slug),
    );
    expect(starterKits.map((kit) => kit.title)).toEqual(
      manifestKits.map((resource) => resource.title),
    );

    for (const kit of starterKits) {
      const resource = manifestKits.find((entry) => entry.slug === kit.slug);
      expect(resource, `${kit.slug} missing manifest row`).toBeDefined();
      expect(kit.zip).toBe(`/api/resources/${kit.slug}/download`);
      expect(kit.audience).toBe(resource?.audience.join(', '));
    }
  });

  it('derives starter kit item links from manifest ZIP membership', () => {
    for (const kit of starterKits) {
      const manifestMembers = publicFreeResources.filter((resource) =>
        resource.zipMembership.includes(kit.slug),
      );

      expect(kit.items.map((item) => item.href)).toEqual(
        manifestMembers.map((resource) => resource.canonicalRoute),
      );
      expect(kit.items.map((item) => item.readHref ?? null)).toEqual(
        manifestMembers.map((resource) => readableResourceHref(resource) ?? null),
      );
      expect(kit.items.length, `${kit.slug} should not be empty`).toBeGreaterThan(0);
    }
  });

  it('derives role playbook cards from the canonical playbook index', () => {
    expect(rolePlaybooks.map((playbook) => playbook.slug)).toEqual(
      PLAYBOOK_INDEX.map((playbook) => playbook.slug),
    );
    expect(rolePlaybooks.map((playbook) => playbook.title)).toEqual(
      PLAYBOOK_INDEX.map((playbook) => playbook.title),
    );
    expect(rolePlaybooks.map((playbook) => playbook.desc)).toEqual(
      PLAYBOOK_INDEX.map((playbook) => playbook.desc),
    );
  });

  it('points every role playbook card at its public manifest download route', () => {
    for (const playbook of rolePlaybooks) {
      const resource = downloadableFreeResources.find(
        (entry) => entry.slug === `${playbook.slug}-playbook`,
      );

      expect(resource, `${playbook.slug} missing public manifest row`).toBeDefined();
      expect(resource?.category).toBe('playbook');
      expect(playbook.pdf).toBe(`/api/resources/${resource?.slug}/download`);
      expect(playbook.word).toBe(resource?.variants.word ?? undefined);
      expect(playbook.readHref).toBe(readableResourceHref(resource ?? null) ?? undefined);
    }
  });

  it('includes every public role playbook download in all resource hrefs', () => {
    const hrefs = new Set(allDownloadHrefs());
    const publicPlaybookHrefs = downloadableFreeResources
      .filter((resource) => resource.category === 'playbook')
      .map((resource) => `/api/resources/${resource.slug}/download`);

    for (const href of publicPlaybookHrefs) {
      expect(hrefs.has(href), `${href} missing from allDownloadHrefs`).toBe(true);
    }
  });

  it('derives template cards from the canonical template registry', () => {
    expect(templates.map((template) => template.slug)).toEqual(
      TEMPLATE_INDEX.map((template) => template.slug),
    );
    expect(templates.map((template) => template.title)).toEqual(
      TEMPLATE_INDEX.map((template) => template.title),
    );
    expect(templates.map((template) => template.desc)).toEqual(
      TEMPLATE_INDEX.map((template) => template.dek),
    );
  });

  it('backs every template Word download with a public manifest resource', () => {
    for (const template of templates) {
      const resource = downloadableFreeResources.find(
        (entry) => entry.variants.word === template.download,
      );

      expect(resource, `${template.slug} missing public manifest Word route`).toBeDefined();
      expect(resource?.visibleSurfaces).toContain('template');
      expect(template.href).toBe(`/resources/templates/${template.slug}`);
      expect(template.download).toBe(`/api/resources/templates/${template.slug}/word`);
    }
  });

  it('backs every visible problem path with a public manifest resource', () => {
    for (const path of problemPaths) {
      const resource = publicFreeResources.find((entry) => entry.canonicalRoute === path.href);

      expect(resource, `${path.title} should use a public manifest canonical route`).toBeDefined();
      expect(resource?.title).toBe(path.artifact);
      expect(path.readHref).toBe(readableResourceHref(resource ?? null) ?? undefined);
      expect(
        resource?.visibleSurfaces.some((surface) => surface === 'resources' || surface === 'template'),
        `${path.title} should be visible from a public resource surface`,
      ).toBe(true);
    }
  });

  it('includes every problem path in all resource hrefs', () => {
    const hrefs = new Set(allDownloadHrefs());

    for (const path of problemPaths) {
      expect(hrefs.has(path.href), `${path.href} missing from allDownloadHrefs`).toBe(true);
    }
  });

  it('derives desk cards from public manifest rows', () => {
    const manifestDeskCards = downloadableFreeResources.filter(
      (resource) => resource.category === 'desk-card' && resource.visibleSurfaces.includes('resources'),
    );

    expect(deskCards.map((card) => card.slug)).toEqual(
      manifestDeskCards.map((resource) => resource.slug),
    );
    expect(deskCards.map((card) => card.title)).toEqual(
      manifestDeskCards.map((resource) => resource.title),
    );

    for (const card of deskCards) {
      const resource = manifestDeskCards.find((entry) => entry.slug === card.slug);
      expect(card.href).toBe(`/api/resources/${card.slug}/download`);
      expect(card.word).toBe(resource?.variants.word ?? undefined);
      expect(card.readHref).toBe(readableResourceHref(resource ?? null) ?? undefined);
      expect(card.largePrint).toBe(largePrintResourceHref(resource ?? null) ?? undefined);
    }
  });

  it('derives paid previews from public manifest rows', () => {
    const manifestPreviews = downloadableFreeResources.filter(
      (resource) => resource.category === 'paid-preview' && resource.visibleSurfaces.includes('resources'),
    );

    expect(paidPreviews.map((preview) => preview.slug)).toEqual(
      manifestPreviews.map((resource) => resource.slug),
    );
    expect(paidPreviews.map((preview) => preview.title)).toEqual(
      manifestPreviews.map((resource) => resource.title),
    );

    for (const preview of paidPreviews) {
      const resource = manifestPreviews.find((entry) => entry.slug === preview.slug);
      expect(preview.href).toBe(`/api/resources/${preview.slug}/download`);
      expect(preview.word).toBe(resource?.variants.word ?? undefined);
      expect(preview.readHref).toBe(readableResourceHref(resource ?? null) ?? undefined);
    }
  });

  it('includes every visible Word route in all resource hrefs', () => {
    const hrefs = new Set(allDownloadHrefs());
    const visibleWordHrefs = [
      ...templates.map((template) => template.download),
      ...rolePlaybooks.map((playbook) => playbook.word),
      ...deskCards.map((card) => card.word),
      ...paidPreviews.map((preview) => preview.word),
    ].filter((href): href is string => Boolean(href));

    for (const href of visibleWordHrefs) {
      expect(hrefs.has(href), `${href} missing from allDownloadHrefs`).toBe(true);
    }
  });

  it('includes every visible readable HTML route in all resource hrefs', () => {
    const hrefs = new Set(allDownloadHrefs());
    const visibleReadableHrefs = readableFreeResources
      .filter((resource) =>
        resource.visibleSurfaces.includes('resources') ||
        resource.visibleSurfaces.includes('playbooks'),
      )
      .map((resource) => `/resources/access/${resource.slug}`);

    for (const href of visibleReadableHrefs) {
      expect(hrefs.has(href), `${href} missing from allDownloadHrefs`).toBe(true);
    }
  });

  it('includes every visible large-print route in all resource hrefs', () => {
    const hrefs = new Set(allDownloadHrefs());
    const largePrintHrefs = deskCards
      .map((card) => card.largePrint)
      .filter((href): href is string => Boolean(href));

    expect(largePrintHrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of largePrintHrefs) {
      expect(hrefs.has(href), `${href} missing from allDownloadHrefs`).toBe(true);
    }
  });
});
