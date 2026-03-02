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

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

/** Deterministic accent color based on slide position */
const ACCENT_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

function getAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

/** Extract a brief label from the slide content (e.g., "Code", "List", "Image") */
function getSlideTypeLabel(slide: Slide): string {
  const c = slide.content;
  if (/<pre[\s>]/i.test(c)) return "Code";
  if (/<table[\s>]/i.test(c)) return "Table";
  if (/<img[\s>]/i.test(c)) return "Image";
  if (/<blockquote[\s>]/i.test(c)) return "Quote";
  if (/<[ou]l[\s>]/i.test(c)) return "List";
  return "Slide";
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
      <h3 className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/50">
        Slides
        <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/70">
          {slides.length}
        </span>
      </h3>
      <div className="flex-1 overflow-y-auto py-1">
        {slides.map((slide, i) => {
          const isSelected = i === currentIndex;
          const typeLabel = getSlideTypeLabel(slide);
          return (
            <div
              key={i}
              className={`group relative mx-2 mb-1 rounded-lg transition-all duration-150 ${
                isSelected
                  ? "bg-indigo-500/15 ring-1 ring-indigo-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              {/* Left accent bar for selected slide */}
              {isSelected && (
                <div className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-indigo-400" />
              )}

              <button
                onClick={() => onSelect(i)}
                className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left"
              >
                {/* Mini thumbnail */}
                <div
                  className={`mt-0.5 flex h-8 w-11 shrink-0 items-center justify-center rounded ${getAccentColor(i)}/15 border border-white/5`}
                >
                  <span className={`text-[10px] font-semibold ${isSelected ? "text-indigo-300" : "text-white/40"}`}>
                    {i + 1}
                  </span>
                </div>

                {/* Title + type label */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium leading-snug ${isSelected ? "text-white" : "text-white/80"}`}>
                    {slide.title}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/30">
                    {typeLabel}
                  </p>
                </div>
              </button>

              {/* Action buttons — visible on hover or when selected */}
              <div
                className={`absolute top-1.5 right-2 flex gap-0.5 transition-opacity duration-150 ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveUp(i); }}
                  disabled={i === 0}
                  className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:pointer-events-none disabled:opacity-20"
                  aria-label="Move up"
                  title="Move up"
                >
                  <ChevronUp />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveDown(i); }}
                  disabled={i === slides.length - 1}
                  className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:pointer-events-none disabled:opacity-20"
                  aria-label="Move down"
                  title="Move down"
                >
                  <ChevronDown />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                  className="rounded p-1 text-white/30 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  aria-label="Delete slide"
                  title="Delete slide"
                >
                  <XIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
