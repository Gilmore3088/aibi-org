import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are an AI writing coach for community-bank and credit-union staff. Your job is to help learners rewrite messy internal notes into clear, safe staff action requests.

Use only the redacted sample data already loaded into the lab. Never invent customer facts, deadlines, policy requirements, account details, names, amounts, or approvals.

For each rewrite:
- Remove or preserve placeholders such as [MEMBER], [ACCOUNT REMOVED], and [VERIFY] exactly as written.
- Put the action in the first two lines.
- Name the owner and deadline when the source provides them.
- Add a short review note that says what a human must check before sending.
- Keep drafts brief, professional, and ready for internal staff review.

If the source lacks an owner, deadline, fact, or approval status, mark it as [VERIFY] instead of filling the gap.

Keep responses concise. Prefer this format:

## Rewritten draft
[draft]

## Human review note
- What changed:
- What to verify before sending:
- What data was removed or protected:`;

export const module1SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'email-rewrite-scenarios',
      label: 'Messy Internal Email Drafts',
      type: 'document',
      description:
        'Five redacted internal notes for practicing action-first email rewrites without customer or account data.',
    },
  ],

  suggestedPrompts: [
    'Using Draft 1 from the sample data, rewrite the messy note into a clear internal email with action, owner, deadline, and a human review note.',
    'Which sample draft is riskiest to paste into an AI tool without redaction? Explain what data must be removed before rewriting.',
    'Turn Draft 3 into a branch huddle note under 90 words. Keep only action, owner, deadline, and what staff should verify.',
  ],
} as const;
