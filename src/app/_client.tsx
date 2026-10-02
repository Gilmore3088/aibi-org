'use client';

import { SiteHeader, Button, ArrowGlyph } from '@/components/mockup';
import { AiSession } from '@/components/home/AiSession';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ResourceCovers, OfferPair } from '@/components/home/HomeSections';
import { PromptChecker } from '@/components/home/PromptChecker';
import { ROICalculatorBody } from '@/components/sections/ROICalculatorBody';
import { getPracticeRepById } from '@content/practice-reps/foundation-program';

// Homepage — "Vault" rebuild. One idea per section, real artifacts instead of
// illustrations, and a single moving element (the hero AI session).

// The risky prompt the Module 9 rep asks the learner to sanitize. Synthetic.
const RISKY_PROMPT =
  'write a quick reply to John Smith — he’s furious we charged him 3 overdraft fees in one day on account 0042871. dob 04/12/1981. wants them reversed';

const HERO_REP = getPracticeRepById('safe-prompt-conversion');
const HERO_PROMPT = HERO_REP
  ? HERO_REP.starterPrompt.replace('[PASTE PROMPT]', `\n\n“${RISKY_PROMPT}”`)
  : '';

const HERO_CHECKS = ['No customer data', 'Template, not a decision', 'Banker reviews before use'] as const;

export default function HomePage() {
  return (
    <div className="mockup-scope hm">
      <SiteHeader activePath="/" />

      <section className="hm-hero">
        <div className="mk-container hm-hero-inner">
          <div className="hm-hero-copy">
            <p className="hm-k hm-gold">For community banks &amp; credit unions</p>
            <h1 className="hm-display">
              Is your team ready to use AI <span className="hm-gold">safely</span>?
              <span className="hm-hero-sub">Find out in three minutes.</span>
            </h1>
            <div className="hm-hero-cta">
              <Button variant="gold" size="lg" href="/assessment/take">
                Get my readiness score <ArrowGlyph />
              </Button>
            </div>
            <p className="hm-hero-meta">Free · 12 questions · Practical next step</p>
          </div>
          {HERO_REP && (
            <AiSession
              label={`Practice rep · Module ${HERO_REP.moduleNumber}`}
              prompt={HERO_PROMPT}
              answer={HERO_REP.modelAnswer}
              checks={HERO_CHECKS}
              footnote="Example from the Foundation course. Synthetic data."
            />
          )}
        </div>
      </section>

      <section className="hm-light" aria-labelledby="hm-steps-title">
        <div className="mk-container">
          <h2 id="hm-steps-title" className="hm-display">
            Assess. Train. Build.
          </h2>
          <HowItWorks />
        </div>
      </section>

      <PromptChecker />
      <ResourceCovers />

      <section id="roi-calculator" className="hm-roi" aria-labelledby="hm-roi-title">
        <div className="mk-container">
          <p className="hm-k hm-gold">Impact</p>
          <h2 id="hm-roi-title" className="hm-display">
            What are a few hours a week <span className="hm-gold">worth</span>?
          </h2>
          <p className="hm-roi-lede">Set your team size, cost and hours. The value updates as you move.</p>
          <div className="hm-roi-window">
            <ROICalculatorBody ctaLabel="Take the Assessment" ctaHref="/assessment/take" briefingSource="home" />
          </div>
        </div>
      </section>

      <OfferPair />

      <section className="hm-close">
        <div className="mk-container">
          <h2 className="hm-display">
            Three minutes.
            <span className="hm-gold"> Then you’ll know.</span>
          </h2>
          <Button variant="gold" size="lg" href="/assessment/take">
            Get my readiness score <ArrowGlyph />
          </Button>
        </div>
      </section>
    </div>
  );
}
