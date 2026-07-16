import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownRenderer } from './MarkdownRenderer';

describe('MarkdownRenderer (safe React-element output)', () => {
  it('renders inline bold/italic/code with the expected tags + classes', () => {
    const { container } = render(
      <MarkdownRenderer content={'Plain **bold** and *em* and `code` here.'} />,
    );
    const strong = container.querySelector('strong');
    expect(strong?.className).toBe('font-semibold');
    expect(strong?.textContent).toBe('bold');
    expect(container.querySelector('em')?.className).toBe('font-serif italic');
    expect(container.querySelector('code')?.className).toContain('font-mono');
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  it('renders headings, blockquotes, and lists with preserved classes', () => {
    const md = [
      '## H2 title',
      '### H3 title',
      '> a wise quote',
      '- one\n- two',
      '1. first\n2. second',
    ].join('\n\n');
    const { container } = render(<MarkdownRenderer content={md} />);
    expect(container.querySelector('h2')?.className).toContain('text-2xl');
    expect(container.querySelector('h3')?.className).toContain('text-xl');
    expect(container.querySelector('blockquote')?.className).toContain('border-[color:var(--gold)]');
    expect(container.querySelector('ul')?.className).toContain('list-disc');
    expect(container.querySelectorAll('ul li').length).toBe(2);
    expect(container.querySelector('ol')?.className).toContain('list-decimal');
    expect(container.querySelectorAll('ol li').length).toBe(2);
  });

  it('does NOT inject raw HTML — markup in content is escaped as text', () => {
    const { container } = render(
      <MarkdownRenderer content={'<img src=x onerror=alert(1)> and <script>bad()</script>'} />,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('handles a mixed prose + list block as flat siblings', () => {
    const { container } = render(
      <MarkdownRenderer content={'Intro line\n- item a\n- item b\nOutro line'} />,
    );
    expect(container.querySelectorAll('p').length).toBe(2);
    expect(container.querySelectorAll('ul li').length).toBe(2);
  });
});
