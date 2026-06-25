import Link from 'next/link';
import { Wordmark } from '@/components/brand';

const NAV_GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: 'Start here',
    links: [
      { href: '/assessment/take', label: 'Free assessment' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/assessment/in-depth', label: 'In-depth assessment' },
      { href: '/courses', label: 'AiBI-Foundation course' },
      { href: '/for-institutions', label: 'For institutions' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { href: '/resources', label: 'Downloads & templates' },
      { href: '/prompt-cards', label: 'Prompt cards' },
      { href: '/resources/templates/ai-use-policy-starter', label: 'Templates' },
      { href: '/playbooks', label: 'Role playbooks' },
      { href: '/playground', label: 'AI demo sandbox' },
      { href: '/for-institutions/samples/efficiency-ratio-workbook', label: 'Efficiency ratio workbook' },
    ],
  },
  {
    label: 'Institute',
    links: [
      { href: '/about', label: 'About the Institute' },
      { href: '/faq', label: 'FAQ' },
      { href: '/security', label: 'Security & governance' },
      { href: '/references', label: 'Sources & references' },
      { href: '/security/data-handling', label: 'LLM data handling' },
      { href: '/security/it-approval', label: 'IT review packet' },
      { href: '/certifications', label: 'Certifications' },
      { href: '/verify', label: 'Verify certificate' },
      { href: 'mailto:hello@aibankinginstitute.com?subject=Press%20%2F%20media%20inquiry%20%E2%80%94%20The%20AI%20Banking%20Institute', label: 'Press / media inquiries' },
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
              {/* Brand v1 (2026-05-28) — bracketed [Ai] mark on dark navy
                  footer (.mk-footer background = var(--ink)). tone="light"
                  renders cream text + gold brackets. */}
              <Wordmark variant="full" tone="light" size={22} />
            </Link>
            <p className="mk-footer-tag">
              AI proficiency for community banks and credit unions. Sourced research, banker-vetted
              artifacts, review-ready workflows.
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
