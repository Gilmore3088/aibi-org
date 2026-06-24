import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  SiteHeader,
  Button,
  EyebrowChip,
  CtaBand,
} from '@/components/mockup';
import { PLAYBOOKS, type RoleSlug } from '../data';
import { PlaybookDownloadButton } from '../_components/PlaybookDownloadButton';
import { getAssetsForPlaybook, type PlaybookSlug } from '@content/playbook-assets/data';
import { PlaybookTabs } from './PlaybookTabs';

export function generateStaticParams() {
  return (Object.keys(PLAYBOOKS) as RoleSlug[]).map((role) => ({ role }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ role: string }> },
): Promise<Metadata> {
  const { role } = await params;
  const playbook = (PLAYBOOKS as Record<string, { eyebrow?: string; lede?: string } | undefined>)[role];
  if (!playbook) {
    return { title: 'Role Playbook — The AI Banking Institute' };
  }
  return {
    title: `${playbook.eyebrow ?? 'Role Playbook'} — The AI Banking Institute`,
    ...(playbook.lede ? { description: playbook.lede } : {}),
  };
}

// Best-effort slug derivation when the playbook data.ts asset name doesn't
// match an asset registry entry by exact title — kebab the name, drop
// punctuation, and let the registry's slug field match.
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type IconProps = { className?: string; size?: number };
const sw = (p: IconProps) => ({
  className: p.className,
  width: p.size,
  height: p.size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

const ShieldIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const LockIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const TargetIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>);

export default async function PlaybookPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const data = PLAYBOOKS[role as RoleSlug];
  if (!data) notFound();
  const builtAssets = getAssetsForPlaybook(role as PlaybookSlug);
  const tabAssets = data.assets.flatMap((asset) => {
    const built = builtAssets.find(
      (a) =>
        a.title.toLowerCase() === asset.name.toLowerCase() ||
        a.slug === toSlug(asset.name),
    );
    const linkable = asset.status === 'Ready' && Boolean(built);
    if (!linkable || !built) {
      return [];
    }

    return {
      name: asset.name,
      type: asset.type,
      linkable: true,
      href: `/playbooks/${role}/${built.slug}`,
      statusLabel: 'Open template',
    };
  });

  return (
    <div className="mockup-scope">
      {/* Nav CTA matches the rest of the site (top-of-funnel readiness),
          so the playbook doesn't ship three identical enroll CTAs (hero +
          footer + nav). Issue #327 (part C). */}
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      {/* HERO */}
      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <EyebrowChip icon={<ShieldIcon className="mk-ic" />}>{data.eyebrow}</EyebrowChip>
            <h1>{data.title}</h1>
            <p className="mk-lede">{data.lede}</p>
            <div className="mk-ctas">
              {/* #327D — restored role-specific label with a real
                  destination context: the purchase page now reads the
                  ?role= query and surfaces role-tailored framing. The
                  label is honest because the param leads somewhere that
                  acknowledges the role, not a generic page. */}
              <Button
                variant="gold"
                size="lg"
                href={`/courses/foundation/program/purchase?role=${role}`}
              >
                Start your {data.eyebrow.replace(/ Playbook$/, '')} path <ArrowR className="mk-ic" />
              </Button>
              <PlaybookDownloadButton
                role={role}
                roleTitle={data.eyebrow.replace(/ Playbook$/, '')}
              />
            </div>
          </div>

          <div className="mk-pb-snap">
            <div className="mk-head">
              <div className="mk-k">Playbook Snapshot</div>
              <div className="mk-t">{data.snapTitle}</div>
            </div>
            <div className="mk-quick">
              {data.snapQuick.map((q, i) => (
                <div key={q.label} className="mk-q">
                  {i === 0 && <LockIcon size={24} />}
                  {i === 1 && <FileIcon size={24} />}
                  {i === 2 && <TargetIcon size={24} />}
                  <div className="mk-l">{q.label}</div>
                  <div className="mk-v">{q.value}</div>
                </div>
              ))}
            </div>
            <div className="mk-ms">
              {data.snapMaturity.map((m) => (
                <div key={m.name} className="mk-ms-row">
                  <div className="mk-top">
                    <div className="mk-l">{m.name}</div>
                    <div className="mk-v">{m.pct}/100</div>
                  </div>
                  <div className="mk-bar">
                    <div className="mk-fill" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mk-pb-snap-note">
              Illustrative preview; your assessment personalizes the scores.
            </p>
            <div className="mk-path">
              <div className="mk-l">Recommended path</div>
              <div className="mk-v">{data.snapPath}</div>
            </div>
          </div>
        </div>
      </section>

      <PlaybookTabs
        usesHeading={data.usesHeading}
        useCases={data.uses}
        opKicker={`${data.eyebrow.split(' ')[0]} operating model`}
        opHeading={data.opHeading}
        steps={data.ops}
        checklist={data.checklist}
        assets={tabAssets}
      />

      <CtaBand
        kicker={`${data.eyebrow}`}
        heading={<>{data.cta.heading}</>}
        body={<>{data.cta.body}</>}
        actions={[
          { label: 'Start the Course', href: '/courses/foundation/program/purchase', variant: 'gold' },
          // /my-toolbox is now auth-gated (#318). Unauth playbook readers
          // would hit a login wall. Send them to the public artifacts hub.
          { label: 'Browse downloads', href: '/resources', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
