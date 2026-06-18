// /assessment/in-depth/results/[id] typed not-found state.
//
// Without this, a stale or malformed result-id falls to the site-wide 404
// component ("That page is not in our archive.") with a free-assessment CTA
// — confusing for a paid In-Depth buyer who is trying to reach their report
// via a bookmark or forwarded link. Issue #325.

import Link from 'next/link';
import { SiteHeader } from '@/components/mockup';

export default function InDepthResultsNotFound() {
  return (
    <div className="mockup-scope">
      <SiteHeader
        activePath="/assessment/in-depth"
        cta={{ label: 'Take the In-Depth', href: '/assessment/in-depth' }}
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
            className="text-5xl leading-tight"
            style={{
              color: 'var(--ink)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.1,
            }}
          >
            We couldn&apos;t find that briefing.
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--slate-600)', lineHeight: 1.55 }}
          >
            The link may be from an old session or the result may have been
            deleted. If you completed the In-Depth Assessment, a link to your
            briefing was emailed to you — check your inbox. Every briefing
            you&apos;ve completed also lives on your dashboard; sign in below to
            open it.
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
              href="/assessment/in-depth"
              className="inline-block px-8 py-4 text-[11px] uppercase transition-all"
              style={{
                border: '1px solid var(--ink-a15)',
                color: 'var(--ink)',
                fontWeight: 600,
                letterSpacing: '1.2px',
                borderRadius: 12,
              }}
            >
              About the In-Depth
            </Link>
          </div>
          <p
            className="pt-6 text-xs"
            style={{ color: 'var(--slate-500)' }}
          >
            Stuck?{' '}
            <a
              href="mailto:hello@aibankinginstitute.com"
              style={{ color: 'var(--gold-deep)', textDecoration: 'underline' }}
            >
              hello@aibankinginstitute.com
            </a>{' '}
            — we&apos;ll resend your briefing link.
          </p>
        </div>
      </main>
    </div>
  );
}
