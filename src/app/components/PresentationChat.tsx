"use client";

import { useState, useRef, useEffect } from "react";
import { Slide } from "@/lib/types";
import { REVEAL_THEMES, isValidTheme } from "@/lib/reveal-themes";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedTheme?: string;
}

interface PresentationChatProps {
  existingSlides: Slide[];
  onSlidesGenerated: (slides: Slide[]) => void;
  presentationTitle?: string;
  onThemeChange?: (themeId: string) => void;
}

/** Detect "change theme to X" style commands */
function detectThemeCommand(text: string): string | null {
  const match = text.match(
    /(?:change|set|switch|use)\s+(?:the\s+)?theme\s+(?:to\s+)?["']?(\w+)["']?/i
  );
  if (match) {
    const requested = match[1].toLowerCase();
    if (isValidTheme(requested)) return requested;
    // Try fuzzy match on theme names
    const theme = REVEAL_THEMES.find(
      (t) => t.name.toLowerCase() === requested || t.id === requested
    );
    return theme?.id ?? null;
  }
  return null;
}

/** Detect code example requests */
function detectCodeRequest(text: string): boolean {
  return /add\s+(?:a\s+)?code\s+example/i.test(text);
}

/** Infer a style param from user text */
function inferStyle(text: string): string | undefined {
  if (detectCodeRequest(text)) return "technical";
  if (/technical|code|programming|developer/i.test(text)) return "technical";
  if (/business|corporate|executive/i.test(text)) return "professional";
  if (/creative|design|artistic/i.test(text)) return "creative";
  return undefined;
}

export default function PresentationChat({
  existingSlides,
  onSlidesGenerated,
  presentationTitle,
  onThemeChange,
}: PresentationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    // Check for theme change command
    const themeId = detectThemeCommand(text);
    if (themeId && onThemeChange) {
      onThemeChange(themeId);
      const themeName = REVEAL_THEMES.find((t) => t.id === themeId)?.name ?? themeId;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Theme changed to "${themeName}".` },
      ]);
      setLoading(false);
      return;
    }

    try {
      const style = inferStyle(text);
      const body: Record<string, unknown> = {
        topic: text,
        existingSlides: existingSlides.length > 0 ? existingSlides : undefined,
      };
      if (style) body.style = style;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err.error || "Failed to generate slides"}` },
        ]);
        return;
      }

      const data = await res.json();
      const slides: Slide[] = data.slides;
      onSlidesGenerated(slides);

      // Suggest a theme based on style
      const suggestedTheme = style === "technical" ? "moon" : style === "professional" ? "simple" : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Generated ${slides.length} slide${slides.length !== 1 ? "s" : ""}${presentationTitle ? ` for "${presentationTitle}"` : ""}:\n${slides.map((s, i) => `${i + 1}. ${s.title}`).join("\n")}`,
          suggestedTheme,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyTheme = (themeId: string) => {
    if (onThemeChange) onThemeChange(themeId);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-950 text-white">
      <h3 className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white/80">
        AI Chat
      </h3>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-white/30">
            Describe a topic to generate slides… You can also say &quot;change theme to moon&quot;.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`mb-3 rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "ml-6 bg-indigo-600/30 text-white"
                  : "mr-6 bg-white/5 text-white/80"
              }`}
            >
              {msg.content}
            </div>
            {msg.suggestedTheme && onThemeChange && (
              <div className="mr-6 mb-3 flex items-center gap-2 rounded-lg bg-indigo-900/30 px-3 py-2">
                <span className="text-xs text-white/60">Suggested theme:</span>
                <button
                  onClick={() => handleApplyTheme(msg.suggestedTheme!)}
                  className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Apply &quot;{REVEAL_THEMES.find((t) => t.id === msg.suggestedTheme)?.name ?? msg.suggestedTheme}&quot;
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="mr-6 mb-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/50">
            Generating slides…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Create a presentation about TypeScript"
            disabled={loading}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
