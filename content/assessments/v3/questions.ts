// AiBI Readiness Assessment — v3 Question Pool
// 12 questions, one per topic. Total score range: 12-48 (12 questions x 1-4 points).
// Topics drawn from the AI readiness framework for community banks and credit
// unions; voice deliberately plain-language to keep the free funnel accessible
// to non-technical executives.

import type { AssessmentQuestion } from './types';

export const questions: readonly AssessmentQuestion[] = [
  {
    id: 'sv-01',
    dimension: 'strategic-value',
    prompt: 'Have you identified specific bottlenecks where AI could measurably improve efficiency or revenue, or are you running isolated experiments?',
    options: [
      { label: 'We have no specific use cases identified — AI is a general "we should look at this" topic.', points: 1 },
      { label: 'A few staff are experimenting on their own, but it is not tied to any institutional priority.', points: 2 },
      { label: 'We have named two or three high-friction processes (loan ops, BSA narratives, member communications) as candidates and are scoping them.', points: 3 },
      { label: 'AI initiatives are tied to specific efficiency-ratio or revenue targets with named owners and measured outcomes.', points: 4 },
    ],
  },
  {
    id: 'ir-01',
    dimension: 'infrastructure-readiness',
    prompt: 'How easily can your core systems connect to new tools and services?',
    options: [
      { label: 'Our core is largely closed — any new integration is a multi-month vendor project.', points: 1 },
      { label: 'We can integrate through our core provider’s marketplace, but custom connections are difficult.', points: 2 },
      { label: 'Our stack supports standard APIs and we have completed at least one custom integration in the past year.', points: 3 },
      { label: 'Our systems are modular with documented APIs; we routinely add third-party tools without core-provider involvement.', points: 4 },
    ],
  },
  {
    id: 'dq-01',
    dimension: 'data-quality',
    prompt: 'Can your institution reliably pull clean, current customer and operational data into a single view?',
    options: [
      { label: 'Our data lives in disconnected systems and reconciling it is a manual exercise each time.', points: 1 },
      { label: 'We can pull data with effort, but quality is inconsistent and duplicates are common.', points: 2 },
      { label: 'We maintain a reasonably clean data set for core reporting, though gaps exist outside that.', points: 3 },
      { label: 'We have a unified, verified data layer that AI tools could reference for accurate institutional context.', points: 4 },
    ],
  },
  {
    id: 'sat-01',
    dimension: 'security-approved-tools',
    prompt: 'Does your institution control which AI tools staff are allowed to use and route traffic through approved channels?',
    options: [
      { label: 'We have no controls — staff use whatever public AI tools they find.', points: 1 },
      { label: 'We have written guidance but no technical enforcement.', points: 2 },
      { label: 'We maintain an approved AI tool list and most staff use only those tools.', points: 3 },
      { label: 'All staff AI use routes through institution-approved channels with access controls, logging, and visibility into who used what.', points: 4 },
    ],
  },
  {
    id: 'rs-01',
    dimension: 'runtime-safeguards',
    prompt: 'Do you have safeguards in place to catch unsafe inputs going into AI tools and unsafe outputs coming back?',
    options: [
      { label: 'None — staff send and receive AI content with no checks.', points: 1 },
      { label: 'We rely on staff judgment alone to catch problems.', points: 2 },
      { label: 'We have written rules for what to send and a review step for high-stakes outputs.', points: 3 },
      { label: 'We use both input controls (PII masking, restricted-data screening) and output review for any AI-assisted work that touches customers or decisions.', points: 4 },
    ],
  },
  {
    id: 'rc-01',
    dimension: 'regulatory-compliance',
    prompt: 'If an AI tool helped shape a credit decision, could you explain the principal reasons behind that decision to a regulator or to the customer?',
    options: [
      { label: 'We have not considered this — AI is not part of our credit decision process and we have not thought through the requirement.', points: 1 },
      { label: 'We are aware ECOA / Reg B applies but have not mapped AI-assisted decisions to its requirements.', points: 2 },
      { label: 'We can produce adverse-action reasoning for AI-assisted decisions but the process is manual.', points: 3 },
      { label: 'Our AI-assisted credit processes generate the required principal-reason disclosures as a standard output, reviewed by compliance.', points: 4 },
    ],
  },
  {
    id: 'flt-01',
    dimension: 'fair-lending-testing',
    prompt: 'Are you testing AI-assisted processes for disparate impact on protected classes?',
    options: [
      { label: 'We have not considered fair lending risk in the context of AI.', points: 1 },
      { label: 'We are aware of the risk but have not built it into our AI oversight.', points: 2 },
      { label: 'Our compliance team reviews AI-assisted processes for ECOA/Reg B alignment as part of our standard fair lending program.', points: 3 },
      { label: 'We have a documented fair lending testing protocol for AI-assisted processes, including disparate-impact analysis, with board reporting.', points: 4 },
    ],
  },
  {
    id: 'hitl-01',
    dimension: 'human-in-the-loop',
    prompt: 'Has your institution clearly defined which AI-assisted tasks need mandatory human review and which can run unattended?',
    options: [
      { label: 'We have not defined this — AI use is ad hoc.', points: 1 },
      { label: 'Staff use their own judgment about when to double-check AI output.', points: 2 },
      { label: 'We have written guidelines identifying high-risk tasks that require human review.', points: 3 },
      { label: 'We have a formal policy mapping each AI use case to a specific oversight level (automated, sampled review, mandatory human approval) with logs.', points: 4 },
    ],
  },
  {
    id: 'tc-01',
    dimension: 'talent-culture',
    prompt: 'Are you actively preparing your workforce to move from manual task execution to AI oversight and workflow design?',
    options: [
      { label: 'No — staff are not being prepared for any change in how they work.', points: 1 },
      { label: 'Leadership talks about it but no concrete training or role changes are underway.', points: 2 },
      { label: 'A specific team or role has been retrained or restructured around AI oversight.', points: 3 },
      { label: 'We have institution-wide training, redefined role expectations, and career paths built around working alongside AI.', points: 4 },
    ],
  },
  {
    id: 'dsr-01',
    dimension: 'data-safety-reflexes',
    prompt: 'Have you trained staff on a clear data classification system (e.g., Green/Yellow/Red) so they know what data can and cannot be put into AI tools?',
    options: [
      { label: 'No — staff have not been trained on AI-specific data handling.', points: 1 },
      { label: 'Staff have heard warnings but cannot reliably name what is restricted.', points: 2 },
      { label: 'Staff understand the categories (PII, NPI, loan files) but apply them inconsistently.', points: 3 },
      { label: 'Staff use a clear classification system reflexively; restricted data is masked or kept out of AI tools as a matter of habit.', points: 4 },
    ],
  },
  {
    id: 'cv-01',
    dimension: 'continuous-validation',
    prompt: 'How does your model risk management approach handle AI tools that change over time?',
    options: [
      { label: 'We have not addressed AI in our model risk framework.', points: 1 },
      { label: 'We treat AI tools the same as static models — annual review at most.', points: 2 },
      { label: 'We have updated our framework to acknowledge AI but monitoring is still periodic.', points: 3 },
      { label: 'We have continuous validation in place — drift, performance, and behavior are monitored on an ongoing basis, not just annually.', points: 4 },
    ],
  },
  {
    id: 'vr-01',
    dimension: 'vendor-risk',
    prompt: 'When you evaluate a third-party AI vendor, do you understand their model behavior, data handling, and how they would integrate with your systems?',
    options: [
      { label: 'We treat AI vendors like any other SaaS — we do not ask AI-specific questions.', points: 1 },
      { label: 'We do informal reviews but lack a documented AI-vendor process.', points: 2 },
      { label: 'AI vendors go through our standard TPRM process including data handling and security.', points: 3 },
      { label: 'We apply an AI-specific TPRM overlay covering model behavior, explainability, drift monitoring, and integration risk beyond standard vendor review.', points: 4 },
    ],
  },
] as const;
