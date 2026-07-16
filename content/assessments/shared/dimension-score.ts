// Canonical serialized dimension-score shape shared by the v2 and v3 scoring
// engines and the persisted ReadinessResult (user-data). v4 uses a richer
// shape ({dimension, raw, max, normalized, band}) and is intentionally NOT
// unified here.
export interface DimensionScore {
  readonly score: number;
  readonly maxScore: number;
  readonly label: string;
}
