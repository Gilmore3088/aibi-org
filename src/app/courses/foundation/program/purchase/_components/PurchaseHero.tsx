import type { ReactNode } from 'react';
import { foundationDurationLabel } from '@content/courses/foundation-program';
import { SavedPromptCard } from './SavedPromptCard';

const INTER_STACK =
  'var(--font-inter, Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif)';

interface PurchaseHeroProps {
  /** The real checkout button. Rendered directly so the hero CTA starts Stripe
   *  in ONE click — it previously was an anchor that just scrolled down to a
   *  second "Enroll" button (the redundant middle click buyers complained
   *  about). */
  enrollButton: ReactNode;
}

export function PurchaseHero({ enrollButton }: PurchaseHeroProps) {
  return (
    <section
      className="aibi-grid aibi-grid--2 aibi-pad-section"
      style={{
        marginBottom: 48,
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        padding: '48px 44px',
        borderRadius: 32,
        boxShadow: 'var(--shadow-hero)',
        gap: 36,
        alignItems: 'center',
      }}
    >
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 999,
            border: '1px solid var(--gold-a40)',
            background: 'var(--gold-a10)',
            color: 'var(--gold-soft)',
            fontFamily: INTER_STACK,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            marginBottom: 22,
          }}
        >
          AiBI-Foundation · 18 bite-sized modules · $295
        </span>

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'rgba(247, 243, 234, 0.72)',
            margin: '0 0 18px',
          }}
        >
          {foundationDurationLabel()}
        </p>

        <h1
          style={{
            fontFamily: INTER_STACK,
            fontWeight: 700,
            fontSize: 'clamp(36px, 4.2vw, 56px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            margin: '0 0 20px',
            color: '#fff',
          }}
        >
          Build an 18-piece Foundation Packet with{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
            labs, prompts, and review-ready workflows
          </span>
          .
        </h1>

        <p
          style={{
            fontFamily: INTER_STACK,
            fontSize: 17,
            lineHeight: 1.55,
            color: 'rgba(247, 243, 234, 0.84)',
            margin: '0 0 24px',
            maxWidth: '46ch',
          }}
        >
          Each module starts with the artifact, runs a contained AiBI Lab, and
          ends with a saved work product your manager or compliance partner can review.
        </p>

        <div style={{ maxWidth: 320 }}>{enrollButton}</div>
      </div>

      <div>
        <SavedPromptCard />
      </div>
    </section>
  );
}
