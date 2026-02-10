import { apiRequest } from "../api.js";

export const deletePresentationTool = {
  name: "delete_presentation",
  description: "Delete a presentation by its slug.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description: "The URL slug of the presentation to delete",
      },
    },
    required: ["slug"],
  },
};

export async function handleDeletePresentation(
  args: { slug: string },
  baseUrl: string,
  token: string
) {
  if (!args.slug || typeof args.slug !== "string") {
    throw new Error("slug is required and must be a string");
  }

  await apiRequest<{ message: string }>(
    baseUrl,
    `/api/presentations/${encodeURIComponent(args.slug)}`,
    token,
    { method: "DELETE" }
  );

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ success: true }, null, 2),
      },
    ],
  };
}
