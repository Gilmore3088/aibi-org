import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { CREAM, GOLD, INK } from '@/lib/brand/colors';

// Shared 1200×630 link-preview card for content pages (briefings, role
// playbooks): navy ground, mono kicker, the headline in the site's display
// serif, and the [Ai] mark. Fonts are static instances of the self-hosted
// web fonts (assets/brand-fonts), read from disk so rendering needs no network.

export const OG_SIZE = { width: 1200, height: 630 };

const GOLD_SOFT = '#E6D39B';

async function font(name: string) {
  return readFile(join(process.cwd(), 'assets/brand-fonts', name));
}

export interface ArticleCardInput {
  readonly kicker: string;
  readonly title: string;
  readonly footer: string;
}

export async function renderArticleCard({ kicker, title, footer }: ArticleCardInput) {
  const [serif, serifItalic, sans, mono] = await Promise.all([
    font('Newsreader-Display.ttf'),
    font('Newsreader-Display-Italic.ttf'),
    font('Inter-Regular.ttf'),
    font('JetBrainsMono-Regular.ttf'),
  ]);
  const titleSize = title.length > 90 ? 58 : title.length > 60 ? 68 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: INK,
          color: CREAM,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 34, letterSpacing: '-0.01em' }}>
          <span style={{ color: GOLD }}>[</span>
          <span>A</span>
          <span style={{ fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 38, margin: '0 1px' }}>i</span>
          <span style={{ color: GOLD }}>]</span>
          <span style={{ marginLeft: 12 }}>Banking Institute</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_SOFT }}>
            {kicker}
          </div>
          <div style={{ fontFamily: 'Newsreader', fontSize: titleSize, lineHeight: 1.04, letterSpacing: '-0.01em', maxWidth: 1000 }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 96, height: 2, background: GOLD }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 20, color: 'rgba(247, 243, 234, 0.7)' }}>
            <span>{footer}</span>
            <span style={{ color: GOLD }}>aibankinginstitute.com</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Newsreader', data: serif, style: 'normal', weight: 400 },
        { name: 'Newsreader', data: serifItalic, style: 'italic', weight: 400 },
        { name: 'Inter', data: sans, style: 'normal', weight: 400 },
        { name: 'JetBrains Mono', data: mono, style: 'normal', weight: 400 },
      ],
    },
  );
}
