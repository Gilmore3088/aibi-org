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
        title: 'Where the Day Actually Goes',
        content:
          'Most bankers do not lose the day to one large project. They lose it to thirty small writing and reading tasks: a confusing email from another department, a meeting summary nobody captured, a memo that needs three revisions before it can go to the committee, a voicemail that needs to become a callback note in the loan file. None of these are decisions. All of them are friction.\n\nAI is useful precisely in this layer. It is fast at first drafts, structure, summarisation, and tone adjustment. It is not a substitute for judgment, and it is not yet a substitute for what your institution has approved as a system of record. What it can do reliably — when used with non-sensitive material — is take a thirty-minute writing task and reduce it to a five-minute review task.\n\n> The goal of Module 1 is not to make you faster at everything. It is to identify two or three recurring tasks where AI removes friction without adding risk, and to build the habit of using it there.\n\nThe practitioner mindset is simple: AI drafts, the banker reviews. The output is your output. The signature is your signature. The accountability is your accountability. AI does not change that — it changes how much of your morning is spent on the parts of the work that do not require your judgment in the first place.',
        tryThis: 'For one workday, keep a tally of the writing or summarising tasks you do that do not require judgment — only clarity. The count is usually higher than expected. Those are your candidates.',
      },
      {
        title: 'The First Safe Win — Emails',
        content:
          'The single most defensible starting use case in community banking is rewriting a messy internal email so the action, owner, and deadline are clear. It is internal, it is non-sensitive when the names are stripped, and it produces a measurable improvement in how your team operates.\n\nThe pattern is repeatable: paste the messy draft, give AI a short instruction ("make this shorter, clearer, and more action-oriented; do not add any facts I did not include"), and review the output before sending. Three things tend to happen. First, the email gets shorter. Second, the buried action item moves to the top. Third, the recipient knows what to do without re-reading.\n\n> What to paste: internal communications, meeting prep notes, status updates, project requests, internal policy questions written in your own words.\n>\n> What not to paste: customer names, account numbers, loan amounts tied to a specific borrower, transaction history, NPI, or any communication that contains material non-public information about the institution.\n\nThe constraint matters. If the messy email contains a customer name, redact the name to a placeholder (Member A, Borrower X) before pasting. The structural problem AI solves — clarity — does not depend on the customer name being present. Removing it costs you nothing and keeps the use case in the green zone.',
        tryThis: 'Pull one confusing internal email from the last seven days. Strip identifiers. Rewrite it with AI to under 150 words, leading with the action and the deadline. Compare the two side-by-side before sending.',
      },
      {
        title: 'Summaries Without Drift',
        content:
          'The second daily win is summarisation: turning a long meeting transcript, a regulatory bulletin, or a vendor proposal into something a colleague can absorb in two minutes. AI is genuinely useful here, with one discipline — the summary must stay grounded in what you provided. It must not invent context, fill in blanks, or smooth over ambiguity.\n\nThe technique is to instruct AI to summarise only what is in the source. If the document does not specify a deadline, the summary should say "no deadline specified" rather than guess. If a regulation references a framework you did not paste, the summary should flag the reference rather than describe the framework from memory. This is the difference between a useful AI summary and a hallucinated one.\n\n> A grounded summary is faster than reading the original. A hallucinated summary is slower than reading the original, because you now have to verify every claim.\n\nThe banker review step is not optional. Read the source at least once. Compare the summary to the source for any sentence that contains a number, a date, a name, or a policy claim. Those are the four places hallucinations cluster. If a sentence in the summary contains all four, treat it as suspect until proven correct.',
        tryThis: 'Take a one-page internal memo or an approved regulatory bulletin. Ask AI for a 100-word summary with the instruction: "Use only what is in the document. If something is not specified, say so." Verify every number and date against the source.',
      },
      {
        title: 'Thinking Support',
        content:
          'The third use case is the least visible and arguably the most valuable: using AI to organise your own thinking before a difficult task. Drafting a hard email to a colleague, preparing for a contentious meeting, working through the structure of a memo that needs to land — these are tasks where AI is a useful sounding board, not a writer.\n\nThe pattern is to describe the situation in your own words, ask AI to identify the structure ("what are the three points I should make?", "what is the strongest order to make them in?", "what is the single objection a sceptical reader would raise?"), and then write the final output yourself. AI helps you see the shape of the problem. It does not replace the work of solving it.\n\n> AI is a thinking partner for structure. It is not a thinking partner for facts, policy, or institutional judgment.\n\nThis use case stays safe by design — you are describing your own situation, not pasting confidential material. The output is internal to you, used as a planning aid, and never represented as an institutional position. It is the closest AI gets to coaching, and it works because the banker remains the decision-maker throughout.',
        tryThis: 'Pick one upcoming difficult conversation or memo. Describe the situation to AI in three sentences. Ask: "What are the three strongest points I should make, and in what order?" Use the answer as a planning prompt — write the actual output yourself.',
      },
      {
        title: 'Building the Habit',
        content:
          'The difference between a banker who has used AI once and a practitioner is not technical skill — it is habit. The habit is small: before drafting an email longer than a paragraph, before summarising a meeting, before reading a long document, ask whether AI could produce a useful first pass.\n\nA practical default is the five-minute rule. If a writing or summarising task would take more than five minutes and contains no sensitive data, run it through AI first. Review the output. Edit it to your voice. Send it. Over a week, this rule alone tends to recover thirty to sixty minutes of writing time without any change to the quality of the work.\n\nWhat to keep doing manually: anything involving a customer-specific decision, anything that will go into a system of record without further review, anything where your institution has not approved AI for that data class. The boundary is not that AI cannot help with these — it is that the controls required (sanitised inputs, documented review, approved tools) belong in later modules. Module 1 is about building the habit on the safe ground first.\n\n> A practitioner uses AI for the parts of the day that do not require judgment, and protects the parts of the day that do.\n\nThe artifact you build in this module is a rewritten email starter — your first piece of evidence that AI is reducing friction in your real work. Save it. The Module 11 prompt library will help you turn that one win into a reusable system.',
        tryThis: 'For the next three workdays, apply the five-minute rule to one task per day. Track which tasks AI improved and which it did not. The pattern is your starting prompt library.',
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
          'A large language model is a system trained to predict the next plausible piece of text given everything it has read so far. It is not a database, it is not a search engine, and it is not connected by default to your institution\'s files, your core system, or any customer record. What it does well is recognise patterns in how language is used and produce fluent, structured output that matches those patterns.\n\nThis matters because fluency is not the same as accuracy. An LLM can produce a paragraph that reads exactly like a regulatory bulletin, a credit memo, or an internal policy — and the paragraph can still be wrong about a date, a threshold, or a citation. The system does not "know" what is true; it knows what reliable text tends to look like.\n\n> A useful working definition: an LLM is a fluent intern with no institutional memory, no access to your systems, and a tendency to fill in gaps confidently when it does not know the answer.\n\nIn banking, this framing is more useful than any technical explanation. The intern is fast, well-read, and tireless, but the intern has not read your loan policy, has not seen the FFIEC bulletin issued last week, and cannot tell when its own answer is wrong. The banker\'s job is not to argue with the intern — it is to give the intern good source material when accuracy matters, and to verify the output before it leaves the building.',
        tryThis: 'In one paragraph, write your own working definition of an LLM in plain English. Avoid technical jargon. Test it on a colleague who has not used AI — if they have to ask follow-up questions, refine the definition until they do not.',
      },
      {
        title: 'How LLMs Actually Behave',
        content:
          'Three behaviours follow from the prediction-based design, and each one matters for safe use in banking.\n\n**LLMs sound certain even when guessing.** Output is produced one piece at a time, optimised for fluency. The model does not have an internal flag for "I am unsure." Confidence in tone is not evidence of accuracy.\n\n**LLMs default to plausibility, not truth.** When asked about a regulation, a vendor, or a specific document, the model may produce a plausible-sounding answer drawn from general patterns rather than the actual source. This is the mechanism behind most hallucinations.\n\n**LLMs reflect their training data.** Knowledge cutoffs apply. A model trained in 2024 does not know about a 2026 examination memo unless you provide it. Recency is not a strength of LLMs operating without retrieval.\n\n> The implication for community banking: never accept an LLM answer about a regulation, threshold, fee, or policy without checking the source. The model\'s confidence is independent of its accuracy.\n\nWhen a model says "Regulation X requires Y," it is a hypothesis, not a citation. The banker confirms the citation. When a model summarises a policy you did not paste, it is reconstructing from memory of similar policies. The banker confirms against the actual document. This is not extra work — it is the work.',
        tryThis: 'Ask AI a specific factual question about a regulation that affects your role (e.g., "What does ECOA require for adverse action notices?"). Compare the answer to the actual regulatory text. Note any wording, dates, or thresholds that drifted.',
      },
      {
        title: 'Hallucinations: The Four Failure Modes',
        content:
          'The AIEOG AI Lexicon (US Treasury, FBIIC, FSSCC; February 2026) defines a hallucination as an output that is factually incorrect, fabricated, or misleading, presented with apparent confidence. In banking practice, hallucinations cluster in four predictable places.\n\n**Numbers and thresholds.** Loan-to-value ratios, asset-size cutoffs, percentage thresholds, fee amounts. These are the most common hallucinations because they are easy for the model to "round" toward what looks plausible.\n\n**Dates and effective periods.** When a regulation took effect, when a comment period closes, when an examination cycle begins. Models hallucinate dates routinely, often by a year or two.\n\n**Names and citations.** Specific section numbers, named people, named vendors, court case citations. Models will produce plausible-looking but fabricated citations — sometimes for documents that do not exist.\n\n**Policy claims.** "Your institution\'s policy requires X" or "best practice in community banking is Y." Unless you provided the policy, the model is generalising from training data, not citing your institution.\n\n> The verification rule: any sentence in an AI output that contains a number, a date, a name, or a policy claim is a candidate for hallucination until you have checked it against the source.\n\nThis is not paranoia. It is the same standard you would apply to a draft prepared by a junior analyst — review the citations, verify the numbers, and confirm the policy references before signing your name to it.',
        tryThis: 'Take an AI-generated answer to a banking question. Highlight every sentence containing a number, date, name, or policy claim. Mark each one as Verified, Unverified, or Wrong after checking the source.',
      },
      {
        title: 'The Verification Habit',
        content:
          'A practitioner does not avoid AI to escape hallucinations — that gives up the productivity gain entirely. A practitioner builds a verification habit that takes seconds when the input is good and catches the failures that matter.\n\nThe habit has three parts.\n\nFirst, **provide source material when accuracy matters.** If you are summarising a regulation, paste the relevant section. If you are answering a policy question, paste the policy. The model is dramatically more accurate when it can ground its answer in text you provided than when it is reasoning from training data alone.\n\nSecond, **ask the model to flag uncertainty.** Good prompting includes phrases like "If a date is not in the source, say so" or "Mark any claim you are inferring rather than reading directly." The model will not always honour this, but it dramatically improves output quality when it does.\n\nThird, **review with the four failure modes in mind.** Numbers, dates, names, and policy claims get a second look every time. Everything else can be reviewed at normal pace.\n\n> Verification is not a brake on AI adoption. It is what separates professional AI use from amateur AI use.\n\nThe artifact you build in this module — an AI output review worksheet — codifies this habit. It becomes the checklist you use until verification is automatic, and it is the document you point to when an examiner or auditor asks how your team manages AI outputs.',
        tryThis: 'Take a 200-word AI-generated answer about a banking topic. Apply the four-failure-mode review. Record how long it took. After three or four passes, the habit becomes faster than reading the original document.',
      },
      {
        title: 'Why This Module Matters',
        content:
          'Most AI failures in community banking are not technical failures — they are governance failures rooted in a misunderstanding of what the tool is. A staff member treats an LLM like a search engine, accepts the answer at face value, and the wrong threshold ends up in a customer-facing document. The harm is real and the cause is preventable.\n\nUnderstanding LLMs in plain language is the foundation that every later module rests on. Module 3 (prompting strategy) presumes you understand why structure matters. Module 6 (file workflows) presumes you understand why source-grounded answers are different from open answers. Module 9 (SAFE) presumes you understand why pasting customer data into a system that learns from inputs is a categorically different decision than running a calculator.\n\n> The banker who can explain in plain English what an LLM is, and is not, is the banker who will use it safely under pressure.\n\nThe Module 2 takeaway is not technical depth. It is professional clarity. You should leave this module able to answer two questions in front of your team without notes: "What does this thing actually do?" and "Where does it go wrong, and how do we catch it?" The rest of AiBI-P teaches you how to act on those answers.',
        tryThis: 'Write a four-sentence explanation of LLMs and hallucinations that you could give to a sceptical board member or a new hire. Test it on someone who has not used AI. Refine until they understand on the first reading.',
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
        title: 'Six Ways You Actually Use AI at Work',
        content:
          'Most AI training treats "prompting" as a single skill — a clever phrase or magic formula that produces better output. In practice, bankers use AI for at least six distinct kinds of work, and each kind needs a different prompt shape. Recognising which kind of work you are doing is the difference between consistent results and random ones.\n\n**Structured prompts** produce something new from nothing — a first draft of an email, a memo, a job description, a meeting agenda. The shape names the role, the task, and the format the output should take.\n\n**Transformation prompts** change something that already exists — shortening, simplifying, restructuring, or adjusting tone. The shape provides the source text and the specific change requested.\n\n**Analysis prompts** examine something for a defined purpose — finding gaps in a policy, identifying questions a memo will raise, surfacing risks in a proposal. The shape provides the source and a clear analytic lens.\n\n**Thinking prompts** organise reasoning before action — laying out trade-offs, identifying objections, structuring an argument. The shape describes the situation and asks for structure, not output.\n\n**Template prompts** repeat a workflow consistently — the same task pattern applied to different inputs each week. The shape is reusable and parameterised.\n\n**Sanitisation prompts** prepare an input for safe use — stripping identifiers, generalising specifics, converting an account-level question into a pattern-level one. The shape is defensive by design.\n\n> If you cannot name which of the six you are doing, the prompt will be vague and the output will be uneven.',
        tryThis: 'List five AI tasks you have run in the last week. Label each one with which of the six prompt types it was. If a task does not fit any category cleanly, that is usually a sign the prompt was unfocused.',
      },
      {
        title: 'The Foundation Pattern: Role, Task, Context, Format, Constraints',
        content:
          'For structured prompts — the most common kind — there is a foundation pattern that works across every general-purpose AI tool. It has five elements, and the difference between a good prompt and a bad one is almost always one of these missing.\n\n**Role.** Tell the model who it is responding as. "You are an experienced commercial loan officer at a community bank." This calibrates vocabulary, level of detail, and assumed audience.\n\n**Task.** State precisely what you want produced. Not "help me with this email" but "rewrite this email in under 150 words, leading with the action and the deadline."\n\n**Context.** Provide the source material or background. The relevant policy excerpt, the customer category (without names), the institution\'s asset size if it matters, the audience. The model is dramatically better when it is grounded in context you provided.\n\n**Format.** Specify the structure of the output. Bullet points, prose, a table, a numbered list, a one-page memo. Models will infer format if you do not specify, and the inference is often wrong.\n\n**Constraints.** State what the output must not do. "Do not add facts not in the source." "Do not use marketing language." "Do not make policy claims." Constraints often improve output more than instructions do.\n\n> A good practitioner prompt is rarely shorter than three sentences and rarely longer than ten. Anything shorter is missing context; anything longer usually contains contradictions.',
        tryThis: 'Take a vague prompt you have used before — "summarise this" or "make this better" — and rebuild it using all five elements. Compare the outputs. The improvement is the case for the foundation pattern.',
      },
      {
        title: 'Prompting for Banking: The Constraints Layer',
        content:
          'In community banking, the constraints layer is where prompting becomes a governance practice rather than a productivity hack. Three constraints belong on almost every banker\'s prompt.\n\n**The no-fabrication constraint.** "Do not add facts that are not in the source. If a date, threshold, or citation is not provided, say so explicitly rather than guessing." This single instruction reduces the most common hallucination class — invented specifics — by a meaningful margin.\n\n**The no-policy-claims constraint.** "Do not state what the institution\'s policy is unless the policy text is provided. Do not assume best practice." Models will produce confident-sounding policy claims drawn from training data. This constraint forces them to flag rather than guess.\n\n**The plain-language constraint.** "Use plain banking language. Do not use marketing language or AI buzzwords. Avoid the word \'leverage.\'" Models trained on consultancy decks default to a register that sounds wrong in banking. The constraint pulls them back to your voice.\n\n> The constraints layer is the closest thing to institutional control you have over an LLM\'s output. It does not replace review, but it makes review faster and the output more usable on first pass.\n\nA reusable banking prompt template looks like this: a paragraph naming the role, the task, and the context; a bulleted format spec; three or four explicit constraints. Save it once. Reuse it for every similar task. Improve it when you notice a recurring failure mode.',
        tryThis: 'Build a constraints block for one of your most common AI tasks (email rewrites, meeting summaries, policy questions). Use the three banking constraints as a starting point and add two more specific to your role.',
      },
      {
        title: 'Transformation, Analysis, and Thinking Prompts',
        content:
          'The foundation pattern is for structured (new-output) prompts. The other three high-frequency prompt types each have their own shape.\n\n**Transformation prompts** start with a single instruction line and the source text. The instruction names the change — shorten, simplify, restructure, retone — with explicit constraints on what cannot change. "Shorten this to under 100 words. Do not change any number or date. Do not add information."\n\n**Analysis prompts** name the lens before the source. "Read the following draft policy and identify any place where a frontline staff member would not know what action to take." The output should be a list, not prose, and should reference specific lines in the source.\n\n**Thinking prompts** describe the situation in your own words and ask for structure, not output. "I need to deliver difficult feedback to a team lead about a missed deadline. The relationship is already strained. What are the three points I should make, and in what order?" The model returns structure; you write the actual message.\n\n> Pattern recognition is the practitioner skill. The prompt that works for an email rewrite is not the prompt that works for a policy gap analysis. Knowing the difference is most of the job.\n\nFor each of these patterns, the same banking constraints apply: no fabrication, no policy claims, plain language. The constraints stay; the body of the prompt changes with the task.',
        tryThis: 'Pick one task you do weekly. Write a structured prompt, a transformation prompt, and a thinking prompt for that task. Compare which one produces the most usable output. Save the winner.',
      },
      {
        title: 'Sanitisation: The Banking-Specific Prompt',
        content:
          'The sixth prompt type — sanitisation — does not exist outside regulated industries. It is the practice of converting a question that contains sensitive specifics into a question that contains only the reusable structure.\n\nA risky prompt: "Member John Smith called about his $250,000 HELOC application. He has a 720 FICO and his DTI is at 41%. The collateral property is at 1234 Main Street. Help me draft an adverse action notice."\n\nA sanitised prompt: "Help me draft a template adverse action notice for a HELOC application denial in a community bank context. The notice should reference DTI exceeding policy threshold and should comply with ECOA/Reg B specific-reason requirements. Do not include any fictional borrower details."\n\nThe second prompt produces a better output than the first, because the model is not distracted by the specifics that do not affect the structure of an adverse action notice. More importantly, the second prompt does not paste a customer\'s name, FICO score, debt ratio, address, and loan amount into a tool that may retain those inputs.\n\n> Sanitisation is not a workaround for safety — it is the safe pattern. The structure you need from AI almost never requires the specifics you would be at risk for sharing.\n\nThe artifact for this module is a prompt strategy cheat sheet — your six prompt types with one banking-credible example each. It becomes the page you keep open while building the Module 11 personal prompt library.',
        tryThis: 'Take the last prompt you wrote that contained any specific customer or account detail. Rewrite it as a sanitised version. Compare the outputs. If the sanitised version is meaningfully worse, identify which specific is structurally needed — and which were just noise.',
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
        title: 'Why a Work Profile Matters',
        content:
          'By Module 4, most learners have noticed a pattern: every productive AI interaction starts with a paragraph or two of context. "I am a commercial loan officer at a community bank with $400M in assets. I am writing to a small-business borrower about their renewal. The tone should be direct but warm." Without this paragraph, the output is generic. With it, the output is usable.\n\nThe inefficiency is obvious — typing the same context paragraph fifteen times a week is time you do not get back. The work profile solves this by capturing the reusable parts once. Role, institution context, audiences, voice preferences, recurring tasks, and review expectations live in one place and get pasted at the start of any new conversation.\n\n> A good work profile cuts the setup tax on every AI interaction. It is the single highest-leverage artefact in AiBI-P.\n\nThe profile is not a configuration file in any technical sense — it is a markdown document, kept in a notes app or a private folder, that you copy and paste at the start of relevant sessions. Some tools (custom GPTs, Claude Projects, Copilot) let you save it as persistent context. Most of the time, copy-and-paste is sufficient and avoids any vendor-specific lock-in.\n\nThe profile is also a governance document. When an examiner asks how a staff member uses AI consistently and safely, the profile is the answer. It demonstrates intent, repeatable practice, and an explicit boundary between what AI can and cannot help with for that role.',
        tryThis: 'Open a blank document. Without thinking too hard, draft three paragraphs: who you are professionally, what audiences you write for, and what kinds of work you do most often. This rough draft is the start of your work profile.',
      },
      {
        title: 'The Six Sections of a Useful Profile',
        content:
          'A work profile that performs well across tools tends to have six sections. Length matters less than coverage — a tight one-page profile beats a sprawling four-page one.\n\n**Role and institution context.** Title, function, asset size of the institution, geography, customer mix at a high level. Not the institution name. "Senior credit analyst, $600M community bank, primarily small business and CRE lending in the upper Midwest."\n\n**Audiences I write for.** Branch staff, board members, regulators, peer institutions, retail customers, business customers. Each audience has a different register, and the profile names the registers.\n\n**Voice and tone preferences.** Plain banking language. Direct. No marketing register. No exclamations. Use active voice. Do not say "leverage." Specific dislikes are more useful than generic principles.\n\n**Recurring work.** Five to ten tasks you do regularly — credit memo first drafts, board summaries, customer apology letters, internal policy questions, meeting prep. The model uses this list to calibrate its responses.\n\n**Review expectations.** What you will check before sending and what level of polish you expect. "I will fact-check every number, citation, and policy claim. Drafts can be 80% polished — I will tighten the rest." This sets useful expectations on both sides.\n\n**Do-not rules.** The boundary list — covered in the next section.\n\n> The profile is the most-used document in your AI practice. It earns the time you spend refining it.',
        tryThis: 'Use the six sections as headers and fill in three to five sentences under each. Do not aim for perfection. The profile improves with use, not with planning.',
      },
      {
        title: 'The Do-Not Rules',
        content:
          'The do-not rules are the most important part of the profile because they encode the banking-specific risk boundary into every interaction. Without them, the model defaults to being maximally helpful — including in ways that are not safe in a regulated context.\n\nFive do-not rules belong in nearly every banker\'s profile.\n\n**Do not add facts that I did not provide.** This is the no-fabrication rule, hardened into persistent context. The model will still hallucinate, but it hallucinates less when this rule is restated each session.\n\n**Do not make policy claims about my institution.** "Your bank requires X" or "your policy states Y" — both invalid unless I provided the policy. Generalisations from training data do not represent my institution.\n\n**Do not draft customer-facing decisions on my behalf.** Approvals, denials, adverse actions, fee waivers. The model can draft template language; it does not decide outcomes.\n\n**Do not use marketing language or AI buzzwords.** "Cutting-edge," "transformative," "leverage," "synergy." If a banker would not use the word at a board meeting, the model should not use it in a draft.\n\n**Do not paste my role context into the body of any output.** The profile is for AI to read, not for the AI to recite back to me in every response.\n\n> Do-not rules are governance encoded as prompt context. They do not replace institutional policy, but they make institutional policy operational at the point of use.\n\nA practitioner adds do-not rules when patterns emerge. If the model keeps doing something unhelpful, the fix is usually a new do-not rule rather than a new instruction.',
        tryThis: 'Run an AI session for thirty minutes without your profile. Note every output that disappointed you. Convert each disappointment into a do-not rule. Add the rules to your profile and run the same session again.',
      },
      {
        title: 'Sanitisation Inside the Profile',
        content:
          'A profile is a context document, not a confession. It should describe your role, your audiences, and your recurring work without containing anything sensitive enough to create exposure if the document were screenshotted, leaked, or fed to a tool you later regretted using.\n\nThe sanitisation discipline has four rules.\n\n**No customer specifics.** No names, no account numbers, no loan amounts tied to identifiable borrowers. If a recurring task pattern needs an example, use a generalised one ("a small business borrower applying for a working-capital line of $250K-$500K") rather than a real one.\n\n**No employee specifics.** No colleague names, no organisational chart, no internal politics. The profile is about your role, not your peers.\n\n**No proprietary processes.** A description of "I write credit memos" is fine. A copy of the institution\'s credit memo template, internal scoring grid, or override authority matrix is not.\n\n**No vendor secrets.** Names of approved vendors are usually fine. Pricing terms, contract language, vendor risk findings are not.\n\n> The profile should be a document you would be comfortable sharing with a peer practitioner at another institution. If it is not, the sensitive parts do not belong in it.\n\nThe profile is also a portable artefact. A practitioner who changes institutions takes their profile with them, edits the role and institution-context sections, and retains the voice, audiences, recurring work, and do-not rules. This portability is by design — the profile encodes professional practice, not institutional secrets.',
        tryThis: 'Read your draft profile through the lens of "what if this leaked." Mark every line that makes you uncomfortable. Rewrite each marked line at one level of abstraction higher. The profile becomes more reusable in the process.',
      },
      {
        title: 'Maintaining the Profile',
        content:
          'A work profile is a living document. The first draft is always too generic; the third or fourth iteration is when it becomes genuinely useful. The discipline is small: when something in an AI session works particularly well, capture what made it work; when something fails repeatedly, add a do-not rule.\n\nThree maintenance habits sustain the profile.\n\n**Weekly tune-up.** Five minutes at the end of the week reviewing recent AI sessions. Add a recurring task you noticed. Sharpen a voice preference. Retire a do-not rule that is no longer needed.\n\n**Quarterly review.** Read the whole profile end-to-end. Cut anything that is not pulling its weight. Profile bloat — long lists of tasks you no longer do, vague preferences, redundant rules — degrades performance.\n\n**Versioning.** Keep the previous version when you make a major edit. If the new version performs worse, revert. AI profiles, like any working document, sometimes get worse before they get better.\n\n> The Module 4 artefact — your AI work profile — is the single most reused document in your practitioner kit. Treat it accordingly.\n\nPractitioners who maintain a sharp profile typically save a measurable amount of setup time per AI session — often the difference between using AI on five tasks per week and using it on twenty. The profile compounds. The practitioners who treat it casually never get the compounding benefit.',
        tryThis: 'Set a recurring 15-minute calendar block on Friday afternoons labelled "Profile tune-up." For four weeks, use the time to refine your profile. After a month, evaluate whether the practice is producing measurable results.',
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
        title: 'From Conversations to Projects',
        content:
          'A work profile (Module 4) gives AI persistent context about you. A project brief is the next layer up — persistent context about a specific piece of work that will involve many AI interactions over days or weeks. The shift matters because most banking work is project-shaped, not task-shaped. A board memo is not one prompt; it is fifteen prompts over a week, all touching the same audience, the same source material, and the same constraints.\n\nWithout a project brief, every prompt in that week starts from zero. The audience has to be re-described, the source material re-summarised, the constraints re-stated. Output drifts because the model is reasoning from a slightly different context each time.\n\n> A project brief stabilises a multi-day workstream. It is the difference between a series of disconnected outputs and a coherent body of work.\n\nProject briefs apply to anything that meets three criteria: it will involve more than three AI sessions, it has a defined audience or output, and it shares source material across sessions. Examples: drafting a board package, building a customer communications campaign, summarising a long document for distribution, preparing for an upcoming examination, planning a launch of a new product or service.\n\nThe artefact for this module is a project brief template. Once written, it becomes the page you copy at the start of every new project — the equivalent of a kickoff document for the work you will do with AI assistance.',
        tryThis: 'List three pieces of work in your queue right now that will take more than a week and involve writing or summarising. Each one is a candidate for a project brief.',
      },
      {
        title: 'The Five Sections of a Project Brief',
        content:
          'A useful project brief has five sections. As with the work profile, length matters less than coverage.\n\n**Goal.** What success looks like at the end of the project. "A four-page board memo summarising the Q3 results, the strategic implications, and three options for the credit committee to consider." Specific. Measurable. Time-bounded.\n\n**Audience.** Who will read or hear the output, and what they need from it. "Board of directors, mostly non-bankers with deep institutional knowledge of our market. They want strategic implications, not operational detail. Reading time should be under 10 minutes."\n\n**Source material.** The documents, data, or context the project will draw on. Include sanitised summaries inline rather than full copies of sensitive material. "Q3 financial results (attached, sanitised summary). The strategic plan adopted in March (attached, public version). Recent FDIC peer data on community bank performance (attached)."\n\n**Constraints.** What the output must not do. "Do not name specific customers. Do not include unsourced statistics. Do not use forward-looking statements that could be construed as guidance. Do not exceed four pages."\n\n**Format.** Specific structure for the deliverable. "Section 1: Q3 results summary (one page). Section 2: Strategic implications (one page). Section 3: Three options for credit committee, each with risks and benefits (two pages)."\n\n> A complete brief is two to three pages. It feels like overhead the first time and saves hours by the third.',
        tryThis: 'Pick one project from your earlier list. Spend 30 minutes writing the five sections. Use the brief on your next AI session for that project and note the difference in output quality.',
      },
      {
        title: 'Sanitisation in Project Context',
        content:
          'A project brief poses a different sanitisation challenge from the work profile. The profile describes who you are; the brief describes a specific piece of work, which often involves specific data. The discipline is to extract the structural information AI needs without exposing the sensitive specifics.\n\nThree sanitisation techniques apply to project briefs.\n\n**Generalisation.** Instead of "Customer ABC Manufacturing has applied for a $2.4M working capital line of credit," use "A mid-market commercial customer has applied for a working capital facility in the $2-3M range." The structural facts the model needs (size class, product type) are preserved; the identifying specifics are removed.\n\n**Pattern abstraction.** Instead of pasting a real loan tape, describe the pattern. "The portfolio segment includes approximately 50 commercial real estate loans, primarily owner-occupied, with average LTVs in the 65-75% range and a weighted-average DSCR of 1.35x." The model can reason about the pattern without seeing borrower-level data.\n\n**Document excerpting.** When source material is too sensitive to paste, paste only the relevant excerpt with sanitisation applied. A board memo summary does not require the full board package — it requires the structural elements (financial highlights, strategic context, decisions pending) summarised in a form AI can use.\n\n> If the brief contains anything you would not be comfortable seeing on a screenshot, the brief is not yet sanitised.\n\nA practitioner gets faster at sanitisation with practice. The first brief takes an hour. The fifth brief takes fifteen minutes. The pattern recognition transfers across projects.',
        tryThis: 'Take a real project brief draft you wrote in the previous exercise. Apply each sanitisation technique to one section. Note which technique was hardest to apply — that is your weak spot to develop.',
      },
      {
        title: 'Using the Brief Across a Project',
        content:
          'A project brief is not a document you write once and file. It is the opening context of every AI session for that project, and it gets refined as the project progresses.\n\nThe pattern is straightforward.\n\n**Start every session with the brief.** Paste the full brief at the top of any new conversation about the project. The model uses it to calibrate every response. This adds 10-15 seconds to session setup and removes 10-15 minutes of misaligned outputs.\n\n**Update the brief when scope changes.** When the audience shifts, when a constraint is added, when the format changes — update the brief and use the new version going forward. Old versions are archived, not edited in place.\n\n**Add interim findings as you go.** As the project progresses, you accumulate context that future prompts will need. "Decision: the board package will use the comparative format from the March meeting, not the narrative format used in June." These additions belong in the brief.\n\n**End the project by archiving the final brief.** When the project is complete, save the final version of the brief alongside the deliverable. The next time a similar project comes around, the brief is the starting point.\n\n> Project briefs compound across a year of work. The third board package is dramatically faster than the first because the brief format is reusable, the sanitisation patterns are reusable, and the practitioner has internalised what good context looks like.',
        tryThis: 'Pick one project that has run for at least a week. Write a backwards-engineered project brief — what the brief should have said at the start, given what you now know. Use that brief on the next similar project.',
      },
      {
        title: 'When Not to Use a Project Brief',
        content:
          'Not every piece of work needs a project brief. Overusing the pattern creates more friction than it solves. Three categories of work belong in a quicker, lighter mode.\n\n**One-off tasks under thirty minutes.** A single email rewrite, a single summary, a single internal question. The setup cost of a brief exceeds the benefit. Use the work profile context and a structured prompt; do not write a brief.\n\n**Highly sensitive workstreams.** Some work — loan-specific decisions, employee matters, examination response drafts, board confidential items — should not move into AI tooling at all, no matter how thorough the sanitisation. The brief discipline is irrelevant if the underlying work cannot be in scope.\n\n**Exploratory work.** When you are not yet sure what the project will become, a brief is premature. Use loose AI sessions to explore. Once the shape of the work is clear, write the brief and move into project mode.\n\n> Project briefs serve sustained, defined, in-scope work. For everything else, the work profile and a good structured prompt are sufficient.\n\nThe practitioner judgment is recognising which mode a piece of work belongs in. AiBI-P does not give a formula for the choice — it gives the patterns and trusts the practitioner to apply judgment. That judgment is the credential.',
        tryThis: 'For each item in your current task list, label whether it is project-shaped (use a brief), task-shaped (use the profile), exploratory (no brief yet), or out of scope for AI (no AI). The labels make the next week\'s work patterns visible.',
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
        title: 'Why Files Change Everything',
        content:
          'Through Module 5, every AI interaction has been built on text typed into a prompt or pasted from a clipboard. Files change the pattern. When AI can read a 30-page policy document, a 50-row spreadsheet, or a transcribed regulator meeting, the work it can credibly support changes — and so does the risk.\n\nThe productivity gain is real. A practitioner can ask AI to summarise an approved procedure document, compare two versions of a policy, extract action items from a meeting transcript, or reorganise a long memo into a board-friendly structure. These are tasks that previously took hours and now take minutes when the source material is already digital.\n\nThe risk is also real. The data class question — "is this approved for AI use" — gets harder when files are involved, because files often contain mixed-classification content. A board memo summary is fine to summarise; the borrower-level appendix to that memo is not. A frontline procedure document is approved; the embedded fraud detection thresholds are highly sensitive.\n\n> File workflows are powerful, but they expand the surface area for accidental over-disclosure. The practitioner discipline is to know what is in the file before it goes anywhere.\n\nThis module focuses on the safe pattern: source-grounded prompts on documents that have been classified for AI use, with explicit verification that the AI is summarising what is actually in the document rather than inferring from training data.',
        tryThis: 'List five document types you handle weekly. For each, mark the data classification: green (definitely safe for AI), yellow (mixed — depends on tool and context), red (not for AI). The yellow items are where most practitioner judgment lives.',
      },
      {
        title: 'Source-Grounded Prompting',
        content:
          'The single most important pattern for file-based AI work is source-grounded prompting — explicitly instructing the model to draw only from the provided source, not from training data, and to flag anything it cannot find in the source.\n\nA source-grounded prompt has three elements.\n\n**An anchoring instruction.** "The following document is the source. Answer using only what is in this document. If something is not in the document, say so explicitly rather than inferring."\n\n**The source content.** Pasted in full when length permits, or attached if the tool supports file uploads. The relevant context is the document itself; you do not need to summarise it for the model first.\n\n**A specific question or task.** Vague tasks ("summarise this") produce vague outputs. Specific tasks ("list the three required actions for branch staff in priority order, with the page reference for each") produce verifiable outputs.\n\n> The verification is built into the pattern. If the output references a page, you can check the page. If the output flags something as not in the source, you know to look elsewhere.\n\nWithout source-grounding, the model fills in gaps from training data — and you cannot tell which sentences came from the document and which came from the model\'s memory of similar documents. The output reads identically. The accuracy is dramatically different.',
        tryThis: 'Take an approved internal procedure document. Write a source-grounded prompt asking for the three actions a frontline staff member must take, with page references. Verify that each cited page actually contains the cited action.',
      },
      {
        title: 'The Three High-Value File Workflows',
        content:
          'Three file-based workflows produce most of the practitioner value in community banking.\n\n**Summarisation with source flags.** Long documents — board memos, regulatory bulletins, vendor proposals, peer review reports — turned into a half-page summary with explicit references. The format includes a "where ambiguity exists" section so the practitioner knows where to read the original.\n\n**Side-by-side comparison.** Two versions of a policy, two competing vendor proposals, a draft and a previous-year version of the same document. The model produces a structured comparison: what is the same, what changed, what is new, what was removed. The practitioner verifies each material change against the source.\n\n**Targeted extraction.** Pulling specific information out of a long document — every deadline mentioned, every reference to a regulation, every numerical threshold, every action assigned to a named role. The model produces a list; the practitioner verifies completeness against the source.\n\n> These three workflows cover most of what practitioners need from file-based AI. Mastering them is more useful than learning every advanced feature of every tool.\n\nEach workflow has the same review pattern: produce the output with source references, verify the references, treat anything without a reference as a candidate hallucination. The pattern works across tools and across document types.',
        tryThis: 'Pick one document type from your weekly work. Run all three workflows (summary, comparison if you have two versions, extraction) on the same document. Note which workflow produced the most useful result for that document type — that is your default workflow for that document going forward.',
      },
      {
        title: 'Tool Choice for File Workflows',
        content:
          'Not every AI tool handles files the same way, and the differences matter for safe practice. Module 7 covers tool selection in depth; for file workflows specifically, three categories matter.\n\n**General chat tools with file upload (ChatGPT, Claude).** Strong on summarisation and analysis. The file is processed within the session. Check the tool\'s data retention policy before uploading anything beyond green-zone material.\n\n**Workplace copilots (Microsoft Copilot, Google Workspace AI).** Operate inside the institution\'s approved productivity environment. Files already inside the tenant are typically lower risk to surface. The tool inherits the institution\'s data governance posture, which is a meaningful safety advantage for yellow-zone material.\n\n**Notebook-style tools (NotebookLM, Claude Projects).** Designed specifically for source-grounded work across multiple documents. The user defines the source set, and the tool answers only from that set. This is the strongest pattern for repeated work on the same body of source material.\n\n> Tool capability does not equal institutional approval. The AI feature in your productivity suite is not safe to use simply because IT enabled it — confirm with compliance which data classes are approved for which tools.\n\nThe institutional approval question is asked once per tool, not once per use case. If your institution has approved Copilot for documents in your team\'s SharePoint, you do not re-ask the question for every file. If your institution has not approved a consumer chat tool for any internal document, no clever sanitisation makes that decision for you.',
        tryThis: 'Find your institution\'s most recent AI tool approval list (or ask compliance for it). For each tool listed, note which document classes are approved. If the list does not exist or is unclear, that gap is a Module 9 follow-up item.',
      },
      {
        title: 'Verification, Not Trust',
        content:
          'The Module 6 takeaway is the same as the Module 2 takeaway, refined for file workflows: AI summaries of documents must be verified against the source for any claim that matters. The mechanics of verification change with files because the source is longer, but the discipline does not.\n\nThree verification habits sustain safe file work.\n\n**Spot-check the cited references.** When the AI summary references a page, paragraph, or section, open the source and confirm the reference exists and says what the summary claims. Do this on at least three references per document, more for high-stakes summaries.\n\n**Test the "not in source" claims.** When the AI flags something as missing from the document, search the document yourself for the term. Models sometimes mistake structure for absence — a deadline mentioned in a footnote may be flagged as "not specified" when it is actually present.\n\n**Verify the structural shape.** If the document has 12 sections and the summary covers 8, ask why 4 were excluded. Sometimes the omission is appropriate (the four were irrelevant); sometimes it is a hallucination of relevance.\n\n> The artefact for this module is a document workflow prompt — your reusable template for source-grounded file work. The verification habits are not separate from the prompt; they are the second half of the workflow, every time.\n\nA practitioner who treats file outputs as drafts rather than answers preserves the productivity gain (the time saved on first-pass reading) without inheriting the risk (acting on an unverified summary). That balance is the practitioner standard.',
        tryThis: 'Take an AI summary of a document you have read end-to-end. Apply each verification habit. Track the time spent. The verification cost is your real-world AI overhead, and most practitioners find it dramatically lower than re-reading the document.',
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
