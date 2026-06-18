import type { Metadata } from 'next';
import {
  SiteHeader,
  Section,
  SectionHead,
  Button,
  CtaBand,
} from '@/components/mockup';
import { PLAYBOOK_INDEX, PLAYBOOKS } from './data';

export const metadata: Metadata = {
  title: 'Role Playbooks — The AI Banking Institute',
  description:
    'Six role playbooks for community banks and credit unions — compliance, retail, marketing, lending, BSA/AML, and IT/InfoSec. Reviewed prompts and reusable templates.',
};

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
const UsersIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>);
const SendIcon = (p: IconProps) => (<svg {...sw(p)}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
const FileIcon = (p: IconProps) => (<svg {...sw(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
const SearchIcon = (p: IconProps) => (<svg {...sw(p)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
const LockIcon = (p: IconProps) => (<svg {...sw(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const ArrowR = (p: IconProps) => (<svg {...sw(p)}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);

const ICONS: Record<string, typeof ShieldIcon> = {
  compliance: ShieldIcon,
  retail: UsersIcon,
  marketing: SendIcon,
  lending: FileIcon,
  'bsa-aml': SearchIcon,
  infosec: LockIcon,
};

export default function PlaybooksIndexPage() {
  return (
    <div className="mockup-scope">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Start Course', href: '/courses/foundation/program/purchase' }} />

      <section className="mk-hero">
        <div className="mk-deco">
          <div className="mk-deco-ring" />
          <div className="mk-deco-blur" />
        </div>
        <div className="mk-container mk-hero-inner">
          <div>
            <h1>Six role playbooks. Each one ends with usable artifacts.</h1>
            <p className="mk-lede">
              Pick the playbook for your role. Each is built around the same shape — use cases,
              operating model, review checklist, evidence, and Toolbox assets — and ends with
              work products you can ship Monday.
            </p>
            <div className="mk-ctas">
              <Button variant="gold" size="lg" href="/playbooks/compliance">
                Open Compliance <ArrowR className="mk-ic" />
              </Button>
              <Button variant="ghost-dark" size="lg" href="/my-toolbox">
                Browse Toolbox
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Section variant="std">
        <SectionHead kicker="Pick your playbook" heading={<>Pick the playbook for your role.</>} />
        <div className="mk-playbooks" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {PLAYBOOK_INDEX.map(({ slug, title, desc }) => {
            const Icon = ICONS[slug] ?? ShieldIcon;
            const pb = PLAYBOOKS[slug];
            const useCount = pb?.uses.length ?? 0;
            const stepCount = pb?.ops.length ?? 0;
            return (
              <a key={slug} className="mk-pb" href={`/playbooks/${slug}`}>
                <span className="mk-pic">
                  <Icon size={24} />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="mk-count">
                  {useCount} use cases · {stepCount}-step workflow →
                </div>
              </a>
            );
          })}
        </div>
      </Section>

      <CtaBand
        kicker="Role Playbooks"
        heading={<>Six roles. One unified craft.</>}
        body={<>Each playbook is built around the same operating model so the institution gets a coherent rollout instead of six disconnected efforts.</>}
        actions={[
          { label: 'Start the Course', href: '/courses/foundation/program/purchase', variant: 'gold' },
          { label: 'Contact us', href: '/for-institutions', variant: 'ghost-dark' },
        ]}
      />
    </div>
  );
}
