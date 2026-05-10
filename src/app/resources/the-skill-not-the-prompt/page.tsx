import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "The Skill, Not the Prompt — Why Community Bankers Need a Different Frame for AI",
  description:
    'Prompting is a one-time act. A skill is a persistent, repeatable, institution-grade instruction that executes reliably every time you need it. Here is why the distinction matters for community banks — and how to build your first one.',
};

const FIVE_COMPONENTS = [
  {
    label: 'Role',
    bad: '"Help me review this."',
    good: '"You are a Senior Compliance Officer at a community bank with expertise in BSA/AML and ECOA/Reg B."',
  },
  {
    label: 'Context',
    bad: 'None — AI makes generic assumptions.',
    good: '"For a $450M community bank subject to FFIEC examination with a commercial real estate loan portfolio."',
  },
  {
    label: 'Task',
    bad: '"Summarize this."',
    good: '"Extract three primary risk factors from the collateral section and flag missing documentation against the standard 17-item checklist."',
  },
  {
    label: 'Format',
    bad: '"Write a long email."',
    good: '"A two-column table: Risk Factor | Recommended Mitigation. Maximum five rows."',
  },
  {
    label: 'Constraints',
    bad: 'None — AI can produce any output type.',
    good: '"Never provide a definitive compliance determination. Flag regulatory findings with [REQUIRES HUMAN REVIEW]. Do not use informal language."',
  },
] as const;

