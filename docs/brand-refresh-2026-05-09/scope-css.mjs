#!/usr/bin/env node
/**
 * Scope a bundle's <style> block under a wrapper class.
 * Usage: node scope-css.mjs <input.html> <output.css> <.wrapper>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inputPath, outputPath, wrapperRaw] = process.argv;
if (!inputPath || !outputPath || !wrapperRaw) {
  console.error('usage: node scope-css.mjs <input.html> <output.css> <.wrapper>');
  process.exit(1);
}
const wrapper = wrapperRaw.startsWith('.') ? wrapperRaw : `.${wrapperRaw}`;
const wrapperBare = wrapper.slice(1);

const html = readFileSync(inputPath, 'utf8');
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (!m) { console.error('no <style> block found'); process.exit(1); }
let css = m[1];

// 1. Bind font vars to next/font
css = css.replace(/--serif:\s*'Newsreader'[^;]*;/g, `--serif: var(--font-newsreader), Georgia, serif;`);
css = css.replace(/--sans:\s*'Geist'[^;]*;/g, `--sans: var(--font-geist-sans), -apple-system, system-ui, sans-serif;`);
css = css.replace(/--mono:\s*'JetBrains Mono'[^;]*;/g, `--mono: var(--font-jetbrains-mono), ui-monospace, monospace;`);

// 2. Find @keyframes blocks and replace them with placeholders so the main
//    transformer skips them entirely. We rename + restore at the end.
const keyframes = [];
// Balanced braces: outer {} containing one level of nested {}
css = css.replace(/@(-webkit-)?keyframes\s+(\S+)\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, (full, vendor, name) => {
  const newName = `${wrapperBare}-${name}`;
  const renamed = full.replace(`keyframes ${name}`, `keyframes ${newName}`);
  keyframes.push({ oldName: name, newName, body: renamed });
  return `__KEYFRAMES_${keyframes.length - 1}__`;
});

// 3. Walk the CSS and prefix each selector at depth 0 or directly inside @media.
const out = [];
let depth = 0;
let buf = '';
let i = 0;
let inComment = false;

const prefixSelector = (sel) => {
  return sel
    .split(',')
    .map(part => {
      const p = part.trim();
      if (!p) return '';
      if (p === ':root' || p === 'body' || p === 'html' || p === 'html, body' || p === '*') return wrapper;
      // body[data-x] / body.foo / body#bar / body:hover → .wrapper[data-x] etc.
      if (/^body[\[:.#>+~ ]/.test(p)) return wrapper + p.slice(4);
      if (/^html[\[:.#>+~ ]/.test(p)) return wrapper + p.slice(4);
      if (p.startsWith(wrapper)) return p;
      return `${wrapper} ${p}`;
    })
    .filter(Boolean)
    .filter((p, idx, arr) => arr.indexOf(p) === idx) // dedupe
    .join(', ');
};

while (i < css.length) {
  const ch = css[i];
  const ch2 = css.slice(i, i + 2);

  if (!inComment && ch2 === '/*') {
    // Find the comment end and emit verbatim, OUTSIDE buf so it doesn't
    // get treated as part of the next selector prelude.
    const end = css.indexOf('*/', i + 2);
    const comment = css.slice(i, end + 2);
    out.push(comment);
    i = end + 2;
    continue;
  }

  if (ch === '{') {
    const prelude = buf.replace(/^\s+|\s+$/g, '');
    buf = '';
    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      out.push('\n' + prelude + ' {\n');
    } else if (prelude.startsWith('@')) {
      // generic @rule (e.g. @import, @charset) — emit verbatim
      out.push(prelude + ' {');
    } else {
      out.push('\n' + prefixSelector(prelude) + ' {');
    }
    depth++;
    i++;
    continue;
  }

  if (ch === '}') {
    out.push(buf + '\n}\n');
    buf = '';
    depth--;
    i++;
    continue;
  }

  buf += ch;
  i++;
}
if (buf.trim()) out.push(buf);

// 4. Restore keyframes blocks (already renamed)
let result = out.join('');
keyframes.forEach((kf, idx) => {
  result = result.replace(`__KEYFRAMES_${idx}__`, '\n' + kf.body + '\n');
});

// 5. Update animation references to use the new keyframe names
for (const { oldName, newName } of keyframes) {
  const pattern = new RegExp(`(animation(?:-name)?\\s*:[^;]*?\\b)${oldName}\\b`, 'g');
  result = result.replace(pattern, `$1${newName}`);
}

// 6. Strip multiple consecutive blank lines for readability
result = result.replace(/\n{3,}/g, '\n\n');

writeFileSync(outputPath, `/* Generated from ${inputPath} via scope-css.mjs.
 * Do not edit by hand; re-run the script if the bundle's <style> changes.
 *
 * Wrapper: ${wrapper}
 */\n${result}\n`);

console.log(`OK: scoped → ${outputPath} (${result.length} bytes, ${keyframes.length} keyframe blocks)`);
