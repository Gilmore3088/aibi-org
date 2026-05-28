// Purchase-page hero — dark navy panel with the real SavedPromptCard
// artifact rendered on the right. The CTA anchors to #enroll.

import Link from 'next/link';
import { INTER_STACK } from './purchaseConstants';
import { SavedPromptCard } from './SavedPromptCard';

export function PurchaseHero() {
  return (
    <section
      style={{
        marginBottom: 48,
        background: 'var(--ink)',
        color: 'var(--cream-2)',
        padding: '48px 44px',
        borderRadius: 32,
        boxShadow: 'var(--shadow-hero)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
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
          AiBI-Foundation · 12 modules · $295 · Lifetime
        </span>

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
          Walk away with a saved-prompt library and{' '}
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>
            documented workflows your examiner can read
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
          Twelve self-paced modules turn the AI conversation into a set of reviewed
          work products you actually use. By the time you finish, your prompt library,
          your Acceptable Use card, and your reviewed work product are on your desk.
        </p>

        <Link
          href="#enroll"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--gold)',
            color: 'var(--ink)',
            padding: '14px 26px',
            borderRadius: 12,
            fontFamily: INTER_STACK,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Enroll for $295 →
        </Link>
      </div>

      <div>
        <SavedPromptCard />
      </div>
    </section>
  );
}
