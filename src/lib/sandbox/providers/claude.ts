import Anthropic from '@anthropic-ai/sdk';
import type { RawMessageStreamEvent } from '@anthropic-ai/sdk/resources/messages/messages';

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const DEFAULT_MAX_TOKENS = 2000;

/**
 * Streams a Claude response as a Web ReadableStream of UTF-8 text chunks.
 *
 * Intended for server-side use only (reads ANTHROPIC_API_KEY from env).
 * Returns a stream compatible with `new Response(stream)` in Next.js
 * streaming API routes.
 */
export async function streamClaude(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config?: { maxTokens?: number; model?: string },
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorStream('Server configuration error: missing ANTHROPIC_API_KEY');
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  try {
    const stream = await client.messages.create({
      model: config?.model ?? DEFAULT_MODEL,
      max_tokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream as AsyncIterable<RawMessageStreamEvent>) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Stream processing error';
          controller.enqueue(
            encoder.encode(`\n\n[Error: ${message}]`),
          );
          controller.close();
        }
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to connect to Claude API';
    return errorStream(`Error: ${message}`);
  }
}

/** Returns a ReadableStream that emits a single error message then closes. */
function errorStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  });
}
