import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowGlyph } from '@/components/mockup';

// One connected path shown as four visually distinct product outputs — a
// readiness gauge, a stacked report, a saved-work packet, and a team dashboard
// — so the progression reads as "here is what each step produces," not a wall
// of text. Ported from the modular-home mockup; one dominant visual per card.

// CSS custom property for bar/segment widths (typed for React style props).
const w = (value: string): CSSProperties => ({ ['--w']: value } as CSSProperties);

export function ProductProgression(): JSX.Element {
  return (
    <section className="mk-ppath" aria-labelledby="ppath-title">
      <div className="mk-container">
        <header className="mk-ppath-head">
          <p className="mk-ppath-kicker">The path</p>
          <h2 id="ppath-title">From first check to practical capability.</h2>
        </header>

        <div className="mk-ppath-grid">
          {/* 1 — Readiness Snapshot: a gauge */}
          <article className="mk-ppath-step" data-step="1">
            <div className="mk-ppath-object">
              <div>
                <span className="mk-ppath-price">Free · 3 min</span>
                <h3 className="mk-ppath-name">AI Readiness Snapshot</h3>
              </div>
              <div className="mk-ppath-visual">
                <div className="mk-mini-gauge" style={w('71%')}>
                  <div className="mk-mini-gauge-inner">
                    <strong>34</strong>
                    <span>/ 48</span>
                  </div>
                </div>
              </div>
              <Link className="mk-ppath-link" href="/assessment/take">
                Get my score <ArrowGlyph />
              </Link>
            </div>
          </article>

          {/* 2 — In-Depth Assessment: a stacked report */}
          <article className="mk-ppath-step" data-step="2">
            <div className="mk-ppath-object">
              <div>
                <span className="mk-ppath-price">$99</span>
                <h3 className="mk-ppath-name">In-Depth Assessment</h3>
              </div>
              <div className="mk-ppath-visual">
                <div className="mk-report-stack" aria-hidden="true">
                  <div className="mk-report-page" />
                  <div className="mk-report-page" />
                  <div className="mk-report-page">
                    <div className="mk-report-title" />
                    <div className="mk-report-bar" style={w('75%')} />
                    <div className="mk-report-bar" style={w('58%')} />
                    <div className="mk-report-bar" style={w('84%')} />
                    <div className="mk-report-bar" style={w('66%')} />
                  </div>
                </div>
              </div>
              <Link className="mk-ppath-link" href="/assessment/in-depth">
                View the report <ArrowGlyph />
              </Link>
            </div>
          </article>

          {/* 3 — AiBI-Foundation: a saved-work packet */}
          <article className="mk-ppath-step" data-step="3">
            <div className="mk-ppath-object">
              <div>
                <span className="mk-ppath-price">$295</span>
                <h3 className="mk-ppath-name">AiBI-Foundation</h3>
              </div>
              <div className="mk-ppath-visual">
                <div className="mk-packet-stack" aria-hidden="true">
                  <div className="mk-packet-card" />
                  <div className="mk-packet-card" />
                  <div className="mk-packet-card">
                    <span className="mk-packet-chip">Prompt template</span>
                    <div className="mk-packet-lines">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
              <Link className="mk-ppath-link" href="/courses">
                Explore Foundation <ArrowGlyph />
              </Link>
            </div>
          </article>

          {/* 4 — For Institutions: a department dashboard */}
          <article className="mk-ppath-step" data-step="4">
            <div className="mk-ppath-object">
              <div>
                <span className="mk-ppath-price">For teams</span>
                <h3 className="mk-ppath-name">For Institutions</h3>
              </div>
              <div className="mk-ppath-visual">
                <div className="mk-dashboard-mini" aria-hidden="true">
                  <div className="mk-dashboard-top">
                    <div className="mk-dashboard-donut" />
                    <div className="mk-dashboard-bars">
                      <span style={w('78%')} />
                      <span style={w('62%')} />
                      <span style={w('48%')} />
                    </div>
                  </div>
                  <div className="mk-dashboard-labels">
                    <div>
                      <span>Compliance</span>
                      <strong>78%</strong>
                    </div>
                    <div>
                      <span>Operations</span>
                      <strong>62%</strong>
                    </div>
                    <div>
                      <span>Retail</span>
                      <strong>48%</strong>
                    </div>
                  </div>
                </div>
              </div>
              <Link className="mk-ppath-link" href="/for-institutions">
                See team options <ArrowGlyph />
              </Link>
            </div>
          </article>
        </div>

        <p className="mk-ppath-compare">
          <Link href="/pricing">
            Compare all pricing <ArrowGlyph />
          </Link>
        </p>
      </div>
    </section>
  );
}
