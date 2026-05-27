import { ImageResponse } from 'next/og';

// Open Graph image — 1200×630, served at /opengraph-image (Next.js convention).
// Rendered via @vercel/og at the edge so it has zero static asset size.
//
// Mockup palette (matches src/styles/tokens-mockup.css):
//   --ink     #071A2F  (primary dark)
//   --cream   #F7F3EA  (page surface)
//   --gold    #C8A24A  (single accent)
//
// Rules:
//   - Two-line wordmark + thin gold rule.
//   - Inter via system fallback at edge runtime (no custom font load to
//     keep cold-start cheap). Satori falls back to system-ui where Inter
//     isn't preloaded.
//   - Drop the retired "A-B-C of AI Banking" tagline.
//   - Tagline "Turning Bankers into Builders" stays.
//   - No italics (italics retired site-wide).
//   - Dark navy background, cream + gold accents — matches the mockup
//     hero card aesthetic.

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
        {/* Top: two-line wordmark with gold seal accent */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: GOLD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: INK,
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: 0,
            }}
          >
            Ai
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: 0,
                lineHeight: 1.1,
                color: CREAM,
              }}
            >
              The AI Banking Institute
            </div>
            <div
              style={{
                fontFamily: INTER_STACK,
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.2,
                color: ON_DARK_70,
              }}
            >
              Regulated Intelligence
            </div>
          </div>
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
              fontSize: 18,
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
              fontSize: 104,
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
              fontSize: 16,
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
