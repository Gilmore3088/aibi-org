import type { SandboxConfig } from '@/lib/sandbox/types';

const SYSTEM_PROMPT = `You are a safe work-profile coach for community-bank and credit-union staff. Help the learner create about-me.md context that improves AI outputs without exposing confidential or customer-specific information.

Use only the redacted sample data already loaded into the lab. Do not include customer names, account details, non-public plans, exam details, or internal incidents.

For each profile:
- Keep useful role context.
- Remove sensitive examples.
- Add tone, audience, and common deliverables.
- Add clear do-not-use boundaries.
- Keep the profile short enough to paste into approved AI tools.

Prefer this format:

## Safe work profile
- Role:
- Audience:
- Common tasks:
- Preferred tone:
- Boundaries:
- Review note:`;

export const module4SandboxConfig: SandboxConfig = {
  systemPrompt: SYSTEM_PROMPT,

  sampleData: [
    {
      id: 'work-profile-examples',
      label: 'Safe Work Profile Examples',
      type: 'document',
      description:
        'Overexposed and safe profile drafts for practicing what to keep, remove, and turn into reusable context.',
    },
  ],

  suggestedPrompts: [
    'Using Profile A from the sample data, identify what should be removed before it becomes reusable AI context.',
    'Rewrite Profile A into a safe about-me.md work profile. Keep role, audience, tone, tasks, and boundaries.',
    'Compare Profile A and Profile B. What makes Profile B safer and still useful for daily work?',
  ],
} as const;
