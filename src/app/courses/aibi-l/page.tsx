// /courses/aibi-l — Workshop overview page
// Server Component: static content, no enrollment state
// Sage accent color throughout (AiBI-L uses --color-sage)

import type { Metadata } from 'next';
import Link from 'next/link';
import { sessions, WORKSHOP_DELIVERABLES } from '@content/courses/aibi-l';

export const metadata: Metadata = {
  title: 'AiBI-L: Banking AI Leader | The AI Banking Institute',
  description:
    'A 1-day in-person workshop for C-suite executives and board members at community banks and credit unions. Strategy, governance, and efficiency modeling — leave with a board-ready AI presentation built with your numbers.',
};

const SCHEDULE: readonly { time: string; label: string; duration?: string }[] = [
  { time: '8:30 AM', label: 'Arrival and introductions' },
  { time: '9:00 AM', label: 'Session 1: The Strategic Landscape', duration: '90 min' },
  { time: '10:30 AM', label: 'Break', duration: '15 min' },
  { time: '10:45 AM', label: 'Session 2: Governance and Examiner Readiness', duration: '90 min' },
  { time: '12:15 PM', label: 'Working lunch', duration: '45 min' },
  { time: '1:00 PM', label: 'Session 3: Efficiency Modeling with Your Numbers', duration: '90 min' },
  { time: '2:30 PM', label: 'Break', duration: '15 min' },
  { time: '2:45 PM', label: 'Session 4: The Board Presentation', duration: '60 min' },
  { time: '3:45 PM', label: 'Closing and next steps', duration: '15 min' },
];

