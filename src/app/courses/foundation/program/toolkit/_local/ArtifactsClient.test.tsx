import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtifactsClient, type ToolkitArtifact } from './ArtifactsClient';

const artifact: ToolkitArtifact = {
  id: 'aibi-foundation-m15-human-review-gate-card',
  title: 'Human Review Gate Card',
  description: 'Create a gate card that names the pause, reviewer authority, escalation trigger, and resume condition.',
  type: 'workflow',
  typeLabel: 'Workflow artifact',
  module: 15,
  moduleHref: '/courses/foundation/program/15',
  lastEditedISO: '2026-01-18T00:00:00.000Z',
  available: true,
  readinessLabel: 'Manager review ready',
  qualitySignals: ['Gate happens before impact', 'Decision authority named'],
  transferMove: 'Add one review gate before trying an AI-supported workflow at work.',
  action: {
    kind: 'link',
    href: '/courses/foundation/program/artifacts/aibi-foundation-m15-human-review-gate-card',
    label: 'Open artifact',
  },
};

describe('ArtifactsClient', () => {
  it('shows the day-job transfer cue on artifact cards', () => {
    render(<ArtifactsClient artifacts={[artifact]} />);

    expect(screen.getByLabelText('Use this artifact at work').textContent).toContain(
      'Add one review gate before trying an AI-supported workflow at work.',
    );
    expect(screen.getByText('Gate happens before impact')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open artifact' }).getAttribute('href')).toBe(
      artifact.action.kind === 'link' ? artifact.action.href : '',
    );
  });
});
