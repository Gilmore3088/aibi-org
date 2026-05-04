import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsageMeter } from './UsageMeter';

describe('UsageMeter', () => {
  it('renders dollars under 80% in the neutral state', () => {
    render(<UsageMeter todayCents={20} dailyCapCents={50} />);
    expect(screen.getByText('$0.20 / $0.50 today')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('neutral');
  });

  it('renders the 80% warning state', () => {
    render(<UsageMeter todayCents={42} dailyCapCents={50} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('warning');
    expect(screen.getByText(/approaching/i)).toBeTruthy();
  });

  it('renders the 100% blocked state', () => {
    render(<UsageMeter todayCents={50} dailyCapCents={50} />);
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('blocked');
    expect(screen.getByText(/cap reached/i)).toBeTruthy();
  });
});
