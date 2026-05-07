// OpenAI provider for the AiBI sandbox.
//
// Mirrors the contract in `claude.ts`: takes a system prompt + a turn-by-turn
// message history and returns a ReadableStream of UTF-8 text chunks suitable
// for `new Response(stream)` in a Next.js streaming route.
//
// Reads `OPENAI_API_KEY` from the server env. Returns an error stream (never
// throws) when the key is missing or the provider call fails — keeps the
// route handler simple.

import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_MAX_TOKENS = 4096;

export async function streamOpenAI(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config?: { maxTokens?: number; model?: string },
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return errorStream('Server configuration error: missing OPENAI_API_KEY');
  }

  const client = new OpenAI({ apiKey });
  const encoder = new TextEncoder();

  try {
    const completion = await client.chat.completions.create({
      model: config?.model ?? DEFAULT_MODEL,
      max_tokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Stream processing error';
          controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
          controller.close();
        }
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to connect to OpenAI API';
    return errorStream(`Error: ${message}`);
  }
}

function errorStream(message: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(message));
      controller.close();
    },
  });
}
