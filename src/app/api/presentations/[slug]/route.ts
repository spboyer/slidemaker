import { NextRequest, NextResponse } from "next/server";
import type { Presentation, Slide, SlideTransition } from "@/lib/types";
import { getStorage } from "@/lib/storage";

const DEFAULT_USER = "local";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storage = getStorage();
    const presentation = await storage.getPresentation(DEFAULT_USER, slug);

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(presentation);
  } catch (error) {
    console.error("Error reading presentation:", error);
    return NextResponse.json(
      { error: "Failed to read presentation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storage = getStorage();
    const existing = await storage.getPresentation(DEFAULT_USER, slug);

    if (!existing) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (body.title !== undefined && typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Title must be a string" },
        { status: 400 }
      );
    }

    if (body.slides !== undefined && !Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: "Slides must be an array" },
        { status: 400 }
      );
    }

    const updated: Presentation = {
      ...existing,
      title: (body.title as string) ?? existing.title,
      slides: (body.slides as Slide[]) ?? existing.slides,
      theme: (body.theme as string) ?? existing.theme,
      transition: (body.transition as SlideTransition) ?? existing.transition,
      updatedAt: new Date().toISOString(),
    };

    await storage.savePresentation(DEFAULT_USER, slug, updated);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating presentation:", error);
    return NextResponse.json(
      { error: "Failed to update presentation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const storage = getStorage();
    const deleted = await storage.deletePresentation(DEFAULT_USER, slug);

    if (!deleted) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Presentation deleted" });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
