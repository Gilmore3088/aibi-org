// Drafted email bodies for the 5 MailerLite Automations.
//
// One newsletter welcome (single email) plus four tier sequences (3
// emails each = 12 emails). All copy follows the Institute's voice rules
// from CLAUDE.md: full name "The AI Banking Institute" in prose, AiBI
// only for credentials and the seal, sourced statistics only, no
// "AI-powered" buzzwords, DM Mono numbers via inline span where
// emphasis matters, no emoji, no gradients, no rounded buttons >4px.
//
// Style decisions documented after the 2026-05-08 every-style-editor
// audit:
//   1. Subject lines are the headline (full Every title-case treatment
//      may be applied if desired). H1s inside the body are subheads —
//      sentence case, no terminal period.
//   2. Em dashes carry no surrounding spaces ("X—Y", never "X — Y").
//   3. <strong> is reserved for visual labels (table cells, bullet
//      lead-ins). It is NOT used for emphasis in running prose; the
//      Every guide reserves emphasis for italics.
//   4. Percentages stay in DM Mono spans (e.g. <span ...>55%</span>).
//      This conflicts with Every's "X percent" rule but matches the
//      brand's "DM Mono for ALL numbers" rule, which takes precedence
//      inside the Institute's own materials.
//   5. Quoted strings inside copy use double quotes ("); single quotes
//      are reserved for quotes within quotes.
//   6. No semicolons in email copy (Every hard rule).
//
// The HTML uses minimal inline styles compatible with MailerLite's
// editor. The dashboard editor will let an operator polish typography
// and brand colors before activation. Automations are created PAUSED;
// nothing sends until manually flipped on.

export interface EmailDraft {
  readonly subject: string;
  readonly preheader: string;
  readonly html: string;
}

export interface AutomationDraft {
  readonly name: string;
  readonly groupEnvKey: string;
  readonly emails: readonly EmailDraft[];
  readonly delaysDays: readonly number[]; // delay BEFORE each email (so first is 0)
}

const SIGNATURE = `
<p style="margin:32px 0 0 0;color:#1e1a14;line-height:1.6;">
James Gilmore<br/>
Founder, <em>The AI Banking Institute</em><br/>
<a href="https://aibankinginstitute.com" style="color:#b5512e;">aibankinginstitute.com</a>
</p>
`;

const FOOTER = `
<hr style="border:none;border-top:1px solid #e6dfd1;margin:40px 0 16px 0;"/>
<p style="margin:0;color:#6b6357;font-size:13px;line-height:1.5;">
The AI Banking Institute &middot; Built for community banks and credit unions.<br/>
You are receiving this because you completed our AI readiness assessment or
subscribed to the AI Banking Brief. <a href="{$unsubscribe}" style="color:#6b6357;">Unsubscribe</a>.
</p>
`;

const wrap = (body: string): string => `
<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#1e1a14;line-height:1.65;max-width:600px;margin:0 auto;padding:24px;background:#f9f6f0;">
${body}
${SIGNATURE}
${FOOTER}
</div>`;

// =====================================================================
// Newsletter — AI Banking Brief welcome (single email, sent on signup)
// =====================================================================

