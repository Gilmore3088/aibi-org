// GET /api/guides/safe-ai-use
//
// Generates and serves the Safe AI Use Guide as a downloadable PDF.
// Public endpoint — no authentication required (guide is a free lead-generation artifact).
//
// Fonts are registered once per process (module-level) via React PDF Font API.
// Pattern: identical to generate-static-artifacts.mjs font registration.
//
// Usage: called by the GuideRequestForm after successful email capture,
// or directly as a download link once a user has submitted their email.

import React from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import path from 'path';
import { SafeAIUseGuideDocument } from '@/lib/pdf/SafeAIUseGuideDocument';

const PDF_FILENAME = 'AiBI-Safe-AI-Use-Guide.pdf';

// ---------------------------------------------------------------------------
// Font registration — must run before first renderToBuffer call.
// Fonts live in public/fonts/ and are served as static assets.
// In a Next.js server context process.cwd() is the project root.
// ---------------------------------------------------------------------------
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) return;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  Font.registerHyphenationCallback((word) => [word]);

  Font.register({
    family: 'Cormorant',
    fonts: [
      { src: path.join(fontsDir, 'Cormorant-Variable.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'Cormorant-Variable.ttf'), fontWeight: 700 },
      {
        src: path.join(fontsDir, 'Cormorant-Italic-Variable.ttf'),
        fontStyle: 'italic',
        fontWeight: 400,
      },
    ],
  });

  Font.register({
    family: 'CormorantSC',
    fonts: [{ src: path.join(fontsDir, 'CormorantSC-Bold.ttf'), fontWeight: 700 }],
  });

  Font.register({
    family: 'DMSans',
    fonts: [
      { src: path.join(fontsDir, 'DMSans-Variable.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'DMSans-Variable.ttf'), fontWeight: 700 },
    ],
  });

  Font.register({
    family: 'DMMono',
    fonts: [{ src: path.join(fontsDir, 'DMMono-Regular.ttf'), fontWeight: 400 }],
  });

  fontsRegistered = true;
}

// ---------------------------------------------------------------------------
// GET — generate and stream PDF
// ---------------------------------------------------------------------------
export async function GET(): Promise<Response> {
  try {
    ensureFonts();

    const element = React.createElement(
      SafeAIUseGuideDocument,
    ) as React.ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(element);
    const body = new Uint8Array(buffer);

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (err) {
    console.error('[safe-ai-use-guide] PDF generation error:', err);
    return new Response(JSON.stringify({ error: 'PDF generation failed. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
