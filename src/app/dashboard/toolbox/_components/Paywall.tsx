'use client';

import { ArrowGlyph, Button, SiteHeader } from '@/components/mockup';
import { AxHero, AxSection, AxWindow } from '@/components/ax';

const PARTS = [
  { label: 'Library', body: 'Start from banker-vetted prompts and playbooks.' },
  { label: 'AiBI Lab', body: 'Test against sample facts with approved model options.' },
  { label: 'My Toolbox', body: 'Save trusted versions as reusable templates.' },
] as const;

const FLOW = ['Choose a banking-safe starter.', 'Run it with sample facts.', 'Save the reviewed asset.'] as const;

export function Paywall() {
  return (
    <div className="mockup-scope ax-page">
      <SiteHeader activePath="/my-toolbox" />
      <AxHero
        cmd="toolbox --preview"
        title="Your saved prompts and templates."
        lede="Full Toolbox access is included with the paid In-Depth Assessment and the AiBI-Foundation course, so buyers can build, run, save, and export reusable work."
        actions={
          <>
            <Button variant="gold" size="lg" href="/assessment/in-depth">
              Unlock with In-Depth <ArrowGlyph />
            </Button>
            <Button variant="ghost-dark" size="lg" href="/courses">
              View the Foundation course
            </Button>
          </>
        }
        aside={
          <AxWindow title="toolbox/flow.md" meta="preview">
            <ol className="pb-steps">
              {FLOW.map((step, index) => (
                <li key={step}>
                  <span className="pb-step-n">{String(index + 1).padStart(2, '0')}</span>
                  <span className="pb-step-body">
                    <strong>{step}</strong>
                  </span>
                </li>
              ))}
            </ol>
            <p className="pb-toc-for">
              <strong>Unlocks with paid access:</strong> Build, AiBI Lab, save, and export. Free visitors can see the
              workflow.
            </p>
          </AxWindow>
        }
      />
      <main>
        <AxSection light kicker="What's inside" title="What's in the Toolbox.">
          <dl className="ax-defs">
            {PARTS.map((part) => (
              <div key={part.label}>
                <dt>{part.label}</dt>
                <dd>{part.body}</dd>
              </div>
            ))}
          </dl>
        </AxSection>
      </main>
    </div>
  );
}
