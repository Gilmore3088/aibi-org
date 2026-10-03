import type { Metadata } from 'next';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { PLAYBOOK_FOCUS, PLAYBOOK_INDEX, PLAYBOOKS } from './data';

export const metadata: Metadata = {
  title: 'Role Playbooks — The AI Banking Institute',
  description:
    'Nine role playbooks for community banks and credit unions — compliance, retail, marketing, lending, BSA/AML, IT/InfoSec, executive, operations, and training/HR. Reviewed prompts and reusable templates.',
};

const INSIDE = [
  { title: 'Use cases', body: 'Where the role can use AI, the risk of each, and the document it leaves.' },
  { title: 'Workflow', body: 'Four steps from idea to approved, reviewable work.' },
  { title: 'Checklist', body: 'What a reviewer checks before AI output is used.' },
  { title: 'Templates', body: 'Ready-to-use files you can open and adapt today.' },
] as const;

export default function PlaybooksIndexPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks --roles ${PLAYBOOK_INDEX.length}`}
        title="A playbook for every seat at the bank."
        lede="Each one maps the work AI can help with, the review it needs, and the documents your team keeps."
        actions={
          <>
            <Button variant="gold" size="lg" href="#roles">
              Find your role <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/assessment/take">
              Take the free assessment
            </Button>
          </>
        }
        aside={
          <AxWindow title="playbooks/" meta={`${PLAYBOOK_INDEX.length} folders`} flush>
            <ul className="pb-tree">
              {PLAYBOOK_INDEX.map((p) => {
                const pb = PLAYBOOKS[p.slug];
                return (
                  <li key={p.slug}>
                    <a href={`/playbooks/${p.slug}`}>
                      <span className="pb-tree-name">{p.slug}/</span>
                      <span className="pb-tree-meta">{pb.uses[0]?.artifact}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </AxWindow>
        }
      />

      <main>
        <AxSection light id="roles" kicker="Pick your seat" title="Nine roles. One structure.">
          <div className="pb-roles">
            {PLAYBOOK_INDEX.map((p) => {
              const pb = PLAYBOOKS[p.slug];
              return (
                <a key={p.slug} className="pb-role" href={`/playbooks/${p.slug}`}>
                  <span className="ax-k ax-gold">{PLAYBOOK_FOCUS[p.slug]}</span>
                  <span className="pb-role-title">{p.title}</span>
                  <span className="pb-role-desc">{p.desc}</span>
                  <span className="pb-role-outs" aria-label="Documents it produces">
                    {pb.uses.slice(0, 3).map((u) => (
                      <span key={u.artifact}>{u.artifact}</span>
                    ))}
                  </span>
                  <span className="pb-role-open">
                    Open playbook <span aria-hidden="true">→</span>
                  </span>
                </a>
              );
            })}
          </div>
        </AxSection>

        <AxSection id="inside" kicker="Inside each playbook" title="Four views. One review standard.">
          <ol className="ax-pipeline" style={{ ['--ax-steps' as string]: 4 }} aria-label="What each playbook contains">
            {INSIDE.map((item, index) => (
              <li key={item.title} className={index === 0 ? 'is-first' : undefined}>
                <span className="ax-pipeline-node" aria-hidden="true" />
                <span className="ax-k">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </AxSection>
      </main>

      <section className="ax-section ax-close ax-light">
        <div className="mk-container">
          <h2 className="ax-display">
            Not sure where to start? <span className="ax-gold">Score your readiness.</span>
          </h2>
          <p className="ax-muted">Twelve questions. Your results point to the playbook for your role.</p>
          <div className="ax-actions">
            <Button variant="gold" size="lg" href="/assessment/take">
              Take the free assessment <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses">
              See the course
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
