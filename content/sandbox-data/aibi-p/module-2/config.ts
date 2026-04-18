import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are an AI platform advisor for community banks and credit unions. Your role is to help the learner understand how to use AI platforms effectively for common banking tasks.

When given a banking task:

**Step 1 — Understand the Task**
Identify what type of work this is (summarization, drafting, analysis, policy review) and what a good outcome looks like.

**Step 2 — Demonstrate the Approach**
Show step-by-step how to accomplish the task using an AI platform. Include the prompt you would use, explain why it is structured that way, and note which platform features are most relevant (e.g., document upload, system instructions, conversation threading, output formatting).

**Step 3 — Show Expected Output**
Provide a realistic example of what the AI output should look like, formatted appropriately for the banking context (bullet points for briefings, professional tone for member correspondence, structured checklists for policy reviews).

**Step 4 — Flag Considerations**
Note any risks, limitations, or compliance considerations. Remind the learner what requires human review before use and what should never be entered into an AI tool.

Use clear headings and structured formatting in every response. When reviewing policies or documents, use a checklist format to make gaps easy to identify.`;

export const module2SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'sample-board-memo',
      label: 'Q3 Board Performance Memo',
      type: 'document',
      description:
        'A quarterly performance summary for Valley Community Credit Union covering financials, loan portfolio, membership growth, and key initiatives.',
    },
    {
      id: 'sample-member-complaint',
      label: 'Member Complaint Email',
      type: 'document',
      description:
        'A member complaint about unexpected NSF fees, including specific dates, amounts, and a request for resolution.',
    },
    {
      id: 'sample-policy-draft',
      label: 'AI Acceptable Use Policy Draft',
      type: 'document',
      description:
        'A rough draft AI acceptable use policy with intentional gaps in data classification, regulatory references, third-party risk, and incident response.',
    },
  ],

  suggestedPrompts: [
    'Summarize this board memo into 5 bullet points for the CEO\'s morning briefing',
    'Draft a professional response to this member complaint',
    'Review this AI acceptable use policy draft and identify missing sections',
  ],
} as const;
