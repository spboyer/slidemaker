"use client";

import { useEffect, useCallback } from "react";

interface SlideNavProps {
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddSlide?: () => void;
  onAddBlank?: () => void;
  onSpeakerNotes?: () => void;
  onFullscreen?: () => void;
  onOverview?: () => void;
  onPdfExport?: () => void;
}

export default function SlideNav({
  currentIndex,
  totalSlides,
  onPrevious,
  onNext,
  onAddSlide,
  onAddBlank,
  onSpeakerNotes,
  onFullscreen,
  onOverview,
  onPdfExport,
}: SlideNavProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Let reveal.js handle keyboard when its container is focused
      const revealEl = document.querySelector(".reveal");
      if (revealEl?.contains(e.target as Node)) return;
      if (e.key === "ArrowLeft" && !isFirst) onPrevious();
      if (e.key === "ArrowRight" && !isLast) onNext();
    },
    [isFirst, isLast, onPrevious, onNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const btnBase =
    "rounded bg-white/10 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20";

  return (
    <nav className="flex w-full items-center justify-between bg-black/60 px-3 py-1.5 backdrop-blur-sm">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Previous slide"
        title="Previous slide (←)"
        className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ←
      </button>

      <div className="flex items-center gap-1.5">
        {onSpeakerNotes && (
          <button
            onClick={onSpeakerNotes}
            className={btnBase}
            title="Speaker notes (S)"
            aria-label="Speaker notes"
          >
            🗒
          </button>
        )}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            className={btnBase}
            title="Toggle fullscreen (F)"
            aria-label="Toggle fullscreen"
          >
            ⛶
          </button>
        )}
        {onOverview && (
          <button
            onClick={onOverview}
            className={btnBase}
            title="Slide overview (O)"
            aria-label="Slide overview"
          >
            ▦
          </button>
        )}
        {onPdfExport && (
          <button
            onClick={onPdfExport}
            className={btnBase}
            title="Export to PDF (print-pdf)"
            aria-label="Export to PDF"
          >
            📄
          </button>
        )}
        <span className="px-1 text-xs font-medium text-white/80">
          {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {onAddSlide && (
          <button
            onClick={onAddSlide}
            title="Add AI-generated slide"
            className="rounded bg-indigo-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
          >
            + AI
          </button>
        )}
        {onAddBlank && (
          <button
            onClick={onAddBlank}
            title="Add blank slide"
            className="rounded bg-white/10 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            + Blank
          </button>
        )}
        <button
          onClick={onNext}
          disabled={isLast}
          aria-label="Next slide"
          title="Next slide (→)"
          className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          →
        </button>
      </div>
    </nav>
  );
}
