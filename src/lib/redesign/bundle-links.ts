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

const BUNDLE_TO_ROUTE: Record<string, string> = {
  'AI Banking Institute.html': '/preview-home',
  'AI Readiness Briefing.html': '/briefing-preview',
  'User Home.html': '/user-home',
  'Design System.html': '/design-system',
  'My Toolbox.html': '/my-toolbox',
  'My Toolbox v1.html': '/my-toolbox',
  'My Toolbox v2.html': '/my-toolbox',
  'My Toolbox v3.html': '/my-toolbox',

  // not yet built — clicks no-op rather than 404
  'Playground.html': '/playground',
  'Playground v1.html': '/playground',
  'FAQ.html': '/faq',

  // not yet built — clicks no-op rather than 404
  'LMS Prototype.html': '#',
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
