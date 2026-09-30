#!/usr/bin/env node
// Builds a self-contained, interactive HTML report from a persona-wave run.
//
//   node e2e/persona-wave/html-report.mjs <run-out-dir> <findings-dir>
//
// <run-out-dir> holds results.json + summary.json from run-wave.mjs.
// <findings-dir> holds findings.json (hand-verified conclusions) and any
// screenshots it references; index.html is written there.

import fs from 'node:fs';
import path from 'node:path';
import { JOURNEY_QUOTAS } from './personas.mjs';

const [runDir, outDir] = process.argv.slice(2);
if (!runDir || !outDir) {
  console.error('usage: node e2e/persona-wave/html-report.mjs <run-out-dir> <findings-dir>');
  process.exit(2);
}

const { meta, results } = JSON.parse(fs.readFileSync(path.join(runDir, 'results.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(runDir, 'summary.json'), 'utf8'));
const findings = JSON.parse(fs.readFileSync(path.join(outDir, 'findings.json'), 'utf8'));

// Embed referenced screenshots so the file works on its own.
const images = {};
for (const f of findings.findings) {
  for (const key of ['before', 'after']) {
    const rel = f[key];
    if (!rel || images[rel]) continue;
    const abs = path.join(outDir, rel);
    if (fs.existsSync(abs)) images[rel] = `data:image/png;base64,${fs.readFileSync(abs).toString('base64')}`;
  }
}

const MAX_EVENTS = 140;
function trimTimeline(tl) {
  if (tl.length <= MAX_EVENTS) return tl;
  // Keep every value/friction/goto event, fill the rest with clicks in order.
  const keep = new Set();
  tl.forEach((t, i) => { if (t.action !== 'CLICK') keep.add(i); });
  for (let i = 0; i < tl.length && keep.size < MAX_EVENTS; i += 1) keep.add(i);
  const out = [];
  let skipped = 0;
  tl.forEach((t, i) => {
    if (keep.has(i)) {
      if (skipped) out.push({ gap: skipped });
      skipped = 0;
      out.push(t);
    } else skipped += 1;
  });
  if (skipped) out.push({ gap: skipped });
  return out;
}

const personas = results.map((r) => ({
  id: r.persona.id,
  role: r.persona.role,
  fi: r.persona.fiType,
  temperament: r.persona.temperament,
  device: r.persona.device,
  source: r.persona.source,
  entry: r.persona.entry,
  journey: r.persona.journey,
  depth: r.persona.courseDepth,
  outcome: r.outcome,
  clicks: r.clicks,
  ms: r.durationMs,
  firstValue: r.firstValue && { id: r.firstValue.id, clicks: r.firstValue.clicks, ms: r.firstValue.ms },
  valueIndex: r.valueIndex,
  experience: r.experience,
  deadEnds: r.deadEnds,
  values: [...new Set(r.values.map((v) => v.id))],
  friction: r.friction.map((f) => ({ kind: f.kind, detail: f.detail.slice(0, 180), severity: f.severity, env: f.env })),
  modules: r.course
    ? r.course.modules.map((m) => ({ n: m.number, tryDone: !!m.tryDone, saved: !!m.artifactSaved, ms: m.ms, clicks: m.clicks }))
    : null,
  timeline: trimTimeline(
    r.timeline.map((t) => ({ s: Math.round(t.ms / 1000), c: t.clicks, a: t.action, n: t.note.replace(/\s+/g, ' ').slice(0, 140), u: t.url })),
  ),
}));

// Some module page titles weren't loaded when recorded; take the first
// non-empty title seen for each module across all personas.
const moduleTitles = {};
for (const r of results) for (const m of r.course?.modules ?? []) if (m.title && !moduleTitles[m.number]) moduleTitles[m.number] = m.title;
for (const m of summary.course?.moduleStats ?? []) m.title = m.title || moduleTitles[m.number] || '';
const typedCertificate = results.filter((r) => r.persona.courseDepth >= 18 && r.friction.some((f) => f.kind === 'no_click_path' && /certificate/.test(f.detail))).length;

const data = {
  typedCertificate,
  meta,
  totals: summary.totals,
  journeys: summary.journeys,
  journeyLabels: Object.fromEntries(JOURNEY_QUOTAS.map((q) => [q.journey, q.label])),
  course: summary.course,
  issues: summary.issues.slice(0, 80).map((i) => ({
    kind: i.kind, detail: i.detail.slice(0, 200), personas: i.personas.length, severity: i.severity, env: !!i.env, paths: i.paths.slice(0, 3),
  })),
  findings,
  images,
  personas,
};

const json = JSON.stringify(data).replace(/</g, '\\u003c');
const template = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'html-report.template.html'), 'utf8');
const html = template.replace('/*__DATA__*/null', json).replace('__TITLE__', findings.title ?? 'Persona Wave');
const dest = path.join(outDir, 'index.html');
fs.writeFileSync(dest, html);
console.log(`${dest} (${(html.length / 1024).toFixed(0)} KB)`);
