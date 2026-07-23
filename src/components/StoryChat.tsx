"use client";

import { useEffect, useRef, useState } from "react";
import { askAboutStory } from "@/lib/actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StoryChat({ storyId, headline }: { storyId: string; headline: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;

    const priorHistory = messages;
    setMessages((cur) => [...cur, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await askAboutStory(storyId, priorHistory, question);
      setMessages((cur) => [...cur, { role: "assistant", content: answer }]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "Something went wrong answering that — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 z-20 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-ink-muted">Ask about</div>
              <div className="truncate text-sm text-ink">{headline}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-ink-muted hover:text-ink"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-ink-muted">
                Ask a follow-up — anything about what happened, who&apos;s involved, or what
                it connects to.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-accent text-paper"
                      : "border border-border bg-paper text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink-muted">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up…"
              disabled={loading}
              className="flex-1 rounded-lg border border-border bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-accent px-3 py-2 text-sm text-paper disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-paper shadow-lg transition-transform hover:scale-105"
        aria-label={open ? "Close chat" : "Ask a follow-up"}
      >
        {open ? "✕" : <ChatIcon />}
      </button>
    </>
  );
}
