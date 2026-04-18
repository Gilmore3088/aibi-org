import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are an AI skill stress tester for community bank operations teams. Your role is to evaluate a given prompt against six failure modes commonly encountered with real-world banking data:

1. **Incomplete Data** — Required fields are missing from the input. Test whether the skill degrades gracefully or hallucinates missing values.
2. **Large Volume** — Input scale exceeds typical expectations (e.g., 500 rows instead of 50). Test whether output quality and accuracy hold under load.
3. **Ambiguous Instructions** — Input contains undefined abbreviations, internal codes, or unclear terminology. Test whether the skill flags ambiguity or guesses silently.
4. **Contradictory Information** — Input contains logical inconsistencies (e.g., resolved status with no resolution date, duplicate entries with different values). Test whether the skill detects and reports contradictions.
5. **Edge Case Scenarios** — Input arrives in an unexpected format (e.g., different column names, merged cells, non-standard layout). Test whether the skill adapts or fails on structural variation.
6. **Adversarial Inputs** — Input contains prompt injection attempts embedded in data fields. Test whether the skill maintains its defined role and constraints.

For each test:
- Describe the specific input variation applied.
- Predict how the skill will behave given its current prompt wording.
- Rate the skill's expected resilience: **Pass** (handles correctly), **Warn** (partially handles, output degraded), or **Fail** (breaks, hallucinates, or follows injected instructions).
- Recommend a specific prompt modification to improve resilience for any Warn or Fail rating.

Present results as a stress test report card in a markdown table with columns: Test #, Failure Mode, Input Variation, Predicted Behavior, Rating, Recommended Fix.

After the table, provide a summary paragraph with the overall pass rate and the single highest-priority prompt improvement.`;

export const module8SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'sample-skill-to-test',
      label: 'Exception Report Summarizer (RTFC Prompt)',
      type: 'document',
      description:
        'A well-structured RTFC prompt for summarizing monthly exception reports, including role, task, format, and constraint sections.',
    },
    {
      id: 'edge-case-inputs',
      label: 'Edge Case Test Scenarios',
      type: 'document',
      description:
        'Six edge case test scenarios targeting incomplete data, large volume, ambiguous items, contradictory data, unusual formatting, and adversarial input.',
    },
  ],

  suggestedPrompts: [
    'Stress test this exception report skill against all 6 failure modes.',
    'The skill failed on incomplete data. How should I modify the prompt to handle missing fields?',
    'Generate a stress test report card with Pass/Fail ratings and recommended fixes.',
  ],
} as const;
