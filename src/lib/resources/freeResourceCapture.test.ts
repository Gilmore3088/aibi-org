import { describe, expect, it, beforeEach } from 'vitest';

import {
  FREE_RESOURCE_CONTEXT_KEY,
  FREE_RESOURCE_EMAIL_KEY,
  FREE_RESOURCE_UNLOCK_KEY,
  buildFreeResourceDownloadHref,
  normalizeCaptureEmail,
  readRememberedFreeResourceCapture,
  rememberFreeResourceCapture,
} from './freeResourceCapture';

describe('freeResourceCapture', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('normalizes valid capture emails and rejects invalid values', () => {
    expect(normalizeCaptureEmail(' Banker@Example.COM ')).toBe('banker@example.com');
    expect(normalizeCaptureEmail('not-an-email')).toBeNull();
    expect(normalizeCaptureEmail(null)).toBeNull();
  });

  it('stores session unlock context for later resource downloads', () => {
    rememberFreeResourceCapture({
      email: 'leader@bank.com',
      source: 'assessment-email-gate',
      role: 'executive',
      tier: 'building-momentum',
      tierLabel: 'Building Momentum',
      topGap: 'workflow-documentation',
      capturedAt: '2026-06-23T12:00:00.000Z',
    });

    expect(window.sessionStorage.getItem(FREE_RESOURCE_UNLOCK_KEY)).toBe('1');
    expect(window.sessionStorage.getItem(FREE_RESOURCE_EMAIL_KEY)).toBe('leader@bank.com');
    expect(window.sessionStorage.getItem(FREE_RESOURCE_CONTEXT_KEY)).toContain('workflow-documentation');
    expect(readRememberedFreeResourceCapture()).toEqual({
      email: 'leader@bank.com',
      source: 'assessment-email-gate',
      role: 'executive',
      tier: 'building-momentum',
      tierLabel: 'Building Momentum',
      topGap: 'workflow-documentation',
      capturedAt: '2026-06-23T12:00:00.000Z',
    });
  });

  it('does not unlock the session for invalid emails', () => {
    rememberFreeResourceCapture({ email: 'bad', source: 'resources-library' });
    expect(readRememberedFreeResourceCapture()).toBeNull();
  });

  it('adds non-PII attribution to resource download hrefs', () => {
    expect(buildFreeResourceDownloadHref('/api/resources/safe-ai-use-checklist/download', {
      source: 'resources-desk-card',
      role: 'compliance-risk',
      tier: 'building-momentum',
      tierLabel: 'Building Momentum',
      topGap: 'documentation',
    })).toBe(
      '/api/resources/safe-ai-use-checklist/download?source_surface=resources-desk-card&assessment_role=compliance-risk&assessment_tier_id=building-momentum&assessment_tier_label=Building+Momentum&assessment_top_gap=documentation',
    );
  });

  it('preserves existing query params while adding attribution', () => {
    expect(buildFreeResourceDownloadHref('/api/resources/sample-readiness-report/download?utm=test', {
      source: 'results-sample',
    })).toBe('/api/resources/sample-readiness-report/download?utm=test&source_surface=results-sample');
  });
});
