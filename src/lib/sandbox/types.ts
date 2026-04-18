export interface SandboxConfig {
  readonly systemPrompt: string;
  readonly sampleData: readonly SampleDataFile[];
  readonly suggestedPrompts: readonly string[];
}

export interface SampleDataFile {
  readonly id: string;
  readonly label: string;
  readonly type: 'csv' | 'document';
  readonly description: string;
  readonly roleTrack?: string;
}

export interface SandboxMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}
