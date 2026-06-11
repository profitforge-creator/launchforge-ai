"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { actionSendMessage } from "@/app/actions/conversation";
import type { ConversationMessage } from "@/lib/conversation/types";

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-xs px-3 py-2 rounded-xl rounded-tr-sm text-xs leading-relaxed"
          style={{
            backgroundColor: "hsl(213 94% 62% / 0.12)",
            border: "1px solid hsl(213 94% 62% / 0.2)",
            color: "hsl(213 94% 75%)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.2)" }}
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
          <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
        </svg>
      </div>
      <div
        className="flex-1 rounded-xl rounded-tl-sm px-3 py-2"
        style={{
          backgroundColor: "hsl(220 13% 13%)",
          border: "1px solid hsl(220 13% 18%)",
        }}
      >
        <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(220 9% 75%)" }}>
          {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
        </p>
      </div>
    </div>
  );
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "Make this more profitable",
  "Create a premium version",
  "Generate more assets",
  "Write a landing page",
  "Target a different audience",
];

// ── Main panel ────────────────────────────────────────────────────────────────

export function ConversationPanel({ workspaceId }: { workspaceId: string }) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && expanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, expanded]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;

      setExpanded(true);
      setInput("");

      const userMsg: ConversationMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const result = await actionSendMessage(workspaceId, content);

      const assistantMsg: ConversationMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: result.success ? result.response : result.error,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    },
    [workspaceId, loading],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
    if (e.key === "Escape") setExpanded(false);
  }

  const panelHeight = expanded ? 320 : 52;

  return (
    <div
      className="flex-shrink-0 flex flex-col transition-all duration-200"
      style={{
        height: panelHeight,
        borderTop: "1px solid hsl(220 13% 14%)",
        backgroundColor: "hsl(220 13% 9%)",
      }}
    >
      {/* Messages area — only visible when expanded */}
      {expanded && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style={{ minHeight: 0 }}
        >
          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-center mb-3" style={{ color: "hsl(220 9% 38%)" }}>
                Refine this business with your AI advisor
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-2.5 py-1 rounded-full transition-colors"
                    style={{
                      border: "1px solid hsl(220 13% 20%)",
                      color: "hsl(220 9% 55%)",
                      backgroundColor: "hsl(220 13% 12%)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: "hsl(213 94% 62% / 0.1)", border: "1px solid hsl(213 94% 62% / 0.2)" }}
              >
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
                </svg>
              </div>
              <div
                className="px-3 py-2 rounded-xl rounded-tl-sm"
                style={{ backgroundColor: "hsl(220 13% 13%)", border: "1px solid hsl(220 13% 18%)" }}
              >
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{
                        backgroundColor: "hsl(213 94% 62% / 0.5)",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input bar — always visible */}
      <div
        className="flex items-center gap-2 px-4 shrink-0"
        style={{ height: 52, borderTop: expanded ? "1px solid hsl(220 13% 13%)" : "none" }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 w-7 h-7 rounded flex items-center justify-center transition-colors"
          style={{
            backgroundColor: expanded ? "hsl(220 13% 15%)" : "transparent",
            border: "1px solid hsl(220 13% 18%)",
            color: "hsl(220 9% 45%)",
          }}
          title={expanded ? "Collapse" : "Expand conversation"}
        >
          <svg
            width="10"
            height="10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>

        {/* Label when collapsed */}
        {!expanded && messages.length === 0 && (
          <span className="text-xs shrink-0" style={{ color: "hsl(220 9% 35%)" }}>
            AI Advisor
          </span>
        )}
        {!expanded && messages.length > 0 && (
          <span className="text-xs shrink-0" style={{ color: "hsl(220 9% 45%)" }}>
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        )}

        {/* Input */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value && !expanded) setExpanded(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setExpanded(true)}
          placeholder='Refine this business... ("Make it more profitable", "Target students", ...)'
          rows={1}
          disabled={loading}
          className="flex-1 bg-transparent resize-none outline-none text-xs leading-relaxed"
          style={{
            color: "hsl(220 9% 78%)",
            caretColor: "hsl(213 94% 62%)",
          }}
        />

        {/* Send button */}
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="shrink-0 w-7 h-7 rounded flex items-center justify-center transition-all"
          style={{
            backgroundColor: input.trim() && !loading ? "hsl(213 94% 62%)" : "hsl(220 13% 15%)",
            border: "1px solid transparent",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 24 24"
            stroke={input.trim() && !loading ? "hsl(220 13% 8%)" : "hsl(220 9% 35%)"}
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
