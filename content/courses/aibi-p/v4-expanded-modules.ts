import type { Section } from './types';

export interface ExpandedModule {
  readonly number: number;
  readonly goal: string;
  readonly includes: readonly string[];
  readonly practice: string;
  readonly artifact: string;
  readonly bankingBoundary: string;
  readonly takeaways: readonly string[];
  readonly sections: readonly Section[];
}

function sections(
  number: number,
  items: readonly {
    readonly title: string;
    readonly content: string;
    readonly tryThis?: string;
  }[]
): readonly Section[] {
  return items.map((item, index) => ({
    id: `m${number}-v4-${index + 1}`,
    title: item.title,
    content: item.content,
    tryThis: item.tryThis,
  }));
}

export const V4_AIBIP_MODULES: readonly ExpandedModule[] = [
  {
    number: 1,
    goal: 'Create immediate usefulness with low-risk daily AI wins.',
    includes: ['Emails', 'Summaries', 'Thinking support', 'Productivity habits'],
    practice: 'Rewrite a messy internal email so the action, owner, and deadline are clear.',
    artifact: 'Rewritten email starter.',
    bankingBoundary: 'Use non-sensitive internal examples only. Do not paste customer or account data.',
    takeaways: ['Identify quick wins', 'Use AI without exposing sensitive data', 'Review every output before use'],
    sections: sections(1, [
      {
        title: 'What AI Can Help With Today',
        content:
          'AI is useful for first drafts, summaries, structure, brainstorming, and clearer communication. The goal is not to automate judgment. The goal is to reduce friction in routine work while the banker remains responsible for the final output.',
      },
      {
        title: 'The First Safe Win',
        content:
          'Start with a messy internal message. Ask AI to make it shorter, clearer, and more action-oriented without adding facts. This builds confidence without creating unnecessary banking risk.',
        tryThis: 'Rewrite a confusing internal update into a clear message under 150 words.',
      },
    ]),
  },
  {
    number: 2,
    goal: 'Explain what AI is, what it is not, and why human review matters.',
    includes: ['LLM basics', 'Hallucinations', 'Limits', 'Verification habits'],
    practice: 'Spot unsupported claims in an AI-generated banking answer.',
    artifact: 'AI output review worksheet.',
    bankingBoundary: 'Treat confident AI language as a draft until facts, dates, numbers, and policy claims are verified.',
    takeaways: ['Explain LLMs simply', 'Recognize hallucinations', 'Separate verified facts from assumptions'],
    sections: sections(2, [
      {
        title: 'LLMs in Plain Language',
        content:
          'A large language model predicts useful text from patterns and context. It can sound fluent without being correct. It does not know your institution, your policies, or your customer facts unless approved source material is provided.',
      },
      {
        title: 'Hallucinations and Limits',
        content:
          'A hallucination is a confident answer that is not grounded in reliable evidence. In banking, unsupported policy claims, invented citations, wrong dates, and incorrect fee explanations must be caught before use.',
        tryThis: 'Mark every sentence in an AI answer that would need a source before being shared.',
      },
    ]),
  },
  {
    number: 3,
    goal: 'Teach prompt strategies as tools for specific banking jobs.',
    includes: ['Structured prompts', 'Transformation prompts', 'Analysis prompts', 'Thinking prompts', 'Template prompts', 'Sanitization prompts'],
    practice: 'Choose the right prompt strategy and build a role-based prompt for a recurring task.',
    artifact: 'Prompt strategy cheat sheet.',
    bankingBoundary: 'Describe the task without exposing PII, NPI, account details, or confidential bank data.',
    takeaways: ['Use a repeatable prompt pattern', 'Add useful constraints', 'Create one reusable role prompt'],
    sections: sections(3, [
      {
        title: 'Six Ways You Use AI at Work',
        content:
          'A prompt is not one thing. Bankers use structured prompts to write, transformation prompts to edit, analysis prompts to review, thinking prompts to plan, template prompts to repeat workflows, and sanitization prompts to reduce risk before AI use.',
      },
      {
        title: 'The Foundation Pattern',
        content:
          'A practical structured prompt includes role, task, context, format, and constraints. This structure turns vague requests into usable drafts and makes review easier.',
        tryThis: 'Match one banking task to a prompt strategy, then add role, output format, and three safety constraints.',
      },
    ]),
  },
  {
    number: 4,
    goal: 'Create the learner profile AI can reuse safely.',
    includes: ['about-me.md', 'Role context', 'Voice profile', 'Do and do-not rules'],
    practice: 'Draft a safe AI work profile using placeholders.',
    artifact: 'AI work profile.',
    bankingBoundary: 'The profile should contain work preferences and role context, not customer data or confidential records.',
    takeaways: ['Define role context', 'Capture voice preferences', 'Set personal AI boundaries'],
    sections: sections(4, [
      {
        title: 'Your AI Work Profile',
        content:
          'A work profile gives AI reusable context about your role, audience, tone, recurring work, and review expectations. It saves setup time and improves consistency.',
      },
      {
        title: 'Do and Do-Not Rules',
        content:
          'The do-not rules matter as much as the helpful context. They remind AI not to make promises, not to add facts, not to decide customer outcomes, and not to use sensitive data.',
        tryThis: 'Write five do-not rules for AI use in your current role.',
      },
    ]),
  },
  {
    number: 5,
    goal: 'Teach reusable context for real projects.',
    includes: ['Project briefs', 'Reusable context', 'Audience notes', 'Success criteria'],
    practice: 'Build a project brief AI can use repeatedly.',
    artifact: 'Project brief template.',
    bankingBoundary: 'Project context should be sanitized and approved before reuse in any AI tool.',
    takeaways: ['Package context once', 'Use project briefs for better outputs', 'Avoid repeating setup prompts'],
    sections: sections(5, [
      {
        title: 'Projects Need Context',
        content:
          'AI performs better when it knows the project goal, audience, source material, constraints, and desired output. A project brief makes that context reusable.',
      },
      {
        title: 'Reusable Context Without Sensitive Data',
        content:
          'Good project context explains the work without including customer identifiers, account-level detail, private employee information, or confidential bank records.',
        tryThis: 'Draft a sanitized project brief for a real non-sensitive task.',
      },
    ]),
  },
  {
    number: 6,
    goal: 'Show how AI can safely support file and document workflows.',
    includes: ['Uploads', 'Summaries', 'Comparisons', 'Extraction', 'Transformation prompts', 'Analysis prompts'],
    practice: 'Summarize a policy or procedure using source-grounded instructions.',
    artifact: 'Document workflow prompt.',
    bankingBoundary: 'Only use files your institution permits, and verify summaries against the source.',
    takeaways: ['Use files safely', 'Ask for source-grounded answers', 'Verify document summaries'],
    sections: sections(6, [
      {
        title: 'Files Change the Workflow',
        content:
          'File-based AI workflows can summarize, compare, extract, and reorganize information from approved documents. The risk depends on what is in the file and which tool can access it.',
      },
      {
        title: 'Source-Grounded Summaries',
        content:
          'Ask AI to point back to source sections, flag ambiguity, and separate required actions from background context. Do not accept a policy summary without review.',
        tryThis: 'Write a prompt that asks for a frontline summary of an approved procedure excerpt.',
      },
    ]),
  },
  {
    number: 7,
    goal: 'Give learners a clear, non-hype view of the AI tools landscape.',
    includes: ['ChatGPT', 'Claude', 'Copilot', 'Gemini', 'Perplexity', 'NotebookLM', 'Prompt behavior across tools'],
    practice: 'Choose the safest tool category for common banking tasks.',
    artifact: 'Tool choice map.',
    bankingBoundary: 'Capability does not equal approval. Institution policy decides what tool can be used with what data.',
    takeaways: ['Compare tool categories', 'Match tools to tasks', 'Separate personal accounts from approved access'],
    sections: sections(7, [
      {
        title: 'Tool Categories',
        content:
          'General chat tools help draft and think. Workplace copilots help inside approved productivity suites. Search-answer tools support public research. Notebook and file tools organize source material.',
      },
      {
        title: 'Choose by Task and Data',
        content:
          'Do not pick a tool because it is popular. Pick based on the work, the data involved, the need for sources, and whether your institution has approved the tool.',
        tryThis: 'Match three tasks to the safest tool category.',
      },
    ]),
  },
  {
    number: 8,
    goal: 'Introduce agents as workflow thinking, not advanced building.',
    includes: ['What agents are', 'Multi-step workflows', 'Human checkpoints', 'Risk points'],
    practice: 'Map a simple AI-assisted workflow with human checkpoints.',
    artifact: 'Workflow map.',
    bankingBoundary: 'Agents should not execute customer-impacting, credit, compliance, legal, or payment actions without approved controls.',
    takeaways: ['Explain agents simply', 'Map before automating', 'Place human checkpoints'],
    sections: sections(8, [
      {
        title: 'Agents in Plain Language',
        content:
          'An agent is an AI-enabled workflow that can take multiple steps toward a goal. In AiBI-P, learners only need the concept: where agents help, where they create risk, and where humans must remain in control.',
      },
      {
        title: 'Workflow Thinking',
        content:
          'Before any automation, map the input, steps, decision points, data used, output, reviewer, and escalation path. If the workflow cannot be explained manually, it should not be automated.',
        tryThis: 'Map one simple workflow and mark each human checkpoint.',
      },
    ]),
  },
  {
    number: 9,
    goal: 'Make banking safety rules concrete and usable.',
    includes: ['PII', 'NPI', 'SAFE rule', 'Red/yellow/green use', 'Sanitization prompts', 'Review prompts'],
    practice: 'Convert a risky prompt into a safe prompt.',
    artifact: 'Safe AI use checklist.',
    bankingBoundary: 'Red-zone data and decisions require escalation and approved systems.',
    takeaways: ['Know what not to paste', 'Use SAFE before prompting', 'Classify risk quickly'],
    sections: sections(9, [
      {
        title: 'What Not to Paste',
        content:
          'Do not paste customer names, account numbers, Social Security numbers, transaction history, private financial records, confidential reports, or any data your institution has not approved for AI use.',
      },
      {
        title: 'The SAFE Rule',
        content:
          'SAFE means Strip sensitive data, Ask clearly, Fact-check outputs, and Escalate risky decisions. It is a practical guardrail, not a regulatory lecture.',
        tryThis: 'Sanitize a risky prompt by removing customer-specific information and keeping the reusable task.',
      },
    ]),
  },
  {
    number: 10,
    goal: 'Apply the foundations to real banking roles.',
    includes: ['Retail', 'Lending', 'Operations', 'Compliance', 'Finance', 'Executive use cases', 'Role-specific prompt strategies'],
    practice: 'Choose a role-based use case and define the human review step.',
    artifact: 'Role use-case card.',
    bankingBoundary: 'Role examples must preserve human review for customer-facing, credit, compliance, and operational-risk outputs.',
    takeaways: ['Identify role-specific AI wins', 'Know when to escalate', 'Design review into the workflow'],
    sections: sections(10, [
      {
        title: 'Role-Based Use Cases',
        content:
          'AI can help retail teams draft clearer messages, lending teams organize analysis drafts, operations teams summarize procedures, compliance teams review gaps, finance teams summarize variance narratives, and leaders prepare briefings.',
      },
      {
        title: 'Use Case Boundaries',
        content:
          'The same AI task can be green, yellow, or red depending on the data and decision involved. A generic customer email template is different from a response using live account facts.',
        tryThis: 'Pick one role use case and name the review owner before output is used.',
      },
    ]),
  },
  {
    number: 11,
    goal: 'Turn useful prompts into a reusable daily system.',
    includes: ['Prompt library', 'Strategy categories', 'Versioning', 'Examples', 'What-not-to-paste notes'],
    practice: 'Save three reusable prompts with safety notes.',
    artifact: 'Personal prompt library.',
    bankingBoundary: 'Saved prompts should use placeholders and safety notes instead of sensitive real data.',
    takeaways: ['Save what works', 'Organize prompts by task', 'Improve prompts over time'],
    sections: sections(11, [
      {
        title: 'Personal Prompt Library',
        content:
          'A prompt library prevents the learner from starting over every time. Store prompts by task: email, meeting summary, policy summary, review checklist, project brief, and role-specific workflow.',
      },
      {
        title: 'Prompt Versioning',
        content:
          'When a prompt fails, improve the prompt instead of only fixing the output. Save better versions and keep notes on when each prompt should and should not be used.',
        tryThis: 'Save three prompts and add a what-not-to-paste note to each one.',
      },
    ]),
  },
  {
    number: 12,
    goal: 'Demonstrate practical, safe AI use through a final lab.',
    includes: ['Final work product', 'Artifacts', 'Human review notes', 'Safe AI use pledge'],
    practice: 'Submit a final practitioner lab package.',
    artifact: 'Final practitioner lab submission.',
    bankingBoundary: 'The final submission must show safe prompting, review, limits, and human judgment.',
    takeaways: ['Package a real AI-assisted workflow', 'Document review decisions', 'Earn the practitioner credential'],
    sections: sections(12, [
      {
        title: 'Final Practitioner Lab',
        content:
          'The final lab is the proof of learning. Submit the prompt, sanitized context or source, AI output, review notes, final edited output, and artifact evidence.',
      },
      {
        title: 'Credential Standard',
        content:
          'AiBI-P should mean the learner can use AI safely and practically. Completion requires modules, practice, artifacts, final work product, knowledge check, and a safe AI use pledge.',
        tryThis: 'Choose one low-risk workflow that produces a useful final artifact.',
      },
    ]),
  },
] as const;

export const V4_AIBIP_MODULE_BY_NUMBER = new Map(
  V4_AIBIP_MODULES.map((module) => [module.number, module])
);
