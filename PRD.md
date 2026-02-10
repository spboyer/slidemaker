# SlideМaker — Product Requirements Document

## Overview

SlideМaker is an AI-powered slide presentation builder. Users describe a topic and the app generates a full slide deck using OpenAI. Presentations are persisted as JSON files in the `/presentations` directory, making them git-friendly and versionable. The app provides a web UI for viewing, editing, navigating, and managing presentations.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI API (chat completions with structured/JSON output)
- **Storage:** JSON files in `/presentations/{slug}.json`
- **Rendering:** react-markdown for slide content

## Data Model

### Slide
```typescript
interface Slide {
  title: string;
  content: string;       // Markdown content
  notes?: string;        // Speaker notes
  backgroundImage?: string;  // keyword for background (gradient fallback)
}
```

### Presentation
```typescript
interface Presentation {
  id: string;            // URL-friendly slug
  title: string;
  createdAt: string;     // ISO-8601
  updatedAt: string;     // ISO-8601
  slides: Slide[];
}
```

## User Stories

### US-1: Generate a presentation via AI
**As a** user, **I want to** type a topic into a chat interface and have the AI generate a complete slide presentation, **so that** I can quickly create a deck without manual authoring.

**Acceptance Criteria:**
- A chat sidebar is available on the presentation page
- User types a prompt like "Create a presentation about TypeScript"
- The app calls the OpenAI API with the topic and a system prompt that returns structured slide data
- The generated slides appear in the slide viewer
- The presentation is automatically saved to `/presentations/{slug}.json`
- The chat shows the AI's response confirming what was generated

### US-2: View and navigate slides
**As a** user, **I want to** view my slides one at a time and navigate between them, **so that** I can review and present my deck.

**Acceptance Criteria:**
- A full-screen slide viewer renders the current slide with markdown formatting
- Previous/Next buttons allow navigation between slides
- A slide counter shows position (e.g., "3 / 12")
- Arrow keys (left/right) also navigate between slides
- The viewer gracefully handles presentations with zero slides ("No slides to display")

### US-3: Edit slide content
**As a** user, **I want to** edit the title and content of any slide inline, **so that** I can refine the AI-generated content.

**Acceptance Criteria:**
- Clicking an "Edit" button or icon on a slide switches to an edit mode
- Edit mode shows text inputs for title and a textarea for content (markdown)
- Changes are reflected in real-time in the slide viewer (live preview)
- A "Save" action persists changes to the JSON file via the API
- A "Cancel" action discards unsaved changes

### US-4: Add slides to an existing presentation
**As a** user, **I want to** add new slides to an existing presentation, either manually or via AI, **so that** I can extend my deck.

**Acceptance Criteria:**
- An "Add Slide" button exists in the navigation area
- Clicking it sends a request to the AI to generate a new slide related to the existing topic
- The new slide is appended to the deck and the viewer navigates to it
- Users can also add a blank slide for manual editing
- Changes are saved automatically

### US-5: Delete and reorder slides
**As a** user, **I want to** delete slides I don't need and reorder them, **so that** I can customize the flow of my presentation.

**Acceptance Criteria:**
- Each slide has a delete button/icon (with confirmation)
- A slide list/thumbnail sidebar shows all slides and allows drag-to-reorder (or move up/down buttons)
- Reordering updates the slides array and persists via the API
- Deleting the last slide shows the "No slides to display" state

### US-6: List and manage presentations
**As a** user, **I want to** see all my saved presentations and manage them, **so that** I can find and organize my decks.

**Acceptance Criteria:**
- The landing page (`/`) shows a list/grid of all saved presentations
- Each entry shows the title, date created, number of slides
- Clicking a presentation navigates to `/presentation/{slug}`
- A "New Presentation" button starts the creation flow
- A delete button removes a presentation (with confirmation)

### US-7: Presentation CRUD API
**As a** developer, **I want** REST API endpoints for creating, reading, updating, and deleting presentations, **so that** the frontend has a clean data layer.

**Acceptance Criteria:**
- `GET /api/presentations` — returns a list of all presentations (metadata only: id, title, createdAt, updatedAt, slide count)
- `POST /api/presentations` — creates a new presentation (accepts title and slides array, generates slug from title)
- `GET /api/presentations/[slug]` — returns a full presentation with all slides
- `PUT /api/presentations/[slug]` — updates a presentation (title, slides)
- `DELETE /api/presentations/[slug]` — deletes a presentation file
- All endpoints return proper HTTP status codes (200, 201, 404, 400, 500)
- Input validation on POST/PUT (title required, slides must be array)

### US-8: AI slide generation API
**As a** developer, **I want** an API endpoint that generates slides from a topic using OpenAI, **so that** the frontend can request AI-generated content.

**Acceptance Criteria:**
- `POST /api/generate` — accepts `{ topic: string, numSlides?: number, existingSlides?: Slide[] }`
- Calls OpenAI chat completions with a system prompt that returns JSON slide data
- When `existingSlides` is provided, generates slides that complement the existing deck
- Returns `{ slides: Slide[] }` with the generated slides
- Handles OpenAI API errors gracefully (rate limits, invalid key, timeout)
- Default `numSlides` is 5 if not specified

### US-9: Build verification and smoke tests
**As a** developer, **I want** the project to build and pass basic smoke tests, **so that** I can be confident the app works.

**Acceptance Criteria:**
- `npm run build` completes without errors
- `npm run dev` starts the dev server successfully
- The landing page renders without errors
- The presentation page renders without errors
- API endpoints return valid responses (happy path)
- TypeScript has no type errors

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Landing page — list presentations
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + global styles
│   ├── presentation/
│   │   └── [slug]/
│   │       └── page.tsx            # View/edit a specific presentation
│   ├── components/
│   │   ├── SlideViewer.tsx         # Renders current slide (markdown)
│   │   ├── SlideEditor.tsx         # Edit slide title/content
│   │   ├── SlideNav.tsx            # Prev/Next/Add navigation
│   │   ├── PresentationChat.tsx    # Chat sidebar for AI generation
│   │   └── PresentationList.tsx    # List saved presentations
│   └── api/
│       ├── generate/
│       │   └── route.ts            # POST — AI slide generation
│       └── presentations/
│           ├── route.ts            # GET list, POST create
│           └── [slug]/
│               └── route.ts        # GET/PUT/DELETE single presentation
├── lib/
│   ├── types.ts                    # Shared TypeScript interfaces
│   └── openai.ts                   # OpenAI client helper
```

## Non-Goals (v1)

- Text-to-speech / audio narration (future enhancement)
- Real-time collaboration
- Export to PowerPoint/PDF
- User authentication
- Image generation for slide backgrounds (use gradients or manual URLs)
- Database storage (files are sufficient for v1)

## Environment

- `OPENAI_API_KEY` — required, set in `.env.local`
