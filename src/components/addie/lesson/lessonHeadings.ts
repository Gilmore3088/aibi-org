// lessonHeadings — extract H2/H3 headings from a lesson body_md so the
// LessonTOC sticky right rail can render a scroll-spy outline. Mirrors
// the same SCRIPT/PRODUCTION stripping the renderer applies so the TOC
// only shows headings the learner will actually see.

export interface LessonHeading {
  readonly level: 2 | 3;
  readonly text: string;
  readonly slug: string;
}

const PRODUCTION = /^##\s+PRODUCTION\s*$/i;
const SKIP_TITLES = /^##\s+(SCRIPT(\s*\([^)]*\))?|SHARED\s+INTRO)\s*$/i;
const ANY_H2 = /^##\s+/;
// Mirrors LessonBody's NUM_LEAD: `**One: <lead>.** ...` (or Two/Three/etc.)
// inside a blockquote line. We surface these as virtual h3 headings so the
// sticky TOC has anchors on script-only lessons (e.g. m1.1) whose ONLY h2s
// are the meta-sections we strip (SCRIPT / PRODUCTION).
export const SCENE_LEAD = /\*\*(One|Two|Three|Four|Five|Six):\s*([^*]+?)\*\*/i;

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s*\(verbatim\)\s*$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function extractHeadings(body: string): LessonHeading[] {
  if (!body) return [];
  const lines = body.split(/\n/);
  const headings: LessonHeading[] = [];
  const slugCounts = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // Strip the PRODUCTION block from heading extraction too.
    if (PRODUCTION.test(ln)) {
      i++;
      while (i < lines.length && !ANY_H2.test(lines[i])) i++;
      i--;
      continue;
    }
    if (SKIP_TITLES.test(ln)) continue;

    let level: 2 | 3 | null = null;
    let raw = '';
    if (ln.startsWith('### ')) {
      level = 3;
      raw = ln.slice(4).trim();
    } else if (ln.startsWith('## ')) {
      level = 2;
      raw = ln.slice(3).trim().replace(/\s*\(verbatim\)\s*$/i, '');
    } else if (ln.startsWith('# ')) {
      level = 2;
      raw = ln.slice(2).trim();
    } else {
      // Virtual h3 from scene leads inside blockquotes. The renderer
      // (LessonBody → detectScenes → renderScene) turns these into numbered
      // scene cards whose container also gets id={slugifyHeading(lead)}.
      const sm = SCENE_LEAD.exec(ln);
      if (sm) {
        level = 3;
        raw = sm[2].trim();
      }
    }
    if (!level || !raw) continue;

    const base = slugifyHeading(raw);
    const n = (slugCounts.get(base) ?? 0) + 1;
    slugCounts.set(base, n);
    const slug = n === 1 ? base : `${base}-${n}`;
    headings.push({ level, text: raw, slug });
  }
  return headings;
}
