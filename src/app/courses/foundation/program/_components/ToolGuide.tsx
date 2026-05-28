// ToolGuide — renders a single platform guide with collapsible accordion sections
// Displays: Getting Started, Free vs Paid, Banking Use Cases, Custom Instructions,
// Data Safety, and Pro Tips.
// Banking use case prompts appear in monospace copy-paste boxes (PromptCard pattern).
//
// Ported to mockup design system 2026-05-27 (Inter, ink/cream/gold). The
// `colorVar` from guide data is preserved as a per-platform accent on the
// platform badge and accordion underlines.

import type { ToolGuide as ToolGuideData } from '@content/courses/foundation-program/tool-guides';
import { AccordionSection } from './toolGuide/AccordionSection';
import { ToolGuideHeader } from './toolGuide/ToolGuideHeader';
import {
  GettingStartedPanel,
  PricingPanel,
  BankingUseCasesPanel,
  CustomInstructionsPanel,
  DataSafetyPanel,
  ProTipsPanel,
} from './toolGuide/ToolGuidePanels';

interface ToolGuideProps {
  readonly guide: ToolGuideData;
}

export function ToolGuide({ guide }: ToolGuideProps) {
  const accent = guide.colorVar;

  return (
    <article
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      aria-label={`${guide.platformLabel} guide`}
    >
      <ToolGuideHeader
        platformLabel={guide.platformLabel}
        colorVar={accent}
        url={guide.url}
        tagline={guide.tagline}
      />

      <AccordionSection title="Getting Started" accentVar={accent} defaultOpen>
        <GettingStartedPanel
          steps={guide.gettingStarted.steps}
          firstSessionNote={guide.gettingStarted.firstSessionNote}
          accent={accent}
        />
      </AccordionSection>

      <AccordionSection title="Free vs. Paid" accentVar={accent}>
        <PricingPanel pricing={guide.pricing} accent={accent} />
      </AccordionSection>

      <AccordionSection title="5 Banking Use Cases" accentVar={accent}>
        <BankingUseCasesPanel useCases={guide.bankingUseCases} accent={accent} />
      </AccordionSection>

      <AccordionSection title="Custom Instructions" accentVar={accent}>
        <CustomInstructionsPanel customInstructions={guide.customInstructions} />
      </AccordionSection>

      <AccordionSection title="Data Safety for Banking Use" accentVar={accent}>
        <DataSafetyPanel dataSafety={guide.dataSafety} accent={accent} />
      </AccordionSection>

      <AccordionSection title="5 Pro Tips" accentVar={accent}>
        <ProTipsPanel proTips={guide.proTips} accent={accent} />
      </AccordionSection>
    </article>
  );
}