export default function AiBILOverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-20">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <Link
          href="/courses"
          className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink)]/50 hover:text-[color:var(--color-sage)] transition-colors"
        >
          Courses
        </Link>
        <span className="mx-2 text-[color:var(--color-ink)]/20">/</span>
        <span className="font-serif-sc text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-sage)]">
          AiBI-L
        </span>
      </nav>

      {/* Hero */}
      <section className="mb-28" aria-labelledby="workshop-heading">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-sage)]">
            AiBI-L
          </span>
          <div className="h-px w-8 bg-[color:var(--color-sage)]/30" aria-hidden="true" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-dust)]">
            Banking AI Leader
          </span>
        </div>

        <h1
          id="workshop-heading"
          className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-10 text-[color:var(--color-ink)]"
        >
          Banking AI<br />
          <span className="text-[color:var(--color-sage)] italic">Leader</span>
        </h1>

        <p className="font-serif italic text-xl sm:text-2xl text-[color:var(--color-slate)] max-w-2xl leading-relaxed mb-8">
          A 1-day in-person workshop for the executives who set strategy, approve budgets, and
          answer to examiners. Leave with a board-ready AI presentation built with your numbers.
        </p>

        <div className="flex flex-wrap gap-x-10 gap-y-3 mb-12">
          {[
            { label: 'Format', value: '1-day in-person workshop' },
            { label: 'Audience', value: 'C-suite and board members' },
            { label: 'Sessions', value: '4 facilitated sessions' },
            { label: 'Prerequisite', value: 'Institutional relationship' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)]">
                {label}
              </span>
              <span className="font-mono text-[9px] text-[color:var(--color-sage)] tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/courses/aibi-l/request"
            className="bg-[color:var(--color-sage)] hover:opacity-90 text-[color:var(--color-linen)] px-10 py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-opacity flex items-center gap-3 font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2"
          >
            Request Workshop
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <a
            href="#sessions-heading"
            className="border border-[color:var(--color-sage)]/20 text-[color:var(--color-ink)] px-10 py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[color:var(--color-parch)] transition-colors font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2"
          >
            View Sessions
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-28" aria-labelledby="pricing-heading">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[color:var(--color-sage)]/10 border border-[color:var(--color-sage)]/10 rounded-sm overflow-hidden">
          <div className="bg-[color:var(--color-linen)] p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-dust)] mb-3">
              Individual Executive
            </p>
            <p className="font-mono text-4xl tabular-nums text-[color:var(--color-ink)] mb-2">
              $2,800<span className="text-lg text-[color:var(--color-dust)]">+</span>
            </p>
            <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
              Single executive attending a scheduled multi-institution workshop
            </p>
          </div>
          <div className="bg-[color:var(--color-linen)] p-10">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-dust)] mb-3">
              Team of 8
            </p>
            <p className="font-mono text-4xl tabular-nums text-[color:var(--color-ink)] mb-2">
              $12,000
            </p>
            <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
              Private workshop at your institution with your leadership team
            </p>
          </div>
        </div>
      </section>

      {/* Four Sessions */}
      <section className="mb-28" aria-labelledby="sessions-heading">
        <div className="mb-14">
          <h2
            id="sessions-heading"
            className="font-serif text-4xl sm:text-5xl font-bold mb-3 text-[color:var(--color-ink)]"
          >
            Four <span className="italic">Sessions</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-sage)] mb-5" aria-hidden="true" />
          <p className="font-serif italic text-lg text-[color:var(--color-slate)] max-w-xl">
            Each session builds on the previous. Every session produces a deliverable you keep.
          </p>
        </div>

        <div className="space-y-4" role="list" aria-label="Workshop sessions">
          {sessions.map((session) => (
            <Link
              key={session.number}
              href={`/courses/aibi-l/${session.number}`}
              role="listitem"
              className="block bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/10 rounded-sm p-8 hover:border-[color:var(--color-sage)]/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[11px] tabular-nums text-[color:var(--color-sage)]">
                      S{session.number}
                    </span>
                    <div className="h-px flex-1 max-w-[3rem] bg-[color:var(--color-sage)]/20" aria-hidden="true" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] tabular-nums">
                      {session.durationMinutes} min
                    </span>
                    <span className="font-mono text-[9px] text-[color:var(--color-dust)]">
                      {session.startTime}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[color:var(--color-ink)] mb-2 leading-tight">
                    {session.title}
                  </h3>
                  <p className="font-serif italic text-sm text-[color:var(--color-slate)] leading-relaxed mb-3">
                    {session.coreQuestion}
                  </p>
                  <p className="font-sans text-xs text-[color:var(--color-slate)]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)]">
                      Deliverable:
                    </span>{' '}
                    {session.deliverable}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-[color:var(--color-sage)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Day Schedule */}
      <section className="mb-28" aria-labelledby="schedule-heading">
        <div className="bg-[color:var(--color-parch)] p-8 sm:p-12 border border-[color:var(--color-sage)]/10 rounded-sm">
          <h2
            id="schedule-heading"
            className="font-serif text-3xl font-bold mb-2 text-[color:var(--color-ink)]"
          >
            The Day
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-sage)] mb-8" aria-hidden="true" />

          <div className="space-y-0" role="list" aria-label="Day schedule">
            {SCHEDULE.map(({ time, label, duration }) => (
              <div
                key={time}
                role="listitem"
                className="flex items-baseline gap-4 py-3 border-b border-[color:var(--color-sage)]/8 last:border-b-0"
              >
                <span className="font-mono text-xs tabular-nums text-[color:var(--color-sage)] w-20 shrink-0">
                  {time}
                </span>
                <span className="font-sans text-sm text-[color:var(--color-ink)] flex-1">
                  {label}
                </span>
                {duration && (
                  <span className="font-mono text-[9px] text-[color:var(--color-dust)] tabular-nums shrink-0">
                    {duration}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Leave With */}
      <section className="mb-28" aria-labelledby="deliverables-heading">
        <div className="mb-14">
          <h2
            id="deliverables-heading"
            className="font-serif text-4xl sm:text-5xl font-bold mb-3 text-[color:var(--color-ink)]"
          >
            What You <span className="italic">Leave With</span>
          </h2>
          <div className="w-12 h-px bg-[color:var(--color-sage)] mb-5" aria-hidden="true" />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list"
          aria-label="Workshop deliverables"
        >
          {WORKSHOP_DELIVERABLES.map((deliverable) => (
            <div
              key={deliverable.id}
              role="listitem"
              className="bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/10 rounded-sm p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-sage)]">
                  Session {deliverable.producedInSession}
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[color:var(--color-ink)] mb-2">
                {deliverable.title}
              </h3>
              <p className="font-sans text-xs text-[color:var(--color-slate)] leading-relaxed">
                {deliverable.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16" aria-labelledby="cta-heading">
        <h2
          id="cta-heading"
          className="font-serif text-3xl sm:text-4xl font-bold mb-4 text-[color:var(--color-ink)]"
        >
          Ready to lead your institution&apos;s AI strategy?
        </h2>
        <p className="font-serif italic text-[color:var(--color-slate)] mb-8 max-w-lg mx-auto">
          The workshop is booked through a planning conversation — not a checkout.
          We customize every session with your institution&apos;s data.
        </p>
        <Link
          href="/courses/aibi-l/request"
          className="inline-flex items-center gap-3 bg-[color:var(--color-sage)] hover:opacity-90 text-[color:var(--color-linen)] px-10 py-5 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-opacity font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2"
        >
          Request Workshop
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
