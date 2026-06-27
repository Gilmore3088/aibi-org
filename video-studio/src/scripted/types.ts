// The "script builder" data model.
//
// This is the whole idea: a video is authored as a *script* — a plain object a
// human (or an LLM, or a doc-to-script step) can write — and the engine in
// ScriptedExplainer.tsx renders ANY script that matches this shape. Point it at
// a different document → write a different script → get a different video. No
// new React code per video.

export type Zone = "green" | "yellow" | "red";

/** Visual-first scene types. The voice explains; these SHOW the idea, with
 *  little or no on-screen text. Used by the AiReadyExplainer composition. */
export type VisualKind =
  | "statement" // one short punchy line, voice-synced
  | "prompt-chaos" // chat bubbles multiplying = "everyone's using AI"
  | "pillars" // three labelled pillars rising
  | "constellation" // N nodes in a ring lighting up
  | "gauge"; // a score ring filling to a number

export interface ScriptSection {
  /** Stable id (used as React key). */
  id: string;
  /** Visual treatment for the caption-style engine. */
  kind: "hook" | "frame" | "scenario" | "recap";
  /** Optional risk zone — drives accent color and the big background letter. */
  zone?: Zone;
  /** Small uppercase label above the headline (e.g. "Red · Escalate"). */
  kicker?: string;
  /** The big on-screen line (serif). */
  headline?: string;

  // ── visual-first fields (AiReadyExplainer) ──
  /** Which animated visual to show. */
  visual?: VisualKind;
  /** A short on-screen line (a few words — NOT a paragraph). */
  line?: string;
  /** Optional small sub-line. */
  sub?: string;
  /** Labels for pillars / constellation visuals. */
  labels?: string[];
  /** Target number for the gauge visual. */
  value?: number;
  /** A lower-third "super" — a URL, legal line, or tagline. */
  super?: string;
  /** The narration — spoken aloud (when you add voiceover) AND shown as
   *  kinetic captions. This is the script. */
  narration: string;
  /** How long this section is on screen, in seconds. When voiceover is
   *  generated, this is overwritten with the measured narration length so the
   *  captions and the spoken audio share exactly the same window. */
  seconds: number;
  /** Path (relative to public/) of this section's narration clip, if any.
   *  Set automatically by scripts/generate-voiceover.mjs. */
  audio?: string;
}

export interface VideoScript {
  /** Title-card heading. */
  title: string;
  /** Title-card sub-line. */
  subtitle?: string;
  /** The thing the outro asks the viewer to get. */
  resource: {
    name: string;
    kicker: string; // e.g. "Free download"
    url: string;
  };
  sections: ScriptSection[];
  /** Optional: path (relative to public/) of a narration track to play under
   *  the whole video. Add one later — see README "Add voiceover". */
  voiceover?: string;
}

export const FPS = 30;
export const TITLE_SECONDS = 3.5;
export const CTA_SECONDS = 5;

/** Total frames a script needs — used by the composition's calculateMetadata
 *  so the timeline length adapts to whatever script you give it. */
export function totalFrames(script: VideoScript): number {
  const body = script.sections.reduce((sum, s) => sum + s.seconds, 0);
  return Math.round((TITLE_SECONDS + body + CTA_SECONDS) * FPS);
}
