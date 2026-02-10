export interface Slide {
  title: string;
  content: string;
  notes?: string;
  backgroundImage?: string;
}

export interface Presentation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}
