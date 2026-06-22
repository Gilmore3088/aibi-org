import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModuleNavigation } from './ModuleNavigation';

describe('ModuleNavigation', () => {
  it('locks the next module behind review and transfer evidence', () => {
    render(
      <ModuleNavigation
        moduleNumber={1}
        isLastModule={false}
        moduleComplete={false}
      />,
    );

    const locked = screen.getByRole('button', {
      name: 'Add the module review note and transfer plan to unlock the next module',
    });
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    expect(locked.textContent).toContain('Add review + transfer');
    expect(locked.textContent).toContain('Save the judgment note and first real use');
  });

  it('turns the next module link into a recall cue after completion', () => {
    render(
      <ModuleNavigation
        moduleNumber={1}
        isLastModule={false}
        moduleComplete={true}
      />,
    );

    const next = screen.getByRole('link', {
      name: 'Continue to Module 02 · Rewrite a Low-Risk Message',
    });
    expect(next.getAttribute('href')).toBe('/courses/foundation/program/2');
    expect(next.textContent).toContain('Replay, then continue');
    expect(next.textContent).toContain('Recall AI Limits Card');
  });

  it('routes the final module to the Foundation Packet', () => {
    render(
      <ModuleNavigation
        moduleNumber={18}
        isLastModule={true}
        moduleComplete={true}
      />,
    );

    const packet = screen.getByRole('link', { name: 'Open My Foundation Packet' });
    expect(packet.getAttribute('href')).toBe('/courses/foundation/program/toolkit');
    expect(packet.textContent).toContain('Course complete');
    expect(packet.textContent).toContain('Review the artifacts before submission or sharing');
  });
});
