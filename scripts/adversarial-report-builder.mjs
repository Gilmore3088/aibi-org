// Builds the adversarial-review report from the workflow output saved at
// docs/course-persona-audit-100/adversarial-results.json -> adversarial-review.html (+ .md)

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(process.cwd(), 'docs/course-persona-audit-100');
const { fixVerdicts, adversarialFindings } = JSON.parse(readFileSync(resolve(DIR, 'adversarial-results.json'), 'utf8'));

const MODULE_TITLE = {
  1: 'What AI Can and Cannot Do', 2: 'Rewrite a Low-Risk Message', 3: 'Write a Prompt That Gets to the Core',
  4: 'Build Your First Prompt', 5: 'Add Context and Constraints', 6: 'Ask for Structured Output',
  7: 'Review AI Output Like a Banker', 8: 'Use Source Material Safely', 9: 'Turn a Prompt Into a Template',
  10: 'Build a Role-Based Prompt', 11: 'Choose the Right AI Use Case', 12: 'Apply Data-Safety Boundaries',
  13: 'Build a Simple Reusable Skill', 14: 'Map a Workflow Before Automating', 15: 'Set the Human Review Gate',
  16: 'Keep the Proof', 17: 'Create the Reusable Workflow Kit', 18: 'Final Foundation Packet Review', 0: 'Course-wide / surface',
};
const FIX_LABEL = {
  'settings-crash': '/settings no longer crashes',
  'roi-claims': 'Unsourced "hrs/year" claims removed',
  'm3-core': 'M3 is a coherent CORE-prompt module',
  'm7-review': 'M7 delivers its review exercise',
  'm13-skill': 'M13 drops the off-topic tool-choice lab',
  'worked-examples': 'Worked examples now visible',
};

const sevRank = { critical: 0, high: 1, medium: 2, low: 3 };
const allProblems = adversarialFindings.flatMap((f) => (f.newProblems || []).map((p) => ({ ...p, reviewer: f.reviewerId })));
allProblems.sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
const passes = fixVerdicts.filter((v) => v.verdict === 'pass').length;
const partials = fixVerdicts.filter((v) => v.verdict === 'partial').length;
const fails = fixVerdicts.filter((v) => v.verdict === 'fail').length;

// ---- Markdown ----
const md = [];
md.push('# AiBI-Foundation — Adversarial Review (post-fix)');
md.push('');
md.push(`Red-team verification of the audit fixes + new-problem hunt. Fixes: **${passes} pass · ${partials} partial · ${fails} fail**. New problems found: **${allProblems.length}**.`);
md.push('');
md.push('## Fix verdicts');
md.push('');
md.push('| Fix | Verdict | Evidence | Residual |');
md.push('| --- | --- | --- | --- |');
for (const v of fixVerdicts) {
  const r = (v.residualIssue || '').replace(/\s+/g, ' ').trim();
  md.push(`| ${FIX_LABEL[v.fixId] || v.fixId} | **${v.verdict.toUpperCase()}** | ${(v.evidence || '').replace(/\s+/g, ' ').slice(0, 180)} | ${r || '—'} |`);
}
md.push('');
md.push('## New problems found by the red team (by severity)');
if (!allProblems.length) md.push('_None grounded in the captured content._');
for (const p of allProblems) {
  const where = `M${p.module}${p.module ? ` ${MODULE_TITLE[p.module] || ''}` : ' (course-wide)'}`;
  md.push(`- **[${p.severity}] ${where}** — ${p.issue.replace(/\s+/g, ' ').trim()}  \n  _${p.reviewer}: ${(p.evidence || '').replace(/\s+/g, ' ').slice(0, 200)}_`);
}
md.push('');
md.push('## Continuity & regressions');
for (const f of adversarialFindings) {
  md.push(`- **${f.reviewerId}** — ${(f.continuityNote || '').replace(/\s+/g, ' ').trim()}${f.regressionSpotted ? `  ·  REGRESSION: ${f.regressionSpotted}` : ''}`);
}
md.push('');
writeFileSync(resolve(DIR, 'adversarial-review.md'), md.join('\n'), 'utf8');

// ---- HTML ----
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const vColor = (v) => v === 'pass' ? '#047857' : v === 'partial' ? '#9A7A2F' : '#b4341f';
const sColor = (s) => s === 'critical' || s === 'high' ? '#b4341f' : s === 'medium' ? '#9A7A2F' : '#64748B';
const verdictRows = fixVerdicts.map((v) => `<tr>
  <td>${esc(FIX_LABEL[v.fixId] || v.fixId)}</td>
  <td style="font-weight:800;color:${vColor(v.verdict)};text-transform:uppercase">${esc(v.verdict)}</td>
  <td style="font-size:13px;color:#475569">${esc((v.evidence || '').slice(0, 240))}</td>
  <td style="font-size:13px;color:#b4341f">${esc(v.residualIssue || '')}</td></tr>`).join('');
