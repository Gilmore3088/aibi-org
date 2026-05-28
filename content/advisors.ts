// Named advisors / SMEs who have publicly endorsed reviewing the
// Institute's curriculum or methodology.
//
// Filed under #356. The page-level AdvisorsStrip component reads this
// list and renders nothing if it's empty. That prevents shipping a
// hollow "Advised by" strip with placeholder content — it appears only
// when we have real, named, attributable people.
//
// What to add here:
//   - Real first + last name
//   - Real role + institution (or "Independent" / "Former <institution>")
//   - Optional one-line quote (kept under 140 chars; must be a real
//     quote the person has approved for public attribution)
//
// What NOT to add:
//   - Anonymous "industry leader" entries
//   - Fabricated quotes
//   - Logos from institutions whose staff haven't approved attribution
//   - Regulator / examiner endorsements (banned per memory feedback_examiner_respects_banned)

export interface Advisor {
  readonly id: string;             // url-safe slug for keys
  readonly name: string;           // 'Jane Doe'
  readonly role: string;           // 'BSA Officer'
  readonly institution: string;    // 'First Community Bank' | 'Independent' | 'Former Acme Bank'
  readonly quote?: string;         // optional, <=140 chars
}

export const ADVISORS: readonly Advisor[] = [
  // TODO(#356): populate with named advisors once founder has secured
  // explicit public-attribution approval. Until then this stays empty
  // and the AdvisorsStrip renders nothing.
] as const;
