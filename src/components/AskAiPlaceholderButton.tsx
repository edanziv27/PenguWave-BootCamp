import { useEffect, useRef, useState } from "react";

const DEFAULT_SUGGESTIONS = [
  "Summarize critical events",
  "Which assets need attention?",
  "Find suspicious patterns",
  "Explain data quality issues",
  "What should I investigate first?",
];

const DEMO_REPLY =
  "AI assistant is not connected to a backend yet. This is a demo chat interface for future investigation workflows.";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface AskAiPlaceholderButtonProps {
  /** Optional text label; omit for a subtle icon-only action. */
  label?: string;
  /** Helper line under the assistant header. */
  context?: string;
  /** Stretch the trigger to full width (e.g. inside the event panel). */
  block?: boolean;
  /** Context-specific suggested questions (defaults to dashboard-wide ones). */
  suggestions?: string[];
}

/**
 * Compact, chat-style AI assistant shell. Frontend-only: it never calls an API,
 * sends a prompt, or generates real analysis — every message returns a clearly
 * labeled demo reply.
 */
export default function AskAiPlaceholderButton({
  label,
  context,
  block = false,
  suggestions = DEFAULT_SUGGESTIONS,
}: AskAiPlaceholderButtonProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "assistant", text: DEMO_REPLY },
    ]);
    setDraft("");
  };

  const triggerClass = [
    "ask-ai-action",
    label ? "ask-ai-action-labeled" : "ask-ai-action-icon",
    block ? "ask-ai-action-block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={`ask-ai-wrap${block ? " ask-ai-wrap-block" : ""}`}>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Ask AI"
      >
        <span aria-hidden="true">✨</span>
        {label && <span>{label}</span>}
      </button>

      {open && (
        <>
          <div className="ask-ai-backdrop" onClick={() => setOpen(false)} />
          <div className="ask-ai-chat" role="dialog" aria-label="Ask AI assistant">
            <div className="ask-ai-chat-head">
              <div className="ask-ai-chat-title">
                <span className="ask-ai-dot" aria-hidden="true">
                  ✨
                </span>
                Ask AI
              </div>
              <button
                className="ask-ai-chat-close"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>

            <p className="ask-ai-chat-helper">
              {context ?? "I can help investigate security events — triage, patterns, and next steps."}
            </p>

            <div className="ask-ai-messages" ref={messagesRef}>
              {messages.length === 0 ? (
                <p className="ask-ai-empty">Pick a question below or type your own to get started.</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`ask-ai-msg ask-ai-msg-${m.role}`}>
                    {m.text}
                  </div>
                ))
              )}
            </div>

            <div className="ask-ai-suggestions">
              {suggestions.map((s) => (
                <button key={s} type="button" className="ask-ai-suggestion" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>

            <form
              className="ask-ai-compose"
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your events…"
                aria-label="Message the AI assistant"
              />
              <button type="submit" className="ask-ai-send" aria-label="Send message">
                ➤
              </button>
            </form>
          </div>
        </>
      )}
    </span>
  );
}
