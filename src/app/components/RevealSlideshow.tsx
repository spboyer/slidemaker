"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";
import { Presentation, Slide } from "@/lib/types";

export interface RevealSlideshowRef {
  /** Navigate to a specific slide (h = horizontal index, v = optional vertical) */
  goToSlide: (h: number, v?: number) => void;
  /** Move to the next slide */
  next: () => void;
  /** Move to the previous slide */
  prev: () => void;
  /** Get the current slide indices */
  getIndices: () => { h: number; v: number } | null;
  /** Toggle fullscreen / overview */
  toggleOverview: () => void;
}

interface RevealSlideshowProps {
  presentation: Presentation;
  /** Override starting slide index (default 0) */
  startSlide?: number;
  /** Called when the active slide changes */
  onSlideChange?: (index: number) => void;
}

/** Build the inner HTML for all slides so React doesn't reconcile individual
 *  <section> elements. This keeps DOM nodes stable for fitty (r-fit-text). */
function buildSlidesHTML(slides: Slide[]): string {
  return slides
    .map((slide) => {
      const attrs: string[] = [];
      if (slide.transition) attrs.push(`data-transition="${slide.transition}"`);
      if (slide.backgroundImage)
        attrs.push(`data-background-image="${slide.backgroundImage}"`);
      if (slide.backgroundColor)
        attrs.push(`data-background-color="${slide.backgroundColor}"`);
      if (slide.backgroundGradient)
        attrs.push(`data-background-gradient="${slide.backgroundGradient}"`);
      if (slide.autoAnimate) attrs.push(`data-auto-animate=""`);
      if (slide.layout === "center") attrs.push(`data-state="center"`);
      if (slide.notes) attrs.push(`data-notes="${slide.notes.replace(/"/g, "&quot;")}"`);
      if (slide.layout === "center") attrs.push(`class="center"`);

      const titleHTML = slide.title ? `<h2>${slide.title}</h2>` : "";
      const isHTML = /<[a-z][\s\S]*>/i.test(slide.content);
      let contentHTML: string;
      if (isHTML) {
        contentHTML = slide.content;
      } else {
        contentHTML = slide.content
          .split(/\n{2,}/)
          .map((p) => `<p>${p}</p>`)
          .join("");
      }
      if (slide.layout === "two-column") {
        contentHTML = `<div class="r-hstack">${contentHTML}</div>`;
      }

      return `<section ${attrs.join(" ")}>${titleHTML}${contentHTML}</section>`;
    })
    .join("");
}

const THEME_LINK_ID = "reveal-theme-link";
const BASE_CSS_LINK_ID = "reveal-base-css";
const HIGHLIGHT_CSS_LINK_ID = "reveal-highlight-css";

