// /courses/aibi-l/request — Workshop request form
// Client Component: form state management
// Not a checkout — this is a sales conversation entry point

'use client';

import { useState } from 'react';
import Link from 'next/link';

const TEAM_SIZE_OPTIONS = [
  { value: '1', label: '1 (individual)' },
  { value: '2-4', label: '2-4 executives' },
  { value: '5-8', label: '5-8 (team workshop)' },
  { value: '9+', label: '9+ (custom quote)' },
] as const;

interface FormData {
  name: string;
  email: string;
  title: string;
  institution: string;
  teamSize: string;
  preferredDates: string;
  message: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  title: '',
  institution: '',
  teamSize: '',
  preferredDates: '',
  message: '',
};

export default function WorkshopRequestPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          source: 'aibi-l-request',
          metadata: {
            name: form.name,
            title: form.title,
            institution: form.institution,
            teamSize: form.teamSize,
            preferredDates: form.preferredDates,
            message: form.message,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-sage)]">
            Request Received
          </span>
        </div>
        <h1 className="font-serif text-4xl font-bold text-[color:var(--color-ink)] mb-6">
          Thank you, {form.name.split(' ')[0]}.
        </h1>
        <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed mb-8">
          The AI Banking Institute will respond within 2 business days
          with a planning call invitation to customize your workshop.
        </p>
        <Link
          href="/courses/aibi-l"
          className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[color:var(--color-sage)] hover:opacity-70 transition-opacity"
        >
          <svg className="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Back to Workshop Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-8 py-20">

      {/* Breadcrumb */}
      <nav className="mb-10" aria-label="Breadcrumb">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
          <Link
            href="/courses/aibi-l"
            className="text-[color:var(--color-sage)] hover:opacity-70 transition-opacity"
          >
            AiBI-L
          </Link>
          <span className="text-[color:var(--color-dust)]" aria-hidden="true">/</span>
          <span className="text-[color:var(--color-dust)]">Request Workshop</span>
        </div>
      </nav>

      <header className="mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[color:var(--color-ink)] mb-4 leading-tight">
          Request a <span className="italic text-[color:var(--color-sage)]">Workshop</span>
        </h1>
        <p className="font-serif italic text-lg text-[color:var(--color-slate)] leading-relaxed">
          The AI Banking Institute will respond within 2 business days with a planning call
          invitation to customize your workshop with your institution&apos;s data.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
            placeholder="jsmith@firstnational.bank"
          />
        </div>

        <div>
          <label
            htmlFor="title"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
            placeholder="CEO, CFO, COO, Board Chair, etc."
          />
        </div>

        <div>
          <label
            htmlFor="institution"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Institution *
          </label>
          <input
            id="institution"
            name="institution"
            type="text"
            required
            value={form.institution}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
            placeholder="First National Bank"
          />
        </div>

        <div>
          <label
            htmlFor="teamSize"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Team Size *
          </label>
          <select
            id="teamSize"
            name="teamSize"
            required
            value={form.teamSize}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
          >
            <option value="">Select team size</option>
            {TEAM_SIZE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="preferredDates"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Preferred Dates
          </label>
          <input
            id="preferredDates"
            name="preferredDates"
            type="text"
            value={form.preferredDates}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent"
            placeholder="e.g., Q3 2026, or specific dates"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--color-dust)] mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            className="w-full bg-[color:var(--color-parch)] border border-[color:var(--color-sage)]/15 rounded-sm px-4 py-3 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-dust)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:border-transparent resize-none"
            placeholder="Any context about your institution, goals, or questions"
          />
        </div>

        {status === 'error' && (
          <p className="font-sans text-sm text-[color:var(--color-error)]" role="alert">
            Something went wrong. Please try again or contact us directly.
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-[color:var(--color-sage)] hover:opacity-90 text-[color:var(--color-linen)] px-8 py-4 rounded-sm font-bold text-[10px] uppercase tracking-[0.15em] transition-opacity font-mono focus:outline-none focus:ring-2 focus:ring-[color:var(--color-sage)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Submitting...' : 'Request Workshop'}
        </button>

        <p className="font-sans text-[11px] text-[color:var(--color-dust)] text-center leading-relaxed">
          This is not a purchase. The AI Banking Institute will contact you
          to schedule a planning call before confirming the workshop.
        </p>
      </form>
    </div>
  );
}
