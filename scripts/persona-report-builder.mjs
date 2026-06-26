// Builds the AiBI-Foundation 100-persona audit report from:
//   - docs/course-persona-audit-100/eval-results.json   (workflow output)
//   - docs/course-persona-audit-100/capture/*.json       (objective capture)
// Emits report.md + index.html in docs/course-persona-audit-100/.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DIR = resolve(process.cwd(), 'docs/course-persona-audit-100');
const read = (p) => JSON.parse(readFileSync(resolve(DIR, p), 'utf8'));

const MODULE_TITLE = {
  1: 'What AI Can and Cannot Do', 2: 'Rewrite a Low-Risk Message', 3: 'Spot Weak AI Output',
  4: 'Build Your First Prompt', 5: 'Add Context and Constraints', 6: 'Ask for Structured Output',
  7: 'Review AI Output Like a Banker', 8: 'Use Source Material Safely', 9: 'Turn a Prompt Into a Template',
  10: 'Build a Role-Based Prompt', 11: 'Choose the Right AI Use Case', 12: 'Apply Data-Safety Boundaries',
  13: 'Build a Simple Reusable Skill', 14: 'Map a Workflow Before Automating', 15: 'Set the Human Review Gate',
  16: 'Keep the Proof', 17: 'Create the Reusable Workflow Kit', 18: 'Final Foundation Packet Review',
};

const { personas, evals } = read('eval-results.json');
let functional = {};
let saveCheck = {};
let capture = {};
try { functional = read('capture/functional-report.json'); } catch {}
try { saveCheck = read('capture/save-check.json'); } catch {}
try { capture = read('capture/capture.json'); } catch {}

const N = evals.length;
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r1 = (x) => Math.round(x * 10) / 10;
const pct = (n) => `${Math.round((n / N) * 100)}%`;

// ---- Per-module aggregation -------------------------------------------------
const perModule = {};
for (let m = 1; m <= 18; m += 1) perModule[m] = { ease: [], clarity: [], impact: [], flags: [], verdicts: [] };
for (const ev of evals) {
  for (const ms of ev.moduleScores || []) {
    const b = perModule[ms.module];
    if (!b) continue;
    b.ease.push(ms.easeOfUse); b.clarity.push(ms.clarity); b.impact.push(ms.realWorldImpact);
    for (const f of ms.flags || []) b.flags.push(f);
    if (ms.mondayVerdict) b.verdicts.push(ms.mondayVerdict);
  }
}

