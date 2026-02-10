import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Presentation, Slide, SlideTransition } from "@/lib/types";

const PRESENTATIONS_DIR = path.join(process.cwd(), "presentations");

function getFilePath(slug: string): string {
  return path.join(PRESENTATIONS_DIR, `${slug}.json`);
}

async function readPresentation(slug: string): Promise<Presentation | null> {
  try {
    const filePath = getFilePath(slug);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as Presentation;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const presentation = await readPresentation(slug);

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
    const existing = await readPresentation(slug);

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

    const filePath = getFilePath(slug);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), "utf-8");

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
    const filePath = getFilePath(slug);

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    await fs.unlink(filePath);
    return NextResponse.json({ message: "Presentation deleted" });
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return NextResponse.json(
      { error: "Failed to delete presentation" },
      { status: 500 }
    );
  }
}