// Welcome email v3 — author-direct, menu-of-three structure, reply-back ask.
// Diverges intentionally from the wrap() helper because the design is more
// open (no big H1, no boxed CTA button, conversational opening). Kept as
// a single inline-styled HTML string so paste-into-MailerLite still works.
export const NEWSLETTER_WELCOME: EmailDraft = {
  subject: 'Welcome to The AI Banking Institute',
  preheader: 'Three paths inside, in case any of them fits where you are right now.',
  html: `
<div style="font-family:'DM Sans',Helvetica,Arial,sans-serif;color:#1e1a14;line-height:1.7;max-width:600px;margin:0 auto;padding:32px 24px;background:#f9f6f0;">

<p style="margin-top:0;">Thanks for signing up.</p>

<p>AiBI's premise &mdash; <em>we turn your bankers into your builders</em> &mdash; runs through everything we make. The brief is one piece of that. Three more, in case any of them fits where you are right now:</p>

<div style="margin:28px 0;padding:20px 0;border-top:1px solid #e6dfd1;">
  <p style="margin:0 0 8px 0;"><strong style="font-size:17px;">The AI Readiness Assessment</strong></p>
  <p style="margin:0 0 12px 0;">Twelve questions, three minutes, no cost. You'll get a sourced one-page result you can bring to your next leadership meeting &mdash; useful whether you're starting from zero or validating what your team already thinks.</p>
  <p style="margin:0;"><a href="https://aibankinginstitute.com/assessment/start" style="color:#b5512e;text-decoration:none;font-weight:500;">Take the assessment &rarr;</a></p>
</div>

<div style="margin:0 0 28px 0;padding:20px 0;border-top:1px solid #e6dfd1;">
  <p style="margin:0 0 8px 0;"><strong style="font-size:17px;">The AiBI Practitioner Course</strong></p>
  <p style="margin:0 0 12px 0;">For institutions that have decided AI capability needs to live inside the team, not be rented from vendors. Built around four pillars &mdash; awareness, understanding, creation, application &mdash; with a margin-of-error framework so your bankers know when to trust the output and when to push back.</p>
  <p style="margin:0;"><a href="https://aibankinginstitute.com/practitioner" style="color:#b5512e;text-decoration:none;font-weight:500;">See the curriculum &rarr;</a></p>
</div>

<div style="margin:0 0 28px 0;padding:20px 0;border-top:1px solid #e6dfd1;border-bottom:1px solid #e6dfd1;">
  <p style="margin:0 0 8px 0;"><strong style="font-size:17px;">AiBI Consulting</strong></p>
  <p style="margin:0 0 12px 0;">Direct work on a specific decision in front of you &mdash; a vendor evaluation, a pilot scope, a board memo, an internal AI policy. Not a generic engagement; a defined deliverable.</p>
  <p style="margin:0;"><a href="https://aibankinginstitute.com/consulting" style="color:#b5512e;text-decoration:none;font-weight:500;">Talk to us &rarr;</a></p>
</div>

<p>One favor before the first issue lands: hit reply and tell me the single AI question you most want answered in the next 90 days. I read every reply, and yours will shape what runs.</p>

<p style="margin:32px 0 0 0;line-height:1.6;">
&mdash; James<br/>
<span style="color:#6b6357;font-size:14px;">James Gilmore, Founder &middot; <a href="https://aibankinginstitute.com" style="color:#b5512e;">The AI Banking Institute</a></span>
</p>

<hr style="border:none;border-top:1px solid #e6dfd1;margin:40px 0 16px 0;"/>
<p style="margin:0;color:#6b6357;font-size:13px;line-height:1.5;">
You are receiving this because you completed our AI readiness assessment or subscribed to the AI Banking Brief. <a href="{$unsubscribe}" style="color:#6b6357;">Unsubscribe</a>.
</p>

</div>`,
};

// =====================================================================
// Tier 1 — Starting Point (score 12-20)
// Posture: orientation, reduce overwhelm, build a use-case inventory
// =====================================================================

