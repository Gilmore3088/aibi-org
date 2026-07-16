/**
 * Page template barrel.
 *
 * Only EssayPage survives — the other five archetypes (Marketing, Program,
 * LMS, Diagnostic, Results) had zero importers after the mockup-system
 * migration and were removed in the Tier-A dead-code pass (2026-07).
 * EssayPage still backs /resources/[slug].
 */

export { EssayPage } from "./EssayPage";
export type { EssayPageProps, EssaySource } from "./EssayPage";
