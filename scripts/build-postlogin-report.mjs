// Master post-login persona audit report.
//
// Merges the JSON outputs of the post-login harnesses into one prioritized
// ledger (HTML + markdown), mirroring the convention of
// scripts/build-persona-100-report.mjs:
//   - docs/handoffs/persona-sweep-auth-100-<date>/sweep.json      (Phase 2)
//   - docs/handoffs/qa-value-distance-<date>/distance.json        (Phase 5)
//   - docs/handoffs/foundation-course-personas-<date>/walk.json   (Phase 6)
//
// Inputs are optional — whatever is present is rendered; missing sections are
// marked "not run" so the report never lies about coverage. Pure node, no deps.
//
// Usage: node scripts/build-postlogin-report.mjs   (SWEEP_DATE=YYYY-MM-DD optional)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const DATE = process.env.SWEEP_DATE || new Date().toISOString().slice(0, 10);
const ROOT = process.cwd();
const OUT_DIR = resolve(ROOT, `docs/persona-audit-postlogin-${DATE}`);
const IN = {
  authSweep: resolve(ROOT, `docs/handoffs/persona-sweep-auth-100-${DATE}/sweep.json`),
  valueDistance: resolve(ROOT, `docs/handoffs/qa-value-distance-${DATE}/distance.json`),
  courseWalk: resolve(ROOT, `docs/handoffs/foundation-course-personas-${DATE}/walk.json`),
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function readJsonOrNull(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch { return null; }
}

function kpiCards(sweep) {
  if (!sweep) return [['—', 'Auth sweep not run']];
  const t = sweep.totals;
  return [
    [sweep.personas, 'Personas'],
    [`${t.personasReachedValue}/${sweep.personas}`, 'Reached value'],
    [sweep.clicksToValue?.medianClicks ?? '—', 'Median clicks-to-value'],
    [t.personasLooped, 'Circular nav'],
    [t.brokenOr4xx, 'Broken / 4xx'],
    [t.jsErrorPages, 'JS-error pages'],
    [t.deadEnds, 'Dead-ends'],
  ];
}

function ctvByStateRows(sweep) {
  const by = sweep?.clicksToValue?.byState;
  if (!by) return '<tr><td colspan="5" class="muted">Auth sweep not run</td></tr>';
  return Object.entries(by).map(([s, b]) =>
    `<tr><td class="mono">${esc(s)}</td><td>${b.avgClicks ?? 'n/a'}</td><td>${b.reached}/${b.total}</td><td>${b.never}</td><td>${b.max}</td></tr>`,
  ).join('\n');
}

function valueDistanceRows(vd) {
  if (!vd) return '<tr><td colspan="5" class="muted">Value-distance analyzer not run</td></tr>';
  return vd.rows.map((r) => r.error
    ? `<tr><td class="mono">${esc(r.state)}</td><td colspan="4" class="muted">ERROR: ${esc(r.error)}</td></tr>`
    : `<tr><td class="mono">${esc(r.state)}</td><td>${esc(r.moment)}</td><td>${r.reached ? r.theoreticalMinClicks : '<span class="sev">unreached</span>'}</td><td>${r.achievedAvgClicks ?? 'n/a'}</td><td>${r.gap ?? 'n/a'}</td></tr>`,
  ).join('\n');
}

function loopRows(sweep) {
  const loops = sweep?.loops || [];
  if (!loops.length) return '<tr><td colspan="3" class="muted">No circular navigation detected</td></tr>';
  return loops.map((l) => `<tr><td class="mono">${esc(l.persona)}</td><td>${esc(l.state)}</td><td>${esc((l.incidents || []).map((i) => i.detail).join('; '))}</td></tr>`).join('\n');
}

function personaRows(sweep) {
  if (!sweep) return '';
  return sweep.results.slice().sort((a, b) => a.id.localeCompare(b.id)).map((r) => `<tr>
    <td class="mono">${esc(r.id)}</td><td>${esc(r.state)}</td><td>${esc(r.role)}</td><td>${esc(r.device)}</td>
    <td>${r.clicksToValue?.clicks != null ? r.clicksToValue.clicks : '<span class="sev">none</span>'}</td>
    <td>${r.circular?.looped ? '<span class="sev">loop</span>' : 'ok'}</td>
    <td>${r.issueCount ? `<span class="sev">${r.issueCount}</span>` : '0'}</td>
    <td class="mono path">${esc(r.pathString)}</td></tr>`).join('\n');
}

function courseSection(walk) {
  if (!walk) return '<p class="muted">Foundation course walk not run.</p>';
  const c = walk.completer, f = walk.forwardOnly;
  const completer = c ? `<ul>
    <li>Modules walked: <strong>${c.modulesWalked}</strong></li>
    <li>Pages with issue: <strong>${c.pagesWithIssue}</strong></li>
    <li>Certificate reachable: <strong>${c.certificateReachable ? 'YES' : 'NO'}</strong></li>
    <li>Unexpected redirects: ${c.unexpectedRedirects.length ? esc(c.unexpectedRedirects.map((r) => `${r.from}→${r.to}`).join(', ')) : 'none'}</li>
    <li>Dead-ends: ${c.deadEnds.length ? esc(c.deadEnds.join(', ')) : 'none'}</li>
  </ul>` : '<p class="muted">Completer walk not run.</p>';
  const forward = f ? `<ul>
    <li>Checks: ${f.checks.length} · forward-only violations: <strong>${f.violations.length}</strong></li>
    ${f.checks.map((x) => `<li>module ${x.module} (${x.beyondCurrent ? 'beyond current' : 'allowed'}): ${x.gatedCorrectly ? 'OK' : '<span class="sev">VIOLATION</span>'}</li>`).join('')}
  </ul>` : '<p class="muted">Forward-only check not run.</p>';
  return `<div class="twocol"><div class="card"><h3>Completer</h3>${completer}</div><div class="card"><h3>Forward-only access control</h3>${forward}</div></div>`;
}

async function main() {
  const [sweep, vd, walk] = await Promise.all([
    readJsonOrNull(IN.authSweep), readJsonOrNull(IN.valueDistance), readJsonOrNull(IN.courseWalk),
  ]);
  await mkdir(OUT_DIR, { recursive: true });

  const kpis = kpiCards(sweep);
  const kpiHtml = kpis.map(([v, k]) => `<div class="kpi"><div class="kpi-v">${esc(v)}</div><div class="kpi-k">${esc(k)}</div></div>`).join('');
  const ran = [sweep && 'auth sweep', vd && 'value-distance', walk && 'course walk'].filter(Boolean).join(', ') || 'none';

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Post-Login Persona Audit — The AI Banking Institute</title>
<style>
  :root{--ink:#071A2F;--ink2:#0B2745;--gold:#C8A24A;--gold-deep:#9A7A2F;--cream:#F7F3EA;--cream2:#EFE7D7;
    --s2:#E2E8F0;--s5:#64748B;--s6:#475569;--emer:#047857;--crit:#9A1B2F;}
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
  .kpi-v{font-size:24px;font-weight:800}.kpi-k{font-size:11px;color:var(--s5);text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
  section{padding:34px 0 8px}
  h2{font-size:22px;margin:0 0 6px}
  h2 .sub{font-weight:400;color:var(--s5);font-size:14px}
  .lead{color:var(--s6);max-width:80ch;margin:0 0 16px}
  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--s2);border-radius:12px;overflow:hidden;font-size:13px}
  th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--s2);vertical-align:top}
  th{background:var(--cream2);font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--s6)}
  tr:last-child td{border-bottom:none}
  .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}
  .muted{color:var(--s5);font-size:12px}
  .sev{display:inline-block;background:#fbeaec;color:var(--crit);font-weight:700;border-radius:6px;padding:1px 8px;font-size:12px}
  .twocol{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .card{background:#fff;border:1px solid var(--s2);border-radius:12px;padding:16px}
  .card h3{margin:0 0 8px;font-size:15px}
  .path{max-width:420px;white-space:normal;word-break:break-word}
  .note{background:var(--cream2);border-radius:10px;padding:14px 16px;color:var(--s6);font-size:13px}
  footer{color:var(--s5);font-size:12px;padding:30px 0 50px;text-align:center}
  @media(max-width:900px){.kpis{grid-template-columns:repeat(3,1fr)}.twocol{grid-template-columns:1fr}.path{max-width:none}}
</style></head><body>
<header><div class="wrap">
  <div class="kick">Authenticated persona simulation · post-login QA</div>
  <h1>Post-Login Persona Audit</h1>
  <div class="meta">${esc(sweep?.base || '')} · ${esc(DATE)} · harnesses run: ${esc(ran)}</div>
  <div class="verdict">This audit closes the post-login gap the read-only sweeps could never reach: it seeds real accounts, authenticates, and walks the GATED experience — measuring <strong>clicks-to-value</strong>, <strong>circular navigation</strong>, and the Foundation course completion path.</div>
</div></header>
<div class="wrap">
  <div class="kpis">${kpiHtml}</div>

  <section>
    <h2>Clicks-to-value by account state <span class="sub">how many clicks before a logged-in customer gets value</span></h2>
    <table><thead><tr><th>Account state</th><th>Avg clicks</th><th>Reached</th><th>Never</th><th>Max</th></tr></thead><tbody>${ctvByStateRows(sweep)}</tbody></table>
  </section>

  <section>
    <h2>Efficiency: minimum vs achieved <span class="sub">theoretical shortest path vs what personas actually did</span></h2>
    <p class="lead">A large positive gap = personas wander past the shortest route (navigation to tighten). "unreached" = the value moment wasn't found within the crawl cap (possible dead-end or over-deep placement).</p>
    <table><thead><tr><th>State</th><th>Value moment</th><th>Min clicks</th><th>Achieved avg</th><th>Gap</th></tr></thead><tbody>${valueDistanceRows(vd)}</tbody></table>
  </section>

  <section>
    <h2>Circular navigation <span class="sub">are we sending people around in circles?</span></h2>
    <table><thead><tr><th>Persona</th><th>State</th><th>Loop incidents</th></tr></thead><tbody>${loopRows(sweep)}</tbody></table>
  </section>

  <section>
    <h2>Foundation course <span class="sub">post-login learning experience</span></h2>
    ${courseSection(walk)}
  </section>

  ${sweep ? `<section>
    <h2>Per-persona post-login paths <span class="sub">★ marks the value moment</span></h2>
    <table><thead><tr><th>ID</th><th>State</th><th>Role</th><th>Device</th><th>Clicks→value</th><th>Loop</th><th>Issues</th><th>Path walked</th></tr></thead><tbody>${personaRows(sweep)}</tbody></table>
  </section>` : ''}

  <section>
    <h2>Scope &amp; method</h2>
    <div class="note">Authenticated sweep: each persona is seeded to its account state (.test TLD, prod-safe, cleaned up), logged in through the real /auth/login form with a trusted-device cookie, then walks gated routes (GET only; never logs out, never submits payment, never hits /api or real checkout). Payment provisioning + auth-flow assertions live in the Playwright specs (auth-journeys, payments-provisioning, foundation-course-personas). Harnesses run this build: ${esc(ran)}.</div>
  </section>
</div>
<footer>Generated by scripts/build-postlogin-report.mjs · The AI Banking Institute · ${esc(DATE)}</footer>
</body></html>`;

  await writeFile(resolve(OUT_DIR, 'index.html'), html);

  // markdown twin
  const md = [
    `# Post-Login Persona Audit — ${DATE}`, ``,
    `Harnesses run: ${ran}. Base: ${sweep?.base || '(n/a)'}.`, ``,
    `## KPIs`,
    ...kpis.map(([v, k]) => `- ${k}: ${v}`), ``,
    `## Clicks-to-value by account state`,
    sweep?.clicksToValue?.byState
      ? Object.entries(sweep.clicksToValue.byState).map(([s, b]) => `- ${s}: avg ${b.avgClicks ?? 'n/a'} · ${b.reached}/${b.total} reached · ${b.never} never · max ${b.max}`).join('\n')
      : '- auth sweep not run', ``,
    `## Efficiency — minimum vs achieved`,
    vd ? vd.rows.map((r) => r.error ? `- ${r.state}: ERROR ${r.error}` : `- ${r.state} → ${r.moment}: min ${r.reached ? r.theoreticalMinClicks : 'unreached'}, achieved ${r.achievedAvgClicks ?? 'n/a'}, gap ${r.gap ?? 'n/a'}`).join('\n') : '- value-distance not run', ``,
    `## Circular navigation`,
    sweep?.loops?.length ? sweep.loops.map((l) => `- ${l.persona} (${l.state}): ${(l.incidents || []).map((i) => i.detail).join('; ')}`).join('\n') : '- none detected', ``,
    `## Foundation course`,
    walk?.completer ? [
      `- Completer modules walked: ${walk.completer.modulesWalked}`,
      `- Completer pages with issue: ${walk.completer.pagesWithIssue}`,
      `- Certificate reachable: ${walk.completer.certificateReachable ? 'YES' : 'NO'}`,
      `- Forward-only violations: ${walk.forwardOnly ? walk.forwardOnly.violations.length : 'n/a'}`,
    ].join('\n') : '- course walk not run', ``,
    `## Scope`,
    `Authenticated, seeded, prod-safe (.test TLD, cleaned up). GET-only gated nav; no logout/payment/api. See the Playwright specs for auth-flow + payment-provisioning + course-completer assertions.`,
  ].join('\n');
  await writeFile(resolve(OUT_DIR, '00-master-audit.md'), md);

  console.log(`Wrote ${resolve(OUT_DIR, 'index.html')}`);
  console.log(`Wrote ${resolve(OUT_DIR, '00-master-audit.md')}`);
  console.log(`Harnesses included: ${ran}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
