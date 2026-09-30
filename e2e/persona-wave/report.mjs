// Aggregates a persona-wave run into report.md (human) + summary.json (machine).

import fs from 'node:fs';
import path from 'node:path';
import { JOURNEY_QUOTAS } from './personas.mjs';

const median = (xs) => {
  const a = xs.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
};
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '—');
const secs = (ms) => (ms == null ? '—' : `${Math.round(ms / 1000)}s`);
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

// Collapse per-persona observations into issue signatures.
function issueKey(kind, detail, p) {
  const d = String(detail)
    .replace(/module \d+/gi, 'module N')
    .replace(/\d+(\.\d+)?s\b/g, 'Ns')
    .replace(/\d+ words/g, 'N words')
    .replace(/wave\+p\d+/gi, 'wave+pN')
    .replace(/ended at .*/i, 'ended incomplete')
    .replace(/\/courses\/foundation\/program\/\d+/g, '/courses/foundation/program/N');
  return `${kind}|${kind === 'slow_page' ? p.replace(/\/\d+$/, '/N') : d}`;
}

export function summarize(results) {
  const byJourney = {};
  for (const q of JOURNEY_QUOTAS) byJourney[q.journey] = { label: q.label, rows: [] };
  for (const r of results) byJourney[r.persona.journey]?.rows.push(r);

  const journeys = Object.entries(byJourney)
    .filter(([, v]) => v.rows.length)
    .map(([journey, { label, rows }]) => {
      const reached = rows.filter((r) => r.reachedValue);
      return {
        journey,
        label,
        n: rows.length,
        reachedValuePct: pct(reached.length, rows.length),
        reachedValue: reached.length,
        medianClicksToValue: median(reached.map((r) => r.firstValue.clicks)),
        medianSecondsToValue: median(reached.map((r) => Math.round(r.firstValue.ms / 1000))),
        medianValueIndex: median(rows.map((r) => r.valueIndex)),
        avgExperience: Math.round(rows.reduce((s, r) => s + r.experience, 0) / rows.length),
        frustratedQuits: rows.filter((r) => r.outcome.kind === 'frustration').length,
        crashes: rows.filter((r) => r.outcome.kind === 'crash').length,
      };
    });

  const issues = new Map();
  for (const r of results) {
    for (const f of r.friction) {
      const key = issueKey(f.kind, f.detail, f.path);
      const it = issues.get(key) ?? { kind: f.kind, detail: f.detail, env: f.env, severity: f.severity, personas: new Set(), paths: new Set(), count: 0, shot: null };
      it.count += 1;
      it.personas.add(r.persona.id);
      it.paths.add(f.path);
      it.shot = it.shot ?? f.shot;
      issues.set(key, it);
    }
    for (const e of r.errors) {
      if (!e.first) continue;
      const key = `${e.type}|${e.message}`;
      const it = issues.get(key) ?? { kind: e.type, detail: e.message, env: e.env, severity: e.type === 'js_exception' ? 0.75 : 0.5, personas: new Set(), paths: new Set(), count: 0, shot: null, body: e.body };
      it.count += 1;
      it.personas.add(r.persona.id);
      it.paths.add(e.path);
      issues.set(key, it);
    }
  }
  const issueList = [...issues.values()]
    .map((i) => ({ ...i, personas: [...i.personas], paths: [...i.paths].slice(0, 6), impact: i.personas.size * (i.severity || 0.1) }))
    .sort((a, b) => Number(a.env) - Number(b.env) || b.impact - a.impact);

  const learners = results.filter((r) => r.course);
  const moduleStats = [];
  for (let n = 1; n <= 18; n += 1) {
    const mods = learners.flatMap((r) => r.course.modules.filter((m) => m.number === n));
    if (!mods.length) continue;
    moduleStats.push({
      number: n,
      title: mods[0].title,
      attempted: mods.length,
      tryDone: mods.filter((m) => m.tryDone).length,
      tryWidget: mods[0].tryWidget,
      buildFields: mods[0].buildFields ?? 0,
      artifactSaved: mods.filter((m) => m.artifactSaved).length,
      completed: mods.filter((m) => m.completed).length,
      medianSeconds: median(mods.map((m) => Math.round(m.ms / 1000))),
      medianClicks: median(mods.map((m) => m.clicks)),
      words: median(mods.map((m) => (m.understandWords ?? 0) + (m.tryWords ?? 0))),
      saveStatuses: [...new Set(mods.map((m) => String(m.saveStatus ?? '—')))].join(', '),
      saveError: mods.find((m) => m.saveError)?.saveError ?? '',
    });
  }
  const course = learners.length
    ? {
        learners: learners.length,
        modulesAttempted: learners.reduce((s, r) => s + r.course.modules.length, 0),
        modulesPlanned: learners.reduce((s, r) => s + r.course.targetDepth, 0),
        tryCompleted: learners.reduce((s, r) => s + r.course.tryCompleted, 0),
        artifactsBuilt: learners.reduce((s, r) => s + r.course.artifactsBuilt, 0),
        artifactsSaved: learners.reduce((s, r) => s + r.course.artifactsSaved, 0),
        certificates: learners.filter((r) => r.values.some((v) => v.id === 'certificate_reached')).length,
        completerCount: learners.filter((r) => r.persona.courseDepth >= 18).length,
        reachedPlannedDepth: learners.filter((r) => r.course.modules.length >= r.course.targetDepth).length,
        saveApiStatuses: learners.reduce((acc, r) => {
          for (const [k, v] of Object.entries(r.course.saveApiStatuses)) acc[k] = (acc[k] ?? 0) + v;
          return acc;
        }, {}),
        moduleStats,
      }
    : null;

  const outcomes = {};
  for (const r of results) outcomes[r.outcome.kind] = (outcomes[r.outcome.kind] ?? 0) + 1;
  const quitReasons = {};
  for (const r of results.filter((x) => x.outcome.kind === 'frustration')) {
    const k = r.outcome.reason.replace(/\(.*\)/, '').trim();
    quitReasons[k] = (quitReasons[k] ?? 0) + 1;
  }

  const reached = results.filter((r) => r.reachedValue);
  return {
    totals: {
      personas: results.length,
      reachedValue: reached.length,
      reachedValuePct: pct(reached.length, results.length),
      medianClicksToValue: median(reached.map((r) => r.firstValue.clicks)),
      medianSecondsToValue: median(reached.map((r) => Math.round(r.firstValue.ms / 1000))),
      avgExperience: Math.round(results.reduce((s, r) => s + r.experience, 0) / (results.length || 1)),
      jsExceptions: new Set(results.flatMap((r) => r.errors.filter((e) => e.type === 'js_exception').map((e) => e.message))).size,
      productDeadEnds: results.reduce((s, r) => s + r.deadEnds, 0),
      personasWithDeadEnd: results.filter((r) => r.deadEnds > 0).length,
      frustratedQuits: outcomes.frustration ?? 0,
      harnessCrashes: outcomes.crash ?? 0,
    },
    outcomes,
    quitReasons,
    journeys,
    issues: issueList,
    course,
  };
}

