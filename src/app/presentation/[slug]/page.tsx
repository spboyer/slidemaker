"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Slide, Presentation } from "@/lib/types";
import RevealSlideshow, {
  RevealSlideshowRef,
} from "@/app/components/RevealSlideshow";
import SlideNav from "@/app/components/SlideNav";
import SlideEditor from "@/app/components/SlideEditor";
import SlideManager from "@/app/components/SlideManager";
import PresentationChat from "@/app/components/PresentationChat";
import ThemePicker from "@/app/components/ThemePicker";

export default function PresentationPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const isNew = slug === "new";

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showChat, setShowChat] = useState(isNew);
  const [addingSlide, setAddingSlide] = useState(false);
  const revealRef = useRef<RevealSlideshowRef>(null);

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
    if (isNew) return;
    fetchPresentation();
  }, [isNew, fetchPresentation]);

  const savePresentation = useCallback(
    async (slides: Slide[], title?: string) => {
      if (!presentation) return;
      const body: { slides: Slide[]; title?: string } = { slides };
      if (title) body.title = title;
      try {
        const res = await fetch(`/api/presentations/${presentation.id}`, {
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
    [presentation]
  );

  const createPresentation = useCallback(
    async (slides: Slide[], title: string) => {
      try {
        const res = await fetch("/api/presentations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, slides }),
        });
        if (res.ok) {
          const created: Presentation = await res.json();
          setPresentation(created);
          router.replace(`/presentation/${created.id}`);
        }
      } catch (err) {
        console.error("Failed to create presentation:", err);
      }
    },
    [router]
  );

  const handleSlidesGenerated = useCallback(
    (newSlides: Slide[]) => {
      if (isNew && !presentation) {
        // New presentation — create it with the first slide's content as topic
        const title = newSlides[0]?.title || "Untitled Presentation";
        createPresentation(newSlides, title);
      } else if (presentation) {
        // Existing presentation — append slides and save
        const combined = [...presentation.slides, ...newSlides];
        savePresentation(combined);
        setCurrentSlideIndex(presentation.slides.length); // jump to first new slide
      }
    },
    [isNew, presentation, createPresentation, savePresentation]
  );

  const handleAddSlide = useCallback(async () => {
    if (!presentation || addingSlide) return;
    setAddingSlide(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: presentation.title,
          numSlides: 1,
          existingSlides: presentation.slides,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newSlides = [...presentation.slides, ...data.slides];
        await savePresentation(newSlides);
        setCurrentSlideIndex(newSlides.length - 1);
      }
    } catch (err) {
      console.error("Failed to add slide:", err);
    } finally {
      setAddingSlide(false);
    }
  }, [presentation, addingSlide, savePresentation]);

  const handleAddBlank = useCallback(() => {
    if (!presentation) return;
    const blank: Slide = { title: "New Slide", content: "" };
    const newSlides = [...presentation.slides, blank];
    savePresentation(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    setEditing(true);
  }, [presentation, savePresentation]);

  const handleThemeChange = useCallback(
    async (themeId: string) => {
      if (!presentation) return;
      try {
        const res = await fetch(`/api/presentations/${presentation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: presentation.slides, theme: themeId }),
        });
        if (res.ok) {
          const updated: Presentation = await res.json();
          setPresentation(updated);
        }
      } catch (err) {
        console.error("Failed to save theme:", err);
      }
    },
    [presentation]
  );

  const handleSlideChanged = useCallback((index: number) => {
    setCurrentSlideIndex(index);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = document.querySelector(".reveal") as HTMLElement | null;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

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

  // --- New presentation (no slides yet) ---
  if (isNew && !presentation) {
    return (
      <div className="flex h-screen w-screen bg-slate-900">
        {/* Chat sidebar open by default for new */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-3xl font-bold text-white">New Presentation</h1>
            <p className="text-white/50">
              Use the chat to describe your topic and generate slides.
            </p>
          </div>
        </div>
        <div className="w-80 shrink-0 border-l border-white/10">
          <PresentationChat
            existingSlides={[]}
            onSlidesGenerated={handleSlidesGenerated}
          />
        </div>
      </div>
    );
  }

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
      <div className="flex h-screen w-screen bg-slate-900">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-xl text-white/60">No slides to display</p>
          <Link
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            ← Back to presentations
          </Link>
        </div>
        {showChat && (
          <div className="w-80 shrink-0 border-l border-white/10">
            <PresentationChat
              existingSlides={[]}
              onSlidesGenerated={handleSlidesGenerated}
              presentationTitle={presentation.title}
            />
          </div>
        )}
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
            onSelect={(i) => {
              setCurrentSlideIndex(i);
              revealRef.current?.goToSlide(i);
            }}
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
            <ThemePicker
              currentTheme={presentation.theme ?? "night"}
              onThemeChange={handleThemeChange}
            />
            <button
              onClick={handleFullscreen}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              title="Toggle fullscreen (F)"
            >
              ⛶
            </button>
            <button
              onClick={() => revealRef.current?.toggleOverview()}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              title="Slide overview (O)"
            >
              ▦
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                showChat ? "bg-indigo-600 hover:bg-indigo-500" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {showChat ? "Hide Chat" : "AI Chat"}
            </button>
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

        {/* Slide viewer — reveal.js */}
        <div className="relative flex-1 overflow-hidden">
          <RevealSlideshow
            ref={revealRef}
            presentation={presentation}
            startSlide={currentSlideIndex}
            onSlideChange={handleSlideChanged}
          />
          <div className="pointer-events-none absolute bottom-2 right-2 text-[10px] text-white/30">
            Press S for speaker notes
          </div>
        </div>

        {/* Navigation */}
        <SlideNav
          currentIndex={currentSlideIndex}
          totalSlides={slides.length}
          onPrevious={() => revealRef.current?.prev()}
          onNext={() => revealRef.current?.next()}
          onAddSlide={handleAddSlide}
          onAddBlank={handleAddBlank}
        />
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="w-80 shrink-0 border-l border-white/10">
          <PresentationChat
            existingSlides={slides}
            onSlidesGenerated={handleSlidesGenerated}
            presentationTitle={presentation.title}
          />
        </div>
      )}
    </div>
  );
}
