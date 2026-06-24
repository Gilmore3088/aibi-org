import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rateLimitOrFail, getRequestIp } from '@/lib/api/rate-limit';

const PDF_FILENAME = 'AiBI-Prompt-Cards.pdf';
const PDF_PATH = join(process.cwd(), 'public', 'downloads', 'aibi-prompt-cards.pdf');

export async function GET(request: Request): Promise<Response> {
  // Static PDF serving avoids the React PDF render path that fails in production,
  // while still throttling the lead-capture asset against scrape-abuse.
  const limited = await rateLimitOrFail({
    key: 'prompt-cards-download',
    scope: 'ip',
    identifier: getRequestIp(request),
    max: 20,
    windowSeconds: 3600,
  });
  if (limited) return limited as unknown as Response;

  try {
    const file = await readFile(PDF_PATH);
    return new Response(new Uint8Array(file), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILENAME}"`,
        'Content-Length': String(file.length),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('[prompt-cards/download] static PDF read failed:', error);
    return new Response(JSON.stringify({ error: 'PDF unavailable. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
