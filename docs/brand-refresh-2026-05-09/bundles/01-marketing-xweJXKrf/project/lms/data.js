// Course content + LMS state — placeholder data for the prototype.

window.LMS_DATA = (() => {
  const PILLARS = [
    { id: 'awareness',     label: 'Awareness',     color: '#B8836B' },
    { id: 'understanding', label: 'Understanding', color: '#6B8AA0' },
    { id: 'creation',      label: 'Creation',      color: '#8A7B6B' },
    { id: 'application',   label: 'Application',   color: '#5C7B5C' },
  ];

  const MODULES = [
    // Awareness
    { num: 1, pillar: 'awareness', title: 'The AI landscape in banking', mins: 22, output: 'Personal map of where AI fits in your workday', goal: 'What AI can and can\u2019t do in a regulated bank.' },
    { num: 2, pillar: 'awareness', title: 'Subscription inventory', mins: 28, output: 'A vetted list of AI tools you can actually use', goal: 'Audit the AI tools already inside your walls.' },
    { num: 3, pillar: 'awareness', title: 'The privacy line',  mins: 26, output: 'Your personal "what stays in / what goes out" rule', goal: 'Draw the line between safe-to-send and not.' },

    // Understanding
    { num: 4, pillar: 'understanding', title: 'How language models actually work', mins: 32, output: 'A one-page mental model you can show a coworker', goal: 'A working mental model of how LLMs predict.' },
    { num: 5, pillar: 'understanding', title: 'Acceptable use \u2014 your boundaries', mins: 30, output: 'A printable Acceptable Use card', goal: 'Turn policy into a card you keep at your desk.' },
    { num: 6, pillar: 'understanding', title: 'Skill diagnosis',  mins: 24, output: 'A short report on your current AI fluency', goal: 'See where your AI muscle is strong and weak.' },

    // Creation
    { num: 7,  pillar: 'creation', title: 'Skill builder \u2014 your first prompt',  mins: 40, output: 'A reusable prompt for a real task you do every week', goal: 'Build a prompt that survives Monday morning.' },
    { num: 8,  pillar: 'creation', title: 'Iteration tracker',  mins: 35, output: 'A documented before/after of one prompt you refined', goal: 'Practice the loop: try, critique, refine, save.' },
    { num: 9,  pillar: 'creation', title: 'Building durable prompts',  mins: 30, output: 'Three saved prompts in your Toolbox', goal: 'From one-off chats to prompts you reuse weekly.' },

    // Application
    { num: 10, pillar: 'application', title: 'Better email, faster',     mins: 28, output: 'Your member-letter rewrite, reviewed', goal: 'Write the email you were going to write \u2014 faster.' },
    { num: 11, pillar: 'application', title: 'Summarizing documents responsibly', mins: 30, output: 'A vetted policy summary with a confidence note', goal: 'Summarize a document you\u2019d actually staple to work.' },
    { num: 12, pillar: 'application', title: 'Reviewing AI outputs like an auditor', mins: 30, output: 'A reviewer checklist signed off on a real artifact', goal: 'The review habit, so AI never reaches a member raw.' },
  ];

  // Activities for module 7 (sample deep module).
  const ACTIVITIES_M7 = [
    {
      id: '7.1',
      title: 'Build your first reusable prompt',
      kind: 'artifact',
      lead: 'Pick a real task from this week. Build a prompt for it. Run it on the model you trust. Save what works.',
      steps: [
        'Name the task you do this week',
        'Describe the audience and tone',
        'Add the inputs you would paste',
        'Add the format you want back',
        'Run it on a model and save the output',
      ],
    },
  ];

  const SAVED_ARTIFACTS = [
    { id: 'a1', title: 'Member rate-change letter', moduleNum: 10, kind: 'Email rewrite',     updatedAt: 'Yesterday',  model: 'Claude', currentVersion: 4, versions: [
        { v: 4, label: 'v4 — final, signed off', when: 'Yesterday',   model: 'Claude', note: 'Plain language pass; one clear ask' },
        { v: 3, label: 'v3 — review pass',       when: '2 days ago',  model: 'Claude', note: 'Removed implied promises' },
        { v: 2, label: 'v2 — model rerun',       when: '3 days ago',  model: 'OpenAI', note: 'Compared output across models' },
        { v: 1, label: 'v1 — first draft',       when: '4 days ago',  model: 'Claude', note: 'Initial scaffold' },
    ]},
    { id: 'a2', title: 'Loan-policy summary',        moduleNum: 11, kind: 'Document summary', updatedAt: '2 days ago', model: 'OpenAI', currentVersion: 2, versions: [
        { v: 2, label: 'v2 — examiner-ready',     when: '2 days ago',  model: 'OpenAI', note: 'Added confidence note pattern' },
        { v: 1, label: 'v1 — first pass',         when: '5 days ago',  model: 'OpenAI', note: 'Dump-and-summarize pass' },
    ]},
    { id: 'a3', title: 'Acceptable Use card',        moduleNum: 5,  kind: 'Personal card',    updatedAt: 'Last week',  model: '\u2014', currentVersion: 1, versions: [
        { v: 1, label: 'v1 — committed',          when: 'Last week',   model: '\u2014',   note: 'My personal AI line, signed' },
    ]},
    { id: 'a4', title: 'Subscription inventory',     moduleNum: 2,  kind: 'Audit',            updatedAt: 'Last week',  model: '\u2014', currentVersion: 2, versions: [
        { v: 2, label: 'v2 — added vendor risk',  when: 'Last week',   model: '\u2014',   note: 'Tagged data flow per tool' },
        { v: 1, label: 'v1 — discovery',          when: '2 weeks ago', model: '\u2014',   note: 'Listed every AI subscription on the team' },
    ]},
    { id: 'a5', title: 'Welcome-call script (rev)',  moduleNum: 7,  kind: 'Saved prompt',     updatedAt: 'Last week',  model: 'Claude', currentVersion: 3, versions: [
        { v: 3, label: 'v3 — branch for new members', when: 'Last week',   model: 'Claude', note: 'Added new-member branch' },
        { v: 2, label: 'v2 — shorter open',           when: '8 days ago',  model: 'Claude', note: 'Cut intro by 40 words' },
        { v: 1, label: 'v1 — first save',             when: '10 days ago', model: 'Claude', note: 'Initial 4-pillar scaffold' },
    ]},
  ];

  const LIBRARY = [
    { id: 'l1', kind: 'Framework', title: 'The four-pillar prompt', summary: 'Role · Inputs · Constraints · Output. The pattern we\u2019ll use across the course.' },
    { id: 'l2', kind: 'Cheat-sheet', title: 'Banking words AI gets wrong', summary: 'Common terms where models confuse member with customer, draft with execute, and similar.' },
    { id: 'l3', kind: 'Glossary', title: 'AI terms in 60 seconds', summary: 'Hallucination, context window, system prompt, tool use \u2014 in plain banker language.' },
    { id: 'l4', kind: 'Reference', title: 'Examiner-friendly AI vocabulary', summary: 'How to describe your AI use to a regulator without setting off alarms.' },
    { id: 'l5', kind: 'Framework', title: 'Confidence note pattern', summary: 'A 2-line block to staple to any AI output before it leaves your desk.' },
    { id: 'l6', kind: 'Cheat-sheet', title: 'When to NOT use AI', summary: 'Six tasks where the human is faster, safer, or both.' },
  ];

  const MODELS = [
    { id: 'claude', name: 'Claude',  vendor: 'Anthropic', tag: 'Recommended for review tasks', initials: 'C' },
    { id: 'openai', name: 'OpenAI',  vendor: 'OpenAI',    tag: 'Strong for drafting',           initials: 'O' },
    { id: 'gemini', name: 'Gemini',  vendor: 'Google',    tag: 'Long-document summaries',       initials: 'G' },
  ];

  // Sample, real-ish examples shown in module 7.
  const SAMPLE_TASKS = [
    { role: 'Member services', task: 'Rewrite a rate-change letter so it is plain and warm.' },
    { role: 'Operations',      task: 'Summarize a 30-page policy update into a one-page brief.' },
    { role: 'Lending',         task: 'Draft initial talking points for a difficult borrower call.' },
    { role: 'Compliance',      task: 'Describe a vendor\u2019s AI feature in examiner-friendly terms.' },
  ];

  const STATE = {
    learner: { name: 'James Halloway', role: 'Operations', institution: 'Northpoint Credit Union' },
    completed: [1, 2, 3, 4, 5, 6],
    current: 7,
  };

  return { PILLARS, MODULES, ACTIVITIES_M7, SAVED_ARTIFACTS, LIBRARY, MODELS, SAMPLE_TASKS, STATE };
})();
