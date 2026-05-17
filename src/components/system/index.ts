/**
 * AiBI design system — primitive component barrel.
 *
 * Templates and pages import from "@/components/system". Adding a primitive:
 * write the component, add the export here, document intent in
 * docs/superpowers/design-system/04-primitives.md.
 */

// ---- Primitives -------------------------------------------------------------
export { Section } from "./Section";
export type { SectionProps } from "./Section";

export { SectionHeader } from "./SectionHeader";
export type { SectionHeaderProps } from "./SectionHeader";

export { KPIRibbon } from "./KPIRibbon";
export type { KPIItem, KPIRibbonProps } from "./KPIRibbon";

export { PillarCard } from "./PillarCard";
export type { PillarCardProps } from "./PillarCard";

export { DefinitionList } from "./DefinitionList";
export type { DefinitionListItem, DefinitionListProps } from "./DefinitionList";

export { TrustStrip } from "./TrustStrip";
export type { TrustStripProps } from "./TrustStrip";

export { Marginalia } from "./Marginalia";
export type { MarginaliaProps } from "./Marginalia";

export { EditorialQuote } from "./EditorialQuote";
export type { EditorialQuoteProps } from "./EditorialQuote";

export { ScoreRing } from "./ScoreRing";
export type { ScoreRingProps } from "./ScoreRing";

export { ProductMark } from "./ProductMark";
export type { ProductMarkKind } from "./ProductMark";

export { EssayMeta } from "./EssayMeta";
export type { EssayMetaProps } from "./EssayMeta";

export { Cta } from "./Cta";
export type { CtaProps } from "./Cta";

// ---- Composites -------------------------------------------------------------
export { TransformationArc } from "./TransformationArc";
export type { ArcStage, TransformationArcProps } from "./TransformationArc";

export { TransformationFlow } from "./TransformationFlow";
export type { FlowStage, TransformationFlowProps } from "./TransformationFlow";

export { ToolGrid } from "./ToolGrid";
export type { ToolGridProps } from "./ToolGrid";

export { SkillGrid } from "./SkillGrid";
export type { SkillGridProps } from "./SkillGrid";

export { CertificationLadder } from "./CertificationLadder";
export type { LadderRung, CertificationLadderProps } from "./CertificationLadder";

export { DimensionGrid } from "./DimensionGrid";
export type { DimensionScore, DimensionGridProps, DimensionTag } from "./DimensionGrid";

export { EssayArchive } from "./EssayArchive";
export type { EssayArchiveItem, EssayArchiveProps } from "./EssayArchive";

export { NewsletterCard } from "./NewsletterCard";
export type { NewsletterCardProps } from "./NewsletterCard";

// ---- Site chrome ------------------------------------------------------------
export { SiteNav } from "./SiteNav";
export { SiteFooter } from "./SiteFooter";
export type { SiteFooterProps } from "./SiteFooter";
