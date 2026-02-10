import { apiRequest } from "../api.js";

export const listPresentationsTool = {
  name: "list_presentations",
  description:
    "List all saved presentations. Returns titles, URLs, slide counts, and last-updated timestamps.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

interface PresentationSummary {
  id: string;
  title: string;
  slides: unknown[];
  updatedAt: string;
}

export async function handleListPresentations(
  _args: Record<string, never>,
  baseUrl: string,
  token: string
) {
  const data = await apiRequest<PresentationSummary[]>(
    baseUrl,
    "/api/presentations",
    token
  );

  const presentations = data.map((p) => ({
    title: p.title,
    url: `${baseUrl}/p/${p.id}`,
    slideCount: p.slides.length,
    updatedAt: p.updatedAt,
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ presentations }, null, 2),
      },
    ],
  };
}
