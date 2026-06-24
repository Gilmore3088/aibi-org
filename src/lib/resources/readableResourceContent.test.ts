import { describe, expect, it } from 'vitest';

import {
  extractReadableBodyHtml,
  readableResourceStaticParams,
} from './readableResourceContent';
import { readableFreeResources } from './freeResources';

describe('readable resource content', () => {
  it('publishes readable params for every source-backed public PDF resource', () => {
    expect(readableResourceStaticParams().map((param) => param.slug)).toEqual(
      readableFreeResources.map((resource) => resource.slug),
    );
    expect(readableResourceStaticParams().length).toBeGreaterThanOrEqual(18);
  });

  it('extracts only safe body content from source HTML', () => {
    const html = `
      <!doctype html>
      <html>
        <head><title>Ignore me</title></head>
        <body>
          <section><h1 onclick="alert(1)">Readable</h1></section>
          <script>alert('bad')</script>
          <iframe src="https://example.com"></iframe>
          <a href="javascript:alert(1)">bad link</a>
        </body>
      </html>
    `;

    const body = extractReadableBodyHtml(html);

    expect(body).toContain('<h1>Readable</h1>');
    expect(body).not.toMatch(/script|iframe|onclick|javascript:/i);
    expect(body).toContain('href="#"');
  });
});
