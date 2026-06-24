import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FREE_RESOURCE_UNLOCK_KEY,
  rememberFreeResourceCapture,
} from '@/lib/resources/freeResourceCapture';
import { FreeResourceDownloadGate } from './FreeResourceDownloadGate';

describe('FreeResourceDownloadGate', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
    navigate.mockClear();
  });

  it('asks for email before the first session download', () => {
    render(
      <FreeResourceDownloadGate
        title="Safe AI Use Checklist"
        href="/api/resources/safe-ai-use-checklist/download"
        slug="safe-ai-use-checklist"
        source="resources-library"
        onNavigate={navigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Get PDF for Safe AI Use Checklist/i }));
    expect(screen.getByLabelText(/Work email/i)).toBeTruthy();
  });

  it('captures once, stores the unlock, and starts the download', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    render(
      <FreeResourceDownloadGate
        title="Safe AI Use Checklist"
        href="/api/resources/safe-ai-use-checklist/download"
        slug="safe-ai-use-checklist"
        source="resources-library"
        onNavigate={navigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Get PDF for Safe AI Use Checklist/i }));
    fireEvent.change(screen.getByLabelText(/Work email/i), {
      target: { value: 'risk@bank.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Get file/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/capture-email', expect.objectContaining({
        method: 'POST',
      }));
      expect(window.sessionStorage.getItem(FREE_RESOURCE_UNLOCK_KEY)).toBe('1');
      expect(navigate).toHaveBeenCalledWith(
        '/api/resources/safe-ai-use-checklist/download?source_surface=resources-library',
      );
    });
  });

  it('skips the form when the session was already unlocked', () => {
    window.sessionStorage.setItem(FREE_RESOURCE_UNLOCK_KEY, '1');
    window.sessionStorage.setItem('aibi.freeResource.email', 'ops@bank.com');

    render(
      <FreeResourceDownloadGate
        title="Governance Starter Kit"
        href="/api/resources/governance-starter-kit/download"
        slug="governance-starter-kit"
        source="resources-library"
        onNavigate={navigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Download PDF for Governance Starter Kit/i }));
    expect(navigate).toHaveBeenCalledWith(
      '/api/resources/governance-starter-kit/download?source_surface=resources-library',
    );
  });

  it('adds remembered assessment context to later resource downloads', () => {
    rememberFreeResourceCapture({
      email: 'ops@bank.com',
      source: 'assessment-email-gate',
      role: 'operations',
      tier: 'early-stage',
      tierLabel: 'Early Stage',
      topGap: 'workflow-readiness',
      capturedAt: '2026-06-23T12:00:00.000Z',
    });

    render(
      <FreeResourceDownloadGate
        title="Operations Playbook"
        href="/api/resources/operations-playbook/download"
        slug="operations-playbook"
        source="resources-role-playbook-card"
        onNavigate={navigate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Download PDF for Operations Playbook/i }));
    expect(navigate).toHaveBeenCalledWith(
      '/api/resources/operations-playbook/download?source_surface=resources-role-playbook-card&assessment_role=operations&assessment_tier_id=early-stage&assessment_tier_label=Early+Stage&assessment_top_gap=workflow-readiness',
    );
  });
});
