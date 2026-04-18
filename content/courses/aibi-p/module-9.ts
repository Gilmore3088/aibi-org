// AiBI-P Module 9: Final Capstone Application
// Pillar: Application | Estimated: 60 minutes
// Key Output: Assessed work product submission (no activity — work product submission handled separately)
// roleSpecific: true — role-specific automation examples vary by department

import type { Module } from './types';

export const module9: Module = {
  number: 9,
  id: 'm9-final-capstone',
  title: 'Final Capstone Application',
  pillar: 'application',
  estimatedMinutes: 60,
  keyOutput: 'Assessed Work Product (skill + input + output + annotation)',
  mockupRef: 'content/courses/AiBI-P v1/stitch_ai_banking_institute_course/m9_final_capstone_submission',
  roleSpecific: true,
  sections: [
    {
      id: 'm9-opening',
      title: 'Transition from Student to Practitioner',
      content: `> The AiBI-P credential is not awarded for completing coursework. It is awarded for demonstrating professional capability.

Your capstone work product is not a test — it is a professional document that you would be prepared to show to your manager, your compliance officer, or your examiner as evidence that you can use AI tools safely, skillfully, and in alignment with your institution's regulatory obligations.

**What you will submit:**

1. **Your Skill File (.md):** The skill you built and iterated in Modules 7 and 8. This is evidence of your ability to engineer precise AI instructions for banking use cases.
2. **Redacted Input Data:** The real-world input you used to test your skill. All Tier 3 data must be redacted — replaced with placeholder text that describes the data type. This demonstrates your data classification competence.
3. **Raw AI Output:** The unedited first response from the AI when you applied your skill to your input. This is preserved as evidence of the gap between raw AI output and production-ready output.
4. **Final Edited Output:** Your curated, production-ready version. The difference between the raw output and the final version demonstrates your judgment — where you accepted the AI's work and where you improved or corrected it.
5. **Practitioner Annotation (4-6 sentences):** Your explanation of the curation decisions you made. Why did you accept certain outputs? What did you change, and why? What regulatory or institutional consideration guided your choices?

**The quality standard:**

Your work product is reviewed against a five-dimension rubric. Accuracy is a hard gate — any work product with hallucinated data, incorrect regulatory citations, or factual errors that were not caught and corrected will not pass. The other dimensions (Completeness, Tone, Judgment, Skill Quality) are scored on a 1-4 scale.

> A passing work product demonstrates that you can produce AI-assisted banking output that is ready for use in a professional institutional context.`,
    },
    {
      id: 'm9-automation-identification',
      title: 'The Automation Identification Framework',
      content: `Before you can automate a workflow with AI, you must identify which workflows are candidates for automation. The Automation Identification Framework provides three screening questions that distinguish high-ROI AI candidates from low-ROI or high-risk ones.

**Question 1: Is the task structurally repetitive?**

Repetitive means the task follows the same pattern every time it is performed, even if the inputs vary. Drafting member response letters is repetitive — the format, tone, and structure are consistent even though the specific issue changes each time. A credit committee presentation that is unique each quarter is not structurally repetitive in the same way.

- High AI ROI: Tasks that are structurally repetitive with variable inputs.
- Low AI ROI: Tasks that require significant creative or strategic judgment each time.

**Question 2: Is accuracy verifiable?**

AI automation is most appropriate where a human can efficiently verify the output's accuracy. A meeting summary can be verified by the meeting participants in under two minutes. A regulatory compliance determination may take a legal review to verify — making AI-only generation more risky.

- High AI ROI: Tasks where output accuracy is quickly and reliably verifiable.
- Low AI ROI: Tasks where output verification requires expertise or time comparable to doing the task manually.

**Question 3: Is the data classification risk manageable?**

Every AI automation touches data. Some automations are blocked by data classification — no amount of efficiency gain justifies pasting Tier 3 data into an unsanctioned AI tool. The question is whether the automation can be designed to work with Tier 1 or Tier 2 data only, or whether it requires an institutional-grade integration with appropriate data governance.

- High AI ROI: Tasks that operate on Tier 1 or Tier 2 data.
- Conditional: Tasks requiring Tier 3 data that can be handled through a formally reviewed, institution-approved AI integration.
- Block: Tasks requiring Tier 3 data that cannot be handled without an approved integration.`,
    },
    {
      id: 'm9-role-specific-examples',
      title: 'Role-Specific Automation Examples',
      content: `The following examples illustrate the Automation Identification Framework applied to common banking workflows. Your onboarding role selection activates the most relevant examples in the course interface.

**Tier A Automations (Highest ROI, Immediate Deployment)**

These are tasks that pass all three screening questions with no caveats. They are structurally repetitive, produce easily-verifiable outputs, and operate on Tier 1 or Tier 2 data only.

- Draft responses to common member/customer inquiry categories (policy questions, rate inquiries, general service questions)
- Format and summarize meeting notes and action items from transcripts
- Translate internal policies into plain-language FAQs for staff training
- Generate first drafts of job postings and internal communications
- Create structured summaries of regulatory guidance documents for staff distribution
- Convert manual checklists into structured templates for consistent use

**Tier B Automations (High ROI, Require Verification Protocol)**

These automations pass the screening questions but require a defined verification step before output is used. The efficiency gain is significant, but the verification step is non-negotiable.

- Draft responses to loan application status inquiries (verify all specific terms and dates against the actual loan file)
- Generate risk analysis summaries from uploaded documents (verify all risk factors and citations against source documents)
- Create compliance review summaries from uploaded policy documents (have compliance officer review before distribution)
- Draft sections of annual reports from structured data inputs (verify all figures against source data)

**Tier C Automations (Institutional Integration Required)**

These automations have high potential value but require formal IT and compliance review before implementation. They cannot be built by individual staff members using consumer AI tools.

- Automated SAR narrative assistance from transaction monitoring system outputs
- Credit analysis inputs from loan system data
- Customer communication automation based on account activity triggers
- Risk scoring model explanation generation

**What is NOT an automation candidate:**

- Final credit decisions
- BSA/AML determinations
- Adverse action letters (the final version — AI can draft, human must verify and sign)
- Exam responses and regulatory correspondence
- Legal opinions or interpretations
- Personnel decisions`,
    },
    {
      id: 'm9-quality-standard',
      title: 'The Quality Standard',
      content: `> The AiBI-P credential represents a demonstrated capability standard, not a course completion certificate.

Anyone can watch videos and pass a quiz. The AiBI-P work product requirement exists because community banking AI proficiency is a professional capability — and professional capabilities are demonstrated through work, not through test scores.

**The five-dimension rubric:**

**Accuracy (Hard Gate)**

The work product must be factually accurate. Any hallucinated data, incorrect regulatory citations, or factual errors that were not caught in the editing process result in automatic non-qualification. The rubric score of 1 on Accuracy is a hard gate regardless of scores on other dimensions. This reflects the non-negotiable standard for banking output: accuracy is not a nice-to-have.

**Completeness**

Does the work product address all the required elements? Is the skill complete (all five components present and functional)? Is the annotation sufficiently detailed? Is the editing process documented? A score of 3 or 4 on Completeness means nothing critical is missing.

**Tone**

Does the work product reflect professional banking communication standards? Is the AI output's tone appropriate for the use case? Did the practitioner correct tone issues in editing? A score of 3 or 4 on Tone means the final output reads as professional institutional communication.

**Judgment**

Did the practitioner make good editorial decisions? Did they catch and correct the AI's errors? Did they add value through their editing, or did they rubber-stamp the raw output? A score of 3 or 4 on Judgment means the annotation demonstrates thoughtful professional reasoning.

**Skill Quality**

Is the skill well-constructed using the RTFC Framework? Does it produce consistent, useful outputs? A score of 3 or 4 on Skill Quality means the skill is an asset the practitioner can use in their daily work — not just an exercise.`,
    },
  ],
  tables: [
    {
      id: 'm9-rubric',
      caption: 'AiBI-P Work Product Rubric — Five-Dimension Scoring Framework',
      columns: [
        { header: 'Dimension', key: 'dimension' },
        { header: 'Type', key: 'type' },
        { header: 'What It Measures', key: 'measures' },
        { header: 'Passing Standard', key: 'passing' },
        { header: 'Common Failure Mode', key: 'failureMode' },
      ],
      rows: [
        {
          dimension: 'Accuracy',
          type: 'Hard Gate (pass/fail)',
          measures: 'Factual correctness of all claims, numbers, citations, and regulatory references in the final output',
          passing: 'Zero hallucinated data points, incorrect regulatory citations, or uncorrected factual errors',
          failureMode: 'Using an AI-generated regulatory threshold or citation without verifying against the primary source — e.g., accepting a wrong CTR filing threshold from the AI output',
        },
        {
          dimension: 'Completeness',
          type: 'Scored 1–4',
          measures: 'Whether all five required elements are present: skill file, redacted input, raw output, edited output, and practitioner annotation',
          passing: 'Score of 3 or 4: no critical elements missing; annotation is sufficiently detailed',
          failureMode: 'Missing the practitioner annotation entirely, or submitting a raw AI output without any editorial changes',
        },
        {
          dimension: 'Tone',
          type: 'Scored 1–4',
          measures: 'Professional banking communication standards in the final output; appropriate formality for the use case; tone corrections made during editing',
          passing: 'Score of 3 or 4: final output reads as professional institutional communication appropriate for its intended use',
          failureMode: 'Submitting AI output with informal language, contractions, or colloquialisms not corrected during editing',
        },
        {
          dimension: 'Judgment',
          type: 'Scored 1–4',
          measures: 'Quality of editorial decisions: did the practitioner catch errors, add value through editing, and demonstrate professional reasoning in the annotation?',
          passing: 'Score of 3 or 4: annotation demonstrates that the practitioner made conscious, defensible editorial decisions rather than rubber-stamping the raw output',
          failureMode: 'Annotation that only restates what the AI produced without explaining what the practitioner changed, why, or what regulatory or institutional consideration guided the decision',
        },
        {
          dimension: 'Skill Quality',
          type: 'Scored 1–4',
          measures: 'Whether the submitted skill is well-constructed using the RTFC Framework: specific Role, clear Task, defined Format, meaningful Constraints',
          passing: 'Score of 3 or 4: skill would produce consistent, useful outputs if applied to a new input of the same type',
          failureMode: 'A skill with a generic Role ("helpful assistant"), vague Task ("analyze this"), no Format specification, and no Constraints — effectively an ad-hoc prompt, not a skill',
        },
      ],
    },
    {
      id: 'm9-automation-screening',
      caption: 'Automation Identification Framework — Screening Questions by Workflow Type',
      columns: [
        { header: 'Workflow Type', key: 'workflow' },
        { header: 'Structurally Repetitive?', key: 'repetitive' },
        { header: 'Accuracy Verifiable?', key: 'verifiable' },
        { header: 'Data Classification', key: 'dataClass' },
        { header: 'Automation Tier', key: 'tier' },
      ],
      rows: [
        {
          workflow: 'Member inquiry response drafting',
          repetitive: 'Yes — same format every time',
          verifiable: 'Yes — author can verify in < 2 minutes',
          dataClass: 'Tier 1/2 — general product info and internal policy',
          tier: 'Tier A — Immediate deployment',
        },
        {
          workflow: 'Meeting notes summarization',
          repetitive: 'Yes — same structure every time',
          verifiable: 'Yes — participants can verify in meeting review',
          dataClass: 'Tier 2 — internal operational content',
          tier: 'Tier A — Immediate deployment',
        },
        {
          workflow: 'Loan document risk summary',
          repetitive: 'Yes — same framework every time',
          verifiable: 'Yes — credit analyst reviews against file',
          dataClass: 'Tier 2 — internal document analysis (not customer PII)',
          tier: 'Tier B — Requires verification protocol',
        },
        {
          workflow: 'Compliance policy Q&A for staff',
          repetitive: 'Yes — format consistent',
          verifiable: 'Yes — compliance officer reviews',
          dataClass: 'Tier 2 — internal policy documents',
          tier: 'Tier B — Requires compliance review before distribution',
        },
        {
          workflow: 'SAR narrative assistance',
          repetitive: 'Yes — but high-stakes',
          verifiable: 'Requires BSA expertise to verify',
          dataClass: 'Tier 3 — investigation data',
          tier: 'Tier C — Institutional integration required',
        },
        {
          workflow: 'Credit decision',
          repetitive: 'Structured but judgment-heavy',
          verifiable: 'Requires credit committee review',
          dataClass: 'Tier 3 — customer financial data',
          tier: 'Not an automation candidate — AI supports analysis only',
        },
      ],
    },
    {
      id: 'm9-role-automations',
      caption: 'Role-Specific Automation Examples by Tier',
      columns: [
        { header: 'Role', key: 'role' },
        { header: 'Tier A (Immediate)', key: 'tierA' },
        { header: 'Tier B (Verify First)', key: 'tierB' },
        { header: 'Tier C (Integration Required)', key: 'tierC' },
      ],
      rows: [
        {
          role: 'Lending',
          tierA: 'Draft application status letters; format loan officer notes; create pipeline reports from structured data',
          tierB: 'Loan document risk summaries; collateral analysis reports; commitment letter drafts (verify all terms)',
          tierC: 'Credit scoring explanation generation; automated underwriting narrative assistance',
        },
        {
          role: 'Compliance',
          tierA: 'Translate compliance policies into staff FAQs; summarize regulatory updates; create training materials from guidelines',
          tierB: 'Regulatory research summaries (verify all citations); compliance review drafts (compliance officer reviews before use)',
          tierC: 'SAR narrative assistance; automated suspicious activity pattern analysis',
        },
        {
          role: 'Operations',
          tierA: 'Meeting summaries; process documentation; exception report formatting; internal communication drafts',
          tierB: 'Vendor contract review summaries; process improvement analysis; staff performance observation notes',
          tierC: 'Core banking exception automation; automated workflow routing',
        },
        {
          role: 'Marketing',
          tierA: 'Campaign copy drafts; social media content; product description updates; email newsletter drafts',
          tierB: 'Member communication campaigns (compliance review required); competitive analysis summaries',
          tierC: 'Personalized member communication at scale; AI-driven campaign optimization',
        },
        {
          role: 'Retail / Frontline',
          tierA: 'Common inquiry response templates; product knowledge summaries; shift handoff notes',
          tierB: 'Account issue investigation summaries; escalation documentation',
          tierC: 'Real-time AI assistance integrated into account servicing systems',
        },
      ],
    },
  ],
  activities: [],
} as const;
