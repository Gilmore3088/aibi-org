import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ROICalculatorBody } from './ROICalculatorBody';

function assessmentLinkParams(): URLSearchParams {
  const href = screen.getByRole('link', { name: /take the assessment/i }).getAttribute('href');
  if (!href) throw new Error('assessment href missing');
  return new URL(href, 'https://www.aibankinginstitute.com').searchParams;
}

describe('ROICalculatorBody', () => {
  it('carries calculator inputs into the assessment CTA', () => {
    render(<ROICalculatorBody ctaLabel="Take the Assessment" ctaHref="/assessment/take" />);

    const params = assessmentLinkParams();
    expect(params.get('roi')).toBe('calculator');
    expect(params.get('roi_fte')).toBe('50');
    expect(params.get('roi_cost')).toBe('85000');
    expect(params.get('roi_lo')).toBe('2');
    expect(params.get('roi_hi')).toBe('5');
  });

  it('updates the assessment CTA when the user changes calculator inputs', () => {
    render(<ROICalculatorBody ctaLabel="Take the Assessment" ctaHref="/assessment/take" />);

    fireEvent.change(screen.getByLabelText('Full-time employees'), {
      target: { value: '125' },
    });
    fireEvent.change(screen.getByLabelText('Hours automatable per FTE per week — high'), {
      target: { value: '8' },
    });

    const params = assessmentLinkParams();
    expect(params.get('roi_fte')).toBe('125');
    expect(params.get('roi_hi')).toBe('8');
  });

  it('does not add ROI query params to mailto briefing links', () => {
    render(
      <ROICalculatorBody
        ctaLabel="Take the Assessment"
        ctaHref="mailto:hello@aibankinginstitute.com?subject=ROI"
      />,
    );

    expect(screen.getByRole('link', { name: /take the assessment/i }).getAttribute('href')).toBe(
      'mailto:hello@aibankinginstitute.com?subject=ROI',
    );
  });
});
