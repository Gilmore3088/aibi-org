/* Lightweight chrome wrapper for /research/<slug> long-form articles.
 *
 * The archive at /research uses MockupShell. Article bodies are
 * bespoke long-form layouts that don't fit a section-based shell,
 * so they wrap themselves in this component to inherit the
 * site-wide mockup SiteHeader + a "back to The AI Banking Brief"
 * crumb at the top.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { SiteHeader } from './SiteHeader';

export function ArticleShell({ children }: { children: ReactNode }) {
  return (
    <div className="mockup-scope" style={{ background: 'var(--cream)' }}>
      <SiteHeader activePath="/research" />
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          marginTop: 24,
        }}
      >
        <Link
          href="/research"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--slate-600)',
            textDecoration: 'none',
            borderBottom: '2px solid transparent',
            paddingBottom: 2,
          }}
        >
          ← The AI Banking Brief
        </Link>
      </div>
      {children}
    </div>
  );
}
