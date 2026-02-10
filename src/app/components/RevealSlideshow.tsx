"use client";

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
  useMemo,
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

/** Remove r-fit-text class to prevent fitty crash in React reconciliation */
function stripFitText(html: string): string {
  return html
    .replace(/\bclass="r-fit-text"/gi, '')
    .replace(/\br-fit-text\b/g, '');
}

/**
 * Re-run the RevealHighlight plugin on any code blocks that weren't
 * processed (e.g. due to React StrictMode replacing DOM elements after
 * the plugin's init already ran).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function highlightCodeBlocks(deck: any, container: HTMLElement) {
  const plugin = deck.getPlugin('highlight');
  if (!plugin) {
    console.warn('[SlideМaker] highlight plugin not found');
    return;
  }

  const unprocessed = container.querySelectorAll('pre code:not([data-highlighted])');
  if (unprocessed.length === 0) return;

  // Use plugin.hljs if available, otherwise fall back to plugin.highlightBlock
  const hljs = plugin.hljs;
  unprocessed.forEach((block: Element) => {
    // Add the wrapper class the plugin normally adds in init
    block.parentElement?.classList.add('code-wrapper');

    // Trim whitespace if data-trim is present (plugin init logic)
    if (block.hasAttribute('data-trim') && typeof (block as HTMLElement).innerHTML.trim === 'function') {
      (block as HTMLElement).innerHTML = (block as HTMLElement).innerHTML.trim();
    }

    if (hljs && typeof hljs.highlightElement === 'function') {
      // Use hljs directly to avoid line-number fragment creation
      hljs.highlightElement(block);
    } else if (typeof plugin.highlightBlock === 'function') {
      // Fallback to plugin method
      plugin.highlightBlock(block);
    }
  });
}

/** Render slide content — supports HTML (contains tags) or plain markdown */
function SlideContent({ slide }: { slide: Slide }) {
  const isHTML = /<[a-z][\s\S]*>/i.test(slide.content);

  if (isHTML) {
    return <div dangerouslySetInnerHTML={{ __html: stripFitText(slide.content) }} />;
  }

  // Plain text / markdown: render as paragraphs split by double newlines
  const paragraphs = slide.content.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

/** Build data attributes for a slide <section> */
function sectionAttrs(slide: Slide) {
  const attrs: Record<string, string | undefined> = {};
  if (slide.transition) attrs["data-transition"] = slide.transition;
  if (slide.backgroundImage)
    attrs["data-background-image"] = slide.backgroundImage;
  if (slide.backgroundColor)
    attrs["data-background-color"] = slide.backgroundColor;
  if (slide.backgroundGradient)
    attrs["data-background-gradient"] = slide.backgroundGradient;
  if (slide.autoAnimate) attrs["data-auto-animate"] = "";
  if (slide.layout === "center") attrs["data-state"] = "center";
  return attrs;
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

    const theme = presentation.theme ?? "black";
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
      // Re-init when the presentation ID changes (different presentation)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presentation.id]);

    // Re-highlight code blocks after React re-render.
    // The RevealHighlight plugin processes <pre><code> during deck.initialize(),
    // but React re-renders replace the plugin-modified DOM with original HTML.
    // Use MutationObserver to detect when React replaces code block content
    // and re-apply highlighting.
    useEffect(() => {
      if (!ready || !deckRef.current || !containerRef.current) return;

      const deck = deckRef.current;
      const container = containerRef.current;

      // Initial highlight pass
      highlightCodeBlocks(deck, container);

      // Watch for DOM mutations that reset code blocks (React reconciliation)
      const observer = new MutationObserver(() => {
        // Guard: only highlight if the deck is still the current one and ready
        if (deckRef.current !== deck || !containerRef.current) return;
        try {
          const unprocessed = container.querySelectorAll('pre code:not([data-highlighted])');
          if (unprocessed.length > 0) {
            highlightCodeBlocks(deck, container);
          }
        } catch {
          // Deck may be mid-destroy during slide count changes
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }, [ready]);

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
    const slidesJson = useMemo(() => JSON.stringify(presentation.slides), [presentation.slides]);
    const prevSlidesJson = useRef(slidesJson);
    useEffect(() => {
      if (deckRef.current && ready && slidesJson !== prevSlidesJson.current) {
        prevSlidesJson.current = slidesJson;
        try {
          deckRef.current.sync();
          // Highlight any new code blocks added by content changes
          if (containerRef.current) {
            highlightCodeBlocks(deckRef.current, containerRef.current);
          }
        } catch {
          // fitty (r-fit-text) may throw if elements are mid-transition
        }
      }
    }, [slidesJson, ready]);

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
        <div className="slides">
          {presentation.slides.map((slide, i) => (
            <section
              key={i}
              {...sectionAttrs(slide)}
              className={slide.layout === "center" ? "center" : undefined}
              data-notes={slide.notes ?? undefined}
            >
              {slide.title && <h2>{slide.title}</h2>}
              {slide.layout === "two-column" ? (
                <div className="r-hstack">
                  <SlideContent slide={slide} />
                </div>
              ) : (
                <SlideContent slide={slide} />
              )}
            </section>
          ))}
        </div>
      </div>
    );
  }
);

export default RevealSlideshow;
