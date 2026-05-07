/**
 * AI tools the institute's curriculum teaches bankers to use.
 *
 * Vendor-named, role-relevant. Surfaced on program pages and the
 * for-institutions sales surface.
 */

export interface CurriculumTool {
  readonly slug: string;
  readonly name: string;
  readonly category: "general" | "office" | "vendor" | "internal" | "gateway";
  readonly note: string;
}

export const TOOLS: readonly CurriculumTool[] = [
  {
    slug: "claude",
    name: "Claude (Anthropic) or ChatGPT",
    category: "general",
    note: "For drafting, structured analysis, and decisioning support — with verifiable-output patterns.",
  },
  {
    slug: "ms-copilot",
    name: "Microsoft Copilot for M365",
    category: "office",
    note: "Inside Outlook, Excel, Word, Teams — the workflows your bank already runs.",
  },
  {
    slug: "ai-gateway",
    name: "Your bank's approved AI gateway",
    category: "gateway",
    note: "Or compliance-aligned interface, if you have one. We meet your stack where it is.",
  },
  {
    slug: "vendor-ai",
    name: "Vendor AI in core, LOS, fraud",
    category: "vendor",
    note: "How to evaluate, configure, and govern AI features your existing vendors are turning on.",
  },
  {
    slug: "use-case-inventory",
    name: "The use-case inventory tool",
    category: "internal",
    note: "A practical artifact — the inventory examiners ask for, in a form your committee can maintain.",
  },
] as const;
