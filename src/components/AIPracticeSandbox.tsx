'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { scanForPII } from '@/lib/sandbox/pii-scanner';
import { renderMarkdown } from '@/lib/sandbox/markdown-renderer';
import type { SandboxConfig, SandboxMessage } from '@/lib/sandbox/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGES = 20;
const PROVIDERS = [
  { id: 'claude', label: 'Claude', enabled: true },
  { id: 'chatgpt', label: 'ChatGPT', enabled: false },
  { id: 'gemini', label: 'Gemini', enabled: false },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIPracticeSandboxProps {
  readonly moduleId: string;
  readonly product: 'aibi-p' | 'aibi-s' | 'aibi-l';
  readonly sandboxConfig: SandboxConfig;
  readonly accentColor?: string;
}

// ---------------------------------------------------------------------------
// SampleDataViewer — renders sample data as browsable cards instead of
// a raw text dump. Detects markdown headings (## Scenario N:) and splits
// into collapsible cards. CSV data renders as a scrollable table.
// ---------------------------------------------------------------------------

function SampleDataViewer({
  content,
  type,
  accentColor,
  onSendToChat,
}: {
  content: string;
  type: 'csv' | 'document';
  accentColor: string;
  onSendToChat: (text: string) => void;
}) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  if (type === 'csv') {
    // Render CSV as a scrollable table
    const lines = content.trim().split('\n');
    const headers = lines[0]?.split(',') ?? [];
    const rows = lines.slice(1).map((line) => line.split(','));
    return (
      <div className="max-h-64 overflow-auto rounded-[2px] border border-[color:var(--color-ink)]/10">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[color:var(--color-parch)]">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[color:var(--color-slate)] border-b border-[color:var(--color-ink)]/10 whitespace-nowrap">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[color:var(--color-ink)]/5 hover:bg-[color:var(--color-parch)]/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 font-sans text-xs text-[color:var(--color-ink)] whitespace-nowrap">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Document type: split on ## headings into cards
  const sections = content.split(/^## /m).filter(Boolean);

  if (sections.length <= 1) {
    // No headings found — show as plain text (shorter docs)
    return (
      <pre className="max-h-48 overflow-y-auto rounded-[2px] bg-[color:var(--color-parch)] p-3 font-mono text-xs text-[color:var(--color-ink)]">
        {content}
      </pre>
    );
  }

  // Parse each section into title + body
  const cards = sections.map((section) => {
    const firstNewline = section.indexOf('\n');
    const title = firstNewline > -1 ? section.slice(0, firstNewline).trim() : section.trim();
    const body = firstNewline > -1 ? section.slice(firstNewline).trim() : '';
    return { title, body };
  });

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {cards.map((card, idx) => {
        const isExpanded = expandedCard === idx;
        return (
          <div
            key={idx}
            className="rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedCard(isExpanded ? null : idx)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[color:var(--color-parch-dark)] transition-colors"
              aria-expanded={isExpanded}
            >
              <span className="font-sans text-sm font-medium text-[color:var(--color-ink)] leading-snug">
                {card.title}
              </span>
              <svg
                className="w-3 h-3 shrink-0 transition-transform duration-200"
                style={{ color: accentColor, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {isExpanded && card.body && (
              <div className="px-4 pb-3 border-t border-[color:var(--color-ink)]/5">
                <p className="font-sans text-xs text-[color:var(--color-ink)]/75 leading-relaxed mt-2 mb-3">
                  {card.body}
                </p>
                <button
                  type="button"
                  onClick={() => onSendToChat(`Analyze Scenario: ${card.title}\n\n${card.body}`)}
                  className="font-sans text-[10px] font-semibold uppercase tracking-[1.2px] rounded-[2px] px-3 py-1.5 transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-linen)', backgroundColor: accentColor }}
                >
                  Ask AI about this
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIPracticeSandbox({
  moduleId,
  product,
  sandboxConfig,
  accentColor = 'var(--color-terra)',
}: AIPracticeSandboxProps) {
  const [messages, setMessages] = useState<SandboxMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [selectedDataIndex, setSelectedDataIndex] = useState(0);
  const [dataExpanded, setDataExpanded] = useState(false);
  const [dataContent, setDataContent] = useState<string | null>(null);
  const [piiWarning, setPiiWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remainingMessages = MAX_MESSAGES - messageCount;
  const selectedData = sandboxConfig.sampleData[selectedDataIndex];

  // -------------------------------------------------------------------------
  // Fetch sample data — loaded eagerly so it can be injected into the
  // system prompt. The AI already has the data; learner just asks questions.
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (dataContent !== null) return;

    const dataId = sandboxConfig.sampleData[selectedDataIndex].id;
    const ext = sandboxConfig.sampleData[selectedDataIndex].type === 'csv' ? 'csv' : 'md';
    // moduleId is "aibi-p-module-5" — extract "module-5" for the public path
    const moduleDir = moduleId.replace(/^aibi-[psl]-/, '');
    const path = `/sandbox-data/${product}/${moduleDir}/${dataId}.${ext}`;

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sample data (${res.status})`);
        return res.text();
      })
      .then(setDataContent)
      .catch(() => setDataContent('Error loading sample data.'));
  }, [dataContent, selectedDataIndex, sandboxConfig.sampleData, product, moduleId]);

  // Reset data content when switching datasets
  useEffect(() => {
    setDataContent(null);
  }, [selectedDataIndex]);

  // -------------------------------------------------------------------------
  // Auto-scroll chat
  // -------------------------------------------------------------------------

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // -------------------------------------------------------------------------
  // Auto-resize textarea
  // -------------------------------------------------------------------------

  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = 20;
    const maxHeight = lineHeight * 12; // expand up to 12 lines to show full prompt
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // -------------------------------------------------------------------------
  // PII check on input
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (input.trim().length === 0) {
      setPiiWarning(null);
      return;
    }
    const result = scanForPII(input);
    setPiiWarning(result.safe ? null : result.reason ?? 'PII detected. Remove personal data.');
  }, [input]);

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    // PII guard
    const piiResult = scanForPII(trimmed);
    if (!piiResult.safe) {
      setPiiWarning(piiResult.reason ?? 'PII detected. Remove personal data.');
      return;
    }

    // Message limit guard
    if (messageCount >= MAX_MESSAGES) {
      setError('Message limit reached. Download your conversation and reset to continue.');
      return;
    }

    setError(null);
    const userMessage: SandboxMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    setStreaming(true);

    try {
      const response = await fetch('/api/sandbox/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'claude',
          messages: updatedMessages,
          moduleId,
          product,
          systemPrompt: dataContent
            ? `${sandboxConfig.systemPrompt}\n\n---\n\nThe following sample data has been pre-loaded for this exercise. The learner can reference it directly without pasting it. Treat it as already provided.\n\n### ${selectedData.label}\n\n${dataContent}`
            : sandboxConfig.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add placeholder assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }

      setMessageCount((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      // Remove the empty assistant placeholder if present
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  }

  // -------------------------------------------------------------------------
  // Download conversation
  // -------------------------------------------------------------------------

  function downloadConversation() {
    if (messages.length === 0) return;

    const lines = messages.map((msg) => {
      const prefix = msg.role === 'user' ? '## You' : '## Assistant (Claude)';
      return `${prefix}\n\n${msg.content}\n`;
    });

    const content = `# AI Practice Sandbox Conversation\n\nModule: ${moduleId}\nProduct: ${product}\nDate: ${new Date().toISOString()}\n\n---\n\n${lines.join('\n---\n\n')}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sandbox-${moduleId}-${Date.now()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // -------------------------------------------------------------------------
  // Reset chat
  // -------------------------------------------------------------------------

  function resetChat() {
    if (messages.length === 0) return;
    const confirmed = window.confirm('Reset the conversation? This cannot be undone.');
    if (!confirmed) return;

    setMessages([]);
    setMessageCount(0);
    setError(null);
    setInput('');
    setPiiWarning(null);
  }

  // -------------------------------------------------------------------------
  // Handle suggested prompt click
  // -------------------------------------------------------------------------

  function handlePromptClick(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  // -------------------------------------------------------------------------
  // Handle key down
  // -------------------------------------------------------------------------

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="w-full rounded-[3px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3
            className="font-serif-sc text-lg"
            style={{ color: accentColor }}
          >
            AI Practice Sandbox
          </h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[1.2px] text-[color:var(--color-slate)]">
            {moduleId.replace(/-/g, ' ')}
          </p>
        </div>
        <div
          className="font-mono text-sm tabular-nums"
          style={{ color: remainingMessages < 5 ? 'var(--color-error)' : 'var(--color-slate)' }}
          aria-label={`${messageCount} of ${MAX_MESSAGES} messages used`}
        >
          {messageCount}/{MAX_MESSAGES}
        </div>
      </div>

      {/* Provider tabs */}
      <div className="mb-4 flex gap-1 border-b border-[color:var(--color-ink)]/10">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            disabled={!provider.enabled}
            title={provider.enabled ? undefined : 'Coming soon'}
            aria-label={provider.enabled ? `${provider.label} provider` : `${provider.label} - coming soon`}
            className={`px-3 py-2 font-mono text-[11px] uppercase tracking-[1.2px] transition-colors focus:outline-none focus:ring-1 ${
              provider.enabled
                ? 'border-b-2 font-semibold'
                : 'cursor-not-allowed text-[color:var(--color-slate)]/50'
            }`}
            style={
              provider.enabled
                ? {
                    borderBottomColor: accentColor,
                    color: accentColor,
                  }
                : undefined
            }
          >
            {provider.label}
          </button>
        ))}
      </div>

      {/* Sample data section */}
      <div className="mb-4 rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-semibold text-[color:var(--color-ink)]">
              {selectedData.label}
            </p>
            <p className="mt-0.5 font-sans text-xs text-[color:var(--color-slate)]">
              {selectedData.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sandboxConfig.sampleData.length > 1 && (
              <select
                value={selectedDataIndex}
                onChange={(e) => setSelectedDataIndex(Number(e.target.value))}
                className="rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-2 py-1 font-mono text-[11px] text-[color:var(--color-ink)] focus:outline-none focus:ring-1"
                style={{ focusRingColor: accentColor } as React.CSSProperties}
                aria-label="Select sample dataset"
              >
                {sandboxConfig.sampleData.map((data, idx) => (
                  <option key={data.id} value={idx}>
                    {data.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setDataExpanded((prev) => !prev)}
              className="rounded-[2px] border border-[color:var(--color-ink)]/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] transition-colors hover:bg-[color:var(--color-parch)] focus:outline-none focus:ring-1"
              style={{ color: accentColor }}
              aria-label={dataExpanded ? 'Hide sample data' : 'View sample data'}
              aria-expanded={dataExpanded}
            >
              {dataExpanded ? 'Hide data' : 'View data'}
            </button>
          </div>
        </div>

        {dataExpanded && (
          <div className="mt-3">
            {dataContent ? (
              <SampleDataViewer
                content={dataContent}
                type={selectedData.type}
                accentColor={accentColor}
                onSendToChat={(text) => {
                  setInput((prev) => prev ? `${prev}\n\n${text}` : text);
                  textareaRef.current?.focus();
                }}
              />
            ) : (
              <p className="font-mono text-xs text-[color:var(--color-slate)] p-3">Loading...</p>
            )}
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="mb-4">
          <p className="mb-2 font-serif-sc text-[11px] uppercase tracking-[1.2px] text-[color:var(--color-slate)]">
            Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {sandboxConfig.suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-parch)] px-3 py-2 text-left font-sans text-sm text-[color:var(--color-ink)] transition-colors hover:border-current focus:outline-none focus:ring-1"
                style={
                  {
                    '--tw-ring-color': accentColor,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  (e.currentTarget.style.borderColor = accentColor);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '';
                }}
                aria-label={`Use prompt: ${prompt.slice(0, 60)}...`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div
        className="mb-4 min-h-[200px] max-h-[400px] overflow-y-auto rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] p-4"
        role="log"
        aria-label="Conversation history"
        aria-live="polite"
      >
        {messages.length === 0 && !streaming ? (
          <p className="py-8 text-center font-sans text-sm italic text-[color:var(--color-slate)]">
            Select a suggested prompt or type your own message to begin.
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[2px] px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-[color:var(--color-parch)]'
                      : 'bg-[color:var(--color-linen)] border border-[color:var(--color-ink)]/5'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <span className="mb-1 block font-mono text-[9px] uppercase tracking-[1.2px] text-[color:var(--color-slate)]">
                      Claude
                    </span>
                  )}
                  <div className="text-sm font-sans text-[color:var(--color-ink)]">
                    {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                  </div>
                </div>
              </div>
            ))}
            {streaming && messages.length > 0 && messages[messages.length - 1].content === '' && (
              <div className="flex justify-start">
                <span className="font-sans text-sm text-[color:var(--color-slate)]">
                  Thinking...
                </span>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <p className="mb-3 font-sans text-sm text-[color:var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      {/* Input area */}
      <div className="mb-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
            placeholder={streaming ? 'Thinking...' : 'Type your message...'}
            rows={1}
            className="flex-1 resize-none rounded-[2px] border border-[color:var(--color-ink)]/10 bg-[color:var(--color-linen)] px-4 py-2.5 font-sans text-sm text-[color:var(--color-ink)] placeholder:text-[color:var(--color-slate)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
            style={
              {
                '--tw-ring-color': accentColor,
              } as React.CSSProperties
            }
            aria-label="Message input"
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim() || piiWarning !== null}
            className="rounded-[2px] px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: accentColor,
              ['--tw-ring-color' as string]: accentColor,
            }}
            aria-label="Send message"
          >
            Send
          </button>
        </div>

        {/* PII warning */}
        {piiWarning && (
          <p className="mt-2 font-sans text-xs text-[color:var(--color-error)]" role="alert">
            {piiWarning}
          </p>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 border-t border-[color:var(--color-ink)]/10 pt-4">
        <button
          onClick={downloadConversation}
          disabled={messages.length === 0}
          className="rounded-[2px] border border-[color:var(--color-ink)]/10 px-3 py-1.5 font-serif-sc text-[11px] uppercase tracking-[1.2px] text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-linen)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ ['--tw-ring-color' as string]: accentColor }}
          aria-label="Download conversation as markdown"
        >
          Download Conversation
        </button>
        <button
          onClick={resetChat}
          disabled={messages.length === 0}
          className="rounded-[2px] border border-[color:var(--color-ink)]/10 px-3 py-1.5 font-serif-sc text-[11px] uppercase tracking-[1.2px] text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-linen)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ ['--tw-ring-color' as string]: accentColor }}
          aria-label="Reset conversation"
        >
          Reset Chat
        </button>
      </div>
    </div>
  );
}
