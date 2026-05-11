/**
 * <SiteNav> — top-of-page brand chrome.
 *
 * Replaces src/components/Header.tsx. Composes:
 *   - AibiSeal + serif-SC wordmark on the left
 *   - Editorial nav links in the center
 *   - Auth chrome on the right
 *   - Persistent terra "Take Assessment" CTA, visible from md:
 *
 * Active route is announced visually with a 1px terra underline. The Tailwind
 * `aria-[current=page]:` selector picks up the `aria-current` attribute on the
 * active link.
 *
 * Sticky positioning is solid linen at 97% — no backdrop-blur (per token rules).
 */

import Link from "next/link";
import { headers } from "next/headers";
import { AuthButton } from "@/components/AuthButton";
import { MobileNav } from "@/components/MobileNav";
import { cn } from "@/lib/utils/cn";

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

const NAV_LINKS: readonly NavLink[] = [
  { href: "/education", label: "Education" },
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
    <header className="sticky top-0 z-sticky border-b border-hairline bg-linen/[0.97]">
      <div className="max-w-wide mx-auto px-s7 py-s5 flex items-center justify-between gap-s6">
        {/* Ledger lockup — two-line Geist 700 uppercase. Per the Design System
            spec: sans-serif, no italics, no symbol, no monogram. */}
        <Link
          href="/"
          aria-label="The AI Banking Institute — Home"
          className="flex flex-col leading-none group"
          style={{ lineHeight: 0.95 }}
        >
          <span
            className="font-sans uppercase text-ink group-hover:text-terra transition-colors duration-fast"
            style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em', lineHeight: 1 }}
          >
            The AI Banking
          </span>
          <span
            className="font-sans uppercase text-dust"
            style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.005em', lineHeight: 1, marginTop: 1 }}
          >
            Institute
          </span>
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
                    : "text-ink/75 hover:text-terra"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/assessment/start"
            className="hidden md:inline-block font-sans text-mono-sm font-medium uppercase tracking-wider rounded-sharp bg-terra text-linen px-s5 py-s2 hover:bg-terra-light transition-colors duration-fast"
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
