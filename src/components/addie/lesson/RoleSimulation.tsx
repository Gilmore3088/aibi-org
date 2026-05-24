'use client';

// RoleSimulation — embedded role-specific drill.
//
// Per the Transformation Vision: "Embedded role simulations — mock
// examiner Q&A for Risk & Compliance, mock member call for Customer-
// Facing." The drill is multi-turn and graded — the learner picks a
// response from 3 options at each turn, and at the end gets a calibration
// score + the better answer for each turn they missed.
//
// This is the kind of practice that turns a lesson from "I read it" into
// "I can do it under pressure." Two scenarios ship in this scaffold:
//
//   - risk_compliance: mock examiner Q&A on AI governance
//   - customer_facing: mock member call about an overdraft fee
//
// Future scaffolds plug into the same `Scenario` shape. Three more
// scenarios (back_office, technical, leadership) drop into SCENARIOS
// when their content is authored.

import { useCallback, useMemo, useState } from 'react';
import type { Track } from './types';

interface Turn {
  readonly speaker: string;          // "Examiner" / "Member" — visible above the prompt
  readonly prompt: string;           // What the examiner/member says
  readonly options: ReadonlyArray<{
    readonly label: string;
    readonly score: 0 | 1 | 2;       // 0 = wrong, 1 = partial, 2 = ideal
    readonly feedback: string;
  }>;
}

interface Scenario {
  readonly kicker: string;
  readonly title: string;
  readonly setup: string;
  readonly turns: ReadonlyArray<Turn>;
  readonly debrief_strong: string;   // shown when score ≥ 80%
  readonly debrief_weak: string;     // shown when score < 80%
}

