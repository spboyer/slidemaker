import { apiRequest } from "../api.js";

export const getPresentationTool = {
  name: "get_presentation",
  description:
    "Get full details of a presentation by its slug, including all slide titles and content.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description: "The URL slug of the presentation",
      },
    },
    required: ["slug"],
  },
};

interface PresentationDetail {
  id: string;
  title: string;
  theme?: string;
  slides: Array<{ title: string; content: string }>;
}

export async function handleGetPresentation(
  args: { slug: string },
  baseUrl: string,
  token: string
) {
  if (!args.slug || typeof args.slug !== "string") {
    throw new Error("slug is required and must be a string");
  }

  const data = await apiRequest<PresentationDetail>(
    baseUrl,
    `/api/presentations/${encodeURIComponent(args.slug)}`,
    token
  );

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            title: data.title,
            theme: data.theme ?? "black",
            slideCount: data.slides.length,
            slides: data.slides.map((s) => ({
              title: s.title,
              content: s.content,
            })),
            url: `${baseUrl}/p/${data.id}`,
          },
          null,
          2
        ),
      },
    ],
  };
}
