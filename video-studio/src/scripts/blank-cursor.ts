// SCRIPT: "The Blank Cursor" — a :30 broadcast/social ad.
//
// Creative through-line: "The unknown becomes a tool in your hands." The enemy
// isn't AI — it's the blank cursor. Each beat moves from a question you can't
// hold → something you can (a score, a working prompt, a policy an examiner can
// read) → a banker building, in the chair.
//
// Voiceover lines are verbatim from the brief. `seconds` are the brief's broadcast
// timings (sum = 30s); once voiceover is generated each beat re-times to its clip.

import { VideoScript } from "../scripted/types";
import { applyNarration } from "../scripted/narration";
import manifest from "./blank-cursor.narration.json";

const base: VideoScript = {
  title: "The Blank Cursor",
  // The ad opens cold on the cursor — no title card, no CTA wrapper. The brand
  // mark is the final beat. resource is unused here but required by the type.
  resource: { name: "The AI Banking Institute", kicker: "Start free", url: "aibankinginstitute.com" },

  sections: [
    {
      id: "saying",
      kind: "hook",
      visual: "statement", // doc-cursor handled in ad visuals
      narration: "Everyone keeps saying AI will change your bank.",
      seconds: 4,
    },
    {
      id: "lines",
      kind: "hook",
      visual: "statement",
      narration: "No one showed you where to start. Or where the lines are.",
      seconds: 4,
    },
    {
      id: "twelve",
      kind: "frame",
      visual: "constellation",
      narration: "So you start with twelve questions.",
      super: "aibankinginstitute.com",
      seconds: 6,
    },
    {
      id: "hold",
      kind: "frame",
      visual: "pillars",
      narration:
        "And the question becomes something you can hold. A score. A working prompt. A policy your examiner can read.",
      super: "Aligned with SR 11-7 · ECOA / Reg B",
      seconds: 8,
    },
    {
      id: "chair",
      kind: "recap",
      visual: "gauge",
      narration:
        "Built for community banks. Bounded by the rules you already follow. You stay in the chair.",
      seconds: 5,
    },
    {
      id: "brand",
      kind: "recap",
      visual: "statement",
      narration: "The AI Banking Institute.",
      line: "Turning Bankers into Builders",
      super: "Start free",
      seconds: 3,
    },
  ],
};

export const blankCursorScript: VideoScript = applyNarration(base, manifest);
