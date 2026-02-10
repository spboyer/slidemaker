import { NextRequest, NextResponse } from "next/server";
import type { Slide } from "@/lib/types";
import { getStorage } from "@/lib/storage";

const DEFAULT_USER = "local";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function GET() {
  try {
    const storage = getStorage();
    const presentations = await storage.listPresentations(DEFAULT_USER);
    return NextResponse.json(presentations);
  } catch (error) {
    console.error("Error listing presentations:", error);
    return NextResponse.json(
      { error: "Failed to list presentations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title is required and must be a string" },
        { status: 400 }
      );
    }

    if (body.slides !== undefined && !Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: "Slides must be an array" },
        { status: 400 }
      );
    }

    const slides: Slide[] = body.slides ?? [];
    const slug = generateSlug(body.title);

    if (!slug) {
      return NextResponse.json(
        { error: "Title must contain at least one alphanumeric character" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const presentation = {
      id: slug,
      title: body.title,
      createdAt: now,
      updatedAt: now,
      slides,
    };

    const storage = getStorage();
    await storage.savePresentation(DEFAULT_USER, slug, presentation);

    return NextResponse.json(presentation, { status: 201 });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 }
    );
  }
}
