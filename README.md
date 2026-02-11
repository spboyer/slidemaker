# SlideМaker

AI-powered slide presentation builder. Describe a topic, get a polished reveal.js deck in seconds — then edit, theme, and present right in the browser.

## ✨ Features

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
- **GitHub OAuth** — Sign in with GitHub, with dev mode bypass for local development
- **Copilot Extension** — Generate presentations from GitHub Copilot Chat with `/slidemaker`
- **Copilot Coding Agent** — Autonomous issue resolution with @copilot via `squad:copilot` labels
- **Squad AI Team** — Collaborative development with specialized AI agents (Lead, Frontend, Backend, Tester)
- **MCP Server** — Expose presentations as tools for Claude, Copilot CLI, and VS Code
- **Docker & Azure Deployment** — Containerized app with Bicep IaC for Azure Container Apps

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Slides | [reveal.js 5.x](https://revealjs.com) |
| AI | [GitHub Models API](https://github.com/marketplace/models) via OpenAI SDK |
| Auth | [Auth.js v5](https://authjs.dev) (NextAuth.js) — GitHub OAuth |
| Testing | [Vitest](https://vitest.dev), [Playwright](https://playwright.dev) |

## 📋 Prerequisites

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

## 🚀 Getting Started

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

## ⚙️ Environment Setup

SlideМaker uses the **GitHub Models API** for AI slide generation. Authentication is handled automatically:

1. **GitHub CLI (recommended)** — If you're logged in via `gh auth login`, the app reads your token with `gh auth token`. No `.env` file needed.
2. **Environment variable** — Alternatively, set `GITHUB_TOKEN` in your environment or a `.env.local` file:

   ```
   GITHUB_TOKEN=your-token-here
   ```

> **⚠️ Security:** Never commit tokens or secrets to source control. The `.env.local` file is already in `.gitignore`.
### GitHub OAuth (Optional)

To enable GitHub OAuth sign-in, create a [GitHub OAuth App](https://github.com/settings/developers) and add these to `.env.local`:

```
AUTH_GITHUB_ID=your-client-id
AUTH_GITHUB_SECRET=your-client-secret
AUTH_SECRET=random-secret-string
```

Set the **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`.

When `AUTH_GITHUB_ID` is not set, the app runs in **Dev Mode** — all routes are accessible without authentication.

## 🔐 Authentication

### GitHub OAuth Setup

SlideМaker uses [Auth.js v5](https://authjs.dev) (NextAuth.js) with GitHub OAuth. To enable authentication:

1. Go to **GitHub Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `SlideМaker`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy the **Client ID** → set as `AUTH_GITHUB_ID`
5. Click **Generate a new client secret** → set as `AUTH_GITHUB_SECRET`
6. Add both to `.env.local`:

   ```
   AUTH_GITHUB_ID=<your-client-id>
   AUTH_GITHUB_SECRET=<your-client-secret>
   AUTH_SECRET=<random-secret-string>
   ```

> **Tip:** Generate `AUTH_SECRET` with `openssl rand -base64 32`

### Local Development Without Auth

When `AUTH_GITHUB_ID` is **not set**, the app runs in **Dev Mode** — all routes are accessible without authentication. The UI shows a "Dev Mode" badge instead of a sign-in button.

### Bearer Token Authentication

API clients can authenticate using a GitHub token as a Bearer token:

```bash
# Using GitHub CLI token
curl -H "Authorization: Bearer $(gh auth token)" \
  http://localhost:3000/api/presentations

# Using a personal access token
curl -H "Authorization: Bearer <your-github-token>" \
  http://localhost:3000/api/presentations
```

The MCP server and Copilot Extension both use Bearer tokens to authenticate with the API.

### ⏱️ Rate Limiting

- **60 requests per minute** per authenticated user
- Rate limit resets on a sliding window
- Exceeding the limit returns `429 Too Many Requests`

## 📖 Usage

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

## 💾 Presentation Storage

Presentations are stored as JSON files in the `presentations/` directory at the project root:

```
presentations/
├── typescript-best-practices.json
├── intro-to-react.json
└── quarterly-review.json
```

Each file contains the full presentation data including slides, theme, speaker notes, and metadata. These files are version-control-friendly and can be committed to your repository.

## 🤖 Copilot Extension

The `/slidemaker` Copilot Extension lets you generate presentations directly from GitHub Copilot Chat.

### What It Does

Type `/slidemaker <topic>` in any GitHub Copilot Chat window to generate a full presentation. The extension:
- Generates slides using the GitHub Models API
- Saves the presentation to your SlideМaker instance
- Returns a link to edit and present

### Usage Examples

```
/slidemaker Introduction to Rust
/slidemaker Kubernetes best practices --style technical --slides 8
/slidemaker Q3 product roadmap --style professional
```

### Installation

Follow the step-by-step guide in [docs/copilot-extension-setup.md](docs/copilot-extension-setup.md) to register the extension with your GitHub organization.

## 🤖 Copilot Coding Agent

SlideМaker integrates with GitHub Copilot's coding agent for autonomous issue resolution. When an issue is labeled with `squad:copilot`, the coding agent automatically picks it up, creates a branch, and opens a PR with the fix.

### How It Works

1. **Label an issue** with `squad:copilot` to assign it to the coding agent
2. **Automatic pickup** — The agent reads the issue, analyzes the code, and creates a fix
3. **Branch & PR** — Opens a `copilot/*` branch with a draft PR for review
4. **Review as usual** — Treat the PR like any team member's work

### Configuration

The coding agent uses:
- **Workflow setup:** [.github/copilot-setup-steps.yml](.github/copilot-setup-steps.yml) — Build and test steps for the agent's environment
- **Instructions:** [.github/copilot-instructions.md](.github/copilot-instructions.md) — Project context, conventions, and architecture notes
- **Auto-assignment:** [.github/workflows/squad-issue-assign.yml](.github/workflows/squad-issue-assign.yml) — Triggers agent assignment when `squad:copilot` label is applied

The agent follows the project's existing conventions, runs tests, and validates changes before opening PRs.

## 👥 Squad AI Team

SlideМaker uses a Squad AI team for collaborative development in GitHub Copilot sessions. The team consists of specialized agents (Lead, Frontend, Backend, Tester) with distinct roles, plus the coding agent for autonomous work.

### How It Works

The Squad team uses a label-based triage system:

1. **Add the `squad` label** to any issue
2. **Automatic triage** — The Lead agent analyzes the issue and assigns it to the best team member
3. **Member-specific labels** — Issues get tagged with `squad:{member}` (e.g., `squad:keyser`, `squad:copilot`)
4. **Work pickup** — In Copilot sessions, address the assigned member by name to start work

### Team Configuration

- **Team roster:** [.ai-team/team.md](.ai-team/team.md) — Lists all squad members and their roles
- **Agent configs:** [.github/agents/squad.agent.md](.github/agents/squad.agent.md) — Full team orchestration and member definitions
- **Label sync:** [.github/workflows/sync-squad-labels.yml](.github/workflows/sync-squad-labels.yml) — Auto-creates labels when roster changes
- **Triage workflow:** [.github/workflows/squad-triage.yml](.github/workflows/squad-triage.yml) — Routes issues to the right member

### Available Members

| Member | Role | Capability |
|--------|------|------------|
| **Keyser** | Lead | Architecture, decisions, code review |
| **Verbal** | Frontend Dev | React, UI, components |
| **McManus** | Backend Dev | APIs, database, services |
| **Fenster** | Tester | Tests, quality, edge cases |
| **@copilot** | Coding Agent | Autonomous bug fixes and small features |

### Coding Agent Capability Profile

The coding agent handles different types of work based on complexity:

- 🟢 **Good fit:** Bug fixes, test coverage, lint fixes, dependency updates, small features, scaffolding, doc fixes
- 🟡 **Needs review:** Medium features with clear specs, refactoring with tests, API additions  
- 🔴 **Not suitable:** Architecture decisions, multi-system design, ambiguous requirements, security-critical changes

Issues in the yellow/red zones may be triaged to squad members instead of @copilot, or will receive extra human review if assigned to the agent.

## 🔧 MCP Server

The MCP (Model Context Protocol) server exposes SlideМaker as tools for AI clients like Claude Desktop, GitHub Copilot CLI, and VS Code.

### Installation

```bash
npx @slidemaker/mcp-server
```

### Client Configuration

See [docs/mcp-setup.md](docs/mcp-setup.md) for detailed setup. Quick configs:

**VS Code** (`.vscode/mcp.json`):
```json
{
  "mcp": {
    "servers": {
      "slidemaker": {
        "command": "npx",
        "args": ["@slidemaker/mcp-server"],
        "env": {
          "SLIDEMAKER_API_URL": "http://localhost:3000"
        }
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "slidemaker": {
      "command": "npx",
      "args": ["@slidemaker/mcp-server"],
      "env": {
        "SLIDEMAKER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**GitHub Copilot CLI** (`copilot-mcp.json`):
```json
{
  "servers": {
    "slidemaker": {
      "command": "npx",
      "args": ["@slidemaker/mcp-server"],
      "env": {
        "SLIDEMAKER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Available Tools

| Tool | Description | Required Args |
|------|-------------|---------------|
| `create_presentation` | Generate a new presentation with AI | `topic` |
| `list_presentations` | List all saved presentations | — |
| `get_presentation` | Get full details of a presentation | `slug` |
| `delete_presentation` | Delete a presentation by slug | `slug` |

### Quick Examples

```
> Create a presentation about TypeScript generics
# Calls create_presentation with topic="TypeScript generics"

> List my presentations
# Calls list_presentations

> Show me the kubernetes-overview presentation
# Calls get_presentation with slug="kubernetes-overview"

> Delete the old draft
# Calls delete_presentation with slug="old-draft"
```

The MCP server authenticates using `SLIDEMAKER_TOKEN`, `GITHUB_TOKEN`, or the `gh auth token` CLI output (in that priority order).

## 📡 API Reference

> **Auth:** All API endpoints (except `/api/auth/*`) require authentication when OAuth is enabled. Pass a GitHub token as a Bearer token: `Authorization: Bearer <token>`. CORS is enabled for all `/api/*` routes — see [Environment Variables](#-environment-variables) for configuration.

### `POST /api/generate`

Generate slides using AI.

**Request:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "Content-Type: application/json" \
  -d '{"topic": "TypeScript best practices", "numSlides": 5, "style": "technical"}'
```

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

```bash
curl -H "Authorization: Bearer $(gh auth token)" \
  http://localhost:3000/api/presentations
```

### `POST /api/presentations`

Create a new presentation.

```bash
curl -X POST http://localhost:3000/api/presentations \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Deck", "slides": [{"title": "Intro", "content": "<h1>Hello</h1>"}]}'
```

### `GET /api/presentations/[slug]`

Get a full presentation by slug, including all slides.

```bash
curl -H "Authorization: Bearer $(gh auth token)" \
  http://localhost:3000/api/presentations/my-deck
```

### `PUT /api/presentations/[slug]`

Update a presentation (title, slides, theme, transition).

```bash
curl -X PUT http://localhost:3000/api/presentations/my-deck \
  -H "Authorization: Bearer $(gh auth token)" \
  -H "Content-Type: application/json" \
  -d '{"theme": "moon"}'
```

### `DELETE /api/presentations/[slug]`

Delete a presentation.

```bash
curl -X DELETE http://localhost:3000/api/presentations/my-deck \
  -H "Authorization: Bearer $(gh auth token)"
```

### `POST /api/copilot/skillset`

GitHub Copilot Extension endpoint. Receives a Copilot skill invocation, generates a presentation, and returns a chat response.

**Request body** (Copilot message format):
```json
{
  "messages": [
    { "role": "user", "content": "Introduction to Rust --style technical --slides 8" }
  ]
}
```

**Auth:** Uses `X-GitHub-Token` header (provided automatically by Copilot).

## 🧑‍💻 Development

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

### 🧪 E2E Testing

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

## 🚢 Deployment

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) (for Azure deployment)
- A [GitHub account](https://github.com) with a personal access token or `gh auth login`

### Local Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# App is available at http://localhost:3000
```

Add your environment variables to `.env.local` — the compose file mounts it automatically. The `presentations/` directory is mounted as a volume for persistent storage.

### Azure Deployment via Bicep

The `infra/` directory contains Bicep templates that provision:
- **Azure Container Registry** — stores the Docker image
- **Azure Container Apps** — runs the app with auto-scaling (0–3 replicas)
- **Azure Blob Storage** — persists presentations in the cloud
- **Log Analytics Workspace** — application logging
- **User-assigned Managed Identity** — secure, keyless auth between services

```bash
# Create a resource group
az group create --name slidemaker-rg --location eastus2

# Deploy infrastructure
az deployment group create \
  --resource-group slidemaker-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.bicepparam

# Build and push the container image
az acr build \
  --registry <acr-name-from-output> \
  --image slidemaker:latest .

# Update the container app with the new image
az containerapp update \
  --name slidemaker-app \
  --resource-group slidemaker-rg \
  --image <acr-login-server>/slidemaker:latest
```

### CI/CD Pipeline

Set up GitHub Actions for automated deployment:

1. Configure Azure credentials as repository secrets
2. On push to `main`, the pipeline builds the Docker image, pushes to ACR, and updates the Container App
3. PR checks run `npm run build`, `npm test`, and `npm run lint`

### 🌍 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | No* | — | GitHub token for AI generation (GitHub Models API) |
| `AUTH_GITHUB_ID` | No | — | GitHub OAuth App Client ID (enables authentication) |
| `AUTH_GITHUB_SECRET` | With `AUTH_GITHUB_ID` | — | GitHub OAuth App Client Secret |
| `AUTH_SECRET` | In production | Auto-generated in dev | Session encryption key for Auth.js |
| `NEXTAUTH_URL` | In production | `http://localhost:3000` | Canonical app URL |
| `AZURE_STORAGE_CONNECTION_STRING` | No | — | Azure Blob Storage connection string |
| `AZURE_STORAGE_ACCOUNT_NAME` | No | — | Azure Storage account name (uses `DefaultAzureCredential`) |
| `AZURE_STORAGE_CONTAINER_NAME` | No | `presentations` | Blob container name for presentation storage |
| `CORS_ALLOWED_ORIGINS` | No | `*` in dev | Comma-separated allowed origins (e.g. `https://app.example.com`) |
| `NODE_ENV` | No | `development` | `production` or `development` |
| `SLIDEMAKER_API_URL` | MCP only | `http://localhost:3000` | API base URL for the MCP server |
| `SLIDEMAKER_TOKEN` | MCP only | — | Auth token override for the MCP server |

\* *If `GITHUB_TOKEN` is not set, the app falls back to `gh auth token` CLI output for zero-config local development.*

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Clients                           │
│                                                     │
│  Browser ──── Copilot Chat ──── Claude/MCP Client   │
└────┬──────────────┬──────────────────┬──────────────┘
     │              │                  │
     │    ┌─────────▼─────────┐  ┌────▼──────────────┐
     │    │ Copilot Extension │  │    MCP Server      │
     │    │  /slidemaker cmd  │  │ @slidemaker/mcp    │
     │    └─────────┬─────────┘  └────┬──────────────┘
     │              │                  │
     ▼              ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              Next.js App (API Routes)               │
│                                                     │
│  /api/generate ─── /api/presentations ─── /api/auth │
│  /api/copilot/skillset                              │
│                                                     │
│  Middleware: CORS · Auth · Rate Limiting            │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  ┌──────────────┐        ┌──────────────────┐
  │  Local Files │        │  Azure Blob      │
  │ presentations/│        │  Storage         │
  └──────────────┘        └──────────────────┘
```

### Component Overview

| Component | Description |
|-----------|-------------|
| **Next.js App** | React 19 frontend + API routes. Serves the UI, handles AI generation, presentation CRUD, and auth |
| **MCP Server** | Standalone Node.js process (`packages/mcp-server/`). Exposes `create`, `list`, `get`, `delete` tools over stdio |
| **Copilot Extension** | Skillset endpoint (`/api/copilot/skillset`) that receives Copilot messages and returns presentation links |
| **Storage Layer** | Pluggable: local filesystem (`presentations/`) in dev, Azure Blob Storage in production |
| **Auth** | Auth.js v5 with GitHub OAuth. Bearer token support for API clients. Dev mode bypass when unconfigured |

## 📁 Project Structure

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
│   │   ├── ThemePicker.tsx             # Theme selector dropdown
│   │   ├── AuthProvider.tsx            # Auth.js session provider
│   │   └── UserMenu.tsx               # Sign-in / avatar / dev mode
│   └── api/
│       ├── generate/route.ts           # AI slide generation
│       ├── auth/[...nextauth]/route.ts # Auth.js route handler
│       ├── copilot/skillset/route.ts   # Copilot Extension endpoint
│       └── presentations/
│           ├── route.ts                # List + Create
│           └── [slug]/route.ts         # Read + Update + Delete
├── lib/
│   ├── types.ts                        # Shared TypeScript interfaces
│   ├── openai.ts                       # GitHub Models API client
│   ├── storage.ts                      # Storage abstraction (local/Azure)
│   ├── auth-utils.ts                   # Bearer token & rate limiting
│   ├── presentation-service.ts         # Shared generation + persistence
│   └── reveal-themes.ts               # Theme definitions
├── auth.ts                             # Auth.js configuration
├── middleware.ts                       # CORS + auth middleware
packages/
└── mcp-server/                         # MCP server package
    └── src/
        ├── index.ts                    # Server entry point
        ├── api.ts                      # HTTP client for SlideМaker API
        └── tools/                      # Tool implementations
            ├── create.ts
            ├── list.ts
            ├── get.ts
            └── delete.ts
infra/
├── main.bicep                          # Azure infrastructure (Bicep)
└── main.bicepparam                     # Default parameters
docs/
└── mcp-configs/                        # Example MCP client configs
presentations/                          # JSON file storage (local dev)
```

## 📄 License

MIT
