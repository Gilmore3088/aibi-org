#!/usr/bin/env node
/**
 * Brand the skill-template markdown files in public/artifacts/skill-templates/.
 *
 * These are the "paste into ChatGPT / Claude / Gemini" skill prompts offered
 * from the Foundation course skill-diagnosis panel. They download as raw .md
 * (a PDF can't be pasted into an AI tool), so instead of converting them we
 * give them a consistent, on-brand header + footer. Idempotent: re-running
 * after adding a new template only brands the new file.
 *
 * Run with: node scripts/brand-skill-templates.mjs
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'artifacts', 'skill-templates');

const MARKER = 'The AI Banking Institute · Skill Template';
const HEADER = `> **The AI Banking Institute** · Skill Template
> Paste into ChatGPT, Claude, or Gemini · AIBankingInstitute.com

`;
const FOOTER = `

---

_© 2026 The AI Banking Institute · AIBankingInstitute.com_
_For internal use at your institution. Turning Bankers into Builders._
`;

const files = (await readdir(DIR)).filter((f) => f.endsWith('.md'));
let branded = 0;
for (const name of files) {
  const path = join(DIR, name);
  const body = await readFile(path, 'utf-8');
  if (body.includes(MARKER)) {
    console.log(`  skip (already branded): ${name}`);
    continue;
  }
  await writeFile(path, HEADER + body.trimEnd() + FOOTER, 'utf-8');
  console.log(`  branded: ${name}`);
  branded++;
}
console.log(`\nDone — branded ${branded} of ${files.length} skill templates.`);
