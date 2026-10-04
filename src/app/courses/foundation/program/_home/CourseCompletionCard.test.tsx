import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CourseCompletionCard } from './CourseCompletionCard';

describe('CourseCompletionCard', () => {
  it('links a completer to the packet, certificate, and growth check', () => {
    render(<CourseCompletionCard completedCount={18} totalModules={18} />);

    expect(screen.getByRole('link', { name: 'Submit final packet' }).getAttribute('href')).toBe(
      '/courses/foundation/program/submit',
    );
    expect(screen.getByRole('link', { name: 'View certificate status' }).getAttribute('href')).toBe(
      '/courses/foundation/program/certificate',
    );
    expect(screen.getByRole('link', { name: 'Measure your growth' }).getAttribute('href')).toBe(
      '/courses/foundation/program/post-assessment',
    );
  });

  it('stays hidden until every module is complete', () => {
    const { container } = render(<CourseCompletionCard completedCount={17} totalModules={18} />);
    expect(container.innerHTML).toBe('');
  });
});
