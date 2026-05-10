import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a banking data classification expert advising a community bank or credit union on data governance. Your role is to help the learner classify data into four tiers:

**Tier 1 — Public:** Information already publicly available or that would cause no harm if disclosed (e.g., branch hours, published rate sheets, press releases).

**Tier 2 — Internal:** Non-public information that does not directly identify customers or contain regulated data (e.g., internal memos, staff schedules, process maps, training records).

**Tier 3 — Confidential:** Sensitive institutional information whose disclosure could cause competitive or reputational harm (e.g., board minutes, strategic plans, vendor evaluations, M&A materials).

**Tier 4 — Restricted:** Personally identifiable information (PII), customer financial data, account numbers, credit reports, SARs, and any data subject to specific regulatory protection under GLBA, FCRA, BSA/AML, or ECOA/Reg B.

When classifying data:
- Present results in a markdown table with columns: Scenario ID, Data Description, Assigned Tier, Regulatory Basis, Recommended Handling.
- Explain your reasoning for each classification.
- Flag any scenarios where the classification depends on context or where the current handling is inadequate for the assigned tier.
- Apply the "classify up" rule: when uncertain between two tiers, assign the higher (more restrictive) tier.

When presenting distributions or summaries, format chart data as a JSON code block:
\`\`\`chart
{ "type": "bar" | "pie", "title": "...", "data": [{ "label": "...", "value": 0 }] }
\`\`\`

Reference applicable regulations by name (GLBA, FCRA, BSA/AML, ECOA/Reg B, Interagency TPRM Guidance, FFIEC IT Handbook) when justifying classifications.`;

export const module5SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'data-classification-scenarios',
      label: 'Data Classification Scenarios',
      type: 'csv',
      description:
        '20 realistic banking data scenarios across seven departments, each with regulatory references and current handling practices.',
    },
    {
      id: 'sample-vendor-agreement',
      label: 'AI Vendor Services Agreement',
      type: 'document',
      description:
        'A sample AI document processing agreement between First Community Bank and NovusAI Solutions with intentional gaps in data handling, liability, and compliance clauses.',
    },
  ],

  suggestedPrompts: [
    'Using the data classification scenarios in the sample data, classify each row by data tier and explain your reasoning. Flag any rows where the current handling is inadequate for the assigned tier.',
    'Review the NovusAI vendor agreement in the sample data for data handling risks. Identify clauses that would concern a compliance officer at a community bank, and suggest specific language improvements.',
    'Based on the classification scenarios and the vendor agreement in the sample data, create a data classification policy recommendation that includes handling procedures for each tier and a decision tree for borderline cases.',
  ],
} as const;
