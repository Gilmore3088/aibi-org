import { ImageResponse } from 'next/og';

// Open Graph image — 1200×630, served at /opengraph-image (Next.js convention).
// Rendered via @vercel/og at the edge so it has zero static asset size.
//
// Mockup palette (matches src/styles/tokens-mockup.css):
//   --ink     #071A2F  (primary dark)
//   --cream   #F7F3EA  (page surface)
//   --gold    #C8A24A  (single accent)
//
// Brand v1 (2026-05-28): top-left lockup is the bracketed [Ai] Banking
// Institute mark. The italic "i" is rendered with a serif fallback
// (Georgia → Times New Roman) at edge runtime since Instrument Serif
// isn't registered in Satori; the silhouette of an italic serif "i"
// reads correctly on social previews even without the precise face.

export const runtime = 'edge';
export const alt = 'The AI Banking Institute — Turning Bankers into Builders';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#071A2F';
const CREAM = '#F7F3EA';
const GOLD = '#C8A24A';
const GOLD_SOFT = '#E6D39B';
const ON_DARK_70 = 'rgba(255, 255, 255, 0.70)';

const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
// Brand v1 — fallback chain for the mark's italic "i". Instrument Serif
// is not registered with Satori (would require a binary font fetch on
// every edge invocation); Georgia italic carries the same optical role.
const MARK_SERIF_STACK =
  '"Instrument Serif", Newsreader, "Times New Roman", Georgia, serif';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 84px',
          background: INK,
          color: CREAM,
          fontFamily: INTER_STACK,
        }}
      >
        {/* Top: brand v1 bracketed [Ai] Banking Institute mark. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: INTER_STACK,
            fontSize: '2.25rem',
            fontWeight: 600,
            letterSpacing: '-0.012em',
            lineHeight: 1,
            color: CREAM,
          }}
        >
          <span style={{ color: GOLD, fontWeight: 500 }}>[</span>
          <span>A</span>
          <span
            style={{
              fontFamily: MARK_SERIF_STACK,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '2.5625rem',
              margin: '0 1px',
            }}
          >
            i
          </span>
          <span style={{ color: GOLD, fontWeight: 500 }}>]</span>
          <span style={{ marginLeft: 14 }}>Banking Institute</span>
        </div>

        {/* Middle: editorial statement, gold accent on payoff word */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 400,
              fontSize: '1.125rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: GOLD_SOFT,
            }}
          >
            AI proficiency for community banks &amp; credit unions
          </div>
          <div
            style={{
              fontFamily: INTER_STACK,
              fontWeight: 700,
              fontSize: '6.5rem',
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              color: CREAM,
              maxWidth: '92%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Turning Bankers</span>
            <span>
              into{' '}
              <span style={{ color: GOLD }}>Builders.</span>
            </span>
          </div>
        </div>

        {/* Bottom: gold rule + domain */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 96,
              height: 2,
              background: GOLD,
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: INTER_STACK,
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: ON_DARK_70 }}>
              SR 11-7 &middot; TPRM &middot; ECOA / Reg B aligned
            </span>
            <span style={{ color: GOLD }}>aibankinginstitute.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