const STARTING_POINT_EMAILS: readonly EmailDraft[] = [
  {
    subject: 'Your assessment result: Starting Point — and what to do this week',
    preheader: 'You are not behind. You are at a starting line that 4 in 10 community banks share.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;margin:0 0 16px 0;">
You scored Starting Point. Here is what that means
</h1>
<p>Starting Point is the band where most community banks and credit unions
sit today. Per Gartner Peer Community data <em>(via Jack Henry, 2025)</em>:</p>
<ul style="padding-left:20px;">
  <li><span style="font-family:'DM Mono',monospace;">55%</span> of FIs have no AI governance framework yet</li>
  <li><span style="font-family:'DM Mono',monospace;">57%</span> report AI skill gaps at the team level</li>
  <li><span style="font-family:'DM Mono',monospace;">48%</span> say leadership lacks clarity on business impact</li>
</ul>
<p>You are not late. You are early—which is the right time to be
deliberate about the next move.</p>
<h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;margin:32px 0 12px 0;">The single move for week one</h2>
<p><strong>Build a one-page AI use-case registry.</strong> Send one question
to every department head: <em>"Are you, or anyone on your team, using any
AI tool—paid or free, sanctioned or not—for work? List what, who, and
how often."</em></p>
<p>You cannot govern what you cannot see. The AIEOG AI Lexicon
<em>(US Treasury, FBIIC, and FSSCC, February 2026)</em> explicitly names an
"AI use case inventory" as a baseline expectation. Building it before an
exam is easier than building it during one.</p>
<p>Your full results page (with the starter artifact for your lowest-scoring
dimension) is here:</p>
<p><a href="https://aibankinginstitute.com/results" style="color:#b5512e;font-weight:500;">View your full results &rarr;</a></p>
`),
  },
  {
    subject: 'A 60-minute pilot you can run this week (no vendor required)',
    preheader: 'One person. One hour. One real piece of bank work.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
The cheapest pilot in banking
</h1>
<p>If your team is at Starting Point, the temptation is to plan a strategy
session. Resist it. The fastest path to grounded leadership conversation
is one banker, one hour, one piece of real work.</p>
<p>Pick one of the following. Each works on free-tier ChatGPT or Claude.
Each uses zero customer PII.</p>
<ol style="padding-left:20px;">
  <li><strong>Summarize a credit memo.</strong> Paste a non-PII redacted
      memo, ask for a 200-word executive summary plus three risk flags.</li>
  <li><strong>Draft a procedure update.</strong> Paste an old procedure,
      ask for a redline that aligns it to current FFIEC guidance language.</li>
  <li><strong>Compare two vendor proposals.</strong> Paste both, ask for
      a side-by-side decision matrix on cost, integration, and exit clauses.</li>
</ol>
<p>The goal is not the output. The goal is what the banker says afterward:
<em>"Where else could this save us 20 minutes?"</em> That sentence is
how adoption starts.</p>
<h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:20px;margin:28px 0 12px 0;">A 30-minute Executive Briefing</h2>
<p>If you want a structured walkthrough of where your institution should
focus first, the Executive Briefing is free and runs 30 minutes:</p>
<p><a href="https://aibankinginstitute.com/for-institutions" style="color:#b5512e;font-weight:500;">Book an Executive Briefing &rarr;</a></p>
`),
  },
  {
    subject: 'How most community banks plan to fund AI in 2026',
    preheader: 'Bank Director 2024 Tech Survey, Gartner Peer Community, FDIC data.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
The sourced picture of community-bank AI spend
</h1>
<p>If you are presenting an AI plan to your board, the three numbers
worth memorizing are these:</p>
<ul style="padding-left:20px;">
  <li><span style="font-family:'DM Mono',monospace;">66%</span> of banks
      are discussing AI budget allocation
      <em>(Bank Director 2024 Technology Survey, via Jack Henry)</em></li>
  <li><span style="font-family:'DM Mono',monospace;">~65%</span> is the
      median efficiency ratio for community banks
      <em>(FDIC CEIC data, 1992–2025)</em></li>
  <li><span style="font-family:'DM Mono',monospace;">~55.7%</span> is the
      industry-wide efficiency ratio <em>(FDIC Quarterly Banking Profile,
      fourth quarter of 2024)</em></li>
</ul>
<p>The gap between <span style="font-family:'DM Mono',monospace;">~65%</span>
and <span style="font-family:'DM Mono',monospace;">55.7%</span> is the
prize. Closing it does not require an AI moonshot. It requires turning
a few back-office workflows from manual into machine-assisted, with a
human in the loop on every output.</p>
<p>If your team is ready to put a structured plan against that gap, our
Practitioner credential is the most direct path:</p>
<p><a href="https://aibankinginstitute.com/courses/aibi-p" style="color:#b5512e;font-weight:500;">AiBI-Practitioner &rarr; $295</a></p>
<p>Twelve hours. Self-paced. Designed for the banker, not the data scientist.</p>
`),
  },
];

// =====================================================================
// Tier 2 — Early Stage (score 21-29)
// Posture: focus, structure, inventory + one sanctioned tool
// =====================================================================

const EARLY_STAGE_EMAILS: readonly EmailDraft[] = [
  {
    subject: 'Your assessment result: Early Stage — and the one decision that matters',
    preheader: 'You have started. The next move is choosing one tool to standardize on.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;margin:0 0 16px 0;">
You scored Early Stage. The next move is convergence
</h1>
<p>Early Stage means experimentation is happening—usually informally,
often without governance. The risk at this band is not too little
activity. It is sprawl: ten people using ten different tools, none of
them sanctioned, none of them documented.</p>
<p>The single most valuable decision you can make in the next 30 days:
<strong>pick one general-purpose AI tool and standardize on it across
the institution.</strong></p>
<h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;margin:28px 0 12px 0;">What to evaluate</h2>
<p>For most community banks, the decision is between Microsoft 365 Copilot
(if you already run M365) and ChatGPT Enterprise or Claude for Work
(if you do not). Three criteria, in order:</p>
<ol style="padding-left:20px;">
  <li><strong>Data residency and training opt-out.</strong> Your provider
      must contractually exclude your prompts from model training.
      SS&amp;C's 2025 hybrid-cloud guidance is explicit: PII never goes
      into public LLMs.</li>
  <li><strong>SSO and audit log.</strong> Every prompt should be tied
      to a named user. This is what an examiner asks for first.</li>
  <li><strong>Integration with existing workflow.</strong> Pick the tool
      your bankers will open. The best tool is the one they use. The
      second-best one collects dust.</li>
</ol>
<p>Your full results page (with the starter artifact for your lowest-scoring
dimension) is here:</p>
<p><a href="https://aibankinginstitute.com/results" style="color:#b5512e;font-weight:500;">View your full results &rarr;</a></p>
`),
  },
  {
    subject: 'The governance memo every Early Stage bank needs (one page)',
    preheader: 'A template you can adapt in 60 minutes, not 60 days.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
A one-page AI governance memo
</h1>
<p>You do not need a 40-page AI policy. You need a one-page memo that
your board can read, your compliance officer can defend, and your
front-line bankers will remember.</p>
<p>The shape:</p>
<ul style="padding-left:20px;">
  <li><strong>What is allowed.</strong> Sanctioned tool or tools, with
      named data classifications (e.g. "public information only",
      "internal non-PII", "do not paste customer PII into any AI tool,
      ever").</li>
  <li><strong>Who owns oversight.</strong> One named person (often the
      CIO or CRO) is the AI accountable executive. Not a committee.</li>
  <li><strong>How exceptions get approved.</strong> Single-page request
      form, one approver, 5-day SLA.</li>
  <li><strong>What gets logged.</strong> Every use case enters the
      use-case inventory before going live. The AIEOG AI Lexicon's
      "AI use case inventory" expectation maps to this.</li>
</ul>
<p>The relevant regulatory anchors are SR 11-7 (model risk management),
the Interagency TPRM Guidance (third-party risk), ECOA/Reg B (fair
lending if any AI touches credit), and the AIEOG AI Lexicon
<em>(US Treasury, FBIIC, and FSSCC, February 2026)</em>.</p>
<p>If you would like a structured walk-through with a working memo
template, the Executive Briefing is the fastest path:</p>
<p><a href="https://aibankinginstitute.com/for-institutions" style="color:#b5512e;font-weight:500;">Book an Executive Briefing &rarr;</a></p>
`),
  },
  {
    subject: 'From Early Stage to Building Momentum: the 90-day arc',
    preheader: 'Three milestones that move the needle and a credential that codifies them.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
The 90-day arc to Building Momentum
</h1>
<p>Across the community banks and credit unions we have advised, the
shortest credible path from Early Stage to Building Momentum looks like
this:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr><td style="padding:8px 0;border-bottom:1px solid #e6dfd1;width:80px;font-family:'DM Mono',monospace;">Day 30</td>
      <td style="padding:8px 0;border-bottom:1px solid #e6dfd1;">Use-case inventory complete. Sanctioned tool selected. One-page governance memo signed.</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #e6dfd1;font-family:'DM Mono',monospace;">Day 60</td>
      <td style="padding:8px 0;border-bottom:1px solid #e6dfd1;">Two pilot use cases live in back-office (e.g. credit memo summarization, vendor due-diligence drafting). Human-in-the-loop documented.</td></tr>
  <tr><td style="padding:8px 0;border-bottom:1px solid #e6dfd1;font-family:'DM Mono',monospace;">Day 90</td>
      <td style="padding:8px 0;border-bottom:1px solid #e6dfd1;">First impact metric reported to leadership: hours saved, error rate, or cycle-time reduction. Decision: scale, hold, or kill.</td></tr>
</table>
<p>If you want to put a credentialed framework against this—and have
a named banker on your team certified to lead the next 90 days—the
Practitioner credential is the most direct route:</p>
<p><a href="https://aibankinginstitute.com/courses/aibi-p" style="color:#b5512e;font-weight:500;">AiBI-Practitioner &rarr; $295 ($199 at 10+)</a></p>
`),
  },
];

