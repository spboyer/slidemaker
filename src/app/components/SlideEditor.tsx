"use client";

import { useState } from "react";
import { Slide, SlideTransition, SlideLayout } from "@/lib/types";
import SlideViewer from "./SlideViewer";

const TRANSITIONS: SlideTransition[] = ["none", "fade", "slide", "convex", "concave", "zoom"];
const LAYOUTS: SlideLayout[] = ["default", "center", "two-column"];

interface SlideEditorProps {
  slide: Slide;
  slideIndex: number;
  onSave: (updated: Slide) => void;
  onCancel: () => void;
}

/** Wrap markdown list items with fragment class for reveal.js step-through */
function applyFragments(text: string): string {
  return text.replace(/^(\s*[-*]\s+)/gm, '$1<span class="fragment">') 
    .replace(/^(<span class="fragment">)(.+)$/gm, '$1$2</span>');
}

function removeFragments(text: string): string {
  return text
    .replace(/<span class="fragment">/g, "")
    .replace(/<\/span>$/gm, "");
}

export default function SlideEditor({
  slide,
  slideIndex,
  onSave,
  onCancel,
}: SlideEditorProps) {
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState(slide.content);
  const [transition, setTransition] = useState<SlideTransition>(slide.transition ?? "slide");
  const [backgroundColor, setBackgroundColor] = useState(slide.backgroundColor ?? "");
  const [backgroundImage, setBackgroundImage] = useState(slide.backgroundImage ?? "");
  const [layout, setLayout] = useState<SlideLayout>(slide.layout ?? "default");
  const [editMode, setEditMode] = useState<"markdown" | "html">("markdown");
  const [useFragments, setUseFragments] = useState(
    slide.content.includes('class="fragment"')
  );

  const previewSlide: Slide = {
    ...slide,
    title,
    content: useFragments ? applyFragments(content) : content,
    transition,
    backgroundColor: backgroundColor || undefined,
    backgroundImage: backgroundImage || undefined,
    layout,
  };

  const handleSave = () => {
    const finalContent = useFragments ? applyFragments(content) : content;
    onSave({
      ...slide,
      title,
      content: finalContent,
      transition,
      backgroundColor: backgroundColor || undefined,
      backgroundImage: backgroundImage || undefined,
      layout,
    });
  };

  const handleFragmentToggle = (checked: boolean) => {
    setUseFragments(checked);
    if (!checked) {
      setContent(removeFragments(content));
    }
  };

  const inputClasses =
    "rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-indigo-500";
  const selectClasses =
    "rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-indigo-500";

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
            className={inputClasses}
            placeholder="Slide title"
          />
        </label>

        {/* Reveal.js slide options */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/70">Transition</span>
            <select
              value={transition}
              onChange={(e) => setTransition(e.target.value as SlideTransition)}
              className={selectClasses}
            >
              {TRANSITIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/70">Layout</span>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as SlideLayout)}
              className={selectClasses}
            >
              {LAYOUTS.map((l) => (
                <option key={l} value={l}>
                  {l === "two-column" ? "Two Column" : l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/70">Background Color</span>
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor || "#000000"}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-white/20 bg-transparent"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className={`flex-1 ${inputClasses}`}
                placeholder="#000000"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/70">Background Image URL</span>
            <input
              type="text"
              value={backgroundImage}
              onChange={(e) => setBackgroundImage(e.target.value)}
              className={inputClasses}
              placeholder="https://example.com/image.jpg"
            />
          </label>
        </div>

        {/* Content editing */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">
              Content ({editMode === "markdown" ? "Markdown" : "HTML"})
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-white/50">
                <input
                  type="checkbox"
                  checked={useFragments}
                  onChange={(e) => handleFragmentToggle(e.target.checked)}
                  className="accent-indigo-500"
                />
                Fragments
              </label>
              <button
                type="button"
                onClick={() => setEditMode(editMode === "markdown" ? "html" : "markdown")}
                className="rounded bg-white/10 px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              >
                {editMode === "markdown" ? "Switch to HTML" : "Switch to Markdown"}
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`flex-1 resize-none font-mono text-sm ${inputClasses}`}
            placeholder={
              editMode === "markdown"
                ? "Slide content in markdown…"
                : "<p>Slide content in HTML…</p>"
            }
            rows={10}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
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
