'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FREE_ROLES, FREE_ROLE_LABEL, type FreeRole } from '@content/assessments/v3/roles';
import { EMAIL_RE } from '@/lib/email/validate';

// A thin "instant value + email capture" strip that sits directly under the
// hero. Two questions (role, what they need) + an email, then a free resource
// is emailed via the existing /api/capture-email research path. The visitor
// never leaves the page — on success the form swaps to an inline confirmation
// and a few "keep exploring" links.

type NeedKey = 'prompting' | 'safe-use' | 'governance' | 'role-playbook';

interface NeedOption {
  readonly key: NeedKey;
  readonly label: string;
  readonly blurb: string;
  /** Fixed deliverable slug; when null the role's playbook is used instead. */
  readonly artifact: string | null;
  /** Friendly title shown in the success message (role-playbook resolves later). */
  readonly title: string | null;
}

const NEED_OPTIONS: readonly NeedOption[] = [
  {
    key: 'prompting',
    label: 'Writing better prompts',
    blurb: 'Get more out of AI with less trial and error.',
    artifact: 'prompt-strategy-cheat-sheet',
    title: 'Prompt Strategy Cheat Sheet',
  },
  {
    key: 'safe-use',
    label: 'Using AI safely with customer data',
    blurb: 'What’s safe to paste — and what never is.',
    artifact: 'safe-ai-use-checklist',
    title: 'Safe AI Use Checklist',
  },
  {
    key: 'governance',
    label: 'Policy & governance',
    blurb: 'Start an AI policy your examiners will recognize.',
    artifact: 'governance-starter-kit',
    title: 'AI Governance Starter Kit',
  },
  {
    key: 'role-playbook',
    label: 'A playbook for my role',
    blurb: 'The ready-to-use playbook for your department.',
    artifact: null,
    title: null,
  },
];

// Role → that role's free, link-deliverable playbook slug (see
// freeResources.manifest.json — every entry here is status: public, tier: free).
const ROLE_PLAYBOOK: Record<FreeRole, { slug: string; title: string }> = {
  executive: { slug: 'executive-playbook', title: 'Executive AI Board Packet' },
  'compliance-risk': { slug: 'compliance-playbook', title: 'Compliance Playbook' },
  operations: { slug: 'operations-playbook', title: 'Operations Workflow Kit' },
  lending: { slug: 'lending-playbook', title: 'Lending Playbook' },
  'retail-branch': { slug: 'retail-playbook', title: 'Branch / Retail Playbook' },
  marketing: { slug: 'marketing-playbook', title: 'Marketing Playbook' },
  'it-infosec': { slug: 'infosec-playbook', title: 'IT / InfoSec Playbook' },
  'training-hr': { slug: 'training-hr-playbook', title: 'Training-HR Enablement Kit' },
  // "Other" has no role playbook — fall back to the broadly useful starter kit.
  other: { slug: 'governance-starter-kit', title: 'AI Governance Starter Kit' },
};


type Status = 'idle' | 'sending' | 'sent' | 'error';

function resolveDeliverable(role: FreeRole, need: NeedKey): { slug: string; title: string } {
  if (need === 'role-playbook') return ROLE_PLAYBOOK[role];
  const opt = NEED_OPTIONS.find((o) => o.key === need)!;
  return { slug: opt.artifact as string, title: opt.title as string };
}

export function HomeHelpWidget(): JSX.Element {
  const [role, setRole] = useState<FreeRole | ''>('');
  const [need, setNeed] = useState<NeedKey | ''>('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sentTitle, setSentTitle] = useState<string>('');

  const ready = role !== '' && need !== '' && EMAIL_RE.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || status === 'sending') return;
    setStatus('sending');

    const deliverable = resolveDeliverable(role as FreeRole, need as NeedKey);
    try {
      const res = await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          // lead_source carries role + need so the lead is segmentable in
          // MailerLite without changing the capture-route contract.
          lead_source: `home-help/${role}/${need}`,
          requested_artifact: deliverable.slug,
        }),
      });
      if (!res.ok) throw new Error(`capture failed: ${res.status}`);
      setSentTitle(deliverable.title);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="mk-help" aria-labelledby="mk-help-title">
      <div className="mk-container mk-help-inner">
        {status === 'sent' ? (
          <div className="mk-help-done" role="status">
            <p className="mk-help-done-k">On its way ✦</p>
            <h2 id="mk-help-title">
              The {sentTitle} is heading to your inbox.
            </h2>
            <p className="mk-help-done-sub">
              Check {email.trim()} in a minute or two. No call, no commitment — keep exploring while you wait.
            </p>
            <div className="mk-help-done-links">
              <Link href="/resources">Browse all free resources</Link>
              <Link href="/assessment/take">Take the 3-minute readiness assessment</Link>
              <Link href="/playbooks">See the role playbooks</Link>
            </div>
          </div>
        ) : (
          <form className="mk-help-form" onSubmit={handleSubmit} noValidate>
            <div className="mk-help-copy">
              <p className="mk-help-k">Can we help you today?</p>
              <h2 id="mk-help-title">Tell us what you’re working on — we’ll send a free, ready-to-use resource.</h2>
            </div>

            <div className="mk-help-fields">
              <label className="mk-help-field">
                <span>I’m in…</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as FreeRole)}
                  aria-label="Your role"
                  required
                >
                  <option value="" disabled>
                    Choose your role
                  </option>
                  {FREE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {FREE_ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mk-help-field">
                <span>I need help with…</span>
                <select
                  value={need}
                  onChange={(e) => setNeed(e.target.value as NeedKey)}
                  aria-label="What you need help with"
                  required
                >
                  <option value="" disabled>
                    Choose a focus
                  </option>
                  {NEED_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mk-help-field mk-help-field-email">
                <span>Send it to…</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@yourbank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Your work email"
                  required
                />
              </label>

              <button type="submit" className="mk-help-submit" disabled={!ready || status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send it to me'}
              </button>
            </div>

            <p className={`mk-help-note${status === 'error' ? ' is-error' : ''}`}>
              {status === 'error'
                ? 'Something went wrong sending that — please try again in a moment.'
                : 'One email, the resource attached. No call, no spam — unsubscribe anytime.'}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
