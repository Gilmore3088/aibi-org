/* Root MDX components map — required by @next/mdx with the App Router
 * (its absence is why the original essay pipeline never rendered a page).
 *
 * Kept minimal: default HTML elements, with stable ids injected on h2/h3 so
 * the mockup <ArticleTOC> (which scans headings by id) works on MDX bodies.
 * Briefing-specific styling comes from the `.mk-prose` wrapper class, not
 * from per-element components here.
 */

import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';

function slugify(node: ReactNode): string {
  const text =
    typeof node === 'string'
      ? node
      : Array.isArray(node)
        ? node.filter((n) => typeof n === 'string').join(' ')
        : '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children, ...props }) => (
      <h2 id={slugify(children)} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 id={slugify(children)} {...props}>
        {children}
      </h3>
    ),
    ...components,
  };
}
