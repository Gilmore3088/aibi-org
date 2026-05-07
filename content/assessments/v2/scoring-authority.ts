// content/assessments/v2/scoring-authority.ts
// Framing copy that earns the score's authority. Rendered as a short
// "About this score" block on the in-depth report and as a footer on the
// free 12Q result. Voice: institutional. Banker-direct. Not promotional.

export interface ScoreAuthority {
  /** What the 12–48 scale represents. One paragraph. */
  readonly scaleMeaning: string;
  /** Why the bands are 9 points wide. One paragraph. */
  readonly thresholdLogic: string;
  /** What the score legitimately claims. */
  readonly whatItClaims: readonly string[];
  /** What the score does NOT claim — the integrity guardrail. */
  readonly whatItDoesNotClaim: readonly string[];
}

export const SCORE_AUTHORITY: ScoreAuthority = {
  scaleMeaning:
    'The score is a self-reported readiness index across eight dimensions of AI capability — current usage, experimentation culture, literacy, quick-win potential, leadership buy-in, security posture, training infrastructure, and builder potential. The 12–48 range reflects four points per dimension, summed across all eight.',
  thresholdLogic:
    'The four maturity bands are equal-spaced nine-point ranges (12–20, 21–29, 30–38, 39–48). Equal spacing is intentional: it prevents the optical illusion that the difference between Building Momentum and Ready to Scale is smaller than the difference between Starting Point and Early Stage. Every step on the ladder is the same distance.',
  whatItClaims: [
    'A directional reading of where the institution sits on a recognizable maturity ladder.',
    'A named blocker holding the institution at its current stage.',
    'A per-dimension breakdown that surfaces the limiting capability — the dimension that, raised one tier, lifts the overall posture.',
  ],
  whatItDoesNotClaim: [
    'A model-risk audit. The score does not substitute for SR 11-7, TPRM, or any internal control review.',
    'A peer benchmark. The institution is not yet ranked against a calibrated cohort; benchmarks will be introduced when the dataset supports them honestly.',
    'A regulatory finding. The score is a self-reported diagnostic and is not produced by, sponsored by, or filed with any examining authority.',
  ],
};