const SCENARIOS: Partial<Record<Track, Scenario>> = {
  risk_compliance: {
    kicker: 'Mock examiner Q&A',
    title: 'A field examiner asks how your bank governs generative AI.',
    setup:
      'You are the bank\'s CCO. The examiner has dropped in for an interim review. The first three questions are predictable; the fourth is the one most banks struggle to answer cleanly. Pick the response closest to what you would actually say.',
    turns: [
      {
        speaker: 'Examiner',
        prompt:
          '"How does your institution decide which AI tools staff are permitted to use for bank business?"',
        options: [
          {
            label: 'We block everything at the firewall until risk has reviewed it.',
            score: 1,
            feedback:
              'Defensible posture but not a governance framework. The examiner wants to see how you evaluate, not just that you block.',
          },
          {
            label:
              'We have a sanctioned-tools list reviewed quarterly by risk, IT, and legal; staff get a one-page acceptable-use policy and training before any tool turns on.',
            score: 2,
            feedback:
              'The complete answer — names the cadence, the parties, and the artifact (acceptable-use policy). Anchors in TPRM and SR 11-7 governance.',
          },
          {
            label: 'Staff can use whatever they\'d like as long as no customer data goes in.',
            score: 0,
            feedback:
              'No governance framework; relies on individual judgement under regulator scrutiny. This will become a finding.',
          },
        ],
      },
      {
        speaker: 'Examiner',
        prompt:
          '"How do you ensure AI outputs are reviewed before they leave the bank?"',
        options: [
          {
            label:
              'AI-assisted material is treated like any other draft — the original reviewer-and-signer flow still applies; the AI tool is not an authority.',
            score: 2,
            feedback:
              'Exactly the right framing. The model is a drafter, not a signer. Existing review controls do the work.',
          },
          {
            label: 'The model self-checks its work, and we spot-check 10% of outputs monthly.',
            score: 0,
            feedback:
              'Models do not self-check meaningfully today; spot-checking 10% is not the same as a real review point. Expect a follow-up question.',
          },
          {
            label: 'We have a queue where compliance reviews all AI-generated material before send.',
            score: 1,
            feedback:
              'Stronger, but only feasible at small volume. The examiner will ask how this scales — and what happens when the queue is backed up.',
          },
        ],
      },
      {
        speaker: 'Examiner',
        prompt:
          '"If one of your skills produced an inaccurate citation in a member letter, how would you find out?"',
        options: [
          {
            label: 'The reviewer reads every output; that is the find mechanism.',
            score: 1,
            feedback:
              'True but incomplete. Reviewers catch what they happen to know is wrong; you need an upstream check.',
          },
          {
            label:
              'The skill\'s guardrail notes name what it should never invent; the reviewer checks any cited regulation against the source. Outputs flag anything the model could not verify.',
            score: 2,
            feedback:
              'The right answer — guardrail notes attached to the skill, a review checklist tied to the citation type, and an output that surfaces unverifiable claims.',
          },
          {
            label: 'We would not know until a member complained.',
            score: 0,
            feedback:
              'This is the answer that ends the conversation poorly. The examiner now has the finding.',
          },
        ],
      },
      {
        speaker: 'Examiner',
        prompt:
          '"What is your inventory of AI use cases inside the bank, and how is it updated?"',
        options: [
          {
            label: 'IT keeps a list of approved tools; that is the inventory.',
            score: 0,
            feedback:
              'Tools are not use cases. The AIEOG Lexicon and the Interagency TPRM Guidance treat the use-case inventory as the primary artifact.',
          },
          {
            label:
              'We maintain a use-case inventory per the AIEOG Lexicon — owner, business purpose, data classes, review point, and material-impact assessment. Risk reviews quarterly.',
            score: 2,
            feedback:
              'The complete answer — names the framework, the fields, the owner, and the cadence. Examiners want to see this exact shape.',
          },
          {
            label: 'We are building the inventory this quarter.',
            score: 1,
            feedback:
              'Honest, defensible if true, but vulnerable to "show me the draft" — be ready with the draft.',
          },
        ],
      },
    ],
    debrief_strong:
      'You walked all four. The shape of your answers — frameworks named, cadences specified, artifacts referenced — is what examiners expect from a bank that takes AI governance seriously.',
    debrief_weak:
      'The pattern under examiner pressure: name the framework, name the cadence, name the artifact. "We have a policy" alone is rarely enough — they want to see the policy, the review point, and the way it is exercised.',
  },
  back_office: {
    kicker: 'Mock process review',
    title: 'Operations sits down to plan an AI-assisted rewrite of a recurring memo.',
    setup:
      'You lead back-office process. Three colleagues have proposals on the table for using AI to compress the time spent rewriting internal procedure memos. Pick the response closest to how you would actually steer the conversation.',
    turns: [
      {
        speaker: 'Colleague',
        prompt:
          '"Can we just paste the procedure memos into ChatGPT and have it rewrite them in plainer language?"',
        options: [
          {
            label:
              '"For memos with no customer or vendor identifiers, yes — but we should standardize the prompt and save the rewriter as a skill so every memo lands in the same tone."',
            score: 2,
            feedback:
              'Names the data discipline, names the reusable shape (a Skill), and anchors quality (consistent tone). This is the M4 framing applied operationally.',
          },
          {
            label: '"Sure, paste away — it\'s just internal text."',
            score: 0,
            feedback:
              'Internal memos often reference confidential vendor names, draft pricing, or unreleased product info. "Just internal" is not the same as "safe."',
          },
          {
            label: '"No, we need a vendor with a BAA before we touch anything like this."',
            score: 1,
            feedback:
              'Defensible if the memos contain regulated content, but overcautious for the general case. The right cut is by content type, not by tool category.',
          },
        ],
      },
      {
        speaker: 'Colleague',
        prompt:
          '"Should we export the customer-services campaign list and use AI to draft segment-specific email copy?"',
        options: [
          {
            label:
              '"No customer list goes in. We can describe segment shapes in the abstract — \'small-business members under two years tenure\' — and have the AI draft copy from that. Marketing already approves before send."',
            score: 2,
            feedback:
              'Holds the data line without killing the use case. Describes the segment, not the people. The existing approval flow stays intact.',
          },
          {
            label: '"Use the export but strip names first."',
            score: 0,
            feedback:
              'Stripped lists still carry behavioral data, fee patterns, and balance ranges — enough to identify individuals in a small institution. Don\'t paste lists, period.',
          },
          {
            label: '"Yes, the AI tool we use is enterprise-tier."',
            score: 1,
            feedback:
              'Enterprise tier matters but is not a free pass. Confirm the tenant configuration, then still prefer to describe the shape rather than paste the file.',
          },
        ],
      },
      {
        speaker: 'Colleague',
        prompt:
          '"What\'s the right way to measure whether this AI rewrite work is paying off?"',
        options: [
          {
            label:
              '"Two things: time saved per memo (before/after) and how many of the rewrites pass first-read with the team that owns the procedure. Sentiment is not a metric."',
            score: 2,
            feedback:
              'Two concrete measurables. Time saved is the efficiency ratio in disguise. First-read acceptance catches the "AI sounded good but missed the point" failure mode.',
          },
          {
            label: '"The team will tell us if it\'s working."',
            score: 0,
            feedback:
              'Soft signal only. Six months from now there is no defensible story for the operating committee.',
          },
          {
            label: '"Count how many memos we rewrite with AI."',
            score: 1,
            feedback:
              'A throughput metric, not an outcome. You can rewrite a hundred memos badly and still report a big number.',
          },
        ],
      },
    ],
    debrief_strong:
      'You held the line on data discipline, named reusable artifacts (Skill, prompt template), and pushed for outcome metrics. That is what operationalization looks like inside a back office — not a tool program, a way of working.',
    debrief_weak:
      'Operational AI work survives or fails on the same three discipline points: what data goes in, what artifact comes out, and what outcome we measured against. Skip any one and the program drifts.',
  },
  technical: {
    kicker: 'Mock architecture review',
    title: 'A business unit asks IT to approve a new AI assistant for daily use.',
    setup:
      'You lead IT for the bank. A line-of-business head wants to roll out a third-party AI tool that integrates with email and shared drives. The vendor demo was strong. Pick the response closest to the architecture-review questions you would actually raise.',
    turns: [
      {
        speaker: 'LOB head',
        prompt:
          '"We watched the demo and the team is excited. What does IT need from us to greenlight this?"',
        options: [
          {
            label:
              '"Three things to map first: the tenant configuration that controls what data the assistant can see, the data-residency commitment from the vendor in writing, and which existing identity stack we federate against."',
            score: 2,
            feedback:
              'Names the three foundational questions before any deeper review. Tenant config is the #1 silent data-discipline leak point in copilots.',
          },
          {
            label: '"We need the marketing material and the pricing."',
            score: 0,
            feedback:
              'Procurement question, not an architecture question. Greenlighting on marketing material is how shadow IT shows up six months later.',
          },
          {
            label: '"Run a 30-day pilot and we\'ll review afterwards."',
            score: 1,
            feedback:
              'Pilots are fine, but a pilot without scoped data boundaries is just exposure on a delay. Set the boundaries first, then pilot.',
          },
        ],
      },
      {
        speaker: 'LOB head',
        prompt:
          '"The vendor says they don\'t train on our data. Isn\'t that enough?"',
        options: [
          {
            label:
              '"That\'s necessary but not sufficient. We also need retention duration, sub-processor list, breach notification timing, and SR 11-7 / Interagency TPRM artifacts before we can finalize the risk review."',
            score: 2,
            feedback:
              'Names the right framework. "No training" is one promise out of a dozen the vendor due diligence is meant to verify.',
          },
          {
            label: '"Yes — that\'s the main risk; everything else is procurement boilerplate."',
            score: 0,
            feedback:
              'Wrong on supervisory expectations. SR 11-7 + Interagency TPRM treat AI vendor risk as a structured assessment, not a single promise.',
          },
          {
            label: '"We need them to sign a custom contract clause."',
            score: 1,
            feedback:
              'Maybe — but only after the underlying risk profile is mapped. A custom clause without a TPRM file behind it is theater.',
          },
        ],
      },
      {
        speaker: 'LOB head',
        prompt:
          '"What about my team using the consumer free tier in the meantime while we work through the formal review?"',
        options: [
          {
            label:
              '"Not on bank business. Personal accounts for learning are fine on personal devices, but the moment they touch bank work or bank-context queries, the data-discipline rule says no. Approved-tool list is the operating constraint."',
            score: 2,
            feedback:
              'Exactly the line. Personal learning ≠ bank work. The approved-tool list is the operating constraint, not an aspiration.',
          },
          {
            label: '"As long as they don\'t paste real customer data, sure."',
            score: 0,
            feedback:
              'Relies on individual judgement under pressure. That\'s the gap the formal review is supposed to close. Don\'t pre-authorize the workaround.',
          },
          {
            label: '"I\'ll send them a heads-up email about being careful."',
            score: 0,
            feedback:
              'Email is not a control. If shadow use is happening, name it and route it through the formal process — don\'t soft-pedal it.',
          },
        ],
      },
    ],
    debrief_strong:
      'You held tenant config + TPRM + the approved-tool list as the three non-negotiables. That trio is what stops the bank from re-learning vendor risk one breach at a time.',
    debrief_weak:
      'Three architectural anchors hold AI vendor risk in place: tenant configuration, structured TPRM file (SR 11-7 + Interagency Guidance), and the operating constraint of an approved-tool list. Any one of the three slips and the others cannot recover the program alone.',
  },
  leadership: {
    kicker: 'Mock board exchange',
    title: 'A board member presses on the bank\'s AI strategy at the quarterly meeting.',
    setup:
      'You are CEO. A board member who reads more about AI than they have time for is asking pointed questions. The room is watching. Pick the response closest to what you would actually say.',
    turns: [
      {
        speaker: 'Director',
        prompt:
          '"Every community bank conference I attend is talking about AI. What\'s our strategy?"',
        options: [
          {
            label:
              '"Two horizons. Near-term we are operationalizing AI inside the work staff already do — clearer member letters, faster summaries of long regulations, drafted procedure rewrites. Longer-term we are building one or two prototypes that change how a single workflow runs end to end. Both inside the governance framework risk has stood up."',
            score: 2,
            feedback:
              'Names the two horizons (use AI, build with AI), grounds in real work, and anchors in governance. Exactly the answer a serious board member wants.',
          },
          {
            label: '"We are evaluating several vendors and will report back."',
            score: 0,
            feedback:
              'The non-answer answer. The board will note it and the conversation will get harder the next quarter.',
          },
          {
            label: '"We have rolled out [vendor tool] to the staff."',
            score: 1,
            feedback:
              'Tool deployment is not strategy. The board will follow up with "and what changed?" — be ready with the outcome story.',
          },
        ],
      },
      {
        speaker: 'Director',
        prompt:
          '"What if we get this wrong? What\'s the downside scenario for this institution?"',
        options: [
          {
            label:
              '"Three failure modes we are guarded against: data discipline breaks and we end up in an exam finding; we adopt a tool the supervisor later treats as a high-risk model and we have no use-case inventory; or we build something that produces a confidently wrong answer that ends up in a member communication. Risk has controls for each."',
            score: 2,
            feedback:
              'Names the three concrete failure modes a regulator would surface and ties each to an existing control. That is what risk-aware leadership sounds like.',
          },
          {
            label: '"We have insurance and a vendor agreement."',
            score: 0,
            feedback:
              'Insurance is recovery, not prevention. This is the answer that becomes the headline in a worst-case quarter.',
          },
          {
            label: '"It\'s an emerging area; we\'re proceeding carefully."',
            score: 1,
            feedback:
              'Reassuring tone, no substance. A director who is paying attention will press for the specifics.',
          },
        ],
      },
      {
        speaker: 'Director',
        prompt:
          '"What investment do you want from the board to make this real over the next twelve months?"',
        options: [
          {
            label:
              '"Three asks. One: $X to fund the staff time on a structured 12-month learning track. Two: a sponsored 90-day prototype for one operational workflow. Three: board sponsorship of an updated AI governance policy review. Modest dollars; the real ask is sustained attention."',
            score: 2,
            feedback:
              'Three concrete asks. Names dollars, names time, names attention. Boards reward leaders who turn open questions into closeable decisions.',
          },
          {
            label: '"Whatever we need; the budget is in the operating plan."',
            score: 0,
            feedback:
              'Defers the decision and signals you have not done the work. A board member who is paying attention will push back.',
          },
          {
            label: '"We don\'t need additional investment yet."',
            score: 1,
            feedback:
              'May be true, but it signals the program is small. If the program is genuinely small, say so honestly and name when the next conversation is.',
          },
        ],
      },
    ],
    debrief_strong:
      'You named horizons, named failure modes, named asks. A board member who heard those three answers will spend the next quarter advocating for the program, not interrogating it.',
    debrief_weak:
      'The pattern under board pressure: name the two horizons (use/build), name the failure modes a regulator would name, and turn the discussion into a closeable decision with a concrete ask. Vague answers get sharper questions; concrete answers earn trust.',
  },
  customer_facing: {
    kicker: 'Mock member call',
    title: 'A member calls about an overdraft fee they feel was unfair.',
    setup:
      'You are the member-services lead. Pick the line closest to what you would actually say. Tone matters as much as content here; the goal is to keep the member, fix the issue if it can be fixed, and not invent anything the institution did not promise.',
    turns: [
      {
        speaker: 'Member',
        prompt:
          '"I had no idea you charged a fee for that. The transaction was four dollars and now I owe you thirty-five."',
        options: [
          {
            label:
              '"I understand the fee feels disproportionate to the purchase amount. Let me walk you through what happened on the account, and I will explain the fee at the same time so we are looking at the same picture."',
            score: 2,
            feedback:
              'Acknowledges the feeling, anchors the conversation in shared facts, defers the fee discussion until the picture is clear. Classic de-escalation.',
          },
          {
            label: '"That is the fee schedule — you would have agreed to it when you opened the account."',
            score: 0,
            feedback:
              'Technically true, completely tone-deaf. Member is now calibrated for confrontation; the conversation gets harder for the next four minutes.',
          },
          {
            label: '"I can waive that for you as a one-time courtesy."',
            score: 1,
            feedback:
              'Waiving solves the call quickly but skips the explanation. The member learns nothing and is more likely to overdraw again — and the institution\'s OD revenue is leaking.',
          },
        ],
      },
      {
        speaker: 'Member',
        prompt:
          '"But why did it go through if I did not have the money? Other banks would just decline it."',
        options: [
          {
            label:
              '"Whether a transaction goes through when funds are not available depends on the type of transaction and the choice on the account at sign-up. May I walk you through what is on your account so you can see whether it is set the way you would like?"',
            score: 2,
            feedback:
              'Names the mechanic without inventing a policy detail, and offers to review the actual setting. Reg-E opt-in/out is the underlying explanation.',
          },
          {
            label: '"Our system pays it; that is how it has always worked."',
            score: 0,
            feedback:
              'Wrong on the mechanic (Reg E governs the opt-in for ATM and one-time debit) and dismissive on tone. This is the line that ends up in a complaint.',
          },
          {
            label: '"Banks have to honor the merchant; we did not have a choice."',
            score: 0,
            feedback:
              'Inaccurate. Banks have a choice; the choice is reflected in the member\'s opt-in status. Inventing a no-choice answer creates exposure.',
          },
        ],
      },
      {
        speaker: 'Member',
        prompt: '"What can you actually do for me right now?"',
        options: [
          {
            label:
              '"I can look at the account, explain what happened, and depending on what we find I have a couple of options — including reviewing the fee. Can I put you on a short hold while I pull it up?"',
            score: 2,
            feedback:
              'Names the next concrete action, sets the time expectation, and keeps decision authority where it belongs — with the agent looking at the account.',
          },
          {
            label: '"I can refund the fee right now."',
            score: 1,
            feedback:
              'Fast resolution; defensible if the institution\'s policy allows it. But you have given away the option before reviewing the situation — and the member learns no banking-product detail.',
          },
          {
            label: '"You would need to speak with a supervisor about that."',
            score: 0,
            feedback:
              'Punts. The member came to you; transferring is rarely the win-back move.',
          },
        ],
      },
    ],
    debrief_strong:
      'You held the line: acknowledge → orient → explain → offer. The member finishes the call understanding the mechanic and either feeling fairly treated or actively retained.',
    debrief_weak:
      'The pattern under member pressure: acknowledge the feeling first, then anchor in shared facts, then explain the mechanic without inventing policy. Resolution comes after understanding, not before.',
  },
};

