export interface SandboxConfig {
  readonly systemPrompt: string;
  readonly sampleData: readonly SampleDataFile[];
  readonly suggestedPrompts: readonly string[];
  readonly roleStarts?: readonly SandboxRoleStart[];
}

export interface SampleDataFile {
  readonly id: string;
  readonly label: string;
  readonly type: 'csv' | 'document';
  readonly description: string;
  readonly roleTrack?: string;
  readonly sourceModuleNumber?: number;
}

export interface SandboxRoleStart {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
}

export interface SandboxMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}
