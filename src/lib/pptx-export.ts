"use client";

import pptxgen from "pptxgenjs";
import type { Presentation } from "@/lib/types";

/** Strip HTML tags and decode common entities for plain-text extraction */
function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent ?? tmp.innerText ?? "";
}

/** Extract bullet items from HTML content (li elements, or paragraphs) */
function extractBullets(html: string): string[] {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const items = tmp.querySelectorAll("li");
  if (items.length > 0) {
    return Array.from(items).map((li) => li.textContent?.trim() ?? "");
  }
  // Fall back to paragraphs
  const paragraphs = tmp.querySelectorAll("p");
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map((p) => p.textContent?.trim() ?? "")
      .filter(Boolean);
  }
  // Fall back to plain text lines
  const text = stripHtml(html);
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Parse a CSS gradient string to extract the first color for PPTX background */
function parseGradientColor(gradient: string): string {
  const match = gradient.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
  return match ? match[0] : "#1a1a2e";
}

export async function exportToPptx(presentation: Presentation): Promise<void> {
  const pptx = new pptxgen();

  pptx.title = presentation.title;
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches

  for (const slide of presentation.slides) {
    const pptxSlide = pptx.addSlide();

    // Set background
    if (slide.backgroundGradient) {
      pptxSlide.background = {
        color: parseGradientColor(slide.backgroundGradient).replace("#", ""),
      };
    } else if (slide.backgroundColor) {
      pptxSlide.background = {
        color: slide.backgroundColor.replace("#", ""),
      };
    } else {
      pptxSlide.background = { color: "1a1a2e" };
    }

    // Add speaker notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes);
    }

    const isCenter =
      slide.layout === "center" || !slide.title;
    const contentText = stripHtml(slide.content);

    if (isCenter && !slide.title) {
      // Cover / section / impact slide — large centered text
      const titleText = stripHtml(slide.content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? slide.content);
      const subtitle = stripHtml(
        slide.content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "")
      ).trim();

      pptxSlide.addText(titleText, {
        x: "10%",
        y: subtitle ? "30%" : "35%",
        w: "80%",
        h: "30%",
        fontSize: 36,
        color: "FFFFFF",
        bold: true,
        align: "center",
        valign: "middle",
      });

      if (subtitle) {
        pptxSlide.addText(subtitle, {
          x: "15%",
          y: "60%",
          w: "70%",
          h: "15%",
          fontSize: 18,
          color: "BBBBBB",
          align: "center",
          valign: "top",
        });
      }
    } else {
      // Content slide with title
      if (slide.title) {
        pptxSlide.addText(slide.title, {
          x: "5%",
          y: "5%",
          w: "90%",
          h: "15%",
          fontSize: 28,
          color: "FFFFFF",
          bold: true,
        });
      }

      // Try to extract bullets for better formatting
      const bullets = extractBullets(slide.content);
      if (bullets.length > 1) {
        pptxSlide.addText(
          bullets.map((b) => ({
            text: b,
            options: {
              bullet: true,
              fontSize: 18,
              color: "DDDDDD",
              breakType: "none" as const,
              paraSpaceAfter: 8,
            },
          })),
          {
            x: "5%",
            y: "22%",
            w: "90%",
            h: "70%",
            valign: "top",
          }
        );
      } else {
        pptxSlide.addText(contentText, {
          x: "5%",
          y: "22%",
          w: "90%",
          h: "70%",
          fontSize: 18,
          color: "DDDDDD",
          valign: "top",
        });
      }
    }
  }

  const filename = `${presentation.title.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "presentation"}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
