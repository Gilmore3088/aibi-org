/**
 * <SiteFooter> — bottom-of-page brand chrome.
 *
 * Replaces src/components/Footer.tsx. Composes:
 *   - <TrustStrip> at the top (regulatory citations)
 *   - Brand wordmark + tagline + mission paragraph
 *   - Three-group link nav (Start here / Education / Institute)
 *   - Optional <NewsletterCard> slot on the right
 *   - Mono copyright row
 */

import Link from "next/link";
import { NewsletterCard } from "./NewsletterCard";

interface LinkGroup {
  readonly label: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

const LINK_GROUPS: readonly LinkGroup[] = [
  {
    label: "Start here",
    links: [
      { href: "/assessment/start", label: "Take the assessment" },
      { href: "/education", label: "Education" },
      { href: "/for-institutions", label: "For institutions" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    label: "Institute",
    links: [
      { href: "/about", label: "About" },
      { href: "/security", label: "Security & Governance" },
      { href: "/verify", label: "Verify a credential" },
    ],
  },
] as const;

const LEGAL_LINKS: readonly { readonly href: string; readonly label: string }[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/ai-use-disclaimer", label: "AI Use Disclaimer" },
];

export interface SiteFooterProps {
  /** Show the newsletter signup card. Defaults to true. */
  readonly showNewsletter?: boolean;
}

export function SiteFooter({ showNewsletter = true }: SiteFooterProps = {}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline mt-s16">
      <div className="bg-parch px-s7 py-s12">
        <div className="max-w-wide mx-auto grid gap-s12 md:grid-cols-[1.4fr_2fr] md:gap-s16">
          <div>
            <p className="font-serif text-display-xs text-ink">The AI Banking Institute</p>
            <p className="font-serif-sc text-body-md text-terra mt-s1 mb-s5">
              Turning Bankers into Builders
            </p>
            <p className="text-body-sm text-ink/70 leading-relaxed mb-s6 max-w-[44ch]">
              An education company for community banks and credit unions.
            </p>
            {showNewsletter && (
              <NewsletterCard
                heading="The AI Banking Brief."
                blurb="Fortnightly research, no marketing."
              />
            )}
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-s10 gap-y-s8"
          >
            {LINK_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-mono text-label-sm uppercase tracking-widest text-slate mb-s3">
                  {group.label}
                </p>
                <ul className="space-y-s2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-ink/75 hover:text-terra transition-colors duration-fast"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="max-w-wide mx-auto border-t border-hairline mt-s10 pt-s6 flex flex-col md:flex-row md:items-center md:justify-between gap-s3 font-mono text-mono-sm text-slate">
          <p>© {year} The AI Banking Institute · aibankinginstitute.com</p>
          <ul className="flex items-center gap-s5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-slate hover:text-terra transition-colors duration-fast"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
