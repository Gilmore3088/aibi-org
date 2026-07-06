import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SampleWeek } from './SampleWeek';

describe('SampleWeek', () => {
  it('links buyers to the real public Module 1 preview', () => {
    render(<SampleWeek />);

    expect(
      screen
        .getByRole('link', { name: /read module 1.s full understand section free/i })
        .getAttribute('href'),
    ).toBe('/courses/foundation/preview');
  });
});
