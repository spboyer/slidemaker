# SlideМaker

AI-powered slide presentation builder. Describe a topic, get a polished reveal.js deck in seconds — then edit, theme, and present right in the browser.

## Features

- **AI Slide Generation** — Chat with AI to generate complete presentations from a topic description, powered by [GitHub Models](https://github.com/marketplace/models) (OpenAI GPT-4o)
- **reveal.js Rendering** — Full-featured slide presentations with transitions, fragments, and animations
- **11 Themes** — Black, White, League, Sky, Beige, Simple, Serif, Blood, Night, Moon, Solarized
- **6 Transitions** — None, Fade, Slide, Convex, Concave, Zoom (per-slide or global)
- **Speaker Notes** — Add talking points visible only to the presenter (`S` key)
- **Presentation Styles** — Professional, Creative, Minimal, Technical — each with tailored tone and theme suggestions
- **Live Editing** — Side-by-side Markdown/HTML editor with instant preview
- **Slide Management** — Reorder, add, delete, and duplicate slides
- **Keyboard Navigation** — Arrow keys, fullscreen (`F`), overview mode (`O`)
- **PDF Export** — Print to PDF via `?print-pdf` query parameter
- **Auto-save** — Every edit persists immediately via the API
- **JSON Storage** — Presentations stored as version-control-friendly JSON files

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Slides | [reveal.js 5.x](https://revealjs.com) |
| AI | [GitHub Models API](https://github.com/marketplace/models) via OpenAI SDK |
| Testing | [Vitest](https://vitest.dev), [Playwright](https://playwright.dev) |

## Prerequisites

- **Node.js** 18+ and npm
- **GitHub CLI** — used to authenticate with the GitHub Models API

Install the GitHub CLI if you don't have it:

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli
```

Then log in:

```bash
gh auth login
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/spboyer/slidemaker.git
cd slidemaker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building presentations.

## Environment Setup

SlideМaker uses the **GitHub Models API** for AI slide generation. Authentication is handled automatically:

1. **GitHub CLI (recommended)** — If you're logged in via `gh auth login`, the app reads your token with `gh auth token`. No `.env` file needed.
2. **Environment variable** — Alternatively, set `GITHUB_TOKEN` in your environment or a `.env.local` file:

   ```
   GITHUB_TOKEN=your-token-here
   ```

> **⚠️ Security:** Never commit tokens or secrets to source control. The `.env.local` file is already in `.gitignore`.

## Usage

### Create a Presentation

1. Click **"New Presentation"** on the landing page
2. Type a topic in the chat sidebar (e.g., *"Create a presentation about TypeScript best practices"*)
3. Optionally choose a presentation style: Professional, Creative, Minimal, or Technical
4. The AI generates your slides, which appear in the viewer immediately

### Edit Slides

- Click **Edit** to open the side-by-side editor (Markdown/HTML on the left, live preview on the right)
- Modify the title, content, speaker notes, transition, and background color
- Changes save automatically

### Navigate & Present

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / Next slide |
| `F` | Toggle fullscreen |
| `O` | Overview mode (see all slides at once) |
| `S` | Open speaker notes window |
| `Esc` | Exit fullscreen or overview |

### Add Slides

- **AI Slide** — Generates a new slide that complements the existing deck
- **Blank** — Adds an empty slide for manual editing

### Themes

Use the theme picker dropdown to switch between 11 reveal.js themes. Theme changes apply instantly and persist with the presentation.

### Export to PDF

Append `?print-pdf` to the presentation URL and use your browser's print dialog (`Ctrl+P` / `Cmd+P`) to save as PDF.

## Presentation Storage

Presentations are stored as JSON files in the `presentations/` directory at the project root:

```
presentations/
├── typescript-best-practices.json
├── intro-to-react.json
└── quarterly-review.json
```

Each file contains the full presentation data including slides, theme, speaker notes, and metadata. These files are version-control-friendly and can be committed to your repository.

## API Reference

### `POST /api/generate`

Generate slides using AI.

**Request body:**
```json
{
  "topic": "TypeScript best practices",
  "numSlides": 5,
  "style": "technical",
  "existingSlides": []
}
```

- `topic` (required) — The subject for slide generation
- `numSlides` (optional, default: 5, max: 20) — Number of slides to generate
- `style` (optional) — One of `professional`, `creative`, `minimal`, `technical`
- `existingSlides` (optional) — Array of existing slides for context-aware generation

**Response:**
```json
{
  "slides": [{ "title": "...", "content": "...", "notes": "..." }],
  "suggestedTheme": "solarized"
}
```

### `GET /api/presentations`

List all presentations (metadata only: id, title, dates, slide count).

### `POST /api/presentations`

Create a new presentation. Body: `{ "title": "...", "slides": [...] }`

### `GET /api/presentations/[slug]`

Get a full presentation by slug, including all slides.

### `PUT /api/presentations/[slug]`

Update a presentation (title, slides, theme, transition).

### `DELETE /api/presentations/[slug]`

Delete a presentation.

## Development

```bash
# Development server (with hot reload)
npm run dev

# Run unit tests
npm test

# Run e2e tests (starts dev server automatically)
npm run test:e2e

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### E2E Testing

End-to-end tests use [Playwright](https://playwright.dev) with Chromium. They cover presentation CRUD, slide navigation, theme switching, code highlighting, overview mode, the slide editor, and AI chat generation.

**Setup:**

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium
```

**Running:**

```bash
# Run all e2e tests (starts dev server automatically)
npm run test:e2e

# Run a specific test file
npx playwright test e2e/slide-navigation.spec.ts

# Run in headed mode (see the browser)
npx playwright test --headed

# View the HTML report after a test run
npx playwright show-report
```

> **Note:** Tests that require the GitHub Models API (chat generation) are automatically skipped when the API is unavailable.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── presentation/[slug]/page.tsx    # Presentation viewer/editor
│   ├── components/
│   │   ├── RevealSlideshow.tsx          # reveal.js wrapper
│   │   ├── SlideEditor.tsx             # Side-by-side editor
│   │   ├── SlideNav.tsx                # Navigation bar
│   │   ├── SlideManager.tsx            # Slide sidebar (reorder/delete)
│   │   ├── PresentationChat.tsx        # AI chat sidebar
│   │   ├── PresentationList.tsx        # Landing page grid
│   │   └── ThemePicker.tsx             # Theme selector dropdown
│   └── api/
│       ├── generate/route.ts           # AI slide generation
│       └── presentations/
│           ├── route.ts                # List + Create
│           └── [slug]/route.ts         # Read + Update + Delete
├── lib/
│   ├── types.ts                        # Shared TypeScript interfaces
│   ├── openai.ts                       # GitHub Models API client
│   └── reveal-themes.ts               # Theme definitions
presentations/                          # JSON file storage
```

## License

MIT
