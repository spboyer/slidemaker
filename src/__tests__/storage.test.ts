/**
 * SlideMaker — Storage Abstraction Tests (Phase 2)
 *
 * Tests for the storage abstraction layer (LocalFileStorage, factory).
 * Run with: npm test
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import type { Presentation } from "@/lib/types";

// ─── TC-10.x: Storage Abstraction ───────────────────────────────────────────

describe("LocalFileStorage", () => {
  const TEMP_ROOT = path.join(
    process.env.TEMP || process.env.TMPDIR || "/tmp",
    "slidemaker-storage-test-" + Date.now()
  );

  let originalCwd: typeof process.cwd;

  beforeAll(async () => {
    await fs.mkdir(TEMP_ROOT, { recursive: true });
    originalCwd = process.cwd;
    process.cwd = () => TEMP_ROOT;
  });

  beforeEach(async () => {
    const presDir = path.join(TEMP_ROOT, "presentations");
    try {
      const files = await fs.readdir(presDir);
      for (const f of files) {
        await fs.unlink(path.join(presDir, f));
      }
    } catch {
      // dir may not exist yet
    }
  });

  afterAll(async () => {
    process.cwd = originalCwd;
    await fs.rm(TEMP_ROOT, { recursive: true, force: true });
  });

  async function getStorage() {
    const mod = await import("@/lib/storage");
    return new mod.LocalFileStorage();
  }

  const samplePresentation: Presentation = {
    id: "test-deck",
    title: "Test Deck",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    slides: [
      { title: "Slide 1", content: "Content 1" },
      { title: "Slide 2", content: "Content 2" },
    ],
  };

  test("TC-10.1: reads/writes presentations correctly", async () => {
    const storage = await getStorage();
    await storage.savePresentation("user1", "test-deck", samplePresentation);
    const result = await storage.getPresentation("user1", "test-deck");
    expect(result).not.toBeNull();
    expect(result!.id).toBe("test-deck");
    expect(result!.title).toBe("Test Deck");
    expect(result!.slides).toHaveLength(2);
    expect(result!.slides[0].title).toBe("Slide 1");
  });

  test("TC-10.2: list returns all presentations", async () => {
    const storage = await getStorage();
    await storage.savePresentation("user1", "deck-a", {
      ...samplePresentation,
      id: "deck-a",
      title: "Deck A",
    });
    await storage.savePresentation("user1", "deck-b", {
      ...samplePresentation,
      id: "deck-b",
      title: "Deck B",
    });

    const list = await storage.listPresentations("user1");
    expect(list).toHaveLength(2);
    const ids = list.map((p) => p.id).sort();
    expect(ids).toEqual(["deck-a", "deck-b"]);
    expect(list[0].slideCount).toBe(2);
  });

  test("TC-10.3: delete removes file", async () => {
    const storage = await getStorage();
    await storage.savePresentation("user1", "to-delete", {
      ...samplePresentation,
      id: "to-delete",
    });

    const before = await storage.getPresentation("user1", "to-delete");
    expect(before).not.toBeNull();

    const deleted = await storage.deletePresentation("user1", "to-delete");
    expect(deleted).toBe(true);

    const after = await storage.getPresentation("user1", "to-delete");
    expect(after).toBeNull();
  });

  test("TC-10.3b: delete non-existent file returns false", async () => {
    const storage = await getStorage();
    const result = await storage.deletePresentation("user1", "nope");
    expect(result).toBe(false);
  });

  test("TC-10.1b: get non-existent returns null", async () => {
    const storage = await getStorage();
    const result = await storage.getPresentation("user1", "missing");
    expect(result).toBeNull();
  });

  test("save -> get -> list -> delete lifecycle", async () => {
    const storage = await getStorage();
    const pres: Presentation = {
      ...samplePresentation,
      id: "lifecycle",
      title: "Lifecycle Test",
    };

    await storage.savePresentation("user1", "lifecycle", pres);

    const fetched = await storage.getPresentation("user1", "lifecycle");
    expect(fetched).not.toBeNull();
    expect(fetched!.title).toBe("Lifecycle Test");

    const list = await storage.listPresentations("user1");
    expect(list.some((p) => p.id === "lifecycle")).toBe(true);

    const deleted = await storage.deletePresentation("user1", "lifecycle");
    expect(deleted).toBe(true);

    const listAfter = await storage.listPresentations("user1");
    expect(listAfter.some((p) => p.id === "lifecycle")).toBe(false);
  });
});

describe("Storage Factory", () => {
  test("TC-10.4: returns LocalFileStorage when no Azure config", async () => {
    const origConn = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const origAcct = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
    delete process.env.AZURE_STORAGE_ACCOUNT_NAME;

    vi.resetModules();
    const { getStorage, LocalFileStorage } = await import("@/lib/storage");
    const storage = getStorage();
    expect(storage).toBeInstanceOf(LocalFileStorage);

    if (origConn) process.env.AZURE_STORAGE_CONNECTION_STRING = origConn;
    if (origAcct) process.env.AZURE_STORAGE_ACCOUNT_NAME = origAcct;
  });

  test.skip("TC-10.5: returns BlobStorage when AZURE_STORAGE_CONNECTION_STRING set", () => {
    // Requires Azure SDK and valid connection string — skip in CI
  });
});
