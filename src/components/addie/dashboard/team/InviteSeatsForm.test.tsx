// InviteSeatsForm — parse, dedupe, validate, budget gating.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InviteSeatsForm, parseEmails } from './InviteSeatsForm';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

describe('parseEmails', () => {
  it('parses comma, semicolon, space, and newline-separated lists', () => {
    const r = parseEmails('a@b.co, c@d.co; e@f.co\ng@h.co i@j.co');
    expect(r.valid.sort()).toEqual([
      'a@b.co',
      'c@d.co',
      'e@f.co',
      'g@h.co',
      'i@j.co',
    ]);
  });

  it('lowercases and dedupes', () => {
    const r = parseEmails('Foo@BAR.co, foo@bar.co, FOO@bar.co');
    expect(r.valid).toEqual(['foo@bar.co']);
    expect(r.duplicates.length).toBe(2);
  });

  it('reports invalid addresses', () => {
    const r = parseEmails('ok@x.io, not-an-email, also@bad');
    expect(r.valid).toEqual(['ok@x.io']);
    expect(r.invalid).toEqual(['not-an-email', 'also@bad']);
  });

  it('returns empty on empty input', () => {
    const r = parseEmails('   \n  ');
    expect(r.valid).toEqual([]);
    expect(r.invalid).toEqual([]);
  });
});

describe('InviteSeatsForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows remaining budget', () => {
    const { container } = render(
      <InviteSeatsForm teamId="team-1" remainingSeats={7} />,
    );
    const span = container.querySelector('[data-budget-remaining="7"]');
    expect(span?.textContent).toBe('7');
  });

  it('disables submit when no valid emails entered', () => {
    render(<InviteSeatsForm teamId="team-1" remainingSeats={5} />);
    const button = screen.getByRole('button', { name: /SEND/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables submit when valid emails exceed budget', () => {
    render(<InviteSeatsForm teamId="team-1" remainingSeats={2} />);
    const textarea = screen.getByLabelText(/INVITE TEAM MEMBERS/i);
    fireEvent.change(textarea, {
      target: { value: 'a@b.co, c@d.co, e@f.co' },
    });
    const button = screen.getByRole('button', { name: /SEND/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('alert').textContent).toMatch(/exceeds available seats/i);
  });

  it('enables submit when valid emails fit budget', () => {
    render(<InviteSeatsForm teamId="team-1" remainingSeats={5} />);
    const textarea = screen.getByLabelText(/INVITE TEAM MEMBERS/i);
    fireEvent.change(textarea, { target: { value: 'a@b.co\nc@d.co' } });
    const button = screen.getByRole('button', { name: /SEND/i });
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables submit when remaining seats is zero regardless of input', () => {
    render(<InviteSeatsForm teamId="team-1" remainingSeats={0} />);
    const textarea = screen.getByLabelText(/INVITE TEAM MEMBERS/i);
    fireEvent.change(textarea, { target: { value: 'a@b.co' } });
    const button = screen.getByRole('button', { name: /SEND/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
