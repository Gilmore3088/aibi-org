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
        <div
          className={
            showNewsletter
              ? "max-w-wide mx-auto grid gap-s10 md:gap-s12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]"
              : "max-w-wide mx-auto grid gap-s10 md:gap-s12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]"
          }
        >
          {/* Brand column — Ledger lockup */}
          <div>
            <div className="flex flex-col" style={{ lineHeight: 0.95 }}>
              <span
                className="font-sans uppercase text-ink"
                style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.005em', lineHeight: 1 }}
              >
                The AI Banking
              </span>
              <span
                className="font-sans uppercase text-dust"
                style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.005em', lineHeight: 1, marginTop: 1 }}
              >
                Institute
              </span>
            </div>
            <p
              className="font-mono text-terra mt-s4 mb-s5"
              style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}
            >
              Turning Bankers into Builders
            </p>
            <p className="font-serif text-body-lg text-ink/80 leading-relaxed italic max-w-[36ch]">
              An education company for community banks and credit unions.
            </p>
          </div>

          {/* Nav columns */}
          {LINK_GROUPS.map((group) => (
            <nav key={group.label} aria-label={group.label}>
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
            </nav>
          ))}

          {/* Newsletter column */}
          {showNewsletter && (
            <NewsletterCard
              heading="The AI Banking Brief."
              blurb="Fortnightly research, no marketing."
            />
          )}
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