function loadRevealBaseCSS() {
  if (document.getElementById(BASE_CSS_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = BASE_CSS_LINK_ID;
  link.rel = "stylesheet";
  link.href = "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css";
  document.head.appendChild(link);
}

function loadThemeCSS(themeId: string) {
  const href = `https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/${themeId}.css`;
  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (link) {
    if (!link.href.endsWith(`/${themeId}.css`)) {
      link.href = href;
    }
    return;
  }
  link = document.createElement("link");
  link.id = THEME_LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadHighlightCSS() {
  if (document.getElementById(HIGHLIGHT_CSS_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = HIGHLIGHT_CSS_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/monokai.css";
  document.head.appendChild(link);
}

function removeThemeCSS() {
  document.getElementById(THEME_LINK_ID)?.remove();
  document.getElementById(BASE_CSS_LINK_ID)?.remove();
  document.getElementById(HIGHLIGHT_CSS_LINK_ID)?.remove();
}

const RevealSlideshow = forwardRef<RevealSlideshowRef, RevealSlideshowProps>(
  function RevealSlideshow({ presentation, startSlide = 0, onSlideChange }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deckRef = useRef<any>(null);
    const [ready, setReady] = useState(false);

    const theme = presentation.theme ?? "night";
    const transition = presentation.transition ?? "slide";

    // Expose imperative API
    useImperativeHandle(
      ref,
      () => ({
        goToSlide(h: number, v?: number) {
          deckRef.current?.slide(h, v ?? 0);
        },
        next() {
          deckRef.current?.next();
        },
        prev() {
          deckRef.current?.prev();
        },
        getIndices() {
          return deckRef.current?.getIndices() ?? null;
        },
        toggleOverview() {
          deckRef.current?.toggleOverview();
        },
      }),
      []
    );

    // Handle slide-change callback
    const handleSlideChange = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (event: any) => {
        if (onSlideChange) {
          onSlideChange(event.indexh ?? 0);
        }
      },
      [onSlideChange]
    );

    // Initialise reveal.js (dynamic import — accesses window/document)
    useEffect(() => {
      let destroyed = false;

      async function init() {
        if (!containerRef.current) return;

        // Dynamic import — reveal.js requires browser globals
        const Reveal = (await import("reveal.js")).default;
        const RevealHighlight = (
          await import("reveal.js/plugin/highlight/highlight")
        ).default;
        const RevealNotes = (await import("reveal.js/plugin/notes/notes"))
          .default;
        const RevealZoom = (await import("reveal.js/plugin/zoom/zoom")).default;

        // Ensure base CSS and highlight theme are loaded
        loadRevealBaseCSS();
        loadHighlightCSS();

        if (destroyed || !containerRef.current) return;

        const deck = new Reveal(containerRef.current, {
          hash: false,
          history: false,
          controls: true,
          progress: true,
          center: true,
          transition,
          embedded: true,
          keyboardCondition: "focused",
          width: 960,
          height: 700,
          margin: 0.04,
          minScale: 0.2,
          maxScale: 2.0,
          respondToHashChanges: false,
          plugins: [RevealHighlight, RevealNotes, RevealZoom],
        });

        await deck.initialize();

        if (destroyed) {
          deck.destroy();
          return;
        }

        deckRef.current = deck;

        // Jump to starting slide
        if (startSlide > 0) {
          deck.slide(startSlide, 0);
        }

        deck.on("slidechanged", handleSlideChange);
        deck.on("overviewhidden", handleSlideChange);
        setReady(true);
      }

      init().catch((err) => {
        console.error("Failed to initialize reveal.js:", err);
      });

      return () => {
        destroyed = true;
        if (deckRef.current) {
          deckRef.current.off("slidechanged", handleSlideChange);
          deckRef.current.off("overviewhidden", handleSlideChange);
          try {
            deckRef.current.destroy();
          } catch {
            // fitty may throw if DOM elements are already detached
          }
          deckRef.current = null;
        }
        setReady(false);
      };
      // Re-init when slides change structurally
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presentation.id, presentation.slides.length]);

    // Theme switching — inject/swap CSS <link>
    useEffect(() => {
      loadThemeCSS(theme);
      return () => {
        removeThemeCSS();
      };
    }, [theme]);

    // Sync transition config when it changes
    useEffect(() => {
      if (deckRef.current) {
        deckRef.current.configure({ transition });
      }
    }, [transition]);

    // Sync slides when content changes (without full re-init)
    const slidesJson = JSON.stringify(presentation.slides);
    const prevSlidesJson = useRef(slidesJson);
    useEffect(() => {
      if (deckRef.current && ready && slidesJson !== prevSlidesJson.current) {
        prevSlidesJson.current = slidesJson;
        deckRef.current.sync();
      }
    }, [slidesJson, ready]);

    const slidesHTML = buildSlidesHTML(presentation.slides);

    return (
      <div
        ref={containerRef}
        className="reveal relative h-full w-full"
        style={{ minHeight: 400 }}
        tabIndex={0}
        role="region"
        aria-label="Slide presentation"
        aria-roledescription="slideshow"
      >
        <div
          className="slides"
          dangerouslySetInnerHTML={{ __html: slidesHTML }}
        />
      </div>
    );
  }
);

export default RevealSlideshow;
