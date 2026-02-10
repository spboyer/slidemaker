import { NextRequest, NextResponse } from "next/server";
import {
  generateAndCreatePresentation,
  VALID_STYLES,
  type PresentationStyle,
} from "@/lib/presentation-service";
import { validateBearerToken } from "@/lib/auth-utils";

/**
 * Parse the user's message for topic, --style, and --slides flags.
 * Example: "Introduction to Rust --style technical --slides 8"
 */
function parseSkillsetMessage(message: string): {
  topic: string;
  style?: PresentationStyle;
  numSlides?: number;
} {
  let remaining = message.trim();

  // Extract --slides <N>
  let numSlides: number | undefined;
  const slidesMatch = remaining.match(/--slides\s+(\d+)/i);
  if (slidesMatch) {
    numSlides = parseInt(slidesMatch[1], 10);
    if (numSlides < 1 || numSlides > 20) numSlides = undefined;
    remaining = remaining.replace(slidesMatch[0], "");
  }

  // Extract --style <style>
  let style: PresentationStyle | undefined;
  const styleMatch = remaining.match(/--style\s+(\S+)/i);
  if (styleMatch) {
    const candidate = styleMatch[1].toLowerCase();
    if (VALID_STYLES.includes(candidate as PresentationStyle)) {
      style = candidate as PresentationStyle;
    }
    remaining = remaining.replace(styleMatch[0], "");
  }

  // Strip leading slash command prefix (e.g. "/slidemaker")
  remaining = remaining.replace(/^\/\S+\s*/, "");

  const topic = remaining.trim();

  return { topic, style, numSlides };
}

/**
 * Build the public edit URL for a presentation.
 */
function getEditUrl(slug: string): string {
  const base =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/presentation/${slug}`;
}

/**
 * POST /api/copilot/skillset
 *
 * Receives a GitHub Copilot Extension skill invocation, generates a
 * presentation, persists it, and returns a formatted chat response.
 */
export async function POST(request: NextRequest) {
  // --- Auth: validate X-GitHub-Token header ---
  const githubToken = request.headers.get("x-github-token");

  // When AUTH_GITHUB_ID is set, we require a valid token.
  // Otherwise allow all requests (dev mode).
  const authEnabled = !!process.env.AUTH_GITHUB_ID;
  if (authEnabled) {
    if (!githubToken) {
      return NextResponse.json(
        {
          messages: [
            {
              role: "assistant",
              content: "❌ Missing X-GitHub-Token header. Authentication required.",
            },
          ],
        },
        { status: 401 },
      );
    }

    const user = await validateBearerToken(githubToken);
    if (!user) {
      return NextResponse.json(
        {
          messages: [
            {
              role: "assistant",
              content: "❌ Invalid or expired GitHub token.",
            },
          ],
        },
        { status: 401 },
      );
    }
  }

  try {
    const body = await request.json();

    // Extract the last user message from the Copilot messages array
    const messages: Array<{ role: string; content: string }> =
      body.messages ?? [];
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (!lastUserMessage?.content) {
      return NextResponse.json({
        messages: [
          {
            role: "assistant",
            content:
              "❌ No topic provided. Usage: `/slidemaker <topic> [--style professional|creative|minimal|technical] [--slides N]`",
          },
        ],
      });
    }

    const { topic, style, numSlides } = parseSkillsetMessage(
      lastUserMessage.content,
    );

    if (!topic) {
      return NextResponse.json({
        messages: [
          {
            role: "assistant",
            content:
              "❌ No topic provided. Usage: `/slidemaker <topic> [--style professional|creative|minimal|technical] [--slides N]`",
          },
        ],
      });
    }

    // Generate and create the presentation
    const result = await generateAndCreatePresentation({
      topic,
      style,
      numSlides,
    });

    const editUrl = getEditUrl(result.presentation.id);
    const slideCount = result.slides.length;
    const theme = result.suggestedTheme ?? "black";

    // Build slide listing
    const slideListing = result.slides
      .map((s, i) => `${i + 1}. ${s.title || "(untitled)"}`)
      .join("\n");

    const responseContent = `✅ Created "${topic}" (${slideCount} slides, ${theme} theme)\n\n🔗 [Edit presentation](${editUrl})\n\n📊 Slides:\n${slideListing}`;

    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: responseContent,
        },
      ],
    });
  } catch (error: unknown) {
    console.error("Copilot skillset error:", error);

    // Map known error types to friendly messages
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number };

      if (apiError.status === 429) {
        return NextResponse.json({
          messages: [
            {
              role: "assistant",
              content:
                "⏳ Rate limit exceeded. Please wait a moment and try again.",
            },
          ],
        });
      }

      if (apiError.status === 401) {
        return NextResponse.json(
          {
            messages: [
              {
                role: "assistant",
                content:
                  "❌ AI authentication failed. Check your GitHub token configuration.",
              },
            ],
          },
          { status: 401 },
        );
      }
    }

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json({
      messages: [
        {
          role: "assistant",
          content: `❌ Failed to create presentation: ${message}\n\n💡 Try again or simplify your topic.`,
        },
      ],
    });
  }
}
