"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Slide } from "@/lib/types";

interface SlideSearchProps {
  slides: Slide[];
  onSelect: (index: number) => void;
  onClose: () => void;
}

/** Strip HTML tags for plain-text search */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function SlideSearch({ slides, onSelect, onClose }: SlideSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build search index
  const results = slides
    .map((slide, index) => {
      const titleText = (slide.title ?? "").toLowerCase();
      const contentText = stripHtml(slide.content).toLowerCase();
      const q = query.toLowerCase();
      if (!q) return { index, slide, match: true };
      const match = titleText.includes(q) || contentText.includes(q);
      return { index, slide, match };
    })
    .filter((r) => r.match);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex].index);
          onClose();
        }
      }
    },
    [results, selectedIndex, onSelect, onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-white/10 px-4 py-3">
          <span className="mr-3 text-sm text-white/40">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search slides…"
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <kbd className="ml-2 rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/30">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-white/30">
              No matching slides
            </div>
          ) : (
            results.map((result, i) => (
              <button
                key={result.index}
                onClick={() => {
                  onSelect(result.index);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex
                    ? "bg-indigo-600/30 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white/50">
                  {result.index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {result.slide.title || stripHtml(result.slide.content).slice(0, 60) || "Untitled"}
                  </div>
                  {result.slide.title && (
                    <div className="truncate text-xs text-white/40">
                      {stripHtml(result.slide.content).slice(0, 80)}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-2 text-[10px] text-white/25">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
