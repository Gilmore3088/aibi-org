"use client";

import { SiteHeader, Button, ArrowGlyph } from "@/components/mockup";
import { AxHero, AxSection, AxWindow } from "@/components/ax";
import { PillarMap } from "@/components/courses/PillarMap";
import { PracticeReps } from "./PracticeReps";

// /courses — AiBI Foundation overview, AI-native rebuild. The page shows the
// course working (real practice reps, a real planted-error practice file)
// instead of describing it with icon cards.

export interface CoursesOverviewFacts {
  readonly moduleCount: number;
  readonly artifactCount: number;
  readonly individualPriceLabel: string;
  readonly durationLabel?: string;
  readonly samplePacketSlots: readonly {
    readonly moduleNumber: number;
    readonly label: string;
  }[];
}

const DEFAULT_FACTS: CoursesOverviewFacts = {
  moduleCount: 18,
  artifactCount: 18,
  individualPriceLabel: "$295",
  samplePacketSlots: [
    { moduleNumber: 1, label: "AI House Rules" },
    { moduleNumber: 3, label: "Meeting Actions Assistant" },
    { moduleNumber: 13, label: "Procedure Simplifier Skill" },
    { moduleNumber: 18, label: "Foundation Packet Summary" },
  ],
};

export default function CoursesIndexPage({
  facts = DEFAULT_FACTS,
}: {
  readonly facts?: CoursesOverviewFacts;
}) {
  const pricingBullets = [
    facts.durationLabel ?? "Self-paced",
    "Every artifact saved to your Foundation Packet",
    "Certificate on final submission",
  ];

  return (
    <div className="mockup-scope ax-page">
      <SiteHeader
        activePath="/courses"
        cta={{
          label: `Enroll · ${facts.individualPriceLabel}`,
          href: "/courses/foundation/program/purchase",
        }}
      />

      <AxHero
        cmd={`course foundation --modules ${facts.moduleCount} --data synthetic`}
        title="AI training for community bank staff."
        lede={
          <>
            {facts.moduleCount} short modules. Practice on sample data. Keep
            everything you build.
          </>
        }
        actions={
          <>
            <Button
              variant="gold"
              size="lg"
              href="/courses/foundation/program/purchase"
            >
              Enroll · {facts.individualPriceLabel} <ArrowGlyph />
            </Button>
            <Button
              variant="ghost-dark"
              size="lg"
              href="/courses/foundation/preview"
            >
              Preview Module 1 free
            </Button>
          </>
        }
        aside={
          <AxWindow
            title="foundation-packet/"
            meta={`${facts.artifactCount} artifacts`}
          >
            <ul className="ax-packet">
              {facts.samplePacketSlots.map((slot) => (
                <li key={slot.moduleNumber}>
                  <span className="ax-k">
                    m{String(slot.moduleNumber).padStart(2, "0")}
                  </span>
                  <span>{slot.label}</span>
                  <span className="ax-gold" aria-label="saved">
                    ✓
                  </span>
                </li>
              ))}
              <li className="ax-packet-more">
                <span className="ax-k">…</span>
                <span className="ax-muted">
                  {facts.artifactCount - facts.samplePacketSlots.length} more,
                  one per module
                </span>
              </li>
            </ul>
          </AxWindow>
        }
      />

      <AxSection
        light
        id="reps"
        kicker="Practice reps"
        title="Practice in a real AI tool. On sample data."
      >
        <PracticeReps />
      </AxSection>

      <AxSection
        id="pillars"
        kicker="The path"
        title="Four pillars, in order."
      >
        <PillarMap compact />
      </AxSection>

      <section
        id="enroll"
        className="ax-section ax-light is-paper"
        aria-label="Enroll"
      >
        <div className="mk-container">
          <div className="ax-enroll">
            <div>
              <h2 className="ax-display">Enroll in AiBI Foundation.</h2>
              <p className="ax-muted">One-time payment. No subscription.</p>
              <div className="ax-actions">
                <Button
                  variant="gold"
                  size="lg"
                  href="/courses/foundation/program/purchase"
                >
                  Enroll in Foundation
                </Button>
                <Button variant="ghost-dark" size="lg" href="/for-institutions">
                  Ask about team enrollment
                </Button>
              </div>
            </div>
            <div>
              <p className="ax-enroll-price">{facts.individualPriceLabel}</p>
              <ul className="ax-checklist">
                {pricingBullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="ax-fineprint">
                AiBI Foundation is not a license, regulator approval, regulator
                recognition, or third-party endorsement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
