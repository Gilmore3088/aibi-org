'use client';

import { useState } from 'react';
import { trackBriefSubscribed } from '@/lib/analytics/events';

interface NewsletterCTAProps {
  readonly email: string;
}

type Status = 'idle' | 'submitting' | 'subscribed' | 'error';

export function NewsletterCTA({ email }: NewsletterCTAProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubscribe() {
    setStatus('submitting');
    setMessage(null);
    try {
      const res = await fetch('/api/subscribe-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No honeypot field on this CTA — the user is already authenticated
        // by virtue of having completed the assessment + provided email
        // upstream. Bots can't reach this surface.
        body: JSON.stringify({ email, source: 'assessment-results' }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 429) {
          throw new Error('Too many attempts. Please try again in a minute.');
        }
        throw new Error(data.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('subscribed');
      trackBriefSubscribed({ source: 'assessment-results' });
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'subscribed') {
    return (
      <div className="border border-[color:var(--ink-2)]/30 bg-[color:var(--ink-2)]/5 p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--ink-2)] mb-2">
          Subscribed
        </p>
        <p className="font-serif text-xl text-[color:var(--color-ink)]">
          You are on the list. The next AI Banking Brief is headed your way.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-6 md:p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-ink)]/70 mb-3">
        Not ready for a conversation?
      </p>
      <h3 className="font-serif text-2xl md:text-3xl text-[color:var(--color-ink)] mb-3">
        Get the AI Banking Brief
      </h3>
      <p className="text-[color:var(--color-ink)]/70 max-w-lg mx-auto mb-5 leading-relaxed">
        One short analysis a week, written for community bank leaders.
        Unsubscribe anytime, one click.
      </p>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={status === 'submitting'}
        className="inline-block px-6 py-3 border border-[color:var(--gold)] text-[color:var(--gold)] font-sans text-[11px] font-semibold uppercase tracking-[1.2px] rounded-[2px] hover:bg-[color:var(--gold)] hover:text-[color:var(--color-linen)] transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Adding you…' : 'Add me to the Brief'}
      </button>
      {message && (
        <p className="text-sm text-[color:var(--color-error)] mt-3" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
