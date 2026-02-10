import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Presentation, Slide } from "@/lib/types";

const PRESENTATIONS_DIR = path.join(process.cwd(), "presentations");

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function ensureDir() {
  await fs.mkdir(PRESENTATIONS_DIR, { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    const files = await fs.readdir(PRESENTATIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const presentations = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(PRESENTATIONS_DIR, file);
        const data = JSON.parse(await fs.readFile(filePath, "utf-8")) as Presentation;
        return {
          id: data.id,
          title: data.title,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          slideCount: data.slides.length,
        };
      })
    );

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

    await ensureDir();

    const now = new Date().toISOString();
    const presentation: Presentation = {
      id: slug,
      title: body.title,
      createdAt: now,
      updatedAt: now,
      slides,
    };

    const filePath = path.join(PRESENTATIONS_DIR, `${slug}.json`);
    await fs.writeFile(filePath, JSON.stringify(presentation, null, 2), "utf-8");

    return NextResponse.json(presentation, { status: 201 });
  } catch (error) {
    console.error("Error creating presentation:", error);
    return NextResponse.json(
      { error: "Failed to create presentation" },
      { status: 500 }
    );
  }
}
