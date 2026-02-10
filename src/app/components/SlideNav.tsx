"use client";

import { useEffect, useCallback } from "react";

interface SlideNavProps {
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function SlideNav({
  currentIndex,
  totalSlides,
  onPrevious,
  onNext,
}: SlideNavProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSlides - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && !isFirst) onPrevious();
      if (e.key === "ArrowRight" && !isLast) onNext();
    },
    [isFirst, isLast, onPrevious, onNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav className="flex w-full items-center justify-between bg-black/60 px-6 py-4 backdrop-blur-sm">
      <button
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Previous slide"
        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      <span className="text-sm font-medium text-white/80">
        {currentIndex + 1} / {totalSlides}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        aria-label="Next slide"
        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </nav>
  );
}
