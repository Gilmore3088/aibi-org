/**
 * Single source of truth for the global-chrome route lists.
 *
 * These lists decide which routes render WITHOUT the global Header/Footer
 * chrome (CHROMELESS_PATHS) and which chromeless routes additionally render
 * with no footer at all (FOOTERLESS_PATHS).
 *
 * The lists live here — not in src/app/layout.tsx — so the server RootLayout
 * and the client LayoutChrome wrapper import the identical arrays and stay in
 * lockstep. The chrome-visibility decision itself is made in LayoutChrome from
 * usePathname(), which returns the same value during SSR and the first client
 * render, so server HTML and client hydration always agree (no React #418).
 */

// Routes that render WITHOUT the global Header/Footer chrome. These pages
// provide their own internal brand lockup, so showing the global Header on
// top would produce a duplicate logo (or, in the case of the design system
// reference, would frame a pixel-faithful mockup with extraneous chrome).
export const CHROMELESS_PATHS: readonly string[] = [
  // 2026-05-26 redesign sprint — every route ported to the mockup design
  // system renders its own SiteHeader from @/components/mockup. As each
  // route migrates, it joins this list. When all routes have migrated
  // the global SiteNav is removed entirely.
  '/',
  '/assessment',
  '/results',
  '/pricing',
  '/courses',
  '/practice',
  '/my-toolbox',
  '/for-institutions',
  '/playbooks',
  '/dashboard',
  '/courses/foundation/program',
  '/auth',
  '/security',
  '/about',
  '/faq',
  '/certifications',
  '/resources',
  '/prompt-cards',
  '/support/purchase-help',
  '/privacy',
  '/terms',
  '/ai-use-disclaimer',
  '/verify',
  '/admin',

  // Pre-existing chromeless routes (own brand lockup or no chrome by design)
  '/design-system',
  // /auth and signed-in app shells own their page-level chrome and are
  // footerless below.
];

// Chromeless routes that should still have NO footer at all. Truly-bare
// surfaces — operator tools, the pre-launch holding page, and signed-in
// app shells that own their own bottom chrome.
export const FOOTERLESS_PATHS: readonly string[] = [
  '/coming-soon',
  '/design-system',
  '/auth',
  '/dashboard',
  '/courses/foundation/program',
  '/assessment/take',
  '/assessment/in-depth/take',
  '/admin',
];

/** True when `pathname` matches `path` exactly or is a sub-path of it. */
export function matchesChromePath(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** True when the route renders without the global Header/Footer chrome. */
export function isChromeless(pathname: string): boolean {
  return CHROMELESS_PATHS.some((path) => matchesChromePath(pathname, path));
}

/** True when the chromeless route renders with no footer at all. */
export function isFooterless(pathname: string): boolean {
  return FOOTERLESS_PATHS.some((path) => matchesChromePath(pathname, path));
}