const problemCards = allProblems.map((p) => `<div class="card" style="border-left-color:${sColor(p.severity)}">
  <div class="h"><span class="pill" style="background:${sColor(p.severity)}">${esc(p.severity)}</span>
  <strong>M${p.module || '—'} ${esc(p.module ? (MODULE_TITLE[p.module] || '') : 'course-wide')}</strong>
  <span class="rev">${esc(p.reviewer)}</span></div>
  <p class="i">${esc(p.issue)}</p><p class="e">${esc((p.evidence || '').slice(0, 280))}</p></div>`).join('') || '<p>No grounded new problems found.</p>';
const contRows = adversarialFindings.map((f) => `<div class="card"><div class="h"><strong>${esc(f.reviewerId)}</strong>${f.regressionSpotted ? `<span class="pill" style="background:#b4341f">regression</span>` : ''}</div><p class="e">${esc(f.continuityNote || '')}${f.regressionSpotted ? ' — ' + esc(f.regressionSpotted) : ''}</p></div>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AiBI-Foundation — Adversarial Review</title>
<style>
:root{--ink:#071A2F;--gold:#C8A24A;--cream:#F7F3EA;--slate:#475569}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--ink);background:var(--cream);line-height:1.5}
.wrap{max-width:1040px;margin:0 auto;padding:32px 20px 80px}
header{background:var(--ink);color:var(--cream);margin:-32px -20px 24px;padding:36px 20px}
header h1{margin:0 0 6px;font-size:24px}header p{margin:0;color:#E6D39B}
h2{margin:32px 0 12px;font-size:18px;border-bottom:2px solid var(--gold);padding-bottom:6px}
.kpis{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
.kpi{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:12px 16px;min-width:120px}
.kpi .v{font-size:24px;font-weight:800}.kpi .l{font-size:11px;color:var(--slate);text-transform:uppercase;letter-spacing:.06em}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
th{background:#0B2745;color:var(--cream);text-align:left;padding:9px 10px;font-size:12px;text-transform:uppercase}
td{padding:8px 10px;border-top:1px solid #EFE7D7;vertical-align:top}
.card{background:#fff;border:1px solid #E2E8F0;border-left:4px solid var(--gold);border-radius:12px;padding:12px 14px;margin:10px 0}
.h{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pill{color:#fff;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700;text-transform:uppercase}
.rev{color:var(--slate);font-size:12px;margin-left:auto}
.i{margin:8px 0 4px;font-weight:600}.e{margin:0;font-size:12px;color:var(--slate)}
.note{background:#EFE7D7;border-radius:12px;padding:14px 16px;font-size:13px;color:var(--slate)}
</style></head><body><div class="wrap">
<header><h1>AiBI-Foundation — Adversarial Review (post-fix)</h1><p>Red-team verification of the audit fixes + hostile new-problem hunt, grounded in the re-captured course</p></header>
<div class="kpis">
<div class="kpi"><div class="v" style="color:#047857">${passes}</div><div class="l">Fixes pass</div></div>
<div class="kpi"><div class="v" style="color:#9A7A2F">${partials}</div><div class="l">Partial</div></div>
<div class="kpi"><div class="v" style="color:#b4341f">${fails}</div><div class="l">Fail</div></div>
<div class="kpi"><div class="v">${allProblems.length}</div><div class="l">New problems</div></div>
</div>
<h2>Fix verdicts</h2>
<table><thead><tr><th>Fix</th><th>Verdict</th><th>Evidence</th><th>Residual</th></tr></thead><tbody>${verdictRows}</tbody></table>
<h2>New problems found by the red team</h2>
${problemCards}
<h2>Continuity &amp; regressions</h2>
${contRows}
<h2>Method</h2>
<div class="note">6 skeptics each tried to disprove one shipped fix against the fresh Playwright capture; 5 hostile personas (compliance examiner, skeptical CEO, confused novice, power-user critic, fair-lending analyst) hunted for new problems across all 18 modules. Every finding is grounded in captured on-screen text. Simulated judgement, not real user research.</div>
</div></body></html>`;
writeFileSync(resolve(DIR, 'adversarial-review.html'), html, 'utf8');

console.log(`Adversarial report built: ${passes} pass / ${partials} partial / ${fails} fail · ${allProblems.length} new problems`);
console.log(`  -> docs/course-persona-audit-100/adversarial-review.html (+ .md)`);
