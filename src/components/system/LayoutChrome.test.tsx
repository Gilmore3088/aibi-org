import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/resources' }));

import { LayoutChrome } from './LayoutChrome';

describe('LayoutChrome main landmark', () => {
  it('makes the content wrapper the main landmark when the page has none', () => {
    const { container } = render(
      <LayoutChrome skipLink={null} mockupFooter={null}>
        <section>Resources</section>
      </LayoutChrome>,
    );
    expect(container.querySelector('#main-content')?.getAttribute('role')).toBe('main');
    expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1);
  });

  it('leaves the role off when the page renders its own <main>', () => {
    const { container } = render(
      <LayoutChrome skipLink={null} mockupFooter={null}>
        <main>Course</main>
      </LayoutChrome>,
    );
    expect(container.querySelector('#main-content')?.hasAttribute('role')).toBe(false);
    expect(container.querySelectorAll('main, [role="main"]')).toHaveLength(1);
  });
});
