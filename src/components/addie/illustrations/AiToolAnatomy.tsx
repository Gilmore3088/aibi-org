// AiToolAnatomy — annotated SVG illustration of a generic chat UI.
//
// Recovery plan finding #9 (Branch Mgr Devon, 2026-05-24): "M0.1 talks
// course shape, M0.2 talks data discipline, M1.1 jumps to token
// prediction — a learner who has never opened Claude/ChatGPT reaches
// M2.3 still not knowing what the input box looks like."
//
// The component renders a stylized, generic chat interface (no vendor
// logo, no screenshot — those date immediately and create licensing
// questions) with four labelled regions: conversation history, output
// area, input box, send affordance. Gives the never-touched-an-AI-tool
// learner an anchor for "what does this thing look like" before the
// course starts talking about prompts and outputs.
//
// Server-renderable (no client JS). All colors via Ledger tokens — gold
// callouts for the four labels, ink rules for the panel structure, no
// brand mark. Single shadow tier per CLAUDE.md "Radii + Shadow" rules.

interface AiToolAnatomyProps {
  /** Optional title shown above the illustration. Defaults to standard course copy. */
  readonly title?: string;
  /** Optional caption shown below. */
  readonly caption?: string;
}

export function AiToolAnatomy({
  title = 'An AI chat tool looks like this.',
  caption = 'Four parts. The history of your conversation, the answer that just came back, the box where you type, and the button that sends.',
}: AiToolAnatomyProps) {
  return (
    <figure className="my-8 max-w-[64ch] mx-auto">
      <figcaption className="font-serif text-[1.25rem] leading-tight text-[var(--ledger-ink)] mb-4">
        {title}
      </figcaption>

      <div className="relative border border-[var(--ledger-rule-strong)] rounded-[3px] bg-[var(--ledger-paper)] p-4 sm:p-6">
        <svg
          viewBox="0 0 720 440"
          className="w-full h-auto"
          role="img"
          aria-labelledby="ai-tool-anatomy-title ai-tool-anatomy-desc"
        >
          <title id="ai-tool-anatomy-title">Anatomy of a generic AI chat tool</title>
          <desc id="ai-tool-anatomy-desc">
            A stylized chat interface with four labelled regions: a conversation
            history sidebar on the left, an output area showing a recent answer
            in the middle, an input text box at the bottom, and a send button
            to the right of the input.
          </desc>

          {/* Outer chat frame */}
          <rect x="0.5" y="0.5" width="719" height="439" rx="3" fill="var(--ledger-bg)" stroke="var(--ledger-rule)" />

          {/* Conversation history sidebar */}
          <rect x="16" y="16" width="160" height="408" rx="2" fill="var(--ledger-parch)" stroke="var(--ledger-rule)" />
          <text x="32" y="40" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2" fill="var(--ledger-muted)">
            HISTORY
          </text>
          {/* History item rows */}
          {[60, 88, 116, 144, 172, 200].map((y, i) => (
            <g key={y}>
              <rect
                x="32"
                y={y}
                width="128"
                height="18"
                rx="1"
                fill={i === 0 ? 'var(--ledger-tape)' : 'transparent'}
                stroke={i === 0 ? 'var(--ledger-accent)' : 'none'}
              />
              <line x1="40" y1={y + 10} x2="148" y2={y + 10} stroke="var(--ledger-rule-strong)" strokeWidth="1" />
              <line x1="40" y1={y + 14} x2="116" y2={y + 14} stroke="var(--ledger-rule)" strokeWidth="1" />
            </g>
          ))}

          {/* Output area */}
          <rect x="192" y="16" width="512" height="324" rx="2" fill="var(--ledger-paper)" stroke="var(--ledger-rule)" />
          <text x="208" y="40" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2" fill="var(--ledger-muted)">
            CONVERSATION
          </text>
          {/* User turn bubble */}
          <rect x="416" y="60" width="272" height="36" rx="2" fill="var(--ledger-parch)" />
          <line x1="432" y1="74" x2="672" y2="74" stroke="var(--ledger-ink-2)" strokeWidth="1" />
          <line x1="432" y1="82" x2="600" y2="82" stroke="var(--ledger-ink-2)" strokeWidth="1" />
          {/* AI response — lines */}
          <text x="208" y="124" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2" fill="var(--ledger-muted)">
            ASSISTANT
          </text>
          {[140, 156, 172, 188, 204, 220, 236, 252, 268, 284].map((y, i) => (
            <line
              key={y}
              x1="208"
              y1={y}
              x2={i % 3 === 2 ? 540 : 688}
              y2={y}
              stroke="var(--ledger-ink)"
              strokeWidth="1.5"
            />
          ))}

          {/* Input box */}
          <rect x="192" y="356" width="416" height="68" rx="2" fill="var(--ledger-bg)" stroke="var(--ledger-accent)" strokeWidth="1.5" />
          <text x="208" y="378" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="2" fill="var(--ledger-muted)">
            INPUT
          </text>
          {/* Placeholder lines suggesting cursor */}
          <line x1="208" y1="398" x2="220" y2="398" stroke="var(--ledger-ink)" strokeWidth="2" />
          <line x1="208" y1="412" x2="380" y2="412" stroke="var(--ledger-rule-strong)" strokeWidth="1" />

          {/* Send button */}
          <rect x="624" y="356" width="80" height="68" rx="2" fill="var(--ledger-ink)" />
          <text
            x="664"
            y="395"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="10"
            letterSpacing="2"
            fill="var(--ledger-paper)"
          >
            SEND
          </text>
          <text
            x="664"
            y="410"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="14"
            fill="var(--ledger-paper)"
          >
            →
          </text>

          {/* Annotation: HISTORY — leader line + label */}
          <g>
            <line x1="96" y1="232" x2="96" y2="280" stroke="var(--ledger-accent)" strokeWidth="1" />
            <circle cx="96" cy="232" r="3" fill="var(--ledger-accent)" />
            <text x="96" y="296" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="1.8" fill="var(--ledger-accent)">
              HISTORY
            </text>
            <text x="96" y="312" textAnchor="middle" fontFamily="ui-sans-serif, sans-serif" fontSize="10" fill="var(--ledger-ink-2)">
              past conversations
            </text>
          </g>

          {/* Annotation: ANSWER */}
          <g>
            <line x1="448" y1="212" x2="448" y2="232" stroke="var(--ledger-accent)" strokeWidth="1" />
            <circle cx="448" cy="212" r="3" fill="var(--ledger-accent)" />
            <text x="448" y="248" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" letterSpacing="1.8" fill="var(--ledger-accent)">
              ANSWER
            </text>
            <text x="448" y="264" textAnchor="middle" fontFamily="ui-sans-serif, sans-serif" fontSize="10" fill="var(--ledger-ink-2)">
              what just came back
            </text>
          </g>

          {/* Annotation: INPUT — leader from input box down-right */}
          {/* (placed in chrome below) */}
        </svg>

        {/* Caption labels for the bottom row laid out below the SVG so they
            don't collide with the input/send blocks visually. */}
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)]">
              Input
            </div>
            <div className="font-sans text-[0.875rem] text-[var(--ledger-ink-2)] mt-0.5">
              where you type your question
            </div>
          </div>
          <div>
            <div className="font-mono uppercase tracking-[0.18em] text-[0.6rem] text-[var(--ledger-accent)]">
              Send
            </div>
            <div className="font-sans text-[0.875rem] text-[var(--ledger-ink-2)] mt-0.5">
              the button or Enter key
            </div>
          </div>
        </div>
      </div>

      {caption && (
        <p className="mt-4 font-serif text-[1rem] leading-[1.55] text-[var(--ledger-ink-2)]">
          {caption}
        </p>
      )}
    </figure>
  );
}
