"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { actionSendMessage } from "@/app/actions/conversation";
import type { ConversationMessage } from "@/lib/conversation/types";
import type { FileUpdate } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message extends ConversationMessage {
  fileUpdates?: FileUpdate[];
}

// ── Suggestion prompts ────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: "🔥", label: "Improve homepage conversion", desc: "Rewrite hero copy to convert better" },
  { icon: "💰", label: "Make this more profitable",   desc: "Identify revenue optimization opportunities" },
  { icon: "🎯", label: "Create a premium version",    desc: "Add high-ticket tier with new deliverables" },
  { icon: "🚀", label: "Write a launch plan",         desc: "Day-by-day launch sequence" },
  { icon: "👥", label: "Target a different audience", desc: "Reposition for a new customer segment" },
  { icon: "📣", label: "Generate social hooks",       desc: "10 viral hooks for this product" },
];

// ── AI avatar ─────────────────────────────────────────────────────────────────

function AIAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="shrink-0 rounded-lg flex items-center justify-center"
      style={{
        width: size, height: size,
        backgroundColor: "hsl(213 94% 62% / 0.12)",
        border: "1px solid hsl(213 94% 62% / 0.22)",
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 14 14" fill="none">
        <path d="M7 1L12.196 4V10L7 13L1.804 10V4L7 1Z" fill="hsl(213 94% 62%)" />
      </svg>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-lg px-4 py-2.5 rounded-2xl rounded-tr-md text-sm leading-relaxed"
          style={{
            backgroundColor: "hsl(213 94% 58% / 0.14)",
            border: "1px solid hsl(213 94% 62% / 0.22)",
            color: "hsl(213 94% 82%)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <AIAvatar size={28} />
      <div className="flex-1 min-w-0 space-y-2">
        <div
          className="px-4 py-3 rounded-2xl rounded-tl-md"
          style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 18%)" }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(220 9% 76%)" }}>
            {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
          </p>
        </div>
        {msg.fileUpdates && msg.fileUpdates.length > 0 && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              backgroundColor: "hsl(151 60% 48% / 0.07)",
              border: "1px solid hsl(151 60% 48% / 0.18)",
            }}
          >
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20" style={{ color: "hsl(151 60% 55%)", flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium" style={{ color: "hsl(151 60% 58%)" }}>
              Updated {msg.fileUpdates.length} file{msg.fileUpdates.length !== 1 ? "s" : ""}
              {" "}— {msg.fileUpdates.map((f) => f.path.split("/").pop()).join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <AIAvatar size={28} />
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-md"
        style={{ backgroundColor: "hsl(220 13% 12%)", border: "1px solid hsl(220 13% 18%)" }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{
                backgroundColor: "hsl(213 94% 62% / 0.55)",
                animationDelay: `${i * 0.12}s`,
                animationDuration: "0.9s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Welcome state ─────────────────────────────────────────────────────────────

function WelcomeState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
      <AIAvatar size={48} />
      <h2 className="text-lg font-semibold mt-4 mb-1" style={{ color: "hsl(220 9% 88%)" }}>
        AI Business Advisor
      </h2>
      <p className="text-sm mb-8 max-w-md" style={{ color: "hsl(220 9% 44%)" }}>
        Ask me to refine, improve, or rebuild any part of this project. I can rewrite copy, redesign the product, and update your files directly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestion(s.label)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group"
            style={{
              backgroundColor: "hsl(220 13% 10%)",
              border: "1px solid hsl(220 13% 16%)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(213 94% 62% / 0.3)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 12%)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(220 13% 16%)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(220 13% 10%)";
            }}
          >
            <span className="text-xl shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "hsl(220 9% 78%)" }}>{s.label}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(220 9% 38%)" }}>{s.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main chat tab ─────────────────────────────────────────────────────────────

export function ChatTab({ workspaceId }: { workspaceId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || loading) return;

      setInput("");
      const userMsg: Message = {
        id: `u_${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const result = await actionSendMessage(workspaceId, content);

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: result.success ? result.response : `Error: ${result.error}`,
        createdAt: new Date().toISOString(),
        fileUpdates: result.success ? result.fileUpdates : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);

      if (result.success && result.fileUpdates.length > 0) {
        router.refresh();
      }
    },
    [workspaceId, loading, router],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        {messages.length === 0 && !loading ? (
          <WelcomeState onSuggestion={sendMessage} />
        ) : (
          <div className="px-4 py-6 space-y-5 max-w-3xl mx-auto">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-4"
        style={{ borderTop: "1px solid hsl(220 13% 13%)", paddingTop: 12 }}
      >
        <div
          className="flex items-end gap-3 rounded-xl px-4 py-3 max-w-3xl mx-auto"
          style={{
            backgroundColor: "hsl(220 13% 10%)",
            border: "1px solid hsl(220 13% 18%)",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — rewrite copy, improve the product, generate content..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed"
            style={{
              color: "hsl(220 9% 82%)",
              caretColor: "hsl(213 94% 62%)",
              minHeight: 24,
              maxHeight: 160,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              backgroundColor: input.trim() && !loading ? "hsl(213 94% 58%)" : "hsl(220 13% 18%)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            <svg
              width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke={input.trim() && !loading ? "hsl(220 13% 8%)" : "hsl(220 9% 35%)"}
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: "hsl(220 9% 28%)" }}>
          Shift + Enter for new line · AI can edit your project files directly
        </p>
      </div>
    </div>
  );
}
