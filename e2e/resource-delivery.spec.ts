// Resource delivery validation — manifest-derived route coverage.
//
// This spec intentionally enumerates resource routes from the canonical
// manifest and public indexes. Adding a resource without a working download,
// Word, large-print, readable HTML, template, or playbook route should make
// this file fail without adding another hardcoded path.

import { test, expect } from '@playwright/test';
import { PLAYBOOK_INDEX } from '../src/app/playbooks/data';
import { TEMPLATE_INDEX } from '../src/app/resources/templates/templateIndex';
import {
  downloadableFreeResources,
  expectedLargePrintRoute,
  largePrintFreeResources,
  publicFreeResources,
  readableFreeResources,
  readableResourceHref,
} from '../src/lib/resources/freeResources';

const WIRED_DOWNLOAD_STATUSES = [200, 302, 401, 403, 503] as const;

const downloadRoutes = downloadableFreeResources.map((resource) => ({
  slug: resource.slug,
  path: `/api/resources/${resource.slug}/download`,
  category: resource.category,
}));

const bundleRoutes = downloadRoutes.filter((route) => route.category === 'starter-kit');
const playbookDownloadRoutes = downloadRoutes.filter((route) => route.category === 'playbook');

const wordRoutes = publicFreeResources
  .map((resource) => resource.variants.word)
  .filter((route): route is string => Boolean(route));

const largePrintRoutes = largePrintFreeResources.map((resource) => ({
  slug: resource.slug,
  path: expectedLargePrintRoute(resource.slug),
}));

const readableHtmlRoutes = readableFreeResources
  .map((resource) => ({
    slug: resource.slug,
    path: readableResourceHref(resource),
  }))
  .filter((route): route is { readonly slug: string; readonly path: string } => Boolean(route.path));

const templatePages = TEMPLATE_INDEX.map((template) => ({
  slug: template.slug,
  path: `/resources/templates/${template.slug}`,
}));

const playbookPages = PLAYBOOK_INDEX.map((playbook) => ({
  slug: playbook.slug,
  path: `/playbooks/${playbook.slug}`,
}));

test.describe('Resource delivery - manifest download routes', () => {
  for (const { slug, path } of downloadRoutes) {
    test(`GET ${path} resolves for manifest resource ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      const status = res.status();

      // 200 = local/static fallback file served
      // 302 = signed-URL redirect
      // 401/403 = entitlement gate for non-free rows
      // 503 = Supabase/storage unavailable in local or preview
      // Not acceptable: 404 for a known slug or unexpected 5xx.
      expect(
        WIRED_DOWNLOAD_STATUSES,
        `${path} returned unexpected ${status}`,
      ).toContain(status);
    });
  }
});

test.describe('Resource delivery - ZIP bundle routes', () => {
  test('manifest exposes starter-kit ZIP routes', () => {
    expect([...bundleRoutes.map((route) => route.slug)].sort()).toEqual([
      'banker-builder-brief-kit',
      'frontline-enablement-kit',
      'governance-starter-kit',
      'lending-review-kit',
      'marketing-review-kit',
      'prompting-foundation-kit',
    ].sort());
  });

  for (const { slug, path } of bundleRoutes) {
    test(`GET ${path} resolves for starter kit ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(
        WIRED_DOWNLOAD_STATUSES,
        `${path} returned unexpected ${res.status()}`,
      ).toContain(res.status());
    });
  }
});

test.describe('Resource delivery - role playbooks', () => {
  test('every role playbook has a manifest-backed PDF route', () => {
    expect(playbookDownloadRoutes.map((route) => route.slug)).toEqual(
      PLAYBOOK_INDEX.map((playbook) => `${playbook.slug}-playbook`),
    );
  });

  for (const { slug, path } of playbookDownloadRoutes) {
    test(`GET ${path} route exists for ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should not 500`).not.toBe(500);
      expect(res.status(), `${path} should not 404 as missing route`).not.toBe(404);
    });
  }

  for (const { slug, path } of playbookPages) {
    test(`GET ${path} returns 200 for role page ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
    });
  }
});

test.describe('Resource delivery - Word, large-print, and readable variants', () => {
  for (const path of wordRoutes) {
    test(`GET ${path} returns a Word-compatible document`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
      expect(
        res.headers()['content-type'] ?? '',
        `${path} should return HTML/Word-compatible content`,
      ).toMatch(/text\/html|application\/msword/i);
    });
  }

  for (const { slug, path } of largePrintRoutes) {
    test(`GET ${path} returns a large-print PDF for ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
      expect(res.headers()['content-type'] ?? '').toContain('application/pdf');
      expect((await res.body()).byteLength, `${path} should not be empty`).toBeGreaterThan(10_000);
    });
  }

  for (const { slug, path } of readableHtmlRoutes) {
    test(`GET ${path} returns readable HTML for ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
      expect(res.headers()['content-type'] ?? '').toContain('text/html');
    });
  }
});

test.describe('Resource delivery - template pages', () => {
  for (const { slug, path } of templatePages) {
    test(`GET ${path} returns 200 for template ${slug}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
    });
  }
});

test.describe('Gated lead-capture PDF downloads', () => {
  // These two slugs serve committed static PDFs (not request-time renders),
  // so they live in freeResources.manifest.json as logging entries only and
  // are NOT enumerated by the manifest-driven routes above. The mocked unit
  // tests prove response shaping but cannot prove the committed asset exists,
  // is non-empty, and starts with the PDF magic header — this does.
  const gated = [
    { path: '/api/prompt-cards/download', filename: 'AiBI-Prompt-Cards.pdf' },
    { path: '/api/guides/safe-ai-use', filename: 'AiBI-Safe-AI-Use-Guide.pdf' },
  ];

  for (const { path, filename } of gated) {
    test(`GET ${path} returns a valid attachment PDF`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status(), `${path} should return 200`).toBe(200);
      expect(res.headers()['content-type'] ?? '').toContain('application/pdf');
      expect(res.headers()['content-disposition'] ?? '').toContain('attachment');
      expect(res.headers()['content-disposition'] ?? '').toContain(filename);
      const body = await res.body();
      expect(body.byteLength, `${path} body too small`).toBeGreaterThan(10_000);
      expect(body.subarray(0, 5).toString('utf8'), `${path} not a PDF`).toBe('%PDF-');
    });
  }
});

test.describe('Resource delivery - download API input validation', () => {
  test('unknown slug returns 404 or service-unavailable, not 500', async ({ request }) => {
    const res = await request.get('/api/resources/this-slug-does-not-exist-xyz/download');
    const status = res.status();

    // If Supabase is not configured the route fails closed before catalog
    // lookup. Either way this should not surface as an internal error.
    expect(
      status === 404 || status === 503,
      `unknown slug returned ${status}, expected 404 or 503`,
    ).toBe(true);
  });

  test('health check routes exist', async ({ request }) => {
    const emailHealth = await request.get('/api/health/email');
    const stripeHealth = await request.get('/api/health/stripe');
    expect(emailHealth.status(), '/api/health/email should not 404').not.toBe(404);
    expect(stripeHealth.status(), '/api/health/stripe should not 404').not.toBe(404);
  });
});
