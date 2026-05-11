// AiBI-Foundation Foundation Proficiency Assessment — Question Bank
// 40 questions across 5 topics. Each attempt draws 12 randomly.
// EVERY question is rooted in a specific community banking scenario.

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
    stem: 'Your compliance officer uses an AI tool to draft a response to a CRA inquiry. The draft confidently cites "Section 228.42 of Regulation BB" — a section that does not exist. What happened?',
    options: [
      { label: 'The AI accessed an outdated version of Regulation BB', key: 'a' },
      { label: 'The AI hallucinated a plausible-sounding but fabricated regulatory citation', key: 'b' },
      { label: 'Someone edited the AI\'s training data to include incorrect citations', key: 'c' },
      { label: 'The AI is broken and should be replaced with a different vendor', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs generate statistically plausible text, not verified facts. Fabricating regulatory citations that sound correct but do not exist is a textbook hallucination — particularly dangerous in compliance contexts.',
  },
  {
    id: 'gai-02',
    topic: 'gen-ai-fundamentals',
    stem: 'A branch manager asks you whether the bank\'s AI assistant "understands" lending regulations. The most accurate way to explain how LLMs work is:',
    options: [
      { label: 'The AI has been trained on lending regulations and understands them the way a loan officer does', key: 'a' },
      { label: 'The AI predicts statistically likely text based on patterns — it produces convincing regulatory language without understanding what the regulations require', key: 'b' },
      { label: 'The AI searches a regulatory database and returns the correct answer', key: 'c' },
      { label: 'The AI cannot process regulatory content at all', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs are pattern-matching prediction engines. They produce fluent regulatory language without comprehending legal obligations. Every regulatory statement must be verified by a human.',
  },
  {
    id: 'gai-03',
    topic: 'gen-ai-fundamentals',
    stem: 'Your CEO reads a news article about a large bank deploying AI for automated loan decisioning. She asks whether your $350M community bank should do the same. The best response is:',
    options: [
      { label: 'Yes — if JPMorgan is doing it, we should too', key: 'a' },
      { label: 'No — AI is only for banks over $1 billion in assets', key: 'b' },
      { label: 'Automated loan decisioning is a high-complexity use case with significant regulatory risk — community banks get more value starting with staff productivity tools and working toward decisioning over time', key: 'c' },
      { label: 'We should hire an AI engineer to evaluate whether it is possible', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'Autonomous credit decisioning requires robust model governance, fair lending testing, and audit infrastructure. Community banks create more value starting with low-risk productivity use cases that build organizational comfort.',
  },
  {
    id: 'gai-04',
    topic: 'gen-ai-fundamentals',
    stem: 'A teller uses ChatGPT to help a member calculate how much they would save by refinancing their mortgage. The teller shares the AI\'s answer with the member. What is the primary risk?',
    options: [
      { label: 'ChatGPT might round the numbers incorrectly', key: 'a' },
      { label: 'The AI may produce a plausible but mathematically incorrect calculation, and the teller shared it as advice without verifying the math against actual loan terms', key: 'b' },
      { label: 'Using ChatGPT is always prohibited during member interactions', key: 'c' },
      { label: 'The member might prefer to use their own AI tool instead', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Sharing unverified AI-generated financial calculations with a member creates regulatory and reputational risk. AI output is a draft — it must be verified before being presented as guidance.',
  },
  {
    id: 'gai-05',
    topic: 'gen-ai-fundamentals',
    stem: 'Your loan operations team wants to use AI to pre-fill commercial loan applications from uploaded financial statements. Which AI capability makes this possible?',
    options: [
      { label: 'Automated credit scoring', key: 'a' },
      { label: 'Document extraction and structured data parsing from unstructured text or PDFs', key: 'b' },
      { label: 'Real-time internet search', key: 'c' },
      { label: 'Customer relationship management', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-powered document extraction reads financial statements (tax returns, P&Ls, balance sheets) and pulls structured data into application fields — eliminating manual data entry while requiring human verification.',
  },
  {
    id: 'gai-06',
    topic: 'gen-ai-fundamentals',
    stem: 'An examiner asks your BSA officer how the bank ensures AI-generated suspicious activity narratives are accurate. The correct answer is:',
    options: [
      { label: 'We trust the AI because it was trained on SAR filing data', key: 'a' },
      { label: 'Every AI-generated narrative is reviewed and approved by a certified BSA analyst before filing, with the analyst\'s name documented as the responsible party', key: 'b' },
      { label: 'We do not use AI for anything related to BSA', key: 'c' },
      { label: 'The AI vendor guarantees the accuracy of all generated narratives', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI can draft SAR narratives to save time, but a human BSA professional must review, verify, and take accountability for every filed report. The audit trail must name the human, not the tool.',
  },
  {
    id: 'gai-07',
    topic: 'gen-ai-fundamentals',
    stem: 'Your bank\'s AI tool was set up in January 2025. A board member asks it about the AIEOG AI Lexicon published in February 2026. The AI responds with a detailed but completely fabricated description. Why?',
    options: [
      { label: 'The AIEOG AI Lexicon is classified and the AI is not authorized to discuss it', key: 'a' },
      { label: 'The tool\'s training data has a knowledge cutoff before February 2026 — it does not know the Lexicon exists, so it generated a plausible fiction', key: 'b' },
      { label: 'The board member asked the question incorrectly', key: 'c' },
      { label: 'The AI deliberately avoided sharing regulatory information', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI models have a training data cutoff date. When asked about events after that date, they do not say "I don\'t know" — they generate plausible-sounding but fabricated content.',
  },
  {
    id: 'gai-08',
    topic: 'gen-ai-fundamentals',
    stem: 'Your deposit operations team asks whether AI can fully replace the person who manually reconciles daily GL entries. The honest answer is:',
    options: [
      { label: 'Yes, AI can handle all reconciliation independently', key: 'a' },
      { label: 'AI can flag mismatches, draft exception notes, and pre-sort entries — but a human must review exceptions, verify balances, and approve the final reconciliation', key: 'b' },
      { label: 'AI cannot work with financial data', key: 'c' },
      { label: 'Only if the bank purchases a $500K reconciliation platform', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI accelerates reconciliation by handling pattern matching and exception flagging. Final verification and approval remain human responsibilities, especially when general ledger accuracy is at stake.',
  },

  // ── Prompting & RTFC Framework (8 questions) ──
  {
    id: 'rtfc-01',
    topic: 'prompting',
    stem: 'A loan officer needs to draft an adverse action notice for a denied small business loan. Using the RTFC framework, which prompt would produce the most compliant first draft?',
    options: [
      { label: '"Write a denial letter"', key: 'a' },
      { label: '"You are a community bank compliance specialist. Draft an adverse action notice for a denied SBA loan application. Format as a formal letter. Include the specific reasons for denial as bullet points. Do not reference any applicant PII — use placeholder brackets. Ensure language aligns with ECOA and Regulation B requirements."', key: 'b' },
      { label: '"Help me deny this loan application and make the customer feel okay about it"', key: 'c' },
      { label: '"Write a Reg B compliant letter"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'This prompt uses all four RTFC elements — Role (compliance specialist), Task (draft adverse action notice), Format (formal letter with bullet reasons), Constraints (no PII, ECOA/Reg B alignment).',
  },
  {
    id: 'rtfc-02',
    topic: 'prompting',
    stem: 'Your teller supervisor needs to create a training guide for new hires on how to handle cash discrepancies at the window. Which "Role" assignment produces the most useful output?',
    options: [
      { label: '"You are an AI assistant"', key: 'a' },
      { label: '"You are a community bank branch operations trainer with 15 years of experience training tellers at institutions under $500M in assets"', key: 'b' },
      { label: '"You are a banking expert"', key: 'c' },
      { label: '"You are a teacher"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Specific roles produce specific output. Naming the industry, asset size, audience, and experience level causes the AI to calibrate tone, vocabulary, and detail level for the exact use case.',
  },
  {
    id: 'rtfc-03',
    topic: 'prompting',
    stem: 'Your CFO asks AI to summarize the bank\'s 120-page strategic plan for a board presentation. The AI produces a summary that misses three critical initiatives. The most likely cause is:',
    options: [
      { label: 'The AI is not intelligent enough to read a strategic plan', key: 'a' },
      { label: 'The document was too long for a single prompt — it should have been broken into sections with separate RTFC prompts per section, then synthesized', key: 'b' },
      { label: 'Strategic plans cannot be summarized by AI', key: 'c' },
      { label: 'The CFO should have used a more expensive AI model', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Long documents should be processed in sections. A single prompt for 120 pages forces the AI to compress excessively. Section-by-section summarization with synthesis produces more complete and accurate output.',
  },
  {
    id: 'rtfc-04',
    topic: 'prompting',
    stem: 'A member services representative wants AI to help draft a response to a complaint about unexpected overdraft fees. The best "Constraints" to add to the RTFC prompt are:',
    options: [
      { label: '"Make it sound empathetic"', key: 'a' },
      { label: '"Do not reference the member\'s specific account number, balance, or transaction history. Keep under 150 words. Acknowledge the member\'s frustration without admitting fault or waiving the fee. Direct the member to speak with a branch manager for account-specific resolution."', key: 'b' },
      { label: '"Fix the problem"', key: 'c' },
      { label: '"Write it perfectly"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Effective constraints are specific: no PII, word limit, tone guidance, liability guardrails, and a clear escalation path. Vague constraints ("make it sound nice") produce vague output.',
  },
  {
    id: 'rtfc-05',
    topic: 'prompting',
    stem: 'Your commercial lender asks AI to analyze a borrower\'s three years of tax returns and produce a summary. The AI-generated summary looks thorough but lists the wrong revenue figures. What went wrong?',
    options: [
      { label: 'The AI cannot read tax returns', key: 'a' },
      { label: 'The lender should have specified the "Format" element in their prompt more clearly', key: 'b' },
      { label: 'The AI likely extracted data incorrectly from the documents — AI-generated financial figures must always be verified against the original source documents before use', key: 'c' },
      { label: 'The tax returns were probably filled out incorrectly', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'AI document extraction is imperfect, especially with scanned documents and complex tax forms. Every financial figure in AI-generated output must be verified against the original. This is not optional.',
  },
  {
    id: 'rtfc-06',
    topic: 'prompting',
    stem: 'A compliance officer drafts a vendor management policy update using AI. The first draft is generic and reads like it could apply to any industry. The best fix using RTFC is to strengthen the:',
    options: [
      { label: 'Format — change it from paragraphs to bullet points', key: 'a' },
      { label: 'Role and Constraints — specify "community bank with $400M in assets, FDIC-supervised, subject to Interagency TPRM Guidance" so the AI generates institution-specific language', key: 'b' },
      { label: 'Task — ask the AI to try harder', key: 'c' },
      { label: 'Nothing — vendor management policies should be generic', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Generic output comes from generic prompts. Adding institutional context (asset size, charter type, supervisory agency, applicable guidance) forces the AI to produce specific, relevant content.',
  },
  {
    id: 'rtfc-07',
    topic: 'prompting',
    stem: 'A branch manager asks AI to create a script for calling delinquent borrowers. The AI produces a script that could violate FDCPA guidelines. The correct response is to:',
    options: [
      { label: 'Use the script anyway since AI is generally accurate', key: 'a' },
      { label: 'Add FDCPA compliance as a Constraint in the prompt, regenerate, and then have compliance review the output before any staff member uses it', key: 'b' },
      { label: 'Stop using AI for any member-facing communications', key: 'c' },
      { label: 'Ask the AI to check whether its own script violates FDCPA', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The fix is better constraints plus human review — not abandoning the tool. AI drafts; compliance validates. Asking the AI to self-check is unreliable.',
  },
  {
    id: 'rtfc-08',
    topic: 'prompting',
    stem: 'Your BSA officer needs AI to draft narratives for 15 currency transaction reports from yesterday. The most efficient RTFC approach is:',
    options: [
      { label: 'Paste all 15 transactions into one prompt and ask for all narratives at once', key: 'a' },
      { label: 'Create one well-crafted RTFC template for CTR narratives, then apply it to each transaction individually — verifying each output against the source transaction before filing', key: 'b' },
      { label: 'Ask the AI to file the CTRs directly with FinCEN', key: 'c' },
      { label: 'Skip the AI and write all 15 manually to avoid risk', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'A reusable RTFC template for CTR narratives saves time across many transactions while maintaining accuracy through individual verification. Batch processing 15 at once risks cross-contamination of transaction details.',
  },

  // ── Safe Use in Regulated Institutions (8 questions) ──
  {
    id: 'safe-01',
    topic: 'safe-use',
    stem: 'A teller pastes a member\'s name, account number, and last three transactions into ChatGPT to help draft a letter explaining a hold on their account. What is the immediate concern?',
    options: [
      { label: 'ChatGPT might draft the letter incorrectly', key: 'a' },
      { label: 'Member PII has been shared with a third-party AI service that may retain and use the data for model training — a potential GLBA and privacy violation', key: 'b' },
      { label: 'The teller should have used a different prompt format', key: 'c' },
      { label: 'The hold will be removed automatically once the AI generates the letter', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Sharing member PII with a public AI tool is a potential GLBA violation. The data may be retained, stored outside the bank\'s control, and used to train future models. This is a governance incident, not just a tool-use question.',
  },
  {
    id: 'safe-02',
    topic: 'safe-use',
    stem: 'Your board wants to adopt an AI-powered lending analytics tool from a fintech vendor. Before proceeding, the most critical question to ask the vendor is:',
    options: [
      { label: '"How many other banks use your product?"', key: 'a' },
      { label: '"Where is our member data stored, who has access, is it used to train your models, and how does your tool handle fair lending testing under ECOA and Regulation B?"', key: 'b' },
      { label: '"Can you provide a free trial?"', key: 'c' },
      { label: '"What does the dashboard look like?"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Data residency, access controls, model training policies, and fair lending compliance are threshold questions for any AI vendor serving a regulated institution. Popularity and aesthetics are secondary.',
  },
  {
    id: 'safe-03',
    topic: 'safe-use',
    stem: 'Your IT manager discovers that 8 of 12 loan officers have been using a free AI writing tool for member correspondence — without management knowledge or approval. This is called:',
    options: [
      { label: 'Innovation', key: 'a' },
      { label: 'Shadow AI — unauthorized use of AI tools that creates unquantified data exposure and compliance risk', key: 'b' },
      { label: 'A training gap that only requires a reminder email', key: 'c' },
      { label: 'Normal behavior that does not require a response', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Shadow AI is widespread in banking. The response is to inventory what data has been shared, assess the risk, and create governance — not to punish staff or ignore the problem.',
  },
  {
    id: 'safe-04',
    topic: 'safe-use',
    stem: 'An AI tool used to pre-screen mortgage applications is found to deny applications from a specific zip code at a rate 3x higher than surrounding areas. This raises concerns under:',
    options: [
      { label: 'The Bank Secrecy Act', key: 'a' },
      { label: 'The Equal Credit Opportunity Act and Fair Housing Act — potential disparate impact discrimination through proxy variables', key: 'b' },
      { label: 'The Truth in Lending Act', key: 'c' },
      { label: 'No regulation, because the AI is making objective decisions', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Geographic patterns can be proxies for race or ethnicity. ECOA and the Fair Housing Act prohibit disparate impact in credit decisions regardless of whether a human or algorithm made the decision. AI does not create a compliance exemption.',
  },
  {
    id: 'safe-05',
    topic: 'safe-use',
    stem: 'An examiner asks your bank to explain how you govern your use of AI tools. You currently have no written AI use policy. The best immediate response is:',
    options: [
      { label: 'Tell the examiner the bank does not use AI', key: 'a' },
      { label: 'Acknowledge the gap, describe the specific AI tools currently in use, explain your plans for a formal policy aligned with SR 11-7 and the AIEOG AI Lexicon, and provide a timeline for completion', key: 'b' },
      { label: 'Promise to stop using all AI tools immediately', key: 'c' },
      { label: 'Blame the IT department for not creating a policy sooner', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Transparency is the correct posture. Examiners expect to see awareness, inventory, and a plan — not perfection. Denying AI use when staff are clearly using it creates a credibility problem.',
  },
  {
    id: 'safe-06',
    topic: 'safe-use',
    stem: 'Your bank is evaluating whether to process certain AI workloads on a private cloud instead of using a public AI service. The deciding factor should be:',
    options: [
      { label: 'Cost — private cloud is always more expensive', key: 'a' },
      { label: 'Whether the data involved includes member PII, non-public examination findings, proprietary models, or information that must not leave the bank\'s controlled environment', key: 'b' },
      { label: 'Whether the bank has an IT team large enough to manage private infrastructure', key: 'c' },
      { label: 'Which option the AI vendor recommends', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Data sensitivity determines infrastructure. Public AI services are acceptable for non-sensitive tasks. Private inference is required when data must remain within the institution\'s governance perimeter.',
  },
  {
    id: 'safe-07',
    topic: 'safe-use',
    stem: 'A vendor pitches your bank an AI tool for automated check fraud detection. They claim the tool "makes decisions in real-time with no human intervention needed." Your response should be:',
    options: [
      { label: 'Sign the contract — real-time fraud detection is critical', key: 'a' },
      { label: 'Ask how the tool handles false positives, what the escalation path is for flagged items, whether human review is built into the workflow, and what audit trail the tool produces', key: 'b' },
      { label: 'Reject the tool because AI should never be used for fraud detection', key: 'c' },
      { label: 'Ask for a lower price', key: 'd' },
    ],
    correctKey: 'b',
    explanation: '"No human intervention needed" is a red flag for regulated institutions. AI-assisted fraud detection needs false-positive handling, human escalation paths, and auditable decision trails.',
  },
  {
    id: 'safe-08',
    topic: 'safe-use',
    stem: 'Your compliance officer wants to use AI to help prepare for the upcoming FDIC safety and soundness exam. Which use is appropriate?',
    options: [
      { label: 'Upload the previous exam report to a public AI tool and ask it to predict what examiners will focus on', key: 'a' },
      { label: 'Use a private, institution-controlled AI tool to organize internal preparation materials, draft responses to anticipated questions, and compile supporting documentation — without uploading non-public examination data to external services', key: 'b' },
      { label: 'Ask AI to contact the FDIC on behalf of the bank', key: 'c' },
      { label: 'Have AI generate fake supporting documents to present to examiners', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI can assist with exam preparation on private infrastructure. Non-public examination data (prior exam reports, MRAs, MOUs) must never be uploaded to public AI services.',
  },

  // ── Use Case Identification (8 questions) ──
  {
    id: 'uci-01',
    topic: 'use-case-identification',
    stem: 'Your operations manager wants to identify the best first AI automation project. She asks each department to log their daily tasks for two weeks. This method is called:',
    options: [
      { label: 'A technology audit', key: 'a' },
      { label: 'A time diary — a low-tech, high-trust method that surfaces repetitive workflows by having staff self-report daily tasks and time spent', key: 'b' },
      { label: 'A job description review', key: 'c' },
      { label: 'A vendor evaluation', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The time diary reveals where labor hours actually go — not where management thinks they go. Repetitive, time-consuming patterns emerge naturally without surveillance or assumptions.',
  },
  {
    id: 'uci-02',
    topic: 'use-case-identification',
    stem: 'After the time diary, three candidates emerge: (A) automating daily GL reconciliation formatting, (B) using AI to approve or deny consumer loans, and (C) AI-generated board meeting minutes. The best first project is:',
    options: [
      { label: 'B — loan decisioning has the highest potential ROI', key: 'a' },
      { label: 'A — GL reconciliation formatting is repetitive, measurable, rule-based, and carries minimal regulatory risk', key: 'b' },
      { label: 'C — board minutes are the most visible to leadership', key: 'c' },
      { label: 'All three simultaneously to maximize impact', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The best first project is high-frequency, measurable, rule-based, and low-risk. GL reconciliation formatting fits all four criteria. Loan decisioning is high-risk. Board minutes are low-frequency.',
  },
  {
    id: 'uci-03',
    topic: 'use-case-identification',
    stem: 'A teller spends 40 minutes every morning compiling a branch cash position report from three different systems. This task is a strong automation candidate because:',
    options: [
      { label: 'The teller dislikes doing it', key: 'a' },
      { label: 'It happens daily, takes a measurable amount of time, follows the same steps every time, and requires data extraction rather than subjective judgment', key: 'b' },
      { label: 'Cash position reports are the most important task in banking', key: 'c' },
      { label: 'AI is always faster at reading data from multiple systems', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Strong automation candidates are: daily (high frequency), time-measurable (40 min), rule-based (same steps), and low-judgment (data extraction). Staff sentiment is relevant but not the deciding criterion.',
  },
  {
    id: 'uci-04',
    topic: 'use-case-identification',
    stem: 'Your loan department identifies 5 potential automation projects. The best way to prioritize them is:',
    options: [
      { label: 'Let the most senior loan officer choose their favorite', key: 'a' },
      { label: 'Rank by combining estimated hours saved per week, implementation difficulty, and regulatory sensitivity — start with the highest-savings and lowest-risk project', key: 'b' },
      { label: 'Start with whichever project the AI vendor recommends', key: 'c' },
      { label: 'Implement all five simultaneously', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Structured prioritization balances value (time savings), feasibility (difficulty), and risk (regulatory sensitivity). Starting with high-value, low-risk projects builds organizational confidence.',
  },
  {
    id: 'uci-05',
    topic: 'use-case-identification',
    stem: 'Your retail banking manager wants AI to automatically send personalized product offers to members based on their transaction history. Before approving, you should consider:',
    options: [
      { label: 'Only whether the AI can technically do it', key: 'a' },
      { label: 'Whether automated product recommendations based on transaction data create UDAP concerns, whether members have consented to this use of their data, and whether the recommendations could result in unsuitable product placements', key: 'b' },
      { label: 'Whether the marketing department has budget for it', key: 'c' },
      { label: 'Whether competitors are already doing it', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Automated product recommendations using transaction data raise UDAP (unfair, deceptive, or abusive acts or practices) questions, consent issues, and suitability concerns. Technical capability is not the only filter.',
  },
  {
    id: 'uci-06',
    topic: 'use-case-identification',
    stem: 'A commercial loan officer uses AI to draft credit memos. In this workflow, the AI is best described as:',
    options: [
      { label: 'The decision-maker', key: 'a' },
      { label: 'A drafting assistant that produces a first version for the loan officer to review, verify, and take responsibility for', key: 'b' },
      { label: 'A replacement for the credit analyst', key: 'c' },
      { label: 'A co-signer on the credit decision', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-as-drafting-assistant is the correct framing for community banks. The loan officer retains judgment, accountability, and the final decision. The AI accelerates the drafting, not the deciding.',
  },
  {
    id: 'uci-07',
    topic: 'use-case-identification',
    stem: 'Your HR manager wants to use AI to screen job applications for open teller positions. The most important governance consideration is:',
    options: [
      { label: 'Whether the AI can read resumes in PDF format', key: 'a' },
      { label: 'Whether the AI screening criteria could introduce bias against protected classes in violation of employment discrimination laws', key: 'b' },
      { label: 'Whether the AI can complete the screening faster than a human', key: 'c' },
      { label: 'Whether the applicants will know AI is being used', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI resume screening can perpetuate or amplify hiring bias. The primary governance concern is whether the tool could violate Title VII or other employment discrimination laws through disparate impact.',
  },
  {
    id: 'uci-08',
    topic: 'use-case-identification',
    stem: 'Your wealth management team wants AI to generate client portfolio summaries. The line between "AI-assisted" and "AI-autonomous" in this context is:',
    options: [
      { label: 'Whether the AI uses cloud or on-premise infrastructure', key: 'a' },
      { label: 'Whether a human advisor reviews and approves the summary before it reaches the client, or whether the AI sends it directly without human review', key: 'b' },
      { label: 'Whether the client requested the summary or not', key: 'c' },
      { label: 'How expensive the AI tool is', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-assisted preserves human-in-the-loop: the advisor reviews before delivery. AI-autonomous removes that step. For client-facing financial communications, human review is a governance requirement.',
  },

  // ── Measurement & Accountability (8 questions) ──
  {
    id: 'meas-01',
    topic: 'measurement',
    stem: 'Your operations team automated the daily wire transfer reconciliation using AI. To report the results to the board, the most meaningful metric is:',
    options: [
      { label: 'The number of times staff used the AI tool this month', key: 'a' },
      { label: 'Staff hours recaptured per week compared to the pre-automation baseline, converted to an annualized dollar equivalent', key: 'b' },
      { label: 'A survey showing staff enjoy using the tool', key: 'c' },
      { label: 'The number of AI tools the bank has purchased', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Boards want outcomes in business terms. Hours recaptured, baselined against pre-automation state, and converted to dollars — that is the metric that justifies continued investment.',
  },
  {
    id: 'meas-02',
    topic: 'measurement',
    stem: 'A teller reports she saves "about 30 minutes a day" using AI for member correspondence. To make this claim reportable to management, she should:',
    options: [
      { label: 'Mention it to her supervisor in the break room', key: 'a' },
      { label: 'Log the specific tasks where AI saved time for two weeks, note pre-AI vs. post-AI time per task, and calculate a monthly dollar equivalent using her loaded hourly rate', key: 'b' },
      { label: 'Ask the AI tool to calculate how much time it saved', key: 'c' },
      { label: 'Estimate the total for the year and put it in her annual review', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Self-reported time logs over a consistent period, tied to specific tasks with before/after comparisons, are the foundation of bottom-up ROI measurement. Casual estimates are not evidence.',
  },
  {
    id: 'meas-03',
    topic: 'measurement',
    stem: 'Your bank completed an AI Quick Win Sprint that automated three processes. The final report includes a "What We Didn\'t Do" page. This page exists because:',
    options: [
      { label: 'It documents what the consultants failed to deliver', key: 'a' },
      { label: 'It lists the automation opportunities identified during the sprint that were not implemented yet — creating a documented pipeline for the next engagement or internal initiative', key: 'b' },
      { label: 'Regulators require it', key: 'c' },
      { label: 'It fills space to make the report look longer', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The "What We Didn\'t Do" page shows leadership that the sprint uncovered more value than one engagement could capture. It seeds the next conversation and creates an internal automation backlog.',
  },
  {
    id: 'meas-04',
    topic: 'measurement',
    stem: 'Your CFO asks what the bank\'s efficiency ratio is and why it matters for AI investments. The correct explanation is:',
    options: [
      { label: 'The efficiency ratio measures customer satisfaction divided by branch count', key: 'a' },
      { label: 'The efficiency ratio is non-interest expense divided by revenue — it measures how many cents the bank spends to earn one dollar, and AI automation can improve it by reducing the numerator', key: 'b' },
      { label: 'The efficiency ratio measures how fast loans are processed', key: 'c' },
      { label: 'The efficiency ratio is not relevant to AI investments', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The efficiency ratio (NIE/revenue) is the primary operational benchmark. Community bank median is ~65% (FDIC). AI reduces non-interest expense by automating labor — moving the numerator.',
  },
  {
    id: 'meas-05',
    topic: 'measurement',
    stem: 'When presenting AI project outcomes to the board of directors, the most effective format is:',
    options: [
      { label: 'A detailed explanation of how the AI technology works', key: 'a' },
      { label: 'A one-page scorecard showing: hours saved, dollars saved, processes automated, and before-after comparison with the pre-automation baseline', key: 'b' },
      { label: 'A comparison of AI vendors the bank could have chosen instead', key: 'c' },
      { label: 'A list of all the prompts staff used during the quarter', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Boards speak in business outcomes, not technology. A one-page scorecard with quantified results, baselined against the prior state, is the format that sustains investment and builds confidence.',
  },
  {
    id: 'meas-06',
    topic: 'measurement',
    stem: 'Only 3 of the top 50 global banks can currently report both present and projected ROI across their full AI portfolio. For a community bank, this means:',
    options: [
      { label: 'ROI measurement is impossible for smaller institutions', key: 'a' },
      { label: 'A community bank that measures AI outcomes from day one will have a measurement discipline that most institutions, including large banks, still lack', key: 'b' },
      { label: 'Community banks should not attempt AI until large banks figure out measurement', key: 'c' },
      { label: 'The 3 large banks should be hired to teach community banks how to measure', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Per the Evident AI Index (October 2025), only BNP Paribas, DBS, and JPMC report full ROI. Community banks that measure from day one leapfrog peers on accountability — including most large banks.',
  },
  {
    id: 'meas-07',
    topic: 'measurement',
    stem: 'Your bank automated the preparation of monthly call reports using AI, reducing preparation time from 12 hours to 3 hours. The annualized NIE reduction, assuming a loaded cost of $45/hour, is approximately:',
    options: [
      { label: '$4,860', key: 'a' },
      { label: '$540', key: 'b' },
      { label: '$48,600', key: 'c' },
      { label: '$2,160', key: 'd' },
    ],
    correctKey: 'a',
    explanation: '9 hours saved per month × $45/hour × 12 months = $4,860 annualized. This is a concrete, reportable figure that ties one automation to a specific dollar outcome.',
  },
  {
    id: 'meas-08',
    topic: 'measurement',
    stem: 'Your bank has completed three separate AI automation projects this year. The CEO asks whether the total investment was worth it. The most rigorous way to answer is:',
    options: [
      { label: '"Staff seem happier and more productive"', key: 'a' },
      { label: 'Compile the measured hours saved and dollar equivalents from all three projects, compare the total against the cost of implementation, and present the aggregate ROI with a 12-month projection', key: 'b' },
      { label: '"Other banks are spending more on AI than we are"', key: 'c' },
      { label: '"AI is an investment in the future that cannot be measured in traditional terms"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI investments should be measured like any other operational investment: outcomes vs. cost, with projection. "It cannot be measured" is not an answer a CFO or board should accept.',
  },
] as const;
