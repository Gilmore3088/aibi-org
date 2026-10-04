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
  'prompting': 'Prompting with CORE',
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
      { label: 'The AI pulled the citation from a superseded version of Regulation BB that it found online', key: 'a' },
      { label: 'The AI hallucinated a plausible-sounding but fabricated regulatory citation', key: 'b' },
      { label: 'The AI confused Regulation BB with the Community Reinvestment Act statute and renumbered the section to match', key: 'c' },
      { label: 'The officer\'s prompt was too short, so the AI filled the gap with a real section number it had mislabeled', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs generate statistically plausible text, not verified facts. Fabricating regulatory citations that sound correct but do not exist is a textbook hallucination — particularly dangerous in compliance contexts.',
  },
  {
    id: 'gai-02',
    topic: 'gen-ai-fundamentals',
    stem: 'A branch manager asks you whether the bank\'s AI assistant "understands" lending regulations. The most accurate way to explain how LLMs work is:',
    options: [
      { label: 'The AI was trained on the full text of lending regulations, so it understands them the way an experienced loan officer does, just faster and with better recall', key: 'a' },
      { label: 'The AI predicts statistically likely text based on patterns — it produces convincing regulatory language without understanding what the regulations require', key: 'b' },
      { label: 'The AI looks up each question in a built-in regulatory database and returns the matching rule, so its answers are as reliable as the source it searched', key: 'c' },
      { label: 'The AI understands a regulation once the bank uploads it, and from then on applies it to new cases the same way a trained compliance analyst would', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'LLMs are pattern-matching prediction engines. They produce fluent regulatory language without comprehending legal obligations. Every regulatory statement must be verified by a human.',
  },
  {
    id: 'gai-03',
    topic: 'gen-ai-fundamentals',
    stem: 'Your CEO reads a news article about a large bank deploying AI for automated loan decisioning. She asks whether your $350M community bank should do the same. The best response is:',
    options: [
      { label: 'Yes — larger banks have already proven that automated decisioning works, so a community bank can adopt the same vendor model and gain the efficiency without building its own governance', key: 'a' },
      { label: 'No — regulators prohibit AI in credit decisions at banks under $1 billion, so the bank should wait until examiners publish specific approval criteria for smaller institutions', key: 'b' },
      { label: 'Automated loan decisioning is a high-complexity use case with significant regulatory risk — community banks get more value starting with staff productivity tools and working toward decisioning over time', key: 'c' },
      { label: 'Start with automated decisioning on small consumer loans first, since those balances are low enough that model errors or fair lending issues would not create material regulatory or reputational exposure for the bank', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'Autonomous credit decisioning requires robust model governance, fair lending testing, and audit infrastructure. Community banks create more value starting with low-risk productivity use cases that build organizational comfort.',
  },
  {
    id: 'gai-04',
    topic: 'gen-ai-fundamentals',
    stem: 'A teller uses ChatGPT to help a member calculate how much they would save by refinancing their mortgage. The teller shares the AI\'s answer with the member. What is the primary risk?',
    options: [
      { label: 'ChatGPT rounds intermediate values, so the savings figure could be off by a few dollars — acceptable for an estimate as long as the teller calls it approximate before sharing it', key: 'a' },
      { label: 'The AI may produce a plausible but mathematically incorrect calculation, and the teller shared it as advice without verifying the math against actual loan terms', key: 'b' },
      { label: 'Tellers are not licensed mortgage originators, so the only real risk is a licensing issue — the math itself from a major AI tool can be treated as reliable', key: 'c' },
      { label: 'The member\'s details were typed into the tool, but because no account number was used, the conversation carries no privacy or accuracy risk worth escalating', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Sharing unverified AI-generated financial calculations with a member creates regulatory and reputational risk. AI output is a draft — it must be verified before being presented as guidance.',
  },
  {
    id: 'gai-05',
    topic: 'gen-ai-fundamentals',
    stem: 'Your loan operations team wants to use AI to pre-fill commercial loan applications from uploaded financial statements. Which AI capability makes this possible?',
    options: [
      { label: 'Automated credit scoring that reads the statements and assigns a risk grade', key: 'a' },
      { label: 'Document extraction and structured data parsing from unstructured text or PDFs', key: 'b' },
      { label: 'Real-time internet search that pulls the borrower\'s filings from public sources', key: 'c' },
      { label: 'Predictive analytics that forecasts the borrower\'s future cash flow from past years', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-powered document extraction reads financial statements (tax returns, P&Ls, balance sheets) and pulls structured data into application fields — eliminating manual data entry while requiring human verification.',
  },
  {
    id: 'gai-06',
    topic: 'gen-ai-fundamentals',
    stem: 'An examiner asks your BSA officer how the bank ensures AI-generated suspicious activity narratives are accurate. The correct answer is:',
    options: [
      { label: 'The model was trained on thousands of filed SARs, so its narratives follow FinCEN\'s expected structure, and the BSA department spot-checks a sample each quarter', key: 'a' },
      { label: 'Every AI-generated narrative is reviewed and approved by a certified BSA analyst before filing, with the analyst\'s name documented as the responsible party', key: 'b' },
      { label: 'The AI vendor certifies narrative accuracy in its SOC 2 report, and the bank keeps that report on file as the evidence examiners ask for', key: 'c' },
      { label: 'Each narrative is checked by a second AI model, and any narrative both models agree on is filed automatically without further review', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI can draft SAR narratives to save time, but a human BSA professional must review, verify, and take accountability for every filed report. The audit trail must name the human, not the tool.',
  },
  {
    id: 'gai-07',
    topic: 'gen-ai-fundamentals',
    stem: 'Your bank\'s AI tool was set up in January 2025. A board member asks it about the AIEOG AI Lexicon published in February 2026. The AI responds with a detailed but completely fabricated description. Why?',
    options: [
      { label: 'The Lexicon is restricted to regulators and financial institutions, so the AI\'s safety filters blocked the real text and substituted a generated summary instead', key: 'a' },
      { label: 'The tool\'s training data has a knowledge cutoff before February 2026 — it does not know the Lexicon exists, so it generated a plausible fiction', key: 'b' },
      { label: 'The board member used the wrong acronym, so the AI answered about a different framework and presented it under the Lexicon\'s name', key: 'c' },
      { label: 'The tool retrieved an early draft of the Lexicon that circulated before publication, which is why its details differ from the final version', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI models have a training data cutoff date. When asked about events after that date, they do not say "I don\'t know" — they generate plausible-sounding but fabricated content.',
  },
  {
    id: 'gai-08',
    topic: 'gen-ai-fundamentals',
    stem: 'Your deposit operations team asks whether AI can fully replace the person who manually reconciles daily GL entries. The honest answer is:',
    options: [
      { label: 'Yes — once the AI has matched a month of entries correctly, it can post, reconcile, and approve the daily GL on its own, with only a monthly human spot check of the totals', key: 'a' },
      { label: 'AI can flag mismatches, draft exception notes, and pre-sort entries — but a human must review exceptions, verify balances, and approve the final reconciliation', key: 'b' },
      { label: 'No — AI tools are not permitted to read general ledger data, so reconciliation has to stay fully manual until the core provider offers its own module', key: 'c' },
      { label: 'Only with a dedicated reconciliation platform — general AI tools cannot flag mismatches or draft exception notes from general ledger exports', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI accelerates reconciliation by handling pattern matching and exception flagging. Final verification and approval remain human responsibilities, especially when general ledger accuracy is at stake.',
  },

  // ── Prompting with CORE (8 questions) ──
  // IDs keep the old rtfc- prefix so stored exam attempts still line up.
  {
    id: 'rtfc-01',
    topic: 'prompting',
    stem: 'A loan officer needs to draft an adverse action notice for a denied small business loan. Using CORE, which prompt would produce the most compliant first draft?',
    options: [
      { label: '"You are a helpful assistant. Write a letter to John Smith at 42 Oak Street explaining that his SBA loan for Smith Hardware was denied because his DSCR was 1.05 and his credit score is 612. Keep it friendly, short, and reassuring so he applies again next year."', key: 'a' },
      { label: '"You are a community bank compliance specialist. Draft an adverse action notice for a denied SBA loan application. Format as a formal letter. Include the specific reasons for denial as bullet points. Do not reference any applicant PII — use placeholder brackets. Ensure language aligns with ECOA and Regulation B requirements."', key: 'b' },
      { label: '"You are a community bank loan officer. Write a denial letter for a small business loan. Make it warm and encouraging, and suggest the applicant will likely be approved if they reapply next quarter. Do not list specific reasons, since listing them could create legal exposure for the bank."', key: 'c' },
      { label: '"Draft an ECOA and Regulation B compliant adverse action notice for a denied small business loan. Make sure it is fully compliant and legally sufficient so it can be sent without review. Use your own knowledge of the regulations to decide which reasons to include and how to format the letter."', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'This prompt covers all four CORE parts — Context (a community bank compliance specialist), Objective (draft an adverse action notice for a denied SBA application), Resources (placeholder brackets instead of applicant data), Expectations (formal letter, reasons as bullets, ECOA and Regulation B alignment).',
  },
  {
    id: 'rtfc-02',
    topic: 'prompting',
    stem: 'Your teller supervisor needs to create a training guide for new hires on how to handle cash discrepancies at the window. Which Context line produces the most useful output?',
    options: [
      { label: '"You are an AI assistant with access to every banking procedure, and you should answer as accurately and thoroughly as you possibly can"', key: 'a' },
      { label: '"You are a community bank branch operations trainer with 15 years of experience training tellers at institutions under $500M in assets"', key: 'b' },
      { label: '"You are a senior federal bank examiner reviewing teller cash controls for compliance with safety and soundness standards at community banks"', key: 'c' },
      { label: '"You are a friendly new-hire buddy who explains banking in simple, casual language that anyone can follow on their very first day"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Specific context produces specific output. Naming the role, industry, asset size, audience, and experience level causes the AI to calibrate tone, vocabulary, and detail level for the exact use case.',
  },
  {
    id: 'rtfc-03',
    topic: 'prompting',
    stem: 'Your CFO asks AI to summarize the bank\'s 120-page strategic plan for a board presentation. The AI produces a summary that misses three critical initiatives. The most likely cause is:',
    options: [
      { label: 'The CFO should have told the AI to be more thorough — adding "do not miss anything important" to the prompt fixes most gaps in long summaries without splitting the document', key: 'a' },
      { label: 'The document was too long for a single prompt — it should have been broken into sections with a separate CORE prompt per section, then synthesized', key: 'b' },
      { label: 'Strategic plans contain confidential content, so the AI automatically skipped the three initiatives that mentioned financial projections', key: 'c' },
      { label: 'The AI weights the first and last pages most heavily, so the fix is to move the three critical initiatives to the start of the document', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Long documents should be processed in sections. A single prompt for 120 pages forces the AI to compress excessively. Section-by-section summarization with synthesis produces more complete and accurate output.',
  },
  {
    id: 'rtfc-04',
    topic: 'prompting',
    stem: 'A member services representative wants AI to help draft a response to a complaint about unexpected overdraft fees. The best Expectations to add to the CORE prompt are:',
    options: [
      { label: '"Apologize for the fees, confirm that the three overdraft charges on the member\'s account ending 4417 will be refunded today, and thank them for twelve years as a loyal member. Keep the tone warm and personal."', key: 'a' },
      { label: '"Do not reference the member\'s specific account number, balance, or transaction history. Keep under 150 words. Acknowledge the member\'s frustration without admitting fault or waiving the fee. Direct the member to speak with a branch manager for account-specific resolution."', key: 'b' },
      { label: '"Explain the bank\'s overdraft policy in full, quote the fee schedule and the Regulation E opt-in rules, and make clear the fees were charged correctly so the member understands the complaint has no basis."', key: 'c' },
      { label: '"Make it sound empathetic and professional. Use the member\'s name and recent transactions to personalize the response so it does not read like a form letter, and keep it under 300 words."', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Effective expectations are specific: no PII, word limit, tone guidance, liability guardrails, and a clear escalation path. Vague expectations ("make it sound nice") produce vague output.',
  },
  {
    id: 'rtfc-05',
    topic: 'prompting',
    stem: 'Your commercial lender asks AI to analyze a borrower\'s three years of tax returns and produce a summary. The AI-generated summary looks thorough but lists the wrong revenue figures. What went wrong?',
    options: [
      { label: 'The AI cannot read scanned tax returns, so it estimated revenue from industry averages — switching to typed PDFs would fix the figures', key: 'a' },
      { label: 'The lender\'s prompt set no Expectations; once a table layout is specified, the AI\'s extracted figures can be used without checking the returns', key: 'b' },
      { label: 'The AI likely extracted data incorrectly from the documents — AI-generated financial figures must always be verified against the original source documents before use', key: 'c' },
      { label: 'The borrower\'s returns likely contained the errors — AI extraction from clean financial documents is accurate enough that verification is only needed when files are scanned or handwritten', key: 'd' },
    ],
    correctKey: 'c',
    explanation: 'AI document extraction is imperfect, especially with scanned documents and complex tax forms. Every financial figure in AI-generated output must be verified against the original. This is not optional.',
  },
  {
    id: 'rtfc-06',
    topic: 'prompting',
    stem: 'A compliance officer drafts a vendor management policy update using AI. The first draft is generic and reads like it could apply to any industry. The best fix using CORE is to strengthen the:',
    options: [
      { label: 'Expectations — convert the policy from paragraphs to a numbered checklist, since generic language usually comes from the AI defaulting to narrative prose', key: 'a' },
      { label: 'Context — specify "community bank with $400M in assets, FDIC-supervised, subject to Interagency TPRM Guidance" so the AI generates institution-specific language', key: 'b' },
      { label: 'Objective — ask the AI to "make it specific and detailed," which pushes the model to add institution-level language without needing any more context', key: 'c' },
      { label: 'Nothing in the prompt — generic vendor policies are preferable because examiners look for standard language, and the bank can add specifics later at its annual policy review cycle', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Generic output comes from generic prompts. Adding institutional context (asset size, charter type, supervisory agency, applicable guidance) forces the AI to produce specific, relevant content.',
  },
  {
    id: 'rtfc-07',
    topic: 'prompting',
    stem: 'A branch manager asks AI to create a script for calling delinquent borrowers. The AI produces a script that could violate FDCPA guidelines. The correct response is to:',
    options: [
      { label: 'Use the script, since collection scripts drafted by AI tools are generally checked for FDCPA language during the model\'s training', key: 'a' },
      { label: 'Add FDCPA compliance to the prompt\'s Expectations, regenerate, and then have compliance review the output before any staff member uses it', key: 'b' },
      { label: 'Stop using AI for member-facing communications entirely, since any collection script creates too much regulatory exposure to justify the time saved', key: 'c' },
      { label: 'Ask the AI to review its own script for FDCPA violations and use the corrected version, since a second pass by the model reliably catches its own mistakes', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The fix is better constraints plus human review — not abandoning the tool. AI drafts; compliance validates. Asking the AI to self-check is unreliable.',
  },
  {
    id: 'rtfc-08',
    topic: 'prompting',
    stem: 'Your BSA officer needs AI to draft narratives for 15 currency transaction reports from yesterday. The most efficient CORE approach is:',
    options: [
      { label: 'Paste all 15 transactions into one prompt and request every narrative at once, then spot-check two or three of the outputs before filing the full batch', key: 'a' },
      { label: 'Create one well-crafted CORE template for CTR narratives, then apply it to each transaction individually — verifying each output against the source transaction before filing', key: 'b' },
      { label: 'Have the AI draft and submit the CTRs directly to FinCEN through BSA E-Filing, with the BSA officer reviewing the confirmation receipts afterward', key: 'c' },
      { label: 'Write a new, fully custom prompt for each of the 15 transactions so every narrative is tailored, and skip source verification because each prompt is unique to its own transaction', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'A reusable CORE template for CTR narratives saves time across many transactions while maintaining accuracy through individual verification. Batch processing 15 at once risks cross-contamination of transaction details.',
  },

  // ── Safe Use in Regulated Institutions (8 questions) ──
  {
    id: 'safe-01',
    topic: 'safe-use',
    stem: 'A teller pastes a member\'s name, account number, and last three transactions into ChatGPT to help draft a letter explaining a hold on their account. What is the immediate concern?',
    options: [
      { label: 'ChatGPT may draft the hold letter with the wrong tone or without the Regulation CC timelines, so a supervisor should proofread it before it is sent to the member', key: 'a' },
      { label: 'Member PII has been shared with a third-party AI service that may retain and use the data for model training — a potential GLBA and privacy violation', key: 'b' },
      { label: 'The teller used the right tool but the wrong prompt format — adding Context and Expectations would have made sharing the account details acceptable', key: 'c' },
      { label: 'No real concern, because consumer AI tools delete conversation data right away and account numbers alone are not protected information under GLBA', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Sharing member PII with a public AI tool is a potential GLBA violation. The data may be retained, stored outside the bank\'s control, and used to train future models. This is a governance incident, not just a tool-use question.',
  },
  {
    id: 'safe-02',
    topic: 'safe-use',
    stem: 'Your board wants to adopt an AI-powered lending analytics tool from a fintech vendor. Before proceeding, the most critical question to ask the vendor is:',
    options: [
      { label: '"How many community banks our size already use your product, and can you share references from three that have used it for more than a year?"', key: 'a' },
      { label: '"Where is our member data stored, who has access, is it used to train your models, and how does your tool handle fair lending testing under ECOA and Regulation B?"', key: 'b' },
      { label: '"Can you run a free 90-day pilot on our real loan data, so we can measure the tool\'s accuracy before we commit to a contract?"', key: 'c' },
      { label: '"What does the board dashboard look like, and can it produce the lending reports our team currently builds by hand each quarter?"', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Data residency, access controls, model training policies, and fair lending compliance are threshold questions for any AI vendor serving a regulated institution. Popularity and aesthetics are secondary.',
  },
  {
    id: 'safe-03',
    topic: 'safe-use',
    stem: 'Your IT manager discovers that 8 of 12 loan officers have been using a free AI writing tool for member correspondence — without management knowledge or approval. This is called:',
    options: [
      { label: 'Grassroots innovation — staff finding productivity gains that management should encourage', key: 'a' },
      { label: 'Shadow AI — unauthorized use of AI tools that creates unquantified data exposure and compliance risk', key: 'b' },
      { label: 'A training gap that a reminder email about the acceptable use policy will close', key: 'c' },
      { label: 'Normal technology adoption that needs no response, since the officers only used a free, widely available public tool', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Shadow AI is widespread in banking. The response is to inventory what data has been shared, assess the risk, and create governance — not to punish staff or ignore the problem.',
  },
  {
    id: 'safe-04',
    topic: 'safe-use',
    stem: 'An AI tool used to pre-screen mortgage applications is found to deny applications from a specific zip code at a rate 3x higher than surrounding areas. This raises concerns under:',
    options: [
      { label: 'The Bank Secrecy Act, because a geographic concentration of denials can indicate structuring or money laundering risk', key: 'a' },
      { label: 'The Equal Credit Opportunity Act and Fair Housing Act — potential disparate impact discrimination through proxy variables', key: 'b' },
      { label: 'The Truth in Lending Act, because applicants in that zip code may not have received accurate APR disclosures', key: 'c' },
      { label: 'No regulation, because zip code is a neutral, objective variable and the AI applied the same model to every applicant equally', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Geographic patterns can be proxies for race or ethnicity. ECOA and the Fair Housing Act prohibit disparate impact in credit decisions regardless of whether a human or algorithm made the decision. AI does not create a compliance exemption.',
  },
  {
    id: 'safe-05',
    topic: 'safe-use',
    stem: 'An examiner asks your bank to explain how you govern your use of AI tools. You currently have no written AI use policy. The best immediate response is:',
    options: [
      { label: 'Tell the examiner the bank does not formally use AI, since staff use of free tools is personal and outside the scope of the bank\'s governance program', key: 'a' },
      { label: 'Acknowledge the gap, describe the specific AI tools currently in use, explain your plans for a formal policy aligned with SR 26-2 and the AIEOG AI Lexicon, and provide a timeline for completion', key: 'b' },
      { label: 'Commit to banning all AI tools immediately and confirm in writing that no employee will use AI until the board approves a policy next year', key: 'c' },
      { label: 'Explain that the IT department owns AI governance, provide the vendor contracts as evidence of oversight, and treat a formal written policy as optional because no regulation specifically requires one', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Transparency is the correct posture. Examiners expect to see awareness, inventory, and a plan — not perfection. Denying AI use when staff are clearly using it creates a credibility problem.',
  },
  {
    id: 'safe-06',
    topic: 'safe-use',
    stem: 'Your bank is evaluating whether to process certain AI workloads on a private cloud instead of using a public AI service. The deciding factor should be:',
    options: [
      { label: 'Cost — private cloud is always more expensive to run, so the bank should use public AI services for every workload and accept the vendor\'s standard data retention and usage terms', key: 'a' },
      { label: 'Whether the data involved includes member PII, non-public examination findings, proprietary models, or information that must not leave the bank\'s controlled environment', key: 'b' },
      { label: 'Whether the bank\'s IT team is large enough to manage private infrastructure, since staffing capacity matters more than what kind of data is processed', key: 'c' },
      { label: 'Whichever option the AI vendor recommends, since the vendor\'s security team understands the data risks of its own platform better than the bank does', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Data sensitivity determines infrastructure. Public AI services are acceptable for non-sensitive tasks. Private inference is required when data must remain within the institution\'s governance perimeter.',
  },
  {
    id: 'safe-07',
    topic: 'safe-use',
    stem: 'A vendor pitches your bank an AI tool for automated check fraud detection. They claim the tool "makes decisions in real-time with no human intervention needed." Your response should be:',
    options: [
      { label: 'Sign the contract, since real-time fraud detection is critical and fully automated decisions remove the human error behind most missed check fraud', key: 'a' },
      { label: 'Ask how the tool handles false positives, what the escalation path is for flagged items, whether human review is built into the workflow, and what audit trail the tool produces', key: 'b' },
      { label: 'Reject the tool, because regulators do not allow AI in fraud detection and any automated hold on a check would violate Regulation CC funds availability rules for deposited items', key: 'c' },
      { label: 'Negotiate price and contract length first, since fraud tools are largely interchangeable and the vendor\'s own validation testing can be relied on', key: 'd' },
    ],
    correctKey: 'b',
    explanation: '"No human intervention needed" is a red flag for regulated institutions. AI-assisted fraud detection needs false-positive handling, human escalation paths, and auditable decision trails.',
  },
  {
    id: 'safe-08',
    topic: 'safe-use',
    stem: 'Your compliance officer wants to use AI to help prepare for the upcoming FDIC safety and soundness exam. Which use is appropriate?',
    options: [
      { label: 'Upload the previous exam report and the bank\'s internal findings to a public AI tool, ask it to predict examiner focus areas, and delete the chat history once the preparation work is finished', key: 'a' },
      { label: 'Use a private, institution-controlled AI tool to organize internal preparation materials, draft responses to anticipated questions, and compile supporting documentation — without uploading non-public examination data to external services', key: 'b' },
      { label: 'Have the AI draft and send the bank\'s responses to the pre-exam request letter directly through the FDIC portal, so the compliance officer can focus on remediation', key: 'c' },
      { label: 'Use AI to generate supporting documents that fill gaps in the bank\'s records, as long as a compliance officer reviews them for accuracy before examiners see them', key: 'd' },
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
      { label: 'A technology audit — an IT-led inventory of the systems each department uses and the licenses the bank pays for', key: 'a' },
      { label: 'A time diary — a low-tech, high-trust method that surfaces repetitive workflows by having staff self-report daily tasks and time spent', key: 'b' },
      { label: 'A job description review — HR compares current duties against written role descriptions to find outdated or duplicated tasks across departments', key: 'c' },
      { label: 'A process maturity assessment — a consultant scores each department\'s workflows against an industry benchmark', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The time diary reveals where labor hours actually go — not where management thinks they go. Repetitive, time-consuming patterns emerge naturally without surveillance or assumptions.',
  },
  {
    id: 'uci-02',
    topic: 'use-case-identification',
    stem: 'After the time diary, three candidates emerge: (A) automating daily GL reconciliation formatting, (B) using AI to approve or deny consumer loans, and (C) AI-generated board meeting minutes. The best first project is:',
    options: [
      { label: 'B — loan decisioning has the highest ROI because it removes the most staff time and speeds up approvals for members', key: 'a' },
      { label: 'A — GL reconciliation formatting is repetitive, measurable, rule-based, and carries minimal regulatory risk', key: 'b' },
      { label: 'C — board minutes are the most visible to leadership, which builds executive support for larger AI projects later', key: 'c' },
      { label: 'All three at once, since running the projects in parallel shortens the timeline and spreads the vendor cost across more wins', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The best first project is high-frequency, measurable, rule-based, and low-risk. GL reconciliation formatting fits all four criteria. Loan decisioning is high-risk. Board minutes are low-frequency.',
  },
  {
    id: 'uci-03',
    topic: 'use-case-identification',
    stem: 'A teller spends 40 minutes every morning compiling a branch cash position report from three different systems. This task is a strong automation candidate because:',
    options: [
      { label: 'The teller dislikes the task, and staff preference is the most reliable signal of which work AI should take over first', key: 'a' },
      { label: 'It happens daily, takes a measurable amount of time, follows the same steps every time, and requires data extraction rather than subjective judgment', key: 'b' },
      { label: 'Cash position reporting is the highest-risk task at the branch, so it should be automated to remove human error entirely', key: 'c' },
      { label: 'AI can read and combine data from multiple core systems without integration work, so any task touching more than one system is a strong candidate regardless of frequency', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Strong automation candidates are: daily (high frequency), time-measurable (40 min), rule-based (same steps), and low-judgment (data extraction). Staff sentiment is relevant but not the deciding criterion.',
  },
  {
    id: 'uci-04',
    topic: 'use-case-identification',
    stem: 'Your loan department identifies 5 potential automation projects. The best way to prioritize them is:',
    options: [
      { label: 'Let the most senior loan officer choose, since experience is the best predictor of which project will deliver value and earn staff buy-in', key: 'a' },
      { label: 'Rank by combining estimated hours saved per week, implementation difficulty, and regulatory sensitivity — start with the highest-savings and lowest-risk project', key: 'b' },
      { label: 'Start with whichever project the AI vendor recommends, since vendors have implemented similar projects and know which ones succeed at community banks like yours in your state', key: 'c' },
      { label: 'Implement all five at once to build momentum, then drop the ones that do not show savings after the first quarter of use', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Structured prioritization balances value (time savings), feasibility (difficulty), and risk (regulatory sensitivity). Starting with high-value, low-risk projects builds organizational confidence.',
  },
  {
    id: 'uci-05',
    topic: 'use-case-identification',
    stem: 'Your retail banking manager wants AI to automatically send personalized product offers to members based on their transaction history. Before approving, you should consider:',
    options: [
      { label: 'Whether the AI can technically generate personalized offers from transaction data, and whether the core system can export that data in real time', key: 'a' },
      { label: 'Whether automated product recommendations based on transaction data create UDAP concerns, whether members have consented to this use of their data, and whether the recommendations could result in unsuitable product placements', key: 'b' },
      { label: 'Whether the marketing department has budget for the campaign and whether the offers would raise product penetration above current targets', key: 'c' },
      { label: 'Whether competitors are already sending AI-personalized offers, since members expect similar outreach and falling behind creates attrition risk', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Automated product recommendations using transaction data raise UDAP (unfair, deceptive, or abusive acts or practices) questions, consent issues, and suitability concerns. Technical capability is not the only filter.',
  },
  {
    id: 'uci-06',
    topic: 'use-case-identification',
    stem: 'A commercial loan officer uses AI to draft credit memos. In this workflow, the AI is best described as:',
    options: [
      { label: 'The decision-maker, since the memo\'s recommendation is what the credit committee actually reviews and approves', key: 'a' },
      { label: 'A drafting assistant that produces a first version for the loan officer to review, verify, and take responsibility for', key: 'b' },
      { label: 'A replacement for the credit analyst, since the AI produces a complete memo the loan officer can sign as written without re-checking the figures', key: 'c' },
      { label: 'A co-author who shares responsibility for the credit decision with the loan officer who signs the memo', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI-as-drafting-assistant is the correct framing for community banks. The loan officer retains judgment, accountability, and the final decision. The AI accelerates the drafting, not the deciding.',
  },
  {
    id: 'uci-07',
    topic: 'use-case-identification',
    stem: 'Your HR manager wants to use AI to screen job applications for open teller positions. The most important governance consideration is:',
    options: [
      { label: 'Whether the AI can read resumes submitted as PDFs and scanned images, since unreadable files would unfairly drop otherwise qualified applicants', key: 'a' },
      { label: 'Whether the AI screening criteria could introduce bias against protected classes in violation of employment discrimination laws', key: 'b' },
      { label: 'Whether the AI screens applications faster than the HR manager, since speed is the main reason to automate teller hiring', key: 'c' },
      { label: 'Whether applicants are told AI is involved, since disclosure alone satisfies the bank\'s obligations under employment law', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI resume screening can perpetuate or amplify hiring bias. The primary governance concern is whether the tool could violate Title VII or other employment discrimination laws through disparate impact.',
  },
  {
    id: 'uci-08',
    topic: 'use-case-identification',
    stem: 'Your wealth management team wants AI to generate client portfolio summaries. The line between "AI-assisted" and "AI-autonomous" in this context is:',
    options: [
      { label: 'Whether the AI runs on cloud or on-premise infrastructure, since tools hosted inside the bank count as AI-assisted by definition regardless of who reviews the output', key: 'a' },
      { label: 'Whether a human advisor reviews and approves the summary before it reaches the client, or whether the AI sends it directly without human review', key: 'b' },
      { label: 'Whether the client requested the summary, since unsolicited AI output is autonomous while requested output is assisted', key: 'c' },
      { label: 'How much the tool costs and how much human time it replaces, since a tool that saves more than half the work is considered autonomous', key: 'd' },
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
      { label: 'The number of times staff used the AI tool this month, since adoption is the clearest sign the automation is working', key: 'a' },
      { label: 'Staff hours recaptured per week compared to the pre-automation baseline, converted to an annualized dollar equivalent', key: 'b' },
      { label: 'A staff survey showing satisfaction with the tool, since morale improvements are the main return boards want to see', key: 'c' },
      { label: 'The number of AI tools the bank has purchased and deployed this year, since breadth of adoption signals strategic progress', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Boards want outcomes in business terms. Hours recaptured, baselined against pre-automation state, and converted to dollars — that is the metric that justifies continued investment.',
  },
  {
    id: 'meas-02',
    topic: 'measurement',
    stem: 'A teller reports she saves "about 30 minutes a day" using AI for member correspondence. To make this claim reportable to management, she should:',
    options: [
      { label: 'Mention it to her supervisor informally so it gets noted, since precise time tracking takes longer than the savings are worth', key: 'a' },
      { label: 'Log the specific tasks where AI saved time for two weeks, note pre-AI vs. post-AI time per task, and calculate a monthly dollar equivalent using her loaded hourly rate', key: 'b' },
      { label: 'Ask the AI tool to calculate how much time it saved her, since the tool logs every interaction and can report usage-based savings', key: 'c' },
      { label: 'Multiply 30 minutes by 250 working days, record the annual total in her performance review, and present that annual figure to management as verified savings from the tool', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Self-reported time logs over a consistent period, tied to specific tasks with before/after comparisons, are the foundation of bottom-up ROI measurement. Casual estimates are not evidence.',
  },
  {
    id: 'meas-03',
    topic: 'measurement',
    stem: 'Your bank completed an AI Quick Win Sprint that automated three processes. The final report includes a "What We Didn\'t Do" page. This page exists because:',
    options: [
      { label: 'It documents what the consultants were contracted to deliver but did not, so the bank has grounds to withhold part of the final payment', key: 'a' },
      { label: 'It lists the automation opportunities identified during the sprint that were not implemented yet — creating a documented pipeline for the next engagement or internal initiative', key: 'b' },
      { label: 'Regulators require every AI engagement report to list declined use cases, and examiners check for this page during the next safety and soundness exam as part of AI governance review', key: 'c' },
      { label: 'It records the processes the team decided should never be automated, so future staff do not propose them again', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The "What We Didn\'t Do" page shows leadership that the sprint uncovered more value than one engagement could capture. It seeds the next conversation and creates an internal automation backlog.',
  },
  {
    id: 'meas-04',
    topic: 'measurement',
    stem: 'Your CFO asks what the bank\'s efficiency ratio is and why it matters for AI investments. The correct explanation is:',
    options: [
      { label: 'The efficiency ratio is total loans divided by total deposits — it shows how well the bank deploys its funding, and AI improves it by speeding up loan approvals and growing loan volume on the same deposit base', key: 'a' },
      { label: 'The efficiency ratio is non-interest expense divided by revenue — it measures how many cents the bank spends to earn one dollar, and AI automation can improve it by reducing the numerator', key: 'b' },
      { label: 'The efficiency ratio measures average loan processing time, and AI improves it directly by cutting the days between application and closing', key: 'c' },
      { label: 'The efficiency ratio is net income divided by total assets — it measures profitability per dollar of assets, and AI raises it by growing fee income', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'The efficiency ratio (NIE/revenue) is the primary operational benchmark. Community bank median is ~65% (FDIC). AI reduces non-interest expense by automating labor — moving the numerator.',
  },
  {
    id: 'meas-05',
    topic: 'measurement',
    stem: 'When presenting AI project outcomes to the board of directors, the most effective format is:',
    options: [
      { label: 'A detailed walkthrough of how the AI technology works, so directors understand the model architecture and training data before they evaluate any results', key: 'a' },
      { label: 'A one-page scorecard showing: hours saved, dollars saved, processes automated, and before-after comparison with the pre-automation baseline', key: 'b' },
      { label: 'A comparison of the AI vendors the bank considered, showing why the chosen tool was the best value for the investment', key: 'c' },
      { label: 'A full appendix of the prompts staff used during the quarter, so directors can audit exactly how the tools were used', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'Boards speak in business outcomes, not technology. A one-page scorecard with quantified results, baselined against the prior state, is the format that sustains investment and builds confidence.',
  },
  {
    id: 'meas-06',
    topic: 'measurement',
    stem: 'Only 3 of the top 50 global banks can currently report both present and projected ROI across their full AI portfolio. For a community bank, this means:',
    options: [
      { label: 'ROI measurement is impractical for smaller institutions, since even the largest banks with dedicated data teams have not managed it across a full portfolio of tools', key: 'a' },
      { label: 'A community bank that measures AI outcomes from day one will have a measurement discipline that most institutions, including large banks, still lack', key: 'b' },
      { label: 'Community banks should delay AI projects until large banks settle on a measurement standard that smaller institutions can copy', key: 'c' },
      { label: 'Community banks should hire one of the three leading banks\' consulting arms to design their measurement program before starting', key: 'd' },
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
      { label: 'Survey staff on whether they feel more productive, and report the share who agree as the return on the bank\'s AI investment this year', key: 'a' },
      { label: 'Compile the measured hours saved and dollar equivalents from all three projects, compare the total against the cost of implementation, and present the aggregate ROI with a 12-month projection', key: 'b' },
      { label: 'Benchmark the bank\'s AI spending against peer banks, since spending at or below peers shows the investment level was reasonable', key: 'c' },
      { label: 'Explain that AI is a long-term investment in the bank\'s future that cannot be measured with traditional ROI methods in its first year', key: 'd' },
    ],
    correctKey: 'b',
    explanation: 'AI investments should be measured like any other operational investment: outcomes vs. cost, with projection. "It cannot be measured" is not an answer a CFO or board should accept.',
  },
] as const;
