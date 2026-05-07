/**
 * <CertificationLadder> — three-tile credential ladder with pillar stripes.
 *
 * Composes <PillarCard> + <DefinitionList>. Each rung shows level, credential
 * code, designation, format/effort/outcome/tuition spec, and a "program detail"
 * link. Pillar colors apply per the discipline rule (terra/cobalt/sage on
 * Practitioner/Specialist/Leader).
 */

import Link from "next/link";
import type { Pillar } from "@/lib/design-system/tokens";
import { PillarCard } from "./PillarCard";
import { DefinitionList, type DefinitionListItem } from "./DefinitionList";
import { cn } from "@/lib/utils/cn";

export interface LadderRung {
  readonly level: string;
  readonly stepLabel: string;
  readonly code: string;
  readonly title: string;
  readonly designation: string;
  readonly facts: readonly DefinitionListItem[];
  readonly blurb: string;
  readonly href: string;
  readonly pillar: Pillar;
  readonly comingSoon?: boolean;
}

export interface CertificationLadderProps {
  readonly rungs: readonly LadderRung[];
  readonly className?: string;
}

export function CertificationLadder({ rungs, className }: CertificationLadderProps) {
  const cols =
    rungs.length === 3 ? "md:grid-cols-3" : rungs.length === 2 ? "md:grid-cols-2" : "md:grid-cols-4";
  return (
    <div role="list" className={cn("grid gap-px bg-hairline border-y border-strong", cols, className)}>
      {rungs.map((rung) => (
        <PillarCard
          key={rung.code}
          pillar={rung.pillar}
          stripe
          surface="parch"
          className="border-l-0 border-r-0 border-t-0 border-b-0"
        >
          <p className="font-mono text-label-sm uppercase tracking-widest text-slate mb-s2">
            <span className="text-terra mr-s2">{rung.stepLabel}</span>
            {rung.level}
          </p>
          <PillarCard.Title level={3}>{rung.code}</PillarCard.Title>
          <PillarCard.Designation>{rung.designation}</PillarCard.Designation>
          <DefinitionList items={rung.facts} className="my-s4" />
          <p className="text-body-sm leading-relaxed text-ink/80 mb-s4">{rung.blurb}</p>
          <Link
            href={rung.href}
            className="text-terra border-b border-terra pb-[1px] text-body-sm font-medium hover:text-terra-light hover:border-terra-light transition-colors"
          >
            {rung.comingSoon ? "Join the waitlist" : "Program detail"} →
          </Link>
        </PillarCard>
      ))}
    </div>
  );
}
