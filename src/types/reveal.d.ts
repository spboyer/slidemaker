declare module "reveal.js" {
  interface RevealOptions {
    hash?: boolean;
    history?: boolean;
    controls?: boolean;
    progress?: boolean;
    center?: boolean;
    transition?: string;
    embedded?: boolean;
    keyboardCondition?: string | null;
    width?: number | string;
    height?: number | string;
    margin?: number;
    minScale?: number;
    maxScale?: number;
    respondToHashChanges?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins?: any[];
    [key: string]: unknown;
  }

  interface RevealIndices {
    h: number;
    v: number;
    f?: number;
  }

  interface RevealSlideEvent {
    indexh: number;
    indexv: number;
    previousSlide: HTMLElement;
    currentSlide: HTMLElement;
  }

  class Reveal {
    constructor(container: HTMLElement, options?: RevealOptions);
    initialize(): Promise<void>;
    destroy(): void;
    configure(options: Partial<RevealOptions>): void;
    slide(h: number, v?: number, f?: number): void;
    next(): void;
    prev(): void;
    getIndices(): RevealIndices;
    sync(): void;
    toggleOverview(): void;
    on(event: string, callback: (event: RevealSlideEvent) => void): void;
    off(event: string, callback: (event: RevealSlideEvent) => void): void;
  }

  export default Reveal;
}

declare module "reveal.js/dist/reveal.css";
declare module "reveal.js/plugin/highlight/highlight";
declare module "reveal.js/plugin/notes/notes";
declare module "reveal.js/plugin/zoom/zoom";
