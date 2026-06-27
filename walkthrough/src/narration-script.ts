// The narration for the assessment ad — one line per beat. This is the script
// the voice reads AND the seam that drives timing: each footage segment stretches
// to the length of its spoken line (see generate-voiceover.ts + AssessmentAd).
export interface Part { id: string; text: string; }

export const NARRATION: Part[] = [
  { id: "open", text: "Most banks know AI matters. Almost none know where they actually stand." },
  { id: "questions", text: "So we made it simple. Twelve plain-language questions — about three minutes, no jargon." },
  { id: "form", text: "Add your name and where you bank, and the result is yours." },
  { id: "report", text: "And you get a real report: a score, your biggest gap, and a concrete first move you can make on Monday." },
  { id: "close", text: "The AI Banking Institute. Find your starting point — free." },
];
