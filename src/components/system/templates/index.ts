/**
 * Page template barrel — six archetypes.
 *
 * Pages import the template they need from "@/components/system/templates"
 * and pass structured content as props. Templates handle all chrome and
 * layout decisions; pages provide content.
 */

export { MarketingPage } from "./MarketingPage";
export type {
  MarketingPageProps,
  MarketingHero,
  MarketingClose,
} from "./MarketingPage";

export { EssayPage } from "./EssayPage";
export type { EssayPageProps, EssaySource } from "./EssayPage";

export { ProgramPage } from "./ProgramPage";
export type {
  ProgramPageProps,
  ProgramModule,
  ProgramArtifact,
} from "./ProgramPage";

export { LMSPage } from "./LMSPage";
export type { LMSPageProps } from "./LMSPage";

export { DiagnosticPage } from "./DiagnosticPage";
export type { DiagnosticPageProps } from "./DiagnosticPage";

export { ResultsPage } from "./ResultsPage";
export type {
  ResultsPageProps,
  ResultsHeroAction,
  NextStep,
  ResultsArtifact,
} from "./ResultsPage";
