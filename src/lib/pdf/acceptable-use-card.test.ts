import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/pdf/generate', () => ({
  generatePdfFromHtml: vi.fn(async () => Buffer.from('%PDF-card')),
}));

import { generatePdfFromHtml } from '@/lib/pdf/generate';
import {
  buildAcceptableUseCardHtml,
  buildAcceptableUseCardPdfBuffer,
  escapeHtml,
} from './acceptable-use-card';

describe('acceptable use card PDF rendering', () => {
  it('escapes learner-provided text before building print HTML', () => {
    expect(escapeHtml(`Ops <script>alert("x")</script> & 'quoted'`)).toBe(
      'Ops &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;',
    );

    const html = buildAcceptableUseCardHtml({
      roleContext: 'Ops <script>alert("x")</script>',
      primaryAiTool: 'ChatGPT & Copilot',
      highestRiskScenario: '<img src=x onerror=alert(1)>',
      quickWinUseCase: `Review "public" policy copy`,
      generatedDate: 'June 23, 2026',
    });

    expect(html).toContain('Ops &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('ChatGPT &amp; Copilot');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('Review &quot;public&quot; policy copy');
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img src=x');
  });

  it('renders via the Chromium HTML print helper', async () => {
    const buffer = await buildAcceptableUseCardPdfBuffer({
      roleContext: 'Branch manager',
      primaryAiTool: 'Enterprise Copilot',
      highestRiskScenario: 'Pasting member complaint details',
      quickWinUseCase: 'Drafting a public branch memo',
      generatedDate: 'June 23, 2026',
    });

    expect(buffer.toString()).toBe('%PDF-card');
    expect(generatePdfFromHtml).toHaveBeenCalledWith({
      html: expect.stringContaining('Acceptable Use Card'),
      viewport: { width: 1200, height: 1600 },
      pdf: {
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' },
        preferCSSPageSize: true,
      },
    });
  });
});
