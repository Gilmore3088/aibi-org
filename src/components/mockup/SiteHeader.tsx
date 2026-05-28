import Link from 'next/link';
import { Button } from './Button';

// Public marketing nav — buyer-facing destinations only.
// Sandbox + Toolbox are product surfaces that confuse first-time visitors;
// they live inside the signed-in experience (dashboard chrome) and as
// references inside the course/assessment pages, not in the top nav.
const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: 'Home', href: '/' },
  { label: 'Assessment', href: '/assessment' },
  { label: 'Course', href: '/courses' },
  { label: 'Resources', href: '/research' },
  { label: 'Institutions', href: '/for-institutions' },
];

export interface SiteHeaderProps {
  /** Active route path (e.g. '/courses'). The matching nav item gets the
   * active styling. Pass `undefined` to render no active state. */
  activePath?: string;
  /** Primary CTA in the top-right. Defaults to "Get readiness score" → /assessment. */
  cta?: { label: string; href: string };
}

export function SiteHeader({
  activePath,
  cta = { label: 'Get readiness score', href: '/assessment/take' },
}: SiteHeaderProps) {
  return (
    <header className="mk-header">
      <div className="mk-container mk-header-inner">
        <Link className="mk-brand" href="/" aria-label="The AI Banking Institute home">
          <span className="mk-seal" aria-hidden>
            {/* Landmark / institution icon */}
            <svg
              className="mk-ic-lg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
          </span>
          <span className="mk-wm-1">The AI Banking Institute</span>
        </Link>

        <nav className="mk-nav" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'is-active' : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="gold" href={cta.href}>
          {cta.label}
        </Button>
      </div>

      <div className="mk-container">
        <nav className="mk-nav-mobile" aria-label="Primary (mobile)">
          {PRIMARY_NAV.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'is-active' : ''}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
