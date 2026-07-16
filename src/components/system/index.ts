/**
 * AiBI design system — surviving primitives + site chrome.
 *
 * The broader primitive/composite set and five of the page templates were
 * removed in the Tier-A dead-code pass (2026-07) — they had zero importers
 * after the migration to the mockup design system. What remains is the
 * global chrome (rendered by app/layout.tsx) plus the pieces the EssayPage
 * template still composes (Section, EssayMeta).
 */

// ---- Primitives (still used by templates/EssayPage) -------------------------
export { Section } from "./Section";
export type { SectionProps } from "./Section";

export { EssayMeta } from "./EssayMeta";
export type { EssayMetaProps } from "./EssayMeta";

// ---- Site chrome ------------------------------------------------------------
// The legacy global SiteNav/SiteFooter were removed once every route migrated
// to the mockup design system (each renders its own mockup SiteHeader). This
// wrapper now only positions the skip link + mockup footer.
export { LayoutChrome } from "./LayoutChrome";
export type { LayoutChromeProps } from "./LayoutChrome";
