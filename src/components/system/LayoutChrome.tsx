'use client';

/**
 * <LayoutChrome> — decides which global chrome subtree mounts around the page.
 *
 * The chrome-visibility decision used to live in the server RootLayout, derived
 * from the `x-pathname` request header set by middleware. That header is NOT
 * guaranteed to be identical between the streamed SSR document pass and the RSC
 * payload the client reconciles against (prefetched / soft-navigation RSC
 * requests, or any request that bypasses middleware, fall back to '/'). Because
 * the branch toggles which client subtree mounts (global SiteNav + skip-link +
 * system SiteFooter vs MockupSiteFooter), a divergent header produced different
 * server vs client chrome trees and React threw the #418 hydration error
 * (intermittently surfaced on /resources via soft navigation).
 *
 * usePathname() returns the same value during SSR and the first client render
 * (Next derives it from the matched route, not a mutable header), so the chrome
 * decision is now deterministic across SSR and hydration — server HTML and
 * client hydration always agree.
 *
 * The chrome elements themselves are Server Components (SiteNav reads
 * next/headers for nav-active state), so RootLayout renders them and passes
 * them in as slots. This client wrapper only chooses which slots to mount; it
 * never imports the server chrome directly.
 */

import { usePathname } from 'next/navigation';
import { isChromeless, isFooterless } from '@/lib/layout/chromePaths';

export interface LayoutChromeProps {
  /** Skip-to-main-content link. Rendered on every route. */
  readonly skipLink: React.ReactNode;
  /** Mockup <MockupSiteFooter>. Shown on chromeless, non-footerless routes. */
  readonly mockupFooter: React.ReactNode;
  readonly children: React.ReactNode;
}

// Every route now renders its own mockup SiteHeader from @/components/mockup
// (all routes are in CHROMELESS_PATHS), so the legacy global SiteNav/SiteFooter
// were removed — they had migrated to zero render sites. This wrapper now only
// decides mockup-footer visibility; the showMockupFooter condition is
// unchanged from when the legacy branch still existed.
export function LayoutChrome({
  skipLink,
  mockupFooter,
  children,
}: LayoutChromeProps) {
  const pathname = usePathname() ?? '/';
  const showMockupFooter = isChromeless(pathname) && !isFooterless(pathname);

  return (
    <>
      {/* The #main-content target below exists on every route, so the skip
          link must too — mockup pages render their own header but keyboard
          users still need to skip it. */}
      {skipLink}
      <div id="main-content" className="flex-1">
        {children}
      </div>
      {showMockupFooter && mockupFooter}
    </>
  );
}
