/**
 * SlideMaker — Storage Abstraction Tests (Phase 2)
 *
 * Tests for the storage abstraction layer (LocalFileStorage, BlobStorage, factory).
 * Stubs only — implementations will be added after McManus completes #40.
 * Run with: npm test
 */

import { describe, test } from "vitest";

// Imports will resolve once McManus merges #40:
// import { createStorage, LocalFileStorage } from "@/lib/storage";

// ─── TC-10.x: Storage Abstraction ───────────────────────────────────────────

describe("LocalFileStorage", () => {
  test.todo("TC-10.1: reads/writes presentations correctly");
  test.todo("TC-10.2: list returns all presentations");
  test.todo("TC-10.3: delete removes file");
});

describe("Storage Factory", () => {
  test.todo("TC-10.4: returns LocalFileStorage when no Azure config");
  test.todo("TC-10.5: returns BlobStorage when AZURE_STORAGE_CONNECTION_STRING set");
});
