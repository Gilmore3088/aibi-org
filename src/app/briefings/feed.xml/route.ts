// RSS 2.0 feed for /briefings. Includes legacy essays (absolute /resources
// URLs) so the feed is the one complete editorial stream. Referenced from
// /briefings metadata via alternates.types, and consumed by the weekly
// MailerLite digest routine.

import { listAllBriefings } from '@content/briefings/_lib/registry';
import { SITE_URL } from '@/lib/seo/jsonld';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(): Promise<Response> {
  const briefings = await listAllBriefings();
  const items = briefings
    .map((b) => {
      const url = `${SITE_URL}${b.href}`;
      return [
        '    <item>',
        `      <title>${esc(b.title)}</title>`,
        `      <link>${esc(url)}</link>`,
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <pubDate>${new Date(`${b.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        `      <category>${esc(b.category)}</category>`,
        ...(b.dek ? [`      <description>${esc(b.dek)}</description>`] : []),
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>The AI Banking Institute — Briefings</title>',
    `    <link>${SITE_URL}/briefings</link>`,
    `    <atom:link href="${SITE_URL}/briefings/feed.xml" rel="self" type="application/rss+xml"/>`,
    '    <description>Daily pulse briefings and weekly deep dives on AI in banking for community banks and credit unions.</description>',
    '    <language>en-us</language>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=900',
    },
  });
}
