// AiBI-P Practitioner Proficiency Assessment — Question Bank
// 40 questions across 5 topics. Each attempt draws 12 randomly.
// All questions are specific to community banking AI contexts.

export interface ExamOption {
  readonly label: string;
  readonly key: 'a' | 'b' | 'c' | 'd';
}

export interface ExamQuestion {
  readonly id: string;
  readonly topic: Topic;
  readonly stem: string;
  readonly options: readonly [ExamOption, ExamOption, ExamOption, ExamOption];
  readonly correctKey: 'a' | 'b' | 'c' | 'd';
  readonly explanation: string;
}

export type Topic =
  | 'gen-ai-fundamentals'
  | 'prompting'
  | 'safe-use'
  | 'use-case-identification'
  | 'measurement';

export const TOPIC_LABELS: Record<Topic, string> = {
  'gen-ai-fundamentals': 'Gen AI Fundamentals',
  'prompting': 'Prompting & the RTFC Framework',
  'safe-use': 'Safe Use in Regulated Institutions',
  'use-case-identification': 'Use Case Identification',
  'measurement': 'Measurement & Accountability',
};

export const examQuestions: readonly ExamQuestion[] = [
  // ── Gen AI Fundamentals (8 questions) ──
  {
    id: 'gai-01',
    topic: 'gen-ai-fundamentals',
    stem: 'A large language model generates a confident, detailed answer about a regulatory deadline that does not exist. This is an example of:',
    options: [
      { label: 'A data breach in the training set', key: 'a' },
      { label: 'Hallucination — the model generating plausible but fabricated content', key: 'b' },
      { label: 'A software bug that should be reported to the vendor', key: 'c' },
      { label: 'Intentional misinformation embedded by the model developer', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs predict statistically likely text, not verified facts. Hallucination is a fundamental behavior of the technology, not a bug.',
  },
  {
    id: 'gai-02',
    topic: 'gen-ai-fundamentals',
    stem: 'Which statement most accurately describes how a large language model produces output?',
    options: [
      { label: 'It searches a database of facts and returns the most relevant entry', key: 'a' },
      { label: 'It predicts the most statistically probable next token based on patterns in training data', key: 'b' },
      { label: 'It reasons through the problem step by step like a human analyst', key: 'c' },
      { label: 'It retrieves and paraphrases content from the internet in real time', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs are statistical prediction engines. They do not search databases, reason causally, or access the internet unless specifically configured to do so.',
  },
  {
    id: 'gai-03',
    topic: 'gen-ai-fundamentals',
    stem: 'A loan officer uses an AI tool to draft a denial letter. Before sending, the most important step is:',
    options: [
      { label: 'Checking whether the AI used correct grammar and professional tone', key: 'a' },
      { label: 'Verifying that every factual claim and regulatory citation in the letter is accurate', key: 'b' },
      { label: 'Asking the AI to review its own work for errors', key: 'c' },
      { label: 'Confirming the AI model is the latest available version', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-generated content in regulated communications must be verified by a human for factual accuracy, especially regulatory citations. Grammar is secondary to accuracy.',
  },
  {
    id: 'gai-04',
    topic: 'gen-ai-fundamentals',
    stem: 'What is the primary risk of using a public LLM (like ChatGPT) for internal banking work?',
    options: [
      { label: 'The output quality is lower than private models', key: 'a' },
      { label: 'Data entered into the model may be retained and used for training, exposing confidential information', key: 'b' },
      { label: 'Public models cannot process financial data', key: 'c' },
      { label: 'Regulators have banned all use of public LLMs in banking', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Public models may retain input data. Confidential member data, examination findings, and non-public financial information must never be entered into public models.',
  },
  {
    id: 'gai-05',
    topic: 'gen-ai-fundamentals',
    stem: 'The AIEOG AI Lexicon, published in February 2026, is significant because:',
    options: [
      { label: 'It bans specific AI tools from use in banking', key: 'a' },
      { label: 'It provides the first official cross-agency vocabulary for financial AI governance', key: 'b' },
      { label: 'It replaces SR 11-7 as the primary model risk guidance', key: 'c' },
      { label: 'It mandates that all banks adopt AI within 24 months', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The AIEOG AI Lexicon (US Treasury, FBIIC, FSSCC) established shared definitions for terms like hallucination, AI governance, and third-party AI risk — not mandates or bans.',
  },
  {
    id: 'gai-06',
    topic: 'gen-ai-fundamentals',
    stem: 'A community bank CEO asks whether AI can replace their compliance officer. The most accurate answer is:',
    options: [
      { label: 'Yes, AI can handle most compliance tasks more efficiently than a human', key: 'a' },
      { label: 'No, AI cannot assist with any compliance-related work', key: 'b' },
      { label: 'AI can assist with specific compliance tasks but cannot replace human judgment on regulatory interpretation and accountability', key: 'c' },
      { label: 'Only if the bank purchases an enterprise-grade compliance AI platform', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'AI excels at document review, pattern detection, and draft preparation. Regulatory interpretation, judgment calls, and accountability require human oversight.',
  },
  {
    id: 'gai-07',
    topic: 'gen-ai-fundamentals',
    stem: 'When an AI model is described as having a "knowledge cutoff date," this means:',
    options: [
      { label: 'The model will stop working after that date', key: 'a' },
      { label: 'The model was not trained on information published after that date and may not know about recent events', key: 'b' },
      { label: 'The model is less accurate for topics before that date', key: 'c' },
      { label: 'The model license expires on that date', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Training data has a cutoff. A model with a January 2025 cutoff does not know about regulations, events, or data published after that date unless it has retrieval capabilities.',
  },
  {
    id: 'gai-08',
    topic: 'gen-ai-fundamentals',
    stem: 'Which of the following is NOT a common capability of current generative AI tools?',
    options: [
      { label: 'Summarizing long documents into key points', key: 'a' },
      { label: 'Generating first drafts of professional correspondence', key: 'b' },
      { label: 'Independently making legally binding decisions on behalf of the institution', key: 'c' },
      { label: 'Analyzing patterns in structured data', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'AI tools assist with drafting, summarization, and analysis. They cannot and should not make legally binding decisions independently.',
  },

  // ── Prompting & RTFC Framework (8 questions) ──
  {
    id: 'rtfc-01',
    topic: 'prompting',
    stem: 'In the RTFC prompting framework, the "R" stands for:',
    options: [
      { label: 'Results — specifying the desired outcome', key: 'a' },
      { label: 'Role — telling the AI what role to assume when generating output', key: 'b' },
      { label: 'Review — asking the AI to check its own work', key: 'c' },
      { label: 'Relevance — filtering for only relevant information', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'RTFC: Role, Task, Format, Constraints. Role-setting establishes the perspective and expertise level the AI should adopt.',
  },
  {
    id: 'rtfc-02',
    topic: 'prompting',
    stem: 'A branch manager wants the AI to draft a professional email to a member about a rate change. Using RTFC, the best "Constraints" addition would be:',
    options: [
      { label: '"Make it sound nice"', key: 'a' },
      { label: '"Do not reference specific account numbers, balances, or member PII. Keep under 200 words. Use empathetic but professional tone."', key: 'b' },
      { label: '"Write it perfectly the first time"', key: 'c' },
      { label: '"Use the same format as last time"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Constraints should be specific, actionable, and include compliance-relevant guardrails (no PII). Vague instructions produce vague output.',
  },
  {
    id: 'rtfc-03',
    topic: 'prompting',
    stem: 'Which prompt is most likely to produce useful output for a community bank operations manager?',
    options: [
      { label: '"Help me with my work"', key: 'a' },
      { label: '"You are a community bank operations consultant. Create a checklist for onboarding a new teller, formatted as a numbered list. Include compliance training items required in the first 30 days. Do not include items specific to any core banking platform."', key: 'b' },
      { label: '"Write an onboarding checklist"', key: 'c' },
      { label: '"What should a new teller know?"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'This prompt uses all four RTFC elements: Role (operations consultant), Task (create checklist), Format (numbered list), Constraints (compliance items, no platform-specific content).',
  },
  {
    id: 'rtfc-04',
    topic: 'prompting',
    stem: 'The "Format" element in RTFC is important because:',
    options: [
      { label: 'AI models cannot produce output without a specified format', key: 'a' },
      { label: 'Specifying format (table, bullet list, email, memo) makes the output immediately usable without reformatting', key: 'b' },
      { label: 'It determines how fast the AI generates a response', key: 'c' },
      { label: 'It prevents the AI from hallucinating', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Format specification reduces post-generation editing time. An AI-generated table is immediately usable; an AI-generated paragraph often needs to be converted into one.',
  },
  {
    id: 'rtfc-05',
    topic: 'prompting',
    stem: 'A compliance officer asks an AI to summarize a 40-page regulatory guidance document. The most effective approach is:',
    options: [
      { label: 'Paste the entire document and ask "summarize this"', key: 'a' },
      { label: 'Break the document into sections, summarize each with specific RTFC prompts, then synthesize', key: 'b' },
      { label: 'Ask the AI if it has already read the document', key: 'c' },
      { label: 'Use the shortest possible prompt to save time', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Long documents benefit from sectional processing. Each section gets a focused prompt; the summaries are then synthesized. This produces more accurate and complete output.',
  },
  {
    id: 'rtfc-06',
    topic: 'prompting',
    stem: 'When an AI produces output that is partially correct but includes an inaccurate regulatory reference, the best next step is:',
    options: [
      { label: 'Ask the AI to fix its mistake — it will correct itself', key: 'a' },
      { label: 'Discard the entire output and start over', key: 'b' },
      { label: 'Manually correct the inaccurate reference and verify the rest against original sources', key: 'c' },
      { label: 'Use the output as-is since the AI is generally reliable', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'AI output should be treated as a first draft. Partial accuracy is common. The human verifies facts against authoritative sources; they do not ask the AI to verify itself.',
  },
  {
    id: 'rtfc-07',
    topic: 'prompting',
    stem: 'Which "Role" assignment would produce the most useful output for drafting a board presentation on AI readiness?',
    options: [
      { label: '"You are an AI"', key: 'a' },
      { label: '"You are a community bank strategic advisor preparing a board presentation for a $400M-asset institution considering its first AI investments"', key: 'b' },
      { label: '"You are a teacher"', key: 'c' },
      { label: '"You are an expert"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Specific roles produce specific output. The role should name the industry, the context, and the audience so the AI calibrates tone, depth, and vocabulary accordingly.',
  },
  {
    id: 'rtfc-08',
    topic: 'prompting',
    stem: 'A teller wants to use AI to help respond to a common member question about overdraft fees. The best "Task" specification is:',
    options: [
      { label: '"Explain overdraft fees"', key: 'a' },
      { label: '"Draft a 3-sentence explanation of how overdraft protection works at a community bank, written at a 10th-grade reading level, suitable for a face-to-face conversation"', key: 'b' },
      { label: '"Write everything about overdrafts"', key: 'c' },
      { label: '"Make the member happy about the fee"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'A good Task is specific about scope (3 sentences), context (community bank), reading level (10th grade), and delivery channel (face-to-face). This produces immediately usable output.',
  },

  // ── Safe Use in Regulated Institutions (8 questions) ──
  {
    id: 'safe-01',
    topic: 'safe-use',
    stem: 'Which of the following should NEVER be entered into a public large language model?',
    options: [
      { label: 'A request to draft a generic job posting for a teller position', key: 'a' },
      { label: 'A member\'s Social Security number, account balance, or loan application details', key: 'b' },
      { label: 'A question about general banking industry trends', key: 'c' },
      { label: 'A request to summarize a publicly available FDIC report', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'PII, account data, and non-public member information must never be entered into public AI tools. Generic, non-confidential requests are acceptable.',
  },
  {
    id: 'safe-02',
    topic: 'safe-use',
    stem: 'SR 11-7 is relevant to AI governance in community banks because:',
    options: [
      { label: 'It was written specifically for AI and machine learning in 2024', key: 'a' },
      { label: 'It establishes model risk management principles that apply to AI systems used for decision-making', key: 'b' },
      { label: 'It requires all banks to adopt AI within a specific timeline', key: 'c' },
      { label: 'It only applies to banks over $10 billion in assets', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'SR 11-7 (2011) predates modern AI but its model risk management framework — validation, ongoing monitoring, governance — applies directly to AI systems used in banking.',
  },
  {
    id: 'safe-03',
    topic: 'safe-use',
    stem: 'A staff member discovers that several colleagues have been using a free AI chatbot to draft member correspondence without management knowledge. The correct first response is:',
    options: [
      { label: 'Immediately terminate access to the internet for all staff', key: 'a' },
      { label: 'Inventory what data has been shared, assess risk, and develop a written AI use policy rather than simply banning the tools', key: 'b' },
      { label: 'Ignore it since the tools are free and probably harmless', key: 'c' },
      { label: 'Report the staff to their regulator immediately', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Shadow AI is common. The response is to assess what happened, quantify the risk, and create governance — not to panic or punish. Banning tools without a policy drives usage underground.',
  },
  {
    id: 'safe-04',
    topic: 'safe-use',
    stem: 'When evaluating a third-party AI vendor for your community bank, the MOST important initial question is:',
    options: [
      { label: '"How many banks use your product?"', key: 'a' },
      { label: '"Where is our data stored, who has access to it, and is it used to train your models?"', key: 'b' },
      { label: '"What is the monthly subscription cost?"', key: 'c' },
      { label: '"Can you provide a demo this week?"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Data residency, access controls, and training data policies are foundational vendor questions for regulated institutions. Cost and popularity are secondary to data governance.',
  },
  {
    id: 'safe-05',
    topic: 'safe-use',
    stem: 'An AI tool used for credit decisioning produces outcomes that disproportionately deny applications from a protected class. This is a violation of:',
    options: [
      { label: 'The Bank Secrecy Act', key: 'a' },
      { label: 'ECOA and Regulation B — fair lending requirements', key: 'b' },
      { label: 'The Gramm-Leach-Bliley Act', key: 'c' },
      { label: 'The Community Reinvestment Act only', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'ECOA/Reg B prohibits discrimination in credit decisions regardless of whether a human or an algorithm makes the decision. AI does not create a compliance exemption.',
  },
  {
    id: 'safe-06',
    topic: 'safe-use',
    stem: 'The term "explainability" in the context of AI governance refers to:',
    options: [
      { label: 'The ability to explain AI concepts to non-technical staff', key: 'a' },
      { label: 'The ability to understand and articulate how an AI system arrived at a specific output or decision', key: 'b' },
      { label: 'The vendor\'s obligation to explain their pricing model', key: 'c' },
      { label: 'The requirement to publish all AI code as open source', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Explainability (per the AIEOG AI Lexicon) means being able to trace and describe how an AI system produced its output — critical for audit, compliance, and member-facing decisions.',
  },
  {
    id: 'safe-07',
    topic: 'safe-use',
    stem: 'A community bank wants to use AI to automate BSA/AML transaction monitoring. Which governance consideration is MOST critical?',
    options: [
      { label: 'Ensuring the AI tool has an attractive user interface', key: 'a' },
      { label: 'Establishing human-in-the-loop review for all alerts and maintaining an audit trail of AI-assisted decisions', key: 'b' },
      { label: 'Choosing the least expensive vendor', key: 'c' },
      { label: 'Ensuring the AI can process transactions faster than a human', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'BSA/AML decisions carry regulatory and legal consequences. Human-in-the-loop oversight and complete audit trails are non-negotiable governance requirements.',
  },
  {
    id: 'safe-08',
    topic: 'safe-use',
    stem: 'Private cloud inference for AI workloads is recommended when:',
    options: [
      { label: 'The institution wants the fastest possible response time', key: 'a' },
      { label: 'The AI workload involves member PII, non-public examination data, or proprietary financial models', key: 'b' },
      { label: 'The institution has a large IT team that needs projects', key: 'c' },
      { label: 'Public cloud AI is temporarily unavailable', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Private inference is required when data sensitivity demands that information never leave the institution\'s controlled environment. Cost and speed are secondary to data protection.',
  },

  // ── Use Case Identification (8 questions) ──
  {
    id: 'uci-01',
    topic: 'use-case-identification',
    stem: 'When identifying the best first AI automation candidate, the most important criterion is:',
    options: [
      { label: 'The task that is most interesting to the IT department', key: 'a' },
      { label: 'A high-volume, repetitive task with measurable time cost and low regulatory complexity', key: 'b' },
      { label: 'The task most recently requested by the board of directors', key: 'c' },
      { label: 'Whatever the AI vendor recommends as their flagship use case', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The best first automation is high-frequency, measurable, and low-risk. This produces a fast, visible win that builds organizational confidence for more complex projects.',
  },
  {
    id: 'uci-02',
    topic: 'use-case-identification',
    stem: 'A teller spends 45 minutes each day manually formatting transaction reports. This task is a strong automation candidate because:',
    options: [
      { label: 'The teller is unhappy doing it', key: 'a' },
      { label: 'It is repetitive, time-measurable, rule-based, and does not involve subjective judgment', key: 'b' },
      { label: 'Report formatting is the most important task in banking', key: 'c' },
      { label: 'AI is always better at formatting than humans', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Strong automation candidates share four traits: repetitive, measurable time cost, rule-based logic, and minimal subjective judgment. Staff sentiment is relevant but secondary.',
  },
  {
    id: 'uci-03',
    topic: 'use-case-identification',
    stem: 'Which of the following is the WEAKEST first AI use case for a community bank?',
    options: [
      { label: 'Automating daily cash position report compilation', key: 'a' },
      { label: 'Using AI to autonomously approve or deny commercial loan applications', key: 'b' },
      { label: 'Drafting first versions of internal policy documents', key: 'c' },
      { label: 'Summarizing lengthy vendor contracts for executive review', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Autonomous credit decisioning is high-risk, high-regulatory-complexity, and requires extensive governance. It is the worst possible first AI project for a community bank.',
  },
  {
    id: 'uci-04',
    topic: 'use-case-identification',
    stem: 'The "time diary" method for identifying automation candidates involves:',
    options: [
      { label: 'Asking AI to analyze how staff spend their time', key: 'a' },
      { label: 'Having staff log their daily tasks and time spent for one to two weeks, then identifying repetitive patterns', key: 'b' },
      { label: 'Reviewing job descriptions to find redundant positions', key: 'c' },
      { label: 'Installing monitoring software on staff workstations', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The time diary is a low-tech, high-trust method. Staff self-report their daily tasks; patterns of repetitive work emerge naturally without surveillance.',
  },
  {
    id: 'uci-05',
    topic: 'use-case-identification',
    stem: 'A CFO wants to know the ROI of an AI automation project before it starts. The most honest response is:',
    options: [
      { label: '"AI always pays for itself within 90 days"', key: 'a' },
      { label: '"We can estimate ROI using current time costs and conservative automation rates, but the actual return will need to be measured post-implementation"', key: 'b' },
      { label: '"ROI cannot be estimated for AI projects"', key: 'c' },
      { label: '"The vendor guarantees a specific ROI number"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Pre-project ROI is an estimate based on measured time costs and conservative assumptions. Post-project measurement validates or adjusts the estimate. Guaranteed ROI claims should be questioned.',
  },
  {
    id: 'uci-06',
    topic: 'use-case-identification',
    stem: 'A community bank identifies five potential AI automation projects. The best way to prioritize them is:',
    options: [
      { label: 'Implement all five simultaneously', key: 'a' },
      { label: 'Rank by a combination of estimated time savings, implementation complexity, and regulatory risk — start with high-savings and low-risk', key: 'b' },
      { label: 'Let the youngest employee choose since they understand technology best', key: 'c' },
      { label: 'Start with whichever the CEO finds most interesting', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Structured prioritization considers value (time savings), feasibility (complexity), and risk (regulatory). Starting with high-value, low-risk projects builds momentum.',
  },
  {
    id: 'uci-07',
    topic: 'use-case-identification',
    stem: 'The difference between "AI-assisted" and "AI-autonomous" workflows is:',
    options: [
      { label: 'Cost — autonomous workflows are more expensive', key: 'a' },
      { label: 'AI-assisted keeps a human in the decision loop; AI-autonomous removes the human from the final decision', key: 'b' },
      { label: 'There is no meaningful difference', key: 'c' },
      { label: 'Autonomous means the AI can learn on its own without any data', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The distinction matters for governance. AI-assisted workflows preserve human-in-the-loop oversight. AI-autonomous workflows remove it — and require significantly more governance rigor.',
  },
  {
    id: 'uci-08',
    topic: 'use-case-identification',
    stem: 'A loan officer uses AI to draft a credit memo. The AI tool in this workflow is best described as:',
    options: [
      { label: 'A decision-maker', key: 'a' },
      { label: 'A drafting assistant that produces a first version for human review and judgment', key: 'b' },
      { label: 'A compliance officer', key: 'c' },
      { label: 'A replacement for the loan officer', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI as a drafting assistant is the appropriate framing. The loan officer retains judgment, accountability, and the final decision. The AI accelerates the drafting process.',
  },

  // ── Measurement & Accountability (8 questions) ──
  {
    id: 'meas-01',
    topic: 'measurement',
    stem: 'The most meaningful metric for a community bank to track after implementing an AI automation is:',
    options: [
      { label: 'How many times the AI tool was used', key: 'a' },
      { label: 'Staff hours recaptured per week, measured against the pre-automation baseline', key: 'b' },
      { label: 'Whether staff report feeling positive about AI', key: 'c' },
      { label: 'The number of AI tools the bank has purchased', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Hours recaptured is a concrete, dollar-convertible metric. Usage counts and sentiment are secondary indicators. Tool count is meaningless without outcome data.',
  },
  {
    id: 'meas-02',
    topic: 'measurement',
    stem: 'A Quick Win Sprint delivers three automations. The "What We Didn\'t Do" page in the final report exists because:',
    options: [
      { label: 'It fills space in the report', key: 'a' },
      { label: 'It documents the opportunities identified but not yet implemented — creating the pipeline for the next engagement', key: 'b' },
      { label: 'It lists excuses for work not completed', key: 'c' },
      { label: 'Regulators require documentation of rejected AI ideas', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The "What We Didn\'t Do" page is a pipeline-building tool. It shows the CEO that the sprint uncovered more value than one engagement could capture — seeding the next conversation.',
  },
  {
    id: 'meas-03',
    topic: 'measurement',
    stem: 'An operations manager reports that AI automation "saved a lot of time." Why is this insufficient?',
    options: [
      { label: 'It uses informal language', key: 'a' },
      { label: 'It lacks specificity — no baseline, no measurement period, no dollar value, no comparison to pre-automation state', key: 'b' },
      { label: 'Time savings are not relevant to banking', key: 'c' },
      { label: 'Only the CFO is allowed to report on time savings', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Unmeasured claims cannot justify continued investment. Effective reporting includes: baseline hours, post-automation hours, measurement period, and dollar-equivalent savings.',
  },
  {
    id: 'meas-04',
    topic: 'measurement',
    stem: 'The efficiency ratio measures:',
    options: [
      { label: 'How quickly the bank processes loan applications', key: 'a' },
      { label: 'Non-interest expense divided by revenue — how many cents the bank spends to earn one dollar', key: 'b' },
      { label: 'The ratio of AI tools to human employees', key: 'c' },
      { label: 'Customer satisfaction scores', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The efficiency ratio (NIE / revenue) is the primary operational benchmark. Community bank median is ~65% (FDIC). AI automation can improve it by reducing the numerator (non-interest expense).',
  },
  {
    id: 'meas-05',
    topic: 'measurement',
    stem: 'When presenting AI outcomes to a board of directors, the most effective format is:',
    options: [
      { label: 'A detailed technical description of how the AI model works', key: 'a' },
      { label: 'A one-page scorecard: hours saved, dollars saved, processes automated, and efficiency ratio impact', key: 'b' },
      { label: 'A comparison of AI vendors the bank could have chosen', key: 'c' },
      { label: 'Testimonials from staff about how much they enjoy using AI', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Boards want outcomes in business terms, not technical details. A one-page scorecard with quantified results speaks the language directors understand.',
  },
  {
    id: 'meas-06',
    topic: 'measurement',
    stem: 'A teller uses AI to draft member emails and estimates she saves 30 minutes per day. To make this reportable, she should:',
    options: [
      { label: 'Tell her manager in passing', key: 'a' },
      { label: 'Log the time saved daily for two weeks, note the specific task, and calculate the monthly dollar equivalent using her hourly rate', key: 'b' },
      { label: 'Ask the AI to calculate how much time it saved her', key: 'c' },
      { label: 'Wait until someone asks her about it', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Self-reported time logs over a consistent period, tied to specific tasks, are the foundation of bottom-up ROI measurement. Casual estimates are not reportable.',
  },
  {
    id: 'meas-07',
    topic: 'measurement',
    stem: 'The 90-day ROI guarantee on a Quick Win Sprint means:',
    options: [
      { label: 'The bank is guaranteed a specific dollar return within 90 days', key: 'a' },
      { label: 'If the three implemented automations do not deliver measured time savings within a quarter, the engagement fee is refunded', key: 'b' },
      { label: 'The bank can return the AI tools within 90 days', key: 'c' },
      { label: 'All staff will be trained within 90 days', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The guarantee is specific: measured time savings from the three automations within one quarter. If the savings are not measurable, the engagement fee is returned.',
  },
  {
    id: 'meas-08',
    topic: 'measurement',
    stem: 'Only three of the top 50 global banks can currently report both present and projected ROI across their AI use cases. This means:',
    options: [
      { label: 'AI measurement is impossible', key: 'a' },
      { label: 'Community banks that measure from day one will have a measurement discipline that most large banks still lack', key: 'b' },
      { label: 'ROI reporting is not important for community banks', key: 'c' },
      { label: 'Community banks should wait until large banks figure out measurement first', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Per the Evident AI Index (October 2025), only BNP Paribas, DBS, and JPMC can report full ROI. Community banks that measure from day one leapfrog peers on accountability.',
  },
] as const;
