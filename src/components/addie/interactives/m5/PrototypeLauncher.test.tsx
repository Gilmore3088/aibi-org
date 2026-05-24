// PrototypeLauncher widget tests.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrototypeLauncher } from './PrototypeLauncher';

function buildDescriptor() {
  return {
    id: 'm5-4-prototype-launch',
    preset_context_blocks: [
      {
        id: 'tools',
        label: 'prototyping tools menu',
        body: JSON.stringify([
          { id: 'lovable', name: 'Lovable', url: 'https://lovable.dev', best_for: 'Marketing pages' },
          { id: 'replit', name: 'Replit Agents', url: 'https://replit.com', best_for: 'Working software' },
          { id: 'claude-code', name: 'Claude Code', url: 'https://www.anthropic.com/claude-code', best_for: 'Real files' },
          { id: 'v0', name: 'v0', url: 'https://v0.dev', best_for: 'UI prototypes' },
        ]),
      },
    ],
  };
}

describe('PrototypeLauncher', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders empty state when no tools are seeded', () => {
    render(
      <PrototypeLauncher
        exerciseDescriptor={{ id: 'x', preset_context_blocks: [] }}
      />,
    );
    expect(screen.getByText(/No prototyping tools seeded/i)).toBeTruthy();
  });

  it('renders one card per tool with a target=_blank rel=noopener noreferrer link', () => {
    render(<PrototypeLauncher exerciseDescriptor={buildDescriptor()} />);
    const lovable = screen.getByRole('link', { name: /Open Lovable/i }) as HTMLAnchorElement;
    expect(lovable.href).toBe('https://lovable.dev/');
    expect(lovable.target).toBe('_blank');
    expect(lovable.rel).toBe('noopener noreferrer');
    expect(screen.getByRole('link', { name: /Open v0/i })).toBeTruthy();
  });

  it('disables save until a tool is picked, a valid URL is pasted, and a long-enough description is written', () => {
    render(<PrototypeLauncher exerciseDescriptor={buildDescriptor()} />);
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getAllByRole('button', { name: /I am using this/i })[0]!);
    expect((save as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Prototype URL/i), {
      target: { value: 'https://my-build.lovable.app' },
    });
    expect((save as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/What it does/i), {
      target: { value: 'A teller-facing hold explainer that returns a plain-English reason.' },
    });
    expect((save as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows an inline error when the pasted URL is not a valid http(s) URL', () => {
    render(<PrototypeLauncher exerciseDescriptor={buildDescriptor()} />);
    fireEvent.change(screen.getByLabelText(/Prototype URL/i), {
      target: { value: 'not-a-url' },
    });
    expect(
      screen.getByText(/Enter a full URL starting with http:\/\/ or https:\/\//i),
    ).toBeTruthy();
  });

  it('blocks save when the description contains an SSN-shaped value', () => {
    render(<PrototypeLauncher exerciseDescriptor={buildDescriptor()} />);
    fireEvent.click(screen.getAllByRole('button', { name: /I am using this/i })[0]!);
    fireEvent.change(screen.getByLabelText(/Prototype URL/i), {
      target: { value: 'https://my-build.lovable.app' },
    });
    fireEvent.change(screen.getByLabelText(/What it does/i), {
      target: { value: 'Loan tool for member 123-45-6789 with personal data.' },
    });
    expect(screen.getByText(/anonymize first/i)).toBeTruthy();
    const save = screen.getByRole('button', { name: /Save to Toolbox/i });
    expect((save as HTMLButtonElement).disabled).toBe(true);
  });
});
