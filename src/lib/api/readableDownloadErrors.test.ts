import { describe, expect, it } from 'vitest';
import { downloadErrorPage, wantsHtml, withReadableDownloadErrors } from './readableDownloadErrors';

const BROWSER = { 'sec-fetch-mode': 'navigate', accept: 'text/html,application/xhtml+xml', referer: 'http://localhost/resources/prompting-foundation' };
const failing = (status: number) => withReadableDownloadErrors(async () => Response.json({ error: 'Service not configured.' }, { status }));

describe('readable download errors', () => {
  it('shows a readable page, not raw JSON, when a browser opens a failing download', async () => {
    const res = await failing(503)(new Request('http://localhost/api/resources/x/download', { headers: BROWSER }));
    const html = await res.text();
    expect(res.status).toBe(503);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('This download is temporarily unavailable');
    expect(html).not.toContain('Service not configured');
    expect(html).toContain('href="/resources/prompting-foundation"');
    expect(html).toContain('href="/api/resources/x/download"');
  });

  it('keeps JSON for fetch and script callers', async () => {
    const res = await failing(503)(new Request('http://localhost/api/resources/x/download', { headers: { accept: 'application/json', 'sec-fetch-mode': 'cors' } }));
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ error: 'Service not configured.' });
  });

  it('passes successful files through untouched', async () => {
    const ok = withReadableDownloadErrors(async () => new Response('%PDF', { headers: { 'Content-Type': 'application/pdf' } }));
    const res = await ok(new Request('http://localhost/api/f', { headers: BROWSER }));
    expect(res.headers.get('content-type')).toBe('application/pdf');
  });

  it('sends a signed-out visitor to sign in and back to the page they came from', async () => {
    const html = await (await failing(401)(new Request('http://localhost/api/f', { headers: BROWSER }))).text();
    expect(html).toContain('Sign in to download this file');
    expect(html).toContain('/auth/login?next=%2Fresources%2Fprompting-foundation');
  });

  it('points a 403 at pricing and a bad or missing file at the library', async () => {
    expect(await (await failing(403)(new Request('http://localhost/api/f', { headers: BROWSER }))).text()).toContain('href="/pricing"');
    expect(await (await failing(404)(new Request('http://localhost/api/f', { headers: BROWSER }))).text()).toContain('We could not find that file');
    expect(await (await failing(400)(new Request('http://localhost/api/f', { headers: BROWSER }))).text()).toContain('The link may be out of date');
  });

  it('turns a thrown handler into a readable page for browsers', async () => {
    const boom = withReadableDownloadErrors(async () => {
      throw new Error('boom');
    });
    const res = await boom(new Request('http://localhost/api/f', { headers: BROWSER }));
    expect(res.status).toBe(500);
    expect(await res.text()).toContain('temporarily unavailable');
  });

  it('never links back to an off-site referrer or another API route', () => {
    const page = (referer: string) => downloadErrorPage(new Request('http://localhost/api/f', { headers: { ...BROWSER, referer } }), 503);
    return Promise.all([
      page('https://evil.example/phish').text().then((h) => expect(h).toContain('href="/resources"')),
      page('http://localhost/api/other').text().then((h) => expect(h).toContain('href="/resources"')),
    ]);
  });

  it('detects browser navigations', () => {
    expect(wantsHtml(new Request('http://x', { headers: { 'sec-fetch-mode': 'navigate' } }))).toBe(true);
    expect(wantsHtml(new Request('http://x', { headers: { 'sec-fetch-mode': 'cors', accept: 'text/html' } }))).toBe(false);
    expect(wantsHtml(new Request('http://x', { headers: { accept: 'text/html' } }))).toBe(true);
    expect(wantsHtml(new Request('http://x'))).toBe(false);
  });
});
