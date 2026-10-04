#!/usr/bin/env node
// Prints "Did this work?" feedback for the banker skills over the last N days
// (default 30), worst first. Used by the weekly refresh-skills run.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
//
//   node scripts/skills-feedback-report.mjs [days]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to read skill feedback.');
  process.exit(2);
}
const days = Number(process.argv[2] ?? 30);
const since = new Date(Date.now() - days * 86400000).toISOString();
const res = await fetch(
  `${url}/rest/v1/skill_feedback?select=skill_id,skill_version,worked,note,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=5000`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
if (!res.ok) {
  console.error(`Supabase returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const rows = await res.json();
const by = new Map();
for (const r of rows) {
  const s = by.get(r.skill_id) ?? { yes: 0, no: 0, notes: [] };
  if (r.worked) s.yes += 1;
  else s.no += 1;
  if (r.note) s.notes.push(`v${r.skill_version}: ${r.note}`);
  by.set(r.skill_id, s);
}
const ranked = [...by.entries()].sort((a, b) => b[1].no - a[1].no || a[1].yes - b[1].yes);
console.log(`Skill feedback, last ${days} days (${rows.length} responses)\n`);
for (const [id, s] of ranked) {
  console.log(`${id}\tnot quite ${s.no}\tyes ${s.yes}`);
  for (const n of s.notes.slice(0, 5)) console.log(`\t- ${n}`);
}
