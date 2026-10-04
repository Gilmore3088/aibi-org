// The data model for a results video. This is the "one template, many videos"
// seam: feed a different `AssessmentResult` in (via props.json or the studio's
// props panel) and you get a different personalized video from the same code.
//
// The 8 dimensions + 5 maturity bands below are the real ones from the aibi
// In-Depth Diagnostic (content/assessments/v4/types.ts).

import { brand } from "./brand";

export interface DimensionScore {
  /** Plain-language label shown on screen (e.g. "Approved AI Access"). */
  label: string;
  /** Normalized 0–100 score for this dimension alone. */
  score: number;
}

export interface AssessmentResult {
  /** Who the report is for — a person or an institution. */
  name: string;
  /** Overall 0–100 readiness score. */
  overall: number;
  /** The 8 strategic dimensions, in display order. */
  dimensions: DimensionScore[];
}

// The 5 maturity bands keyed on the 0–100 score (mirrors MATURITY_BANDS in the app).
export interface MaturityBand {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const MATURITY_BANDS: MaturityBand[] = [
  { id: "unstructured", label: "Unstructured", min: 0, max: 39 },
  { id: "emerging", label: "Emerging", min: 40, max: 59 },
  { id: "building-momentum", label: "Building Momentum", min: 60, max: 74 },
  { id: "controlled-scale", label: "Controlled Scale", min: 75, max: 89 },
  { id: "advanced", label: "Advanced", min: 90, max: 100 },
];

export function bandFor(score: number): MaturityBand {
  return (
    MATURITY_BANDS.find((b) => score >= b.min && score <= b.max) ??
    MATURITY_BANDS[0]
  );
}

/** Color a score: red under 50, gold 50–74, green 75+. */
export function colorFor(score: number): string {
  if (score >= 75) return brand.green;
  if (score >= 50) return brand.gold;
  return brand.red;
}

// Default sample — a mid-tier "Building Momentum" institution with a clear
// strongest (Data Safety) and weakest (Vendor Control) dimension.
export const sampleResult: AssessmentResult = {
  name: "Northgate Community Bank",
  overall: 68,
  dimensions: [
    { label: "Approved AI Access", score: 74 },
    { label: "Model Oversight", score: 52 },
    { label: "Compliance Clarity", score: 61 },
    { label: "Data Safety", score: 83 },
    { label: "Workflow Fit", score: 70 },
    { label: "Human Control", score: 66 },
    { label: "Vendor Control", score: 47 },
    { label: "People & Governance", score: 58 },
  ],
};
