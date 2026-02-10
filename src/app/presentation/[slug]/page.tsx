"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Slide, Presentation } from "@/lib/types";
import SlideViewer from "@/app/components/SlideViewer";
import SlideNav from "@/app/components/SlideNav";
import SlideEditor from "@/app/components/SlideEditor";
import SlideManager from "@/app/components/SlideManager";

export default function PresentationPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const fetchPresentation = useCallback(async () => {
    try {
      const res = await fetch(`/api/presentations/${slug}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (res.ok) {
        const data: Presentation = await res.json();
        setPresentation(data);
      }
    } catch (err) {
      console.error("Failed to fetch presentation:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug === "new") return;
    fetchPresentation();
  }, [slug, fetchPresentation]);

  // Redirect /presentation/new to home for now (creation flow handled elsewhere)
  useEffect(() => {
    if (slug === "new") {
      router.push("/");
    }
  }, [slug, router]);

  const savePresentation = useCallback(
    async (slides: Slide[], title?: string) => {
      if (!presentation) return;
      const body: { slides: Slide[]; title?: string } = { slides };
      if (title) body.title = title;
      try {
        const res = await fetch(`/api/presentations/${slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated: Presentation = await res.json();
          setPresentation(updated);
        }
      } catch (err) {
        console.error("Failed to save presentation:", err);
      }
    },
    [presentation, slug]
  );

  const handleSaveSlide = (updated: Slide) => {
    if (!presentation) return;
    const newSlides = [...presentation.slides];
    newSlides[currentSlideIndex] = updated;
    savePresentation(newSlides);
    setEditing(false);
  };

  const handleDeleteSlide = (index: number) => {
    if (!presentation) return;
    const newSlides = presentation.slides.filter((_, i) => i !== index);
    savePresentation(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1));
    }
  };

  const handleMoveUp = (index: number) => {
    if (!presentation || index === 0) return;
    const newSlides = [...presentation.slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    savePresentation(newSlides);
    if (currentSlideIndex === index) setCurrentSlideIndex(index - 1);
    else if (currentSlideIndex === index - 1) setCurrentSlideIndex(index);
  };

  const handleMoveDown = (index: number) => {
    if (!presentation || index >= presentation.slides.length - 1) return;
    const newSlides = [...presentation.slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    savePresentation(newSlides);
    if (currentSlideIndex === index) setCurrentSlideIndex(index + 1);
    else if (currentSlideIndex === index + 1) setCurrentSlideIndex(index);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <p className="text-xl text-white/60">Loading…</p>
      </div>
    );
  }

  if (notFound || !presentation) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-900">
        <p className="text-xl text-white/60">Presentation not found</p>
        <Link
          href="/"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          ← Back to presentations
        </Link>
      </div>
    );
  }

  const slides = presentation.slides;

  if (slides.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-900">
        <p className="text-xl text-white/60">No slides to display</p>
        <Link
          href="/"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          ← Back to presentations
        </Link>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="flex h-screen w-screen flex-col bg-slate-900">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back
          </Link>
          <span className="text-sm text-white/60">{presentation.title}</span>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-white/60 hover:text-white"
          >
            Close Editor
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SlideEditor
            slide={slides[currentSlideIndex]}
            slideIndex={currentSlideIndex}
            onSave={handleSaveSlide}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900">
      {/* Slide manager sidebar */}
      {showManager && (
        <div className="w-64 shrink-0 border-r border-white/10">
          <SlideManager
            slides={slides}
            currentIndex={currentSlideIndex}
            onSelect={(i) => setCurrentSlideIndex(i)}
            onDelete={handleDeleteSlide}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to presentations
          </Link>
          <span className="text-sm font-medium text-white">{presentation.title}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowManager(!showManager)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              {showManager ? "Hide" : "Slides"}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Slide viewer */}
        <div className="flex-1 overflow-hidden">
          <SlideViewer slide={slides[currentSlideIndex]} index={currentSlideIndex} />
        </div>

        {/* Navigation */}
        <SlideNav
          currentIndex={currentSlideIndex}
          totalSlides={slides.length}
          onPrevious={() => setCurrentSlideIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
        />
      </div>
    </div>
  );
}
