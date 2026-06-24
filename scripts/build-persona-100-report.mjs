// Builds the comprehensive prioritized audit from the live 100-persona sweep.
// Reads docs/handoffs/persona-sweep-100-2026-06-23/sweep.json and emits:
//   - docs/persona-audit-live-100-2026-06-23/index.html   (the report)
//   - docs/persona-audit-live-100-2026-06-23/02-comprehensive-audit.md
//
// Findings are authored here (the analysis layer); the mechanical sweep data
// (coverage, per-persona paths, the one live defect) is pulled from sweep.json
// so the persona log never drifts from the actual run.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const SWEEP = resolve(process.cwd(), 'docs/handoffs/persona-sweep-100-2026-06-23/sweep.json');
const OUT_DIR = resolve(process.cwd(), 'docs/persona-audit-live-100-2026-06-23');
const SHOTS_REL = '../handoffs/persona-sweep-100-2026-06-23/shots';

// --- the analysis: live-sweep confirmations (prior gaps now proven in prod) ---
const CONFIRMATIONS = [
  ['Foundation purchase page no longer a dead-end', '0 dead-ends across 750 steps; the 20-persona sweep had 3 here', '20-persona P2/P17'],
  ['/pricing page exists & is linked', 'reached 29× via real links', '100-persona P1 ("no /pricing page")'],
  ['/security/data-handling deployed', 'reached 19×', '20-persona P6 (was "deploy pending")'],
  ['/security/it-approval deployed', 'reached 18×', '20-persona P16 (was "deploy pending")'],
  ['/about restored & live', 'reached 39×', '20-persona P5 (was "deploy pending")'],
  ['Certificate verify surface live', '/verify 19×, /certifications 16×', '100-persona GAP1 (verify half)'],
  ['$99 In-Depth reachable in prod', '/assessment/in-depth reached 25×', '20-persona P12 / 100-persona'],
  ['Top/mid-funnel navigation integrity', '0 broken links, 0 4xx across 100 personas', '—'],
];