// =====================================================================
// Tier 3 — Building Momentum (score 30-38)
// Posture: scale, governance, capability building, peer benchmarks
// =====================================================================

const BUILDING_MOMENTUM_EMAILS: readonly EmailDraft[] = [
  {
    subject: 'Your assessment result: Building Momentum — what the next band requires',
    preheader: 'You are in the top quartile. Here is what separates Building Momentum from Ready to Scale.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;margin:0 0 16px 0;">
You scored Building Momentum
</h1>
<p>Institutions in this band have moved past "should we use AI?" to
"how do we scale it responsibly?" Three patterns separate Building
Momentum from Ready to Scale:</p>
<ol style="padding-left:20px;">
  <li><strong>A documented capability ladder.</strong> Bankers know who
      on the team is the AI-credentialed practitioner, the AI-credentialed
      specialist, and (eventually) the AI-credentialed leader.</li>
  <li><strong>An impact ledger.</strong> Every use case has a hours-saved,
      cycle-time, or error-rate number tied to it—not a vendor's
      marketing claim.</li>
  <li><strong>Live governance.</strong> The use-case inventory is reviewed
      monthly. Sunset reviews are scheduled. Exception requests are
      logged with named approvers.</li>
</ol>
<p>Your full results page (with the starter artifact for your lowest-scoring
dimension) is here:</p>
<p><a href="https://aibankinginstitute.com/results" style="color:#b5512e;font-weight:500;">View your full results &rarr;</a></p>
`),
  },
  {
    subject: 'A capability ladder that maps to your institution',
    preheader: 'Practitioner, Specialist, Leader — what each role does.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
The three rungs of the AI capability ladder
</h1>
<p>For a community bank or credit union, the capability ladder does not
need to be complicated. Three rungs handle most institutions through
$5 billion in assets:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr style="border-bottom:1px solid #e6dfd1;">
    <td style="padding:12px 8px 12px 0;font-family:'Cormorant SC',Georgia,serif;font-size:14px;letter-spacing:0.5px;">Practitioner</td>
    <td style="padding:12px 0;">Every banker who touches workflow improvement. Knows the sanctioned tool, the data rules, the use-case inventory process, and the prompt patterns that work. <strong>Target: one in five of your team within 12 months.</strong></td>
  </tr>
  <tr style="border-bottom:1px solid #e6dfd1;">
    <td style="padding:12px 8px 12px 0;font-family:'Cormorant SC',Georgia,serif;font-size:14px;letter-spacing:0.5px;">Specialist</td>
    <td style="padding:12px 0;">Domain leads in operations, lending, deposits, or compliance who own end-to-end use-case design and the impact ledger for their function. <strong>Target: one per major function.</strong></td>
  </tr>
  <tr>
    <td style="padding:12px 8px 12px 0;font-family:'Cormorant SC',Georgia,serif;font-size:14px;letter-spacing:0.5px;">Leader</td>
    <td style="padding:12px 0;">The named accountable executive (often the COO or CIO) who owns governance, vendor selection, and the board-level conversation. <strong>Target: one per institution.</strong></td>
  </tr>
</table>
<p>Our credential program is designed against this ladder
(AiBI-Practitioner, AiBI-S, AiBI-L). The Practitioner credential is
self-paced, $295 individual or $199 at 10+ seats:</p>
<p><a href="https://aibankinginstitute.com/courses/aibi-p" style="color:#b5512e;font-weight:500;">AiBI-Practitioner &rarr;</a></p>
`),
  },
  {
    subject: 'What "Ready to Scale" institutions do that Building Momentum institutions do not',
    preheader: 'Three operating habits, observed across the cohort.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
The habits of Ready to Scale
</h1>
<p>The institutions that score in the Ready to Scale band share three
operating habits that Building Momentum institutions usually do not:</p>
<ol style="padding-left:20px;">
  <li><strong>Quarterly impact-ledger review at the board level.</strong>
      Not a vendor demo. A one-page summary of every active use case,
      its measured impact, and its sunset date. The board asks
      questions. The AI accountable executive answers them.</li>
  <li><strong>A bench of two named successors per credentialed leader.</strong>
      No single point of failure. If the CIO leaves, AI capability
      does not leave with them.</li>
  <li><strong>Active customer-facing AI with explicit explainability.</strong>
      Per Personetics 2025 (via Apiture):
      <span style="font-family:'DM Mono',monospace;">84%</span> of
      consumers would switch FIs for AI-driven financial insights—
      and explainability is what makes those features compliant under
      ECOA/Reg B.</li>
</ol>
<p>If you would like a structured assessment of where your institution
sits against these three habits, the Executive Briefing is free:</p>
<p><a href="https://aibankinginstitute.com/for-institutions" style="color:#b5512e;font-weight:500;">Book an Executive Briefing &rarr;</a></p>
`),
  },
];

// =====================================================================
// Tier 4 — Ready to Scale (score 39-48)
// Posture: peer recognition, leadership, train-the-bench, advisory
// =====================================================================

const READY_TO_SCALE_EMAILS: readonly EmailDraft[] = [
  {
    subject: 'Your assessment result: Ready to Scale — you are in the top band',
    preheader: 'You scored in the top quartile. The conversation now is leadership, not catch-up.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:30px;line-height:1.2;margin:0 0 16px 0;">
You scored Ready to Scale
</h1>
<p>Institutions in this band are operating at a maturity that most of
the community banking sector will not reach for another 24 months.
The question is no longer "are we doing AI?"—it is "are we leading
the conversation in our market?"</p>
<p>Three things to consider in the next quarter:</p>
<ul style="padding-left:20px;">
  <li><strong>Peer leadership.</strong> Your board, your trade
      association, and your regulator all benefit when an institution
      at your maturity tells the story. The community benefits. Your
      reputation compounds.</li>
  <li><strong>Talent pipeline.</strong> Your bench of credentialed
      practitioners is your moat. The gap between your team and the
      median community bank is what makes your AI program durable.</li>
  <li><strong>Customer experience leverage.</strong> With governance
      in place, customer-facing AI becomes a growth lever, not a
      compliance project.
      <span style="font-family:'DM Mono',monospace;">76%</span> of
      consumers would switch FIs for a better digital experience
      <em>(Motley Fool, via Apiture 2025)</em>.</li>
</ul>
<p>Your full results page is here:</p>
<p><a href="https://aibankinginstitute.com/results" style="color:#b5512e;font-weight:500;">View your full results &rarr;</a></p>
`),
  },
  {
    subject: 'The institution-wide credential program (and why it matters)',
    preheader: 'AiBI-Practitioner at scale — the bench pattern that protects your AI program.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
Train the bench, not the leadership
</h1>
<p>The single largest institutional risk in a Ready to Scale AI program
is concentration. If three people on your team hold all the AI
capability, the program is one resignation away from a setback.</p>
<p>The pattern that works:</p>
<ul style="padding-left:20px;">
  <li><strong>One credentialed Practitioner per branch or major function.</strong>
      Typically <span style="font-family:'DM Mono',monospace;">10–25</span>
      credentialed bankers across an institution your size.</li>
  <li><strong>One credentialed Specialist per business line.</strong>
      Operations, lending, deposits, compliance.</li>
  <li><strong>The accountable executive credentialed at Leader.</strong>
      The named owner who can speak to the board and the regulator
      with equal fluency.</li>
</ul>
<p>Institutional pricing for AiBI-Practitioner is
<span style="font-family:'DM Mono',monospace;">$199</span> per seat at
<span style="font-family:'DM Mono',monospace;">10+</span> bankers.
Self-paced over 90 days, with credentialing on completion.</p>
<p><a href="https://aibankinginstitute.com/for-institutions" style="color:#b5512e;font-weight:500;">For Institutions &rarr;</a></p>
`),
  },
  {
    subject: 'A standing invitation: Leadership Advisory',
    preheader: 'For Ready to Scale institutions wanting a fractional Chief AI Officer.',
    html: wrap(`
<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;line-height:1.2;margin:0 0 16px 0;">
A standing invitation
</h1>
<p>Most institutions in the Ready to Scale band do not need a full-time
Chief AI Officer. The market does not yet have a standard role
definition, and the cost of getting the hire wrong at this maturity is
high.</p>
<p>What they often do need is a fractional Chief AI Officer—someone
with sector-specific depth who joins the leadership cadence, sits in
on governance reviews, and is the named external advisor on AI
strategy and regulatory posture.</p>
<p>This is what The Institute's Leadership Advisory engagement is
designed for. Quarterly cadence, retainer-based, no software fees.
Tied to the same three-pillar curriculum as our credential program so
the language inside the institution stays consistent.</p>
<p>If this is the conversation worth having, the Executive Briefing is
the right starting point. Thirty minutes, no slides, no pitch.</p>
<p><a href="https://aibankinginstitute.com/for-institutions" style="color:#b5512e;font-weight:500;">Book an Executive Briefing &rarr;</a></p>
`),
  },
];

// =====================================================================
// Automation drafts — wired to env-keyed group ids
// =====================================================================

export const AUTOMATIONS: readonly AutomationDraft[] = [
  {
    name: 'AiBI Newsletter — Welcome',
    groupEnvKey: 'MAILERLITE_GROUP_ID_NEWSLETTER',
    emails: [NEWSLETTER_WELCOME],
    delaysDays: [0],
  },
  {
    name: 'AiBI Assessment — Starting Point',
    groupEnvKey: 'MAILERLITE_GROUP_ID_STARTING_POINT',
    emails: STARTING_POINT_EMAILS,
    delaysDays: [0, 3, 7],
  },
  {
    name: 'AiBI Assessment — Early Stage',
    groupEnvKey: 'MAILERLITE_GROUP_ID_EARLY_STAGE',
    emails: EARLY_STAGE_EMAILS,
    delaysDays: [0, 3, 7],
  },
  {
    name: 'AiBI Assessment — Building Momentum',
    groupEnvKey: 'MAILERLITE_GROUP_ID_BUILDING_MOMENTUM',
    emails: BUILDING_MOMENTUM_EMAILS,
    delaysDays: [0, 3, 7],
  },
  {
    name: 'AiBI Assessment — Ready to Scale',
    groupEnvKey: 'MAILERLITE_GROUP_ID_READY_TO_SCALE',
    emails: READY_TO_SCALE_EMAILS,
    delaysDays: [0, 3, 7],
  },
];
