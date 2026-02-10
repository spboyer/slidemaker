"use client";

import { useState } from "react";
import { Slide } from "@/lib/types";
import SlideViewer from "@/app/components/SlideViewer";
import SlideNav from "@/app/components/SlideNav";

const sampleSlides: Slide[] = [
  {
    title: "Welcome to SlideMaker",
    content:
      "An **AI-powered** presentation builder.\n\nCreate beautiful slide decks in seconds with the power of OpenAI.",
  },
  {
    title: "How It Works",
    content:
      "1. Describe your topic\n2. AI generates your slides\n3. Review and edit\n4. Present!",
  },
  {
    title: "Key Features",
    content:
      "- **Markdown support** for rich formatting\n- **Dark theme** for beautiful presentations\n- **Keyboard navigation** with arrow keys\n- **Responsive** design for any screen",
  },
  {
    title: "Get Started",
    content:
      "Type a topic in the chat sidebar and let the AI do the rest.\n\n> The future of presentations is here.",
  },
];

export default function PresentationPage() {
  const [slides] = useState<Slide[]>(sampleSlides);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (slides.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <p className="text-xl text-white/60">No slides to display</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentSlideIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((i) => Math.min(slides.length - 1, i + 1));
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-900">
      <div className="flex-1 overflow-hidden">
        <SlideViewer slide={slides[currentSlideIndex]} index={currentSlideIndex} />
      </div>
      <SlideNav
        currentIndex={currentSlideIndex}
        totalSlides={slides.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