interface RoleSimulationProps {
  readonly track: Track | null;
  readonly lessonId: string;
}

export function RoleSimulation({ track, lessonId }: RoleSimulationProps) {
  // Compose a stable scenario for this (track, lesson) pair. v1 uses the
  // single seeded scenario per track regardless of lesson; future versions
  // can branch by lessonId.
  void lessonId;
  const scenario = useMemo<Scenario | null>(() => {
    if (!track) return null;
    return SCENARIOS[track] ?? null;
  }, [track]);

  const [turnIdx, setTurnIdx] = useState(0);
  const [picks, setPicks] = useState<Array<{ score: 0 | 1 | 2; feedback: string }>>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const pick = useCallback(
    (score: 0 | 1 | 2, feedback: string) => {
      if (showAnswer) return;
      setPicks((p) => [...p, { score, feedback }]);
      setShowAnswer(true);
    },
    [showAnswer],
  );

  const advance = useCallback(() => {
    setShowAnswer(false);
    setTurnIdx((i) => i + 1);
  }, []);

  if (!scenario) return null;

  const done = turnIdx >= scenario.turns.length;
  const totalScore = picks.reduce((s, p) => s + p.score, 0);
  const maxScore = scenario.turns.length * 2;
  const pct = maxScore ? Math.round((totalScore / maxScore) * 100) : 0;
  const strong = pct >= 80;

  if (done) {
    return (
      <section
        className="my-8 rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-6"
        aria-label="Role simulation debrief"
      >
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-2">
          {scenario.kicker} · Debrief
        </div>
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h3 className="font-serif text-2xl text-[var(--ledger-ink)] leading-tight">
            {strong ? 'You held the line.' : 'A few to review.'}
          </h3>
          <div className="font-mono tabular-nums text-2xl text-[var(--ledger-ink)]">
            {totalScore}<span className="text-[var(--ledger-muted)]"> / {maxScore}</span>
          </div>
        </div>
        <p className="font-serif text-[1rem] leading-snug text-[var(--ledger-ink-2)]">
          {strong ? scenario.debrief_strong : scenario.debrief_weak}
        </p>
        <button
          type="button"
          onClick={() => {
            setTurnIdx(0);
            setPicks([]);
            setShowAnswer(false);
          }}
          className="mt-5 inline-block font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-ink)] border-b border-[var(--ledger-accent)] pb-px hover:text-[var(--ledger-accent)]"
        >
          Run again →
        </button>
      </section>
    );
  }

  const turn = scenario.turns[turnIdx];
  const lastPick = showAnswer ? picks[picks.length - 1] : null;

  return (
    <section
      className="my-8 rounded-[4px] border border-[var(--ledger-rule)] bg-[var(--ledger-paper)] px-6 py-6"
      aria-label="Role simulation"
    >
      <header className="mb-4">
        <div className="font-mono uppercase tracking-[0.18em] text-[0.65rem] text-[var(--ledger-accent)] mb-1">
          {scenario.kicker} · Turn {turnIdx + 1} of {scenario.turns.length}
        </div>
        <h3 className="font-serif text-xl text-[var(--ledger-ink)] leading-tight">
          {scenario.title}
        </h3>
        {turnIdx === 0 ? (
          <p className="mt-2 font-serif text-[0.95rem] text-[var(--ledger-ink-2)] leading-snug">
            {scenario.setup}
          </p>
        ) : null}
      </header>
      <div className="mb-4 border-l-2 border-[var(--ledger-ink)] pl-4">
        <div className="font-mono uppercase tracking-[0.16em] text-[0.6rem] text-[var(--ledger-muted)] mb-1">
          {turn.speaker}
        </div>
        <p className="font-serif text-[1.05rem] leading-snug text-[var(--ledger-ink)]">
          {turn.prompt}
        </p>
      </div>
      <ol className="space-y-2">
        {turn.options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => pick(opt.score, opt.feedback)}
              disabled={showAnswer}
              className="w-full text-left rounded-[3px] border border-[var(--ledger-rule)] bg-[var(--ledger-bg)] px-4 py-3 font-serif text-[0.95rem] text-[var(--ledger-ink)] hover:border-[var(--ledger-ink)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-[120ms]"
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ol>
      {lastPick ? (
        <div className="mt-4 border-t border-[var(--ledger-rule)] pt-4">
          <div className={`font-mono uppercase tracking-[0.18em] text-[0.6rem] mb-1 ${
            lastPick.score === 2 ? 'text-[var(--ledger-accent)]' : lastPick.score === 1 ? 'text-[var(--ledger-ink-2)]' : 'text-[var(--ledger-weak)]'
          }`}>
            {lastPick.score === 2 ? 'Ideal · 2 pts' : lastPick.score === 1 ? 'Partial · 1 pt' : 'Miss · 0 pts'}
          </div>
          <p className="font-serif text-[0.95rem] leading-snug text-[var(--ledger-ink)]">
            {lastPick.feedback}
          </p>
          <button
            type="button"
            onClick={advance}
            className="mt-3 inline-block font-mono uppercase tracking-[0.16em] text-[0.65rem] text-[var(--ledger-ink)] border-b border-[var(--ledger-accent)] pb-px hover:text-[var(--ledger-accent)]"
          >
            {turnIdx + 1 < scenario.turns.length ? 'Next turn →' : 'See debrief →'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
