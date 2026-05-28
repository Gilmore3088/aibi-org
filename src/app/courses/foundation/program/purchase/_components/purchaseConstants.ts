// Shared constants for the purchase page.
// Role-aware framing surfaces a banner for visitors arriving from
// /playbooks/<role> CTAs (#327D).

export const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

export interface RoleBannerCopy {
  readonly label: string;
  readonly lede: string;
}

export const ROLE_BANNER: Record<string, RoleBannerCopy> = {
  'bsa-aml': {
    label: 'BSA / AML',
    lede: 'Modules 2, 4, and 6 carry the BSA / AML weight — narrative discipline, alert triage, and the FinCEN typology vocabulary.',
  },
  compliance: {
    label: 'Compliance',
    lede: 'Modules 2, 4, 7, and 11 are the compliance spine — use-case intake, the human-review step, audit trails, and the AIEOG / SR 11-7 lens.',
  },
  infosec: {
    label: 'IT / InfoSec',
    lede: 'Modules 3, 5, and 9 anchor the IT view — data classification, tool verdicts, and the identity model around AI access.',
  },
  lending: {
    label: 'Lending',
    lede: 'Modules 6, 8, and 10 are the lending spine — adverse-action specificity, fair-lending phrasing review, and decision-memo discipline.',
  },
  marketing: {
    label: 'Marketing',
    lede: 'Modules 5, 8, and 12 are the marketing arc — campaign briefs, disclosure review, and plain-language translation that preserves the claim.',
  },
  retail: {
    label: 'Branch / Retail',
    lede: 'Modules 1, 4, and 9 are the branch arc — coaching kits, service recovery, and one-page procedure cleanup that survives the window.',
  },
};
