// Google Gemini provider for the AiBI sandbox.
//
// Mirrors the contract in `claude.ts`: takes a system prompt + a turn-by-turn
// message history and returns a ReadableStream of UTF-8 text chunks suitable
// for `new Response(stream)` in a Next.js streaming route.
//
// Reads `GEMINI_API_KEY` from the server env. Returns an error stream (never
// throws) when the key is missing or the provider call fails — keeps the
// route handler simple.

import { GoogleGenerativeAI } from '@google/generative-ai';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS = 4096;

export async function streamGemini(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  config?: { maxTokens?: number; model?: string },
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorStream('Server configuration error: missing GEMINI_API_KEY');
  }

  const encoder = new TextEncoder();

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: config?.model ?? DEFAULT_MODEL,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: config?.maxTokens ?? DEFAULT_MAX_TOKENS,
      },
    });

    // Gemini expects `model` instead of `assistant` for prior turns and groups
    // turns under a `parts` array.
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return errorStream('Error: Gemini requires a user message at the end of the history.');
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
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
      err instanceof Error ? err.message : 'Failed to connect to Gemini API';
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
