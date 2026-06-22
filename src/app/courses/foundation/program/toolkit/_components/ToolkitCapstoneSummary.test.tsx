import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToolkitCapstoneSummary } from './ToolkitCapstoneSummary';

describe('ToolkitCapstoneSummary', () => {
  it('summarizes current reusable skill and workflow kit evidence', () => {
    render(
      <ToolkitCapstoneSummary
        skillResponse={{
          artifact_draft: 'Role-based compliance FAQ skill with source-only rules.',
          review_note: 'Reviewer checks thresholds, citations, and customer-data boundaries.',
          first_use: 'Use on the next compliance FAQ draft.',
        }}
        workflowResponse={{
          workflow_purpose: 'Draft staff FAQs from approved source material only.',
          prompt_or_skill: 'Reusable prompt with source, audience, reviewer, and blocked-use placeholders.',
          checkpoint_and_escalation: 'Compliance officer review before distribution.',
          peer_test_plan: 'Peer tests against a synthetic policy memo before reuse.',
        }}
      />,
    );

    expect(screen.getByText('Reusable skill')).toBeTruthy();
    expect(screen.getByText('Workflow kit')).toBeTruthy();
    expect(screen.getByText('Review evidence')).toBeTruthy();
    expect(screen.getByText(/Role-based compliance FAQ skill/)).toBeTruthy();
    expect(screen.queryByText(/capstone/i)).toBeNull();
    expect(screen.queryByText(/Module 9/i)).toBeNull();
  });
});
