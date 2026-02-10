### Storage Abstraction Layer
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #40 · **Status:** Implemented

Introduced `src/lib/storage.ts` — a `StorageProvider` interface that decouples API routes from the filesystem. Two implementations:

**1. Interface Design**
```typescript
interface StorageProvider {
  savePresentation(userId: string, slug: string, data: Presentation): Promise<void>;
  getPresentation(userId: string, slug: string): Promise<Presentation | null>;
  listPresentations(userId: string): Promise<PresentationSummary[]>;
  deletePresentation(userId: string, slug: string): Promise<boolean>;
}
```
All methods take `userId` as the first parameter to support multi-tenancy. `PresentationSummary` returns `{ id, title, createdAt, updatedAt, slideCount }` — same shape as the existing GET list response.

**2. Implementations**
- `LocalFileStorage`: Wraps the existing `presentations/{slug}.json` file I/O. `userId` is ignored (hardcoded to `"local"` in routes). Exact same paths and behavior as before — fully backwards compatible.
- `BlobStorage`: Azure Blob Storage. Blobs stored at `{userId}/{slug}.json` in a `presentations` container. Uses `@azure/storage-blob` SDK. Supports `AZURE_STORAGE_CONNECTION_STRING` or `DefaultAzureCredential` via `AZURE_STORAGE_ACCOUNT_NAME`.

**3. Factory Function**
`getStorage()` returns a singleton:
- If `AZURE_STORAGE_CONNECTION_STRING` is set → `BlobStorage`
- Else if `AZURE_STORAGE_ACCOUNT_NAME` is set → `BlobStorage` (with `DefaultAzureCredential`)
- Else → `LocalFileStorage`

The singleton is cached in module scope. No env var? Local dev just works with no config.

**4. API Route Changes**
Both `src/app/api/presentations/route.ts` and `src/app/api/presentations/[slug]/route.ts` now call `getStorage()` instead of using `fs` directly. `generateSlug()` stays in the presentations route — it's not a storage concern. All routes pass `DEFAULT_USER = "local"` as the userId.

**5. Gotchas for Team**
- `@azure/storage-blob` and `@azure/identity` are now production dependencies.
- `BlobStorage` dynamically imports the Azure SDKs — they won't be loaded in local dev.
- The `deletePresentation` return value is `boolean` (true = deleted, false = not found). The route maps `false` to 404.
- To test with Azure locally: set `AZURE_STORAGE_CONNECTION_STRING` in `.env.local`.
- The singleton factory means the storage backend is fixed for the process lifetime. Restart the dev server after changing env vars.

**Verified:** Build passes, 50 unit tests pass.
