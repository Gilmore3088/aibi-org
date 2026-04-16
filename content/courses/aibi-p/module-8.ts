// AiBI-P Module 8: Test, Iterate, Share
// Pillar: Application | Estimated: 35 minutes
// Key Output: Iterated skill version with improvement notes

import type { Module } from './types';

export const module8: Module = {
  number: 8,
  id: 'm8-test-iterate-share',
  title: 'Test, Iterate, Share',
  pillar: 'application',
  estimatedMinutes: 35,
  keyOutput: 'Iterated skill with version notes',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m8_test_iterate_share',
  sections: [
    {
      id: 'm8-opening',
      title: 'Reliability is the Residue of Design',
      content: `A skill written once and never revisited is a starting point, not a finished tool. The practitioners who build lasting value with AI are the ones who treat their skills as living documents — testing them against edge cases, documenting what works and what fails, and iterating toward consistent performance.

The Module 8 objective is to take the skill you built in Module 7 and put it through a structured iteration cycle. By the end, you will have a versioned skill file with documented improvements and a clear record of what changed and why.

**Why iteration matters:**

The first version of any skill is built from intuition — what you think the AI needs to know to do the task well. The second version is built from evidence — what you learned from watching the AI's actual outputs on real inputs. The gap between version 1.0 and version 1.2 is almost always the difference between an AI tool that occasionally disappoints and one that reliably performs.`,
    },
    {
      id: 'm8-iteration-protocol',
      title: 'The Iteration Protocol',
      content: `The Iteration Protocol is a structured process for improving AI skills based on observed outputs. It has three steps.

**Step 1: Stress Test**

Run your skill against at least three real inputs from your actual workflow. Do not use ideal, clean examples — use messy, incomplete, or edge-case inputs that represent what you actually encounter. Observe the outputs carefully.

Questions to ask of each output:
- Did the AI follow the Role specification? Did it produce expert-level outputs or generic ones?
- Did the Task get executed precisely? Were the specific deliverables produced?
- Was the Format correct? Did the output match the specified structure?
- Were the Constraints respected? Did anything appear that the constraints should have prevented?
- What did the output contain that surprised you — positively or negatively?

**Step 2: Diagnose**

Categorize each failure or unexpected output by component. "The AI produced bullets when I asked for a table" is a Format failure. "The AI made a compliance determination instead of flagging for review" is a Constraint failure. "The output didn't account for the specific risk framework I work with" is a Context failure.

This categorization step matters because it prevents the common mistake of patching symptoms rather than root causes. Adding another sentence to a bloated system prompt is often less effective than identifying the specific component that failed and rewriting it precisely.

**Step 3: Revise and Version**

Make targeted revisions based on your diagnosis. Document what changed and why in a comment at the top of the Markdown file. Increment the version number.

Version numbering convention: major.minor (e.g., 1.0 → 1.1 for small improvements, 1.0 → 2.0 for significant restructuring).

Re-test after each revision to verify the fix worked and did not introduce new failures.`,
    },
    {
      id: 'm8-skill-portability',
      title: 'Skill Portability Across Platforms',
      content: `One of the most important properties of a well-written Markdown skill is portability. A skill written for ChatGPT Custom Instructions should work in Claude's Project system prompt with minimal modification. This is not accidental — it is a property of plain-language instruction that does not depend on platform-specific syntax.

**Cross-platform compatibility rules:**

1. **Write in plain language, not prompt syntax.** Avoid platform-specific constructs like ChatGPT's special tags or Claude's XML-style formatting. Plain, instructional prose works across all major platforms.

2. **Test on your primary platform first.** Optimize for the platform you use daily. Cross-platform compatibility is a bonus, not a first-order requirement.

3. **Store skills as .md files.** Markdown is the universal format. A skill stored as a .md file can be pasted into any platform's configuration interface without conversion.

4. **Version-track your skills.** As platforms update, skill behavior can shift. Keeping version notes and re-testing periodically catches platform-driven regressions.

**Skills as institutional assets:**

A well-built skill has value beyond the individual who created it. A Loan QC Skill built by your most experienced credit analyst represents institutional knowledge that can be shared with every lending staff member. A Compliance Narrative Skill built by your BSA Officer captures regulatory interpretation expertise that would otherwise exist only in that officer's head.

Skills are institutional knowledge made portable and repeatable. The Sharing Ladder in the activity below formalizes this progression from personal tool to institutional asset.`,
    },
    {
      id: 'm8-margin-of-error-progression',
      title: 'The Margin of Error Progression Framework',
      content: `Not all AI use cases carry the same consequence if the AI makes an error. The Margin of Error Progression Framework categorizes banking AI use cases by their consequence of failure — and recommends different verification protocols accordingly.

**Category A — Low Consequence (First Draft)**
Examples: Drafting internal communications, creating meeting agendas, formatting reports, brainstorming ideas, creating training materials.
Error consequence: Easily corrected by a human reviewer. An error in a draft internal memo is caught before it goes anywhere.
Verification protocol: Single review by the author. Check for factual accuracy and tone. No secondary review required.

**Category B — Moderate Consequence (Verify Before Use)**
Examples: Customer-facing communications drafts, policy summaries, research synthesis, competitive analysis.
Error consequence: Reaches a customer or external audience if uncaught. A hallucinated fact in a member newsletter creates trust risk.
Verification protocol: Author review plus one additional check against primary sources for any specific claims. Primary source verification for any cited statistics or regulatory references.

**Category C — High Consequence (Requires Validation)**
Examples: Compliance findings, risk assessments, credit analysis inputs, SAR narrative elements.
Error consequence: May influence a regulatory filing, credit decision, or risk management action.
Verification protocol: Full independent verification against primary sources. Human expert review before use. AI output treated as a first-draft research input, not a final determination.

**Category D — Critical (AI Assistance Only)**
Examples: BSA/AML determinations, credit decisions, final compliance assessments, exam responses.
Error consequence: Regulatory, legal, or credit risk impact if wrong.
Verification protocol: AI provides supporting analysis only. The determination is made entirely by a qualified human. The AI output is cited as a research input in the work file, not as the basis for the decision.`,
    },
  ],
  activities: [
    {
      id: '8.1',
      title: 'Iterate and Save',
      description: 'Take your skill from Module 7 and run it through the three-step Iteration Protocol. Test it against two real work inputs, diagnose any failures by component, and document your improvements. Save a new version with iteration notes.',
      type: 'iteration',
      fields: [
        {
          id: 'test-input-1',
          label: 'Describe the first real input you tested your skill against (do not include Tier 3 data — describe the type and general content)',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'e.g., A loan document package with incomplete collateral documentation and an unusual property type. Three items were missing from the standard checklist.',
        },
        {
          id: 'output-assessment-1',
          label: 'How did the skill perform on input 1? What worked well? What failed?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe what the AI produced. Did it follow the Role, Task, Format, and Constraints? Were there unexpected outputs? Which component failed if something went wrong?',
        },
        {
          id: 'test-input-2',
          label: 'Describe the second real input you tested (edge case or challenging scenario)',
          type: 'textarea',
          minLength: 20,
          required: true,
          placeholder: 'e.g., A more complex or unusual version of the same task type. The edge case is where skills most often break.',
        },
        {
          id: 'output-assessment-2',
          label: 'How did the skill perform on input 2? Did the edge case reveal any failures?',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'Describe the output and any failures. Edge cases often reveal constraint gaps — what should have been prevented but was not?',
        },
        {
          id: 'revision-notes',
          label: 'What changes did you make to improve the skill? Describe the revision and the component it addressed.',
          type: 'textarea',
          minLength: 30,
          required: true,
          placeholder: 'e.g., "Added a Constraint: Never produce output in paragraph form — always use the specified table format." or "Strengthened the Role: Added specific expertise in [topic] to improve the quality of [specific output type]."',
        },
        {
          id: 'sharing-ladder-level',
          label: 'Where does this skill sit on the Sharing Ladder? Is it ready to share with your team, or still in personal sandbox testing?',
          type: 'radio',
          required: true,
          options: [
            { value: 'personal', label: 'Personal — still in testing, not ready to share' },
            { value: 'team', label: 'Team — ready to share with my immediate team for peer review' },
            { value: 'institution', label: 'Institution — polished enough for institution-wide distribution' },
            { value: 'not-sure', label: 'Not sure — needs one more iteration' },
          ],
        },
      ],
      completionTrigger: 'save-response',
    },
  ],
} as const;
