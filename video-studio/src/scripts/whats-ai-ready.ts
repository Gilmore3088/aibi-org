// SCRIPT: "What 'AI-ready' actually means"
//
// Voice-first. `narration` is what the NARRATOR says (not shown as a paragraph).
// `visual` picks an animation that SHOWS the idea. `line`/`labels` are the only
// on-screen words — a few at a time, never a paragraph.
//
// `seconds` are fallbacks used while silent. After `npm run voiceover` they are
// replaced by each clip's measured length so visuals and voice stay locked.

import { VideoScript } from "../scripted/types";
import { applyNarration } from "../scripted/narration";
import manifest from "./whats-ai-ready.narration.json";

const base: VideoScript = {
  title: "What does “AI-ready” actually mean?",
  subtitle: "for banks and credit unions",
  resource: {
    name: "The free AI Readiness Assessment",
    kicker: "Find your score",
    url: "aibi.org/assessment",
  },

  sections: [
    {
      id: "hook",
      kind: "hook",
      visual: "prompt-chaos",
      line: "Everyone's already using AI.",
      narration:
        "Walk into almost any bank today, and someone is already using AI — drafting an email, summarizing a policy, asking a chatbot a question.",
      seconds: 7.5,
    },
    {
      id: "turn",
      kind: "frame",
      visual: "statement",
      line: "Using AI isn't the same as being ready for it.",
      narration:
        "But using AI and being ready for it are two completely different things.",
      seconds: 5,
    },
    {
      id: "pillars",
      kind: "frame",
      visual: "pillars",
      labels: ["Guardrails", "Skills", "Oversight"],
      narration:
        "Real readiness stands on three things: the guardrails that keep AI safe, the skills to use it well, and the oversight to catch it when it gets something wrong.",
      seconds: 9,
    },
    {
      id: "dimensions",
      kind: "frame",
      visual: "constellation",
      labels: [
        "Approved AI Access",
        "Model Oversight",
        "Compliance Clarity",
        "Data Safety",
        "Workflow Fit",
        "Human Control",
        "Vendor Control",
        "People & Governance",
      ],
      narration:
        "We make that measurable across eight dimensions — from data safety, to keeping a human in control, to the people and governance behind it all.",
      seconds: 9,
    },
    {
      id: "payoff",
      kind: "recap",
      visual: "gauge",
      value: 72,
      line: "A number you can act on.",
      narration:
        "Score them, and a vague question — are we ready? — becomes a clear number you can actually act on.",
      seconds: 7,
    },
  ],
};

export const whatsAiReadyScript: VideoScript = applyNarration(base, manifest);
