// Types for the homepage ticker — Bloomberg-style rotating strip of
// sourced statistics, regulations, and platform updates beneath the
// global SiteNav.
//
// See #191. Content lives in content/ticker/items.ts so non-developers
// can edit the rotation without touching component code.

export type TickerItemType =
  | 'stat'
  | 'regulation'
  | 'update'
  | 'cite'
  | 'standard';

export interface TickerItem {
  readonly id: string;
  readonly type: TickerItemType;
  /** The headline text shown in the strip. Keep under ~90 chars. */
  readonly text: string;
  /** Required for `stat` and `cite` types. Shown as dim mono source line. */
  readonly source?: string;
  /** Optional click-through. Opens in same tab. */
  readonly href?: string;
  /** ISO date the item was added. Used for ordering + freshness sort. */
  readonly publishedAt: string;
  /** Optional auto-expiry. Filtered out at render time. */
  readonly expiresAt?: string;
}

/** Tag label shown in the kicker slot. */
export const TICKER_TYPE_LABELS: Record<TickerItemType, string> = {
  stat: 'Stat',
  regulation: 'Regulation',
  update: 'Update',
  cite: 'Cite',
  standard: 'Standard',
};
