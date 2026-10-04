import type { Metadata } from 'next';
import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';
import { PLAYBOOK_FOCUS, PLAYBOOK_INDEX, PLAYBOOKS } from './data';

export const metadata: Metadata = {
  alternates: { canonical: '/playbooks' },
  title: 'Role Playbooks',
  description:
    'Nine role playbooks for community banks and credit unions, each with fill-in-the-blank AI skills that work in any AI tool and in Claude for Excel, PowerPoint, Word and Outlook.',
};

const INSIDE = [
  { title: 'Learn', body: 'Where AI helps in the role, and what to check before anything goes out.' },
  { title: 'Test', body: 'Sort real examples green, yellow or red. Check a prompt for customer data.' },
  { title: 'Skills', body: 'Fill-in-the-blank skills for the role, plus everyday and Excel and PowerPoint skills.' },
  { title: 'Add to Claude', body: 'Download any skill. It works in Claude chat, Excel, PowerPoint, Word and Outlook.' },
] as const;

export default function PlaybooksIndexPage() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/playbooks" cta={{ label: 'Get readiness score', href: '/assessment/take' }} />

      <AxHero
        cmd={`playbooks --roles ${PLAYBOOK_INDEX.length}`}
        title="A playbook for every seat at the bank."
        lede="Each one is a set of AI skills for the job: fill in the blanks, copy the prompt, or add it to Claude."
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
        <AxSection light id="roles" kicker="Pick your seat" title="Choose your role.">
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

        <AxSection id="inside" kicker="Inside each playbook" title="What each playbook includes.">
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
          <p className="ax-muted">Finish it and the playbook for your role unlocks.</p>
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
