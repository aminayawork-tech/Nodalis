"use client";

import { useEffect, useRef, useState } from "react";
import { askAboutStory } from "@/lib/actions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 340;
const DEFAULT_WIDTH = 352; // 22rem
const DEFAULT_HEIGHT = 448; // 28rem
const VIEWPORT_MARGIN_X = 48; // keep clear of the left/right edges
const VIEWPORT_MARGIN_Y = 140; // keep clear of the toggle button + header

function maxWidth() {
  return typeof window === "undefined"
    ? DEFAULT_WIDTH
    : window.innerWidth - VIEWPORT_MARGIN_X;
}

function maxHeight() {
  return typeof window === "undefined"
    ? DEFAULT_HEIGHT
    : window.innerHeight - VIEWPORT_MARGIN_Y;
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

function MaximizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M8 8V4h12v12h-4M4 20h12V8H4v12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
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
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [maximized, setMaximized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const prevSizeRef = useRef(size);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Keep a maximized panel filling the same relative space if the window
  // itself is resized while it's open.
  useEffect(() => {
    if (!maximized) return;
    function onResize() {
      setSize({ width: maxWidth(), height: maxHeight() });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maximized]);

  function toggleMaximize() {
    if (maximized) {
      setSize(prevSizeRef.current);
      setMaximized(false);
    } else {
      prevSizeRef.current = size;
      setSize({ width: maxWidth(), height: maxHeight() });
      setMaximized(true);
    }
  }

  function onResizePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (maximized) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
    };
  }

  function onResizePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    // Panel is anchored to the bottom-right corner, so dragging the
    // top-left handle left/up should grow it.
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setSize({
      width: Math.min(maxWidth(), Math.max(MIN_WIDTH, dragRef.current.startWidth - dx)),
      height: Math.min(maxHeight(), Math.max(MIN_HEIGHT, dragRef.current.startHeight - dy)),
    });
  }

  function onResizePointerUp() {
    dragRef.current = null;
  }

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
        <div
          style={{ width: size.width, height: size.height }}
          className="fixed bottom-20 right-6 z-20 flex max-w-[calc(100vw-1.5rem)] flex-col rounded-xl border border-border bg-card shadow-lg"
        >
          {!maximized && (
            <div
              onPointerDown={onResizePointerDown}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
              title="Drag to resize"
              className="absolute left-0 top-0 z-10 h-5 w-5 cursor-nwse-resize touch-none rounded-tl-xl"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                className="absolute left-1 top-1 h-2.5 w-2.5 text-ink-muted"
                aria-hidden="true"
              >
                <path
                  d="M14 2 2 14M14 8 8 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-ink-muted">Ask about</div>
              <div className="truncate text-sm text-ink">{headline}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={toggleMaximize}
                className="text-ink-muted hover:text-ink"
                aria-label={maximized ? "Restore chat size" : "Maximize chat"}
              >
                {maximized ? <RestoreIcon /> : <MaximizeIcon />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-muted hover:text-ink"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
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