export default function TheSkillNotThePromptArticle() {
  return (
    <main className="px-6 py-14 md:py-20">
      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-4">
            Foundations Guide &middot; April 2026
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-[color:var(--color-ink)] leading-[1.05] mb-6">
            The skill, not the prompt.
          </h1>
          <p className="text-xl text-[color:var(--color-ink)]/75 leading-relaxed">
            Every AI training program for bankers eventually teaches
            prompting. Almost none of them teach the thing that actually
            makes AI useful at work: the skill. The distinction sounds
            technical. It is not. It is the difference between a
            one-time result and a permanent workflow improvement.
          </p>
        </header>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            What a prompt is, and why it is not enough.
          </h2>
          <p>
            A prompt is an instruction you type. It is a one-time request,
            specific to the moment you write it, requiring you to reconstruct
            the full context every time you need the same kind of output.
            &ldquo;Summarize this loan memo for the credit committee.&rdquo;
            &ldquo;Draft a response to this member complaint.&rdquo;
            &ldquo;Check this transaction narrative for SAR indicators.&rdquo;
          </p>
          <p>
            Those are reasonable instructions. They are not skills. Every
            time a staff member types one of those prompts from scratch,
            they are introducing variation &mdash; in the AI&rsquo;s role
            assumptions, in the format of the output, in the constraints
            that apply to the context. Two loan officers asking the same
            AI tool to review a loan file on the same day, with different
            prompt phrasing, will get meaningfully different outputs.
            That is not how professional-grade work should behave.
          </p>
          <p>
            The &ldquo;prompting tips&rdquo; frame creates a culture of
            individual-level tricks. The right question is not &ldquo;how
            do I write a better prompt?&rdquo; It is &ldquo;how do I build
            a skill my entire department can use?&rdquo;
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            What a skill is.
          </h2>
          <p>
            In the AiBI Foundations curriculum, a skill is defined
            precisely: a persistent, reusable instruction that executes
            reliably every time you need it, without requiring you to
            reconstruct the full context from scratch. Skills exist across
            every major AI platform under different names &mdash;
            ChatGPT calls them Custom Instructions, Projects, or GPTs.
            Claude calls them Projects with system prompts. Gemini calls
            them Gems. The underlying pattern is identical across all of
            them.
          </p>
          <p>
            Three mental models help practitioners understand what a skill
            actually is:
          </p>
          <p>
            <strong>A standing order.</strong> In banking operations, a
            standing order is an instruction that executes automatically
            every time specified conditions arise. You define the conditions
            once; the system executes against them without re-briefing. A
            skill is the AI equivalent: you define the role, context, task,
            format, and constraints once, and the AI executes against those
            definitions every time it encounters the same type of input.
          </p>
          <p>
            <strong>A trained colleague.</strong> Think of a skill as a
            digital colleague who has been briefed once on a specific task
            and requires no further hand-holding. You explained what you
            need, how you need it formatted, and what they should never
            do &mdash; and now they can execute that task indefinitely
            without you repeating yourself. Unlike a real colleague, the
            briefing never fades.
          </p>
          <p>
            <strong>A smarter template.</strong> Operations and compliance
            staff are already familiar with document templates and
            checklists. A skill is what happens when a template gains
            intelligence &mdash; it does not fill in static blanks, it
            applies consistent professional judgment to variable inputs
            while maintaining the structural constraints the template
            was designed to enforce.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The five components of a banking skill.
          </h2>
          <p>
            Every robust banking AI skill contains five components. Missing
            any one of them degrades the quality and consistency of outputs.
            The AiBI Foundations curriculum calls this the five-component anatomy,
            simplified in practice to the RTFC Framework (Role, Task, Format,
            Constraint), with Context embedded in Role.
          </p>
        </section>

        <div className="my-10 space-y-4">
          {FIVE_COMPONENTS.map((c) => (
            <div
              key={c.label}
              className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6"
            >
              <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
                {c.label}
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-2">
                    Mediocre
                  </p>
                  <p className="font-serif text-base text-[color:var(--color-ink)]/70 italic leading-relaxed">
                    {c.bad}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[color:var(--color-ink)]/50 mb-2">
                    Institution-grade
                  </p>
                  <p className="text-sm text-[color:var(--color-ink)] leading-relaxed">
                    {c.good}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-6 text-[color:var(--color-ink)]/85 leading-relaxed text-lg">
          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            The arithmetic of skills.
          </h2>
          <p>
            The Loan QC skill example in the AiBI Foundations curriculum is concrete:
            a lending analyst who builds a Loan QC skill &mdash; configured
            to act as a senior credit analyst, focus on collateral adequacy
            and documentation completeness, format output as a two-column
            risk table, and never flag regulatory compliance issues without
            citing the specific regulation &mdash; spends approximately
            20 minutes building it. The skill saves approximately 15 minutes
            per use.
          </p>
          <p>
            After two uses, the skill has paid back its build time. After 50
            uses &mdash; a single analyst reviewing roughly one loan file per
            week over a year &mdash; it has saved over 12 hours of productive
            capacity. Multiply by the number of analysts on a team and the
            number of repetitive workflows in a community bank&rsquo;s
            operations, and the arithmetic becomes the ROI case for AI
            investment in plain numbers.
          </p>
          <p>
            The key word is &ldquo;repetitive.&rdquo; Skills create value
            from repetition. A prompt that gets used once has the same value
            as a one-time task. A skill that gets used 50 times has
            50 times the cumulative value of a single accurate output.
            The practitioner&rsquo;s job is to identify the workflows that
            repeat &mdash; and build skills for them.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Skills are portable and institutional.
          </h2>
          <p>
            A well-built skill is written in Markdown &mdash; a plain text
            format that any AI platform can read. That portability matters
            for two reasons.
          </p>
          <p>
            First, if your institution changes AI vendors, your skill library
            moves with you. A Claude Project skill can be pasted into a
            ChatGPT Custom Instruction without modification. Platform
            lock-in is a real risk in enterprise AI; Markdown-format skills
            are a structural hedge against it.
          </p>
          <p>
            Second, skills can be shared. A compliance skill built by one
            officer can be reviewed, approved, and distributed to the entire
            compliance team. A lending skill tested by a senior analyst
            becomes institutional infrastructure when it is documented and
            shared. This is what makes AI genuinely transformative at
            community banks &mdash; not individual productivity gains, but
            the ability to encode institutional knowledge into repeatable
            workflows that any trained staff member can use.
          </p>
          <p>
            The Gartner Peer Community survey (via Jack Henry &amp;
            Associates, 2025) found that 57% of financial institutions
            struggle with AI skill gaps. The usual interpretation is that
            staff need more AI training. The less obvious interpretation:
            institutions that build and share skill libraries are closing
            the capability gap institutionally, not just individually.
            The banker who builds the skill teaches everyone who uses it.
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] pt-6">
            Where to start.
          </h2>
          <p>
            The right first skill is the workflow that currently requires
            the most reconstruction. That is the task where a staff member
            types a long, carefully worded prompt from scratch every single
            time &mdash; because the context is complex enough that getting
            a useful output requires significant setup. That complexity is
            the signal: the harder the prompt is to write from scratch,
            the more a skill would save.
          </p>
          <p>
            Identify that workflow. Document what the current best prompt
            looks like &mdash; the one that produces the most useful output
            on the first try. That draft prompt is already 80% of a skill.
            Adding a proper Role definition, tightening the Task
            specification, formalizing the Format, and adding three to five
            Constraints turns it into a repeatable, institutional-grade tool.
          </p>
          <p>
            The AiBI Foundations curriculum&rsquo;s Module 7 skill builder takes
            that process from a blank page to a deployable Markdown file
            in 30 minutes. The resulting file can be loaded into ChatGPT,
            Claude, Gemini, or any AI platform that supports custom
            instructions &mdash; immediately, on the same day it is built.
          </p>
          <p>
            Twenty minutes to build. A year of consistent, institution-grade
            outputs. That is what the skill makes possible &mdash; and what
            no amount of prompting tips can replicate.
          </p>
        </section>

        <aside className="mt-16 bg-[color:var(--color-parch)] border border-[color:var(--color-ink)]/10 rounded-[3px] p-8 md:p-10 text-center">
          <p className="font-serif-sc text-xs uppercase tracking-[0.2em] text-[color:var(--color-terra)] mb-3">
            AiBI Foundations Certification
          </p>
          <h3 className="font-serif text-3xl md:text-4xl text-[color:var(--color-ink)] mb-4">
            Build your first institutional skill in Module&nbsp;7.
          </h3>
          <p className="text-[color:var(--color-ink)]/75 max-w-xl mx-auto mb-6 leading-relaxed">
            The AiBI Foundations certification covers the full five-component
            skill anatomy, the RTFC Framework, and a guided skill-builder that
            produces a deployable Markdown file in 30 minutes. Twelve pre-built
            skill templates across four banking roles are included.
          </p>
          <Link
            href="/education"
            className="inline-block px-8 py-4 bg-[color:var(--color-terra)] text-[color:var(--color-linen)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--color-terra-light)] active:scale-[0.98] transition-all"
          >
            View the AiBI Foundations Certification
          </Link>
        </aside>

        <footer className="mt-16 pt-8 border-t border-[color:var(--color-ink)]/10">
          <p className="font-mono text-xs text-[color:var(--color-ink)]/70 leading-relaxed">
            <strong>Sources:</strong> AiBI Foundations curriculum, Modules 6
            and 7: Anatomy of a Skill and Write Your First Skill. Getting Started
            in AI, Jack Henry &amp; Associates, 2025, citing Gartner Peer
            Community data (57% of FIs struggle with AI skill gaps). Platform
            configuration references: ChatGPT (Custom Instructions / Projects /
            GPTs), Claude (Projects with system prompts), Gemini (Gems),
            Perplexity (Spaces), Microsoft 365 Copilot (admin-configured).
            Figures verified as of April 2026.
          </p>
        </footer>
      </article>
    </main>
  );
}
