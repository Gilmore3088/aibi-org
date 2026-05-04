import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SourceBacklink } from './SourceBacklink';

describe('SourceBacklink', () => {
  it('renders nothing when source is missing', () => {
    const { container } = render(
      <SourceBacklink sourceRef="library:abc@1" librarySlugMap={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for user source', () => {
    const { container } = render(
      <SourceBacklink source="user" sourceRef="anything" librarySlugMap={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when sourceRef is missing', () => {
    const { container } = render(
      <SourceBacklink source="course" librarySlugMap={{}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders course backlink with module number', () => {
    const { getByRole } = render(
      <SourceBacklink source="course" sourceRef="aibi-p/module-3/p-001" librarySlugMap={{}} />
    );
    const link = getByRole('link');
    expect(link.getAttribute('href')).toBe('/courses/aibi-p/3');
    expect(link.textContent).toContain('Module 3');
  });

  it('renders library backlink resolving uuid to slug', () => {
    const uuid = '11111111-2222-3333-4444-555555555555';
    const { getByRole } = render(
      <SourceBacklink
        source="library"
        sourceRef={`library:${uuid}@ver-1`}
        librarySlugMap={{ [uuid]: 'credit-memo-drafter' }}
      />
    );
    const link = getByRole('link');
    expect(link.getAttribute('href')).toBe('/dashboard/toolbox/library/credit-memo-drafter');
    expect(link.textContent).toBe('Library entry');
  });

  it('renders forked source as library backlink', () => {
    const uuid = '11111111-2222-3333-4444-555555555555';
    const { getByRole } = render(
      <SourceBacklink
        source="forked"
        sourceRef={`library:${uuid}@ver-1`}
        librarySlugMap={{ [uuid]: 'exam-prep' }}
      />
    );
    expect(getByRole('link').getAttribute('href')).toBe('/dashboard/toolbox/library/exam-prep');
  });

  it('renders nothing when library slug is unknown', () => {
    const { container } = render(
      <SourceBacklink
        source="library"
        sourceRef="library:11111111-2222-3333-4444-555555555555@ver-1"
        librarySlugMap={{}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when course sourceRef does not match pattern', () => {
    const { container } = render(
      <SourceBacklink source="course" sourceRef="weird-ref" librarySlugMap={{}} />
    );
    expect(container.firstChild).toBeNull();
  });
});
