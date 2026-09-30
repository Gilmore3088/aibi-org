// Readable download failures.
//
// File routes (PDFs, Word docs, cards, certificates) are opened by a plain
// link, so when one fails the browser shows whatever the route returned. A
// JSON body like {"error":"Service not configured."} strands the visitor on
// a raw error screen (persona wave, 2026-09-30). This wrapper keeps JSON for
// scripts and fetch() callers and, for a browser page load only, swaps the
// JSON error for a short page that says what happened and what to do next.

const SUPPORT_EMAIL = 'hello@aibankinginstitute.com';

interface ErrorCopy {
  readonly title: string;
  readonly body: string;
  readonly primary: { readonly label: string; readonly href: string };
}

export function wantsHtml(request: Request): boolean {
  const mode = request.headers.get('sec-fetch-mode');
  if (mode) return mode === 'navigate';
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('text/html') && !accept.trim().startsWith('application/json');
}

function sameOriginPath(request: Request, candidate: string | null): string | null {
  if (!candidate) return null;
  try {
    const here = new URL(request.url);
    const target = new URL(candidate, here);
    if (target.origin !== here.origin || target.pathname.startsWith('/api/')) return null;
    return `${target.pathname}${target.search}`;
  } catch {
    return null;
  }
}

function copyFor(status: number, backPath: string, retryPath: string): ErrorCopy {
  switch (status) {
    case 401:
      return {
        title: 'Sign in to download this file',
        body: 'This file is part of your account. Sign in and you will come straight back here.',
        primary: { label: 'Sign in', href: `/auth/login?next=${encodeURIComponent(backPath)}` },
      };
    case 403:
      return {
        title: 'This file comes with a purchase',
        body: 'It is included with the AiBI-Foundation course or the In-Depth Assessment. If you have already bought one, sign in with the email you used at checkout.',
        primary: { label: 'See what is included', href: '/pricing' },
      };
    case 404:
      return {
        title: 'We could not find that file',
        body: 'The link may be out of date. The current version is in the resource library.',
        primary: { label: 'Browse the library', href: '/resources' },
      };
    case 429:
      return {
        title: 'Too many downloads at once',
        body: 'Please wait a minute, then try again.',
        primary: { label: 'Try again', href: retryPath },
      };
    default:
      return {
        title: 'This download is temporarily unavailable',
        body: `Nothing is wrong on your end. Please try again in a few minutes. If it keeps happening, email ${SUPPORT_EMAIL} and we will send you the file.`,
        primary: { label: 'Try again', href: retryPath },
      };
  }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function downloadErrorPage(request: Request, status: number): Response {
  const url = new URL(request.url);
  const retryPath = `${url.pathname}${url.search}`;
  const backPath = sameOriginPath(request, request.headers.get('referer')) ?? '/resources';
  const copy = copyFor(status, backPath, retryPath);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(copy.title)} · The AI Banking Institute</title>
<style>
:root{--ink:#071A2F;--cream:#F7F3EA;--gold:#C8A24A;--slate:#475569;color-scheme:light}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:var(--cream);color:var(--ink);font:16px/1.6 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:460px;width:100%;background:#fff;border:1px solid rgba(7,26,47,.1);border-radius:18px;padding:28px}
.k{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#7A5F1E;margin:0 0 8px}
h1{font-size:22px;line-height:1.25;margin:0 0 10px}p{margin:0 0 20px;color:var(--slate)}
.row{display:flex;flex-wrap:wrap;gap:10px}a{border-radius:10px;padding:10px 16px;font-weight:700;font-size:14px;text-decoration:none}
.p{background:var(--ink);color:var(--cream)}.s{border:1px solid rgba(7,26,47,.2);color:var(--ink)}a:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
</style></head>
<body><main role="alert">
<p class="k">The AI Banking Institute</p>
<h1>${esc(copy.title)}</h1>
<p>${esc(copy.body)}</p>
<div class="row"><a class="p" href="${esc(copy.primary.href)}">${esc(copy.primary.label)}</a><a class="s" href="${esc(backPath)}">Go back</a><a class="s" href="/support/purchase-help">Contact support</a></div>
</main></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

type Handler<A extends unknown[]> = (request: Request, ...rest: A) => Promise<Response>;

export function withReadableDownloadErrors<A extends unknown[]>(handler: Handler<A>): Handler<A> {
  return async (request: Request, ...rest: A) => {
    let response: Response;
    try {
      response = await handler(request, ...rest);
    } catch (error) {
      if (!wantsHtml(request)) throw error;
      console.error('[download] handler threw:', error);
      return downloadErrorPage(request, 500);
    }
    if (response.status < 400 || !wantsHtml(request)) return response;
    const type = response.headers.get('content-type') ?? '';
    if (!type.includes('application/json') && type !== '') return response;
    return downloadErrorPage(request, response.status);
  };
}
