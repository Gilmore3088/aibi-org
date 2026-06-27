// Registers every composition Remotion can render. The studio sidebar and the
// `remotion render` CLI both read this list.
import React from "react";
import { Composition } from "remotion";
import { AssessmentResults, TOTAL_FRAMES } from "./AssessmentResults";
import { sampleResult } from "./data";
import { ScriptedExplainer } from "./ScriptedExplainer";
import { AiReadyExplainer } from "./AiReadyExplainer";
import { BlankCursor, adFrames } from "./BlankCursor";
import { BankersIntoBuilders, bankersFrames } from "./BankersIntoBuilders";
import { safeAiUseScript } from "./scripts/safe-ai-use";
import { whatsAiReadyScript } from "./scripts/whats-ai-ready";
import { blankCursorScript } from "./scripts/blank-cursor";
import { bankersIntoBuildersScript } from "./scripts/bankers-into-builders";
import { ProductHero, productHeroFrames } from "./ProductHero";
import { totalFrames } from "./scripted/types";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video 1 — data-driven assessment results. */}
      <Composition
        id="AssessmentResults"
        component={AssessmentResults}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ result: sampleResult }}
      />

      {/* Video 2 — caption-style script engine (kept as a reference). */}
      <Composition
        id="ScriptedExplainer"
        component={ScriptedExplainer}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: safeAiUseScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalFrames(props.script ?? safeAiUseScript),
        })}
      />

      {/* Video 3 — voice-first, visual-first explainer. The voice explains;
          the screen shows. This is the current approach. */}
      <Composition
        id="AiReadyExplainer"
        component={AiReadyExplainer}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: whatsAiReadyScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: totalFrames(props.script ?? whatsAiReadyScript),
        })}
      />

      {/* Video 4 — "The Blank Cursor", the :30 broadcast/social ad. */}
      <Composition
        id="BlankCursor"
        component={BlankCursor}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: blankCursorScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: adFrames(props.script ?? blankCursorScript),
        })}
      />

      {/* Video 5 — "Bankers into Builders", the :60 journey ad. */}
      <Composition
        id="BankersIntoBuilders"
        component={BankersIntoBuilders}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ script: bankersIntoBuildersScript }}
        calculateMetadata={({ props }) => ({
          durationInFrames: bankersFrames(props.script ?? bankersIntoBuildersScript),
        })}
      />

      {/* Video 6 — PROOF of the "product-as-hero" look (real UI, no actors). */}
      <Composition
        id="ProductHero"
        component={ProductHero}
        durationInFrames={productHeroFrames}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
