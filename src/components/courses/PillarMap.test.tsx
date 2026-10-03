import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program';
import { PillarMap, pillarModules } from './PillarMap';

describe('PillarMap', () => {
  it('places every module under exactly one pillar, in order', () => {
    const order = (['awareness', 'understanding', 'creation', 'application'] as const).flatMap((p) =>
      pillarModules(p).map((m) => m.number),
    );
    expect(order).toEqual(FOUNDATION_MICRO_MODULES.map((m) => m.number).sort((a, b) => a - b));
  });

  it('renders the four pillars with their module titles', () => {
    const { container } = render(<PillarMap current={1} />);
    expect(container.querySelectorAll('.ax-pillar')).toHaveLength(4);
    expect(container.textContent).toContain('Awareness');
    expect(container.textContent).toContain('Application');
    expect(container.querySelectorAll('.ax-pillar-mods li')).toHaveLength(FOUNDATION_MICRO_MODULES.length);
    expect(container.querySelector('.ax-pillar.is-current')!.textContent).toContain('Awareness');
  });
});
