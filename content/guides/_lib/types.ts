/**
 * Guide frontmatter — every MDX file in content/guides must export `meta`
 * matching this shape.
 *
 * Guides are the evergreen, search-intent counterpart to briefings. A
 * briefing answers "what happened this week"; a guide answers the question a
 * community-bank or credit-union reader types into a search box ("AI vendor
 * due diligence questions", "can bank employees use ChatGPT"). Each guide
 * maps to exactly one of the eight canonical readiness dimensions so its
 * closing CTA can point at the part of the free assessment it relates to.
 */

import type { Dimension } from '@content/assessments/v4/types';

export interface GuideFaq {
  readonly q: string;
  /** Plain text only — emitted verbatim into FAQPage JSON-LD. */
  readonly a: string;
}

export interface GuideMeta {
  readonly slug: string;
  /** H1 on the page. Written for the reader, not the keyword. */
  readonly title: string;
  /** <title> tag. Keep under ~60 chars; carries the target query. */
  readonly seoTitle: string;
  /** Meta description + dek. 70–160 chars. */
  readonly description: string;
  /** The search query this page is built to answer. Internal; never rendered. */
  readonly query: string;
  readonly dimension: Dimension;
  /** Who should read this — rendered as the kicker. */
  readonly audience: string;
  /** ISO date the guide was last substantively reviewed. */
  readonly updated: string;
  readonly readMinutes: number;
  /** Three to five questions, rendered visibly and as FAQPage JSON-LD. */
  readonly faqs: readonly GuideFaq[];
  /** Slugs of other guides to link at the foot of the page. */
  readonly related: readonly string[];
  readonly sources: readonly { readonly label: string; readonly url?: string }[];
  readonly draft?: boolean;
}