// --- the analysis: prioritized findings -------------------------------------
// status: OUTSTANDING | LOCAL (coded, prod-unverified) | DONE | DEFERRED
// repeat: prior audit source(s), or 'NEW' if first surfaced by this live sweep
const FINDINGS = [
  // ---------------- P0 ----------------
  { id: 'P0-1', prio: 'P0', sev: 'Critical', title: 'Certificate unreachable + cert PDF',
    impact: 'A paying $295 completer cannot obtain the credential — the entire course payoff fails. Drives refunds and reputational damage with the exact buyers most likely to refer.',
    status: 'LOCAL', repeat: '100-persona GAP1',
    evidence: '/verify is live (19 visits) but issuance + PDF sit behind auth/api — not testable by a nav sweep. Overlaps a known production @react-pdf 500. Needs a targeted prod issuance + PDF download test.' },
  { id: 'P0-2', prio: 'P0', sev: 'Critical', title: 'Paid buyers stranded at login',
    impact: 'Buyers who pay cannot get in: passwordless account + a single magic-link that bank email gateways filter. Silent revenue loss and support load right after the sale.',
    status: 'LOCAL', repeat: '100-persona GAP2',
    evidence: '/auth/login (3), /auth/signup (6), /auth/forgot-password (3) all reachable; actual email delivery + device-trust flow not testable by nav sweep.' },
  { id: 'P0-3', prio: 'P0', sev: 'Critical', title: 'Live-money smoke tests never run',
    impact: 'The entire paid funnel — checkout → webhook → entitlement → refund — is unproven end-to-end with real money. A single broken link in that chain means paid customers get nothing.',
    status: 'OUTSTANDING', repeat: '20-persona P15 + 50-persona F4',
    evidence: 'Checkout/Stripe paths are deliberately skipped by the safe sweep. Owner-run task.' },
  { id: 'P0-4', prio: 'P0', sev: 'Critical', title: 'MailerLite nurture not activated',
    impact: 'Every captured email gets zero follow-up. The core conversion mechanism (assessment → nurture → $99 → $295) is dead on arrival; the funnel leaks at its most valuable point.',
    status: 'OUTSTANDING', repeat: '20-persona P0-3 + 50-persona + 100-persona GAP3',
    evidence: 'Owner dashboard task (paste/seed/domain-auth/enable automations). Not code.' },
  { id: 'P0-5', prio: 'P0', sev: 'Critical', title: 'Exposed STRIPE_SECRET_KEY not rotated',
    impact: 'A live Stripe secret key was exposed and not rotated — direct financial and security risk.',
    status: 'OUTSTANDING', repeat: '20-persona (remaining gates)',
    evidence: 'Security/ops task; out of scope for a nav sweep.' },
  { id: 'P0-6', prio: 'P0', sev: 'Critical', title: 'Email-gated downloads 500',
    impact: 'Lead magnets (Prompt Cards, Safe-AI Guide) fail after the visitor gives their email — a broken promise at the exact moment of trust, losing both the lead and the credibility.',
    status: 'LOCAL', repeat: '100-persona GAP6',
    evidence: 'Downloads sit behind /api (skipped). /prompt-cards (6) and /resources/access/* pages reachable. Local fix moves to static PDFs; overlaps known prod @react-pdf 500 — needs a prod download test.' },
  { id: 'P0-7', prio: 'P0', sev: 'Critical', title: 'No retention / recovery loop',
    impact: 'Abandoners, idle buyers, and quitters are never re-contacted, and the free assessment will not resume cross-device. The roster’s many "abandons mid-assessment" / "buys, never starts" personas are permanently lost.',
    status: 'LOCAL', repeat: '100-persona GAP3',
    evidence: 'Re-engagement crons + drafts coded; migrations 00054/00056 are live but cron + email send are unverified in prod.' },
  { id: 'P0-8', prio: 'P0', sev: 'High', title: 'Team checkout is a mailto (self-serve dark)',
    impact: 'Institutional buyers — the highest-LTV segment — have no self-serve path and must email. Intentional for now, but it caps the team funnel until hardened.',
    status: 'DEFERRED', repeat: '100-persona GAP4 + 20-persona P10 + 50-persona',
    evidence: '/assessment/team reachable (11); /for-institutions heavily reached (56). Assisted inquiry path exists; self-serve flag intentionally off.' },

  // ---------------- P1 ----------------
  { id: 'P1-1', prio: 'P1', sev: 'High', title: 'Interactive demos are canned mockups',
    impact: 'High-intent evaluators who open /playground or /practice see fake output; /practice is mislabeled "Enrolled-only". Erodes credibility with the personas most likely to buy.',
    status: 'LOCAL', repeat: '100-persona GAP5',
    evidence: '/playground (12) and /practice (3) load with no JS error, but a nav sweep cannot verify whether output is real. Local fix wires a real endpoint; model-key prod path unverified.' },
  { id: 'P1-2', prio: 'P1', sev: 'High', title: '/resources hydration error (React #418)',
    impact: 'Intermittent client/server hydration mismatch on the resources hub — a primary lead-gen page reached 31× in this run. Can cause content flicker or broken interactivity for a slice of visitors.',
    status: 'OUTSTANDING', repeat: 'NEW',
    evidence: 'Surfaced live for persona P005 on /resources (React minified error #418). Screenshot captured. 1 of 31 visits errored — intermittent.' },
  { id: 'P1-3', prio: 'P1', sev: 'High', title: 'Physical iPhone/Safari QA not run',
    impact: 'Mobile is the primary assessment surface; real-device CTA reachability is still unproven (emulation only).',
    status: 'OUTSTANDING', repeat: '20-persona P9/P18 + 50-persona F3',
    evidence: 'Mobile-emulated personas in this sweep walked clean, but emulation ≠ a real device.' },
  { id: 'P1-4', prio: 'P1', sev: 'High', title: 'Thin public proof / no named advisors',
    impact: 'A credentialing organization with no named people, quotes, or logos has a trust gap with skeptical buyers (a large share of the roster).',
    status: 'LOCAL', repeat: '20-persona P5/P19 + 50-persona F2',
    evidence: '/about reachable (39) but content/proof not assessed by a nav sweep. Gated on owner-approved proof.' },
  { id: 'P1-5', prio: 'P1', sev: 'High', title: 'Legal / counsel signoff on privacy & terms',
    impact: 'Privacy and terms have not had counsel review — legal exposure at launch.',
    status: 'OUTSTANDING', repeat: '50-persona (#21/#40)',
    evidence: '/privacy (14) and /terms (10) reachable and render; content not legally reviewed.' },
  { id: 'P1-6', prio: 'P1', sev: 'Medium', title: '$99 discoverability / offer ladder',
    impact: 'The $99 In-Depth is the funnel’s mid-step; weak nav discoverability throttles the climb from free to $295.',
    status: 'LOCAL', repeat: '20-persona P12 + 100-persona',
    evidence: '/assessment/in-depth IS reachable in prod (25 visits) — improved; remaining work is a nav entry + MailerLite ladder copy.' },
  { id: 'P1-7', prio: 'P1', sev: 'Medium', title: 'Support ops SLA / refund authority',
    impact: 'Paid-buyer issues lack a defined resolution path, SLA, and refund authority — slow recovery for stranded buyers.',
    status: 'LOCAL', repeat: '20-persona P20 + 50-persona F1',
    evidence: '/support/purchase-help reachable (5); operator runbook coded, live operation unverified.' },

  // ---------------- P2 ----------------
  { id: 'P2-1', prio: 'P2', sev: 'Medium', title: 'Two nav systems / dead legacy chrome',
    impact: 'Divergent navigation and a dead "About" link in legacy chrome create inconsistent wayfinding.',
    status: 'LOCAL', repeat: '100-persona P1', evidence: 'Flagged routes patched locally; full legacy deletion is future work.' },
  { id: 'P2-2', prio: 'P2', sev: 'Medium', title: 'Module 3 difficulty cliff',
    impact: 'A 60-char gate in Module 3 is where course personas quit; hurts completion (and thus certificate revenue).',
    status: 'LOCAL', repeat: '100-persona P1', evidence: 'Behind enrollment; not reachable by nav sweep.' },
  { id: 'P2-3', prio: 'P2', sev: 'Low', title: 'Forced marketing opt-in / no "no-thanks" lane',
    impact: 'EmailGate forces marketingOptIn:true — a consent/trust smell for privacy-skeptic personas.',
    status: 'LOCAL', repeat: '100-persona P1', evidence: 'Form behavior; not exercised by nav sweep.' },
  { id: 'P2-4', prio: 'P2', sev: 'Low', title: 'Hygiene fixes (raw-email logs, signOut cookie, dead code)',
    impact: 'PII in logs, a trusted-device cookie surviving signOut, and dead modules — small but real.',
    status: 'DONE', repeat: '100-persona P2', evidence: 'Implemented & regression-tested locally.' },
];

