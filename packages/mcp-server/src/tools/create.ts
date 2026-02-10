import { apiRequest } from "../api.js";

export const createPresentationTool = {
  name: "create_presentation",
  description:
    "Generate a new presentation with AI. Provide a topic and optionally a style and number of slides.",
  inputSchema: {
    type: "object" as const,
    properties: {
      topic: {
        type: "string",
        description: "The topic or subject for the presentation",
      },
      style: {
        type: "string",
        enum: ["professional", "creative", "minimal", "technical"],
        description:
          "Presentation style (default: professional). Controls tone, layout, and visual design.",
      },
      numSlides: {
        type: "number",
        description: "Number of slides to generate (1-20, default: 5)",
      },
    },
    required: ["topic"],
  },
};

interface CreateInput {
  topic: string;
  style?: string;
  numSlides?: number;
}

interface GenerateResponse {
  slides: Array<{ title: string; content: string }>;
  suggestedTheme?: string;
}

interface PresentationResponse {
  id: string;
  title: string;
  slides: Array<{ title: string; content: string }>;
  theme?: string;
}

export async function handleCreatePresentation(
  args: CreateInput,
  baseUrl: string,
  token: string
) {
  if (!args.topic || typeof args.topic !== "string") {
    throw new Error("topic is required and must be a string");
  }

  if (
    args.numSlides !== undefined &&
    (typeof args.numSlides !== "number" || args.numSlides < 1 || args.numSlides > 20)
  ) {
    throw new Error("numSlides must be a number between 1 and 20");
  }

  if (
    args.style !== undefined &&
    !["professional", "creative", "minimal", "technical"].includes(args.style)
  ) {
    throw new Error(
      "style must be one of: professional, creative, minimal, technical"
    );
  }

  // Step 1: Generate slides via AI
  const generateBody: Record<string, unknown> = { topic: args.topic };
  if (args.style) generateBody.style = args.style;
  if (args.numSlides) generateBody.numSlides = args.numSlides;

  const generated = await apiRequest<GenerateResponse>(
    baseUrl,
    "/api/generate",
    token,
    { method: "POST", body: generateBody }
  );

  // Step 2: Save the presentation
  const title = args.topic;
  const presentation = await apiRequest<PresentationResponse>(
    baseUrl,
    "/api/presentations",
    token,
    {
      method: "POST",
      body: {
        title,
        slides: generated.slides,
        theme: generated.suggestedTheme,
      },
    }
  );

  const slug = presentation.id;
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            url: `${baseUrl}/p/${slug}`,
            title: presentation.title,
            slideCount: presentation.slides.length,
            theme: generated.suggestedTheme ?? "black",
            slides: presentation.slides.map((s) => s.title),
          },
          null,
          2
        ),
      },
    ],
  };
}
