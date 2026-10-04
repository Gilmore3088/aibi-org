// Route coverage across waves: which app pages did any persona actually load?
// Usage: node e2e/persona-wave/route-coverage.mjs <run-out-dir>...
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const APP = new URL('../../src/app', import.meta.url).pathname;
function pages(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p);
    return name === 'page.tsx' ? [p] : [];
  });
}
const routes = pages(APP).map((file) => {
  const segs = relative(APP, file).split(sep).slice(0, -1).filter((s) => !/^\(.*\)$/.test(s));
  const route = '/' + segs.join('/');
  const re = new RegExp('^' + segs.map((s) => (/^\[\.\.\..+\]$/.test(s) ? '/.+' : /^\[.+\]$/.test(s) ? '/[^/]+' : '/' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('') + '/?$');
  return { route, re, dynamic: segs.some((s) => s.startsWith('[')) };
});
// Static routes win over dynamic siblings, as in Next.js.
routes.sort((a, b) => a.dynamic - b.dynamic);

const visited = new Set();
for (const dir of process.argv.slice(2)) {
  const data = JSON.parse(readFileSync(join(dir, 'results.json'), 'utf8'));
  for (const r of Array.isArray(data) ? data : data.results) {
    for (const ev of r.timeline ?? r.events ?? []) {
      const url = ev.url ?? ev.path;
      if (typeof url !== 'string') continue;
      try { visited.add(new URL(url, 'http://x').pathname); } catch {}
    }
  }
}
const hit = new Set();
for (const path of visited) {
  const r = routes.find((x) => x.re.test(path === '/' ? '/' : path.replace(/\/$/, '')));
  if (r) hit.add(r.route);
}
const internal = (r) => r.startsWith('/admin') || r.startsWith('/design-system');
const missed = routes.filter((r) => !hit.has(r.route)).map((r) => r.route);
console.log(JSON.stringify({ total: routes.length, visited: hit.size, internalExcluded: missed.filter(internal), missed: missed.filter((r) => !internal(r)) }, null, 2));