const PRIO_META = {
  P0: { label: 'P0 — Critical / launch-blocking', color: '#9A1B2F' },
  P1: { label: 'P1 — High', color: '#9A7A2F' },
  P2: { label: 'P2 — Medium / Low', color: '#475569' },
};
const STATUS_BADGE = {
  OUTSTANDING: ['Outstanding', '#9A1B2F'],
  LOCAL: ['Local — prod unverified', '#9A7A2F'],
  DONE: ['Done', '#047857'],
  DEFERRED: ['Deferred (owner)', '#475569'],
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function findingRows(prio) {
  return FINDINGS.filter((f) => f.prio === prio).map((f) => {
    const [stLabel, stColor] = STATUS_BADGE[f.status];
    const repeatCell = f.repeat === 'NEW'
      ? '<span class="tag new">NEW</span>'
      : `<span class="tag holdover">Holdover</span><br><span class="muted">${esc(f.repeat)}</span>`;
    return `<tr>
      <td class="mono">${esc(f.id)}</td>
      <td><strong>${esc(f.title)}</strong></td>
      <td><span class="sev">${esc(f.sev)}</span></td>
      <td>${esc(f.impact)}</td>
      <td><span class="badge" style="background:${stColor}">${esc(stLabel)}</span></td>
      <td>${repeatCell}</td>
      <td class="muted">${esc(f.evidence)}</td>
    </tr>`;
  }).join('\n');
}

async function main() {
  const sweep = JSON.parse(await readFile(SWEEP, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });

  const t = sweep.totals;
  const kpis = [
    ['Personas', sweep.personas], ['Steps walked', t.totalSteps], ['Unique pages', t.uniquePages],
    ['Personas w/ issue', `${t.personasWithIssue}/${sweep.personas}`], ['Broken / 4xx', t.brokenOr4xx],
    ['JS-error pages', t.jsErrorPages], ['Dead-ends', t.deadEnds],
  ];
  const newCount = FINDINGS.filter((f) => f.repeat === 'NEW').length;
  const holdoverCount = FINDINGS.length - newCount;

  const kpiHtml = kpis.map(([k, v]) => `<div class="kpi"><div class="kpi-v">${v}</div><div class="kpi-k">${k}</div></div>`).join('');
  const confHtml = CONFIRMATIONS.map((c) => `<tr><td><strong>${esc(c[0])}</strong></td><td>${esc(c[1])}</td><td class="muted">${esc(c[2])}</td></tr>`).join('\n');
  const covHtml = sweep.coverage.map(([p, n]) => `<tr><td class="mono">${esc(p)}</td><td>${n}</td></tr>`).join('\n');
  const personaHtml = sweep.results.sort((a, b) => a.id.localeCompare(b.id)).map((r) => `<tr>
      <td class="mono">${esc(r.id)}</td>
      <td>${esc(r.role)}</td>
      <td class="muted">${esc(r.fiType)}</td>
      <td>${esc(r.device)}</td>
      <td class="muted">${esc(r.completion)}</td>
      <td>${r.stepsTaken}</td>
      <td>${r.issueCount ? `<span class="sev">${r.issueCount}</span>` : '0'}</td>
      <td class="mono path">${esc(r.pathString)}</td>
    </tr>`).join('\n');

  const jsIssue = sweep.jsErrors[0];

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Live 100-Persona Audit — The AI Banking Institute</title>
<style>
  :root{--ink:#071A2F;--ink2:#0B2745;--gold:#C8A24A;--gold-deep:#9A7A2F;--cream:#F7F3EA;--cream2:#EFE7D7;
    --s2:#E2E8F0;--s4:#94A3B8;--s5:#64748B;--s6:#475569;--emer:#047857;--crit:#9A1B2F;}
  *{box-sizing:border-box}
  body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--cream);line-height:1.5}
  .wrap{max-width:1180px;margin:0 auto;padding:0 24px}
  header{background:var(--ink);color:var(--cream);padding:48px 0 40px}
  header .kick{color:var(--gold);font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
  header h1{margin:.3em 0 .2em;font-size:34px;line-height:1.1}
  header .meta{color:#cdd7e2;font-size:14px}
  .verdict{background:var(--ink2);border-left:4px solid var(--gold);padding:18px 20px;border-radius:10px;margin-top:24px;color:#eef3f8}
  .verdict strong{color:var(--gold)}
  .kpis{display:grid;grid-template-columns:repeat(7,1fr);gap:12px;margin:-28px 0 0;position:relative}
  .kpi{background:#fff;border:1px solid var(--s2);border-radius:14px;padding:16px 12px;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,.06)}
  .kpi-v{font-size:26px;font-weight:800}.kpi-k{font-size:11px;color:var(--s5);text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
  section{padding:38px 0 8px}
  h2{font-size:22px;margin:0 0 6px}
  h2 .sub{font-weight:400;color:var(--s5);font-size:14px}
  .lead{color:var(--s6);max-width:75ch;margin:0 0 18px}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--s2);border-radius:12px;overflow:hidden;font-size:13px}
  th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--s2);vertical-align:top}
  th{background:var(--cream2);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--s6)}
  tr:last-child td{border-bottom:none}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}
  .muted{color:var(--s5);font-size:12px}
  .sev{display:inline-block;background:#fbeaec;color:var(--crit);font-weight:700;border-radius:6px;padding:1px 8px;font-size:12px}
  .badge{display:inline-block;color:#fff;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;white-space:nowrap}
  .tag{display:inline-block;border-radius:6px;padding:1px 7px;font-size:11px;font-weight:700}
  .tag.new{background:#e7f6ef;color:var(--emer)}
  .tag.holdover{background:var(--cream2);color:var(--gold-deep)}
  .prio-h{display:flex;align-items:center;gap:10px;margin:26px 0 8px}
  .prio-dot{width:12px;height:12px;border-radius:50%}
  .prio-h h3{margin:0;font-size:16px}
  .conf table th{background:#e7f6ef;color:#0a5c41}
  .twocol{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .card{background:#fff;border:1px solid var(--s2);border-radius:12px;padding:16px}
  .path{max-width:420px;white-space:normal;word-break:break-word}
  .shot{max-width:100%;border:1px solid var(--s2);border-radius:10px;margin-top:10px}
  .note{background:var(--cream2);border-radius:10px;padding:14px 16px;color:var(--s6);font-size:13px}
  footer{color:var(--s5);font-size:12px;padding:30px 0 50px;text-align:center}
  @media(max-width:900px){.kpis{grid-template-columns:repeat(3,1fr)}.twocol{grid-template-columns:1fr}.path{max-width:none}}
</style></head><body>
<header><div class="wrap">
  <div class="kick">Live persona simulation · read-only production sweep</div>
  <h1>100-Persona Live Site Audit</h1>
  <div class="meta">${esc(sweep.base)} · run ${esc(sweep.runAt)} · concurrency ${sweep.config.concurrency} · ${sweep.config.stepsMin}–${sweep.config.stepsMax} steps/persona</div>
  <div class="verdict">The building is largely done; the proving is not. <strong>${sweep.personas} personas walked ${t.totalSteps} steps with ${t.brokenOr4xx} broken links, ${t.deadEnds} dead-ends, and ${t.jsErrorPages} JS-error page.</strong> Top- and mid-funnel navigation is healthy and several prior "deploy-pending" fixes are confirmed live. The open risk is entirely <strong>below the nav layer</strong> — forms, gated downloads, auth, fulfillment — which a safe read-only sweep cannot reach and which therefore needs targeted production verification.</div>
</div></header>
<div class="wrap">
  <div class="kpis">${kpiHtml}</div>

  <section class="conf">
    <h2>What the live sweep confirmed <span class="sub">prior gaps now proven in production</span></h2>
    <p class="lead">These items were flagged "missing" or "deploy-pending" in earlier audits. The live walk reached them on the production site — they are done.</p>
    <table><thead><tr><th>Confirmed live</th><th>Evidence (this run)</th><th>Closes prior finding</th></tr></thead><tbody>${confHtml}</tbody></table>
  </section>

  <section>
    <h2>Prioritized findings <span class="sub">grouped by priority &amp; severity · ${holdoverCount} holdover, ${newCount} new</span></h2>
    <p class="lead">Impact and status for every open item, deduped across the 20/50/100 audits and this live run. <span class="tag holdover">Holdover</span> = recurs from a prior audit (named). <span class="tag new">NEW</span> = first surfaced by this live sweep.</p>
    ${['P0', 'P1', 'P2'].map((p) => `
    <div class="prio-h"><span class="prio-dot" style="background:${PRIO_META[p].color}"></span><h3>${PRIO_META[p].label}</h3></div>
    <table><thead><tr><th>ID</th><th>Finding</th><th>Sev</th><th>Impact</th><th>Status</th><th>Repeat?</th><th>Live-sweep evidence</th></tr></thead><tbody>${findingRows(p)}</tbody></table>`).join('\n')}
  </section>

  <section>
    <h2>The one live defect <span class="sub">surfaced by the browser run</span></h2>
    <div class="twocol">
      <div class="card">
        <p><strong>React #418 hydration mismatch on <span class="mono">/resources</span></strong></p>
        <p class="muted">Persona ${esc(jsIssue.persona)} — ${esc(jsIssue.errors.join(' | '))}</p>
        <p>Intermittent (1 of 31 visits to <span class="mono">/resources</span>). Hydration mismatches cause content flicker or broken client interactivity for the affected slice of visitors on a primary lead-gen page. <strong>Status: NEW</strong> — not present in any prior audit.</p>
      </div>
      <div class="card"><div class="muted">Captured screenshot</div>
        <img class="shot" src="${SHOTS_REL}/${esc(jsIssue.persona)}-step1-ISSUE.png" alt="resources hydration error" onerror="this.style.display='none'">
      </div>
    </div>
  </section>

  <section>
    <h2>Page coverage <span class="sub">${t.uniquePages} unique pages reached by intent-biased walks</span></h2>
    <table><thead><tr><th>Route</th><th>Visits</th></tr></thead><tbody>${covHtml}</tbody></table>
  </section>

  <section>
    <h2>100 persona paths <span class="sub">what each persona actually walked</span></h2>
    <p class="lead">Each persona started on the page their intended journey implies, then took a seeded, intent-biased walk through real on-page links. "Intended behavior" is from the roster; "path walked" is what the live site actually allowed (nav layer only).</p>
    <table><thead><tr><th>ID</th><th>Role</th><th>FI type</th><th>Device</th><th>Intended behavior</th><th>Steps</th><th>Issues</th><th>Path walked</th></tr></thead><tbody>${personaHtml}</tbody></table>
  </section>

  <section>
    <h2>Scope &amp; limitations</h2>
    <div class="note">This is a <strong>read-only navigation sweep</strong>: GET requests only, same-origin links only, no form submits, no checkout, no auth, no <span class="mono">/api</span>. It is the honest empirical complement to the reasoning audits — it proves navigation health and page reachability, but it <strong>cannot</strong> exercise the six bottom-of-funnel P0s (certificate issuance, stranded-buyer recovery, gated PDF downloads, retention crons, team checkout, demo realness). A clean sweep here must not be read as "everything works" — it means the parts a visitor can reach without committing are healthy.</div>
  </section>

  <section>
    <h2>Start position for the next round</h2>
    <p class="lead">In priority order: (1) <strong>owner gates</strong> — run the live-money smoke tests, activate MailerLite, rotate the Stripe key; (2) <strong>deploy + verify the six bottom-of-funnel P0s in production</strong> (cert issuance + PDF, gated downloads, stranded-buyer recovery, retention crons, demo endpoints); (3) fix the new <span class="mono">/resources</span> hydration error; (4) physical-device QA + legal signoff + proof. The code exists for most of #2 — the work is proving it on the live site, not building it.</p>
  </section>
</div>
<footer>Generated from <span class="mono">persona-sweep-100.mjs</span> live run · The AI Banking Institute · 2026-06-23</footer>
</body></html>`;

  await writeFile(resolve(OUT_DIR, 'index.html'), html);

  // --- markdown twin ---
  const mdRows = (prio) => FINDINGS.filter((f) => f.prio === prio).map((f) =>
    `| ${f.id} | ${f.title} | ${f.sev} | ${STATUS_BADGE[f.status][0]} | ${f.repeat} | ${f.impact} |`).join('\n');
  const md = `# Comprehensive Prioritized Persona Audit — 2026-06-23

Built from the live 100-persona production sweep (${sweep.personas} personas, ${t.totalSteps} steps, ${t.uniquePages} pages, ${t.brokenOr4xx} broken / ${t.deadEnds} dead-ends / ${t.jsErrorPages} JS-error page) cross-referenced with the 20/50/100 reasoning audits. See \`01-consolidation.md\` for the full complete-vs-not ledger and \`index.html\` for the visual report.

## Verdict
Building largely done; production proof not. Top/mid-funnel nav is healthy and several prior "deploy-pending" fixes are confirmed live. Open risk is entirely below the nav layer.

## Confirmed live this run (prior gaps now closed in prod)
${CONFIRMATIONS.map((c) => `- **${c[0]}** — ${c[1]} (closes: ${c[2]})`).join('\n')}

## Findings by priority
Repeat column: a named prior audit = holdover; \`NEW\` = first surfaced by this live sweep.

### P0 — Critical
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
${mdRows('P0')}

### P1 — High
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
${mdRows('P1')}

### P2 — Medium / Low
| ID | Finding | Sev | Status | Repeat | Impact |
|---|---|---|---|---|---|
${mdRows('P2')}

## The one live defect
- **React #418 hydration mismatch on /resources** (persona ${jsIssue.persona}) — intermittent (1/31 visits). Status: **NEW**.

## Scope
Read-only nav sweep: GET only, no forms/checkout/auth/api. Proves navigation health and reachability; cannot exercise the six bottom-of-funnel P0s — those need targeted production verification.
`;
  await writeFile(resolve(OUT_DIR, '02-comprehensive-audit.md'), md);

  console.log(`Wrote ${resolve(OUT_DIR, 'index.html')}`);
  console.log(`Wrote ${resolve(OUT_DIR, '02-comprehensive-audit.md')}`);
  console.log(`Findings: ${FINDINGS.length} (${holdoverCount} holdover, ${newCount} new) · Confirmations: ${CONFIRMATIONS.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
