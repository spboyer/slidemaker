# GitHub Copilot Extension Setup for SlideМaker

This guide walks through registering SlideМaker as a GitHub Copilot Extension so users can invoke it directly from Copilot Chat with `/slidemaker`.

---

## Prerequisites

- A deployed SlideМaker instance (e.g. on Azure Container Apps) with a public HTTPS URL
- A GitHub account with permission to create GitHub Apps
- The `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` environment variables set on the deployed instance

---

## 1. Create the GitHub App

1. Go to **GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App**
2. Fill in the required fields:

| Field | Value |
|---|---|
| **GitHub App name** | `slidemaker` (or your preferred name) |
| **Homepage URL** | Your deployed app URL (e.g. `https://slidemaker.example.com`) |
| **Callback URL** | `https://<your-deployed-url>/api/copilot/skillset` |
| **Webhook** | Uncheck "Active" (not needed) |

3. Under **Permissions**, grant:
   - No additional repository or account permissions are required for a Copilot-only extension.

4. Click **Create GitHub App**.

---

## 2. Enable Copilot Agent

1. On the GitHub App settings page, navigate to the **Copilot** tab (left sidebar).
2. Set **App Type** to **"Agent"**.
3. Set the **URL** to:
   ```
   https://<your-deployed-url>/api/copilot/skillset
   ```
4. In the **Inference description**, enter:
   ```
   Create AI-powered slide presentations with reveal.js
   ```
5. Click **Save**.

---

## 3. Define the Skill

The skill schema is defined in [`copilot-extension.json`](../copilot-extension.json) at the project root. The endpoint at `POST /api/copilot/skillset` handles incoming Copilot messages.

### Skill Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `topic` | string | ✅ | Topic for the presentation |
| `style` | string | ❌ | One of: `professional`, `creative`, `minimal`, `technical` |
| `numSlides` | number | ❌ | Number of slides (1–20, default 5) |

---

## 4. Install the Extension

### For Personal Use
1. Go to your GitHub App's page: `https://github.com/apps/<your-app-name>`
2. Click **Install** and select your personal account.
3. Open **GitHub Copilot Chat** (in VS Code, GitHub.com, or any supported IDE).
4. Type `/slidemaker` to invoke the extension.

### For an Organization
1. An org owner navigates to `https://github.com/apps/<your-app-name>`
2. Click **Install** and select the organization.
3. In the org settings under **Copilot → Policies**, ensure third-party extensions are allowed.
4. All org members with Copilot access can now use `/slidemaker`.

---

## 5. Usage Examples

Once installed, use SlideМaker directly in Copilot Chat:

```
/slidemaker Introduction to Rust
```
Creates a 5-slide presentation about Rust with the default style.

```
/slidemaker Kubernetes Networking --style technical --slides 8
```
Creates 8 technical slides about Kubernetes networking.

```
/slidemaker Quarterly Business Review --style professional
```
Creates a professional-style presentation for a QBR.

```
/slidemaker React Server Components --style minimal --slides 3
```
Creates a minimal 3-slide overview of RSC.

### Flag Reference

| Flag | Description | Example |
|---|---|---|
| `--style <name>` | Set presentation style | `--style technical` |
| `--slides <N>` | Number of slides (1–20) | `--slides 8` |

Flags can appear in any order after the topic.

---

## 6. Testing

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Send a test request to the skillset endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/copilot/skillset \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [
         { "role": "user", "content": "Introduction to TypeScript --style technical --slides 3" }
       ]
     }'
   ```

3. Verify the response contains a `messages` array with a success message, edit link, and slide listing.

### Testing with Copilot Chat

1. Install the GitHub App on your account (see step 4).
2. Open Copilot Chat in VS Code or on GitHub.com.
3. Type `/slidemaker Hello World` and verify a presentation is created.
4. Click the edit link in the response to confirm the presentation loaded correctly.

---

## 7. Troubleshooting

### "Missing X-GitHub-Token header"
- The request is missing authentication. Ensure the GitHub App is correctly configured as a Copilot agent and that the callback URL is correct.
- In local dev without `AUTH_GITHUB_ID` set, token validation is skipped (dev mode).

### "Invalid or expired GitHub token"
- The `X-GitHub-Token` sent by Copilot could not be verified against the GitHub API.
- Ensure `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` are set correctly on your deployed instance.

### "No topic provided"
- The user message was empty or only contained flags. Ensure a topic is provided before any `--style` or `--slides` flags.

### Extension not appearing in Copilot Chat
- Verify the GitHub App has the **Copilot Agent** type enabled.
- Ensure the app is installed on your account or organization.
- Check that the callback URL is reachable and returns a valid response.
- Wait a few minutes after installation — propagation can take a moment.

### Rate limit errors (⏳)
- The underlying AI model returned a 429 response. Wait a moment and try again.

### Presentation created but edit link is broken
- Check that `NEXTAUTH_URL` (or `VERCEL_URL`) is set correctly on the deployed instance so the generated URLs point to the right host.

---

## Architecture Overview

```
Copilot Chat ──► GitHub ──► POST /api/copilot/skillset
                                    │
                            parseSkillsetMessage()
                                    │
                       generateAndCreatePresentation()
                                    │
                            ┌───────┴───────┐
                            │  OpenAI API   │
                            │  (gpt-4o)     │
                            └───────┬───────┘
                                    │
                          Persists to /presentations/
                                    │
                          Returns edit URL + slide list
```

The endpoint receives the Copilot messages payload, extracts the last user message, parses topic and flags, generates the presentation via OpenAI, saves it to disk, and returns a formatted response with an edit link.
