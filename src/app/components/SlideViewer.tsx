"use client";

import Markdown from "react-markdown";
import { Slide } from "@/lib/types";

const gradients = [
  "from-slate-900 to-slate-800",
  "from-indigo-900 to-slate-900",
  "from-purple-900 to-slate-900",
  "from-blue-900 to-slate-900",
  "from-teal-900 to-slate-900",
  "from-emerald-900 to-slate-900",
  "from-cyan-900 to-slate-900",
  "from-rose-900 to-slate-900",
];

interface SlideViewerProps {
  slide: Slide;
  index: number;
}

export default function SlideViewer({ slide, index }: SlideViewerProps) {
  const gradient = gradients[index % gradients.length];

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${gradient} px-8 py-12 text-white md:px-16 lg:px-32`}
    >
      <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8">
        <h1 className="text-center text-4xl font-bold drop-shadow-lg md:text-5xl lg:text-6xl">
          {slide.title}
        </h1>
        <div className="prose prose-invert prose-xl max-w-none text-center text-xl leading-relaxed drop-shadow-md">
          <Markdown>{slide.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
