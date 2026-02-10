"use client";

import { useState } from "react";
import { Slide } from "@/lib/types";
import SlideViewer from "./SlideViewer";

interface SlideEditorProps {
  slide: Slide;
  slideIndex: number;
  onSave: (updated: Slide) => void;
  onCancel: () => void;
}

export default function SlideEditor({
  slide,
  slideIndex,
  onSave,
  onCancel,
}: SlideEditorProps) {
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState(slide.content);

  const previewSlide: Slide = { ...slide, title, content };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row">
      {/* Editor panel */}
      <div className="flex w-full flex-col gap-4 overflow-y-auto bg-gray-900 p-6 lg:w-1/2">
        <h2 className="text-lg font-semibold text-white">Edit Slide</h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-white/70">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500"
            placeholder="Slide title"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-white/70">
            Content (Markdown)
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 resize-none rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 font-mono text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500"
            placeholder="Slide content in markdown…"
            rows={10}
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => onSave({ ...slide, title, content })}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="h-full w-full">
          <SlideViewer slide={previewSlide} index={slideIndex} />
        </div>
      </div>
    </div>
  );
}
