/**
 * <SiteNav> — top-of-page brand chrome.
 *
 * Composes:
 *   - Two-line Geist 700 uppercase wordmark on the left (no seal — retired 2026-05-09)
 *   - Editorial nav links in the center
 *   - Auth chrome on the right
 *   - Persistent gold "Take Assessment" CTA, visible from md:
 *
 * Active route is announced visually with a 1px ink underline. The Tailwind
 * `aria-[current=page]:` selector picks up the `aria-current` attribute on the
 * active link.
 *
 * Sticky positioning is solid linen — no translucency, no backdrop-blur.
 * Translucent nav backgrounds can't guarantee WCAG contrast (depends on what
 * scrolls underneath) and conflict with Ledger's "lines do real work"
 * principle. See #185.
 */

import Link from "next/link";
import { headers } from "next/headers";
import { AuthButton } from "@/components/AuthButton";
import { MobileNav } from "@/components/MobileNav";
import { Wordmark } from "@/components/brand";
import { cn } from "@/lib/utils/cn";

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { href: "/courses", label: "Course" },
  { href: "/for-institutions", label: "For Institutions" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
] as const;

function isActive(linkHref: string, currentPath: string): boolean {
  if (linkHref === "/") return currentPath === "/";
  return currentPath === linkHref || currentPath.startsWith(`${linkHref}/`);
}

export async function SiteNav() {
  const pathname = (await headers()).get("x-pathname") ?? "/";

  return (
    <header className="sticky top-0 z-sticky border-b border-hairline bg-linen">
      <div className="max-w-wide mx-auto px-s7 py-s5 flex items-center justify-between gap-s6">
        {/* Brand v1 (2026-05-28) — bracketed [Ai] mark. Replaces the retired
            two-line Geist 700 Ledger lockup. See docs/brand/brand-guide-v1.html. */}
        <Link
          href="/"
          aria-label="The AI Banking Institute — Home"
          className="inline-flex items-center"
        >
          <Wordmark variant="full" tone="dark" size={22} />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-s4 lg:gap-s6">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-serif-sc text-mono-sm uppercase tracking-widest hidden lg:inline transition-colors duration-fast",
                  active
                    ? "text-ink border-b border-ink pb-[2px]"
                    : "text-ink/75 hover:text-gold"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/assessment/start"
            className="hidden md:inline-block font-sans text-mono-sm font-medium uppercase tracking-wider rounded-sharp bg-gold text-linen px-s5 py-s2 hover:bg-gold-2 transition-colors duration-fast"
          >
            Take Assessment
          </Link>
          <AuthButton />
          <MobileNav />
        </nav>
      </div>
    </header>
  );
}
