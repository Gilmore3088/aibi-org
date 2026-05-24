// WhereAIFitsWorksheet — smoke test: schema parses by track, fields render,
// save emits the right payload, missing-track and missing-schema states are
// shown.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhereAIFitsWorksheet } from './WhereAIFitsWorksheet';

const descriptor = {
  id: 'm2-4-where-ai-fits-worksheet',
  preset_context_blocks: [
    {
      id: 'schema_risk_compliance',
      label: 'Risk & Compliance',
      body: JSON.stringify({
        track: 'risk_compliance',
        fields: [
          { key: 'reg_doc', label: 'A regulation I re-read this month' },
          { key: 'policy_summary', label: 'A policy I summarized' },
          { key: 'never', label: 'One thing I would never put through AI' },
        ],
      }),
    },
    {
      id: 'schema_customer_facing',
      label: 'Customer-Facing',
      body: JSON.stringify({
        track: 'customer_facing',
        fields: [{ key: 'recurring_email', label: 'A recurring member email' }],
      }),
    },
  ],
};

describe('WhereAIFitsWorksheet', () => {
  it('renders the fields for the selected track', () => {
    render(
      <WhereAIFitsWorksheet
        exerciseDescriptor={descriptor}
        track="risk_compliance"
      />,
    );
    expect(screen.getByLabelText(/regulation I re-read/i)).toBeTruthy();
    expect(screen.getByLabelText(/policy I summarized/i)).toBeTruthy();
    expect(screen.getByLabelText(/never put through AI/i)).toBeTruthy();
    // Customer-facing field must not appear.
    expect(screen.queryByLabelText(/recurring member email/i)).toBeNull();
  });

  it('disables Save until at least one field is filled, then emits payload', () => {
    const onSave = vi.fn();
    render(
      <WhereAIFitsWorksheet
        exerciseDescriptor={descriptor}
        track="risk_compliance"
        onSave={onSave}
      />,
    );
    const save = screen.getByRole('button', { name: /save worksheet to toolbox/i });
    expect(save.hasAttribute('disabled')).toBe(true);

    const input = screen.getByLabelText(/regulation I re-read/i) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'a recent OCC bulletin' } });

    expect(save.hasAttribute('disabled')).toBe(false);
    fireEvent.click(save);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      track: 'risk_compliance',
      answers: { reg_doc: 'a recent OCC bulletin' },
    });
    expect(screen.getByRole('status').textContent).toMatch(/saved/i);
  });

  it('shows an empty state when no track is selected', () => {
    render(
      <WhereAIFitsWorksheet exerciseDescriptor={descriptor} track={null} />,
    );
    expect(screen.getByText(/pick a role track/i)).toBeTruthy();
  });

  it('shows an empty state when the track has no schema block', () => {
    render(
      <WhereAIFitsWorksheet
        exerciseDescriptor={{ id: 'x', preset_context_blocks: [] }}
        track="leadership"
      />,
    );
    expect(screen.getByText(/no worksheet template available/i)).toBeTruthy();
  });
});
