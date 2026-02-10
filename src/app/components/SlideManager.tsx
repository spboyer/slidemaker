"use client";

import { Slide } from "@/lib/types";

interface SlideManagerProps {
  slides: Slide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export default function SlideManager({
  slides,
  currentIndex,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SlideManagerProps) {
  const handleDelete = (index: number) => {
    const slide = slides[index];
    if (!window.confirm(`Delete slide "${slide.title}"?`)) return;
    onDelete(index);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-950 text-white">
      <h3 className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-white/80">
        Slides ({slides.length})
      </h3>
      <div className="flex-1 overflow-y-auto">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 border-b border-white/5 px-3 py-2.5 ${
              i === currentIndex ? "bg-indigo-600/20" : "hover:bg-white/5"
            }`}
          >
            <button
              onClick={() => onSelect(i)}
              className="flex-1 truncate text-left text-sm"
            >
              <span className="mr-2 text-white/40">{i + 1}.</span>
              {slide.title}
            </button>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onMoveUp(i)}
                disabled={i === 0}
                className="rounded p-1 text-xs text-white/50 hover:bg-white/10 disabled:opacity-25"
                aria-label="Move up"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => onMoveDown(i)}
                disabled={i === slides.length - 1}
                className="rounded p-1 text-xs text-white/50 hover:bg-white/10 disabled:opacity-25"
                aria-label="Move down"
                title="Move down"
              >
                ↓
              </button>
              <button
                onClick={() => handleDelete(i)}
                className="rounded p-1 text-xs text-red-400/70 hover:bg-red-500/20"
                aria-label="Delete slide"
                title="Delete slide"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
