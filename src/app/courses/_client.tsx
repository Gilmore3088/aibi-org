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
    { moduleNumber: 1, label: "AI Limits Card" },
    { moduleNumber: 4, label: "First Prompt Card" },
    { moduleNumber: 13, label: "Skill Template" },
    { moduleNumber: 18, label: "Foundation Packet Summary" },
  ],
};

// Verbatim planted error from public/sandbox-data/foundation-program/module-3/
// ai-output-with-errors.md. Quoted only to be struck: SR 11-7 was superseded by SR 26-2 (April 2026).
const PLANTED_CLAIM =
  "Section 7.3 of SR 11-7 specifically mandates that institutions using AI-based decision models must conduct quarterly bias audits and submit findings to their primary federal regulator within 30 calendar days.";

export default function CoursesIndexPage({
  facts = DEFAULT_FACTS,
}: {
  readonly facts?: CoursesOverviewFacts;
}) {
  const pricingBullets = [
    `All ${facts.moduleCount} modules, self-paced`,
    `${facts.artifactCount}-piece Foundation Packet`,
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
      <div className="mk-container">
        <p className="ax-proofline">
          {facts.moduleCount} modules · {facts.durationLabel ?? "self-paced"} ·{" "}
          {facts.artifactCount}-piece Foundation Packet
        </p>
      </div>

      <AxSection
        light
        id="reps"
        kicker="Practice reps"
        title="Practice in a real AI tool. On sample data."
      >
        <PracticeReps />
      </AxSection>

      {/* The planted-error practice file from Module 3 */}
      <section
        className="ax-section ax-fabrication"
        aria-labelledby="fabrication-title"
      >
        <div className="mk-container ax-fabrication-inner">
          <div>
            <p className="ax-k ax-red">Module 3 · practice file</p>
            <h2 id="fabrication-title" className="ax-display">
              Every AI answer <span className="ax-red">gets checked.</span>
            </h2>
            <p className="ax-muted">
              Learners find the planted errors before anything leaves the
              building.
            </p>
          </div>
          <figure className="ax-paper">
            <figcaption className="ax-k">ai-output-with-errors.md</figcaption>
            <p className="ax-paper-title">
              Community Bank AI Compliance Summary
            </p>
            <p className="ax-paper-meta">
              <strong>Prepared by:</strong> AI Research Assistant
            </p>
            <p className="ax-paper-h">Model Risk Management Requirements</p>
            <p>
              Federal regulators have established clear expectations for AI
              model governance. <s className="hm-strike">{PLANTED_CLAIM}</s>
            </p>
            <p className="ax-paper-flag">
              <strong>Fabricated citation.</strong> SR 11-7 has no Section 7.3
              and no such mandate — and SR 11-7 itself was superseded by SR 26-2
              in April 2026.
            </p>
          </figure>
        </div>
      </section>

      <AxSection
        light
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
