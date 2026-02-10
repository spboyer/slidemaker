import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import type { Slide } from "@/lib/types";

const SYSTEM_PROMPT = `You are a presentation slide generator. Given a topic (and optionally existing slides for context), generate presentation slides.

Return a JSON object with a single key "slides" containing an array of slide objects.

Each slide object must have:
- "title": string — a concise slide title
- "content": string — slide body content in Markdown format
- "notes": string — brief speaker notes for this slide

Make the content informative, well-structured, and suitable for a professional presentation. Use bullet points, numbered lists, and short paragraphs in the Markdown content. Each slide should cover a distinct aspect of the topic.

When existing slides are provided, generate new slides that complement and extend the existing deck without repeating covered material.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.topic || typeof body.topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    const numSlides = body.numSlides ?? 5;

    if (typeof numSlides !== "number" || numSlides < 1 || numSlides > 20) {
      return NextResponse.json(
        { error: "numSlides must be a number between 1 and 20" },
        { status: 400 }
      );
    }

    let userMessage = `Generate ${numSlides} slides about: ${body.topic}`;

    if (body.existingSlides && Array.isArray(body.existingSlides)) {
      userMessage += `\n\nExisting slides in the deck (generate slides that complement these):\n${JSON.stringify(body.existingSlides, null, 2)}`;
    }

    let client;
    try {
      client = getOpenAIClient();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize AI client. Check your GitHub authentication.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const response = await client.chat.completions.create({
      model: "openai/gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as { slides: Slide[] };

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      return NextResponse.json(
        { error: "Invalid response format from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slides: parsed.slides });
  } catch (error: unknown) {
    console.error("Error generating slides:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };

      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (apiError.status === 401) {
        return NextResponse.json(
          {
            error:
              "Invalid or expired GitHub token. Run 'gh auth login' or check your GITHUB_TOKEN.",
          },
          { status: 401 }
        );
      }
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate slides" },
      { status: 500 }
    );
  }
}
