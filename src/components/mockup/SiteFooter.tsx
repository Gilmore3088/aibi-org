import Link from 'next/link';

const NAV_GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: 'Start here',
    links: [
      { href: '/assessment/take', label: 'Free assessment' },
      { href: '/assessment/in-depth', label: 'In-depth assessment' },
      { href: '/courses', label: 'AiBI-Foundation course' },
      { href: '/for-institutions', label: 'For institutions' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '/research', label: 'Downloads & templates' },
      { href: '/research/templates/ai-use-policy-starter', label: 'Templates' },
      { href: '/playbooks', label: 'Role playbooks' },
      { href: '/for-institutions/samples/efficiency-ratio-workbook', label: 'Efficiency ratio workbook' },
    ],
  },
  {
    label: 'Institute',
    links: [
      { href: '/about', label: 'About' },
      { href: '/faq', label: 'FAQ' },
      { href: '/security', label: 'Security & governance' },
      { href: '/for-institutions/advisory', label: 'Leadership advisory' },
      { href: 'mailto:hello@aibankinginstitute.com', label: 'hello@aibankinginstitute.com' },
    ],
  },
];

const LEGAL: { href: string; label: string }[] = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/ai-use-disclaimer', label: 'AI use disclaimer' },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mk-footer" aria-label="Site footer">
      <div className="mk-container">
        <div className="mk-footer-top">
          <div className="mk-footer-brand">
            <Link href="/" className="mk-brand" aria-label="The AI Banking Institute home">
              <span className="mk-seal" aria-hidden>
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
            <p className="mk-footer-tag">
              AI proficiency for community banks and credit unions. Sourced research, banker-vetted
              artifacts, examiner-readable workflows.
            </p>
          </div>

          <nav className="mk-footer-nav" aria-label="Footer">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mk-footer-col">
                <h2>{group.label}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mk-footer-bottom">
          <p>© {year} The AI Banking Institute. All rights reserved.</p>
          <ul className="mk-footer-legal">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
