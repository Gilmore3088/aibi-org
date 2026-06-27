// SCRIPT: "Bankers into Builders" — a :60 ad. The journey: question → assessment
// → Foundation/Toolbox → artifacts → certificate → confident banker → CTA.
//
// Built to the brief's production notes: single gold accent, no decorative
// gradients, Inter for everything, citation discipline, the two taglines used
// precisely ("Turning Bankers into Builders" = lockup; "We turn your bankers
// into your builders" = spoken). Voiceover lines verbatim.

import { VideoScript } from "../scripted/types";
import { applyNarration } from "../scripted/narration";
import manifest from "./bankers-into-builders.narration.json";

const base: VideoScript = {
  title: "Bankers into Builders",
  resource: { name: "The AI Banking Institute", kicker: "Start free", url: "aibankinginstitute.com" },

  sections: [
    {
      id: "portraits", // 0–6 — footage-ready
      kind: "hook",
      narration:
        "There are about eight thousand community banks and credit unions. Almost all of them are asking the same question.",
      seconds: 6,
    },
    {
      id: "question", // 6–11
      kind: "hook",
      narration: "And the honest answer was usually: we'll figure it out later.",
      seconds: 5,
    },
    {
      id: "assessment", // 11–18
      kind: "frame",
      narration:
        "Later starts here. Twelve questions tell you where your team really stands.",
      super: "Free readiness assessment",
      seconds: 7,
    },
    {
      id: "workbench", // 18–28
      kind: "frame",
      narration:
        "Then we don't teach AI theory. We hand you a workbench — real scenarios, real outputs — and you keep what works in a Toolbox that's yours.",
      super: "AiBI-Foundation · $295",
      seconds: 10,
    },
    {
      id: "artifacts", // 28–38
      kind: "frame",
      narration:
        "A SAR narrative, drafted. A board memo, started. A policy, review-ready. AI prepares the work. You decide what ships.",
      super: "AI prepares · humans decide",
      seconds: 10,
    },
    {
      id: "certificate", // 38–46
      kind: "recap",
      narration:
        "Your people stop fearing it and start building with it — inside the lines, on the record.",
      super: "AiBI-Foundation · The AI Banking Institute",
      seconds: 8,
    },
    {
      id: "confident", // 46–54 — footage-ready
      kind: "recap",
      narration: "Not a vendor doing it for you. Your bankers, doing it themselves.",
      seconds: 8,
    },
    {
      id: "brand", // 54–60
      kind: "recap",
      narration:
        "The AI Banking Institute. We turn your bankers into your builders. Start with the free assessment.",
      line: "Turning Bankers into Builders",
      super: "aibankinginstitute.com",
      seconds: 6,
    },
  ],
};

export const bankersIntoBuildersScript: VideoScript = applyNarration(base, manifest);
