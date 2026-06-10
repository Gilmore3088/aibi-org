// /results/[id] typed not-found state.
//
// Without this, a stale or malformed result link falls to the site-wide 404
// ("That page is not in our archive.") — confusing for a returning lead who
// clicked the results link from their own assessment email (journey audit
// 2026-06-10, F6). Mirrors the In-Depth results not-found (issue #325).

import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';

export default function ResultsNotFound() {
  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/assessment"
        cta={{ label: 'Take the assessment', href: '/assessment/take' }}
      />
      <main
        className="px-6 py-16 md:py-24"
        style={{
          background: 'var(--cream)',
          minHeight: '60vh',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div className="mx-auto max-w-2xl text-center space-y-6">
          <p
            className="text-xs uppercase"
            style={{
              color: 'var(--gold-deep)',
              fontWeight: 600,
              letterSpacing: '0.2em',
            }}
          >
            404 · Result not found
          </p>
          <h1
            style={{
              color: 'var(--ink)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.1,
            }}
          >
            We couldn&apos;t find that result.
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--slate-600)', lineHeight: 1.55 }}
          >
            The link may be from an old session. If you created an account
            after taking the assessment, your results now live in your
            dashboard. Otherwise, the free assessment takes about three
            minutes to retake.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/login?next=/dashboard"
              className="inline-block px-8 py-4 text-[11px] uppercase transition-all active:scale-[0.98]"
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                fontWeight: 600,
                letterSpacing: '1.2px',
                borderRadius: 12,
              }}
            >
              Sign in to your dashboard
            </Link>
            <Link
              href="/assessment/take"
              className="inline-block px-8 py-4 text-[11px] uppercase transition-all"
              style={{
                border: '1px solid var(--ink-a15)',
                color: 'var(--ink)',
                fontWeight: 600,
                letterSpacing: '1.2px',
                borderRadius: 12,
              }}
            >
              Retake the free assessment
            </Link>
          </div>
          <p className="pt-6 text-xs" style={{ color: 'var(--slate-500)' }}>
            Stuck?{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            — we&apos;ll resend your results link.
          </p>
        </div>
      </main>
    </div>
  );
}
