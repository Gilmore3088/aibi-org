import Link from 'next/link';

export interface DashboardResource {
  readonly href: string;
  readonly tag: string;
  readonly title: React.ReactNode;
  readonly meta: string;
  readonly icon: 'brief' | 'failures' | 'governance' | 'library';
}

export function ResourceCard({
  resource,
}: {
  readonly resource: DashboardResource;
}) {
  return (
    <Link className="res-card" href={resource.href}>
      <div className="ricon" aria-hidden="true">
        <ResourceIcon icon={resource.icon} />
      </div>
      <span className="tag">{resource.tag}</span>
      <h4>{resource.title}</h4>
      <div className="fmeta">
        <span>{resource.meta}</span>
        <span className="arrow">→</span>
      </div>
    </Link>
  );
}

function ResourceIcon({ icon }: { readonly icon: DashboardResource['icon'] }) {
  if (icon === 'failures') {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="6" y="10" width="36" height="28" fill="var(--gold-a10)" />
        <line x1="6" y1="18" x2="42" y2="18" />
        <line x1="18" y1="10" x2="18" y2="38" />
        <line x1="30" y1="10" x2="30" y2="38" />
        <rect x="9" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
        <rect x="21" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
        <rect x="33" y="22" width="6" height="3" fill="var(--gold-deep)" stroke="none" />
      </svg>
    );
  }
  if (icon === 'governance') {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M8 10 L40 10 L40 32 L26 32 L18 38 L18 32 L8 32 Z" fill="var(--gold-a10)" />
        <line x1="14" y1="18" x2="34" y2="18" opacity="0.6" />
        <line x1="14" y1="24" x2="28" y2="24" opacity="0.6" />
        <circle cx="14" cy="14" r="1.5" fill="var(--gold-deep)" stroke="none" />
        <circle cx="20" cy="14" r="1.5" fill="var(--gold-deep)" stroke="none" />
      </svg>
    );
  }
  if (icon === 'library') {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="8" y="6" width="32" height="36" fill="var(--gold-a10)" />
        <line x1="14" y1="14" x2="34" y2="14" strokeWidth="2" />
        <line x1="14" y1="20" x2="34" y2="20" opacity="0.6" />
        <line x1="14" y1="24" x2="34" y2="24" opacity="0.6" />
        <line x1="14" y1="28" x2="28" y2="28" opacity="0.6" />
        <rect x="14" y="33" width="20" height="5" fill="var(--gold-deep)" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="10" y="6" width="28" height="36" fill="var(--gold-a10)" />
      <line x1="14" y1="14" x2="34" y2="14" />
      <line x1="14" y1="20" x2="28" y2="20" opacity="0.6" />
      <line x1="14" y1="26" x2="32" y2="26" opacity="0.6" />
    </svg>
  );
}

export const DASHBOARD_RESOURCES: readonly DashboardResource[] = [
  {
    href: '/resources/the-skill-not-the-prompt',
    tag: 'Briefing',
    title: <>The <strong>skill</strong>, not the prompt.</>,
    meta: 'Briefing · 8 min read',
    icon: 'brief',
  },
  {
    href: '/resources/six-ways-ai-fails-in-banking',
    tag: 'Briefing',
    title: <>Six ways AI <strong>fails</strong> in banking.</>,
    meta: 'Briefing · 10 min read',
    icon: 'failures',
  },
  {
    href: '/resources/ai-governance-without-the-jargon',
    tag: 'Briefing',
    title: <>AI governance, <strong>without</strong> the jargon.</>,
    meta: 'Briefing · 12 min read',
    icon: 'governance',
  },
  {
    href: '/resources',
    tag: 'All resources',
    title: <>The AI Banking <strong>Resource Library.</strong></>,
    meta: 'Playbooks, templates, cards',
    icon: 'library',
  },
];
