import Image from 'next/image';
import Link from 'next/link';
import { FOUNDATION_MICRO_MODULES } from '@content/courses/foundation-program/micro-modules';

// Static homepage sections for the "Vault" rebuild. Every visual is a real
// artifact — the first pages of real downloads — not an illustration of one.

/* ── Real downloads, shown as their actual first pages ───────────────── */

// Covers are rendered from the committed PDFs by scripts/render-pdf-covers.sh.
const COVERS = [
  { slug: 'banker-prompt-formula-card', title: 'The Banker Prompt Formula' },
  { slug: 'artifact-data-handling-reference-card', title: 'Data Handling Reference Card' },
  { slug: 'compliance-playbook', title: 'The Compliance Officer’s AI Governance Playbook' },
  { slug: 'prompt-output-review-checklist', title: 'Prompt Output Review Checklist' },
] as const;

export function ResourceCovers() {
  return (
    <section className="hm-kit" aria-labelledby="hm-kit-title">
      <div className="mk-container hm-kit-inner">
        <div className="hm-kit-copy">
          <h2 id="hm-kit-title" className="hm-display">
            Take the paperwork.
          </h2>
          <p>Real checklists, cards and playbooks. Free.</p>
          <Link href="/resources" className="hm-link">
            Browse all resources →
          </Link>
        </div>
        <ul className="hm-kit-stack">
          {COVERS.map((c) => (
            <li key={c.slug}>
              <Link href={`/resources/${c.slug}`} aria-label={c.title}>
                <Image
                  src={`/downloads/covers/${c.slug}.jpg`}
                  alt={`${c.title} — first page`}
                  width={640}
                  height={828}
                  sizes="(min-width: 1024px) 220px, 40vw"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── The two paid offers ─────────────────────────────────────────────── */

export function OfferPair() {
  return (
    <section className="hm-offers" aria-label="Paid programs">
      <div className="mk-container hm-offers-grid">
        <Link href="/assessment/in-depth" className="hm-offer">
          <Image
            src="/downloads/covers/in-depth-playbook.jpg"
            alt="Your First AI Win — 90-day playbook, first page"
            width={640}
            height={828}
            sizes="120px"
          />
          <span>
            <span className="hm-k hm-gold">In-Depth Assessment</span>
            <span className="hm-offer-title">Report + 90-day playbook. $99.</span>
          </span>
        </Link>
        <Link href="/courses" className="hm-offer">
          <Image
            src="/downloads/covers/prompting-foundation-guide.jpg"
            alt="Prompt Like a Banker card, first page"
            width={640}
            height={828}
            sizes="120px"
          />
          <span>
            <span className="hm-k hm-gold">AiBI Foundation</span>
            <span className="hm-offer-title">
              {FOUNDATION_MICRO_MODULES.length} modules. Real practice. $295.
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
