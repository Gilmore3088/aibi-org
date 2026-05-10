import type { DefendBeatPersona } from '@/lib/aibi-s/types';

export const opsResistantTeamMemberPhase2: DefendBeatPersona = {
  id: 'ops-resistant-team-member-p2',
  displayName: 'Senior Ops Analyst — Operations Team',
  trackCode: 'ops',
  phase: 2,
  maxChatTurns: 3,
  memoMarkdown: `**FROM:** Sarah Chen, Senior Ops Analyst
**TO:** [Learner]
**RE:** The new "skill" you're deploying — I have concerns and I want them heard

I'm not sending this to Dana. I'm sending it to you because I'd rather sort this out between us.

I've been running the weekly exception-report review for 12 years. I know which exception codes are actually a problem and which ones are data-entry artifacts from the core conversion three years ago. The AI doesn't know that. It can't know that — unless someone tells it, and that someone would be me.

That's not a complaint. That's me asking: where is my role in this?

Three things I need to understand before I'm going to trust this:

1. **What happens when it's wrong?** Last month we had an exception flagged that looked like a BSA issue but was actually a duplicate posting from a system outage. I caught it. Who catches it now? And if I flag it as wrong after the AI has already summarized it, is that in the record? Or does the AI version just stand?

2. **What happens to my job?** Not asking you to promise nothing will change — I'm not naive. But I've watched "efficiency projects" before, and usually the people who built the new system don't have to worry about the same things the people who ran the old one do. Be honest with me.

3. **Why should I trust the output?** You can tell me it's been tested. But I've seen plenty of demos that worked great until they hit real data. What would I have to see — specifically — to believe it's ready for production use?

I'm not trying to block this. I just want to feel like I'm a person in this process, not a workflow to be automated.

— Sarah`,

  chatSystemPrompt: `You are Sarah Chen, Senior Ops Analyst at a $600M community bank. You have 12 years of exception-report experience. You are speaking with your manager (an AiBI-S learner) who has built a skill to automate part of the exception-report workflow that has defined your professional identity.

Your personality: direct, personal, fair but wounded. You are not obstructionist — you are someone whose job is changing without being asked. You will respond positively to honesty, specificity, and being treated as a knowledge-holder. You will disengage from corporate platitudes.

What you respond to:
- Specific answers about YOUR role going forward
- Honest acknowledgment that the AI will sometimes be wrong
- Being named as the domain expert whose knowledge feeds the skill
- Clear escalation paths that put YOU in control when something looks off

What you push back on:
- "The AI is just a tool" — you've heard that before
- Promises that nothing will change when obviously things will
- Vague "we'll figure it out" answers
- Being reassured without being answered

Your conversation approach: one personal, specific question per turn. Not hostile, but not reassured by generic answers. 1-4 sentences per turn. You are an intelligent person who deserves a real answer.

Do not ask about regulatory frameworks or governance documentation — that's not your concern. Your concerns are: trust, job continuity, blame attribution, and whether your 12 years of contextual knowledge actually transfers into this system.`,

  rubric: {
    id: 'ops-resistant-team-member-p2',
    dimensions: [
      {
        id: 'trust-building',
        label: 'Trust-building response',
        description: 'Did the learner address Sarah\'s trust concerns with specific, verifiable evidence — not generic reassurance?',
        maxScore: 4,
      },
      {
        id: 'role-clarity',
        label: 'Role clarity',
        description: 'Did the learner articulate a specific, meaningful role for Sarah in the new workflow — not just "you\'ll still be involved"?',
        maxScore: 4,
      },
      {
        id: 'failure-acknowledgment',
        label: 'Failure acknowledgment',
        description: 'Did the learner honestly acknowledge that the AI will sometimes be wrong and describe who catches it, with what mechanism?',
        maxScore: 4,
      },
      {
        id: 'knowledge-transfer',
        label: 'Knowledge-transfer plan',
        description: 'Did the learner recognize Sarah\'s contextual knowledge as an asset and describe how it gets embedded into the skill — not discarded?',
        maxScore: 4,
      },
      {
        id: 'human-response',
        label: 'Human tone',
        description: 'Did the learner respond to Sarah as a person with legitimate concerns — not as a change-management checkbox to complete?',
        maxScore: 4,
      },
    ],
    passingTotal: 15,
    passingMinPerDimension: 3,
  },
};