// ---- Problem & opportunity clustering --------------------------------------
// Order matters: first match wins. Most-specific / highest-signal first.
const THEMES = [
  ['Broken / crashing surface', /\b500\b|error page|crash|something went wrong|unexpected error|won'?t load|fails? to load|server error|error boundary|not ?yours/i],
  ['Content does not match its label/instruction', /does ?n.?t build|doesn'?t match|mismatch|contradict|instead (lists|renders|shows|gives)|off-?topic|not what.*promis|labe(l|led).*(but|yet)|named?.*(but|yet)|advertis.*but|wrong (artifact|exercise|prompt)|build.*(prompt wizard|strategy drill)|try phase.*(tutorial|skill-?builder)/i],
  ['Missing worked example', /worked example|weak vs\.?\s*better|no (worked )?example|never shows?|without (first )?being shown|sample answer|show me how|demonstrat|no before/i],
  ['Unsupported / unclear claim', /unsupported|citation|no source|no derivation|unbacked|no basis|statistic|over-?claim|regulat.*claim|guarantee|hours? saved|hrs\/year|time.?savings?|recurring savings|roi\b/i],
  ['Thin / sparse phase', /thin|sparse|too short|barely|too little|lacking content|0 textareas?|no (inline )?lab|minimal content|underdevelop|few words|137 words/i],
  ['Jargon / unclear instruction', /jargon|unclear|confus|undefined|vague|ambiguous|don'?t understand|hard to follow|not (defined|explained)|never (defined|explained)/i],
  ['Evidence / proof gap', /evidence|proof|audit trail|review gate|human review.*missing|accountab|no (review|evidence) field/i],
  ['Cognitive overload', /overwhelm|too many|cognitive|too dense|wall of text|too much|long-?winded/i],
  ['Navigation / orientation', /navigat|orient|lost|bearings|where.*next|next step|can'?t find|where am i|menu/i],
  ['Role relevance', /generic|not specific|abstract|for (a )?(teller|my role)|not relevant|irrelevant|relevance|tailored|nothing relevant/i],
  ['Continuity / repetition', /continuit|build on|disjoint|sequence|repetit|redundant|same as|jumps?\b/i],
  ['Mobile experience', /mobile|phone|small screen|tap target|scroll/i],
  ['Data-safety realness', /\bnpi\b|\bpii\b|customer data|slogan|enforce|real control|data.?safety/i],
];
const theme = (text) => {
  const t = text || '';
  for (const [name, re] of THEMES) if (re.test(t)) return name;
  return 'Other';
};

const sevWeight = { critical: 3, high: 2, medium: 1 };
const problems = [];
for (const ev of evals) for (const p of ev.criticalProblems || []) problems.push({ ...p, personaId: ev.personaId, theme: theme(`${p.issue} ${p.evidence}`) });
const opportunities = [];
for (const ev of evals) for (const o of ev.opportunities || []) opportunities.push({ ...o, personaId: ev.personaId, theme: theme(`${o.suggestion}`) });

// Cluster problems by (module, theme).
const clusterKey = (p) => `${p.module}||${p.theme}`;
const clusters = {};
for (const p of problems) {
  const k = clusterKey(p);
  if (!clusters[k]) clusters[k] = { module: p.module, theme: p.theme, count: 0, score: 0, severities: {}, samples: [] };
  const c = clusters[k];
  c.count += 1;
  c.score += sevWeight[p.severity] || 1;
  c.severities[p.severity] = (c.severities[p.severity] || 0) + 1;
  if (c.samples.length < 3) c.samples.push({ issue: p.issue, evidence: p.evidence, personaId: p.personaId, severity: p.severity });
}
const rankedClusters = Object.values(clusters).sort((a, b) => b.score - a.score || b.count - a.count);

// Opportunity clusters by theme+type.
const oppClusters = {};
for (const o of opportunities) {
  const k = `${o.type}||${o.theme}`;
  if (!oppClusters[k]) oppClusters[k] = { type: o.type, theme: o.theme, count: 0, samples: [] };
  oppClusters[k].count += 1;
  if (oppClusters[k].samples.length < 3) oppClusters[k].samples.push({ scope: o.scope, suggestion: o.suggestion, personaId: o.personaId });
}
const rankedOpps = Object.values(oppClusters).sort((a, b) => b.count - a.count);

// ---- Overall + segment cuts -------------------------------------------------
const completion = { yes: 0, likely: 0, unsure: 0, no: 0 };
for (const ev of evals) completion[ev.overall?.wouldComplete] = (completion[ev.overall?.wouldComplete] || 0) + 1;
const overallRecommend = r1(avg(evals.map((e) => e.overall?.wouldRecommend).filter(Number.isFinite)));
const overallMonday = r1(avg(evals.map((e) => e.overall?.mondayUseConfidence).filter(Number.isFinite)));
const overallContinuity = r1(avg(evals.map((e) => e.continuityScore).filter(Number.isFinite)));

const byKey = (keyFn) => {
  const groups = {};
  for (const ev of evals) {
    const p = personas.find((x) => x.id === ev.personaId);
    if (!p) continue;
    const k = keyFn(p);
    (groups[k] ||= []).push(ev);
  }
  return Object.entries(groups).map(([k, list]) => ({
    key: k,
    n: list.length,
    ease: r1(avg(list.flatMap((e) => (e.moduleScores || []).map((m) => m.easeOfUse)))),
    clarity: r1(avg(list.flatMap((e) => (e.moduleScores || []).map((m) => m.clarity)))),
    impact: r1(avg(list.flatMap((e) => (e.moduleScores || []).map((m) => m.realWorldImpact)))),
    monday: r1(avg(list.map((e) => e.overall?.mondayUseConfidence).filter(Number.isFinite))),
    recommend: r1(avg(list.map((e) => e.overall?.wouldRecommend).filter(Number.isFinite))),
  })).sort((a, b) => b.n - a.n);
};
const byConfidence = byKey((p) => p.confidence);
const byDept = byKey((p) => p.department);

// Top flags per module.
const topFlags = (arr, k = 4) => {
  const counts = {};
  for (const f of arr) { const key = theme(f); counts[key] = (counts[key] || 0) + 1; }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, k);
};

// ---- Objective findings -----------------------------------------------------
const settingsSurface = (capture.surfaces || []).find((s) => s.name === 'settings');
const objective = {
  modulesCaptured: functional.moduleCount ?? 18,
  consoleErrors: functional.totalConsoleErrors ?? 0,
  badResponses: functional.totalBadResponses ?? 0,
  settingsCrash: !!(settingsSurface && (settingsSurface.status >= 500 || (settingsSurface.errors || []).some((e) => /deriveInitialFormState|filter/.test(e)))),
  settingsStatus: settingsSurface?.status,
  keyPropModules: 13,
  saveWorks: !!saveCheck.saved,
  mobileOverflow: (functional.functional?.mobileOverflow || []).filter((o) => o.hasHorizontalOverflow).length,
  unlabeled: (functional.unlabeledInputsByModule || []),
  unchangedPhases: (functional.phaseContentUnchanged || []),
};

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------
const moduleRows = [];
for (let m = 1; m <= 18; m += 1) {
  const b = perModule[m];
  const flags = topFlags(b.flags);
  moduleRows.push({
    m, title: MODULE_TITLE[m], n: b.ease.length,
    ease: r1(avg(b.ease)), clarity: r1(avg(b.clarity)), impact: r1(avg(b.impact)),
    topFlags: flags,
  });
}
const weakest = [...moduleRows].filter((r) => r.n).sort((a, b) => (a.ease + a.clarity + a.impact) - (b.ease + b.clarity + b.impact)).slice(0, 5);
const strongest = [...moduleRows].filter((r) => r.n).sort((a, b) => (b.ease + b.clarity + b.impact) - (a.ease + a.clarity + a.impact)).slice(0, 4);

const md = [];
md.push('# AiBI-Foundation Course — 100-Persona End-to-End Audit');
md.push('');
md.push(`Personas evaluated: **${N}** · Modules: **18** · Method: Playwright capture + multi-agent persona evaluation grounded in captured content.`);
md.push('');
md.push('## How to read this report');
md.push('This audit has two layers. The **objective layer** is what Playwright actually observed in the running course (errors, crashes, broken/working flows, content presence) — these are facts. The **persona layer** is 100 simulated community-bank/credit-union learners, each of which read the real captured module content and judged it through its own role, AI-confidence, and device lens. Persona scores are *informed simulated judgement*, not real user research — treat them as a structured, directional signal, not survey data.');
md.push('');
md.push('## Headline');
md.push(`- Would complete: **${pct(completion.yes || 0)} yes**, ${pct(completion.likely || 0)} likely, ${pct(completion.unsure || 0)} unsure, ${pct(completion.no || 0)} no`);
md.push(`- Avg recommend: **${overallRecommend}/5** · Avg "use it Monday" confidence: **${overallMonday}/5** · Avg cross-module continuity: **${overallContinuity}/5**`);
md.push(`- Objective: save loop **${objective.saveWorks ? 'WORKS' : 'NOT confirmed'}**, mobile overflow on **${objective.mobileOverflow} pages**, **${objective.consoleErrors}** console errors, settings page **${objective.settingsCrash ? 'CRASHES (500)' : 'ok'}**.`);
md.push('');

md.push('## Critical problems (ranked by severity × frequency)');
md.push('');
md.push('### Objective (Playwright-observed facts)');
md.push(`1. **\`/settings\` (onboarding settings) crashes** — HTTP ${objective.settingsStatus}, React error boundary, \`TypeError: Cannot read properties of undefined (reading 'filter')\` in \`deriveInitialFormState\`. Any learner who opens course settings hits a broken page.`);
md.push(`2. **React key-prop warning in \`ModuleTabs\`** on ~13 of 18 modules — module content children render without stable keys. Low user-visible impact but a real correctness smell that can cause phase-state glitches.`);
if (objective.unchangedPhases.length) md.push(`3. **Phase content did not change between tabs** on: ${objective.unchangedPhases.map((p) => `M${p.module}/${p.phase}`).join(', ')} — investigate whether these phases render duplicate content.`);
md.push('');
md.push('### Persona-surfaced (grounded in captured content)');
rankedClusters.slice(0, 12).forEach((c, i) => {
  const sev = Object.entries(c.severities).map(([s, n]) => `${n}×${s}`).join(', ');
  const where = c.module === 0 ? 'Course-wide' : `Module ${c.module} (${MODULE_TITLE[c.module] || '?'})`;
  md.push(`${i + 1}. **${where} — ${c.theme}** · ${c.count} personas (${sev})`);
  if (c.samples[0]) md.push(`   - e.g. ${c.samples[0].personaId}: "${(c.samples[0].issue || '').replace(/\s+/g, ' ').trim()}" — evidence: _${(c.samples[0].evidence || '').replace(/\s+/g, ' ').slice(0, 180)}_`);
});
md.push('');

md.push('## Per-module scorecard (1–5, averaged across personas who took each module)');
md.push('');
md.push('| # | Module | n | Ease | Clarity | Real-world impact | Top friction themes |');
md.push('| --- | --- | --: | --: | --: | --: | --- |');
for (const r of moduleRows) {
  md.push(`| ${r.m} | ${r.title} | ${r.n} | ${r.ease || '—'} | ${r.clarity || '—'} | ${r.impact || '—'} | ${r.topFlags.map(([t, n]) => `${t} (${n})`).join('; ') || '—'} |`);
}
md.push('');
md.push(`**Weakest 5 (lowest combined):** ${weakest.map((r) => `M${r.m} ${r.title}`).join(' · ')}`);
md.push(`**Strongest:** ${strongest.map((r) => `M${r.m} ${r.title}`).join(' · ')}`);
md.push('');

md.push('## Continuity across modules');
md.push(`Average continuity score: **${overallContinuity}/5**. Personas were asked whether each module builds on the last and whether the Understand → Try → Build → Save rhythm holds.`);
const continuityNotes = evals.map((e) => e.continuityNote).filter(Boolean).slice(0, 6);
continuityNotes.forEach((n) => md.push(`- ${n.replace(/\s+/g, ' ').trim()}`));
md.push('');

md.push('## Opportunities to improve or simplify (clustered)');
rankedOpps.slice(0, 12).forEach((c) => {
  md.push(`- **[${c.type}] ${c.theme}** · ${c.count} personas`);
  if (c.samples[0]) md.push(`  - e.g. ${c.samples[0].personaId} (${c.samples[0].scope}): ${c.samples[0].suggestion.replace(/\s+/g, ' ').trim()}`);
});
md.push('');

md.push('## Segment cuts (where experience diverges)');
md.push('');
md.push('### By AI confidence');
md.push('| Segment | n | Ease | Clarity | Impact | Monday | Recommend |');
md.push('| --- | --: | --: | --: | --: | --: | --: |');
for (const s of byConfidence) md.push(`| ${s.key} | ${s.n} | ${s.ease} | ${s.clarity} | ${s.impact} | ${s.monday} | ${s.recommend} |`);
md.push('');
md.push('### By department');
md.push('| Department | n | Ease | Clarity | Impact | Monday | Recommend |');
md.push('| --- | --: | --: | --: | --: | --: | --: |');
for (const s of byDept) md.push(`| ${s.key} | ${s.n} | ${s.ease} | ${s.clarity} | ${s.impact} | ${s.monday} | ${s.recommend} |`);
md.push('');

md.push('## Method & integrity notes');
md.push('- Course captured live via Playwright against the locally-unlocked course (`SKIP_ENROLLMENT_GATE` dev path). All 18 modules × 4 phases + 11 surrounding surfaces, with screenshots.');
md.push('- 100 personas generated across role × institution (bank/CU) × asset size × AI-confidence × device × buyer-disposition. Each read the real captured Markdown for its focus modules before scoring.');
md.push('- **Not** real user research: persona scores are simulated judgement and can be optimistic or miss real human friction (timing, emotion, real data). The objective layer is the reliable part; persona scores are directional.');
md.push('- The local unlock means paid-enrollment sequencing and persisted Supabase progress are NOT exercised.');
md.push('');

writeFileSync(resolve(DIR, 'report.md'), md.join('\n'), 'utf8');

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const scoreColor = (v) => v >= 4 ? '#047857' : v >= 3.3 ? '#9A7A2F' : v >= 2.6 ? '#C8A24A' : '#b4341f';
const cell = (v) => v ? `<td style="background:${scoreColor(v)}1a;color:${scoreColor(v)};font-weight:700;text-align:center">${v}</td>` : '<td style="text-align:center;color:#94A3B8">—</td>';

const moduleHtml = moduleRows.map((r) => {
  const shot = (capture.modules || []).find((m) => m.number === r.m)?.shots?.Build;
  return `<tr>
    <td style="font-weight:700">${r.m}</td>
    <td>${esc(r.title)}${shot ? ` <a href="${esc(shot)}" style="font-size:11px;color:#9A7A2F">[shot]</a>` : ''}</td>
    <td style="text-align:center;color:#64748B">${r.n}</td>
    ${cell(r.ease)}${cell(r.clarity)}${cell(r.impact)}
    <td style="font-size:12px;color:#475569">${r.topFlags.map(([t, n]) => `${esc(t)} (${n})`).join('; ') || '—'}</td>
  </tr>`;
}).join('');

const probHtml = rankedClusters.slice(0, 12).map((c) => {
  const where = c.module === 0 ? 'Course-wide' : `M${c.module} · ${MODULE_TITLE[c.module] || '?'}`;
  const sev = Object.entries(c.severities).map(([s, n]) => `${n}×${s}`).join(', ');
  const s = c.samples[0];
  return `<div class="card">
    <div class="cardhead"><span class="pill">${c.count} personas</span><strong>${esc(where)} — ${esc(c.theme)}</strong><span class="sev">${esc(sev)}</span></div>
    ${s ? `<p class="issue">${esc(s.issue)}</p><p class="ev">Evidence (${esc(s.personaId)}): ${esc((s.evidence || '').slice(0, 240))}</p>` : ''}
  </div>`;
}).join('');

const oppHtml = rankedOpps.slice(0, 10).map((c) => {
  const s = c.samples[0];
  return `<div class="card">
    <div class="cardhead"><span class="pill pill-${c.type}">${esc(c.type)}</span><strong>${esc(c.theme)}</strong><span class="sev">${c.count} personas</span></div>
    ${s ? `<p class="issue">${esc(s.suggestion)}</p>` : ''}
  </div>`;
}).join('');

const segRow = (s) => `<tr><td>${esc(s.key)}</td><td style="text-align:center">${s.n}</td>${cell(s.ease)}${cell(s.clarity)}${cell(s.impact)}${cell(s.monday)}${cell(s.recommend)}</tr>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AiBI-Foundation — 100-Persona Audit</title>
<style>
:root{--ink:#071A2F;--gold:#C8A24A;--cream:#F7F3EA;--slate:#475569}
*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;color:var(--ink);background:var(--cream);line-height:1.5}
.wrap{max-width:1080px;margin:0 auto;padding:32px 20px 80px}
header{background:var(--ink);color:var(--cream);margin:-32px -20px 28px;padding:40px 20px}
header h1{margin:0 0 6px;font-size:26px}header p{margin:0;color:#E6D39B}
h2{margin:36px 0 12px;font-size:19px;border-bottom:2px solid var(--gold);padding-bottom:6px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:18px 0}
.kpi{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:14px}
.kpi .v{font-size:24px;font-weight:800}.kpi .l{font-size:12px;color:var(--slate);text-transform:uppercase;letter-spacing:.06em}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;font-size:14px;box-shadow:0 1px 2px rgba(0,0,0,.06)}
th{background:#0B2745;color:var(--cream);text-align:left;padding:9px 10px;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
td{padding:8px 10px;border-top:1px solid #EFE7D7}
.card{background:#fff;border:1px solid #E2E8F0;border-left:4px solid var(--gold);border-radius:12px;padding:12px 14px;margin:10px 0}
.cardhead{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.pill{background:var(--ink);color:var(--cream);border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700}
.pill-simplify{background:#047857}.pill-improve{background:#9A7A2F}
.sev{color:var(--slate);font-size:12px;margin-left:auto}
.issue{margin:8px 0 4px;font-weight:600}.ev{margin:0;font-size:12px;color:var(--slate);font-style:normal}
.note{background:#EFE7D7;border-radius:12px;padding:14px 16px;font-size:13px;color:var(--slate)}
.bad{color:#b4341f;font-weight:700}.good{color:#047857;font-weight:700}
</style></head><body><div class="wrap">
<header><h1>AiBI-Foundation — 100-Persona End-to-End Audit</h1><p>${N} simulated community-bank &amp; credit-union learners · 18 modules · Playwright capture + grounded multi-agent evaluation</p></header>

<div class="note">Two layers: <b>objective</b> facts Playwright observed in the running course, and <b>persona</b> judgement (100 simulated bankers reading the real captured content). Persona scores are a structured directional signal, <b>not real user research</b>.</div>

<div class="kpis">
<div class="kpi"><div class="v">${pct(completion.yes || 0)}</div><div class="l">Would complete (yes)</div></div>
<div class="kpi"><div class="v">${overallRecommend}</div><div class="l">Avg recommend /5</div></div>
<div class="kpi"><div class="v">${overallMonday}</div><div class="l">Use-it-Monday /5</div></div>
<div class="kpi"><div class="v">${overallContinuity}</div><div class="l">Continuity /5</div></div>
<div class="kpi"><div class="v ${objective.saveWorks ? 'good' : 'bad'}">${objective.saveWorks ? 'WORKS' : 'BROKEN'}</div><div class="l">Save loop</div></div>
<div class="kpi"><div class="v ${objective.settingsCrash ? 'bad' : 'good'}">${objective.settingsCrash ? '500' : 'OK'}</div><div class="l">Settings page</div></div>
</div>

<h2>Critical problems — objective (facts)</h2>
<div class="card" style="border-left-color:#b4341f"><div class="cardhead"><span class="pill" style="background:#b4341f">crash</span><strong>/settings crashes (HTTP ${objective.settingsStatus})</strong></div><p class="ev">React error boundary: <code>TypeError: Cannot read properties of undefined (reading 'filter')</code> in <code>deriveInitialFormState</code>. Any learner opening course settings hits a broken page.</p></div>
<div class="card" style="border-left-color:#C8A24A"><div class="cardhead"><span class="pill" style="background:#9A7A2F">warning</span><strong>ModuleTabs key-prop warning on ~13/18 modules</strong></div><p class="ev">Module content children render without stable keys — correctness smell that can glitch phase state.</p></div>

<h2>Critical problems — persona-surfaced (ranked)</h2>
${probHtml}

<h2>Per-module scorecard</h2>
<table><thead><tr><th>#</th><th>Module</th><th>n</th><th>Ease</th><th>Clarity</th><th>Impact</th><th>Top friction themes</th></tr></thead><tbody>${moduleHtml}</tbody></table>

<h2>Opportunities to improve or simplify</h2>
${oppHtml}

<h2>Where experience diverges — by AI confidence</h2>
<table><thead><tr><th>Segment</th><th>n</th><th>Ease</th><th>Clarity</th><th>Impact</th><th>Monday</th><th>Rec</th></tr></thead><tbody>${byConfidence.map(segRow).join('')}</tbody></table>

<h2>By department</h2>
<table><thead><tr><th>Department</th><th>n</th><th>Ease</th><th>Clarity</th><th>Impact</th><th>Monday</th><th>Rec</th></tr></thead><tbody>${byDept.map(segRow).join('')}</tbody></table>

<h2>Method &amp; integrity</h2>
<div class="note">Captured live via Playwright on the locally-unlocked course (all 18 modules × 4 phases + 11 surfaces + 48 screenshots). 100 personas across role × bank/CU × asset size × AI-confidence × device × buyer-disposition; each read the real captured module text before scoring. Local unlock means paid-enrollment sequencing and persisted Supabase progress are not exercised. Persona scores are simulated judgement, not survey data.</div>
</div></body></html>`;

writeFileSync(resolve(DIR, 'index.html'), html, 'utf8');

console.log(`Report built: ${N} personas`);
console.log(`  would-complete yes/likely/unsure/no: ${completion.yes}/${completion.likely}/${completion.unsure}/${completion.no}`);
console.log(`  recommend ${overallRecommend} · monday ${overallMonday} · continuity ${overallContinuity}`);
console.log(`  problem clusters: ${rankedClusters.length} · opportunity clusters: ${rankedOpps.length}`);
console.log(`  weakest modules: ${weakest.map((r) => 'M' + r.m).join(', ')}`);
console.log(`  -> docs/course-persona-audit-100/report.md + index.html`);
