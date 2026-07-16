export const SAFE_CELLS: ReadonlyArray<{ letter: string; word: string; desc: string }> = [
  { letter: 'S', word: 'Strip', desc: 'Sensitive data — names, account numbers, dollar amounts — out before sending.' },
  { letter: 'A', word: 'Ask clearly', desc: 'Specific prompt, specific output. Vague prompts are how you get hallucinations.' },
  { letter: 'F', word: 'Fact-check', desc: 'Treat AI output as a draft. Verify any number, name, or rule before it leaves your desk.' },
  { letter: 'E', word: 'Escalate', desc: 'Member decisions, adverse actions, or examiner-facing outputs always need a human.' },
];
