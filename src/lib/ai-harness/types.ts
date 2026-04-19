export type ProviderName = 'anthropic' | 'openai' | 'gemini';

export interface Message {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface ChatRequest {
  readonly model: string;
  readonly system?: string;
  readonly messages: readonly Message[];
  readonly maxTokens: number;
  readonly temperature?: number;
}

export type StopReason = 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' | 'error';

export interface ChatUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface ChatResponse {
  readonly text: string;
  readonly stopReason: StopReason;
  readonly usage: ChatUsage;
  readonly providerRaw?: unknown;
}

export interface StreamChunk {
  readonly type: 'text' | 'stop' | 'error';
  readonly text?: string;
  readonly stopReason?: StopReason;
  readonly error?: Error;
}

export type LLMErrorKind =
  | 'auth' | 'rate-limit' | 'invalid-request' | 'server' | 'timeout' | 'unknown';

export class LLMError extends Error {
  readonly provider: ProviderName;
  readonly kind: LLMErrorKind;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(
    provider: ProviderName,
    kind: LLMErrorKind,
    message: string,
    retryable: boolean,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.kind = kind;
    this.retryable = retryable;
    this.cause = cause;
  }
}

export interface LLMClient {
  readonly name: ProviderName;
  chat(req: ChatRequest): Promise<ChatResponse>;
  stream(req: ChatRequest): AsyncIterable<StreamChunk>;
}
