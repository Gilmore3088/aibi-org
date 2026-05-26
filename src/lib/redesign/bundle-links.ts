/**
 * Bundle-link rewriter for redesign preview routes.
 *
 * The claude.ai/design bundles ship as a folder of HTML files that link
 * to each other by filename:  <a href="My Toolbox.html">. When those
 * bundles are translated into Next.js routes, the filename hrefs 404.
 *
 * This helper rewrites those hrefs to the actual Next routes at render
 * time, so the body HTML files stay verbatim (good for re-importing
 * bundle updates) and routing is centralized.
 *
 * Bundles that don't map to a route yet point to "#" so clicks no-op
 * gracefully instead of 404'ing. Add to the map as new routes ship.
 */

// Bundles still mapped to live routes. Entries for surfaces that were
// archived into docs/brand-refresh-2026-05-09/promoted/ during the
// 2026-05 migration (AI Banking Institute, AI Readiness Briefing,
// User Home, LMS Prototype, courses/foundation.html) were removed.
const BUNDLE_TO_ROUTE: Record<string, string> = {
  'Design System.html': '/design-system',
  'My Toolbox.html': '/my-toolbox',
  'My Toolbox v1.html': '/my-toolbox',
  'My Toolbox v2.html': '/my-toolbox',
  'My Toolbox v3.html': '/my-toolbox',
  'My Toolbox v4.html': '/my-toolbox',
  'My Toolbox v5.html': '/my-toolbox',
  'Playground.html': '/playground',
  'Playground v1.html': '/playground',
  'Playground v2.html': '/playground',
  'FAQ.html': '/faq',
};

export function rewriteBundleLinks(html: string): string {
  let out = html;
  for (const [filename, route] of Object.entries(BUNDLE_TO_ROUTE)) {
    // Match href="<filename>"  or  href="<filename>#anchor"
    // Anchor preserved; filename swapped for the target route.
    const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`href="${escaped}(#[^"]*)?"`, 'g');
    out = out.replace(pattern, (_, anchor) => `href="${route}${anchor ?? ''}"`);
  }
  return out;
}