export function writeReport(outDir, meta, results) {
  const S = summarize(results);
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify({ meta, ...S }, null, 1));
  const t = S.totals;
  const L = [];
  L.push(`# Persona wave — ${meta.personas} synthetic buyers & learners`);
  L.push('');
  L.push(`Run: ${meta.startedAt} · base \`${meta.base}\` · seed ${meta.seed} · ${Math.round(meta.durationMs / 60000)} min · concurrency ${meta.concurrency}`);
  L.push('');
  L.push('## Headline');
  L.push('');
  L.push('| Metric | Value |');
  L.push('|---|---|');
  L.push(`| Reached first real value | **${t.reachedValue}/${t.personas} (${t.reachedValuePct})** |`);
  L.push(`| Median click-to-value | ${t.medianClicksToValue ?? '—'} clicks · ${t.medianSecondsToValue ?? '—'}s |`);
  L.push(`| Avg experience score (0–100) | ${t.avgExperience} |`);
  L.push(`| Personas who hit a product dead end | ${t.personasWithDeadEnd} (${t.productDeadEnds} dead ends total) |`);
  L.push(`| Rage-quits (frustration > tolerance) | ${t.frustratedQuits} |`);
  L.push(`| Unique JS exceptions | ${t.jsExceptions} |`);
  L.push(`| Harness crashes / timeouts | ${t.harnessCrashes} |`);
  L.push('');
  L.push('## By journey');
  L.push('');
  L.push('| Journey | n | Reached value | Median clicks→value | Median secs→value | Median value index | Avg experience | Rage-quits |');
  L.push('|---|---|---|---|---|---|---|---|');
  for (const j of S.journeys) {
    L.push(`| ${j.label} (\`${j.journey}\`) | ${j.n} | ${j.reachedValue} (${j.reachedValuePct}) | ${j.medianClicksToValue ?? '—'} | ${j.medianSecondsToValue ?? '—'} | ${j.medianValueIndex ?? 0} | ${j.avgExperience} | ${j.frustratedQuits} |`);
  }
  if (S.course) {
    const c = S.course;
    L.push('');
    L.push('## Course: value actually delivered');
    L.push('');
    L.push(`- Learners: **${c.learners}**; modules attempted **${c.modulesAttempted}/${c.modulesPlanned}** planned; ${c.reachedPlannedDepth} learners reached their planned depth.`);
    L.push(`- Try-step activities completed: **${c.tryCompleted}/${c.modulesAttempted}**.`);
    L.push(`- Artifacts built (fields filled + save clicked): **${c.artifactsBuilt}**; artifacts confirmed saved (2xx from API): **${c.artifactsSaved}**.`);
    L.push(`- Save API statuses: ${Object.entries(c.saveApiStatuses).map(([k, v]) => `\`${k}\` ×${v}`).join(', ') || '—'}.`);
    L.push(`- Completers reaching the certificate: **${c.certificates}/${c.completerCount}**.`);
    L.push('');
    L.push('| # | Module | Attempted | Try done | Try widget | Build fields | Saved | Median time | Median clicks | Words | Save status |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const m of c.moduleStats) {
      L.push(`| ${m.number} | ${esc(m.title)} | ${m.attempted} | ${m.tryDone} | ${esc(m.tryWidget)} | ${m.buildFields} | ${m.artifactSaved} | ${m.medianSeconds}s | ${m.medianClicks} | ${m.words} | ${esc(m.saveStatuses)} |`);
    }
    const errs = c.moduleStats.filter((m) => m.saveError);
    if (errs.length) {
      L.push('');
      L.push(`Example save failure: \`${esc(errs[0].saveError).slice(0, 220)}\``);
    }
  }
  L.push('');
  L.push('## Issues (product first, then environment-limited)');
  L.push('');
  L.push('Severity: 1 = dead end, 0.5 = friction, 0.25 = minor. **Env** = caused by the test environment (no Supabase/Stripe/OpenAI keys, no outbound network) — verify on a preview deploy before treating as a product bug.');
  L.push('');
  L.push('| Kind | Detail | Personas | Severity | Env | Where | Screenshot |');
  L.push('|---|---|---|---|---|---|---|');
  for (const i of S.issues.slice(0, 60)) {
    L.push(`| ${i.kind} | ${esc(i.detail).slice(0, 160)} | ${i.personas.length} | ${i.severity} | ${i.env ? 'env' : ''} | ${esc(i.paths.join(', ')).slice(0, 90)} | ${i.shot ? `[png](${i.shot})` : ''} |`);
  }
  L.push('');
  L.push('## Outcomes');
  L.push('');
  for (const [k, v] of Object.entries(S.outcomes)) L.push(`- ${k}: ${v}`);
  if (Object.keys(S.quitReasons).length) {
    L.push('');
    L.push('Rage-quit triggers:');
    for (const [k, v] of Object.entries(S.quitReasons).sort((a, b) => b[1] - a[1])) L.push(`- ${v} × ${k}`);
  }
  L.push('');
  L.push('## Every persona');
  L.push('');
  L.push('| ID | Persona | Source → entry | Journey | First value | Clicks→value | Secs→value | Value idx | Exp | Dead ends | Outcome |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    const p = r.persona;
    L.push(`| ${p.id} | ${esc(`${p.role} · ${p.fiType} · ${p.temperament} · ${p.device}`)} | ${esc(p.source)} → \`${p.entry}\` | ${p.journey}${p.courseDepth ? ` (${p.courseDepth})` : ''} | ${r.firstValue?.id ?? '**none**'} | ${r.firstValue?.clicks ?? '—'} | ${r.firstValue ? secs(r.firstValue.ms) : '—'} | ${r.valueIndex} | ${r.experience} | ${r.deadEnds} | ${r.outcome.kind}: ${esc(r.outcome.reason).slice(0, 80)} |`);
  }
  L.push('');
  const file = path.join(outDir, 'report.md');
  fs.writeFileSync(file, L.join('\n'));
  return file;
}

// Re-render a report from an existing results.json:
//   node e2e/persona-wave/report.mjs e2e/persona-wave/out/<run>
if (process.argv[1] && process.argv[1].endsWith('report.mjs') && process.argv[2]) {
  const dir = process.argv[2];
  const { meta, results } = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
  console.log(writeReport(dir, meta, results));
}
