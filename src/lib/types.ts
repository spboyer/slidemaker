export type SlideTransition =
  | "none"
  | "fade"
  | "slide"
  | "convex"
  | "concave"
  | "zoom";

export type SlideLayout = "default" | "center" | "two-column";

export interface Slide {
  title: string;
  content: string;
  notes?: string;
  backgroundImage?: string;
  transition?: SlideTransition;
  backgroundColor?: string;
  layout?: SlideLayout;
}

export interface Presentation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
  theme?: string;
  transition?: SlideTransition;
}
